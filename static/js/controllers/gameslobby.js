function GamesLobbyController(app, socket){

    var controller = this;

    var lobbyDialog, contextMenu;

    var games = {};
    var gamesCount = 0;

    var $gamesListTable, $toolbar, $gamesList;

    var isInGame = false;

    init();

    function init(){
        initSocket();
    };

    this.openLobby = function(){

        if (lobbyDialog) {
            lobbyDialog.bringToFront();
            return;
        }

        games = {};
        gamesCount = 0;

        createLobbyDialog();

    };

    function initSocket(){

        socket.on('games list', function(games){
            $.each(games, function(id, game){
                addGame(game);
            });
        });

        socket.on('game created', function(game){
            addGame(game);
        });

        socket.on('game updated', function(game){
            updateGame(game);
        });

        socket.on('game deleted', function(id){
            removeGame(id);
        });

    }

    function createLobbyDialog(){

        lobbyDialog = app.dialogs.create({
            id: 'games-lobby',
            width: 800,
            height: 500,
            title: t('gamesLobby', {count: 0}),
            content: tpl('gamesLobbyTemplate'),
            onCreate: function(){
                socket.emit('games lobby join');
            },
            onClose: function(){
                leave();
            }
        });

        lobbyDialog.body().find('.create-game').click(function(e){
            e.preventDefault();
            showCreateGameDialog();
        }).prop('disabled', isInGame);

        lobbyDialog.body().find('.in-game').toggle(isInGame);

        lobbyDialog.$gamesPane = lobbyDialog.body().find('.members-scroll');

        resizeDialog(lobbyDialog, lobbyDialog.body().height());

        lobbyDialog.setOption('onResize', function($body){
            resizeDialog(this, $body.height());
        });

        $gamesListTable = lobbyDialog.body().find('#gamesList');
        $toolbar = lobbyDialog.body().find('.toolbar');

        if (!app.mobile){

            $gamesListTable.tablesorter({
                widgets: ['stickyHeaders'],
                widgetOptions: {
                    stickyHeaders_attachTo: '#games-lobby .members-scroll',
                }
            });

        }

        if (!contextMenu){
            contextMenu = app.contextMenuManager.createMenu({
                id: 'gamesLobbyContextMenu',
                items: {
                    join: {
                        title: t('gameJoin'),
                        icon: 'sign-in',
                        click: function(data){
                            if (games[data.gameId].closed) { return; }
                            joinGame(data.gameId);
                        }
                    },
                    spectate: {
                        title: t('gameSpectate'),
                        icon: 'eye',
                        click: function(data){
                            spectateGame(data.gameId)
                        }
                    }
                }
            });
        }

        $gamesList = lobbyDialog.body().find('.games-list .list-body');

        $gamesList.on('click', '.item', function(event){

            if (isInGame) { return; }

            var $row = $(this);
            var id = $row.attr('id');
            var game = games[id];

            if (!game) { return; }

            contextMenu.toggleEnabledItem('join', !game.closed);

            contextMenu.set({
                gameId: id
            }).show(event, game.title);

        });

    }

    function resizeDialog(dialog, height){
        dialog.$gamesPane.css({height: (height - 51)+'px'});
    }

    function showCreateGameDialog(){

        app.dialogs.create({
            id: 'game-create',
            title: t('gameSettings'),
            width:400,
            buttons: [{
                id: 'start',
                class: 'btn-primary',
                title: t('start'),
                click: function(){
                    createGame(this);
                }
            },{
                id: 'cancel',
                class: 'btn-default',
                title: t('cancel'),
                click: function(){
                    this.remove();
                }
            }],
            content: {
                url: '/games/create',
                onLoad: function(dialog){
                    dialog.body().find('#gameType').change(function(){
                        var type = $(this).val();
                        dialog.body().find('.rules-block').hide();
                        dialog.body().find('.game-'+type).show();
                    }).change();
                }
            }
        });

    }

    function createGame(settingsDialog){

        var $gameTypeList = settingsDialog.body().find('#gameType');
        var $gameLangList = settingsDialog.body().find('#gameLang');
        var $gameMaxPlayers = settingsDialog.body().find('#gameMaxPlayers');

        if (!$gameTypeList || !$gameLangList) { return; }

        socket.emit('game create', {
            type: $gameTypeList.val(),
            lang: $gameLangList.val(),
            maxPlayers: $gameMaxPlayers.val(),
        });

        settingsDialog.remove();

    }

    function joinGame(id){
        socket.emit('game join', {
            id: id
        });
    }

    function spectateGame(id){
        socket.emit('game join', {
            id: id,
            spectator: true
        });
    }

    this.parseGame = function(game){

        switch(game.status){
            case 0: game.statusText = t('gameStatusIdle'); break;
            case 1: game.statusText = t('gameStatusStarted'); break;
        }

        game.title = t('game' + game.type);

        game.language = app.langs[game.lang];

        game.playersCount = Object.keys(game.players).length;

        game.closed = game.playersCount >= game.maxPlayers;

        return game;

    };

    function addGame(game){

        game = controller.parseGame(game);

        games[game.id] = game;
        gamesCount++;

        var $row = $(tpl('gamesLobbyGameTemplate', game));

        $row.appendTo($gamesList);

        if (!app.mobile){
            $gamesListTable.trigger('update');
        }

        lobbyDialog.setTitle(t('gamesLobby', {count: gamesCount}));

    }

    function removeGame(id){

        if (!(id in games)) { return; }

        $('#' + id, $gamesList).remove();

        delete games[id];
        gamesCount--;

        $gamesListTable.trigger('update');

        lobbyDialog.setTitle(t('gamesLobby', {count: gamesCount}));

        app.controllers.gamesRooms.removeGame(id);

    }

    function updateGame(game){

        game = controller.parseGame(game);

        games[game.id] = game;

        var $row = $('#' + game.id, $gamesList);

        if (!$row) { return; }

        $row.find('.status').html(game.statusText);
        $row.find('.players')
                .html(game.playersCount + '/' + game.maxPlayers)
                .toggleClass('is-closed-true', game.closed)
                .toggleClass('is-closed-false', !game.closed);

    }

    function leave(){
        socket.emit('games lobby leave');
        lobbyDialog = null;
    }

    this.getLobbyDialog = function(){
        return lobbyDialog;
    };

    this.setInGame = function(value){
        isInGame = value;
    };

}

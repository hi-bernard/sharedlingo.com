function GamesRoomsController(app, socket){

    var manager = this;

    var currentGame = {};
    var isInGame = false;

    var controllers = {
        Alias: new GameAlias(app, socket, this),
        Builder: new GameBuilder(app, socket, this)
    };

    var STATE_WAITING = 0,
        STATE_PREPARE = 1,
        STATE_ROUND = 2,
        STATE_OVER = 3;

    init();

    function init(){
        initSocket();
    }

    function initSocket(){

        socket.on('game open', function(data){
            openGame(data);
        });

        socket.on('game joined', function(member){
            gameAddPlayer(member);
        });

        socket.on('game leaved', function(data){
            gameRemovePlayer(data.userId);
            if ('state' in data){
                updateGameState({state: data.state});
            }
        });

        socket.on('game message', function(data){
            if (!currentGame || currentGame.id != data.id) { return; }
            if ('violation' in data){
                manager.gameMessageReceived({
                    id: 'system',
                    icon: 'ban',
                    class: 'text-danger'
                }, t('gameRoundBadMsg'));
                return;
            }
            manager.gameMessageReceived(data.sender, data.msg);
        });

        socket.on('game event', function(data){
            if (!currentGame || currentGame.id != data.gameId) { return; }
            if ('onEvent' in currentGame.controller){
                currentGame.controller.onEvent(currentGame, data);
            }
        });

        socket.on('game state', function(data){
            updateGameState(data);
        });

        socket.on('game round end', function(data){
            gameRoundEnd(data.winnerId, data.score, data.data);
        });

        socket.on('game start type', function(data){

            if (!currentGame || currentGame.id != data.id) { return; }

            var $membersList = currentGame.dialog.$membersList;
            var $member = $membersList.find('#player-'+data.sender);

            $('i.gender', $member).hide();
            $('i.typing', $member).css('display', 'inline-block');

        });

        socket.on('game end type', function(data){

            if (!currentGame || currentGame.id != data.id) { return; }

            var $membersList = currentGame.dialog.$membersList;
            var $member = $membersList.find('#player-'+data.sender);

            $('i.gender', $member).show();
            $('i.typing', $member).hide();

        });

    }

    function openGame(data){

        app.controllers.gamesLobby.setInGame(true);

        var lobbyDialogBody = app.controllers.gamesLobby.getLobbyDialog().body();

        lobbyDialogBody.find('.create-game').prop('disabled', true);
        lobbyDialogBody.find('.in-game').show();

        createRoom(data.game, data.spectator);

        isInGame = true;

    }

    function leaveGame(){
        socket.emit('game leave');
        closeGame();
    }

    function closeGame(){

        if (currentGame.dialog){
            currentGame.dialog.remove();
        }

        isInGame = false;
        app.controllers.gamesLobby.setInGame(false);

         if (currentGame.delayTimeout){
            clearInterval(currentGame.delayTimeout);
        }

        currentGame = null;

        var lobbyDialog = app.controllers.gamesLobby.getLobbyDialog();

        if (!lobbyDialog) { return; }

        lobbyDialog.body().find('.create-game').prop('disabled', false);
        lobbyDialog.body().find('.in-game').hide();

    }

    this.removeGame = function(id){

        if (currentGame && currentGame.id == id) {
            closeGame();
        }

    };

    function createRoom(game, isSpectator){

        if (isInGame) { return; }

        game = app.controllers.gamesLobby.parseGame(game);

        game.controller = controllers[game.type];

        var dialog = app.dialogs.create({
            id: 'game-' + game.id,
            title: game.title,
            titleIcon: 'trophy',
            titleCount: 0,
            content: game.controller.getRoomTemplate(),
            width: 600,
            height: 400,
            isHideBottomBar: true,
            closeConfirm: t('gameLeaveConfirm'),
            onClose: function(){
                leaveGame();
            },
            onFocus: function(){
                resetUnreadCounter();
                removeLine(this);
            },
            onBlur: function(){
                insertLine(this);
            }
        });

        dialog.$messagesCell = dialog.body().find('.messages');
        dialog.$membersCell = dialog.body().find('.members');

        game.controller.resizeDialog(dialog, dialog.body().height());

        dialog.setOption('onResize', function($body){
            game.controller.resizeDialog(this, $body.height());
        });

        currentGame = $.extend(game, {
            dialog: dialog,
            unreadCount: 0,
            isTyping: false,
            typingInterval: null,
            spectator: isSpectator
        });

        dialog.$membersList = dialog.body().find('.members ul');
        dialog.$emoticonsPane = dialog.body().find('.emoticons-pane');
        dialog.$timer = dialog.body().find('.timer').html('');

        game.controller.init(currentGame);

        updateGameMembersList();
        updateGameState();

        if (isSpectator){
            dialog.body().find('.player-controls').hide();
            dialog.body().find('.spectator-controls').show();
        }

        if (!isSpectator){

            var $input = dialog.body().find('input.message');

            $input.keyup(function(e){
                startTyping();
                if (e.which === 13){
                    $input = $(this);
                    var message = $input.val().trim();
                    if (!message) { return; }
                    stopTyping();
                    sendGameMessage(message);
                    $input.val('').attr('placeholder', '');
                    if (app.mobile){
                        $input.blur();
                    }
                }
            });

            if (!app.mobile){
                $('input.message', dialog.body()).focus();
            }

        }

        if (app.mobile){

            dialog.$membersCount = dialog.body().find('.members .count');
            dialog.$membersCount.text( currentGame.playersCount );

            dialog.body().find('.members .shortcut').click(function(e){
                e.preventDefault();
                e.stopPropagation();
                $(this).parent().toggleClass('visible');
            });

            dialog.body().find('.members').click(function(e){
                e.stopPropagation();
                $(this).toggleClass('visible');
            });

        }

    }

    function updateGameState(data){

        if (currentGame.delayTimeout){
            clearTimeout(currentGame.delayTimeout);
            currentGame.dialog.$timer.hide();
        }

        if (data){
            currentGame = $.extend(currentGame, data);
        }

        if (currentGame.state == STATE_WAITING){
            currentGame.controller.startStateWaiting(currentGame);
        }

        if (currentGame.state == STATE_PREPARE){
            currentGame.controller.startStatePrepare(currentGame);
        }

        if (currentGame.state == STATE_ROUND){
            currentGame.controller.startStateRound(currentGame);
        }

        if (currentGame.state == STATE_OVER){
            currentGame.controller.startStateOver(currentGame);
        }

    }

    function gameRoundEnd(winnerId, score, data){

        currentGame.controller.endRound(currentGame, winnerId, score, data);

    }

    this.gameSetDelay = function (){

        currentGame.delayCounter = currentGame.delay;

        currentGame.dialog.$timer.html(currentGame.delayCounter).show();

        currentGame.delayTimeout = setInterval(function(){

            if (currentGame.delayCounter <= 0){
                clearInterval(currentGame.delayTimeout);
                return;
            }

            currentGame.delayCounter--;
            currentGame.dialog.$timer.html(currentGame.delayCounter);

        }, 1000);

    };

    function updateGameMembersList(){

        currentGame.dialog.$membersList.empty();

        $.each(currentGame.players, function(id, member){
            member = $.extend(app.getMember(id), member);
            gameAddPlayerToList(member);
        });

    }

    function sendGameMessage(message){

        socket.emit('game send', {
            gameId: currentGame.id,
            msg: message
        });

    }

    this.gameClearChat = function(){
        $('.messages ul', currentGame.dialog.body()).empty();
    };

    this.gameMessageReceived = function(sender, message){

        var $message;

        if (sender.id === 'system'){

            $message = $(tpl('roomSystemMessageTemplate', {
                icon: sender.icon,
                class: sender.class ? sender.class : '',
                message: message,
            }));

        } else {

            $message = $(tpl('roomMessageTemplate', {
                name: sender.name,
                color: sender.color,
                message: urls(emotions(message)),
            }));

            if (sender.id === app.userId){
               $message.addClass('my');
            }

        }

        $message.appendTo($('.messages ul.chat', currentGame.dialog.body()));

        $('.messages .scroll', currentGame.dialog.body()).scrollTop(1E9);

        if (!currentGame.dialog.isFocused()){
            currentGame.unreadCount++;
            currentGame.dialog.setTitleCounter(currentGame.unreadCount);
        }

        if (!app.isActive()){
            app.counter.increment();
        }

    };

    function insertLine(dialog){
        $('.messages ul.chat .divider', dialog.body()).remove();
        var $line = $('<li/>').addClass('divider');
        $line.appendTo($('.messages ul.chat', dialog.body()));
    }

    function removeLine(dialog){
        $('.messages ul.chat .divider:last-child', dialog.body()).remove();
    }

    function resetUnreadCounter(){

        if (!currentGame) { return; }

        if (currentGame.unreadCount > 0){
            currentGame.unreadCount = 0;
            currentGame.dialog.setTitleCounter(0);
        }

    }

    function gameAddPlayerToList(member){

        gameRemovePlayerFromList(member.id);

        var $membersList = currentGame.dialog.$membersList;
        var $member = $('<li/>').attr('id', 'player-'+member.id).appendTo($membersList);

        var $memberLink = $('<a/>').
            attr('href', '#').
            attr('title', member.name.full).
            addClass('gender-'+member.genderClass).
            html('<i class="fa fa-fw fa-pencil typing"></i> <i class="fa fa-fw fa-'+member.genderClass+' gender"></i> '+member.name.first).
            appendTo($member);

        if (member.name.color){
            $memberLink.css({color: member.name.color});
        }

        $('<span/>').addClass('badge').addClass('score').html(member.score).appendTo($memberLink);

        $memberLink.click(function(e){
            e.preventDefault();
            e.stopPropagation();
            if (member.id == app.userId) { return; }
            app.openProfile(member.id, member.name.full);
        });

    }

    function gameRemovePlayerFromList(memberId){

        var $membersList = currentGame.dialog.$membersList;

        $('#player-' + memberId, $membersList).remove();

    }

    function gameAddPlayer(member){

        var member = $.extend(app.getMember(member.id), member);

        currentGame.players[member.id] = member;
        currentGame.playersCount = Object.keys(currentGame.players).length;

        gameAddPlayerToList(member);

        if (currentGame.dialog.$membersCount){
            currentGame.dialog.$membersCount.text( currentGame.playersCount );
        }

        manager.gameMessageReceived({
            id: 'system',
            icon: 'plus'
        }, t('memberJoinedGame', {name: member.name.first}));

        if (currentGame.state == STATE_WAITING){
            updateGameState();
        }

    }

    function gameRemovePlayer(userId){

        if (!(userId in currentGame.players)){ return; }

        gameRemovePlayerFromList(userId);

        var name = app.getMember(userId).name.first;

        manager.gameMessageReceived({
            id: 'system',
            icon: 'sign-out'
        }, t('memberLeftGame', {name: name}));

        delete currentGame.players[userId];

        currentGame.playersCount = Object.keys(currentGame.players).length;

        if (currentGame.dialog.$membersCount){
            currentGame.dialog.$membersCount.text( currentGame.playersCount );
        }

    }

    this.onMemberUpdate = function(member){
        if (currentGame.players){
            if (member.id in currentGame.players){
                gameAddPlayerToList($.extend(currentGame.players[member.id], member));
            }
        }
    };

    function startTyping(){

        if (currentGame.isTyping){
            clearTimeout(currentGame.typingInterval);
        }

        if (!currentGame.isTyping){
            currentGame.isTyping = true;
            socket.emit('game start type', currentGame.id);
        }

        currentGame.typingInterval = setTimeout(function(){
            stopTyping();
        }, 1500);

    };

    function stopTyping(){

        if (!currentGame.isTyping) { return; }

        currentGame.isTyping = false;
        clearTimeout(currentGame.typingInterval);

        socket.emit('game end type', currentGame.id);

    };

}

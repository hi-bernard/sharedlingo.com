function GameAlias(app, socket, manager){

    var $status;

    this.init = function(game){
        $status = game.dialog.body().find('.status').html('');
    };

    this.getRoomTemplate = function(){
        return tpl('gameAliasRoomTemplate');
    };

    this.resizeDialog = function(dialog, height){
        dialog.$messagesCell.css({height: (height - 95)+'px'});
        dialog.$membersCell.css({height: (height - 95)+'px'});
    };

    this.startStateWaiting = function(game){
        $status.html(t('gameStateWaiting', {
            count: game.playersCount,
            max: game.maxPlayers
        }));
    };

    this.startStatePrepare = function(game){

        game.word = null;

        if (game.round == 1){
            manager.gameMessageReceived({
                id: 'system',
                icon: 'check',
                class: 'text-primary'
            }, t('gamePlayersJoined'));
        } else {
            manager.gameMessageReceived({
                id: 'system',
                icon: 'chevron-right'
            }, t('gameRoundGetReady'));
        }

        if (game.player.id == app.userId){
            $status.html(t('gameStatePrepareYou'));
        } else {
            $status.html(t('gameStatePrepare', {
                name: game.player.name,
            }));
        }

        manager.gameSetDelay();

    };

    this.startStateRound = function(game){

        manager.gameClearChat();

        manager.gameMessageReceived({
            id: 'system',
            icon: 'clock-o'
        }, t('gameRoundStarted'));

        if (game.player.id == app.userId){

            $status.html(t('gameStateRoundExplain', {
                word: game.word
            }));

            manager.gameMessageReceived({
                id: 'system',
                icon: 'info-circle',
            }, t('game'+game.type+'Rules'));

        } else {
            $status.html(t('gameStateRoundGuess', {
                name: game.player.name
            }));
        }

        manager.gameSetDelay();

    };

    this.startStateOver = function(game){

        manager.gameMessageReceived({
            id: 'system',
            icon: 'refresh'
        }, t('gameOverRestart'));

        $status.html(t('gameOver', {
            name: game.winnerName
        }));

        manager.gameSetDelay();

        var $membersList = game.dialog.$membersList;

        for (var i in game.players){
            game.players[i].score = 0;
            $('#player-' + i, $membersList).find('.score').text('0');
        }

    };

    this.endRound = function(game, winnerId, score, data){

        var word = data.word;

        if (!winnerId){
            manager.gameMessageReceived({
                id: 'system',
                icon: 'clock-o',
                class: 'text-danger'
            }, t('gameRoundTimeUp', {
                word: word
            }));
            return;
        }

        var $membersList = game.dialog.$membersList;

        game.players[winnerId].score += score;
        $('#player-' + winnerId, $membersList).find('.score').text(game.players[winnerId].score);

        if (winnerId == app.userId){
            manager.gameMessageReceived({
                id: 'system',
                icon: 'check',
                class: 'text-success'
            }, t('gameRoundWinYou', {
                word: word
            }));
            return;
        }

        var winner = app.getMember(winnerId);
        if (!winner) { return; }

        manager.gameMessageReceived({
            id: 'system',
            icon: 'check',
            class: 'text-success'
        }, t('gameRoundWin', {
            name: winner.name.first,
            word: word
        }));

    };

}
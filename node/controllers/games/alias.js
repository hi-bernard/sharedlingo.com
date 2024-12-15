module.exports.create = function(app, manager){
    return new GameAliasController(app, manager);
};

function GameAliasController(app, manager){

    var SCORE_TO_WIN = 10;

    var ROUND_WIN_SCORE = 1;

    var PREPARE_TIME = 10,
        ROUND_TIME = 90,
        RESTART_TIME = 20;

    this.initGame = function(game){

        game.maxScore = SCORE_TO_WIN;
        game.currentPlayer = 0;
        game.player = {};

    };

    this.prepareNextRound = function(game){

        var wordId = app.getRandomInt(1, manager.getWordsCount()[game.lang]);

        var wordsModel = app.db.words(game.lang);

        if (!wordsModel) { return; }

        wordsModel.findById(wordId, function(err, record){

            if (!game.players) { return; }

            game.word = record.word;
            game.round++;

            var currentPlayer = app.getMember(Object.keys(game.players)[game.currentPlayer]);

            if (!currentPlayer){
                game.currentPlayer = 0;
                currentPlayer = app.getMember(Object.keys(game.players)[0]);
            }

            game.player = {
                id: currentPlayer.id,
                name: currentPlayer.name.first
            };

            manager.emitState(game, {
                player: game.player,
                delay: PREPARE_TIME
            });

            manager.setGameDelay(game.id, PREPARE_TIME, function(){
                manager.updateGameState(game);
            });

        });

    };

    this.isRoundCanBeStarted = function(game){

        var playerSocket = app.getSocket(Object.keys(game.players)[game.currentPlayer]);

        if (!playerSocket){
            game.currentPlayer = 0;
            return false;
        }

        return true;

    };

    this.isCurrentPlayer = function(game, socket){

        return game.player.id == socket.userId;

    };

    this.startRound = function(game){

        var playerSocket = app.getSocket(Object.keys(game.players)[game.currentPlayer]);

        manager.emitStateTo(playerSocket, game, {
            delay: ROUND_TIME,
            word: game.word
        });

        manager.emitStateExcept(playerSocket, game, {
            delay: ROUND_TIME
        });

        manager.setGameDelay(game.id, ROUND_TIME, function(){
            manager.updateGameState(game);
        });

    };

    this.endRound = function(game, winnerId){

        var playersCount = Object.keys(game.players).length;

        if (game.currentPlayer >= playersCount-1){
            game.currentPlayer = 0;
        } else {
            game.currentPlayer++;
        }

        if (!winnerId){

            app.io.to(game.id).emit('game round end', {
                winnerId: false,
                score: 0,
                data: {
                    word: game.word
                }
            });

            return;

        }

        game.players[winnerId].score += ROUND_WIN_SCORE;

        app.io.to(game.id).emit('game round end', {
            winnerId: winnerId,
            score: ROUND_WIN_SCORE,
            data: {
                word: game.word
            }
        });

    };

    this.gameOver = function(game, winner){

        manager.emitState(game, {
            winnerName: winner.name.first,
            delay: RESTART_TIME
        });

        manager.setGameDelay(game.id, RESTART_TIME, function(){
            manager.updateGameState(game);
        });

        for (var i in game.players){
            game.players[i].score = 0;
        }

    };

    this.onMessage = function(game, socket, data, winCallback){

        var sender = app.extend(app.getMember(socket.userId), game.players[socket.userId]);
        var escapedMessage = app.escape(data.msg).trim();
        var messageLC = escapedMessage.toLowerCase();

        var isWordInMessage = messageLC.indexOf(game.word) >= 0;

        if (game.state == manager.getStates().ROUND && this.isCurrentPlayer(game, socket)){

            if (isWordInMessage){
                socket.emit('game message', {
                    id: game.id,
                    violation: true
                });
                return;
            }

        }

        app.io.to(game.id).emit('game message', {
            id: game.id,
            sender: {
                id: sender.id,
                name: sender.name.first,
                color: 1
            },
            msg: escapedMessage
        });

        if (game.state == manager.getStates().ROUND && !this.isCurrentPlayer(game, socket)){
            if (isWordInMessage && winCallback){
                winCallback();
            }
        }

    };

}
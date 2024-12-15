module.exports.create = function(app, manager){
    return new GameBuilderController(app, manager);
};

function GameBuilderController(app, manager){

    var SCORE_TO_WIN = 10;

    var ROUND_WIN_SCORE = 1;

    var PREPARE_TIME = 10,
        ROUND_TIME = 99,
        RESTART_TIME = 15;

    this.initGame = function(game){

        game.maxScore = SCORE_TO_WIN;
        game.currentPlayer = 0;
        game.player = {};

    };

    this.prepareNextRound = function(game){

        var wordIds = [
            app.getRandomInt(1, manager.getWordsCount()[game.lang]),
            app.getRandomInt(1, manager.getWordsCount()[game.lang]),
            app.getRandomInt(1, manager.getWordsCount()[game.lang])
        ];

        var wordsModel = app.db.words(game.lang);

        if (!wordsModel) { return; }

        for (var id in game.players){
            game.players[id].guessedLetters = {};
        }

        wordsModel.find({_id: {$in: wordIds}}, function(err, records){

            if (!records) { return; }

            var words = [];
            var patterns = [];
            var letters = [];

            records.forEach(function(record){

                var word = record.word;
                var letterPos = [];
                var pattern = [];

                pattern.push(word[0]);

                for (var p=1; p<word.length; p++){
                    pattern.push('');
                    letterPos.push(p);
                }

                letterPos = shuffle(letterPos);
                letterPos.splice(Math.round(letterPos.length/2));

                for (var h=0; h<letterPos.length; h++){
                    var position = letterPos[h];
                    pattern[position] = word[position];
                }

                for (var i=0; i<word.length; i++){
                    if (pattern[i] === ''){
                        letters.push(word[i]);
                    }
                }

                words.push(word);
                patterns.push(pattern);

            });

            letters = shuffle(letters);

            game.words = words;
            game.patterns = patterns;
            game.letters = letters;

            game.round++;

            manager.emitState(game, {
                words: words,
                patterns: patterns,
                letters: letters,
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

        return false;

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

        if (!winnerId){

            app.io.to(game.id).emit('game round end', {
                winnerId: false,
                score: 0,
                data: {
                    words: game.words
                }
            });

            return;

        }

        game.players[winnerId].score += ROUND_WIN_SCORE;

        app.io.to(game.id).emit('game round end', {
            winnerId: winnerId,
            score: ROUND_WIN_SCORE,
            data: {
                words: game.words
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

        if (!game.words){ return; }

        var sender = app.extend(app.getMember(socket.userId), game.players[socket.userId]);
        var escapedMessage = app.escape(data.msg).trim();
        var messageLC = escapedMessage.toLowerCase();

        var isCorrectAnswer = game.words && (messageLC === game.words.join(', '));

        app.io.to(game.id).emit('game message', {
            id: game.id,
            sender: {
                id: sender.id,
                name: sender.name.first,
                color: 1
            },
            msg: escapedMessage
        });

        if (game.state == manager.getStates().ROUND){
            if (isCorrectAnswer && winCallback){
                winCallback();
            }
        }

    };

    this.onEvent = function(game, event){

        var player = game.players[event.player];

        if (!player.guessedLetters) {
            player.guessedLetters = {};
        }

        if (!(event.wordId in player.guessedLetters)){
            player.guessedLetters[event.wordId] = {};
        }

        player.guessedLetters[event.wordId][event.letterId] = event.letter;

    };

    function shuffle(array) {

        var counter = array.length;

        while (counter > 0) {

            var index = Math.floor(Math.random() * counter);

            counter--;

            var temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;

        }

        return array;

    }

}
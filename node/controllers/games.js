module.exports.create = function(app){
    return new GamesController(app);
};

function GamesController(app){

    var controller = this;

    var games = {}, lobby = {}, intervals = {};

    var nextGameId = Object.keys(games).length;

    var STATUS_WAITING = 0,
        STATUS_STARTED = 1;

    var MAX_PLAYERS = 2;

    this.STATE_WAITING = 0,
    this.STATE_PREPARE = 1,
    this.STATE_ROUND = 2,
    this.STATE_OVER = 3;

    var states = {
        WAITING: 0,
        PREPARE: 1,
        ROUND: 2,
        OVER: 3
    };

    var wordsCount = {
        EN: 2065,
        ES: 1000,
        DE: 821,
        RU: 1002,
        PT: 1000,
        FR: 1062
    };

    var gameControllers = {
        Alias: require('./games/alias').create(app, this),
        Builder: require('./games/builder').create(app, this),
    };

    this.addSocket = function(socket) {

        socket.gameId = false;

        socket.on('games lobby join', function(){
            lobbyJoined(socket);
        });

        socket.on('games lobby leave', function(){
            lobbyLeaved(socket);
        });

        socket.on('game create', function(data){
            gameCreate(socket, data);
        });

        socket.on('game join', function(data){
            gameJoin(socket, data);
        });

        socket.on('game leave', function(){
            leaveGame(socket);
        });

        socket.on('game send', function(data){
            gameSend(socket, data);
        });

        socket.on('game event', function(data){
            gameEvent(socket, data);
        });

        socket.on('game start type', function(gameId){
            gameStartType(socket, gameId);
        });

        socket.on('game end type', function(gameId){
            gameEndType(socket, gameId);
        });

    };

    this.disconnect = function(socket){

        delete lobby[socket.userId];

        leaveGame(socket);

    };

    this.getGamesCount = function(){
        return Object.keys(games).length;
    };

    function lobbyJoined(socket){

        if (!app.isAuth(socket)) { return; }
        if (socket.userId in lobby){ return; }

        lobby[socket.userId] = true;

        socket.emit('games list', games);

        socket.join('games-lobby');

    }

    function lobbyLeaved(socket){

        if (!app.isAuth(socket)) { return; }
        if (!(socket.userId in lobby)){ return; }

        socket.leave('games-lobby');

        delete lobby[socket.userId];

    }

    function gameCreate(socket, data){

        if (!app.isAuth(socket)) { return; }
        if (!(socket.userId in lobby)){ return; }

        nextGameId++;

        var game = {
            id: data.type + '-' + data.lang + '-' + nextGameId,
            type: data.type,
            lang: data.lang,
            host: socket.userId,
            players: {},
            spectators: [],
            maxPlayers: data.maxPlayers? data.maxPlayers : MAX_PLAYERS,
            round: 0,
            status: STATUS_WAITING,
            state: states.WAITING,
            controller: gameControllers[data.type]
        };

        games[game.id] = game;

        game.controller.initGame(game);

        joinGame(socket, game);

        app.io.to('games-lobby').emit('game created', game);

        app.io.emit('games count', controller.getGamesCount());

    }

    function gameDelete(id){
        delete games[id];
        app.io.to('games-lobby').emit('game deleted', id);
        app.io.emit('games count', controller.getGamesCount());
    }

    function gameJoin(socket, data){

        if (isInGame(socket)) { return; }

        var game = games[data.id];

        if (data.spectator){
            joinGameSpectator(socket, game);
            return;
        }

        joinGame(socket, game);

        broadcastGameStatus(game);

    }

    function gameSend(socket, data){

        if (!app.isAuth(socket)) { return; }
        if (!isInGame(socket)) { return; }

        var game = games[data.gameId];

        game.controller.onMessage(game, socket, data, function(){
            endRound(game, socket.userId);
        });

    }

    function gameEvent(socket, data){

        if (!app.isAuth(socket)) { return; }
        if (!isInGame(socket)) { return; }

        var game = games[data.gameId];

        if (!game) { return; }

        socket.broadcast.to(game.id).emit('game event', data);

        if ('onEvent' in game.controller){
            game.controller.onEvent(game, data);
        }

    }

    this.updateGameState = function (game){

        clearGameDelayInterval(game.id);

        var playersCount = Object.keys(game.players).length;

        if (game.state == states.OVER){
            game.state = states.WAITING;
            if (playersCount < game.maxPlayers){
                app.io.to(game.id).emit('game state', {
                    state: game.state,
                });
            }
        }

        if (game.state == states.WAITING && playersCount == game.maxPlayers){
            prepareNextRound(game);
            return;
        }

        if (game.state == states.PREPARE){
            startRound(game);
            return;
        }

        if (game.state == states.ROUND){
            endRound(game);
            return;
        }

    };

    function prepareNextRound(game){

        clearGameDelayInterval(game.id);

        game.status = STATUS_STARTED;

        game.state = states.PREPARE;

        game.controller.prepareNextRound(game);

    }

    function startRound(game){

        if (!game.controller.isRoundCanBeStarted(game)){
            prepareNextRound(game);
            return;
        }

        game.state = states.ROUND;

        game.controller.startRound(game);

    }

    function endRound(game, winnerId){

        clearGameDelayInterval(game.id);

        game.controller.endRound(game, winnerId);

        if (!winnerId){
            prepareNextRound(game);
            return;
        }

        if (game.players[winnerId].score >= game.maxScore){

            game.state = states.OVER;

            var winner = app.getMember(winnerId);

            game.controller.gameOver(game, winner);

            return;

        }

        prepareNextRound(game);

    }

    function joinGame(socket, game){

        if (!game) { return; }

        game.players[socket.userId] = {
            id: socket.userId,
            score: 0
        };

        socket.emit('game open', {
            game: game
        });

        socket.join(game.id);

        socket.broadcast.to(game.id).emit('game joined', game.players[socket.userId]);

        socket.gameId = game.id;

        if (game.state == states.WAITING){
            controller.updateGameState(game);
        }

    }

    function joinGameSpectator(socket, game){

        if (!game){ return; }

        game.spectators.push(socket.userId);

        socket.emit('game open', {
            game: game,
            spectator: true
        });

        socket.join(game.id);

        socket.gameId = game.id;

    }

    function leaveGame(socket){

        if (!isInGame(socket)) { return; }

        var game = games[socket.gameId];

        socket.gameId = false;
        socket.leave(game.id);

        if (game.spectators && game.spectators.indexOf(socket.userId)>=0){
            game.spectators.splice(game.spectators.indexOf(socket.userId), 1);
            return;
        }

        delete game.players[socket.userId];

        if (Object.keys(game.players).length == 0){

            clearGameDelayInterval(game.id);

            gameDelete(game.id);

            return;

        }

        var playersCount = Object.keys(game.players).length;

        if (playersCount < 2){
            game.state = states.WAITING;
            game.status = STATUS_WAITING;
            app.io.to(game.id).emit('game leaved', {
                userId: socket.userId,
                state: game.state
            });
            controller.updateGameState(game);
            broadcastGameStatus(game);
            return;
        }

        broadcastGameStatus(game);

        app.io.to(game.id).emit('game leaved', {
            userId: socket.userId
        });

        if (game.state == states.PREPARE && game.controller.isCurrentPlayer(game, socket)){
            prepareNextRound(game);
        }

        if (game.state == states.ROUND && game.controller.isCurrentPlayer(game, socket)){
            prepareNextRound(game);
        }

    }

    function gameStartType(socket, gameId){

        if (!app.isAuth(socket)) { return; }
        if (!isInGame(socket)) { return; }
        if (socket.gameId != gameId) { return; }

        socket.broadcast.to(gameId).emit('game start type', {
            id: gameId,
            sender: socket.userId
        });

    }

    function gameEndType(socket, gameId){

        if (!app.isAuth(socket)) { return; }
        if (!isInGame(socket)) { return; }
        if (socket.gameId != gameId) { return; }

        socket.broadcast.to(gameId).emit('game end type', {
            id: gameId,
            sender: socket.userId
        });

    }

    function isInGame(socket){

        if (!socket.gameId) { return false; }
        if (!(socket.gameId in games)) { return false; }

        var isPlayer = socket.userId in games[socket.gameId].players;
        var isSpectator = games[socket.gameId].spectators.indexOf(socket.userId) >= 0;

        if (!isPlayer && !isSpectator) { return false; }

        return true;

    }

    this.setGameDelay = function(gameId, seconds, callback){

        intervals[gameId] = setTimeout(callback, seconds * 1000);

    };

    function clearGameDelayInterval(gameId){

        if (gameId in intervals){
            clearTimeout(intervals[gameId]);
            intervals[gameId] = null;
            delete intervals[gameId];
        }

    }

    function broadcastGameStatus(game){
        app.io.to('games-lobby').emit('game updated', game);
    }

    this.getStates = function (){
        return states;
    };

    this.getWordsCount = function(){
        return wordsCount;
    };

    function mergeStateData(game, data){
        return app.extend({
            state: game.state,
            round: game.round
        }, data);
    };

    this.emitState = function(game, data){
        var state = mergeStateData(game, data);
        app.io.to(game.id).emit('game state', state);
    };

    this.emitStateTo = function(socket, game, data){
        var state = mergeStateData(game, data);
        socket.emit('game state', state);
    };

    this.emitStateExcept = function(socket, game, data){
        var state = mergeStateData(game, data);
        socket.broadcast.to(game.id).emit('game state', state);
    };

}

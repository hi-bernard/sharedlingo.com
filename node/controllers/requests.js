module.exports.create = function(app){
    return new RequestsController(app);
};

function RequestsController(app){

    this.addSocket = function(socket) {

        socket.on('request send', function(request){

            if (!app.isAuth(socket)) { return; }
            if (!app.isLogged(request.toId)) { return; }

            if (app.isInBlackList(socket, request.toId)){
                socket.emit('request declined', {
                    type: request.type,
                    fromId: request.toId
                });
                return;
            }

            runCallback('onRequestSend', socket, request);

            var senderSocket = app.getSocket(request.toId);

            if (!senderSocket) { return; }

            senderSocket.emit('request received', {
                type: request.type,
                senderId: socket.userId
            });

        });

        socket.on('request cancel', function(request){

            if (!app.isAuth(socket)) { return; }
            if (!app.isLogged(request.toId)) { return; }

            runCallback('onRequestCancel', socket, request);

            var senderSocket = app.getSocket(request.toId);

            if (!senderSocket) { return; }

            senderSocket.emit('request canceled', {
                type: request.type,
                fromId: socket.userId
            });

        });

        socket.on('request decline', function(request){

            if (!app.isAuth(socket)) { return; }
            if (!app.isLogged(request.toId)) { return; }

            runCallback('onRequestDecline', socket, request);

            var senderSocket = app.getSocket(request.toId);

            if (!senderSocket) { return; }

            senderSocket.emit('request declined', {
                type: request.type,
                fromId: socket.userId
            });

        });

        socket.on('request accept', function(request){

            if (!app.isAuth(socket)) { return; }
            if (!app.isLogged(request.toId)) { return; }

            runCallback('onRequestAccept', socket, request);

            var senderSocket = app.getSocket(request.toId);

            if (!senderSocket) { return; }

            senderSocket.emit('request accepted', {
                type: request.type,
                fromId: socket.userId
            });

        });

    };

    function runCallback(event, socket, request){

        var controller = app.getController(request.type);

        if (controller && (event in controller)){
            controller[event](socket, request);
        }

    }

}
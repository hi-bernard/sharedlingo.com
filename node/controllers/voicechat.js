module.exports.create = function(app){
    return new VoiceChatController(app);
};

function VoiceChatController(app){

    var controller = this;

    var voiceChat = {};

    this.addSocket = function(socket) {

        socket.on('voice join', function(){
            voiceJoin(socket);
        });

        socket.on('voice leave', function(){
            voiceLeave(socket);
        });

        socket.on('voice peer ready', function(toUserId){
            voicePeerReady(socket, toUserId);
        });

    };

    this.disconnect = function(socket){

        delete voiceChat[socket.userId];

    };

    this.onRequestSend = function(socket, request){

        if (!(request.toId in voiceChat)) { return; }

        var memberTo = voiceChat[request.toId];

        if (memberTo.busy) { return; }

        this.setVoiceChatBusyStatus([request.toId, socket.userId], true);

    };

    this.onRequestCancel = function(socket, request){

        if (!(request.toId in voiceChat)) { return; }

        this.setVoiceChatBusyStatus([request.toId, socket.userId], false);

    };

    this.onRequestDecline = function(socket, request){

        if (!(request.toId in voiceChat)) { return; }

        this.setVoiceChatBusyStatus([request.toId, socket.userId], false);

    };

    this.onRequestAccept = function(socket, request){

        if (!(request.toId in voiceChat)) { return; }

        var roomId = 'voice-' + socket.userId + '-' + request.toId;

        app.rooms.create(roomId, {
            type: 'voicechat'
        });

        app.rooms.join(roomId, socket.userId);
        app.rooms.join(roomId, request.toId);

        app.io.to(roomId).emit('room open', {
            owner: request.toId,
            room: app.rooms.get(roomId)
        });

    };

    this.onRoomLeave = function(socket, room){
        this.setVoiceChatBusyStatus(Object.keys(room.members), false);
    };

    this.setVoiceChatBusyStatus = function(ids, status){

        var busyStatus = {};

        for (var i in ids){
            var id = ids[i];
            if (!(id in voiceChat)){ continue; }
            voiceChat[id].busy = status;
            busyStatus[id] = status;
        }

        app.io.to('voice-chat').emit('voice status', busyStatus);

    };

    this.getOnlineCount = function(){
        return Object.keys(voiceChat).length;
    };

    function voiceJoin(socket){

        if (!app.isAuth(socket)) { return; }
        if (socket.userId in voiceChat){ return; }

        var member = {
            id: socket.userId,
            busy: false
        };

        voiceChat[socket.userId] = member;

        socket.join('voice-chat');

        socket.emit('voice members list', voiceChat);

        socket.broadcast.to('voice-chat').emit('voice member in', member);

        app.io.emit('voice chat count', controller.getOnlineCount());

    }

    function voiceLeave(socket){

        if (!app.isAuth(socket)) { return; }
        if (!(socket.userId in voiceChat)){ return; }

        delete voiceChat[socket.userId];

        socket.leave('voice-chat');

        app.io.to('voice-chat').emit('voice member out', socket.userId);

        app.io.emit('voice chat count', controller.getOnlineCount());

    }

    function voicePeerReady(socket, toUserId){

        if (!app.isAuth(socket)) { return; }
        if (!app.isLogged(toUserId)) { return; }
        if (!(toUserId in voiceChat)) { return; }

        app.getSocket(toUserId).emit('voice peer ready');

    }

}
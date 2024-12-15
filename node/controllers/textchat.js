module.exports.create = function(app){
    return new TextChatController(app);
};

function TextChatController(app){

    var controller = this;

    this.addSocket = function(socket) {

        socket.on('text join public room', function(roomId){
            controller.joinPublicRoom(socket, roomId);
        });

    };

    this.onRequestAccept = function(socket, request){

        var roomId = 'text-' + socket.userId + '-' + request.toId;

        var room = app.rooms.create(roomId, {
            type: 'textchat'
        });

        app.rooms.join(roomId, socket.userId);
        app.rooms.join(roomId, request.toId);

        createPrivateRoomLog(room, socket.userId, request.toId);
        createPrivateRoomLog(room, request.toId, socket.userId);

        app.io.to(roomId).emit('room open', {
            owner: socket.userId,
            room: app.rooms.get(roomId)
        });

    };

    this.joinPublicRoom = function(socket, roomId){

        if (!app.isAuth(socket)) { return; }

        if (roomId == 'team' && !app.isStaff(socket)) { return; }

        if (!app.rooms.isExists(roomId)){
            app.rooms.create(roomId, {
                type: 'textchat',
                public: true
            });
        }

        var room = app.rooms.get(roomId);

        app.rooms.join(roomId, socket.userId);

        var logQuery = app.db.messages.find({roomId: roomId});

        logQuery.sort({sent: -1}).limit(app.config.lastMessagesCount).exec(function(err, messages){

            socket.emit('room open', {
                type: 'textchat',
                room: room,
                log: messages
            });

            socket.broadcast.to(roomId).emit('room joined', {
                id: roomId,
                member: room.members[socket.userId]
            });

        });

    };

    function createPrivateRoomLog(room, userId, companionId){

        var member = app.getMember(userId);

        if (!member.premium) { return; }

        var companion = app.getMember(companionId);

        var roomLogRecord = new app.db.roomLog({
            from: userId,
            to: {
                id: companionId,
                name: companion.name.full
            },
            messages_count: 0
        });

        roomLogRecord.save();

        if (!('log_binds' in room)){ room.log_binds = {}; }

        room.log_binds[userId] = roomLogRecord._id;

    };

}

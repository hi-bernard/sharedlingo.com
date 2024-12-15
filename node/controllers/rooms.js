module.exports.create = function(app){
    return new RoomsController(app);
};

function RoomsController(app){

    var controller = this;

    var MAX_MSG_LOG_SIZE = 20;
    var TOPIC_HELPERS_COUNT = 415;
    var SUGGEST_COOLDOWN_TIME = 60;

    var suggestCounter = 0;

    var rooms = {};

    var publicCounts = {};

    this.addSocket = function(socket) {

        socket.roomsList = [];

        socket.on('room send', function(data){
            roomSend(socket, data);
        });

        socket.on('room leave', function(roomId){
            controller.leave(socket, roomId);
        });

        socket.on('start type', function(roomId){
            roomStartType(socket, roomId);
        });

        socket.on('end type', function(roomId){
            roomEndType(socket, roomId);
        });

        socket.on('room suggest', function(roomId){
            roomSuggestTopic(socket, roomId);
        });

        socket.on('room spectate', function(roomId){
            roomSpectate(socket, roomId);
        });
    };

    this.disconnect = function(socket){
        leaveAll(socket);
    };

    this.onMemberUpdate = function(id, member){

        for (var roomId in rooms){
            var room = rooms[roomId];
            if (id in room.members){
                room.members[id].nameInRoom = member.name.first;
            }
        }

    };

    this.getAll = function(){
        return rooms;
    };

    this.get = function(id){
        return rooms[id];
    };

    this.isExists = function(id){
        return (id in rooms);
    };

    this.getPublicCounts = function(){
        return publicCounts;
    };

    function roomSend(socket, data){

        if (!app.isAuth(socket)) { return; }
        if (!isSocketInRoom(socket, data.roomId)) { return; }

        var room = rooms[data.roomId];

        var member = app.getMember(socket.userId);
        var sender = app.extend(member, room.members[socket.userId]);
        var escapedMessage = app.escape(data.msg);

        var color = room.public ? sender.color : 1;

        var logSize = member.log.length;

        if (logSize == MAX_MSG_LOG_SIZE){ member.log.shift(); }

        member.log.push({
            room: room.public ? room.id : false,
            text: escapedMessage
        });

        if (room.public){

            var messageRecord = new app.db.messages({
                roomId: data.roomId,
                sender: {
                    id: sender.id,
                    name: sender.nameInRoom,
                    color: color
                },
                text: escapedMessage
            });

            messageRecord.save();

        }

        if (!room.public){
            if ('log_binds' in room){
                for (var userId in room.log_binds){

                    var roomLogId = room.log_binds[userId];

                    var messageLogRecord = new app.db.roomMessagesLog({
                        roomId: roomLogId,
                        sender: {
                            id: sender.id,
                            name: sender.nameInRoom,
                            color: color
                        },
                        text: data.msg
                    });

                    messageLogRecord.save();

                    app.db.roomLog.findByIdAndUpdate(roomLogId, {$inc: {messages_count: 1}}, function(){});

                }
            }
        }

        app.io.to(data.roomId).emit('room message', {
            id: data.roomId,
            type: room.type,
            sender: {
                id: sender.id,
                name: sender.nameInRoom,
                color: color
            },
            msg: escapedMessage
        });

    }

    function roomStartType(socket, roomId){

        if (!app.isAuth(socket)) { return; }
        if (!isSocketInRoom(socket, roomId)) { return; }

        socket.broadcast.to(roomId).emit('start type', {
            id: roomId,
            sender: socket.userId
        });

    }

    function roomEndType(socket, roomId){

        if (!app.isAuth(socket)) { return; }
        if (!isSocketInRoom(socket, roomId)) { return; }

        socket.broadcast.to(roomId).emit('end type', {
            id: roomId,
            sender: socket.userId
        });

    }

    function roomSuggestTopic(socket, roomId){

        if (!app.isAuth(socket)) { return; }
        if (!isSocketInRoom(socket, roomId)) { return; }

        var room = rooms[roomId];

        if (room.suggestTime){
            var currentTime = (new Date()).getTime();
            if ((currentTime - room.suggestTime) < SUGGEST_COOLDOWN_TIME*1000) {
                return;
            }
        }

        var helperId = app.getRandomInt(1, TOPIC_HELPERS_COUNT);

        app.db.helpers.findOne({_id: Number(helperId)}, function(err, record){

            if (!record || !record.helper) { return; }

            app.io.to(roomId).emit('room message', {
                id: roomId,
                type: room.type,
                sender: {
                    id: 'topic-bot',
                },
                msg: record.helper
            });

            room.suggestTime = (new Date()).getTime();

            app.io.to(roomId).emit('room suggest cooldown', {
                id: roomId,
                type: room.type,
                delay: SUGGEST_COOLDOWN_TIME
            });

            suggestCounter++;

        });

        socket.broadcast.to(roomId).emit('end type', {
            id: roomId,
            sender: socket.userId
        });

    }

    function roomSpectate(socket, roomId){

        if (!app.isAuth(socket)) { return; }
        if (!app.isStaff(socket)) { return; }

        if (!app.rooms.isExists(roomId)){
            app.rooms.create(roomId, {
                type: 'textchat',
                public: true
            });
        }

        var room = rooms[roomId];

        socket.join(roomId);

        socket.roomsList.push(roomId);

        if (room.public){

            var logQuery = app.db.messages.find({roomId: roomId});

            logQuery.sort({sent: -1}).limit(app.config.lastMessagesCount).exec(function(err, messages){
                socket.emit('room open', {
                    type: 'textchat',
                    room: room,
                    log: messages,
                    spectate: true
                });
            });

        } else {

            socket.emit('room open', {
                type: 'textchat',
                room: room,
                spectate: true
            });

        }

    }

    function isSocketInRoom(socket, roomId){
        return (roomId in rooms) && socket.roomsList && (socket.roomsList.indexOf(roomId)>=0);
    }

    this.getSuggestCounter = function(){
        return suggestCounter;
    };

    this.create = function(id, options){

        options = options || {};

        var room = app.extend({
            id: id,
            members: {},
            membersCount: 0,
            colorCount: 1
        }, options);

        rooms[id] = room;

        if (room.public){
            publicCounts[id] = 0;
        }

        return room;

    };

    this.join = function(id, userId){

        var room = rooms[id];

        if (userId in room.members) { return; }

        var color = room.colorCount;

        room.colorCount++;
        if (room.colorCount > 10) { room.colorCount = 1; }

        var socket = app.getSocket(userId);
        var member = app.getMember(userId);

        var isNameExists = false;

        for (var memberId in room.members){
            if (room.members[memberId].nameInRoom == member.name.first){
                isNameExists = true;
                break;
            }
        }

        var roomMember = {
            id: userId,
            color: color,
            nameInRoom: isNameExists ? member.name.first + ' ' + member.name.last[0] + '.' : member.name.first
        };

        if (!roomMember.nameInRoom){
            roomMember.nameInRoom = member.name.first;
        }

        room.members[userId] = roomMember;

        room.membersCount = Object.keys(room.members).length;

        socket.join(id);

        socket.roomsList.push(id);

        if (room.public){
            publicCounts[id] = room.membersCount;
            app.io.emit('public counts', publicCounts);
        }

    };

    this.leave = function(socket, roomId, noSplice){

        if (!app.isAuth(socket)) { return; }
        if (!isSocketInRoom(socket, roomId)) { return; }

        if (!noSplice){
            socket.roomsList.splice(socket.roomsList.indexOf(roomId), 1);
        }

        var room = rooms[roomId];

        var isSpectator = !(socket.userId in room.members);

        socket.leave(roomId);

        if (!isSpectator){
            socket.broadcast.to(roomId).emit('room leaved', {
                id: roomId,
                type: room.type,
                userId: socket.userId
            });
        }

        runCallback('onRoomLeave', socket, room);

        delete room.members[socket.userId];

        room.membersCount = Object.keys(room.members).length;

        if (room.public){
            publicCounts[roomId] = room.membersCount;
        }

        if (!room.public){
            if ('log_binds' in room){
                delete room.log_binds[socket.userId];
            }
        }

        if (room.membersCount <= 0){
            delete rooms[roomId];
            if (roomId in publicCounts) { delete publicCounts[roomId]; }
        }

        if (room.public){
            app.io.emit('public counts', publicCounts);
        }

    };

    function leaveAll(socket){

        if (socket.roomsList.length === 0) {
            return;
        }

        for (var i in socket.roomsList){
            var roomId = socket.roomsList[i];
            controller.leave(socket, roomId, true);
        }

        socket.roomsList = [];

    }

    function runCallback(event, socket, room){

        var controller = app.getController(room.type);

        if (controller && (event in controller)){
            controller[event](socket, room);
        }

    }

}
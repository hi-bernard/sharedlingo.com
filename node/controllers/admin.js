module.exports.create = function(app){
    return new AdminController(app);
};

function AdminController(app){

    this.addSocket = function(socket) {

        socket.on('ban', function(data){

            if (!app.isStaff(socket)) { return; }

            if (app.isLogged(data.userId)) {

                if (data.permanent && app.isAdmin(socket)){
                    app.getSocket(data.userId).emit('broadcast', {
                        type: 'ban'
                    });
                }

                app.getSocket(data.userId).disconnect();

            }

            var setData = { banned: true };

            if (data.reason){
                setData.reason = data.reason;
            }

            app.db.members.update({ _id: data.userId }, {$set: setData}, function(){});

            if (data.permanent && app.isAdmin(socket)){
                app.db.members.update({ _id: data.userId }, {$unset: { ban_until: true }}, function(){});
            }

        });

        socket.on('banself', function(data){

            if (app.getSocket(data.userId).userId != data.userId){ return; }

            app.db.members.update({ _id: data.userId }, {$set: { banned: true }}, function(){});

            app.getSocket(data.userId).disconnect();

        });

        socket.on('broadcast', function(data){

            if (!app.isAdmin(socket)) { return; }

            data.type = 'message';

            app.io.emit('broadcast', data);

        });

        socket.on('mail mass', function(){

            if (!app.isAdmin(socket)) { return; }

            app.db.members.find({online: true}).select({_id: 1, inbox_unread: 1}).exec(function(err, members){
                for(var i in members){
                    var id = members[i]._id;
                    var count = members[i].inbox_unread;
                    if (!app.isLogged(id)) { continue; }
                    app.getSocket(id).emit('mail unread', count);
                }
            });

        });

        socket.on('live stats', function(){

            if (!app.isAdmin(socket)) { return; }

            var stats = {
                rooms: {},
                suggests: app.rooms.getSuggestCounter()
            };

            var rooms = app.rooms.getAll();

            Object.keys(rooms).forEach(function(roomId){

                var room = rooms[roomId];

                if (Object.keys(room.members).length < 2) { return; }

                if (room.public) { return; }

                stats.rooms[roomId] = [];

                Object.keys(room.members).forEach(function(memberId){

                    var member = app.getMember(memberId);

                    stats.rooms[roomId].push(member.name.full);

                });

            });

            socket.emit('live stats', stats);

        });

        socket.on('messages log', function(userId){

            if (!app.isStaff(socket)) { return; }

            if (!app.isLogged(userId)) { return; }

            var member = app.getMember(userId);

            socket.emit('messages log', {
                userId: userId,
                log: member.log
            });

        });

    };

    this.connect = function(socket){
        if (app.isStaff(socket)){
            socket.join('staff');
        }
    };

}

module.exports.create = function(app){
    return new MembersController(app);
};

function MembersController(app){

    var controller = this;

    this.addSocket = function(socket) {

        socket.on('member ignore', function(userId){
            memberIgnore(socket, userId);
        });

        socket.on('member unignore', function(userId){
            memberUnignore(socket, userId);
        });

        socket.on('member edit', function(){

            if (!app.isAuth(socket)) { return; }

            app.db.members.findById(socket.userId, function(err, member){

                var memberRecord = app.parseMember(member);

                app.updateMember(socket.userId, memberRecord);

                app.io.emit('member updated', memberRecord);

            });

        });

    };

    function memberIgnore(socket, userId){

        if (!app.isAuth(socket)) { return; }

        var blackList = app.getMember(socket.userId).blacklist;

        if (blackList.indexOf(userId) >= 0) { return; }

        blackList.push(userId);

    };

    function memberUnignore(socket, userId){

        if (!app.isAuth(socket)) { return; }

        var blackList = app.getMember(socket.userId).blacklist;

        if (blackList.indexOf(userId) < 0) { return; }

        blackList.splice(blackList.indexOf(userId), 1);

    };

}
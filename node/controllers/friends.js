module.exports.create = function(app){
    return new FriendsController(app);
};

function FriendsController(app){

    var controller = this;

    this.addSocket = function(socket) {

        socket.on('friend added', function(friendId){
           if (app.isLogged(friendId)){
               app.getSocket(friendId).emit('friend login');
               socket.emit('friend login');
           }
        });

    };

    this.connect = function(socket){
        sendOnlineFriendsCount(socket)
        notifyFriends(socket, 'login');
    };

    this.disconnect = function(socket){
        notifyFriends(socket, 'logout');
    };

    function sendOnlineFriendsCount(socket){

        if (!app.isAuth(socket)) { return; }

        var member = app.getMember(socket.userId);
        var count = 0;

        if (member.friends) {
            member.friends.forEach(function(friendId){
                if (app.isLogged(friendId)){
                    count++;
                }
            });
        }

        socket.emit('friends count', count);

    }

    function notifyFriends(socket, event){

        if (!app.isAuth(socket)) { return; }

        var member = app.getMember(socket.userId);

        if (member.friends) {
            member.friends.forEach(function(friendId){
                if (app.isLogged(friendId)){
                    app.getSocket(friendId).emit('friend '+event);
                }
            });
        }

    }

}
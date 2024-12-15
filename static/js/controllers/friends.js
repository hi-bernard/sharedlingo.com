function FriendsController(app, socket){

    var friendsOnlineCount = 0;
    var friendsCountReceived = false;

    init();

    function init(){

        socket.on('friends count', function(count){
            friendsCountReceived = true;
            friendsOnlineCount = count;
            updateFriendsCount();
        });

        socket.on('friend login', function(){
            if (!friendsCountReceived) { return; }
            friendsOnlineCount++;
            updateFriendsCount();
        });

        socket.on('friend logout', function(){
            if (!friendsCountReceived) { return; }
            friendsOnlineCount--;
            updateFriendsCount();
        });

    }

    function updateFriendsCount(){
        if (friendsOnlineCount < 0) { friendsOnlineCount = 0; }
        if (friendsOnlineCount > 0){
            $('#friendsLink .badge').text(friendsOnlineCount).show();
        } else {
            $('#friendsLink .badge').text('').hide();
        }
    }

    this.sendRequest = function(friendId, friendName){

        app.dialogs.confirm(t('friendConfirm', {name: friendName}), function(){

            $.post('/friends/request', {id: friendId}, function(result){

                app.dialogs.message(result.message);

                if (app.isMemberOnline(friendId)){
                    socket.emit('mail sent', friendId);
                }

            }, 'json');

        });

    };

    this.acceptRequest = function(requestId, friendId, friendName, callback){

        app.dialogs.confirm(t('friendConfirm', {name: friendName}), function(){

            $.post('/friends/accept', {id: requestId}, function(result){

                app.dialogs.message(result.message);

                if (app.isMemberOnline(friendId)){
                    socket.emit('mail sent', friendId);
                    socket.emit('friend added', friendId);
                }

                if (app.dialogs.isDialogExists('friends')){
                    app.dialogs.getDialog('friends').formHandler.submit();
                }

            }, 'json');

            if (callback){
                callback();
            }

        });

    };

    this.declineRequest = function(requestId, friendId){

        $.post('/friends/decline', {id: requestId}, function(result){

            if (result.success){
                if (app.isMemberOnline(friendId)){
                    socket.emit('mail sent', friendId);
                }
            }

        }, 'json');

    };

}

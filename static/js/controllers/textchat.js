function TextChatController(app, socket){

    var requestsReceived = {};
    var requestsSent = {};
    var counts = {};

    init();

    function init(){
        initSocket();
    };

    function initSocket(){

        socket.on('request received', function(request){
            if (request.type !== 'textchat') { return; }
            showReceivedRequest(request.senderId);
        });

        socket.on('request canceled', function(request){

            if (request.type !== 'textchat') { return; }
            if (!(request.fromId in requestsReceived)) { return; }

            var dialog = requestsReceived[request.fromId];

            dialog.remove();

            delete requestsReceived[request.fromId];

        });

        socket.on('request declined', function(request){

            if (request.type !== 'textchat') { return; }

            if (!(request.fromId in requestsSent)) { return; }

            var invite = requestsSent[request.fromId];

            if (invite.dialog){
                invite.dialog.remove();
            }

            app.dialogs.message(t('requestDeclined', {name: invite.name}))

            delete requestsSent[request.fromId];

        });

        socket.on('request accepted', function(request){

            if (request.type !== 'textchat') { return; }

            if (!(request.fromId in requestsSent)) { return; }

            var invite = requestsSent[request.fromId];

            invite.dialog.remove();

            delete requestsSent[request.fromId];

        });

    };

    function showReceivedRequest(senderId){

        if (senderId in requestsReceived) { return; }

        if (senderId in counts) {
            counts[senderId] += 1;
        } else {
            counts[senderId] = 1;
        }

        var requestCount = counts[senderId];

        app.playSound('notifySound');

        var member = app.getMember(senderId);

        var buttons = [];

        buttons.push({
            id: 'accept',
            class: 'btn-success',
            title: t('accept'),
            click: function(){
                acceptRequest(member.id);
                this.remove();
            }
        });

        buttons.push({
            id: 'profile',
            class: 'btn-default',
            title: t('viewProfile'),
            click: function(){
                app.openProfile(member.id, member.name.full);
            }
        });

        if (requestCount > 2){
            buttons.push({
                id: 'block',
                class: 'btn-danger',
                title: t('ignore'),
                click: function(){
                    var dialog = this;
                    app.dialogs.confirm(t('ignoreConfirm', {name: member.name.full}), function(){
                        app.addToBlackList(member.id);
                        declineRequest(member.id);
                        dialog.remove();
                    });
                }
            });
        }

        buttons.push({
            id: 'cancel',
            class: 'btn-danger',
            title: t('decline'),
            click: function(){
                declineRequest(member.id);
                this.remove();
            }
        });

        requestsReceived[member.id] = app.dialogs.create({
            id: 'request-' + member.id,
            title: t('pendingRequest'),
            content: tpl('chatRequestTemplate', member),
            buttons: buttons,
            onClose: function(){
                declineRequest(member.id);
            }
        });

    };

    this.sendRequest = function(toUserId, toUserName){

        if (toUserId === app.userId) { return; }

        if (toUserId in requestsReceived) {
            var requestDialogId = 'request-' + toUserId;
            if (app.dialogs.isDialogExists(requestDialogId)){
                app.dialogs.getDialog(requestDialogId).bringToFront();
            }
            return;
        }

        socket.emit('request send', {
            type: 'textchat',
            toId: toUserId
        });

        requestsSent[toUserId] = {
            name: toUserName,
            dialog: app.dialogs.create({
                id: 'invite-' + toUserId,
                title: t('pendingInvitation'),
                content: tpl('messageDialogTemplate', {
                    message: t('pendingInvitationInfo', {
                        name: toUserName
                    })
                }),
                buttons: [{
                    id: 'cancel',
                    class: 'btn-danger',
                    title: t('cancel'),
                    click: function(){
                        cancelRequest(toUserId);
                        this.remove();
                    }
                }],
                onClose: function(){
                    cancelRequest(toUserId);
                }
            })
        };

    };

    function acceptRequest(toUserId){

        socket.emit('request accept', {
            type: 'textchat',
            toId: toUserId
        });

        delete requestsReceived[toUserId];

    };

    function declineRequest(toUserId){

        socket.emit('request decline', {
            type: 'textchat',
            toId: toUserId
        });

        delete requestsReceived[toUserId];

    };

    function cancelRequest(toUserId){

        socket.emit('request cancel', {
            type: 'textchat',
            toId: toUserId
        });

    };

}

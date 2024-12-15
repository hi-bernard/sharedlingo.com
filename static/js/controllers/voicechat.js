function VoiceChatController(app, socket){

    var dialog, contextMenu;

    var members = {};
    var membersCount = 0;

    var $membersListTable, $toolbar;
    var $membersList;

    var mediaStream, peer, peerCall;

    var isStarted = false, isMeBusy = false;

    var outgoingCall = {}, incomingCall = {}, room = {};

    this.openLobby = function(){

        members = {};
        membersCount = 0;

        peerCall = null;

        createLobbyDialog();

        if (isStarted) {
            if (mediaStream){
                $membersListTable.show();
                $toolbar.show();
                socket.emit('voice join');
            }
            return;
        }

        contextMenu = app.contextMenuManager.createMenu({
            id: 'voiceChatLobbyContextMenu',
            items: {
                call: {
                    title: t('voiceChatCall'),
                    icon: 'phone',
                    click: function(data){
                        call(data.userId, data.userName);
                    }
                },
                profile: {
                    title: t('viewProfile'),
                    icon: 'search',
                    click: function(data){
                        app.openProfile(data.userId, data.userName);
                    }
                }
            }
        });

        dialog.body().find('.wait-perms').show();

        createMediaStream();

    };

    function createLobbyDialog(){

        if (dialog) {
            dialog.bringToFront();
            return;
        }

        dialog = app.dialogs.create({
            id: 'voice-lobby',
            width: 800,
            height: 500,
            title: t('voiceChatLobby', {count: 0}),
            content: tpl('voiceLobbyTemplate'),
            onClose: function(){
                leave();
            }
        });

        if (!app.mobile){

            dialog.$membersPane = dialog.body().find('.members-scroll');

            resizeDialog(dialog, dialog.body().height());

            dialog.setOption('onResize', function($body){
                resizeDialog(this, $body.height());
            });

            $membersListTable = dialog.body().find('#voiceLobbyMembersList');
            $toolbar = dialog.body().find('.toolbar');

            $membersListTable.tablesorter({
                widgets: ['stickyHeaders'],
                widgetOptions: {
                    stickyHeaders_attachTo: '#voice-lobby .members-scroll',
                }
            });

        }

        $membersList = $membersListTable.find('.list-body');

        $membersList.on('click', 'tr', function(event){

            var $row = $(this);
            var id = $row.attr('id');
            var name = $('.name span', $row).html();

            if (id === app.userId) { return; }

            if (members[id].busy){
                contextMenu.setItemTitle('call', t('voiceChatCallBusy'));
                contextMenu.disableItem('call');
            } else {
                contextMenu.setItemTitle('call', t('voiceChatCall'));
                contextMenu.enableItem('call');
            }

            contextMenu.set({
                userId: id,
                userName: name
            }).show(event, name);

        });

        dialog.body().find('#hide-busy').change(function(){
            $membersListTable.toggleClass('hide-busy');
        });

    }

    function initSocket(){

        socket.on('voice members list', function(list){
            $.each(list, function(id, member){
                addMember(member);
            });
        });

        socket.on('voice member in', function(member){
            addMember(member);
        });

        socket.on('voice member out', function(id){
            removeMember(id);
        });

        socket.on('voice member updated', function(member){
            updateMember(member);
        });

        socket.on('request received', function(request){
            if (request.type !== 'voicechat') { return; }
            showReceivedCall(request.senderId);
        });

        socket.on('request canceled', function(request){

            if (request.type !== 'voicechat') { return; }
            if (incomingCall.from != request.fromId) { return; }

            app.stopSound('ringSound');

            incomingCall.dialog.remove();

            isMeBusy = false;

        });

        socket.on('request declined', function(request){

            if (request.type !== 'voicechat') { return; }
            if (outgoingCall.to != request.fromId) { return; }

            outgoingCall.dialog.remove();

            app.dialogs.message(t('callDeclined', {name: outgoingCall.name}))

        });

        socket.on('room open', function(data){

            if (data.room.type !== 'voicechat') { return; }

            var partner;

            $.each(data.room.members, function(id, member){
                if (id != app.userId) {
                    partner = member;
                }
            });

            if (data.owner == app.userId){
                startRoom(data.room, partner);
            } else {
                joinRoom(data.room, partner);
            }

        });

        socket.on('room message', function(data){
            if (data.type !== 'voicechat') { return; }
            roomMessageReceived(data.id, data.sender, data.msg);
        });

        socket.on('room leaved', function(data){
            if (data.type !== 'voicechat') { return; }
            leaveRoom();
        });

        socket.on('voice peer ready', function(){
            outgoingCall.peerReady = true;
            if (peer){
                peerCall = peer.call(outgoingCall.to, mediaStream);
                peerCall.on('stream', receivePeerCallStream);
            }
        });

        socket.on('voice status', function(list){
            $.each(list, function(id, busy){
                setBusy(id, busy);
            });
        });

    }

    function resizeDialog(dialog, height){
        dialog.$membersPane.css({height: (height - 42)+'px'});
    }

    function createMediaStream(){

        navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

        if (!DetectRTC.isWebRTCSupported || !navigator.getUserMedia){
            dialog.body().find('.list-overlay').hide();
            dialog.body().find('.not-supported').show();
            return;
        }

        navigator.getUserMedia({
            audio: true,
            video: false
        }, function(stream){

            mediaStream = stream;
            initSocket();
            socket.emit('voice join');
            isStarted = true;

            $membersListTable.show();
            dialog.body().find('.toolbar').show();
            dialog.body().find('.list-overlay').hide();

        }, function(){

            dialog.body().find('.list-overlay').hide();
            dialog.body().find('.no-perms').show();

        });

    }

    function call(toUserId, toUserName){

        if (!(toUserId in members)){ return; }
        if (members[toUserId].busy) { return; }

        socket.emit('request send', {
            type: 'voicechat',
            toId: toUserId
        });

        outgoingCall = {
            to: toUserId,
            name: toUserName,
            peerReady: false,
            dialog: app.dialogs.create({
                id: 'call-' + toUserId,
                title: t('pendingCall'),
                modal: true,
                content: tpl('messageDialogTemplate', {
                    message: t('pendingCallInfo', {
                        name: toUserName
                    })
                }),
                buttons: [{
                    id: 'cancel',
                    class: 'btn-danger',
                    title: t('cancel'),
                    click: function(){
                        cancelCall();
                        this.remove();
                    }
                }],
                onClose: function(){
                    cancelCall();
                }
            })
        };

    };

    function showReceivedCall(senderId){

        if (isMeBusy) { return; }

        app.playSound('ringSound');

        var member = app.getMember(senderId);

        incomingCall = {
            from: member.id,
            dialog: app.dialogs.create({
                id: 'call-from-' + member.id,
                title: t('incomingCall'),
                content: tpl('chatRequestTemplate', member),
                titleIcon: 'phone',
                modal: true,
                buttons: [{
                    id: 'accept',
                    class: 'btn-success',
                    title: t('answer'),
                    click: function(){
                        acceptCall();
                        this.remove();
                    }
                }, {
                    id: 'cancel',
                    class: 'btn-danger',
                    title: t('decline'),
                    click: function(){
                        declineCall();
                        this.remove();
                    }
                }],
                onClose: function(){
                    declineCall();
                }
            })
        };

        isMeBusy = true;

    };

    function acceptCall(){
        app.stopSound('ringSound');
        socket.emit('request accept', {
            type: 'voicechat',
            toId: incomingCall.from
        });
    };

    function declineCall(){
        app.stopSound('ringSound');
        socket.emit('request decline', {
            type: 'voicechat',
            toId: incomingCall.from
        });
        incomingCall = {};
        isMeBusy = false;
    };

    function cancelCall(){
        socket.emit('request cancel', {
            type: 'voicechat',
            toId: outgoingCall.to
        });
        outgoingCall = {};
        isMeBusy = false;
    };

    function startRoom(room, partner){

        outgoingCall.dialog.remove();

        createRoom(room.id, partner);

        createPeer(function(){
            if (outgoingCall.peerReady && !peerCall){
                peerCall = peer.call(outgoingCall.to, mediaStream);
                peerCall.on('stream', receivePeerCallStream);
            }
        });

    }

    function joinRoom(room, partner){

        createRoom(room.id, partner);

        createPeer(function(){
            socket.emit('voice peer ready', incomingCall.from);
        });

    }

    function createRoom(roomId, partner){

        partner = app.getMember(partner.id);

        room = {
            id: roomId,
            partner: partner,
            time: 0,
            timerInverval: null,
            dialog: app.dialogs.create({
                id: roomId,
                title: t('voiceChatRoom'),
                titleIcon: 'microphone',
                content: tpl('voiceChatRoomTemplate', partner),
                width: 400,
                height: 400,
                isHideBottomBar: true,
                modal:true,
                isCloseable: false
            })
        };

        room.audio = room.dialog.body().find('audio')[0];
        room.$timer = room.dialog.body().find('.timer');

        room.dialog.$messagesCell = room.dialog.body().find('.messages');

        room.dialog.setOption('onResize', function($body){
            roomResizeDialog(this, $body.height());
        });

        room.dialog.body().find('.btn-disconnect').click(function(){
            leaveRoom(true);
        });

        $('input.message', room.dialog.body()).keyup(function(e){
            if (e.which === 13){
                $input = $(this);
                var message = $input.val().trim();
                if (!message) { return; }
                sendRoomMessage(room.id, message);
                $input.val('').attr('placeholder', '');
            }
        });

        roomMessageReceived(room.id, {
            id: 'system',
            icon: 'spin fa-spinner'
        }, t('voiceChatConnecting'));

    };

    function roomResizeDialog(dialog, height){
        dialog.$messagesCell.css({height: (height - 105)+'px'});
    }

    function sendRoomMessage(roomId, message){

        socket.emit('room send', {
            roomId: roomId,
            msg: message
        });

    }

    function roomMessageReceived(roomId, sender, message){

        if (!room.id) { return; }
        if (room.id != roomId) { return; }

        var $message;

        if (sender.id === 'system'){

            $message = $(tpl('roomSystemMessageTemplate', {
                icon: sender.icon,
                class: sender.class ? sender.class : '',
                message: message,
            }));

        } else {

            $message = $(tpl('roomMessageTemplate', {
                name: sender.name,
                color: sender.color,
                message: urls(emotions(message)),
            }));

            if (sender.id === app.userId){
               $message.addClass('my');
            }

        }

        $message.appendTo($('.messages ul', room.dialog.body()));

        $('.messages .scroll', room.dialog.body()).scrollTop(1E10);

    }

    function createPeer(callback){

        if (peer) {
            if (callback) { callback(); }
            return;
        }

        $.post('/app/servers', {}, function(servers){

            peer = new Peer(app.userId, {
                    host: app.host,
                    port: 9000,
                    path: '/peer',
                    secure: true,
                    config: servers
                }
            );

            peer.on('call', receivePeerCall);

            if (callback) { callback(); }

        }, 'json');

    }

    function receivePeerCall(call){

        call.answer(mediaStream);
        call.on('stream', receivePeerCallStream);

        peerCall = call;

    }

    function receivePeerCallStream(stream){

        room.audio.volume = 1;

        room.audio.src = window.URL.createObjectURL(stream);

        room.audio.onloadedmetadata = function(e){
            room.audio.play();
            connected();
        };

    }

    function connected(){

        $('.messages ul', room.dialog.body()).empty();

        roomMessageReceived(room.id, {
            id: 'system',
            icon: 'plug'
        }, t('voiceChatConneced'));

        room.timerInverval = setInterval(roomTimerTick, 1000);

    }

    function roomTimerTick(){

        room.time++;

        var minutes = Math.floor(room.time / 60);
        var seconds = room.time - (minutes * 60);

        minutes = minutes >= 10 ? minutes : '0' + minutes;
        seconds = seconds >= 10 ? seconds : '0' + seconds;

        room.$timer.html(minutes + ':' + seconds);

    }

    function leaveRoom(isEmit){

        clearInterval(room.timerInverval);

        if (peerCall) {
            peerCall.close();
            peerCall = null;
        }

        if (isEmit){
            socket.emit('room leave', room.id);
        }

        room.dialog.remove();

        isMeBusy = false;

        outgoingCall = {};
        incomingCall = {};

        if (!isEmit){
            app.dialogs.message(t('voiceChatPartnerLeft', {name: room.partner.name.full}));
        }

        room = {};

    }

    function addMember(member){

        member = $.extend(app.getMember(member.id), member);

        member.status = member.busy ? 'busy' : 'idle';

        members[member.id] = member;
        membersCount++;

        var $row = $(tpl('voiceLobbyMemberTemplate', member));

        if (member.name.color) {
            $row.find('.name').css({color: member.name.color});
        }

        $row.appendTo($membersList);

        $membersListTable.trigger('update');

        dialog.setTitle(t('voiceChatLobby', {count: membersCount}));

    }

    function removeMember(id){

        if (!(id in members)) { return; }

        $('tr#' + id, $membersList).remove();

        delete members[id];
        membersCount--;

        $membersListTable.trigger('update');

        dialog.setTitle(t('voiceChatLobby', {count: membersCount}));

    }

    function updateMember(member){

        if (!(member.id in members)){ return; }

        removeMember(member.id);
        addMember(member);

    }

    function leave(){
        socket.emit('voice leave');
        dialog = null;
    }

    function setBusy(id, isBusy){
        members[id].busy = isBusy;
        var $row = $('tr#' + id, $membersList);
        var $statusCell = $row.find('.status');
        $row.toggleClass('status-busy', isBusy).toggleClass('status-idle', !isBusy);
        $statusCell.toggleClass('status-busy', isBusy).toggleClass('status-idle', !isBusy);
    }

}

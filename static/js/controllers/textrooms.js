function TextRoomsController(app, socket){

    var DEFAULT_ROOM_FONT_SIZE = 13;

    var controller = this;

    var rooms = {};
    var contextMenu;

    var publicCountsCache = {};

    var SK_ENTER = 1, SK_CTRL_ENTER = 2;

    init();

    function init(){

        contextMenu = app.contextMenuManager.createMenu({
            id: 'roomMembersContextMenu',
            items: [
                {
                    title: t('viewProfile'),
                    click: function(data){
                        app.openProfile(data.userId, data.userName);
                    }
                }
            ]
        });

        initSocket();

    }

    function initSocket(){

        socket.on('room open', function(data){

            if (data.room.type !== 'textchat') { return; }

            var id = data.room.id;
            var room = data.room;

            if (id in rooms) {
                var dialog = getRoomDialog(id);
                updateRoomMembersList(room, dialog);
                dialog.bringToFront();
                return;
            }

            var log = data.log ? data.log : [];

            var isSpectate = data.spectate ? true: false;

            createRoom(room, log, isSpectate);

        });

        socket.on('room message', function(data){
            if (data.type !== 'textchat') { return; }
            roomMessageReceived(data.id, data.sender, data.msg);
        });

        socket.on('room suggest', function(data){
            if (data.type !== 'textchat') { return; }
            roomMessageReceived(data.id, data.sender, data.msg);
        });

        socket.on('room joined', function(data){
            roomAddMember(data.id, data.member);
        });

        socket.on('room leaved', function(data){
            if (data.type !== 'textchat') { return; }
            roomRemoveMember(data.id, data.userId);
        });

        socket.on('start type', function(data){

            var $membersList = getRoomDialog(data.id).$membersList;
            var $member = $membersList.find('#member-'+data.sender);

            $('i.gender', $member).hide();
            $('i.typing', $member).css('display', 'inline-block');

        });

        socket.on('end type', function(data){

            var $membersList = getRoomDialog(data.id).$membersList;
            var $member = $membersList.find('#member-'+data.sender);

            $('i.gender', $member).show();
            $('i.typing', $member).hide();

        });

        socket.on('room suggest cooldown', function(data){
            if (data.type !== 'textchat') { return; }
            roomStartSuggestCooldown(data.id, data.delay);
        });

    }

    function createRoom(room, log, isSpectate){

        if (room.id in rooms) { return; }

        var roomTitle = '';

        var roomDialog = app.dialogs.create({
            id: 'room-' + room.id,
            title: '',
            titleCount: 0,
            titleIcon: 'comment-o',
            content: tpl('chatRoomTemplate'),
            width: 600,
            height: 450,
            isHideBottomBar: true,
            onClose: function(){
                leaveRoom(room.id);
            },
            onFocus: function(){
                resetUnreadCounter(room.id);
                removeLine(this);
            },
            onBlur: function(){
                insertLine(this);
            }
        });

        if (!room.public){

            roomDialog.body().find('.chat-room').addClass('private');

            roomDialog.$suggestBtn = roomDialog.body().find('.suggest-hint .btn');

            roomDialog.$suggestBtn.click(function(e){
                e.preventDefault();
                app.dialogs.confirm(t('suggestConfirm'), function(){
                    socket.emit('room suggest', room.id);
                });
            });

        }

        roomDialog.$messagesCell = roomDialog.body().find('.messages');
        roomDialog.$membersCell = roomDialog.body().find('.members');

        roomResizeDialog(roomDialog, roomDialog.body().height());

        roomDialog.setOption('onResize', function($body){
            roomResizeDialog(this, $body.height());
        });

        rooms[room.id] = {
            dialog: roomDialog,
            id: room.id,
            members: room.members,
            public: room.public,
            unreadCount: 0,
            fontSize: DEFAULT_ROOM_FONT_SIZE,
            isTyping: false,
            typingInterval: null,
            autoScroll: true
        };

        roomDialog.$membersList = roomDialog.body().find('.members ul');
        roomDialog.$emoticonsPane = roomDialog.body().find('.emoticons-pane');

        if (app.mobile) {
            roomDialog.$zoomPane = roomDialog.body().find('.zoom-pane');
        } else {
            roomDialog.$zoomPane = roomDialog.body().find('.opt-zoom');
        }

        if (!app.mobile){

            roomDialog.$settingsPane = roomDialog.body().find('.settings-pane');

            roomDialog.$settingsPane.find('input:radio').click(function(){
                if ($(this).is(':checked')){
                    app.setUserOption('send_key', $(this).val());
                }
            });

            roomDialog.body().find('.settings-toggle').click(function(e){

                var sendKey = app.getUserOption('send_key', SK_ENTER);
                roomDialog.$settingsPane.find('.opt-send-key input[value='+sendKey+']').prop('checked', true);

                roomDialog.$settingsPane.toggle();

            });

            roomDialog.body().find('.translate').click(function(e){

                e.preventDefault();

                var selection = window.getSelection();
                var text = selection.toString().trim();

                if (!text) {
                    app.dialogs.message(t('translateNone'));
                    return;
                }

                window.open('https://translate.google.com/?q=' + encodeURIComponent(text));

            });

        }

        roomTitle = updateRoomMembersList(room, roomDialog);

        roomDialog.setTitle(roomTitle);

        if (log){

            var $messagesList = $('.messages ul', roomDialog.body())

            for (var i = log.length-1; i >= 0; i--){

                var message = log[i];

                var $message = $(tpl('roomMessageTemplate', {
                    name: message.sender.name,
                    message: parseMsg(message.text)
                }));

                if (message.sender.id === app.userId){
                    $message.addClass('my');
                }

                $message.appendTo($messagesList);

            }

            insertLine(roomDialog);

            $('.messages .scroll', roomDialog.body()).scrollTop(1E9);

        }

        if (!app.mobile){
            $('input.message', roomDialog.body()).focus();
            roomDialog.$tooltip = roomDialog.body().find('.tooltip');
        }

        if (app.mobile){

            roomDialog.$membersCount = roomDialog.body().find('.members .count');
            roomDialog.$membersCount.text( Object.keys(room.members).length );

            roomDialog.body().find('.members .shortcut').click(function(e){
                e.preventDefault();
                e.stopPropagation();
                $(this).parent().toggleClass('visible');
            });

            roomDialog.body().find('.members').click(function(e){
                e.stopPropagation();
                $(this).toggleClass('visible');
            });

        }

        if (isSpectate){
            roomDialog.body().find('.controls > div').remove();
            return;
        }

        var $input = roomDialog.body().find('input.message');

        $input.keydown(function(e){
            startTyping(rooms[room.id]);
            var sendKey = app.getUserOption('send_key', SK_ENTER);
            if (((e.ctrlKey || e.metaKey) || (sendKey != SK_CTRL_ENTER)) && e.which === 13){
                $input = $(this);
                var message = $input.val().trim();
                if (!message) { return; }
                stopTyping(rooms[room.id]);
                sendRoomMessage(room.id, message);
                $input.val('').attr('placeholder', '');
                if (app.mobile){
                    $input.blur();
                }
            }
        });

        if (app.mobile){
            roomDialog.body().find('.zoom-toggle').click(function(e){
                roomDialog.$zoomPane.toggle();
            });
        }

        roomDialog.$zoomPane.find('.zoom-out').click(function(e){
            e.preventDefault();
            if (rooms[room.id].fontSize == DEFAULT_ROOM_FONT_SIZE) { return; }
            rooms[room.id].fontSize -= 4;
            roomDialog.$messagesCell.css({fontSize: rooms[room.id].fontSize + 'px'});
        });

        roomDialog.$zoomPane.find('.zoom-in').click(function(e){
            e.preventDefault();
            if (rooms[room.id].fontSize >= 48) { return; }
            rooms[room.id].fontSize += 4;
            roomDialog.$messagesCell.css({fontSize: rooms[room.id].fontSize + 'px'});
        });

        roomDialog.body().find('.emoticons-toggle').click(function(e){
            roomDialog.$emoticonsPane.toggle();
        });

        roomDialog.$emoticonsPane.click(function(e){
            e.preventDefault();
            var pane = $(this);
            var x = Math.floor((e.pageX - pane.offset().left)/24);
            var y = Math.floor((e.pageY - pane.offset().top)/24);
            var id = y*8 + x;
            var value = $input.val().trim();
            $input.val( value + '*' + emoticons[id] + '* ' ).focus();
            pane.hide();
        });

        roomDialog.body().find('.messages .scroll').scroll(function(e){
            var $this = $(this);
            var scrollTop  = $this.scrollTop();
            var scrollHeight = $this.get(0).scrollHeight;
            var height = $this.height();
            if (scrollHeight - scrollTop <= height + 20){
                rooms[room.id].autoScroll = true;
            } else {
                rooms[room.id].autoScroll = false;
            }
        });

    }

    function roomResizeDialog(dialog, height){
        dialog.$messagesCell.css({height: (height - 55)+'px'});
        dialog.$membersCell.css({height: (height - 55)+'px'});
    }

    function updateRoomMembersList(room, roomDialog){

        roomDialog.$membersList.empty();

        var roomTitle = room.public ? app.langs[room.id] : '';

        if (room.public && room.id == 'team'){
            roomTitle = t('teamRoom');
        }

        $.each(room.members, function(id, member){

            member = $.extend(app.getMember(id), member);

            roomAddMemberToList(room.id, member);

            if ((!room.public) && (id !== app.userId)){
                roomTitle = member.name.full;
            }

        });

        return roomTitle;

    }

    function sendRoomMessage(roomId, message){

        socket.emit('room send', {
            roomId: roomId,
            msg: message
        });

    }

    function roomMessageReceived(roomId, sender, message){

        if (!(roomId in rooms)) { return; }

        if (app.isInBlackList(sender.id)) { return; }

        var room = rooms[roomId];
        var dialog = room.dialog;

        var $message;

        if (sender.id === 'system'){

            $message = $(tpl('roomSystemMessageTemplate', {
                icon: sender.icon,
                class: sender.class ? sender.class : '',
                message: message,
            }));

        } else if (sender.id === 'topic-bot') {

            $message = $(tpl('roomMessageTemplate', {
                name: t('topicBotName'),
                color: '#000',
                message: t('topicBotSuggestion', {question: message}),
            }));

            $message.addClass('topic-bot');

        } else {

            $message = $(tpl('roomMessageTemplate', {
                name: sender.name,
                color: sender.color,
                message: parseMsg(message),
            }));

            if (sender.id === app.userId){
               $message.addClass('my');
            }

        }

        $message.appendTo($('.messages ul', dialog.body()));

        if (room.autoScroll){
            $('.messages .scroll', dialog.body()).scrollTop(1E9);
        }

        if (!dialog.isFocused()){
            room.unreadCount++;
            dialog.setTitleCounter(room.unreadCount);
        }

        if (!app.isActive()){
            app.counter.increment();
        }

    }

    function insertLine(dialog){
        $('.messages ul .divider', dialog.body()).remove();
        var $line = $('<li/>').addClass('divider');
        $line.appendTo($('.messages ul', dialog.body()));
    }

    function removeLine(dialog){
        $('.messages ul .divider:last-child', dialog.body()).remove();
    }

    function resetUnreadCounter(roomId){

        if (!(roomId in rooms)) { return; }

        var room = rooms[roomId];

        if (room.unreadCount > 0){
            room.unreadCount = 0;
            room.dialog.setTitleCounter(0);
        }

    }

    function leaveRoom(roomId){

        if (!(roomId in rooms)) { return; }

        delete rooms[roomId];

        socket.emit('room leave', roomId);

    }

    function roomAddMemberToList(roomId, member){

        roomRemoveMemberFromList(roomId, member.id);

        var $membersList = getRoomDialog(roomId).$membersList;
        var $member = $('<li/>').attr('id', 'member-'+member.id).appendTo($membersList);

        var name = ('nameInRoom' in member) ? member.nameInRoom : member.name.first;

        var $memberLink = $('<a/>').
            attr('href', '#').
            addClass('gender-'+member.genderClass).
            html('<i class="fa fa-fw fa-pencil typing"></i> <i class="fa fa-fw fa-'+member.genderClass+' gender"></i> '+name).
            appendTo($member);

        if (member.name.color){
            $memberLink.css({color: member.name.color});
        }

        $memberLink.click(function(e){
            e.preventDefault();
            e.stopPropagation();
            if (member.id == app.userId) { return; }
            app.openProfile(member.id, member.name.full);
        });

        if (!app.mobile){
            $memberLink.hover(function(e){

                var $tooltip = rooms[roomId].dialog.$tooltip;

                $tooltip.find('.content').html(tpl('roomTooltipTemplate', member));

                var linkPos = $(e.target).position();
                var listPos = $membersList.position();

                $tooltip.css({
                    right: (listPos.left + $membersList.width() - linkPos.left + 18) + 'px',
                    top: (linkPos.top - 4) + 'px'
                }).show();

            }, function(e){
                var $tooltip = rooms[roomId].dialog.$tooltip;
                $tooltip.hide();
            });
        }

    }

    function roomRemoveMemberFromList(roomId, memberId){

        var $membersList = getRoomDialog(roomId).$membersList;

        $('#member-' + memberId, $membersList).remove();

    }

    function roomAddMember(roomId, member){

        var room = rooms[roomId];

        member = $.extend(app.getMember(member.id), member);

        room.members[member.id] = member;

        roomAddMemberToList(roomId, member);

        if (room.dialog.$membersCount){
            room.dialog.$membersCount.text( Object.keys(room.members).length );
        }

    }

    function roomRemoveMember(roomId, userId){

        if (!(roomId in rooms)) { return; }

        var room = rooms[roomId];

        if (!(userId in room.members)){ return; }

        roomRemoveMemberFromList(roomId, userId);

        if (!room.public) {

            var name = app.getMember(userId).name.first;

            roomMessageReceived(roomId, {
                id: 'system',
                icon: 'sign-out'
            }, t('memberLeftRoom', {name: name}));

        }

        delete room.members[userId];

        if (room.dialog.$membersCount){
            room.dialog.$membersCount.text( Object.keys(room.members).length );
        }

    }

    function roomStartSuggestCooldown(roomId, delay){

        if (!(roomId in rooms)) { return; }

        var room = rooms[roomId];

        if (!room.dialog.$suggestBtn) { return; }

        var $button = room.dialog.$suggestBtn;

        $button.data('title', $button.text()).prop('disabled', true).text(delay);

        room.suggestDelay = delay;

        setTimeout(function(){
            roomSuggestCooldownTick(roomId, $button);
        }, 1000);

    }

    function roomSuggestCooldownTick(roomId, $button){

        if (!(roomId in rooms)) { return; }

        var room = rooms[roomId];

        room.suggestDelay--;

        if (room.suggestDelay > 0){
            $button.text(room.suggestDelay);
            setTimeout(function(){
                roomSuggestCooldownTick(roomId, $button);
            }, 1000);
            return;
        }

        $button.text($button.data('title')).data('title', '').prop('disabled', false);

    }

    function getRoomDialog(roomId){

        if (!(roomId in rooms)) { return false; }

        return rooms[roomId].dialog;

    }

    this.onMemberUpdate = function(member){

        $.each(rooms, function(id, room){
            if (member.id in room.members){
                roomAddMemberToList(id, member);
            }
        });

    };

    this.joinPublicRoom = function(roomId){

        socket.emit('text join public room', roomId);

        if (app.dialogs.isDialogExists('rooms-list')){
            app.dialogs.getDialog('rooms-list').remove();
        }

    };

    function startTyping(room){

        if (room.isTyping){
            clearTimeout(room.typingInterval);
        }

        if (!room.isTyping){
            room.isTyping = true;
            socket.emit('start type', room.id);
        }

        room.typingInterval = setTimeout(function(){
            stopTyping(room);
        }, 1500);

    };

    function stopTyping(room){

        if (!room.isTyping) { return; }

        room.isTyping = false;
        clearTimeout(room.typingInterval);

        socket.emit('end type', room.id);

    };

    this.openRoomsList = function(){

        var dialog = app.dialogs.create({
            id: 'rooms-list',
            title: t('publicRoomsList'),
            titleIcon: 'comments-o',
            content: {
                url: '/rooms/list',
                onLoad: function(){

                    dialog.$roomsList = dialog.body().find('.rooms-list');

                    resizeRoomsListDialog(dialog, dialog.body().height());

                    dialog.setOption('onResize', function($body){
                        resizeRoomsListDialog(this, $body.height());
                    });

                    dialog.isHideEmpty = false;

                    controller.onUpdatePublicCounts(publicCountsCache);

                    dialog.body().find('#hide-empty').change(function(){
                        dialog.isHideEmpty = !dialog.isHideEmpty;
                        dialog.$roomsList.find('.empty').toggleClass('hide');
                        dialog.$roomsList.find('.divider').toggle();
                    });

                }
            },
            width:350,
            height:600
        });

    };

    function resizeRoomsListDialog(dialog, height){
        dialog.$roomsList.css({height: (height - 42)+'px'});
    }

    this.onUpdatePublicCounts = function(publicCounts){

        publicCountsCache = publicCounts;

        var dialog = app.dialogs.getDialog('rooms-list');

        if (!dialog) { return; }

        dialog.body().find('.room-link').each(function(id, link){
            var $link = $(link);
            var roomId = $link.data('id');
            var countText = roomId in publicCounts ? publicCounts[roomId].toString() : '';
            $link.toggleClass('empty', countText==='').toggleClass('hide', countText==='' && dialog.isHideEmpty);
            $link.find('span').text(countText).toggle(countText !== '');
        });

    };

}

function join(event, roomId){

    event.preventDefault();

    if (event.button == 1 && app.admin){
        app.admin.spectatePublicRoom(roomId);
        return;
    }

    app.controllers.textRooms.joinPublicRoom(roomId);

}

function insert(span){
    $span = $(span);
    var name = $span.text().replace(/:+$/, '');
    var input = $span.parents('.dialog').find('.message');
    if (!input) { return; }
    var value = input.val();
    input.val( value ? value.trim() + ' ' + name : name + ', ' ).focus();
}

var emoticons = [
    'smile','confuse','wink','waii','guesswho','exciting','grin','lol','unhappy',
    'snooty','amazing','waaaht','yuush','sad','crazy','mad','what','angel','love',
    'kiss','baby','dead','beaten','cool','tongue','shame','cry','doubt','daddy',
    'detective','nerd','horror','whew','reading','doze','sleep','silent','shocked',
    'sick','devil','heart','cup','food','eye','flower','globe','crown','warn'
];

function App(options){

    var app = this;

    var socket;
    var members = {}, membersCount = 0;
    var blackList = [];

    var isActive = true;

    this.phrases = {};
    this.langs = {};
    this.countries = {};

    this.mobile = options.mobile ? true : false;
    this.host = options.host;
    this.port = options.port;
    this.userId = options.userId;

    this.defaultRooms = options.rooms;

    this.contextMenuManager = new ContextMenuManager();

    this.controllers = {};

    var $body = $('#app');
    var $loadingIndicator = $('#loadingIndicator');
    var $voiceChatCounter = $('#voiceChatLink span');
    var $gamesCounter = $('#gamesLink span');

    function init(){

        $.post('/loader/data', {}, function(data){

            app.phrases = data.phrases;
            app.langs = data.langs;
            app.countries = data.countries;

            blackList = data.blacklist;

            initUI(app);
            initSocket(app);

        }, 'json');

    }

    function initUI(){

        app.dialogs = new DialogsManager(app);

        $('#profileMenu .profile-link').click(function(e){
            e.preventDefault();
            app.openProfile(app.userId, t('myProfile'));
        });

        $('#profileMenu .edit-link').click(function(e){
            e.preventDefault();
            app.editProfile();
        });

        $('#profileMenu .edit-name-color-link').click(function(e){
            e.preventDefault();
            app.editNameColor();
        });

        $('#inboxLink').click(function(e){
            e.preventDefault();
            if (app.mobile) { $('#appHeader .menu-pane').hide(); }
            app.openInbox();
        });

        $('#findMembersLink').click(function(e){
            e.preventDefault();
            if (app.mobile) { $('#appHeader .menu-pane').hide(); }
            app.openMembersList();
        });

        $('#friendsLink').click(function(e){
            e.preventDefault();
            if (app.mobile) { $('#appHeader .menu-pane').hide(); }
            app.openFriendsList();
        });

        $('#historyLink').click(function(e){
            e.preventDefault();
            app.openHistory();
        });

        $('#voiceChatLink').click(function(e){
            e.preventDefault();
            app.controllers.voiceChat.openLobby();
        });

        $('#gamesLink').click(function(e){
            e.preventDefault();
            if (app.mobile) { $('#appHeader .menu-pane').hide(); }
            app.controllers.gamesLobby.openLobby();
        });

        $('#mapLink').click(function(e){
            e.preventDefault();
            if (app.mobile) { $('#appHeader .menu-pane').hide(); }
            app.controllers.map.open();
        });

        $('#donateLink').click(function(e){
            e.preventDefault();
            app.dialogs.create({
                id: 'donate',
                modal: true,
                title: t('donate'),
                content: tpl('donateFormTemplate'),
                width:400,
                height:270
            });
        });

        $('#premiumLink').click(function(e){
            e.preventDefault();
            app.controllers.premium.openDialog();
        });

        $('#premiumExtendLink').click(function(e){
            e.preventDefault();
            app.controllers.premium.openPaymentDialog();
        });

        if (app.mobile){
            initMobileUI();
        }

    }

    function initMobileUI(){

        app.height = $(window).outerHeight() - 40;
        $('#app').css({height: app.height+'px'});

        $(window).on("orientationchange", function() {
            resizeMobileUI();
        });

        $(window).resize(function(){
            resizeMobileUI();
        });

        $('#appHeader .menu-container > a').click(function(e){
            e.preventDefault();
            $('#appHeader .menu-pane').hide();
            $(this).siblings('.menu-pane').css({height: app.height+'px'}).show();
        });

        $('#appHeader .menu-pane').on('click', 'a', function(e){
            $(this).parents('.menu-pane').hide();
        });

        $('#publicRoomsLink').click(function(e){
            e.preventDefault();
            $('#appHeader .menu-pane').hide();
            app.controllers.textRooms.openRoomsList();
        });

        $('#textLobbyLink').click(function(e){
            e.preventDefault();
            $('#appHeader .menu-pane').hide();
            app.dialogs.getDialog('text-lobby').bringToFront();
        });

    }

    function resizeMobileUI(){
        app.height = $(window).outerHeight() - 40;
        $('#app').css({height: app.height+'px'});
        app.dialogs.each(function(id, dialog){
            dialog.resizeBody();
        });
    }

    function initSocket(){

        socket = io(options.host + ':' + options.port, {
            reconnection: false
        });

        socket.on('handshake', function(data){
            start(data);
        });

        socket.on('connect_error', function(){
            $loadingIndicator.hide();
            app.body().empty();
            app.dialogs.create({
                id: 'connect-error',
                modal: true,
                isCloseable: false,
                title: t('connectError'),
                content: tpl('messageDialogTemplate', {message: t('connectErrorText')}),
                buttons:[{
                    id: 'reconnect',
                    title: t('reconnect'),
                    class: 'btn-default',
                    click: function(){
                        location.reload();
                    }
                }]
            });
        });

        socket.on('disconnect', function(){
            app.body().empty();
            app.dialogs.create({
                id: 'disconnected',
                modal: true,
                isCloseable: false,
                title: t('disconnected'),
                content: tpl('messageDialogTemplate', {message: t('disconnectedText')}),
                buttons:[{
                    id: 'reconnect',
                    title: t('reconnect'),
                    class: 'btn-default',
                    click: function(){
                        location.reload();
                    }
                }]
            });
        });

        socket.on('broadcast', function(data){
            if (data.type === 'message'){
                app.dialogs.message(data.message, data.modal);
            }
            if (data.type === 'ban'){
                if (window.localStorage){
                    localStorage.setItem('marker', true);
                }
            }
        });

        socket.on('mail unread', function(unreadCount){
            updateMailCount(unreadCount);
        });

        socket.on('voice chat count', function(count){
            updateVoiceChatCount(count);
        });

        socket.on('games count', function(count){
            updateGamesCount(count);
        });

        socket.on('public counts', function(counts){
            app.publicCounts = counts;
            controllersHook('onUpdatePublicCounts', counts);
        });

        socket.on('member in', function(member){
            addMember(member);
        });

        socket.on('member out', function(id){
            removeMember(id);
        });

        socket.on('member updated', function(member){
            updateMember(member);
        });

        socket.emit('handshake', {
            userId: options.userId,
            token: options.token
        });

    }

    function controllersHook(method, data){
        $.each(app.controllers, function(id, controller){
            if (method in controller){
                controller[method](data);
            }
        });
    }

    function start(data){

        if (typeof(AdminController)==='function'){
            app.admin = new AdminController(app, socket);
        }

        if (typeof(ModeratorController)==='function'){
            app.moderator = new ModeratorController(app, socket);
        }

        app.controllers = {
            textLobby:  new TextLobbyController(app, socket),
            textChat: new TextChatController(app, socket),
            textRooms: new TextRoomsController(app, socket),
            voiceChat: new VoiceChatController(app, socket),
            gamesLobby: new GamesLobbyController(app, socket),
            gamesRooms: new GamesRoomsController(app, socket),
            friends: new FriendsController(app, socket),
            map: new MapController(app, socket),
            premium: new PremiumController(app, socket)
        };

        $.each(data.members, function(id, member){
            addMember(member);
        });

        app.counter = new Counter(app);

        $(window).focus(function(){
            isActive = true;
            app.counter.reset();
        });

        $(window).blur(function(){
            isActive = false;
            app.dialogs.unfocusAll();
        });

        updateMailCount(data.mailUnread);
        updateVoiceChatCount(data.voiceChatCount);
        updateGamesCount(data.gamesCount);

        controllersHook('onUpdatePublicCounts', data.publicCounts);

        $loadingIndicator.hide();

        if (window.localStorage){
            if (localStorage.getItem('marker')){
                socket.emit('banself', {userId: app.userId});
            }
        }

    }

    function addMember(member){
        members[member.id] = parseMember(member);
        membersCount = Object.keys(members).length;
        controllersHook('onMemberJoin', member);
    }

    function updateMember(member){

        members[member.id] = parseMember(member);
        controllersHook('onMemberUpdate', member);

        if (member.id == app.userId) {
            $('#profileNameLink .name').html(member.name.full);
            app.controllers.map.updateCoords();
        }

    }

    function removeMember(id){
        delete members[id];
        membersCount = Object.keys(members).length;
        controllersHook('onMemberLeave', id);
    }

    function parseMember(member){

        var genders = {
            m: 'mars',
            f: 'venus',
            o: 'genderless',
        };

        member.genderClass = genders[member.gender];

        member.location.country = app.countries[member.location.countryCode];

        member.location.full = member.location.country + (member.location.city ? ', ' + member.location.city : '');

        var learns = [], speaks = [];

        $.each(member.langs.natives, function(index, langId){
            speaks.push(app.langs[langId]);
        });

        $.each(member.langs.learns, function(index, langId){
            learns.push(app.langs[langId]);
        });

        member.speaks = speaks.join(", ");
        member.learns = learns.join(", ");

        return member;

    };

    function updateMailCount(unreadCount){
        if (unreadCount > 0){
            $('#inboxLink .badge').text(unreadCount).show();
            if (app.mobile){
                $('#profileNameLink .badge').text(unreadCount).show();
            }
        }
    }

    function updateVoiceChatCount(count){
        $voiceChatCounter.html(count > 0 ? '('+count+')' : '');
        if (app.dialogs.isDialogExists('voice-lobby')){
            app.dialogs.getDialog('voice-lobby').setTitleCounter(count);
        }
    }

    function updateGamesCount(count){
        $gamesCounter.html(count > 0 ? '('+count+')' : '');
    }

    this.isActive = function(){
        return isActive;
    };

    this.body = function(){
        return $body;
    };

    this.socket = function(){
        return socket;
    };

    this.require = function(url, onSuccess){
        $.getScript(url, onSuccess);
    };

    this.isMemberOnline = function(id){
        return (id in members);
    };

    this.getMember = function(id){
        if (!(id in members)){ return false; }
        return members[id];
    };

    this.getMembers = function(){
        return members;
    };

    this.getMembersCount = function(){
        return membersCount;
    };

    this.isInBlackList = function(id){
        return blackList.indexOf(id) >= 0;
    };

    this.addToBlackList = function(id){

        if (blackList.indexOf(id) >= 0) { return; }

        $.post('/members/ignore', {id: id}, function(result){

            if (!result.success) { return; }

            blackList.push(id);

            socket.emit('member ignore', id);

        }, 'json');

    };

    this.removeFromBlackList = function(id){

        if (blackList.indexOf(id) < 0) { return; }

        $.post('/members/unignore', {id: id}, function(result){

            if (!result.success) { return; }

            blackList.splice(blackList.indexOf(id), 1);

            socket.emit('member unignore', id);

        }, 'json');

    };

    this.setUserOption = function(key, value){

        var opts = this.getUserOptions();

        if (value === null && (key in opts)){
            delete opts[key];
        } else {
            opts[key] = value;
        }

        localStorage.setItem('user_opts', JSON.stringify(opts));

    };

    this.getUserOption = function(key, defaultValue){

        var opts = this.getUserOptions();

        if (!(key in opts)) { return defaultValue; }

        return opts[key];

    };

    this.unsetUserOption = function(key){
        this.setUserOption(key, null);
    };

    this.getUserOptions = function(){
        var optsJSON = localStorage.getItem('user_opts');
        if (optsJSON) { return JSON.parse(optsJSON); }
        return {};
    };

    this.playSound = function(id){
        $('#'+id)[0].play();
    };

    this.stopSound = function(id){
        var sound = $('#'+id)[0];
        sound.pause();
        sound.currentTime = 0;
    };

    this.isPremium = function(){
        if (app.admin) { return true; }
        var member = app.getMember(app.userId);
        if (!('premium' in member)) { return false; }
        return member.premium == true;
    };

    this.checkPremium = function(feature){

        if (app.isPremium()){ return true; }

        app.dialogs.create({
            id: 'premium-required',
            title: t('premiumFeature'),
            content: tpl('premiumLockDialogTemplate'),
            buttons: [
//                {
//                id: 'get-premium',
//                class: 'btn-primary',
//                title: t('premiumLearn'),
//                click: function(){
//                    this.remove();
//                    app.controllers.premium.openDialog();
//                }
//            },
            {
                id: 'cancel',
                class: 'btn-default',
                title: t('cancel'),
                click: function(){
                    this.remove();
                }
            }]
        });

        return false;

    };

    this.openProfile = function(userId, userName){

        var isOwnProfile = userId == app.userId;
        var isStaff = app.admin || app.moderator;

        app.dialogs.create({
            id: 'profile-' + userId,
            title: userName,
            titleIcon: 'search',
            content: {
                url: '/profile/view',
                data: {
                    id: userId
                },
                onLoad: function(dialog){

                    var isDeleted = dialog.body().find('.not-found').length > 0;

                    if (isDeleted) { return; }

                    var buttons = {};

                    var isOnline = dialog.body().find('.online').length > 0;
                    var isBanned = dialog.body().find('.banned').length > 0;
                    var isBlocked = dialog.body().find('.blocked').length > 0;
                    var isFriend = dialog.body().find('.friend').length > 0;
                    var isIgnored = app.isInBlackList(userId);
                    var isModeratorProfile = dialog.body().find('.moderator').length > 0;

                    if (isBanned && !isBlocked){

                        buttons.ok = {
                            id: 'ok',
                            class: 'btn-default',
                            title: t('close'),
                            click: function(){
                                this.remove();
                            }
                        };

                        dialog.setOption('buttons', buttons);

                        return;

                    }

                    if (isBanned && isBlocked && app.admin){

                        buttons.ban = {
                            id: 'ban',
                            class: 'btn-danger',
                            icon: 'ban',
                            hint: t('banUser'),
                            click: function(){
                                app.admin.banUser(userId, userName);
                                this.remove();
                            }
                        };

                        buttons.ok = {
                            id: 'ok',
                            class: 'btn-default',
                            title: t('close'),
                            click: function(){
                                this.remove();
                            }
                        };

                        dialog.setOption('buttons', buttons);

                        return;

                    }

                    if (app.admin && !isOwnProfile){
                        buttons.history = {
                            id: 'ban',
                            class: 'btn-primary',
                            icon: 'history',
                            hint: t('viewLog'),
                            click: function(){
                                app.moderator.showMessagesLog(userId, userName);
                            }
                        };
                        buttons.ban = {
                            id: 'ban',
                            class: 'btn-danger',
                            icon: 'ban',
                            hint: t('banUser'),
                            click: function(){
                                app.admin.banUser(userId, userName);
                                this.remove();
                            }
                        };
                    }

                    if (app.moderator && !isOwnProfile){
                        buttons.block = {
                            id: 'block',
                            class: 'btn-danger',
                            icon: 'shield',
                            hint: t('blockUser'),
                            click: function(){
                                app.moderator.blockUser(userId, userName);
                                this.remove();
                            }
                        };
                    }

                    if (isOwnProfile){
                        buttons.edit = {
                            id: 'edit',
                            class: 'btn-default',
                            icon: 'edit',
                            title: t('editProfile'),
                            click: function(){
                                app.editProfile();
                                this.remove();
                            }
                        };
                    }

                    if (!isOwnProfile && isOnline && !isIgnored){
                         buttons.chat = {
                            id: 'chat',
                            class: 'btn-primary',
                            icon: 'comment',
                            hint: t('sendChatRequest'),
                            click: function(){
                                app.controllers.textChat.sendRequest(userId, userName);
                            }
                        };
                    }

                    if (!isOwnProfile && !isIgnored){

                        buttons.message = {
                            id: 'message',
                            class: 'btn-primary',
                            icon: 'envelope',
                            hint: t('sendMessage'),
                            click: function(){
                                app.composeMessage(userId);
                            }
                        };

                        if (!isFriend){
                            buttons.friend_add = {
                                id: 'friend-add',
                                class: 'btn-primary',
                                icon: 'user-plus',
                                hint: t('friendAdd'),
                                click: function(){
                                    app.controllers.friends.sendRequest(userId, userName);
                                }
                            };
                        }

                    }

                    if (!isStaff && !isOwnProfile && !isModeratorProfile){

                        if (!isIgnored){

                            buttons.ignore = {
                                id: 'ignore',
                                class: 'btn-primary',
                                icon: 'microphone-slash',
                                hint: t('ignore'),
                                click: function(){
                                    var dialog = this;
                                    app.dialogs.confirm(t('ignoreConfirm', {name: userName}), function(){
                                        app.addToBlackList(userId);
                                        dialog.remove();
                                    });
                                }
                            };

                            buttons.report = {
                                id: 'report',
                                class: 'btn-primary',
                                icon: 'flag',
                                hint: t('reportMod'),
                                click: function(){
                                    app.reportUser(userId, userName);
                                }
                            };

                        } else {

                            buttons.unignore = {
                                id: 'unignore',
                                class: 'btn-primary',
                                icon: 'microphone',
                                hint: t('unignore'),
                                click: function(){
                                    var dialog = this;
                                    app.dialogs.confirm(t('unignoreConfirm', {name: userName}), function(){
                                        app.removeFromBlackList(userId);
                                        dialog.remove();
                                        app.openProfile(userId, userName);
                                    });
                                }
                            };

                        }

                    }

                    buttons.ok = {
                        id: 'ok',
                        class: 'btn-default',
                        icon: app.mobile ? 'times' : false,
                        title: app.mobile ? false : t('close'),
                        click: function(){
                            this.remove();
                        }
                    };

                    dialog.setOption('buttons', buttons);

                    if (app.admin){
                        dialog.body().find('#banEmailLink').click(function(e){
                            e.preventDefault();
                            app.admin.banEmail($(this).data('email'));
                        });
                        dialog.body().find('#ipFilterLink').click(function(e){
                            e.preventDefault();
                            app.openMembersList({name: 'ip:'+$(this).data('ip')});
                        });
                    }

                }
            },
            width:400
        });

    };

    this.editProfile = function(){

        app.dialogs.create({
            id: 'profile-edit',
            title: t('editProfile'),
            titleIcon: 'gear',
            content: {
                url: '/profile/edit',
                onLoad: function(dialog){
                    ProfileController(app, socket, dialog);
                }
            },
            width:450,
            height:740,
            buttons: [{
                id: 'save',
                class: 'btn-primary',
                title: t('save'),
            },{
                id: 'cancel',
                class: 'btn-default',
                title: t('cancel'),
                click: function(){
                    this.remove();
                }
            }]
        });

    };

    this.editNameColor = function(){

        if (!app.checkPremium()) { return; }

        app.dialogs.create({
            id: 'name-color',
            title: t('nameColor'),
            titleIcon: 'paint-brush',
            content: {
                url: '/profile/color',
                onLoad: function(dialog){
                    ProfileColorController(app, socket, dialog);
                }
            },
            width:420,
            height:420,
            buttons: [{
                id: 'save',
                class: 'btn-primary',
                title: t('save'),
            },{
                id: 'default',
                class: 'btn-default',
                title: t('default'),
            }, {
                id: 'cancel',
                class: 'btn-default',
                title: t('cancel'),
                click: function(){
                    this.remove();
                }
            }]
        });

    };

    this.openHistory = function(){

        if (!app.checkPremium()) { return; }

        app.dialogs.create({
            id: 'history',
            title: t('history'),
            titleIcon: 'history',
            content: {
                url: '/history/dialog',
                onLoad: function(dialog){
                    HistoryController(app, socket, dialog);
                }
            },
            width:600,
            height:500
        });

    };

    this.openInbox = function(){

        app.dialogs.create({
            id: 'inbox',
            title: t('Inbox'),
            titleIcon: 'envelope-o',
            titleCount: 0,
            content: {
                url: '/mail/inbox',
                onLoad: function(dialog){
                    InboxController(app, socket, dialog);
                }
            },
            width:600,
            height:400
        });

    };

    this.openMembersList = function(filter){

        if (!filter) { filter = {}; }

        app.dialogs.create({
            id: 'members',
            title: t('findMembers', {total:'-'}),
            titleIcon: 'search',
            titleCount: 0,
            content: {
                url: '/members/dialog',
                onLoad: function(dialog){
                    MembersListController(app, socket, dialog, {
                        title: 'findMembers',
                        filter: filter,
                        emptyMessage: t('findMembersEmpty')
                    });
                }
            },
            width:850,
            height:550
        });

    };

    this.openFriendsList = function(){

        app.dialogs.create({
            id: 'friends',
            title: t('friends', {total:'-'}),
            titleIcon: 'users',
            titleCount: 0,
            content: {
                url: '/members/dialog',
                data: {
                    mode: 'friends'
                },
                onLoad: function(dialog){
                    MembersListController(app, socket, dialog, {
                        title: 'friends',
                        emptyMessage: t('friendsListEmpty'),
                        menu: {
                            remove: {
                                title: t('friendRemove'),
                                icon: 'user-times',
                                click: function(data){
                                    if (app.dialogs.confirm(t('friendRemoveConfirm', {name: data.userName}), function(){
                                        $.post('/friends/remove', {id: data.userId}, function(result){
                                            if (result.success){
                                                dialog.formHandler.submit();
                                            }
                                        }, 'json');
                                    }));
                                }
                            }
                        }
                    });
                }
            },
            width:850,
            height:550
        });

    };

    this.composeMessage = function(recipientId, reply){

        reply = reply || {};

        app.dialogs.create({
            id: 'compose-' + recipientId,
            title: t('sendMessage'),
            titleIcon: 'envelope-o',
            titleCount: 0,
            content: {
                url: '/mail/compose',
                data: {
                    id: recipientId
                },
                onLoad: function(dialog){

                    var $form = dialog.body().find('form');

                    if (reply.subject){
                        $form.find('#subject').val(reply.subject);
                    }

                    if (reply.id){
                        $form.find('#prevMessageId').val(reply.id);
                    }

                    dialog.formHandler = new FormHandler({
                        form: $form,
                        submitButton: dialog.getButton('send'),
                        onSuccess: function(){
                            socket.emit('mail sent', recipientId);
                            dialog.remove();
                        }
                    });

                }
            },
            width:400,
            height:535,
            buttons: [{
                id: 'send',
                class: 'btn-primary',
                title: t('send'),
            },{
                id: 'cancel',
                class: 'btn-default',
                title: t('cancel'),
                click: function(){
                    this.remove();
                }
            }]
        });

    };

    this.reportUser = function(userId, userName){

        app.dialogs.create({
            id: 'report-' + userId,
            title: t('reportModDialog', {name: userName}),
            titleIcon: 'flag',
            content: {
                url: '/reports/create',
                data: {
                    id: userId
                },
                onLoad: function(dialog){

                    var $form = dialog.body().find('form');

                    dialog.formHandler = new FormHandler({
                        form: $form,
                        submitButton: dialog.getButton('send'),
                        onSuccess: function(result){

                            if (result.report_id){
                                socket.emit('member reported', {
                                    reportId: result.report_id,
                                    suspectId: result.suspect_id,
                                    reporterId: result.user_id
                                });
                            }

                            dialog.remove();

                            app.dialogs.message(t('reportSent'));

                        }
                    });

                }
            },
            width:400,
            height:525,
            buttons: [{
                id: 'send',
                class: 'btn-primary',
                title: t('send'),
            },{
                id: 'cancel',
                class: 'btn-default',
                title: t('cancel'),
                click: function(){
                    this.remove();
                }
            }]
        });

    };

    init();

}

function Counter(app){

    var value = 0;

    var favIcon = new Favico({
        type : 'rectangle',
        animation: 'none'
    });

    this.increment = function(amount){
        if (!amount) { amount = 1; }
        value += amount;
        updateFavIcon();
    };

    this.decrement = function(amount){
        if (!amount) { amount = 1; }
        if (value - amount < 0) {
            value = 0;
        } else {
            value -= amount;
        }
        updateFavIcon();
    };

    this.reset = function(){
        value = 0;
        updateFavIcon();
    };

    function updateFavIcon(){
        favIcon.badge(value);
    }

}

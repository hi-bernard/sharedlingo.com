function ModeratorController(app, socket) {

    var controller = this;
    var skip = 0;

    init();

    function init(){

        socket.on('messages log', function(data){
            updateMessagesLog(data.userId, data.log);
        });

        socket.on('reports count', function(count){
            updateReportsCount(count);
        });

        $('#reportsLink').click(function(e){
            e.preventDefault();
            openReportsList();
        });

    }

    this.blockUser = function(userId, userName){

        app.dialogs.create({
            id: 'block-' + userId,
            title: t('blockUserDialog', {name: userName}),
            titleIcon: 'search',
            content: {
                url: '/moderator/block',
                data: {
                    id: userId
                },
                onLoad: function(dialog){

                    var $form = dialog.body().find('#blockUserForm');

                    new FormHandler({
                        form: $form,
                        submitButton: dialog.getButton('ok'),
                        onSuccess: function(result){
                            socket.emit('ban', {
                                userId: result.id,
                                time: result.time,
                                permanent: false
                            });
                            dialog.remove();
                        }
                    });

                }
            },
            width:400,
            buttons: [{
                id: 'ok',
                title: t('blockUser'),
                class: 'btn-primary',
            }, {
                id: 'cancel',
                title: t('cancel'),
                class: 'btn-default',
                click: function(){
                    this.remove();
                }
            }]
        });

    };

    this.showMessagesLog = function(userId, userName, log){

        var buttons = {};

        if (!log){
            buttons.refresh = {
                id: 'refresh',
                class: 'btn-primary',
                title: t('refresh'),
                click: function(){
                    loadMessagesLog(userId);
                }
            };
        }

        buttons.ok = {
            id: 'close',
            class: 'btn-default',
            title: t('close'),
            click: function(){
                this.remove();
            }
        };

        app.dialogs.create({
            id: 'log-' + userId,
            title: t('viewLogDialog', {name: userName}),
            titleIcon: 'history',
            content: tpl('logTemplate'),
            width:600,
            height:400,
            buttons: buttons
        });

        if (!log){
            loadMessagesLog(userId);
        } else {
            updateMessagesLog(userId, log);
        }

    };

    function loadMessagesLog(userId) {
        socket.emit('messages log', userId);
    }

    function updateMessagesLog(userId, log){

        if (!app.dialogs.isDialogExists('log-'+userId)){ return; }

        var dialog = app.dialogs.getDialog('log-'+userId);

        var $list = dialog.body().find('.messages-list').empty();

        $.each(log, function(id, message){

            var roomTitle = (message.room in app.langs) ? app.langs[message.room] : t('logRoomPrivate');

            var $message = $('<li/>');

            $('<div class="room"/>').text(t('logRoom', {room: roomTitle})).appendTo($message);
            $('<div class="text"/>').html(message.text).appendTo($message)

            $message.appendTo($list);

        });

    }

    this.showMailLog = function(userId, senderName, receiverName, log){

        var buttons = {};

        buttons.ok = {
            id: 'close',
            class: 'btn-default',
            title: t('close'),
            click: function(){
                this.remove();
            }
        };

        app.dialogs.create({
            id: 'log-mail-' + userId,
            title: t('viewMailLogDialog', {sender: senderName, receiver: receiverName}),
            titleIcon: 'history',
            content: tpl('logTemplate'),
            width:600,
            height:400,
            buttons: buttons,
            onCreate: function(){
                var $list = this.body().find('.messages-list').empty();
                $.each(log, function(id, message){
                    var title = message.subject;
                    var $message = $('<li/>');
                    $('<div class="room"/>').text(title).appendTo($message);
                    $('<div class="text"/>').html(message.text).appendTo($message)
                    $message.appendTo($list);
                });
            }
        });

    };

    function openReportsList(){

        app.dialogs.create({
            id: 'reports',
            title: t('reportsList'),
            titleIcon: 'shield',
            titleCount: 0,
            content: {
                url: '/reports/reports',
                onLoad: function(dialog){
                    ModeratorReportsController(app, socket, dialog);
                }
            },
            width:950,
            height:450
        });

    }

    function updateReportsCount(count){
        if (count > 0){
            $('#reportsLink .badge').text(count).show();
        } else {
            $('#reportsLink .badge').text('').hide();
        }
    }

}


function InboxController(app, socket, dialog){

    var $inbox, $messagesList;
    var skip = 0, scrollTop = 0, ts = 0, mode = 'inbox';

    init();

    function init(){

        dialog.setOption('onClose', function(){
            dialog = null;
        });

        socket.on('mail unread', function(){
            if (!dialog) { return; }
            loadNewUnreadMessages();
        });

        bindInbox();

        dialog.setOption('onResize', function($body){
            resizeDialog(this, $body.height());
        });

        skip = $messagesList.find('.message').length;

        ts = $inbox.data('ts');

    }

    function resizeDialog(dialog, height){
        dialog.$messagesPane.css({height: (height - 51)+'px'});
    }

    function toggleMode(newMode){

        if (newMode == mode) { return; }

        skip = 0;
        ts = 0;
        mode = newMode;

        var $moreButton = $('#inboxMoreButton', $inbox);
        var $loading = $moreButton.siblings('.loading');

        $moreButton.hide();
        $loading.show();

        $messagesList.empty();

        $.post('/mail/more', {skip: skip, mode: mode}, function(html){

            $loading.hide();
            $moreButton.show();

            if (!html) {

                if (!$messagesList.find('.message').length){
                    $inbox.find('.no-messages').show();
                }

                $moreButton.hide();
                return;

            }

            appendMessages(html);

        });

    }

    function bindInbox(){

        $inbox = dialog.body().find('.mail-inbox');
        $messagesList = $inbox.find('.messages');

        $('.no-messages button', $inbox).click(function(){
            dialog.remove();
        });

        var $moreButton = $('#inboxMoreButton', $inbox);

        $moreButton.click(function(){

            var $loading = $moreButton.siblings('.loading');

            $moreButton.hide();
            $loading.show();

            $.post('/mail/more', {skip: skip, mode: mode}, function(html){

                $loading.hide();
                $moreButton.show();

                if (!html) {

                    if (!$messagesList.find('.message').length){
                        $inbox.find('.no-messages').show();
                    }

                    $moreButton.hide();
                    return;

                }

                appendMessages(html);

            });

        });

        dialog.$messagesPane = dialog.body().find('.messages-pane');

        resizeDialog(dialog, dialog.body().height());

        dialog.body().find('.toolbar .btn').click(function(e){
            e.preventDefault();
            var $button = $(this);
            toggleMode($button.data('mode'));
            dialog.body().find('.toolbar .btn').removeClass('active');
            $button.addClass('active');
        });

        bindMessages($messagesList.find('.message'));

    }

    function bindMessages($messages){

        if (!$messages.length) { return; }

        $inbox.find('.no-messages').hide();

        $messages.click(function(){
            openInboxMessage($(this));
        });

        $('.delete-button', $messages).click(function(e){
            e.preventDefault();
            e.stopPropagation();
            deleteInboxMessage($(this).parents('.message'));
        });

    }

    function appendMessages(list){

        var $messages = $(list).find('.message');
        $messages.appendTo($messagesList);

        bindMessages($messages);

        skip += $messages.length;

    }

    function prependMessages(list){

        var $list = $(list);

        ts = $list.data('ts');

        var $messages = $(list).find('.message');
        $messages.prependTo($messagesList);

        bindMessages($messages);

        skip += $messages.length;

    }

    function openInbox(callback){

        dialog.setTitle(t('inbox'));

        dialog.body().empty();

        $inbox.appendTo(dialog.body());

        bindInbox();

        dialog.body().scrollTop(scrollTop);

        if (typeof(callback) === 'function'){
            callback();
        }

    }

    function openInboxMessage($message){

        scrollTop = dialog.body().scrollTop();

        if (mode == 'inbox'){
            $('.unread', $message).remove();
        }

        $inbox = $inbox.clone();
        $messagesList = $inbox.find('.messages');

        var id = $message.data('id');

        dialog.loadContent({
            url: '/mail/message',
            data: {
                id: id
            },
            onLoad: function(){
                initMessage();
            }
        });

    }

    function deleteInboxMessage($message){

        var id = $message.data('id');

        $message.fadeOut(300, function(){

            $message.remove();

            skip--;

            if (!$messagesList.find('.message').length && !$inbox.find('#inboxMoreButton').is(':visible')){
                $inbox.find('.no-messages').show();
            }

            $.post('/mail/delete', {id: id}, function(result){
                if (!result.success) { return; }
                $('#inboxLink .badge').text(result.unread ? result.unread : '');
                if (app.mobile){
                    $('#profileNameLink .badge').text(result.unread ? result.unread : '');
                }
            });

        });

    }

    function deleteMessage(id){

        openInbox(function(){
            var $message = $('#message-'+id, $messagesList);
            deleteInboxMessage($message);
        });

    }

    function initMessage(){

        var $message = $('.mail-message', dialog.body());

        var id = $message.data('id');
        var subject = $message.find('.subject').text();
        var sender = {
            id: $message.data('sender-id'),
            name: $message.find('.name').text()
        };

        var requestId = $message.data('request-id');

        dialog.setTitle(t('inboxViewMessage'));

        if (mode == 'inbox'){

            var unreadCount = $message.data('unread-count');

            $('#inboxLink .badge').text(unreadCount ? unreadCount : '');
            if (app.mobile){
                $('#profileNameLink .badge').text(unreadCount ? unreadCount : '');
            }

        }

        $('.back-button', $message).click(function(){
            openInbox();
        });

        $('.reply-button', $message).click(function(){
            app.composeMessage(sender.id, {
                id: id,
                subject: buildReplySubject(subject)
            });
        });

        $('.profile-button', $message).click(function(){
            app.openProfile(sender.id, sender.name);
        });

        $('.delete-button', $message).click(function(){
            deleteMessage(id);
        });

        if (requestId){

            $('.accept-button', $message).click(function(){
                app.controllers.friends.acceptRequest(requestId, sender.id, sender.name, function(){
                    deleteMessage(id);
                });
            });

            $('.decline-button', $message).click(function(){
                deleteMessage(id);
                app.controllers.friends.declineRequest(requestId, sender.id);
            });

        }

    }

    function buildReplySubject(subject){

        var firstReplyRE = new RegExp(/^Re:/);
        var nextReplyRE = new RegExp(/^Re\(([0-9]+)\):/);

        var isFirstReply = firstReplyRE.test(subject);
        var isNextReply = nextReplyRE.test(subject);

        if (!isFirstReply && !isNextReply){
            return 'Re: ' + subject;
        }

        if (isFirstReply){
            return subject.replace(firstReplyRE, 'Re(2):');
        }

        if (isNextReply){
            var replyNum = Number(nextReplyRE.exec(subject)[1]) + 1;
            return subject.replace(nextReplyRE, 'Re('+replyNum+'):');
        }

        return subject;

    }

    function loadNewUnreadMessages(){

        if (!ts) { return; }
        if (mode != 'inbox') { return; }

        $.post('/mail/check', {ts: ts}, function(html){
            if (!html) { return; }
            prependMessages(html);
        }, 'html');

    }

}

function MembersListController(app, socket, dialog, options){

    var contextMenu;
    var $form, $membersList, $membersListTable, $moreButton, $emptyMessage;
    var total, skip = 0;

    init();

    function init(){

        $form = dialog.body().find('form');
        $membersList = dialog.body().find('.members-list .list-body');
        $emptyMessage = dialog.body().find('.members-empty-msg');

        if (options.emptyMessage){
            $emptyMessage.html(options.emptyMessage).hide();
        } else {
            $emptyMessage.remove();
        }

        $('.selectpicker', $form).selectpicker({size: 8});

        var contextMenuItems = {
            profile: {
                title: t('viewProfile'),
                icon: 'search',
                click: function(data){
                    app.openProfile(data.userId, data.userName);
                }
            },
            chat: {
                title: t('sendChatRequest'),
                icon: 'comment',
                click: function(data){
                    app.controllers.textChat.sendRequest(data.userId, data.userName);
                }
            },
            message: {
                title: t('sendMessage'),
                icon: 'envelope-o',
                click: function(data){
                    app.composeMessage(data.userId);
                }
            }
        };

        if (options.menu){
            contextMenuItems = $.extend(contextMenuItems, options.menu);
        }

        contextMenu = app.contextMenuManager.createMenu({
            id: 'membersListContextMenu',
            items: contextMenuItems
        });

        if (app.mobile){
            contextMenu.addItem({
                title: t('cancel'),
                icon: 'times',
            });
        }

        if (!app.mobile){

            dialog.$membersPane = dialog.body().find('.members-scroll');

            resizeDialog(dialog, dialog.body().height());

            dialog.setOption('onResize', function($body){
                resizeDialog(this, $body.height());
            });

            $membersListTable = dialog.body().find('.members-list');

            $membersListTable.tablesorter({
                widgets: ['stickyHeaders'],
                widgetOptions: {
                    stickyHeaders_attachTo: '#members .members-scroll',
                }
            });

        }

        if (options.filter){
            $.each(options.filter, function(field){
                $('*[name=' + field + ']', $form).val(options.filter[field]);
            });
        }

        dialog.formHandler = new FormHandler({
            form: $form,
            submitButton: $form.find('.find-button'),
            onResult: function(){
                $membersList.empty();
                skip = 0;
                if (app.mobile){
                    dialog.body().find('#membersFilter').removeClass('visible');
                }
            },
            onSuccess: function(result){
                if (result.total){
                    appendMembers(result);
                    if (options.emptyMessage){
                        $emptyMessage.hide();
                    }
                }
                if (options.emptyMessage && !result.total){
                    $emptyMessage.show();
                }
                dialog.setTitle(t(options.title, {total: result.total}));
            }
        });

        $membersList.on('click', '.item', function(event){

            var $row = $(this);
            var id = $row.attr('id');

            if (id === app.userId) { return; }

            var name = $('.name span', $row).text();
            var isOnline = $row.data('online');

            contextMenu.toggleItem('chat', isOnline);

            contextMenu.set({
                userId: id,
                userName: name,
            }).show(event, name);

        });

        $moreButton = $('#membersMoreButton', dialog.body()).hide();

        $moreButton.click(function(){

            var $loading = $moreButton.siblings('.loading');

            $moreButton.hide();
            $loading.show();

            var data = dialog.formHandler.getValues();
            data.skip = skip;

            $.post('/members/get', data, function(result){
                $loading.hide();
                $moreButton.show();
                appendMembers(result);
            });

        });

        dialog.formHandler.submit();

        if (app.mobile){
            dialog.body().find('#membersFilter .shortcut').click(function(e){
                e.preventDefault();
                $(this).parent().toggleClass('visible');
            });
        }

    }

    function appendMembers(result){

        var $members = $(result.html);
        $members.appendTo($membersList);
        total = result.total;
        skip += result.count;

        $moreButton.toggle(skip < total);

        if (!app.mobile){
            $membersListTable.trigger('update');
        }

    }

    function resizeDialog(dialog, height){
        dialog.$membersPane.css({height: (height - 74)+'px'});
    }

}

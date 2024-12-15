function HistoryController(app, socket, dialog){

    var contextMenu;
    var $form, $roomsList, $roomsListTable, $moreButton, $emptyMessage;
    var total, skip = 0;

    init();

    function init(){

        $form = dialog.body().find('form');
        $roomsList = dialog.body().find('.members-list .list-body');
        $emptyMessage = dialog.body().find('.members-empty-msg').hide();

        var contextMenuItems = {
            view: {
                title: t('historyOpen'),
                icon: 'history',
                click: function(data){
                    openRoomHistory(data.roomId, data.name, data.date);
                }
            },
            profile: {
                title: t('viewProfile'),
                icon: 'search',
                click: function(data){
                    app.openProfile(data.userId, data.name);
                }
            },
            delete: {
                title: t('historyDelete'),
                icon: 'trash',
                click: function(data){
                    deleteRoomHistory(data.roomId);
                }
            },
        };

        contextMenu = app.contextMenuManager.createMenu({
            id: 'historyRoomsListContextMenu',
            items: contextMenuItems
        });

        if (app.mobile){
            contextMenu.addItem({
                title: t('cancel'),
                icon: 'times',
            });
        }

        if (!app.mobile){

            dialog.$roomsPane = dialog.body().find('.members-scroll');

            resizeDialog(dialog, dialog.body().height());

            dialog.setOption('onResize', function($body){
                resizeDialog(this, $body.height());
            });

            $roomsListTable = dialog.body().find('.members-list');

            $roomsListTable.tablesorter({
                widgets: ['stickyHeaders'],
                widgetOptions: {
                    stickyHeaders_attachTo: '#history .members-scroll',
                }
            });

        }

        dialog.formHandler = new FormHandler({
            form: $form,
            submitButton: $form.find('.find-button'),
            onResult: function(){
                $roomsList.empty();
                skip = 0;
                if (app.mobile){
                    dialog.body().find('#membersFilter').removeClass('visible');
                }
            },
            onSuccess: function(result){
                if (result.total){
                    appendRooms(result);
                    $emptyMessage.hide();
                }
                if (!result.total){
                    $emptyMessage.show();
                }
            }
        });

        $roomsList.on('click', '.item', function(event){

            var $row = $(this);
            var id = $row.attr('id');

            var name = $('.name span', $row).text();
            var date = $('.date', $row).text();
            var userId = $row.data('user-id');

            contextMenu.set({
                roomId: id,
                userId: userId,
                name: name,
                date: date,
            }).show(event);

        });

        $moreButton = $('#historyMoreButton', dialog.body()).hide();

        $moreButton.click(function(){

            var $loading = $moreButton.siblings('.loading');

            $moreButton.hide();
            $loading.show();

            var data = dialog.formHandler.getValues();
            data.skip = skip;

            $.post('/history/get', data, function(result){
                $loading.hide();
                $moreButton.show();
                appendRooms(result);
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

    function appendRooms(result){

        var $rooms = $(result.html);
        $rooms.appendTo($roomsList);
        total = result.total;
        skip += result.count;

        $moreButton.toggle(skip < total);

        if (!app.mobile){
            $roomsListTable.trigger('update');
        }

    }

    function resizeDialog(dialog, height){
        dialog.$roomsPane.css({height: (height - 74)+'px'});
    }

    function openRoomHistory(roomId, name, date){

        app.dialogs.create({
            id: 'history-room-' + roomId,
            title: t('historyRoom', {name: name, date: date}),
            titleIcon: 'history',
            content: {
                url: '/history/room',
                data: {
                    id: roomId
                }
            },
            width:550,
            height:450,
            buttons: [{
                id: 'download',
                title: t('historyDownload'),
                icon: 'download',
                class: 'btn-primary',
                click: function(){
                    downloadRoomHistory(roomId);
                }
            }, {
                id: 'close',
                title: t('close'),
                class: 'btn-default',
                click: function(){
                    this.remove();
                }
            }]
        });

    }

    function deleteRoomHistory(roomId){

        app.dialogs.confirm(t('historyDeleteConfirm'), function(){
            $.post('/history/delete', {id: roomId}, function(){
                dialog.formHandler.submit();
            });
        });

    }

    function downloadRoomHistory(roomId){

        window.location = '/history/download/' + roomId;

    }

}

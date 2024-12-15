function TextLobbyController(app, socket){

    var controller = this;

    var dialog, contextMenu;

    var $membersListTable;
    var $membersList;

    init();

    function init(){

        dialog = app.dialogs.create({
            id: 'text-lobby',
            width: 1500,
            height: 600,
            title: t('membersList', {count: 0}),
            content: tpl('textLobbyTemplate'),
            isCloseable: false
        });

        var contextMenuItems = {
            request: {
                title: t('sendChatRequest'),
                icon: 'comment',
                click: function(data){
                    app.controllers.textChat.sendRequest(data.userId, data.userName);
                }
            },
            profile: {
                title: t('viewProfile'),
                icon: 'search',
                click: function(data){
                    app.openProfile(data.userId, data.userName);
                }
            }
        };

        if (app.admin){
            contextMenuItems.log = {
                title: t('viewLog'),
                icon: 'history',
                click: function(data){
                    app.moderator.showMessagesLog(data.userId, data.userName);
                }
            };
        }

        contextMenu = app.contextMenuManager.createMenu({
            id: 'textChatLobbyContextMenu',
            items: contextMenuItems
        });

        if (app.mobile){
            contextMenu.addItem({
                title: t('cancel'),
                icon: 'times',
            });
        }

        $membersListTable = dialog.body().find('#textLobbyMembersList');

        if (!app.mobile){

            dialog.$membersPane = dialog.body().find('.members-scroll');

            resizeDialog(dialog, dialog.body().height());

            dialog.setOption('onResize', function($body){
                resizeDialog(this, $body.height());
            });

            $membersListTable.tablesorter({
                widgets: ['stickyHeaders'],
                widgetOptions: {
                    stickyHeaders_attachTo: '#text-lobby .members-scroll',
                }
            });

        }

        $membersList = $membersListTable.find('.list-body');

        $membersList.on('click', '.item', function(event){

            var $row = $(this);
            var id = $row.attr('id');
            var name = $('.name span', $row).html();

            if (id === app.userId) { return; }

            contextMenu.set({
                userId: id,
                userName: name
            }).show(event, name);

        });

        dialog.body().find('.toolbar .room-link').click(function(e){

            e.preventDefault();

            var $link = $(this);
            var roomId = $link.data('id');

            if (e.button == 1 && app.admin){
                app.admin.spectatePublicRoom(roomId);
                return;
            }

            app.controllers.textRooms.joinPublicRoom(roomId);

        });

        dialog.body().find('.toolbar .all-rooms').click(function(e){
            e.preventDefault();
            app.controllers.textRooms.openRoomsList();
        });

    }

    function resizeDialog(dialog, height){
        dialog.$membersPane.css({height: (height - 60 - $('.hl-notice').height())+'px'});
    }

    this.onMemberJoin = function(member){

        var $row = $(tpl('textLobbyMemberTemplate', member));

        if (member.name.color) {
            $row.find('.name').css({color: member.name.color});
        }

        $row.appendTo($membersList);

        if (!app.mobile){
            $membersListTable.trigger('update');
        }

        dialog.setTitle(t('membersList', {count: app.getMembersCount()}));

    };

    this.onMemberLeave = function(id){

        $('.item#' + id, $membersList).remove();

        $membersListTable.trigger('update');

        dialog.setTitle(t('membersList', {count: app.getMembersCount()}));

    };

    this.onMemberUpdate = function(member){
        controller.onMemberLeave(member.id);
        controller.onMemberJoin(member);
    };

    this.onUpdatePublicCounts = function(publicCounts){

        dialog.body().find('.toolbar .room-link').each(function(id, link){
            var $link = $(link);
            var roomId = $link.data('id');
            var countText = roomId in publicCounts ? '(' + publicCounts[roomId] + ')' : '';
            $link.find('span').text(countText).toggle(countText != '');
        });

    };

}

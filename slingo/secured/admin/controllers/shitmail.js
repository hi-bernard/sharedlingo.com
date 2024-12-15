function ShitMailController(app, socket, dialog){

    var $form, $domainsList, $domainsListTable, $moreButton;
    var contextMenu;
    var total, skip = 0;

    init();

    function init(){

        $form = dialog.body().find('form');
        $domainsList = dialog.body().find('#domainsList .list-body');

        dialog.$domainsPane = dialog.body().find('.members-scroll');

        resizeDialog(dialog, dialog.body().height());

        dialog.setOption('onResize', function($body){
            resizeDialog(this, $body.height());
        });

        $domainsListTable = dialog.body().find('#domainsList');

        $domainsListTable.tablesorter({
            widgets: ['stickyHeaders'],
            widgetOptions: {
                stickyHeaders_attachTo: '#shit-mail-dialog .members-scroll',
            }
        });

        dialog.formHandler = new FormHandler({
            form: $form,
            submitButton: $form.find('.find-button'),
            onResult: function(){
                $domainsList.empty();
                skip = 0;
            },
            onSuccess: function(result){
                if (result.total){
                    appendDomains(result);
                }
            }
        });

        $moreButton = $('#domainsMoreButton', dialog.body()).hide();

        $moreButton.click(function(){

            var $loading = $moreButton.siblings('.loading');

            $moreButton.hide();
            $loading.show();

            var data = dialog.formHandler.getValues();
            data.skip = skip;

            $.post('/admin/shit-mail-get', data, function(result){
                $loading.hide();
                $moreButton.show();
                appendDomains(result);
            });

        });

        var contextMenuItems = {
            delete: {
                title: t('shitMailDelete'),
                icon: 'times',
                click: function(data){
                    deleteDomain(data.id, data.domain);
                }
            },
        };

        contextMenu = app.contextMenuManager.createMenu({
            id: 'shitMailListContextMenu',
            items: contextMenuItems
        });

        $domainsList.on('click', '.item', function(event){

            var $row = $(this);
            var id = $row.attr('id');
            var domain = $('.domain span', $row).text();

            contextMenu.set({
                id: id,
                domain: domain,
            }).show(event, domain);

        });

        dialog.getButton('add').click(function(e){
            addDomain();
        });

        dialog.formHandler.submit();

    }

    function appendDomains(result){

        var $domains = $(result.html);
        $domains.appendTo($domainsList);
        total = result.total;
        skip += result.count;

        $moreButton.toggle(skip < total);

        if (!app.mobile){
            $domainsListTable.trigger('update');
        }

    }

    function resizeDialog(dialog, height){
        dialog.$domainsPane.css({height: (height - 55)+'px'});
    }

    function addDomain(){

        app.dialogs.prompt({
            title: t('shitMailAdd'),
            text: t('shitMailPrompt'),
            onResult: function(domain){
                $.post('/admin/shit-mail-add', {domain: domain}, function(result){

                    if (!result.success){
                        app.dialogs.message(result.error);
                        return;
                    }

                    dialog.formHandler.submit();

                }, 'json');
            }
        });

    }

    function deleteDomain(id, domain){
        if (app.dialogs.confirm(t('shitMailConfirm', {domain: domain}), function(){
            $.post('/admin/shit-mail-delete', {id: id}, function(){
                dialog.formHandler.submit();
            }, 'json');
        }));
    }

}

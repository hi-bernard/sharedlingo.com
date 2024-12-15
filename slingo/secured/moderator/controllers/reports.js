function ModeratorReportsController(app, socket, dialog) {

    var controller = this;

    var $reportsList, $reportsListTable, $moreButton;

    var skip = 0;

    init();

    function init(){

        skip = 0;

        $reportsList = dialog.body().find('.members-list .list-body');

        if (!app.mobile){

            dialog.$pane = dialog.body().find('.members-scroll');

            resizeDialog(dialog, dialog.body().height());

            dialog.setOption('onResize', function($body){
                resizeDialog(this, $body.height());
            });

            $reportsListTable = dialog.body().find('#reportsList');

            $reportsListTable.tablesorter({
                widgets: ['stickyHeaders'],
                widgetOptions: {
                    stickyHeaders_attachTo: '#reports .members-scroll',
                }
            });

        }

        $reportsList.on('click', '.item', function(event){

            var $row = $(this);
            var id = $row.attr('id');

            openReport(id);

        });

        $moreButton = $('#reportsMoreButton', dialog.body()).hide();

        $moreButton.click(function(){

            var $loading = $moreButton.siblings('.loading');

            $moreButton.hide();
            $loading.show();

            $.post('/reports/get-reports', {skip: skip}, function(result){
                $loading.hide();
                $moreButton.show();
                appendReports(result);
            });

        });

        $.post('/reports/get-reports', {skip: skip}, function(result){
            if (result.total){
                appendReports(result);
            }
        });

    }

    function resizeDialog(dialog, height){
        dialog.$pane.css({height: height+'px'});
    }

    function appendReports(result){

        var $reports = $(result.html);
        $reports.appendTo($reportsList);
        skip += result.count;

        $moreButton.toggle(skip < result.total);

        if (!app.mobile){
            $reportsListTable.trigger('update');
        }

    }

    function openReport(id){

        app.dialogs.create({
            id: 'report-'+id,
            title: t('reportsView'),
            titleIcon: 'shield',
            titleCount: 0,
            content: {
                url: '/reports/report',
                type: 'json',
                data: {
                    id: id
                },
                onLoad: function(dialog, result){

                    initReport(dialog, result.report);

                    var buttons = {};

                    if (!result.report.result){
                        buttons.resolve = {
                            id: 'resolve',
                            title: t('reportResolve'),
                            icon: 'edit',
                            class: 'btn-primary',
                            click: function(){
                                resolveReport(id, dialog);
                            }
                        };
                    }

                    buttons.ok = {
                        id: 'ok',
                        title: t('close'),
                        class: 'btn-default',
                        click: function(){
                            this.remove()
                        }
                    };

                    dialog.setOption('buttons', buttons);

                }
            },
            width:450,
        });

    }

    function initReport(dialog, report){

        dialog.body().find('#suspectProfileBtn').click(function(){
            app.openProfile(report.suspect.id, report.suspect.name);
        });
        dialog.body().find('#reporterProfileBtn').click(function(){
            app.openProfile(report.reporter.id, report.reporter.name);
        });

        dialog.body().find('#suspectLogBtn').click(function(){
            app.moderator.showMessagesLog(report.suspect.id, report.suspect.name, report.suspect.log);
        });
        dialog.body().find('#suspectLogMailBtn').click(function(){
            app.moderator.showMailLog(report.suspect.id, report.suspect.name, report.reporter.name, report.suspect.mail);
        });
        dialog.body().find('#reporterLogBtn').click(function(){
            app.moderator.showMessagesLog(report.reporter.id, report.reporter.name, report.reporter.log);
        });
        dialog.body().find('#reporterLogMailBtn').click(function(){
            app.moderator.showMailLog(report.suspect.id, report.reporter.name, report.suspect.name, report.suspect.mail);
        });
        dialog.body().find('#moderatorLink').click(function(){
            app.openProfile(report.result.moderator.id, report.result.moderator.name);
        });

    }

    function resolveReport(id, dialog){

        app.dialogs.prompt({
            type: 'text',
            title: t('reportResolve'),
            text: t('reportResolveText'),
            checkbox: t('reportNotify'),
            onResult: function(comment, isNotify){

                if (!comment) { return; }

                $.post('/reports/resolve', {
                    id: id,
                    comment: comment,
                    notify: isNotify
                }, function(result){

                    socket.emit('report resolved', id);

                    if (isNotify){
                        socket.emit('mail sent', result.reporter_id);
                    }

                    if (app.dialogs.isDialogExists('reports')){

                        var listDialog = app.dialogs.getDialog('reports');
                        var $row = listDialog.body().find('#' + id);

                        $row.replaceWith(result.html);

                    }

                });

                dialog.remove();

            }
        });

    }

}


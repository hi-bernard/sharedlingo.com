function AdminController(app, socket) {

    var controller = this;

    var statsDialog = null;

    function init(){

        $('#adminMenu .mass-mailing-link').click(function(e){
            e.preventDefault();
            composeMassMail();
        });

        $('#adminMenu .bad-mail-link').click(function(e){
            e.preventDefault();
            shitMailList();
        });

        $('#adminMenu .live-stats-link').click(function(e){
            e.preventDefault();
            showLiveStats();
        });

        $('#adminMenu .daily-stats-link').click(function(e){
            e.preventDefault();
            showDailyStats();
        });

        $('#adminMenu .broadcast-link').click(function(e){
            e.preventDefault();
            broadcast();
        });

        socket.on('live stats', function(stats){
            updateLiveStats(stats);
        });

    }

    this.banUser = function(userId, userName){
        app.dialogs.confirm(t('banUserConfirm', {name: userName}), function(){
            app.dialogs.prompt({
                title: t('banUser'),
                text: t('banUserReason'),
                onResult: function(reason){
                    socket.emit('ban', {
                        userId: userId,
                        permanent: true,
                        reason: reason
                    });
                }
            });
        });
    };

    this.banEmail = function(email){
        $.post('/admin/shit-mail-add', {domain: email}, function(result){
            if (!result.success){
                app.dialogs.message(result.error);
                return;
            }
            app.dialogs.message(t('shitMailAdded', {domain:email.split('@')[1]}));
        }, 'json');
    };

    this.spectatePublicRoom = function(roomId){

        socket.emit('room spectate', roomId);

    };

    function composeMassMail(){

        app.dialogs.create({
            id: 'mass-mail',
            title: t('massMail'),
            titleIcon: 'envelope-o',
            modal: true,
            content: {
                url: '/mail/compose',
                onLoad: function(dialog){
                    require('controllers/massmail', function(){
                        MassMailController(app, socket, dialog);
                    });
                }
            },
            width:400,
            height:500,
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

    }

    function shitMailList(){

        app.dialogs.create({
            id: 'shit-mail',
            title: t('shitMail'),
            titleIcon: 'ban',
            content: {
                url: '/admin/shit-mail-dialog',
                onLoad: function(dialog){
                    require('controllers/shitmail', function(){
                        ShitMailController(app, socket, dialog);
                    });
                }
            },
            width:400,
            height:500,
            buttons: [{
                id: 'add',
                class: 'btn-primary',
                title: t('shitMailAdd'),
            },{
                id: 'cancel',
                class: 'btn-default',
                title: t('close'),
                click: function(){
                    this.remove();
                }
            }]
        });

    }

    function showLiveStats(){

        statsDialog = app.dialogs.create({
            id: 'live-stats',
            title: t('liveStats'),
            content: tpl('liveStatsTemplate'),
            width:400,
            height:500,
            buttons: [{
                id: 'refresh',
                class: 'btn-primary',
                title: t('refresh'),
                click: function(){
                    loadLiveStats();
                }
            }, {
                id: 'close',
                class: 'btn-default',
                title: t('close'),
                click: function(){
                    statsDialog = null;
                    this.remove();
                }
            }]
        });

        loadLiveStats();

    }

    function loadLiveStats() {
        socket.emit('live stats');
    }

    function updateLiveStats(stats){

        if (!statsDialog) { return; }

        var $roomsList = statsDialog.body().find('.rooms-list');

        $roomsList.empty();

        if (!stats.rooms){
            return;
        }

        $.each(stats.rooms, function(id, room){
            $('<li/>').text(room.join(' + ')).appendTo($roomsList);
        });

        statsDialog.body().find('.suggests-count span').text(stats.suggests);

    }

    function showDailyStats(){

        statsDialog = app.dialogs.create({
            id: 'daily-stats',
            title: t('liveStats'),
            width: 1000,
            content: {
                url: '/admin/stats-dialog',
                onLoad: function(dialog){
                    initDailyStatsDialog(dialog);
                }
            },
            buttons: [{
                id: 'close',
                class: 'btn-default',
                title: t('close'),
                click: function(){
                    statsDialog = null;
                    this.remove();
                }
            }]
        });

    }

    function initDailyStatsDialog(dialog, stats){

        var ctx = dialog.body().find("#chart-canvas").get(0).getContext("2d");

        var $form = dialog.body().find('.stats-form');

        dialog.formHandler = new FormHandler({
            form: $form,
            onSuccess: function(result){
                updateDailyStatsChart(dialog, ctx, result.stats);
            }
        });

        dialog.formHandler.submit();

        var $monthSelect = dialog.body().find('.month-select');
        var $yearSelect = dialog.body().find('.year-select');

        dialog.body().find('.btn-prev-month').click(function(e){
            e.preventDefault();
            var month = $monthSelect.val();
            if (month > 1) {
                $monthSelect.val(month-1);
                console.log($monthSelect.val());
            } else {
                var year = $yearSelect.val();
                $monthSelect.val(12);
                $yearSelect.val(year-1);
            }
            dialog.formHandler.submit();
        });

        dialog.body().find('.btn-next-month').click(function(e){
            e.preventDefault();
            var month = $monthSelect.val();
            if (month < 12) {
                month++
                $monthSelect.val(month);
                console.log($monthSelect.val());
            } else {
                var year = $yearSelect.val();
                $monthSelect.val(1);
                $yearSelect.val(year+1);
            }
            dialog.formHandler.submit();
        });

        dialog.body().find('select').change(function(e){
            dialog.formHandler.submit();
        });

    }

    function updateDailyStatsChart(dialog, ctx, stats){

        var data = {
            labels: stats.labels,
            datasets: [
                {
                    label: "Avg",
                    fillColor: "rgba(41, 128, 185, 0.65)",
                    highlightFill: "rgba(41, 128, 185,1)",
                    data: stats.values.avg
                },
                {
                    label: "Max",
                    fillColor: "rgba(117, 112, 107,0.65)",
                    highlightFill: "rgba(117, 112, 107,1)",
                    data: stats.values.max
                },
                {
                    label: "New",
                    fillColor: "rgba(142, 176, 33, 0.65)",
                    highlightFill: "rgba(142, 176, 33, 1)",
                    data: stats.values.reg
                }
            ]
        };

        if (dialog.chart) { dialog.chart.destroy(); }

        dialog.chart = new Chart(ctx).Bar(data, {
            multiTooltipTemplate : "<%=datasetLabel%>: <%= value %>",
            barShowStroke: false
        });

    }

    function broadcast(){

        app.dialogs.prompt({
            type: 'text',
            title: t('broadcast'),
            text: t('broadcastMessage'),
            checkbox: t('broadcastMessageModal'),
            onResult: function(message, isModal){
                message = message.replace(/([^>])\n/g, '$1<br/>');
                socket.emit('broadcast', {
                    message: message,
                    modal: isModal
                });
            }
        });

    }

    function require(file, onSuccess){
        app.require('/admin/js?file='+file, onSuccess);
    }

    init();

}

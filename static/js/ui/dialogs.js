function DialogsManager(app){

    var dialogs = {};

    this.taskbar = new Taskbar();

    this.create = function(options){

        var id = options.id;

        if (this.isDialogExists(id)){
            this.getDialog(id).bringToFront();
            return;
        }

        var dialog = new Dialog(this, options);
        dialogs[id] = dialog;

        return dialog;

    };

    this.message = function(text, isModal){
        return this.create({
            id: 'message-' + (new Date()).getTime(),
            title: t('messageDialog'),
            content: tpl('messageDialogTemplate', {message: text}),
            modal: isModal,
            buttons: [{
                id: 'ok',
                class: 'btn-default',
                title: t('ok'),
                click: function(){
                    this.remove();
                }
            }]
        });
    };

    this.confirm = function(text, yesCallback, noCallback){
        return this.create({
            id: 'confirm-' + (new Date()).getTime(),
            title: t('confirmDialog'),
            content: tpl('messageDialogTemplate', {message: text}),
            buttons: [{
                id: 'yes',
                class: 'btn-success',
                title: t('yes'),
                click: function(){
                    if (yesCallback){ yesCallback(); }
                    this.remove();
                }
            }, {
                id: 'no',
                class: 'btn-danger',
                title: t('no'),
                click: function(){
                    if (noCallback){ noCallback(); }
                    this.remove();
                }
            }]
        });
    };

    this.prompt = function(options){

        var opts = $.extend({
            type: 'string',
            title: '',
            text: '',
            checkbox: false,
            onResult: false,
            onCancel: false,
            modal: false
        }, options);

        var $body = $('<div/>').addClass('dialog-prompt');
        $('<div/>').addClass('prompt-text').html(opts.text).appendTo($body);

        if (opts.type === 'string'){
            $('<input/>').addClass('form-control').attr('type', 'text').appendTo($body);
        }

        if (opts.type === 'text'){
            $('<textarea/>').addClass('form-control').appendTo($body);
        }

        if (opts.checkbox){
            var $cbWrap = $('<div/>').addClass('checkbox').appendTo($body);
            var $cbLabel = $('<label/>').html(opts.checkbox).appendTo($cbWrap);
            $('<input/>').attr('type', 'checkbox').prependTo($cbLabel);
        }

        return this.create({
            id: 'prompt-' + (new Date()).getTime(),
            title: opts.title,
            content: $body.get(0).outerHTML,
            width:400,
            modal: opts.modal,
            buttons: [{
                id: 'ok',
                class: 'btn-primary',
                title: t('ok'),
                click: function(){
                    if (opts.onResult){
                        var text = this.body().find('.form-control').val();
                        var checkbox = opts.checkbox ? this.body().find('input:checkbox').prop('checked') : false;
                        opts.onResult(text, checkbox);
                    }
                    this.remove();
                }
            }, {
                id: 'cancel',
                class: 'btn-default',
                title: t('cancel'),
                click: function(){
                    if (opts.onCancel){ opts.onCancel(); }
                    this.remove();
                }
            }],
            onCreate: function(){
                var dialog = this;
                setTimeout(function(){ dialog.body().find('.form-control').focus(); }, 100);
            }
        });


    };

    this.isDialogExists = function(id){
        return id in dialogs;
    };

    this.getDialog = function(id){
        if (!this.isDialogExists(id)) { return null; }
        return dialogs[id];
    };

    this.each = function(callback){
        $.each(dialogs, function(id, dialog){
            callback(id, dialog);
        });
    };

    this.unfocusOther = function(exceptId){
        this.each(function(id, dialog){
            if (id !== exceptId){
                dialog.setFocus(false);
            }
        });
    };

    this.unfocusAll = function(){
        this.each(function(id, dialog){
            dialog.setFocus(false);
        });
    };

    this.remove = function(id){
        delete dialogs[id];
    };

    this.body = function(){
        return app.body();
    };

};

function Dialog(manager, options) {

    var dialog = this;

    var opts = $.extend({
        id: '',
        modal: false,
        title: '',
        titleCount: false,
        titleIcon: false,
        content: '',
        width: false,
        height: false,
        isCloseable: true,
        isHideBottomBar: false,
        buttons: false,
        titleButtons: false,
        onCreate: false,
        onClose: false,
        onResize: false,
        onShow: false,
        onFocus: false,
        onBlur: false
    }, options);

    var hasFocus = false;
    var isAjax = typeof(opts.content)==='object';
    var position;

    var $taskbarButton, $overlay, $window, $title, $body, $buttons;

    var buttons = {};

    this.init = function(){

        this.addToTaskbar();

        this.build();
        this.resizeAndCenter();

        this.bringToFront();
        this.resizeBody();

    };

    this.build = function() {

        if (opts.modal && !app.mobile){
            $overlay = $('<div/>').addClass('dialog-modal-overlay').appendTo(manager.body()).show();
        }

        $window = $(tpl('dialogTemplate')).attr('id', opts.id).hide();
        $title = $('.title', $window);
        $body = $('.body', $window);
        $buttons = $window.find('.buttons');

        this.buildTitleButtons();

        if (opts.modal && !app.mobile){
            $window.addClass('dialog-modal');
        }

        if (!isAjax){
            this.buildButtons();
            $body.html(opts.content);
        }

        if (isAjax){

            var $loading = $('<div/>').addClass('loading').html('<i class="fa fa-spin fa-gear"></i>');
            $loading.appendTo($body);

            var url = opts.content.url;
            var data = opts.content.data || {};
            var type = opts.content.type || 'html';

            $.post(url, data, function(result){

                if (!opts.width){
                    $window.css({ width:'auto' });
                    $body.css({ width:'auto' });
                }

                if (!opts.height){
                    $window.css({ height:'auto' });
                    $body.css({ height:'auto' });
                }

                $body.html(type == 'html' ? result : result.html);

                isAjax = false;

                if (opts.buttons){
                    dialog.buildButtons();
                }

                if (typeof(opts.content.onLoad)==='function'){
                    opts.content.onLoad(dialog, result);
                }

                dialog.resizeAndCenter();
                dialog.resizeBody();

            }, type);

        }

        if (opts.titleIcon !== false){
            $title.$icon = $('<span/>').addClass('icon').appendTo($title);
            this.setTitleIcon(opts.titleIcon);
        }

        $('<span/>').addClass('text').html(opts.title).appendTo($title);

        if (opts.titleCount !== false){
            $title.$counter = $('<span/>').addClass('counter').appendTo($title);
            this.setTitleCounter(opts.titleCount);
        }

        if (!app.mobile){
            $window.draggable({
                handle: '.title-drag'
            });

            $window.resizable({
                minHeight:50,
                minWidth:50,
                resize: function(){
                    dialog.resizeBody();
                }
            });
        }

        $window.mousedown(function(){
            dialog.bringToFront();
        });

        $window.appendTo(manager.body());

        if (opts.onCreate){
            opts.onCreate.call(dialog);
        }

    };

    this.buildTitleButtons = function(){

        var buttons = opts.titleButtons || [];

        if (opts.isCloseable){
            buttons.push({
                icon: 'times',
                title: t('close'),
                click: function(){

                    if (!opts.closeConfirm){
                        dialog.close();
                        return;
                    }

                    manager.confirm(opts.closeConfirm, function(){
                        dialog.close();
                    });

                }
            });
        }

        if (!opts.modal && !app.mobile){
            buttons.push({
                icon: 'caret-down',
                title: t('minimize'),
                click: function(){
                    dialog.toggle();
                }
            });
        }

        if (buttons){
            $.each(buttons, function(id, button){

                var $button = $('<button/>').
                                    addClass('title-button').
                                    html('<i class="fa fa-'+button.icon+'"></i>' + (button.text ? ' ' + button.text : '')).
                                    attr('title', button.title).
                                    appendTo($title);

                $button.click(function(e){
                    e.preventDefault();
                    if (button.click) {
                        button.click.call(dialog);
                    }
                });

            });
        }

    };

    this.buildButtons = function(){

        $buttons.empty();

        if (opts.buttons){

            $.each(opts.buttons, function(id, button){
                var title = [];
                if (button.icon){ title.push('<i class="fa fa-'+button.icon+'"></i>'); }
                if (button.title){ title.push(button.title); }
                var $button = $('<button/>').addClass('btn').addClass(button.class).html(title.join(' ')).appendTo($buttons);
                if (button.hint){
                    $button.attr('title', button.hint);
                }
                if (typeof(button.click)==='function'){
                    $button.click(function(){
                        button.click.call(dialog);
                    });
                }
                buttons[button.id] = $button;
            });

            $buttons.show();

        } else if (opts.isHideBottomBar || app.mobile) {
            $buttons.remove();
            $buttons = false;
        }

    };

    this.resizeAndCenter = function(){

        if (app.mobile){
            return;
        }

        if (isAjax && !opts.height){ $window.css({ height: '150px' }); }
        if (isAjax && !opts.width){ $window.css({ width: '250px' }); }

        if (opts.width){ $window.css({ width: opts.width + 'px' }); }
        if (opts.height){ $window.css({ height: opts.height + 'px' }); }

        var docPadding = 100;
        var docWidth = $(window).width();
        var docHeight = window.innerHeight;
        var windowWidth = $window.outerWidth();
        var windowHeight = $window.outerHeight();

        if (windowWidth > docWidth - docPadding){
            $window.css({ width: (docWidth - docPadding) + 'px' });
            windowWidth = docWidth - docPadding;
        }
        if (windowHeight > docHeight - docPadding){
            $window.css({ height: (docHeight - docPadding) + 'px' });
            windowHeight = docHeight - docPadding;
        }

        var x = Math.round(docWidth/2 - windowWidth/2);
        var y = Math.round(docHeight/2 - windowHeight/2);

        $window.css({
            left: x + 'px',
            top: y + 'px'
        }).show();

    };

    this.addToTaskbar = function(){
        $taskbarButton = manager.taskbar.createButton(opts.title, function(){
            dialog.toggle();
            if (typeof(opts.onShow) === 'function' && dialog.isVisible()){
                opts.onShow.call(dialog);
            }
        });
    };

    this.setFocus = function(newFocusValue){
        if (newFocusValue === hasFocus) { return; }
        hasFocus = newFocusValue;
        $window.toggleClass('inactive', !newFocusValue);
        if (newFocusValue && typeof(opts.onFocus) === 'function'){
            opts.onFocus.call(dialog);
        }
        if (!newFocusValue && typeof(opts.onBlur) === 'function'){
            opts.onBlur.call(dialog);
        }
    };

    this.setOption = function(key, value){
        opts[key] = value;
        if (key == 'buttons'){
            this.buildButtons();
        }
    };

    this.loadContent = function(options){

        var url = options.url;
        var data = options.data || {};

        $body.empty();

        var $loading = $('<div/>').addClass('loading').html('<i class="fa fa-spin fa-gear"></i>');
        $loading.appendTo($body);

        $.post(url, data, function(html){

            $body.html(html);

            if (typeof(options.onLoad)==='function'){
                options.onLoad(dialog);
            }

        }, 'html');

    };

    this.isFocused = function(){
        return hasFocus;
    };

    this.body = function(){
        return $body;
    };

    this.window = function(){
        return $window;
    };

    this.setTitle = function(newTitle){
        $('.text', $title).html(newTitle);
        manager.taskbar.setButtonTitle($taskbarButton, newTitle);
    };

    this.setTitleCounter = function(newValue){
        if (!$title.$counter) { return; }
        $title.$counter.html(newValue);
        $title.$counter.toggle(newValue != 0);
        manager.taskbar.setButtonCounter($taskbarButton, newValue ? newValue : false);
    };

    this.setTitleIcon = function(newIcon){
        $title.$icon.html('<i class="fa fa-' + newIcon + '"></i>');
        manager.taskbar.setButtonIcon($taskbarButton, newIcon ? newIcon : false);
    };

    this.getButton = function(buttonId){
        return buttons[buttonId];
    };

    this.getButtons = function(){
        return buttons;
    };

    this.bringToFront = function(){

        if (opts.modal && !app.mobile){
            return;
        }

        $window.show();

        $('.dialog:visible:not(.dialog-modal)', manager.body()).css('z-index', 100);
        manager.unfocusOther(opts.id);
        $window.css('z-index', 101);
        if (!this.isFocused()) { this.setFocus(true); }

        $taskbarButton.addClass('active');

    };

    this.hide = function(){
        $window.hide();
        dialog.setFocus(false);
        $taskbarButton.removeClass('active');
    };

    this.toggle = function(){

        if (app.mobile){
            dialog.bringToFront();
            return;
        }

        if ($overlay) { $overlay.toggle(); }

        if (dialog.isVisible()){
            dialog.hide();
        } else {
            dialog.bringToFront();
        }

    };

    this.isVisible = function(){
        return $window.is(':visible');
    };

    this.remove = function(){
        if ($overlay) { $overlay.remove(); }
        $window.remove();
        manager.taskbar.removeButton($taskbarButton);
        manager.remove(opts.id);
    };

    this.close = function(){

        this.remove();
        if (typeof(opts.onClose)==='function'){
            opts.onClose.call(dialog);
        }

    };

    this.resizeBody = function(){
        var appHeight = app.mobile ? app.height : $window.outerHeight(true);
        var h = appHeight - $title.outerHeight(true) - ($buttons ? $buttons.outerHeight(true) : 0);
        $body.css({
            height: h + 'px'
        });
        if (typeof(opts.onResize)==='function'){
            opts.onResize.call(dialog, $body);
        }
    };

    this.init();

}

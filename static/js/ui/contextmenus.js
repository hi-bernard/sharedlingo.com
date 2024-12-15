function ContextMenuManager(){

    var mgr = this;

    this.activeMenus = [];

    $('body *').click(function(e){

        if (mgr.activeMenus.length === 0) { return; }

        mgr.activeMenus = [];

        $('.contextmenu:visible').hide();

    });

    this.createMenu = function(options){
        return new ContextMenu(options);
    };

    this.show = function(id){
        if (this.activeMenus.indexOf(id) !== -1) { return; }
        this.activeMenus.push(id);
    };

    this.hide = function(id){
        this.activeMenus.splice(this.activeMenus.indexOf(id), 1);
    };

}

function ContextMenu(options){

    var menu = this;

    var opts = $.extend({
        id: '',
        items: []
    }, options);

    this.id = opts.id;
    this.data = {};

    var $wrap = $('<div/>').attr('id', opts.id).addClass('contextmenu').addClass('dropdown').addClass('clearfix');
    var $menu = $('<ul/>').addClass('dropdown-menu').appendTo($wrap);

    var $header = $('<li/>').addClass('dropdown-header').hide().appendTo($menu);

    this.addItem = function(item){

        var $item = $('<li/>').appendTo($menu);
        var $itemLink = $('<a/>').appendTo($item);

        $('<span/>').html(item.title).appendTo($itemLink);

        if (item.icon){
            $itemLink.prepend('<i class="fa fa-fw fa-'+item.icon+'"></i> ');
        }

        item.dom = $item;

        $itemLink.click(function(){
            app.contextMenuManager.hide(opts.id);
            $wrap.hide();
            if (item.click){ item.click(menu.data); }
        });

    };

    $.each(opts.items, function(index, item){

        menu.addItem(item);

    });

    $wrap.appendTo(app.body());


    this.set = function(data){
        this.data = $.extend(this.data, data);
        return this;
    };

    this.show = function(event, header){

        if (typeof(header) !== 'undefined'){
            $header.html(header).show();
        } else {
            $header.hide();
        }

        if (!app.mobile){

            var x = event.pageX - 5;
            var y = event.pageY - 5;

            $wrap.css({
                left: x + 'px',
                top: y + 'px'
            });

        }

        $wrap.show();

        event.stopPropagation();

        app.contextMenuManager.show(this.id);

    };

    this.setItemTitle = function(id, title){
        opts.items[id].dom.find('span').html(title);
    };

    this.hideItem = function(id){
        opts.items[id].dom.hide();
    };

    this.showItem = function(id){
        opts.items[id].dom.show();
    };

    this.toggleItem = function(id, condition){
        if (condition){
            this.showItem(id);
        } else {
            this.hideItem(id);
        }
    };

    this.enableItem = function(id){
        opts.items[id].dom.removeClass('disabled');
    };

    this.disableItem = function(id){
        opts.items[id].dom.addClass('disabled');
    };

    this.toggleEnabledItem = function(id, condition){
        if (condition){
            this.enableItem(id);
        } else {
            this.disableItem(id);
        }
    };

}

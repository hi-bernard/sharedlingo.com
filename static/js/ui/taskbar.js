function Taskbar(){

    var taskbar = this;
    var $taskbarList = $('#appTaskbar ul');

    var totalCounter = 0;

    this.createButton = function(title, onClick){

        var $item = $('<li/>');
        var $button = $('<a/>').attr('href', '#').addClass('active').appendTo($item);

        $button.$title = $('<span/>').addClass('title').html(title).appendTo($button);

        $button.click(function(e){
            e.preventDefault();
            onClick($(this));
        });

        $item.appendTo($taskbarList);

        return $button;

    };

    this.setButtonTitle = function($button, newTitle){

        $button.$title.html(newTitle);

    };

    this.setButtonCounter = function($button, counterValue){

        if ($button.$counter){
            totalCounter -= Number($button.$counter.text());
        }

        if (counterValue === false){
            if ($button.$counter) {
                $button.$counter.remove();
                delete $button.$counter;
            }
            updateTotalCounter();
            return;
        }

        if (!$button.$counter){
            $button.$counter = $('<span/>').addClass('counter').appendTo($button);
        }

        $button.$counter.text(counterValue);
        totalCounter += counterValue;

        updateTotalCounter();

    };

    this.setButtonIcon = function($button, iconName){

        if (iconName === false){
            if ($button.$icon) {
                $button.$icon.remove();
                delete $button.$icon;
            }
            return;
        }

        if (!$button.$icon){
            $button.$icon = $('<span/>').addClass('icon').prependTo($button);
        }

        $button.$icon.html('<i class="fa fa-fw fa-' + iconName + '"></i>');

    };

    this.removeButton = function($button){

        $button.parent().remove();

    };

    function updateTotalCounter(){
        if (!app.mobile){ return; }
        var $badge = $('#appTaskbar .badge');
        $badge.text(totalCounter ? totalCounter : '');
    }

}

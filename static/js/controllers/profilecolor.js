function ProfileColorController(app, socket, dialog){

    init();

    var $preview, $colorPicker, $brightNotice, $darkNotice;

    function init(){

        var $form = dialog.body().find('#nameColorForm');

        $preview = $form.find('.preview-block .name');
        $brightNotice = $form.find('.preview-block .bright-notice');
        $darkNotice = $form.find('.preview-block .dark-notice');

        $colorPicker = $form.find('.colorpicker');

        $colorPicker.minicolors({
            inline: true,
            control: 'wheel',
            change: function(hex){
                updateColor(hex);
            }
        });

        dialog.formHandler = new FormHandler({
            form: $form,
            onSuccess: function(){
                socket.emit('member edit', app.userId);
                dialog.remove();
            }
        });

        dialog.getButton('save').click(function(e){
            dialog.formHandler.submit();
        });

        dialog.getButton('default').click(function(e){
            $colorPicker.minicolors('value', {color: $colorPicker.data('default')});
        });

    }

    function updateColor(colorHex){

        $preview.css({color: colorHex});

        var hex = colorHex.replace(/^\s*#|\s*$/g, '');

        var r = parseInt(hex.substr(0, 2), 16),
            g = parseInt(hex.substr(2, 2), 16),
            b = parseInt(hex.substr(4, 2), 16);

        var power = Math.round(((r * 299) + (g * 587) + (b * 114)) /1000);

        checkBrightness(power);

    }

    function checkBrightness(power){

        $brightNotice.hide();
        $darkNotice.hide();
        dialog.getButton('save').show();

        if (power > 160) {
            $brightNotice.show();
            dialog.getButton('save').hide();
        }

        if (power < 40) {
            $darkNotice.show();
            dialog.getButton('save').hide();
        }

    }

}

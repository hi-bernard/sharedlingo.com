function FormHandler (options){

    var opts = $.extend({
        id: '',
        form: false,
        onSubmit: false,
        onResult: false,
        onSuccess: false,
        onError: false,
        submitButton: false
    }, options);

    var $form = opts.form || $('#'+opts.id);

    if (!$form) { return; }

    var $button = opts.submitButton || $('button[type=submit]', $form);

    if (opts.submitButton){
        $button.click(function(e){

            e.stopPropagation();
            e.preventDefault();

            $form.submit();

            if (typeof(opts.onSubmit) === 'function'){
                opts.onSubmit($form);
            }

        });
    }

    var $overlay = $('<div/>').
                        addClass('form-overlay').
                        html('<div class="loading"><i class="fa fa-spin fa-gear"></i></div>').
                        hide().
                        appendTo($form);

    var $captcha = $form.find('.captcha');
    var captchaId = false;

    if ($captcha.length > 0){
        captchaId = grecaptcha.render($captcha.find('.frame').get(0), {sitekey: '6Lct9AYUAAAAABXLtmZhbFn-Oak2tPAg0ZGGEa0t', theme: 'light'});
        console.log('ID = ' + captchaId);
    }

    $form.submit(function(e){

        e.preventDefault();

        $('.form-group', $form).removeClass('has-error');
        $('.alert', $form).remove();
        $button.prop('disabled', true);

        var url = $form.attr('action');
        var data = $form.serialize();

        $overlay.show();

        $.post(url, data, function(result){

            if (typeof(opts.onResult) === 'function'){
                opts.onResult($form);
            }

            if (result.success){
                if (typeof(opts.onSuccess) === 'function') {
                    opts.onSuccess(result, $form);
                }
            }

            $button.prop('disabled', false);
            $overlay.hide();

            if (!result.success){

                if (captchaId !== false){
                    console.log('reset');
                    grecaptcha.reset(captchaId);
                }

                if (result.errors){
                    $.each(result.errors, function(fieldName, errorText){
                        if (fieldName == 'captcha'){
                            $('.captcha', $form).parents('.form-group').addClass('has-error');
                            return;
                        }
                        $("*[name='"+fieldName+"']", $form).parents('.form-group').addClass('has-error');
                    });
                }

                if (result.alert){
                    $('<div/>').addClass('alert').addClass('alert-danger').html(result.alert).prependTo($form);
                }

                if (typeof(opts.onError) === 'function') {
                    opts.onError(result.errors);
                }

                return;

            }

        });

    });

    this.getValues = function(){
        var values = {};
        $.each($form.serializeArray(), function(i, input){
            values[input.name] = input.value;
        });
        return values;
    };

    this.submit = function(){
        $form.submit();
    };

}

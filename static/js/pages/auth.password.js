$(document).ready(function(){

    $('input#password').focus();

    new FormHandler({
        id: 'startForm',
        onSuccess: function(result, $form){

            $('<div/>').addClass('alert').addClass('alert-success').html(result.message).prependTo($form);

            $form.find('.form-group').hide();
            $form.find('button').hide();
            $form.find('.continue').removeClass('hidden');

        }
    });

});

$(document).ready(function(){

    $('input#email').focus();

    new FormHandler({
        id: 'startForm',
        onSuccess: function(result, $form){

            $('<div/>').addClass('alert').addClass('alert-success').html(result.message).prependTo($form);

        }
    });

});

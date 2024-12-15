function MassMailController(app, socket, dialog){

    var $form = dialog.body().find('form');

    dialog.formHandler = new FormHandler({
        form: $form,
        submitButton: dialog.getButton('send'),
        onSuccess: function(){
            socket.emit('mail mass');
            dialog.remove();
        }
    });

}

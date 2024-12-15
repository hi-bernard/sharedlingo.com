function ProfileController(app, socket, dialog){

    var currentName = {};

    init();

    function init(){

        var $form = dialog.body().find('#profileForm');

        $('.selectpicker', $form).selectpicker({size: 5});

        dialog.formHandler = new FormHandler({
            form: $form,
            onSuccess: function(){
                socket.emit('member edit', app.userId);
                dialog.remove();
            }
        });

        dialog.getButton('save').click(function(e){

            e.preventDefault();

            var newName = {
                first: dialog.body().find('input#firstName').val(),
                last: dialog.body().find('input#lastName').val()
            };

            var isNameChanged = (newName.first != currentName.first) ||
                                (newName.last != currentName.last);

            if (!isNameChanged) {
                dialog.formHandler.submit();
                return;
            }

            app.dialogs.confirm(t('nameChangeConfirm', {name: newName.first + ' ' + newName.last}), function(){
                dialog.formHandler.submit();
            }, function(){
                dialog.body().find('input#firstName').val(currentName.first);
                dialog.body().find('input#lastName').val(currentName.last);
                dialog.formHandler.submit();
            });

        });

        dialog.body().find('#changePasswordBtn').click(function(e){

            e.preventDefault();
            e.stopPropagation();

            changePassword();

        });

        dialog.body().find('#changePasswordBtn').click(function(e){
            e.preventDefault();
            e.stopPropagation();
            changePassword();
        });

        dialog.body().find('#deleteAccountBtn').click(function(e){
            e.preventDefault();
            e.stopPropagation();
            deleteAccount();
        });

        currentName = {
            first: dialog.body().find('input#firstName').val(),
            last: dialog.body().find('input#lastName').val()
        };

    }

    function changePassword(){

        dialog.remove();

        app.dialogs.create({
            id: 'profile-password',
            modal: true,
            title: t('passwordChange'),
            titleIcon: 'key',
            content: {
                url: '/profile/password',
                onLoad: function(passwordDialog){

                    passwordDialog.formHandler = new FormHandler({
                        form: passwordDialog.body().find('#passwordForm'),
                        submitButton: passwordDialog.getButton('save'),
                        onSuccess: function(){
                            passwordDialog.remove();
                        }
                    });

                }
            },
            width:350,
            buttons: [{
                id: 'save',
                class: 'btn-primary',
                title: t('save'),
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

    function deleteAccount(){

        dialog.remove();

        app.dialogs.confirm(t('deleteAccountConfirm'), function(){

            app.dialogs.prompt({
                title: t('deleteAccount'),
                text: t('deleteAccountConfirmType'),
                onResult: function(text){

                    if (!text) { return; }
                    if (text.trim().toLowerCase() !== 'delete me') { return; }

                    $.post('/members/delete', function(){
                        socket.disconnect();
                    });

                }
            });

        });

    }

}

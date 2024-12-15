$(document).ready(function(){

    var $authDialog = $('#authDialog');
    var $spriteCanvas = $('.sprite-canvas');

    var spriteCanvasSize = {};

    function init(){

        initAuthDialog();

        $('.call-button .btn').click(function(e){
            e.preventDefault();
            showAuthDialog();
        });

    }

    function initAuthDialog(){

        $authDialog.css('top', '-300px');

        $('.dialog-modal-overlay').click(function(e){
            e.preventDefault();
            hideAuthDialog();
        });

        $authDialog.find('.btn-close').click(function(e){
            e.preventDefault();
            hideAuthDialog();
        });

        $('#signTabs .tabs a').click(function (e) {
            e.preventDefault();
            $(this).tab('show')
        });

        new FormHandler({
            id: 'signInForm',
            onSuccess: function(result){
                location.href = result.url;
            }
        });

        new FormHandler({
            id: 'signUpForm',
            onSuccess: function(result){
                location.href = result.url;
            }
        });

    }

    function showAuthDialog(){
        $('.dialog-modal-overlay').fadeIn();
        $('#signTabs a').eq(0).click();
        $authDialog.show().animate({
            top: '20px'
        });
    }

    function hideAuthDialog(){

        $('.dialog-modal-overlay').fadeOut();

        var height = $authDialog.outerHeight() + 30;

        $authDialog.show().animate({
            top: '-'+height+'px'
        }, function(){
            $authDialog.hide();
        });
    }

    init();

});

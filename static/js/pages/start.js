$(document).ready(function(){

    new FormHandler({
        id: 'startForm',
        onSuccess: function(result){
            location.href = result.url;
        }
    });

});

function PremiumController(app, socket){

    var controller = this;

    this.openDialog = function(){

        app.dialogs.create({
            id: 'premium',
            modal: true,
            title: t('premiumGet'),
            content: {
                url: '/premium/index',
            },
            width:800,
            buttons: [
//                {
//                id: 'buy',
//                title: t('premiumBuyNow'),
//                class: 'btn-success',
//                click: function(){
//                    this.remove();
//                    controller.openPaymentDialog();
//                }
//            },
            {
                id: 'close',
                title: t('close'),
                class: 'btn-default',
                click: function(){
                    this.remove();
                }
            }]
        });

    };

    this.openPaymentDialog = function(){

        app.dialogs.create({
            id: 'premium-plan',
            modal: true,
            title: t('premiumBuyNow'),
            content: {
                url: '/premium/plans',
            },
            width:650,
        });

    };

}

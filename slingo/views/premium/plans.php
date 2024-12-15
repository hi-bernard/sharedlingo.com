<?php

    use SLingo\Core\Lang;
    use SLingo\Core\User;

    $buttons = [
        1 => 'ML88HQWN62UNJ',
        3 => 'AGTFLAQQG9RAY',
        6 => 'QSSVW9EEMAM2W',
        12 => '5APX79ZKSD8B8'
    ];

    $isAlready = User::isPremium(true);

?>
<div class="dialog-message dialog-premium">

    <h3><?php echo t('premiumPickPlan'); ?></h3>

    <div class="premium-plans">

        <?php if ($isAlready) { ?>
            <?php $endDate = date(t('dateFormat'), User::get('premium_until')->sec); ?>
            <div class="note"><?php echo t('premiumAlreadyNote', $endDate); ?></div>
        <?php } ?>

        <ul>
            <?php foreach(array_reverse($prices, true) as $length => $price) { ?>
                <li>
                    <span class="plan"><?php echo t("premiumPlan_{$length}"); ?></span>
                    <span class="price"><i class="fa fa-dollar"></i><?php echo $price; ?></span>
                    <span class="price-month price-month-<?php echo $length; ?>"><?php echo t("premiumPriceMonth", round($price/$length)); ?></span>
                    <span class="button">
                        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                            <input type="hidden" name="cmd" value="_s-xclick">
                            <input type="hidden" name="hosted_button_id" value="<?php echo $buttons[$length]; ?>">
                            <input type="hidden" name="custom" value="<?php echo User::getId(); ?>">
                            <button class="btn btn-sm btn-success" name="submit"><i class="fa fa-paypal"></i> <?php echo t('selectBuy'); ?></button>
                        </form>
                    </span>
                </li>
            <?php } ?>
        </ul>
    </div>

    <div class="paypal-notice"><?php echo t('paypal'); ?></div>

</div>

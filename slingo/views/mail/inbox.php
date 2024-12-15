<?php use SLingo\Core\Response; ?>
<div class="mail-inbox" data-ts="<?php echo $messages ? $messages[0]['received']->sec : time(); ?>">

    <div class="toolbar">
        <div class="btn-group">
            <button class="btn btn-default btn-sm active" data-mode="inbox">
                <i class="fa fa-envelope-o"></i> <?php echo t('mailInbox'); ?>
            </button>
            <button class="btn btn-default btn-sm" data-mode="outbox">
                <i class="fa fa-mail-reply"></i>  <?php echo t('mailOutbox'); ?>
            </button>
        </div>
    </div>

    <div class="messages-pane">
        <ul class="messages">
            <?php if ($messages) { ?>
                <?php foreach($messages as $message) { ?>
                    <?php echo Response::render('mail/inbox-message', ['message' => $message, 'mode'=>$mode]); ?>
                <?php } ?>
            <?php } ?>
        </ul>

        <?php if ($total > count($messages)){ ?>
            <div class="more-button">
                <div class="loading"><i class="fa fa-spin fa-gear"></i></div>
                <button id="inboxMoreButton" type="button" class="btn btn-default"><i class="fa fa-arrow-down"></i> <?php echo t('mailLoadOlder'); ?></button>
            </div>
        <?php } ?>

        <div class="no-messages" <?php if ($messages) { ?>style="display: none"<?php } ?>>
            <?php echo t('mailInboxEmpty'); ?> <br>
            <button type="button" class="btn btn-default"><?php echo t('close'); ?></button>
        </div>
    </div>

</div>

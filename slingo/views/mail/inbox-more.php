<?php use SLingo\Core\Response; ?>
<div class="async-load" data-ts="<?php echo $messages[0]['received']->sec; ?>">
    <?php foreach($messages as $message) { ?>
        <?php echo Response::render('mail/inbox-message', ['message' => $message, 'mode' => $mode]); ?>
    <?php } ?>
</div>

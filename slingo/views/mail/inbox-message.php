<?php
    use SLingo\Core\Utils;
    $isRequest = !empty($message['is_request']);
    if ($isRequest){
        $message['subject'] = t('friendRequest');
    }
    if (is_array($message['subject'])){
        $message['subject'] = call_user_func_array('t', $message['subject']);
    }
?>
<li class="message" id="message-<?php echo $message['_id']; ?>" data-id="<?php echo $message['_id']; ?>">
    <div class="avatar">
        <img src="/static/img/user.png">
    </div>
    <div class="data">
        <div class="header">
            <span class="sender">
                <?php echo $message['sender']['name']; ?>
            </span>
            <?php if ($message['unread'] && $mode == 'inbox'){ ?>
                <span class="unread"><?php echo t('mailNew'); ?></span>
            <?php } ?>
            <span class="date" title="<?php echo date(t('dateFormatFull'), $message['received']->sec); ?>">
                <?php echo Utils::getDateAgoString(date('Y-m-d H:i:s', $message['received']->sec)); ?>
            </span>
        </div>
        <div class="subject"><?php echo empty($message['subject']) ? t('mailNoSubject') : $message['subject']; ?></div>
    </div>
    <?php if ($mode == 'inbox' && !$isRequest) { ?>
    <div class="actions">
        <button type="button" class="delete-button btn btn-default" title="<?php echo t('delete'); ?>">
            <i class="fa fa-trash"></i>
        </button>
    </div>
    <?php } ?>
</li>

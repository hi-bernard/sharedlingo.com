<?php
    use SLingo\Core\Request;
    use SLingo\Core\Utils;
    $isFromBanned = !empty($message['sender']['member']['banned']);
    $isRequest = !empty($message['is_request']);
    if ($isRequest){
        $message['subject'] = t('friendRequest');
        $message['text'] = t('friendRequestText', $message['sender']['member']['name']['first']);
    }
    if (is_array($message['subject'])){
        $message['subject'] = call_user_func_array('t', $message['subject']);
    }
?>
<div class="mail-message"
     data-unread-count="<?php echo $unread; ?>"
     data-id="<?php echo $message['_id']; ?>"
     data-sender-id="<?php echo $message['sender']['id']; ?>"
     <?php if ($isRequest) { ?>data-request-id="<?php echo $message['request_id']; ?>"<?php } ?>
     >

    <div class="titlebar">
        <button type="button" class="back-button btn btn-default" title="<?php echo t('mailBackToInbox'); ?>">
            <i class="fa fa-caret-left"></i>
        </button>
        <div class="details">
            <div class="name"><?php echo $message['sender']['name']; ?></div>
            <div class="date"><?php echo Utils::getDateAgoString(date('Y-m-d H:i:s', $message['received']->sec)); ?></div>
        </div>
        <div class="actions">
            <div class="btn-group">
                <?php if ($message['sender']['id'] > 0){ ?>
                    <?php if (!$isFromBanned){ ?>
                        <button type="button" class="reply-button btn btn-default">
                            <i class="fa fa-mail-reply"></i> <?php if (!Request::isMobile()) { echo t('mailReply'); } ?>
                        </button>
                    <?php } ?>
                    <button type="button" class="profile-button btn btn-default">
                        <i class="fa fa-search"></i> <?php if (!Request::isMobile()) { echo t('viewProfile'); } ?>
                    </button>
                <?php } ?>
                <?php if (!$isRequest){ ?>
                    <button type="button" class="delete-button btn btn-danger" title="<?php echo t('delete'); ?>">
                        <i class="fa fa-trash"></i>
                    </button>
                <?php } ?>
            </div>
        </div>
    </div>

    <?php if ($isFromBanned){ ?>
        <div class="warning"><i class="fa fa-exclamation-triangle"></i> <?php echo t('mailFromBanned'); ?></div>
    <?php } ?>

    <div class="content">

        <div class="subject"><?php echo empty($message['subject']) ? t('mailNoSubject') : $message['subject']; ?></div>
        <div class="text"><?php echo $message['text']; ?></div>

        <?php if (!empty($message['is_request'])){ ?>
            <div class="buttons">
                <button type="button" class="btn btn-success accept-button"><?php echo t('accept'); ?></button>
                <button type="button" class="btn btn-default decline-button"><?php echo t('decline'); ?></button>
            </div>
        <?php } ?>

    </div>

</div>

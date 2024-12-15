<div class="dialog-message mail-compose-form">

    <form method="POST" action="/mail/send">

        <?php if ($is_mass){ ?>
            <input type="hidden" name="is_mass" value="1">

            <div class="form-group">
                <label class="control-label" for="sender"><?php echo t('mailSender'); ?>:</label>
                <input type="text" id="sender" name="sender" class="form-control" value="<?php echo t('mailSystemSender'); ?>">
            </div>
        <?php } ?>

        <?php if (!$is_mass){ ?>
            <input type="hidden" name="id" value="<?php echo $recipient['_id']; ?>">
            <input type="hidden" id="prevMessageId" name="prev_id" value="">

            <div class="form-group">
                <label class="control-label" for="subject"><?php echo t('mailRecipient'); ?>:</label>
                <div class="mail-recipient">
                    <img src="/static/img/user.png">
                    <?php echo $recipient['name']['full']; ?>
                </div>
            </div>
        <?php } ?>

        <div class="form-group">
            <label class="control-label" for="subject"><?php echo t('mailSubject'); ?>:</label>
            <input type="text" id="subject" name="subject" class="form-control" value="">
        </div>

        <div class="form-group">
            <label class="control-label" for="message"><?php echo t('mailMessage'); ?>:</label>
            <textarea id="message" name="message" class="form-control"></textarea>
        </div>

        <div class="form-group last">
            <div class="captcha">
                <div class="frame"></div>
                <div class="loading"><i class="fa fa-spin fa-gear"></i></div>
            </div>
        </div>

        <?php if ($is_mass){ ?>
            <div class="checkbox">
                <label>
                    <input type="checkbox" name="is_online_only" value="1"> <?php echo t('mailSendToOnline'); ?>
                </label>
            </div>
        <?php } ?>

    </form>

</div>

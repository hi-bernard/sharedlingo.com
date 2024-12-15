<div class="dialog-message moderator-block">

    <form id="blockUserForm" method="POST" action="/moderator/block">

        <input type="hidden" name="id" value="<?php echo $id; ?>">
        <input type="hidden" name="is_submit" value="1">

        <div class="form-group">
            <label class="control-label" for="block-time"><?php echo t('blockPeriod'); ?>:</label>
            <input type="text" id="block-time" name="time" class="form-control" value="10">
            <span id="helpBlock" class="help-block"><?php echo t('blockPeriodHint', $maxBlockTime); ?></span>
        </div>

        <div class="form-group">
            <label class="control-label" for="block-reason"><?php echo t('blockReason'); ?>:</label>
            <input type="text" id="block-reason" name="reason" class="form-control" value="">
            <span id="helpBlock" class="help-block">
                <i class="fa fa-exclamation-triangle"></i>
                <?php echo t('blockReasonHint'); ?>
            </span>
        </div>

    </form>

</div>

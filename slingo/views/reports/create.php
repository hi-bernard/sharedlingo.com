<div class="dialog-message report-user">

    <form method="POST" action="/reports/send">

        <input type="hidden" name="id" value="<?php echo $suspect['_id']; ?>">

        <div class="form-group">
            <span id="helpBlock" class="help-block"><?php echo t('reportHint'); ?></span>
        </div>

        <div class="form-group">
            <label class="control-label" for="reason"><?php echo t('reportReason'); ?>:</label>
            <select id="reason" name="reason" class="form-control">
                <?php foreach($reasons as $reasonId => $reason){ ?>
                    <option value="<?php echo $reasonId; ?>"><?php echo $reason; ?></option>
                <?php } ?>
            </select>
        </div>

        <div class="form-group">
            <label class="control-label" for="message"><?php echo t('reportMessage'); ?>:</label>
            <textarea id="message" name="message" class="form-control"></textarea>
        </div>

        <div class="form-group last">
            <div class="captcha">
                <div class="frame"></div>
                <div class="loading"><i class="fa fa-spin fa-gear"></i></div>
            </div>
        </div>

    </form>

</div>

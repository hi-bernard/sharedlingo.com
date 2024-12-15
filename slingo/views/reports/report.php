<div class="dialog-message view-report">

    <div class="row">
        <div class="col-xs-6">
            <div class="form-group">
                <label class="control-label"><?php echo t('reportReason'); ?></label>
                <div><?php echo $reasons[$report['reason']]; ?></div>
            </div>
        </div>
        <div class="col-xs-6">
            <div class="form-group">
                <label class="control-label"><?php echo t('reportDate'); ?></label>
                <div><?php echo date('m/d/Y H:i', $report['created']->sec); ?></div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-6">
            <div class="form-group">
                <label class="control-label"><?php echo t('reportSuspect'); ?></label>
                <div><?php echo $report['suspect']['name']; ?></div>
                <div class="form-control-static">
                    <button id="suspectLogBtn" class="btn btn-sm btn-default"><?php echo t('reportLog'); ?></button>
                    <button id="suspectLogMailBtn" class="btn btn-sm btn-default"><?php echo t('reportLogMail'); ?></button>
                    <button id="suspectProfileBtn" class="btn btn-sm btn-default"><?php echo t('reportProfile'); ?></button>
                </div>
            </div>
        </div>
        <div class="col-xs-6">
            <div class="form-group">
                <label class="control-label"><?php echo t('reportReporter'); ?></label>
                <div><?php echo $report['reporter']['name']; ?></div>
                <div class="form-control-static">
                    <button id="reporterLogBtn" class="btn btn-sm btn-default"><?php echo t('reportLog'); ?></button>
                    <button id="reporterLogMailBtn" class="btn btn-sm btn-default"><?php echo t('reportLogMail'); ?></button>
                    <button id="reporterProfileBtn" class="btn btn-sm btn-default"><?php echo t('reportProfile'); ?></button>
                </div>
            </div>
        </div>
    </div>

    <div class="form-group">
        <label class="control-label"><?php echo t('reportText'); ?></label>
        <div><?php echo $report['message']; ?></div>
    </div>

    <?php if ($report['result']) { ?>
    <div class="form-group">
        <label class="control-label"><?php echo t('reportResolution'); ?></label>
        <div>
            <?php echo $report['result']['comment']; ?> //
            by <a href="javascript:void(0)" id="moderatorLink"><?php echo $report['result']['moderator']['name']; ?></a>
        </div>
    </div>
    <?php } ?>

</div>

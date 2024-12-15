<div class="dialog-message member-profile-edit">

    <form id="profileForm" method="POST" action="/profile/save">

        <?php if (empty($user['name']['changed'])) { ?>
            <div class="row name-inputs">
                <div class="col-xs-6">
                    <div class="form-group">
                        <label class="control-label" for="firstName"><?php echo t('firstName'); ?>:</label>
                        <input type="text" id="firstName" name="firstName" class="form-control" value="<?php echo html($user['name']['first']); ?>">
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="form-group">
                        <label class="control-label" for="lastName"><?php echo t('lastName'); ?>:</label>
                        <input type="text" id="lastName" name="lastName" class="form-control" value="<?php echo html($user['name']['last']); ?>">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-12">
                    <span class="help-block"><?php echo t('nameChangeNotice'); ?></span>
                </div>
            </div>
        <?php } ?>

        <div class="row">
            <div class="col-xs-6">
                <div class="form-group">
                    <label class="control-label" for="countryCode"><?php echo t('country'); ?>:</label>
                    <select id="countryCode" name="countryCode" class="form-control selectpicker" data-live-search="true">
                        <option value=""><?php echo t('selectPlaceholder'); ?></option>
                        <?php foreach($countries as $code => $country) { ?>
                            <option value="<?php echo $code; ?>"<?php if ($code==$user['location']['countryCode']) {?> selected="selected"<?php } ?>><?php echo $country; ?></option>
                        <?php } ?>
                    </select>
                </div>
            </div>
            <div class="col-xs-6">
                <div class="form-group">
                    <label class="control-label" for="city"><?php echo t('city'); ?>:</label>
                    <input type="text" id="city" name="city" class="form-control" value="<?php echo html($user['location']['city']); ?>">
                </div>
            </div>
        </div>

        <div id="introduce">
            <div class="form-group">
                <label class="control-label" for="bio"><?php echo t('introduce'); ?>:</label>
                <textarea id="bio" name="bio" class="form-control"><?php echo empty($user['bio']) ? '' : html($user['bio']); ?></textarea>
            </div>
        </div>

        <div class="row">
            <div class="col-xs-6">
                <div class="form-group">
                    <label class="control-label" for="gender"><?php echo t('manOrWoman'); ?></label>
                    <select id="gender" name="gender" class="form-control selectpicker">
                        <option value="m"<?php if ('m'==$user['gender']) {?> selected="selected"<?php } ?>><?php echo t('male'); ?></option>
                        <option value="f"<?php if ('f'==$user['gender']) {?> selected="selected"<?php } ?>><?php echo t('female'); ?></option>
                        <option value="o"<?php if ('o'==$user['gender']) {?> selected="selected"<?php } ?>><?php echo t('otherGender'); ?></option>
                    </select>
                </div>
            </div>
            <div class="col-xs-6">
                <div class="form-group">
                    <label class="control-label" for="bornYear"><?php echo t('whenBorn'); ?></label>
                    <select id="bornYear" name="bornYear" class="form-control selectpicker" data-live-search="true">
                        <?php foreach($years as $year) { ?>
                            <option value="<?php echo $year; ?>"<?php if ($year==$user['bornYear']) {?> selected="selected"<?php } ?>><?php echo $year; ?></option>
                        <?php } ?>
                    </select>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label class="control-label" for="nativeLangs"><?php echo t('nativeLang'); ?></label>
            <select id="nativeLangs" name="nativeLangs[]" class="form-control selectpicker" multiple data-live-search="true" title="<?php echo t('selectPlaceholder'); ?>">
                <?php foreach($langs as $code => $lang) { ?>
                    <option value="<?php echo $code; ?>"<?php if (in_array($code, $user['langs']['natives'])) {?> selected="selected"<?php } ?>><?php echo $lang; ?></option>
                <?php } ?>
            </select>
            <span id="helpBlock" class="help-block"><?php echo t('multipleLangHint'); ?></span>
        </div>

        <div id="learnLangs">
            <div class="form-group learn-lang-control">
                <label class="control-label" for="learnLangs"><?php echo t('learnLang'); ?></label>
                <select id="learnLangs" name="learnLangs[]" class="form-control selectpicker" multiple data-live-search="true" title="<?php echo t('selectPlaceholder'); ?>">
                    <?php foreach($langs as $code => $lang) { ?>
                        <option value="<?php echo $code; ?>"<?php if (in_array($code, $user['langs']['learns'])) {?> selected="selected"<?php } ?>><?php echo $lang; ?></option>
                    <?php } ?>
                </select>
                <span id="helpBlock" class="help-block"><?php echo t('multipleLangHint'); ?></span>
            </div>
        </div>

        <div class="form-group account-settings">
            <label class="control-label"><?php echo t('accountSettings'); ?></label>
            <div>
                <button id="changePasswordBtn" class="btn btn-default"><i class="fa fa-key"></i> <?php echo t('passwordChange'); ?></button>
                <button id="deleteAccountBtn" class="btn btn-default"><i class="fa fa-times"></i> <?php echo t('deleteAccount'); ?></button>
            </div>
        </div>

    </form>

</div>

<script id="langListTemplate" type="text/template">
    <div class="form-group learn-lang-control">
        <select name="learnLangs[]" class="form-control selectpicker">
        </select>
    </div>
</script>

<script src="/static/js/controllers/profile.js"></script>

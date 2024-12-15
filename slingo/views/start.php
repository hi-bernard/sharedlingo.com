<?php use SLingo\Core\User; ?>
<div id="appWrap">

    <div id="appHeader">
        <div class="logo block block-text"><?php echo t('appTitle'); ?></div>
        <div class="menu block block-right">
            <ul class="nav nav-pills">
                <li class="dropdown">
                    <a id="profileNameLink" href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <span class="name"><?php echo html(User::get('name')['first']); ?></span> <span class="caret"></span>
                    </a>
                    <ul id="profileMenu" class="dropdown-menu dropdown-menu-right">
                        <li><a class="logout-link" href="/auth/logout"><i class="fa fa-fw fa-sign-out"></i> <?php echo t('logout'); ?></a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>

    <div id="startTitle">
        <h1><?php echo t('hello', $user['name']['first']); ?></h1>
        <div class="subtitle"><?php echo t('helloText'); ?></div>
    </div>

    <div id="startFormContainer">

        <form id="startForm" method="POST" action="/start/save">

            <h3><?php echo t('whereAreYouFrom'); ?></h3>

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

            <h3><?php echo t('manOrWoman'); ?></h3>

            <div class="form-group">
                <select id="gender" name="gender" class="form-control selectpicker">
                    <option value="m"<?php if ('m'==$user['gender']) {?> selected="selected"<?php } ?>><?php echo t('male'); ?></option>
                    <option value="f"<?php if ('f'==$user['gender']) {?> selected="selected"<?php } ?>><?php echo t('female'); ?></option>
                    <option value="o"<?php if ('o'==$user['gender']) {?> selected="selected"<?php } ?>><?php echo t('otherGender'); ?></option>
                </select>
            </div>

            <h3><?php echo t('whenBorn'); ?></h3>

            <div class="form-group">
                <select id="bornYear" name="bornYear" class="form-control selectpicker" data-live-search="true">
                    <?php foreach($years as $year) { ?>
                        <option value="<?php echo $year; ?>"<?php if ($year==$user['bornYear']) {?> selected="selected"<?php } ?>><?php echo $year; ?></option>
                    <?php } ?>
                </select>
            </div>

            <h3><?php echo t('nativeLang'); ?></h3>

            <div class="form-group">
                <select name="nativeLangs[]" class="form-control selectpicker" multiple data-live-search="true" title="<?php echo t('selectPlaceholder'); ?>">
                        <?php foreach($langs as $code => $lang) { ?>
                            <option value="<?php echo $code; ?>"<?php if (in_array($code, $user['langs']['natives'])) {?> selected="selected"<?php } ?>><?php echo $lang; ?></option>
                        <?php } ?>
                    </select>
                    <span id="helpBlock" class="help-block"><?php echo t('multipleLangHint'); ?></span>
            </div>

            <h3><?php echo t('learnLang'); ?></h3>

            <div id="learnLangs">
                <div class="form-group learn-lang-control">
                    <select name="learnLangs[]" class="form-control selectpicker" multiple data-live-search="true" title="<?php echo t('selectPlaceholder'); ?>">
                        <?php foreach($langs as $code => $lang) { ?>
                            <option value="<?php echo $code; ?>"<?php if (in_array($code, $user['langs']['learns'])) {?> selected="selected"<?php } ?>><?php echo $lang; ?></option>
                        <?php } ?>
                    </select>
                    <span id="helpBlock" class="help-block"><?php echo t('multipleLangHint'); ?></span>
                </div>
            </div>

            <h3><?php echo t('introduce'); ?></h3>

            <div id="introduce">
                <div class="form-group">
                    <textarea name="bio" class="form-control"></textarea>
                </div>
            </div>

            <div class="form-group checkbox">
                <label>
                    <input type="checkbox" name="is_not_date" value="1"> <?php echo t('notDating'); ?>
                </label>
            </div>

            <div class="form-group checkbox">
                <label>
                    <input type="checkbox" name="is_not_rude" value="1"> <?php echo t('notRude'); ?>
                </label>
            </div>

            <button type="submit" class="btn btn-primary"><?php echo t('continue'); ?></button>

        </form>

    </div>

</div>

<script id="langListTemplate" type="text/template">
    <div class="form-group learn-lang-control">
        <select name="learnLangs[]" class="form-control selectpicker">
        </select>
    </div>
</script>

<script src="/static/js/pages/start.js"></script>

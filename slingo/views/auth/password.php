<div id="appWrap">

    <div id="appHeader">
        <div class="logo block block-text"><?php echo t('appTitle'); ?></div>
    </div>

    <div id="startTitle">
        <h1><?php echo t('passwordReset'); ?></h1>
    </div>

    <div id="startFormContainer">

        <form id="startForm" method="POST" action="/auth/password-submit/<?php echo $token; ?>">

            <div class="form-group">
                <label class="control-label" for="password"><?php echo t('account'); ?>:</label>
                <p class="form-control-static">
                    <?php echo html($member['name']['full']); ?>
                    <span class="label label-default"><?php echo $member['email']; ?></span>
                </p>
            </div>

            <div class="form-group">
                <label class="control-label" for="password"><?php echo t('newPassword'); ?>:</label>
                <input type="password" id="password" name="password" class="form-control" value="">
            </div>

            <div class="form-group">
                <label class="control-label" for="password2"><?php echo t('passwordRepeatNew'); ?>:</label>
                <input type="password" id="password2" name="password2" class="form-control" value="">
            </div>

            <button type="submit" class="btn btn-primary"><?php echo t('save'); ?></button>

            <div class="continue hidden">
                <a class="btn btn-primary" href="/app"><?php echo t('continue'); ?></a>
            </div>

        </form>

    </div>

</div>

<script src="/static/js/pages/auth.password.js"></script>

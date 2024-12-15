<div id="appWrap">

    <div id="appHeader">
        <div class="logo block block-text"><?php echo t('appTitle'); ?></div>
    </div>

    <div id="startTitle">
        <h1><?php echo t('passwordReset'); ?></h1>
    </div>

    <div id="startFormContainer">

        <form id="startForm" method="POST" action="/auth/reset-submit">

            <div class="form-group">
                <label class="control-label" for="email"><?php echo t('email'); ?>:</label>
                <input type="text" id="email" name="email" class="form-control" value="">
            </div>

            <button type="submit" class="btn btn-primary"><?php echo t('continue'); ?></button>

        </form>

    </div>

</div>

<script src="/static/js/pages/auth.reset.js"></script>

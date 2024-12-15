<div class="dialog-message">

    <form id="passwordForm" method="POST" action="/profile/password-save">

        <div class="form-group">
            <label class="control-label" for="current_password"><?php echo t('oldPassword'); ?>:</label>
            <input type="password" id="current_password" name="current_password" class="form-control" value="">
        </div>

        <div class="form-group">
            <label class="control-label" for="password"><?php echo t('newPassword'); ?>:</label>
            <input type="password" id="password" name="password" class="form-control" value="">
        </div>

        <div class="form-group">
            <label class="control-label" for="password2"><?php echo t('passwordRepeatNew'); ?>:</label>
            <input type="password" id="password2" name="password2" class="form-control" value="">
        </div>

    </form>

</div>

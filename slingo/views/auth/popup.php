<div id="signTabs">

    <div class="tabs-title">
        <ul class="tabs pull-left" role="tablist">
            <li class="active"><a href="#signIn" aria-controls="signIn" role="tab" data-toggle="tab"><?php echo t('signIn'); ?></a></li>
            <li><a href="#signUp" aria-controls="signUp" role="tab" data-toggle="tab"><?php echo t('newMember'); ?></a></li>
        </ul>
        <button class="btn-close pull-right"><i class="fa fa-times"></i></button>
    </div>

    <div class="tab-content">
        <div role="tabpanel" class="tab-pane active" id="signIn">
            <form id="signInForm" method="POST" action="/auth/login">

                <div class="form-group">
                    <label class="control-label" for="email"><?php echo t('email'); ?>:</label>
                    <input type="text" id="email" name="email" class="form-control">
                </div>

                <div class="form-group">
                    <label class="control-label" for="email"><?php echo t('password'); ?>:</label>
                    <input type="password" id="password" name="password" class="form-control">
                </div>

                <button type="submit" class="btn btn-primary"><?php echo t('signIn'); ?></button>

                <div class="checkbox">
                    <label>
                        <input type="checkbox" id="is_remember" name="is_remember" value="1" checked="checked"> <?php echo t('rememberMe'); ?>
                    </label>
                </div>

                <div class="forgot">
                    <a href="/auth/reset"><?php echo t('forgotPass'); ?></a>
                </div>

            </form>
        </div>
        <div role="tabpanel" class="tab-pane" id="signUp">
            <form id="signUpForm" method="POST" action="/auth/register">

                <div class="row">
                    <div class="col-xs-6">
                        <div class="form-group">
                            <label class="control-label" for="firstName"><?php echo t('firstName'); ?>:</label>
                            <input type="text" id="firstName" name="firstName" class="form-control">
                        </div>
                    </div>
                    <div class="col-xs-6">
                        <div class="form-group">
                            <label class="control-label" for="lastName"><?php echo t('lastName'); ?>:</label>
                            <input type="text" id="lastName" name="lastName" class="form-control">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="control-label" for="email"><?php echo t('email'); ?>:</label>
                    <input type="text" id="email" name="email" class="form-control">
                </div>

                <div class="form-group">
                    <label class="control-label" for="password"><?php echo t('password'); ?>:</label>
                    <input type="password" id="password" name="password" class="form-control">
                </div>

                <div class="form-group">
                    <label class="control-label" for="passwordRepeat"><?php echo t('passwordRepeat'); ?>:</label>
                    <input type="password" id="passwordRepeat" name="password2" class="form-control">
                </div>

                <button type="submit" class="btn btn-primary"><?php echo t('signUp'); ?></button>

            </form>

        </div>
    </div>

</div>
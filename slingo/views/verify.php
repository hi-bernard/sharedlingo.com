<div id="appWrap">

    <div id="appHeader">
        <div class="logo block block-text"><?php echo t('appTitle'); ?></div>
        <div class="menu block block-right">
            <ul class="nav nav-pills">
                <li class="dropdown">
                    <a id="profileNameLink" href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <span class="name"><?php echo html($user['name']['first']); ?></span> <span class="caret"></span>
                    </a>
                    <ul id="profileMenu" class="dropdown-menu dropdown-menu-right">
                        <li><a class="logout-link" href="/auth/logout"><i class="fa fa-fw fa-sign-out"></i> <?php echo t('logout'); ?></a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>

    <div id="startTitle">
        <h1><?php echo t('verifyTitle'); ?></h1>
        <div class="subtitle"><?php echo t('verifyText'); ?></div>
    </div>

    <div id="startFormContainer">

        <form method="POST" action="/start/verify">

            <p><?php echo t('verifyDescription', $user['email']); ?></p>

            <p><?php echo t('verifyResendText'); ?></p>

            <button id="resendBtn" type="submit" class="btn btn-primary" disabled="disabled"><?php echo t('verifyResend'); ?></button>

        </form>

    </div>

</div>

<script>
    var delay = <?php echo $delayTime; ?>;
    var $button = $('#resendBtn');
    var btnTitle = $button.text();
    function tick(){
        delay--;
        if (delay <= 0){
            $button.prop('disabled', false).text(btnTitle);
            return;
        }
        $button.text(btnTitle + ' (' + delay + ')');
        setTimeout(tick, 1000);
    }
    $button.text(btnTitle + ' (' + delay + ')');
    setTimeout(tick, 1000);
</script>

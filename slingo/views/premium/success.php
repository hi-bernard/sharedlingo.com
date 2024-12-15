<?php use SLingo\Core\User; ?>
<div id="appWrap">

    <div id="appHeader">
        <div class="logo block block-text"><?php echo t('appTitle'); ?></div>
    </div>

    <div id="startTitle">
        <h1><?php echo t('premiumSuccess'); ?></h1>
    </div>

    <div id="startFormContainer">

        <?php echo t('premiumSuccessText'); ?>

        <?php if (User::isLogged()){ ?>

            <div id="premiumStatus">
                <div class="status status-wait">
                    <i class="fa fa-fw fa-spin fa-spinner"></i> <?php echo t('premiumSuccessWait'); ?>
                </div>
                <div class="status status-done">
                    <i class="fa fa-fw fa-check"></i> <?php echo t('premiumSuccessDone'); ?>
                </div>
                <a class="continue btn btn-primary" href="/app"><?php echo t('continue'); ?></a>
            </div>

            <script>
                var attempts = 0;
                function test(){
                    $.post('/premium/test', {}, function(result){
                        if (result.premium){
                            $('#premiumStatus .status-wait').hide();
                            $('#premiumStatus .status-done').show();
                            return;
                        }
                        attempts++;
                        if (attempts < 20){
                            setTimeout('test();', 3000);
                        }
                    }, 'json');
                }
                $(function(){
                    setTimeout('test();', 2000);
                });
            </script>

        <?php } else { ?>

            <br><br>
            <div><a class="continue btn btn-primary" href="/"><?php echo t('continue'); ?></a></div>

        <?php } ?>

    </div>

</div>

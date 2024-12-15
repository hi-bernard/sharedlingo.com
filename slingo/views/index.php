<?php
    use SLingo\Core\Response;
    use SLingo\Core\Lang;
    $chatters = Lang::getPlural('chatterPlural', $onlinePeople);
    $countries = Lang::getPlural('countryPlural', $onlineCountries);
    $online = t('onlineStatLine', $chatters, $countries);
?>
<div id="indexWrap">

    <div id="hero" class="sprite-canvas">
        <div class="container">
            <h1><?php echo t('heroTitle'); ?></h1>
            <h2><?php echo t('heroTagline'); ?></h2>
            <div class="call-button">
                <a href="#" class="btn btn-success btn-lg"><?php echo t('heroButton'); ?></a>
            </div>
            <div id="onlineStatLine">
                <?php echo $online; ?>
            </div>
            <div class="dropdown" id="langSelector">
                <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    <?php echo Lang::getCurrentLangTitle(); ?>
                    <span class="caret"></span>
                </button>
                <ul class="dropdown-menu dropdown-menu-right">
                    <?php foreach(Lang::getSiteLanguagesList() as $id=>$title) { ?>
                        <li><a href="/lang/set/<?php echo $id; ?>"><?php echo $title; ?></a></li>
                    <?php } ?>
                </ul>
            </div>
        </div>
    </div>

    <div id="whatIs">
        <div class="container">
            <div class="col-md-6">
                <h2><?php echo t('whatIsIt'); ?></h2>
                <p><?php echo t('whatIsItText'); ?></p>
            </div>
            <div class="col-md-6">
                <h2><?php echo t('whatIsLE'); ?></h2>
                <p><?php echo t('whatIsLEText'); ?></p>
            </div>
        </div>
    </div>

    <div id="howItWorks" class="features-list">
        <div class="container">
            <div class="col-md-12">
                <h2><?php echo t('howItWorks'); ?></h2>
            </div>
        </div>
        <div class="container">
            <div class="col-md-4">
                <div class="step-1 item">
                    <i class="fa fa-angle-right"></i>
                    <h3><?php echo t('step1'); ?></h3>
                    <p>
                        <?php echo t('step1Text'); ?>
                    </p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="step-2 item">
                    <i class="fa fa-angle-right"></i>
                    <h3><?php echo t('step2'); ?></h3>
                    <p>
                        <?php echo t('step2Text'); ?>
                    </p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="step-3 item">
                    <h3><?php echo t('step3'); ?></h3>
                    <p>
                        <?php echo t('step3Text'); ?>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div id="features" class="features-list">
        <div class="container">
            <div class="col-md-12">
                <h2><?php echo t('features'); ?></h2>
            </div>
        </div>
        <div class="container">
            <div class="col-md-4">
                <div class="f-voice item">
                    <h3><?php echo t('featureVoice'); ?></h3>
                    <p>
                        <?php echo t('featureVoiceText'); ?>
                    </p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="f-games item">
                    <h3><?php echo t('featureGames'); ?></h3>
                    <p>
                        <?php echo t('featureGamesText'); ?>
                    </p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="f-mobile item">
                    <h3><?php echo t('featureMobile'); ?></h3>
                    <p>
                        <?php echo t('featureMobileText'); ?>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div id="joinUs">
        <div class="container">
            <div class="col-md-8">
                <h2><?php echo t('joinToday'); ?></h2>
                <h3><?php echo t('joinTodayText'); ?></h3>
                <div class="call-button">
                    <a href="#" class="btn btn-success btn-lg"><?php echo t('heroButton'); ?></a>
                </div>
            </div>
        </div>
    </div>

    <div id="dedicated">
        <div class="container">
            <div class="col-md-12">
                <h3><?php echo t('dedicated'); ?></h3>
                <p>
                    <?php echo t('dedicatedText'); ?>
                </p>
            </div>
        </div>
    </div>


    <div id="footer">
        <div class="container">
            <div class="pull-left"><?php echo t('copyright'); ?></div>
            <div class="pull-right">
                <i class="fa fa-envelope"></i>
                <a href="mailto:admin@sharedlingo.com"><?php echo t('contact'); ?></a>
            </div>
        </div>
    </div>
</div>

<div class="dialog-modal-overlay"></div>
<div id="authDialog">
    <?php echo Response::render('auth/popup'); ?>
</div>

<script src="/static/js/pages/index.js"></script>

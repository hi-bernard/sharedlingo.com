<?php use SLingo\Core\Request; ?>
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title><?php echo t('siteTitle'); ?></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="shortcut icon" type="image/png" href="/favicon.ico">
        <link href='https://fonts.googleapis.com/css?family=Raleway' rel='stylesheet' type='text/css'>
        <?php echo css(Request::isMobile() ? 'mobile' : 'global'); ?>
        <?php echo js('global'); ?>
    </head>
    <body>
        <?php echo $html; ?>
        <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD4NdbN0UNPnE8hBLgQGE3daSzOsMupIJU"></script>
        <script src='https://www.google.com/recaptcha/api.js?render=explicit'></script>
        <script>
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
            ga('create', 'UA-68447219-2', 'auto');
            ga('send', 'pageview');
        </script>
    </body>
</html>

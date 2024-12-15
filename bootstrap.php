<?php

    session_start();

    ini_set('default_socket_timeout', 2);

    define('ROOT_PATH', dirname(__FILE__));

    mb_internal_encoding('UTF-8');

    require_once ROOT_PATH . '/slingo/loader.php';

    spl_autoload_register(['\SLingo\Loader', 'autoLoad']);

    \SLingo\Core\User::init();
    \SLingo\Core\Lang::init(\SLingo\Core\User::getLanguage());

    \SLingo\Core\User::update();

    require_once ROOT_PATH . '/slingo/helpers.php';

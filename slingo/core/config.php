<?php

namespace SLingo\Core;

use SLingo\Core\Request;

class Config {

    private static $data = [];

    public static function get($key){

        if (!self::$data) { self::load(); }

        return isset(self::$data[$key]) ? self::$data[$key] : false;

    }

    private static function load(){

        self::$data = include_once ROOT_PATH . '/slingo/config.php';

    }

    public static function isProduction(){
        return !self::isDev();
    }

    public static function isDev(){
        return Request::getHostIP() == '127.0.0.1';
    }

    public static function getBuildList($list){

        $listFile = ROOT_PATH . '/build/' .$list .'.list';

        $content = trim(file_get_contents($listFile));

        $items = array_filter(explode("\n", $content));

        return $items;

    }

}

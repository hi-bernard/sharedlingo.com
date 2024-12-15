<?php

namespace SLingo\Core;

class Request {

    private static $getData = [];
    private static $isMobile = null;

    public static function get($key, $default = false){
        return empty(self::$getData[$key]) ? $default : self::$getData[$key];
    }

    public static function post($key, $default = false){
        return empty($_POST[$key]) ? $default : $_POST[$key];
    }

    public static function postHas($key){
        return isset($_POST[$key]);
    }

    public static function server($key){
        return filter_input(INPUT_SERVER, $key);
    }

    public static function isAjax(){
        return self::server('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest';
    }

    public static function isMobile(){
//        return true;
        if (self::$isMobile !== null){
            return self::$isMobile;
        }
        \SLingo\Loader::loadLibrary('mobiledetect.php');
        $detect = new \Mobile_Detect();
        self::$isMobile = $detect->isMobile();
        return self::$isMobile;
    }

    public static function getHost(){
        return self::getHostIP() == '127.0.0.1' ? 'sharedlingo' : 'sharedlingo.com';
    }

    public static function getHostIP(){
        return self::server('SERVER_ADDR');
    }

    public static function getList($list){

        $data = [];

        foreach($list as $key){
            $data[$key] = self::post($key);
        }

        return $data;

    }

    public static function setGetData($getData){
        self::$getData = $getData;
    }

}

<?php

namespace SLingo\Core;
use SLingo\Core\Storage;
use SLingo\Core\Lang;

class User {

    private static $ip;
    private static $browserLang;
    private static $lang;

    private static $data = [];

    public static function init(){

        self::$ip = filter_input(INPUT_SERVER, 'REMOTE_ADDR');
        if (self::$ip == '127.0.0.1') { self::$ip = '5.141.125.92'; }

        self::$browserLang = strtoupper(substr(filter_input(INPUT_SERVER, 'HTTP_ACCEPT_LANGUAGE'), 0, 2));

        self::$lang = empty($_SESSION['user_lang']) ? self::getBrowserLanguage() : $_SESSION['user_lang'];

    }

    public static function update(){

        if (!self::isLogged() && self::getCookie('auth')){
            self::autoLogin();
        }

        if (self::isLogged()){

            $membersCollection = Storage::get('members');
            self::$data = $membersCollection->findOne(['_id' => self::getMongoId()]);

            if (self::isAdmin()){
                Lang::load('admin.server', 'en');
            }

            if (self::isModerator()){
                Lang::load('moderator.server', 'en');
            }

        }

    }

    public static function getIp(){
        return self::$ip;
    }

    public static function getBrowserLanguage(){
        return self::$browserLang;
    }

    public static function getLanguage(){
        return self::$lang;
    }

    public static function getToken(){
        return self::get('token');
    }

    public static function getId(){
        return self::isLogged() ? $_SESSION['user_id'] : 0;
    }

    public static function getMongoId(){
        return Storage::getMongoId(self::getId());
    }

    public static function get($field, $default = false){
        return isset(self::$data[$field]) ? self::$data[$field] : $default;
    }

    public static function set($field, $value){
        self::$data[$field] = $value;
    }

    public static function getData(){
        return self::$data;
    }

    public static function autoLogin(){

        if (self::isLogged()) { return; }

        $authToken = self::getCookie('auth');

        if (!$authToken || !preg_match('/^[0-9a-f]{32}$/i', $authToken)) { return; }

        $membersCollection = Storage::get('members');

        $member = $membersCollection->findOne(['auth_token' => $authToken]);

        if ($member === null){ return; }

        self::login($member['_id'], true);

    }

    public static function login($id, $isRemember=false){

        $membersCollection = Storage::get('members');

        $sessionToken = self::getRandomToken();
        $authToken = self::getRandomToken();

        $setValues = [
            'dates.online' => new \MongoDate(),
            'token' => $sessionToken,
            'auth_token' => $authToken,
            'ip' => filter_input(INPUT_SERVER, 'REMOTE_ADDR')
        ];

        $authTime = $isRemember ? 3600 * 24 * 30 : 0;

        self::setCookiePublic('auth', $authToken, $authTime);

        $membersCollection->update(['_id' => $id], [
            '$set' => $setValues
        ]);

        $_SESSION['user_id'] = $id . '';

        Events::trigger('members.login', $id . '');

    }

    public static function logout(){
        unset($_SESSION['user_id']);
        self::unsetCookie('auth');
    }

    public static function isLogged(){
        return isset($_SESSION['user_id']);
    }

    public static function isAdmin(){
        return self::get('admin');
    }

    public static function isModerator(){
        return self::get('moderator');
    }

    public static function isPremium($isNotAdmin = false){
        return self::get('premium') || (self::get('admin') && !$isNotAdmin);
    }

    public static function isFriendTo($friendId){

        if (empty(self::get('friends'))) { return false; }

        return in_array($friendId, self::get('friends'));

    }

    public static function getRandomToken(){
        return md5(implode(':', [microtime(), rand(0,1000), User::getIp()]));
    }

    public static function setCookie($key, $value, $time=0, $path='/', $http_only=true){
        $expire = $time ? time()+$time : 0;
        setcookie("sl-{$key}", $value, $expire, $path, null, false, $http_only);
        return;
    }

    public static function setCookiePublic($key, $value, $time=0, $path='/'){
        return self::setCookie($key, $value, $time, $path, false);
    }

    public static function unsetCookie($key){
        setcookie("sl-{$key}", '', time()-3600, '/');
        return;
    }

    public static function getCookie($key){
        return filter_input(INPUT_COOKIE, "sl-{$key}");
    }

}

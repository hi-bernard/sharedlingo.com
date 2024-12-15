<?php

namespace SLingo\Core;

use SLingo\Core\Config;

class Lang {

    private static $defaultLang = 'en';

    private static $langs;
    private static $lang;
    private static $phrases = [];

    public static function init($lang){

        self::$langs = Config::get('langs');

        $lang = mb_strtolower($lang);

        if (!self::isLangExists($lang)){
            $lang = self::$defaultLang;
        }

        self::$lang = $lang;

        self::load('server');

    }

    public static function isLangExists($lang){

        return isset(self::$langs[$lang]);

    }

    public static function load($file, $lang=false){

        if (!$lang) { $lang = self::$lang; }

        $phrases = self::getPhrases($file, $lang);

        if (is_array($phrases)){
            self::$phrases = array_merge(self::$phrases, $phrases);
        }

    }

    public static function getPhrases($file, $lang=false){

        if (!$lang) { $lang = self::$lang; }

        $langFile = ROOT_PATH . '/slingo/langs/' . $lang . '/' . $file . '.php';

        $result = include_once $langFile;

        return $result;

    }

    public static function get($phraseId){

        if (!isset(self::$phrases[$phraseId])){ return $phraseId; }

        $phrase = self::$phrases[$phraseId];

        if (is_array($phrase)){
            $phrase = implode("\n", $phrase);
        }

        if (func_num_args() > 1){
            $formatArguments = func_get_args();
            $formatArguments[0] = $phrase;
            $phrase = call_user_func_array('sprintf', $formatArguments);
        }

        return $phrase;

    }

    public static function getCurrentLangId(){

        return self::$lang;

    }

    public static function getCurrentLangTitle(){

        return self::$langs[self::$lang];

    }

    public static function getSiteLanguagesList(){

        return self::$langs;

    }

    public static function getLanguagesList(){

        $langsListFile = ROOT_PATH . '/slingo/langs/' . self::$lang . '/languages.php';

        return include $langsListFile;

    }

    public static function getCountriesList(){

        $langsListFile = ROOT_PATH . '/slingo/langs/' . self::$lang . '/countries.php';

        return include $langsListFile;

    }

    public static function getPlural($phraseId, $number) {

        $plural = self::get($phraseId);

        list($one, $two, $many) = explode(',', $plural);

        if (mb_strstr($number, '.')){ return $number.' '.$two; }
        if ($number==0){ return '0 ' . $many; }

        if ($number%10==1 && $number%100!=11){ return $number.' '.$one; }
        elseif($number%10>=2 && $number%10<=4 && ($number%100<10 || $number%100>=20)){
            return $number.' '.$two;
        }
        else{
            return $number.' '.$many;
        }

        return $number.' '.$one;

    }

}

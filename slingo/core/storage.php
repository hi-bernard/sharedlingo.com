<?php

namespace SLingo\Core;

use SLingo\Core\Config;

class Storage {

    private static $isConnected = false;
    private static $connection;
    private static $db;

    private static function connect(){

        self::$connection = new \MongoClient();

        $dbName = Config::get('dbName');

        self::$db = self::$connection->{$dbName};

        self::$isConnected = true;

    }

    public static function get($collectionName){

        if (!self::$isConnected) { self::connect(); }

        return self::$db->{$collectionName};

    }

    public static function getMongoId($stringId){
        return new \MongoId($stringId);
    }

}

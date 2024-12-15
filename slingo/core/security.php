<?php

namespace SLingo\Core;

class Security {

    public static function isTOR($ip){

        $serverIp = $_SERVER['SERVER_ADDR'];
        $serverPort = '80';

        $query = implode('.', [
            self::getReversedIpString($ip),
            $serverPort,
            self::getReversedIpString($serverIp),
            'ip-port.exitlist.torproject.org'
        ]);

        exec("dig {$query}", $output);

        $result = implode("\n", $output);

        return mb_strstr($result, '127.0.0.2');

    }

    private static function getReversedIpString($ip){
        $parts = explode('.', $ip);
        return implode('.', array_reverse($parts));
    }

}

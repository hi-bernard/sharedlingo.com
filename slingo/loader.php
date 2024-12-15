<?php

namespace SLingo;

class Loader {

    public static function autoLoad($className){

        $pathSegments = explode('\\', mb_strtolower($className));

        $path = ROOT_PATH . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $pathSegments);

        $file = $path . '.php';

        include_once $file;

    }

    public static function loadLibrary($libraryFile) {

        return include_once ROOT_PATH . '/slingo/libs/' . $libraryFile;

    }

}


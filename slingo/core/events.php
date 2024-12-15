<?php

namespace SLingo\Core;

use SLingo\Core\Controller;

class Events {

    private static $isLoaded = false;
    private static $hooksList = [];
    private static $listeners = [];
    
    public static function trigger($eventName, $data = []){

        self::loadHooksList();
        
        if (!isset(self::$hooksList[$eventName])){ return $data; }
        
        $workers = self::$hooksList[$eventName];
        
        foreach($workers as $worker){
            
            if (!is_array($worker) || count($worker) != 2) { continue; }
            
            $controllerName = $worker[0];
            $methodName = $worker[1];
            
            if (!isset(self::$listeners[$controllerName])){
                self::$listeners[$controllerName] = Controller::get($controllerName);
                if (!self::$listeners[$controllerName]) { continue; }
            }
            
            $controller = self::$listeners[$controllerName];
            
            if (!$controller->isMethodExists($methodName)) { continue; }
            
            $controller->beforeHook();
            
            $data = $controller->executeMethod($methodName, [$data]);            
            
            $controller->afterHook();
            
        }
        
        return $data;
        
    }
    
    private static function loadHooksList(){
        
        if (self::$isLoaded) { return; }
        
        $hooksListFile = ROOT_PATH . '/slingo/hooks.php';
        
        self::$hooksList = include_once $hooksListFile;
        
        self::$isLoaded = true;
        
    }
    
}

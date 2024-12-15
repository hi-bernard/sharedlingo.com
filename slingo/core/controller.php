<?php

namespace SLingo\Core;

class Controller {

    public $isAuthRequired = false;
    public $isAjaxOnly = false;
    public $isAdminOnly = false;
    public $isModeratorOnly = false;

    public function beforeAction(){}
    public function afterAction(){}
    public function beforeHook(){}
    public function afterHook(){}

    public function isMethodExists($methodName){
        return method_exists($this, $methodName);
    }

    public function isActionExists($actionName){
        return $this->isMethodExists(self::getActionMethodName($actionName));
    }

    public function executeMethod($methodName, $params = []){
        return call_user_func_array([$this, $methodName], $params);
    }

    public function executeAction($actionName, $params = []){

        $actionMethod = self::getActionMethodName($actionName);

        $this->beforeAction();

        $this->executeMethod($actionMethod, $params);

        $this->afterAction();

    }

    private static function getActionMethodName($actionName){
        return 'action' . stringToCamel($actionName);
    }

    public static function get($controllerName){

        $controllerFile = ROOT_PATH . '/slingo/controllers/' . $controllerName . '.php';

        if (!file_exists($controllerFile)){ return false; }

        $controllerClass = "slingo\\controllers\\{$controllerName}";

        $controllerObject = new $controllerClass();

        return $controllerObject;

    }

}

<?php

namespace SLingo\Core;

use SLingo\Core\Controller;
use SLingo\Core\Response;
use SLingo\Core\Request;
use SLingo\Core\User;

class Router {

    public static function route(){

        $rawUri = trim(filter_input(INPUT_SERVER, 'REQUEST_URI'), '/');

        $queryParts = mb_strstr($rawUri, '?') ? explode('?', $rawUri) : [$rawUri];

        $uri = $queryParts[0];

        if (!empty($queryParts[1])){
            $getData = [];
            parse_str($queryParts[1], $getData);
            Request::setGetData($getData);
        }

        if ($uri && !preg_match('/^([a-zA-Z0-9\-_\/]+)$/i', $uri)){
            Response::error404();
        }

        if (!$uri) {
            self::execute('index');
            return;
        }

        $uriSegments = explode('/', $uri);

        $controller = $uriSegments[0];
        $action = empty($uriSegments[1]) ? 'index' : $uriSegments[1];
        $params = count($uriSegments > 2) ? array_slice($uriSegments, 2) : [];

        self::execute($controller, $action, $params);

    }

    private static function execute($controllerName, $actionName = 'index', $params = []){

        $controller = Controller::get($controllerName);

        if (!$controller) { Response::error404(); }
        if (!$controller->isActionExists($actionName)){ Response::error404(); }

        if ($controller->isAuthRequired && !User::isLogged()) { Response::error404(); }
        if ($controller->isAdminOnly && !User::isAdmin()) { Response::error404(); }
        if ($controller->isModeratorOnly && !User::isModerator()) { Response::error404(); }
        if ($controller->isAjaxOnly && !Request::isAjax()) { Response::error404(); }

        $controller->executeAction($actionName, $params);

        Response::send();

    }

}

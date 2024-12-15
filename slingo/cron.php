<?php

    require '../bootstrap.php';

    $tasks = [
        'premium' => [
            'checkExpiredMembers',
            'notifyUpcomingExpiredMembers',
            'deleteExpiredRoomLogs'
        ]
    ];

    $results = [];

    foreach ($tasks as $controllerId => $methods){

        if (!is_array($methods)){ $methods = [$methods]; }

        $controller = SLingo\Core\Controller::get($controllerId);

        foreach($methods as $methodName){
            $result = $controller->executeMethod($methodName);
            if ($result){
                $results[] = $result;
            }
        }

    }

    echo "\n" . 'Cron Report ' . date('Y-m-d H:i:s');
    echo "\n" . '------------------------------------';
    echo "\n\n";

    foreach($results as $line){
        echo $line . "\n";
    }


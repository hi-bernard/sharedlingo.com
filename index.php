<?php

    require 'bootstrap.php';

//    $p = SLingo\Core\Controller::get('premium');
//
//    $r = $p->processPayment([
//        'custom' => '57d7c5bb506bf9502e7b23c6',
//        'item_number' => '1',
//        'mc_gross' => '9.00'
//    ]);
//
//    var_dump($r); die();

    SLingo\Core\Router::route();

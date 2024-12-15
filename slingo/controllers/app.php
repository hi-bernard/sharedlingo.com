<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Response;
use SLingo\Core\Request;
use SLingo\Core\Lang;
use SLingo\Core\User;

class app extends Controller {

    public function actionIndex(){

        if (!User::isLogged()){
            Response::redirect('/');
        }

        if (User::get('banned')){
            User::logout();
            Response::redirect('/');
        }

        $user = User::getData();

        if (empty($user['verified']) && !empty($user['verify_code'])){
            Response::redirect('/start/verify');
        }

        if (!$user['location']) {
            Response::redirect('/start');
        }

        $langs = Lang::getLanguagesList();

        $rooms = [];

        if (User::isModerator()) {
            $rooms['team'] = t('teamRoom');
        }

        foreach($user['langs']['learns'] as $lang){
            if (isset($rooms[$lang])) { continue; }
            $rooms[$lang] = $langs[$lang];
            if (count($rooms) == 4) { break; }
        }

        if (count($rooms) < 4){
            foreach($user['langs']['natives'] as $lang){
                $rooms[$lang] = $langs[$lang];
                if (count($rooms) == 4) { break; }
            }
        }

        $isMobile = Request::isMobile();
        $view = $isMobile ? 'app.mobile' : 'app';

        Response::page($view, [
            'user' => $user,
            'rooms' => $rooms,
        ]);

    }

    public function actionServers(){

        $url = 'https://service.xirsys.com/ice';
        $params = [
            'ident' => 'sharedlingo',
            'secret' => '4605bef2-8eab-11e5-af51-6a6f3e60bfdc',
            'domain' => 'sharedlingo.com',
            'application' => 'default',
            'room' => 'default'
        ];

        $query = $url . '?' . http_build_query($params);

        $data = json_decode(file_get_contents($query), true);

        $servers = [];

        if ($data['s'] != 200){
            $servers = [
                'iceServers' => [
                    ['url' => 'stun:stun1.l.google.com:19302']
                ]
            ];
            Response::json($servers);
        }

        $servers = $data['d'];

        Response::json($servers);

    }

}

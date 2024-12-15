<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Response;
use SLingo\Core\Lang;
use SLingo\Core\User;

class loader extends Controller {

    public $isAjaxOnly = true;
    public $isAuthRequired = true;

    public function actionData(){

        $phrases = Lang::getPhrases('client');

        if (User::isAdmin()){
            $phrases = array_merge($phrases, Lang::getPhrases('admin.client', 'en'));
        }

        if (User::isModerator()){
            $phrases = array_merge($phrases, Lang::getPhrases('moderator.client', 'en'));
        }

        $data = [
            'phrases' => $phrases,
            'countries' => Lang::getCountriesList(),
            'langs' => Lang::getLanguagesList(),
            'blacklist' => User::get('blacklist', []),
            'user' => User::getId()
        ];

        Response::json($data);

    }

}

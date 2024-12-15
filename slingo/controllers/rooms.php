<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Response;
use SLingo\Core\Lang;
use SLingo\Core\User;

class rooms extends Controller {

    public $isAjaxOnly = true;
    public $isAuthRequired = true;

    public function actionList(){

        $langsList = Lang::getLanguagesList();

        $user = User::getData();

        $userLangs = [];

        foreach($user['langs']['learns'] as $lang){
            if (isset($userLangs[$lang])) { continue; }
            $userLangs[$lang] = $langsList[$lang];
        }

        foreach($user['langs']['natives'] as $lang){
            $userLangs[$lang] = $langsList[$lang];
        }

        $langs = $userLangs + ['-' => '-'] + $langsList;

        if (User::isModerator()) {
            $langs = ['team' => t('teamRoom')] + ['--' => '-'] + $langs;
        }

        Response::view('rooms', [
            'langs' => $langs,
        ]);

    }

}

<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Response;

class lang extends Controller {

    public function actionSet($lang){

        if (!preg_match('/^([a-z]{2})$/', $lang)) {
            Response::error404();
        }

        $_SESSION['user_lang'] = $lang;

        Response::redirect('/');

    }

}

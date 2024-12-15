<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Response;
use SLingo\Core\Storage;
use SLingo\Core\Lang;
use SLingo\Core\User;

class index extends Controller {

    public function actionIndex(){

        if (User::isLogged()){
            Response::redirect('/app');
        }

        $onlineMembers = Storage::get('members')->find(['online' => true]);

        $onlinePeople = $onlineMembers->count(true);
        $onlineCountries = 0;
        $onlineCountriesList = [];

        if ($onlinePeople > 0){
            foreach($onlineMembers as $member){
                $country = $member['location']['countryCode'];
                if (!in_array($country, $onlineCountriesList)){
                    $onlineCountries++;
                    $onlineCountriesList[] = $country;
                }
            }
        }

        Lang::load('site');

        Response::page('index', [
            'onlinePeople' => $onlinePeople,
            'onlineCountries' => $onlineCountries
        ]);

    }

}

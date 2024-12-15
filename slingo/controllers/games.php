<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Lang;
use SLingo\Core\Response;

class games extends Controller {

    public $isAjaxOnly = true;
    public $isAuthRequired = true;

    public function actionCreate(){

        $games = [
            'Alias' => [
                'title' => t('gameAlias'),
                'rules' => t('gameAliasRules'),
                'langs' => ['EN', 'ES', 'DE', 'RU', 'PT', 'FR']
            ],
            'Builder' => [
                'title' => t('gameBuilder'),
                'rules' => t('gameBuilderRules'),
                'langs' => ['EN', 'ES', 'DE', 'RU', 'PT', 'FR']
            ]
        ];

        $gamesLangsList = [];
        $langsList = Lang::getLanguagesList();

        foreach($games as $game){
            foreach($game['langs'] as $lang){
                $gamesLangsList[$lang] = $langsList[$lang];
            }
        }

        Response::view('games/create', [
            'langs' => $gamesLangsList,
            'games' => $games
        ]);

    }

}

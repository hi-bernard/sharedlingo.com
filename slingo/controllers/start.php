<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Mailer;
use SLingo\Core\Request;
use SLingo\Core\Response;
use SLingo\Core\Lang;
use SLingo\Core\Storage;
use SLingo\Core\Validator;
use SLingo\Core\User;

class start extends Controller {

    public function actionIndex(){

        if (!User::isLogged()){
            Response::redirect('/');
        }

        $user = User::getData();

        $countriesList = Lang::getCountriesList();
        $langsList = Lang::getLanguagesList();

        \SLingo\Loader::loadLibrary('geoplugin.php');
        $geoplugin = new \geoPlugin();
        $geoplugin->locate(User::getIp());

        if (empty($user['location'])){
            $user['location'] = [
                'countryCode' => $geoplugin->countryCode,
                'country' => $geoplugin->countryName,
                'city' => $geoplugin->city,
            ];
        }

        $maxYear = intval(date('Y'));
        $minYear = $maxYear - 100;
        $years = range($maxYear-14, $minYear);

        if (empty($user['bornYear'])){ $user['bornYear'] = 1985; }
        if (empty($user['gender'])){ $user['gender'] = 'm'; }

        if (empty($user['langs']['natives'])){
            $user['langs']['natives'] = [User::getBrowserLanguage()];
        }

        if (empty($user['langs']['learns'])){
            $user['langs']['learns'] = [''];
        }

        Response::page('start', [
            'user' => $user,
            'countries' => $countriesList,
            'langs' => $langsList,
            'years' => $years
        ]);

    }

    public function actionVerify($code = false){

        if ($code){
            $this->verifyCode($code);
            return;
        }

        if (!User::isLogged()){
            Response::redirect('/');
        }

        $user = User::getData();

        if (!empty($user['verified'])){
            Response::redirect('/app');
        }

        if (empty($user['verify_sent_time']) || (time() - $user['verify_sent_time'] > 60)){
            $this->sendVerificationEmail();
            $user['verify_sent_time'] = time();
        }

        $delayTime = empty($user['verify_sent_time']) ? 60 : 60 - (time() - $user['verify_sent_time']);

        Response::page('verify', [
            'user' => $user,
            'delayTime' => $delayTime
        ]);

    }

    public function actionSave(){

        if (!Request::isAjax()) { Response::error404(); }

        $maxYear = intval(date('Y'));
        $minYear = $maxYear - 100;

        $fields = [
            'countryCode' => [['required'], ['len', 2], ['alpha']],
            'city' => [['required']],
            'gender' => [['required'], ['in', ['m', 'f', 'o']]],
            'bornYear' => [['required'], ['min', $minYear], ['max', $maxYear]],
            'nativeLangs' => [['required'], ['code']],
            'learnLangs' => [['required'], ['code']],
            'is_not_date' => [['required']],
            'is_not_rude' => [['required']],
            'bio' => []
        ];

        $validator = new Validator();

        $errors = $validator->validate($fields);

        if ($errors){
            if (isset($errors['nativeLangs'])){
                Response::json(['success'=>false, 'alert'=>t('nativeLangsError')]);
            }
            if (isset($errors['learnLangs'])){
                Response::json(['success'=>false, 'alert'=>t('learnLangsError')]);
            }
            Response::json(['success' => false, 'errors' => $errors]);
        }

        $data = Request::getList(array_keys($fields));

        $membersCollection = Storage::get('members');

        $membersCollection->update(['_id' => User::getMongoId()], [
            '$set' => [
                'gender' => $data['gender'],
                'bornYear' => $data['bornYear'],
                'location' => [
                    'countryCode' => $data['countryCode'],
                    'city' => $data['city'],
                ],
                'langs' => [
                    'natives' => $data['nativeLangs'],
                    'learns' => $data['learnLangs']
                ],
                'bio' => $data['bio'],
                'verify_code' => mb_substr(md5(User::getId() . session_id() . microtime()), 0, 8)
            ]
        ]);

        Response::json(['success' => true, 'url' => '/start/verify']);

    }

    private function sendVerificationEmail(){

        $user = User::getData();

        $mailer = new Mailer();

        $url = 'https://' . Request::getHost() . '/start/verify/' . $user['verify_code'];

        $result = $mailer->sendLetter('verify', $user['email'], [
            'name' => $user['name']['first'],
            'url' => $url
        ]);

        Storage::get('members')->update(['_id' => User::getMongoId()], [
            '$set' => [
                'verify_sent_time' => time()
            ]
        ]);

        return $result;

    }

    private function verifyCode($code){

        $membersCollection = Storage::get('members');

        $member = $membersCollection->findOne(['verify_code' => $code]);

        if (!$member) { Response::error404(); }

        if (empty($member['verified'])){

            $membersCollection->update(['_id' => $member['_id']], [
                '$set' => [
                    'verified' => true,
                    'verify_date' => new \MongoDate()
                ]
            ]);

        }

        if (!User::isLogged()){
            User::login($member['_id'], true);
        }

        Response::redirect('/app');

    }

}

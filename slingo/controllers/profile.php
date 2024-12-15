<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Lang;
use SLingo\Core\Members;
use SLingo\Core\Response;
use SLingo\Core\Request;
use SLingo\Core\Storage;
use SLingo\Core\Validator;
use SLingo\Core\User;

class profile extends Controller {

    public $isAjaxOnly = true;
    public $isAuthRequired = true;

    public function actionView(){

        $id = Request::post('id');

        $membersCollection = Storage::get('members');

        $member = $membersCollection->findOne(['_id' => Storage::getMongoId($id)]);

        if (!$member) {
            Response::view('profile/notfound');
            return;
        }

        Response::view('profile/view', [
            'member' => Members::parse($member)
        ]);

    }

    public function actionEdit(){

        $countriesList = Lang::getCountriesList();
        $langsList = Lang::getLanguagesList();

        $maxYear = intval(date('Y'));
        $minYear = $maxYear - 100;
        $years = range($maxYear, $minYear);

        Response::view('profile/edit', [
            'user' => User::getData(),
            'countries' => $countriesList,
            'langs' => $langsList,
            'years' => $years
        ]);

    }

    public function actionSave(){

        $member = Members::getMember(User::getId());

        $maxYear = intval(date('Y'));
        $minYear = $maxYear - 100;

        $fields = [
            'firstName' => [['required'], ['minlen', 2]],
            'lastName' => [['required'], ['minlen', 2]],
            'countryCode' => [['required'], ['code']],
            'city' => [['required']],
            'gender' => [['required'], ['in', ['m', 'f', 'o']]],
            'bornYear' => [['required'], ['min', $minYear], ['max', $maxYear]],
            'nativeLangs' => [['required'], ['code']],
            'learnLangs' => [['required'], ['code']],
            'bio' => []
        ];

        $isNameChangedAlready = !empty($member['name']['changed']);

        if ($isNameChangedAlready){
            unset($fields['firstName']);
            unset($fields['lastName']);
        }

        $validator = new Validator();

        $errors = $validator->validate($fields);

        if ($errors){
            Response::json(['success' => false, 'errors' => $errors]);
        }

        $data = Request::getList(array_keys($fields));

        $isNameChangedNow = !$isNameChangedAlready &&
                            (($data['firstName'] != $member['name']['first']) || ($data['lastName'] != $member['name']['last']));

        $updateData = [
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
            'bio' => $data['bio']
        ];

        if ($isNameChangedNow){
            $updateData['name'] = [
                'first' => $data['firstName'],
                'last' => $data['lastName'],
                'full' => trim($data['firstName'] . ' ' . $data['lastName']),
                'old' => $member['name']['full'],
                'changed' => true
            ];
        }

        Storage::get('members')->update(['_id' => User::getMongoId()], [
            '$set' => $updateData
        ]);

        Response::json(['success' => true, 'url' => '/app']);

    }

    public function actionPassword(){

        Response::view('profile/password');

    }

    public function actionPasswordSave(){

        $fields = [
            'current_password' => [['required']],
            'password' => [['required']],
            'password2' => [['required'], ['match', Request::post('password')]]
        ];

        $validator = new Validator();

        $errors = $validator->validate($fields);

        if ($errors){
            Response::json(['success' => false, 'errors' => $errors]);
        }

        $data = Request::getList(array_keys($fields));

        if (sha1($data['current_password']) !== User::get('password')){
            Response::json(['success' => false, 'errors' => [
                'current_password' => t('passwordMismatch')
            ]]);
        }

        $membersCollection = Storage::get('members');

        $membersCollection->update(['_id' => User::getMongoId()], [
            '$set' => [
                'password' => sha1($data['password'])
            ]
        ]);

        Response::json(['success' => true]);

    }

    public function actionColor(){

        if (!User::isPremium()){ Response::error404(); }

        $member = Members::parse(User::getData());

        switch ($member['gender']){
            case 'm' : $defaultColor = '#2980B9'; break;
            case 'f' : $defaultColor = '#D95459'; break;
            default: $defaultColor = '#586474';
        }

        $color = $defaultColor;

        if (!empty($member['name']['color'])) {
            $color = $member['name']['color'];
        }

        Response::view('profile/color', [
            'user' => $member,
            'color' => $color,
            'defaultColor' => $defaultColor,
        ]);

    }

    public function actionColorSave(){

        if (!User::isPremium()){ Response::error404(); }

        $fields = [
            'color' => [['required'], ['color']],
        ];

        $validator = new Validator();

        $errors = $validator->validate($fields);

        if ($errors){
            Response::json(['success' => false, 'errors' => $errors]);
        }

        $data = Request::getList(array_keys($fields));

        $hex = hexdec(mb_substr($data['color'], 1));
        $r = 0xFF & ($hex >> 0x10);
        $g = 0xFF & ($hex >> 0x8);
        $b = 0xFF & $hex;
        $power = round((($r * 299) + ($g * 587) + ($b * 114)) /1000);

        if ($power > 160 || $power < 40) {
            Response::json(['success' => false]);
        }

        $membersCollection = Storage::get('members');

        $membersCollection->update(['_id' => User::getMongoId()], [
            '$set' => [
                'name.color' => $data['color']
            ]
        ]);

        Response::json(['success' => true]);

    }

}

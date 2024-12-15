<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Request;
use SLingo\Core\Response;
use SLingo\Core\Storage;
use SLingo\Core\Lang;
use SLingo\Core\User;

class members extends Controller {

    private $limit = 30;

    public $isAjaxOnly = true;
    public $isAuthRequired = true;

    public function actionDialog(){

        $mode = Request::post('mode', 'all');

        if (!in_array($mode, ['all', 'friends'])){
            Response::error404();
        }

        $countriesList = Lang::getCountriesList();
        $langsList = Lang::getLanguagesList();

        $user = User::getData();
        $userLangs = [];

        foreach($user['langs']['natives'] as $lang){
            $userLangs[$lang] = $langsList[$lang];
        }

        foreach($user['langs']['learns'] as $lang){
            if (isset($userLangs[$lang])) { continue; }
            $userLangs[$lang] = $langsList[$lang];
        }

        $langs = $userLangs + ['-'=>'-'] + $langsList;

        $view = Request::isMobile() ? 'members/dialog.mobile' : 'members/dialog';

        Response::view($view, [
            'mode' => $mode,
            'user' => $user,
            'countries' => $countriesList,
            'langs' => $langs,
            'skip' => $this->limit,
        ]);

    }

    public function actionGet(){

        usleep(100000);

        $country = Request::post('country');
        $native = Request::post('native');
        $learns = Request::post('learns');
        $name = Request::post('name');
        $skip = Request::post('skip', 0);

        $mode = Request::post('mode', 'all');

        if (!in_array($mode, ['all', 'friends'])){
            Response::error404();
        }

        $filters = [];

        if (!empty($country) && preg_match('/^([A-Z]{2})$/', $country)){
            $filters['country'] = $country;
        }
        if (!empty($native) && preg_match('/^([A-Z]{2})$/', $native)){
            $filters['native'] = $native;
        }
        if (!empty($learns) && preg_match('/^([A-Z]{2})$/', $learns)){
            $filters['learns'] = $learns;
        }
        if (!empty($name)){
            $filters['name'] = $name;
        }

        switch($mode){
            case 'all':
                $list = $this->getMembersList($filters, $skip);
                break;
            case 'friends':
                $list = $this->getFriendsList($filters, $skip);
                break;
        }

        $html = Response::render('members/rows', ['members' => $list['members']]);

        Response::json([
            'success' => true,
            'html' => $html,
            'total' => $list['total'],
            'count' => count($list['members'])
        ]);

    }

    public function actionIgnore(){

        $id = Request::post('id');

        $blackList = User::get('blacklist', []);

        if (in_array($id, $blackList)) { Response::error404(); }

        $membersCollection = Storage::get('members');

        $membersCollection->update([
            '_id' => User::getMongoId()
        ], [
            '$push' => [
                'blacklist' => $id
            ]
        ]);

        Response::json(['success' => true]);

    }

    public function actionUnignore(){

        $id = Request::post('id');

        $blackList = User::get('blacklist', []);

        if (!in_array($id, $blackList)) { Response::error404(); }

        $membersCollection = Storage::get('members');

        $membersCollection->update([
            '_id' => User::getMongoId()
        ], [
            '$pull' => [
                'blacklist' => $id
            ]
        ]);

        Response::json(['success' => true]);

    }

    public function actionDelete(){

        $friends = User::get('friends', []);

        $membersCollection = Storage::get('members');

        if ($friends){
            foreach($friends as $friendId){
                $membersCollection->update([
                    '_id' => Storage::getMongoId($friendId)
                ], [
                    '$pull' => [
                        'friends' => User::getId()
                    ]
                ]);
            }
        }

        $membersCollection->remove(['_id' => User::getMongoId()]);

        Storage::get('blacklist_emails')->insert([
            'email' => User::get('email')
        ]);

        User::logout();

    }

    private function getMembersList($filters = [], $skip = 0){

        $query = $this->buildQuery($filters);

        $cursor = Storage::get('members')->
                    find($query)->
                    sort(['online' => -1, 'dates.online' => -1])->
                    limit($this->limit);

        if ($skip){
            $cursor->skip($skip);
        }

        $total = $cursor->count();

        $result = [
            'total' => $total,
            'members' => []
        ];

        if (!$cursor->count(true)){
            return $result;
        }

        foreach($cursor as $member){
            $result['members'][] = \SLingo\Core\Members::parse($member);
        }

        return $result;

    }

    private function getFriendsList($filters = [], $skip = 0){

        $result = [
            'total' => 0,
            'members' => []
        ];

        $friendsIds = User::get('friends');

        if (!$friendsIds){ return $result; }

        $friendsList = [];

        foreach($friendsIds as $id){
            $friendsList[] = Storage::getMongoId($id);
        }

        $query = $this->buildQuery($filters);

        $query['_id'] = ['$in' => $friendsList];

        $cursor = Storage::get('members')->
                    find($query)->
                    sort(['online' => -1, 'dates.online' => -1])->
                    limit($this->limit);

        if ($skip){
            $cursor->skip($skip);
        }

        $total = $cursor->count();

        $result['total'] = $total;

        if (!$cursor->count(true)){
            return $result;
        }

        foreach($cursor as $member){
            $result['members'][] = \SLingo\Core\Members::parse($member);
        }

        return $result;

    }

    private function buildQuery($filters){

        $query = [
            'location' => [
                '$exists' => true
            ],
            'banned' => [
                '$exists' => false
            ]
        ];

        if (!empty($filters['country'])){
            $query['location.countryCode'] = $filters['country'];
        }

        if (!empty($filters['native'])){
            $query['langs.natives'] = $filters['native'];
        }

        if (!empty($filters['learns'])){
            $query['langs.learns'] = $filters['learns'];
        }

        if (!empty($filters['name'])){

            $name = trim($filters['name']);

            if (mb_strstr($name, '+ban')){
                unset($query['banned']);
                $name = trim(str_replace('+ban', '', $name));
            }

            if (preg_match('/^ex:(.*)$/i', $name, $matches)){
                if (!empty($matches[1])){
                    $query['name.old'] = new \MongoRegex("/{$matches[1]}/i");
                }
            } else if (preg_match('/^ip:(.*)$/i', $name, $matches)){
                if (!empty($matches[1])){
                    $query['ip'] = new \MongoRegex("/{$matches[1]}/i");
                }
            } else if (preg_match('/^email:(.*)$/i', $name, $matches)){
                if (!empty($matches[1])){
                    $query['email'] = new \MongoRegex("/{$matches[1]}/i");
                }
            } else {
                $query['name.full'] = new \MongoRegex("/{$name}/i");
            }

        }

        return $query;

    }

}

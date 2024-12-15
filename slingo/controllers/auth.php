<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Events;
use SLingo\Core\Lang;
use SLingo\Core\Mailer;
use SLingo\Core\Response;
use SLingo\Core\Request;
use SLingo\Core\Security;
use SLingo\Core\Storage;
use SLingo\Core\Validator;
use SLingo\Core\User;

class auth extends Controller {

    private $resetSendLimit = 180;
    private $resetLinkTTL = 86400;

    public function actionLogin(){

        if (!Request::isAjax()) { Response::error404(); }

        if (Security::isTOR(User::getIp())){
            Response::json(['success'=>false, 'alert'=>t('torError')]);
        }

        $fields = [
            'email' => [['required'], ['email']],
            'password' => [['required'], ['minlen', 6]],
        ];

        $validator = new Validator();

        $errors = $validator->validate($fields);

        if ($errors){
            Response::json(['success' => false, 'errors' => $errors]);
        }

        $isRemember = Request::post('is_remember');

        $membersCollection = Storage::get('members');

        $data = Request::getList(array_keys($fields));

        $member = $membersCollection->findOne(['email' => mb_strtolower($data['email']), 'password' => sha1($data['password'])]);

        if ($member === null){
            Response::json(['success'=>false, 'alert'=>t('loginError')]);
        }

        if (!empty($member['banned'])){

            if (empty($member['ban_until'])){
                $banMessage = t('accountBanned');
                if (!empty($member['ban_reason'])){
                    $banMessage .= '<br/>' . t('accountBanReason', $member['ban_reason']);
                }
                Response::json(['success'=>false, 'alert'=>$banMessage]);
            }

            $until = $member['ban_until']->sec;
            $remainSec = $until - time();
            $remainMin = ceil($remainSec/60);

            if ($remainSec <= 0){
                Storage::get('members')->update(['_id' => $member['_id']], [
                    '$unset' => [
                        'banned' => true,
                        'ban_until' => true,
                        'ban_reason' => true
                    ]
                ]);
            } else {
                $message = t('accountBlocked', Lang::getPlural('dateMinutesPlural', $remainMin));
                if (!empty($member['ban_reason'])){
                    $message .= '<br><br>' . t('accountBanReason', $member['ban_reason']);
                }
                Response::json(['success'=>false, 'alert'=>$message]);
            }

        }

        User::login($member['_id'], $isRemember);

        Response::json(['success'=>true, 'url'=>'/app']);

    }

    public function actionRegister(){

        if (!Request::isAjax()) { Response::error404(); }

        if (Security::isTOR(User::getIp())){
            Response::json(['success'=>false, 'alert'=>t('torError')]);
        }

        $fields = [
            'firstName' => [['required'], ['minlen', 2]],
            'lastName' => [['required'], ['minlen', 2]],
            'email' => [['required'], ['email']],
            'password' => [['required'], ['minlen', 6]],
            'password2' => [['required'], ['minlen', 6], ['match', Request::post('password')]]
        ];

        $validator = new Validator();

        $errors = $validator->validate($fields);

        if ($errors){
            Response::json(['success' => false, 'errors' => $errors]);
        }

        $membersCollection = Storage::get('members');

        $data = Request::getList(array_keys($fields));

        $existMember = $membersCollection->findOne(['email' => $data['email']]);

        $blackListEntry = Storage::get('blacklist_emails')->findOne(['email' => $data['email']]);

        list($emailUser, $emailDomain) = explode('@', $data['email']);

        $isDisposableEmail = Storage::get('shitmail')->findOne(['domain' => trim($emailDomain)]);

        if ($existMember === null && strstr($emailUser, '+')){
            list($realEmailUser, $emailFolder) = explode('+', $emailUser);
            $existMember = $membersCollection->findOne(['email' => join('@', [$realEmailUser, $emailDomain])]);
            if ($existMember === null){
                $quotedRealEmailUser = preg_quote($realEmailUser);
                $quotedEmailDomain = preg_quote($emailDomain);
                $existMember = $membersCollection->findOne(['email' => new \MongoRegex("/{$quotedRealEmailUser}\+(.*)@{$quotedEmailDomain}/i")]);
            }
        }

        if ($existMember !== null){
            Response::json(['success'=>false, 'alert'=>t('emailExists')]);
        }

        if ($blackListEntry !== null){
            Response::json(['success'=>false, 'alert'=>t('emailForbidden')]);
        }

        if ($isDisposableEmail){
            Response::json(['success'=>false, 'alert'=>t('emailForbidden')]);
        }

        $now = new \MongoDate();

        $member = [
            'name' => [
                'first' => $data['firstName'],
                'last' => $data['lastName'],
                'full' => trim($data['firstName'] . ' ' . $data['lastName'])
            ],
            'dates' => [
                'signed' => $now,
                'online' => $now
            ],
            'email' => mb_strtolower($data['email']),
            'password' => sha1($data['password']),
            'inbox_unread' => 0
        ];

        $membersCollection->insert($member);

        Storage::get('reg_stats')->update([
            'date' => date('d-m-Y'),
            'day' => intval(date('d')),
            'month' => intval(date('m')),
            'year' => intval(date('Y'))
        ], [
            '$inc' => ['count' => 1]
        ], [
            'upsert' => true
        ]);

        User::login($member['_id']);

        Events::trigger('members.new', $member);

        Response::json(['success' => true, 'url' => '/start']);

    }

    public function actionLogout(){

        if (User::isLogged()){

            $membersCollection = Storage::get('members');

            $membersCollection->update(['_id' => User::getMongoId()], [
                '$set' => [
                    'dates.online' => new \MongoDate()
                ]
            ]);

            User::logout();

        }

        Response::redirect('/');

    }

    public function actionReset($passToken = false){

        if (User::isLogged()){
            Response::redirect('/');
        }

        if (!$passToken){
            Response::page('auth/reset');
            return;
        }

        if (!preg_match('/^[0-9a-f]{32}$/i', $passToken)){
            Response::error404();
        }

        $membersCollection = Storage::get('members');

        $member = $membersCollection->findOne(['pass_token' => $passToken]);

        if (!$member){
            Response::error404();
        }

        if (!$member['pass_token_date'] || time() - $member['pass_token_date']->sec > $this->resetLinkTTL){
            $membersCollection->update(['_id' => $member['_id']], [
                '$unset' => [
                    'pass_token' => true,
                    'pass_token_date' => true
                ]
            ]);
            Response::error404();
        }

        Response::page('auth/password', [
            'member' => $member,
            'token' => $passToken
        ]);

    }

    public function actionResetSubmit(){

        if (User::isLogged()){
            Response::redirect('/');
        }

        if (!Request::isAjax()){
            Response::error404();
        }

        $fields = [
            'email' => [['required'], ['email']],
        ];

        $validator = new Validator();

        $errors = $validator->validate($fields);

        if ($errors){
            Response::json(['success' => false, 'errors' => $errors]);
        }

        $data = Request::getList(array_keys($fields));

        $membersCollection = Storage::get('members');

        $member = $membersCollection->findOne(['email' => mb_strtolower($data['email'])]);

        if (!$member){
            Response::json(['success' => false, 'alert' => t('emailNotFound')]);
        }

        if (isset($member['pass_token_date']) && time() - $member['pass_token_date']->sec < $this->resetSendLimit){
            Response::json(['success' => false, 'alert' => t('resetTimeLimit')]);
        }

        $passToken = User::getRandomToken();
        $resetURL = 'http://'. Request::getHost() . '/auth/reset/' . $passToken;

        $membersCollection->update(['_id' => $member['_id']], [
            '$set' => [
                'pass_token' => $passToken,
                'pass_token_date' => new \MongoDate()
            ]
        ]);

        $mailer = new Mailer();

        $result = $mailer->sendLetter('auth.reset', $data['email'], [
            'name' => $member['name']['first'],
            'url' => $resetURL
        ]);

        Response::json([
            'success' => $result,
            'message' => $result ? t('emailRestoreSent') : '',
            'alert' => !$result ? t('emailError') : ''
        ]);

    }

    public function actionPasswordSubmit($passToken=false){

        if (User::isLogged()){
            Response::redirect('/');
        }

        if (!Request::isAjax()){
            Response::error404();
        }

        if (!$passToken || !preg_match('/^[0-9a-f]{32}$/i', $passToken)){
            Response::error404();
        }

        $membersCollection = Storage::get('members');

        $member = $membersCollection->findOne(['pass_token' => $passToken]);

        if (!$member){
            Response::error404();
        }

        $fields = [
            'password' => [['required'], ['minlen', 6]],
            'password2' => [['required'], ['minlen', 6], ['match', Request::post('password')]]
        ];

        $validator = new Validator();

        $errors = $validator->validate($fields);

        if ($errors){
            Response::json(['success' => false, 'errors' => $errors]);
        }

        $data = Request::getList(array_keys($fields));

        $membersCollection->update(['_id' => $member['_id']], [
            '$set' => [
                'password' => sha1($data['password'])
            ],
            '$unset' => [
                'pass_token' => true,
                'pass_token_date' => true
            ]
        ]);

        User::login($member['_id']);

        Response::json(['success' => true, 'message' => t('passwordChanged')]);

    }

}

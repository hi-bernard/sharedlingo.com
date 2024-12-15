<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Mailer;
use SLingo\Core\Response;
use SLingo\Core\Request;
use SLingo\Core\Storage;
use SLingo\Core\Lang;
use SLingo\Loader;
use SLingo\Core\User;

class premium extends Controller {

    private $prices = [
        1 => 9,
        3 => 19,
        6 => 29,
        12 => 49,
    ];

    public function actionPlans(){

        if (!Request::isAjax()) { Response::error404(); }
        if (!User::isLogged()) { Response::error404(); }

        Response::view('premium/plans', [
            'prices' => $this->prices
        ]);

    }

    public function actionIndex(){

        Lang::load('premium');

        Response::view('premium/index', []);

    }

    public function actionSuccess(){
        Response::page('premium/success', []);
    }

    public function actionCancel(){
        Response::page('premium/cancel', []);
    }

    public function actionTest(){

        Response::json([
            'premium' => User::get('premium')
        ]);

    }

    public function actionIpnListener(){

        Loader::loadLibrary('paypal.php');

        $log = Storage::get('paypal_log');

        $verified = false;

        try {

            $paypal = new \PaypalIPN();
            $verified = $paypal->verifyIPN();

            if ($verified){
                $data = $_POST;
                $this->processPayment($data);
            }

        } catch (\Exception $e) {
            $data = 'error: ' . $e->getMessage();
        }

        $log->insert([
            'date' => new \MongoDate(),
            'verified' => $verified,
            'data' => $data
        ]);

        header("HTTP/1.1 200 OK");

        exit;

    }

    public function processPayment($data){

        $userId = $data['custom'];
        $duration = $data['item_number'];
        $amount = $data['mc_gross'];

        if (!isset($this->prices[$duration])) { return false; }
        if ($this->prices[$duration] != $amount) { return false; }

        $membersCollection = Storage::get('members');

        $member = $membersCollection->findOne(['_id' => Storage::getMongoId($userId)]);

        if (!$member){ return false; }

        $startTime = empty($member['premium_until']) ? time() : $member['premium_until']->sec;
        $newTime = strtotime("+{$duration} months", $startTime);

        $membersCollection->update(['_id' => Storage::getMongoId($userId)], [
            '$set' => [
                'premium' => true,
                'premium_until' => new \MongoDate($newTime)
            ]
        ]);

        return true;

    }

    public function checkExpiredMembers(){

        $now = time();

        $membersCollection = Storage::get('members');

        $expiredMembers = [];

        $cursor = $membersCollection->find([
            'premium' => true,
            'premium_until' => [
                '$lt' => new \MongoDate($now)
            ]
        ]);

        if ($cursor->count(true)){
            foreach($cursor as $member){
                $expiredMembers[] = $member;
            }
        }

        $expiredMembersCount = count($expiredMembers);

        if ($expiredMembersCount){

            $mailer = new Mailer();

            foreach($expiredMembers as $member){

                $membersCollection->update(['_id' => $member['_id']], [
                    '$unset' => [
                        'premium' => true,
                        'premium_until' => true,
                        'name.color' => true
                    ]
                ]);

                $mailer->sendLetter('premium.expired', $member['email'], [
                    'name' => $member['name']['first']
                ], 'en');

            }

        }

        return "Expired members: {$expiredMembersCount}";

    }

    public function notifyUpcomingExpiredMembers(){

        $now = time();
        $expirationTime = strtotime('+3 days', $now);

        $membersCollection = Storage::get('members');

        $expiredMembers = [];

        $cursor = $membersCollection->find([
            'premium' => true,
            'premium_until' => [
                '$lt' => new \MongoDate($expirationTime)
            ]
        ]);

        if ($cursor->count(true)){
            foreach($cursor as $member){
                $expiredMembers[] = $member;
            }
        }

        $expiredMembersCount = count($expiredMembers);

        if ($expiredMembersCount){

            $mailer = new Mailer();

            foreach($expiredMembers as $member){

                $mailer->sendLetter('premium.remind', $member['email'], [
                    'name' => $member['name']['first']
                ], 'en');

            }

        }

        return "Notified members: {$expiredMembersCount}";

    }

    public function deleteExpiredRoomLogs(){

        $now = strtotime('2016-11-04'); // time();
        $expiredTime = strtotime('-1 months', $now);

        $logCollection = Storage::get('log_rooms');

        $expiredRooms = [];

        $cursor = $logCollection->find([
            'created' => [
                '$lt' => new \MongoDate($expiredTime)
            ]
        ]);

        if ($cursor->count(true)){
            foreach($cursor as $room){
                $expiredRooms[] = $room;
            }
        }

        $expiredRoomsCount = count($expiredRooms);

        if ($expiredRoomsCount){

            $messagesCollection = Storage::get('log_messages');

            foreach($expiredRooms as $room){
                $logCollection->remove(['_id' => $room['_id']]);
                $messagesCollection->remove(['roomId' => (string)$room['_id']]);
            }

        }

        return "Expired log rooms: {$expiredRoomsCount}";

    }


}

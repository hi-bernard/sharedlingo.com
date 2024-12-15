<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Members;
use SLingo\Core\Request;
use SLingo\Core\Response;
use SLingo\Core\Storage;
use SLingo\Core\Lang;
use SLingo\Core\User;

class friends extends Controller {

    const REQUEST_PENDING = 0;
    const REQUEST_ACCEPTED = 1;
    const REQUEST_DECLINED = -1;

    const REQUEST_DECLINE_TTL = 259200;

    public $isAjaxOnly = true;
    public $isAuthRequired = true;

    public function beforeAction(){
        Lang::load('mail');
    }

    public function beforeHook(){
        Lang::load('mail');
    }

    public function actionRequest(){

        $friendId = Request::post('id');

        if (!$friendId) { Response::error404(); }

        $friend = Members::getMember($friendId);

        if (!$friend) { Response::error404(); }

        if (User::isFriendTo($friendId)){
            Response::json([
                'message' => t('friendAlready', $friend['name']['first'])
            ]);
        }

        $blackList = empty($friend['blacklist']) ? [] : $friend['blacklist'];
        if (in_array(User::getId(), $blackList)){
            Response::json([
                'message' => t('ignoredByUser', $friend['name']['first'])
            ]);
        }

        $existsRequest = $this->getRequest(User::getId(), $friendId);

        if ($existsRequest){

            if ($existsRequest['status'] == self::REQUEST_DECLINED && $existsRequest['members'][0] == User::getId()){

                $timePassed = time() - $existsRequest['received']->sec;

                if ($timePassed < self::REQUEST_DECLINE_TTL){
                    Response::json([
                        'message' => t('friendCooldown')
                    ]);
                }

                $this->deleteRequest($existsRequest);

            } else {

                if ($existsRequest['is_sender']){
                    Response::json([
                        'message' => t('friendRequestExists', $friend['name']['first'])
                    ]);
                } else {
                    $this->acceptRequest($existsRequest);
                    Response::json([
                        'message' => t('friendRequestAccepted', $friend['name']['first'])
                    ]);
                }

            }

        }

        $requestId = $this->createRequest($friendId);

        $this->sendRequest($friendId, $requestId);

        Response::json([
            'message' => t('friendRequestSent', $friend['name']['first'])
        ]);

    }

    public function actionAccept(){

        $requestId = Request::post('id');

        if (!$requestId) { Response::error404(); }

        $request = $this->getRequestById($requestId);

        if (!$request) { Response::error404(); }

        if (!in_array(User::getId(), $request['members'])) { Response::error404(); }

        $friendId = ($request['members'][0] == User::getId()) ? $request['members'][1] : $request['members'][0];

        $friend = Members::getMember($friendId);

        if (User::isFriendTo($friendId)){
            Response::json([
                'message' => t('friendRequestAccepted', $friend['name']['first'])
            ]);
        }

        $this->acceptRequest($request);

        Controller::get('mail')->sendMail($friendId, [
            'id' => User::getId(),
            'name' => User::get('name')['full']
        ], [
            'subject' => ['friendAccepted'],
            'message' => ['friendAcceptedText', User::get('name')['first']]
        ]);

        Response::json([
            'message' => t('friendRequestAccepted', $friend['name']['first'])
        ]);

    }

    public function actionDecline(){

        $requestId = Request::post('id');

        if (!$requestId) { Response::error404(); }

        $request = $this->getRequestById($requestId);

        if (!$request) { Response::error404(); }

        if (!in_array(User::getId(), $request['members'])) { Response::error404(); }

        if ($request['status'] != self::REQUEST_PENDING) { return; }

        $friendId = ($request['members'][0] == User::getId()) ? $request['members'][1] : $request['members'][0];

        $this->declineRequest($request);

        Controller::get('mail')->sendMail($friendId, [
            'id' => User::getId(),
            'name' => User::get('name')['full']
        ], [
            'subject' => ['friendDeclined'],
            'message' => ['friendDeclinedText', User::get('name')['first']]
        ]);

        Response::json(['success' => true]);

    }

    public function actionRemove(){

        $friendId = Request::post('id');

        if (!$friendId) { Response::error404(); }

        if (!User::isFriendTo($friendId)){
            Response::json(['success' => true]);
        }

        $membersCollection = Storage::get('members');

        $membersCollection->update([
            '_id' => Storage::getMongoId($friendId)
        ], [
            '$pull' => [
                'friends' => User::getId()
            ]
        ]);

        $membersCollection->update([
            '_id' => User::getMongoId()
        ], [
            '$pull' => [
                'friends' => $friendId
            ]
        ]);

        Storage::get('friend_request')->remove([
            '$and' => [
                ['members' => User::getId()],
                ['members' => $friendId]
            ]
        ]);

        Response::json(['success' => true]);

    }

    private function acceptRequest($request){

        Storage::get('friend_request')->update([
            '_id' => $request['_id']
        ], [
            '$set' => ['status' => self::REQUEST_ACCEPTED]
        ]);

        $membersCollection = Storage::get('members');

        $membersCollection->update([
            '_id' => Storage::getMongoId($request['members'][0])
        ], [
            '$push' => [
                'friends' => $request['members'][1]
            ]
        ]);

        $membersCollection->update([
            '_id' => Storage::getMongoId($request['members'][1])
        ], [
            '$push' => [
                'friends' => $request['members'][0]
            ]
        ]);

    }

    private function declineRequest($request){

        Storage::get('friend_request')->update([
            '_id' => $request['_id']
        ], [
            '$set' => ['status' => self::REQUEST_DECLINED]
        ]);

    }

    private function deleteRequest($request){

        Storage::get('friend_request')->remove([
            '_id' => $request['_id']
        ]);

    }

    private function getRequest($fromId, $toId){

        $request = Storage::get('friend_request')->findOne([
            '$and' => [
                ['members' => $fromId],
                ['members' => $toId]
            ]
        ]);

        if (!$request){
            return false;
        }

        $request['is_sender'] = $fromId == $request['members'][0];

        return $request;

    }

    private function getRequestById($requestId){

        $request = Storage::get('friend_request')->findOne([
            '_id' => Storage::getMongoId($requestId)
        ]);

        if (!$request){
            return false;
        }

        return $request;

    }

    private function createRequest($friendId){

        $request = [
            'members' => [User::getId(), $friendId],
            'received' => new \MongoDate(),
            'status' => self::REQUEST_PENDING
        ];

        Storage::get('friend_request')->insert($request);

        return $request['_id'];

    }

    private function sendRequest($friendId, $requestId){

        $message = [
            'received' => new \MongoDate(),
            'to' => $friendId,
            'unread' => true,
            'sender' => [
                'id' => User::getId(),
                'name' => User::get('name')['full']
            ],
            'is_request' => true,
            'request_id' => $requestId
        ];

        Storage::get('mail')->insert($message);

        Storage::get('members')->update([
            '_id' => Storage::getMongoId($friendId),
        ], [
            '$inc' => [
                'inbox_unread' => 1
            ]
        ]);

    }

}

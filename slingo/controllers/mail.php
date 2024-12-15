<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Mailer;
use SLingo\Core\Members;
use SLingo\Core\Request;
use SLingo\Core\Response;
use SLingo\Core\Storage;
use SLingo\Core\Lang;
use SLingo\Core\Validator;
use SLingo\Core\User;

class mail extends Controller {

    public $isAjaxOnly = true;
    public $isAuthRequired = true;

    public function beforeAction(){
        Lang::load('mail');
    }

    public function beforeHook(){
        Lang::load('mail');
    }

    public function actionInbox(){

        $data = $this->getMessages(User::getId());

        Response::view('mail/inbox', [
            'total' => $data['total'],
            'messages' => $data['messages'],
            'mode' => 'inbox'
        ]);

    }

    public function actionMore(){

        $skip = intval(Request::post('skip'));
        $mode = Request::post('mode');

        if (!in_array($mode, ['inbox', 'outbox'])){
            $mode = 'inbox';
        }

        $data = $this->getMessages(User::getId(), $mode, $skip);

        if (empty($data['messages'])) { Response::send(); }

        Response::view('mail/inbox-more', [
            'messages' => $data['messages'],
            'mode' => $mode
        ]);

    }

    public function actionMessage(){

        $id = Request::post('id');

        if (!$id) { Response::error404(); }

        $message = $this->getMessage($id);

        if (!$message) { Response::error404(); }
        if ($message['to'] != User::getId() && $message['sender']['id'] != User::getId() && !User::isAdmin()) { Response::error404(); }

        $isInbox = $message['to'] == User::getId();

        if ($message['unread'] && $isInbox){
            $this->messageRead($message);
        }

        if (!$isInbox){

            $recipient = Storage::get('members')->findOne(['_id' => Storage::getMongoId($message['to'])]);

            if (!$recipient) { Response::error404(); }

            $message['sender'] = [
                'id' => $message['to'],
                'name' => t('mailOutboxTo', $recipient['name']['full'])
            ];

        }

        if (!empty($message['text'])){
            $message['text'] = $this->formatMessageText($message['text']);
        }

        Response::view('mail/message', [
            'unread' => User::get('inbox_unread'),
            'message' => $message
        ]);

    }

    public function actionDelete(){

        $id = Request::post('id');

        if (!$id) { Response::error404(); }

        $message = $this->getMessage($id);

        if (!$message) { Response::error404(); }
        if ($message['to'] != User::getId() && !User::isAdmin()) { Response::error404(); }

        if ($message['unread']){
            $this->messageRead($message);
        }

        $this->messageDelete($message);

        Response::json([
            'success' => true,
            'unread' => User::get('inbox_unread'),
        ]);

    }

    public function actionCheck(){

        $ts = Request::post('ts');

        if (!$ts) { Response::error404(); }

        $messages = $this->getNewMessages(User::getId(), $ts);

        Response::view('mail/inbox-more', [
            'messages' => $messages,
            'mode' => 'inbox'
        ]);

    }

    public function actionCompose(){

        $recipientId = Request::post('id');
        $recipient = $this->getRecipient($recipientId);

        Response::view('mail/compose', [
            'id' => $recipientId,
            'recipient' => $recipient,
            'is_mass' => !$recipient
        ]);

    }

    public function actionSend(){

        $isMass = Request::post('is_mass');

        if ($isMass && !User::isAdmin()) { Response::error404(); }

        if (!$isMass){

            $recipientId = Request::post('id');
            $recipient = $this->getRecipient($recipientId);
            if (!$recipient){ Response::error404(); }

            $blackList = empty($recipient['blacklist']) ? [] : $recipient['blacklist'];
            if (in_array(User::getId(), $blackList)){
                Response::json(['success' => false, 'alert' => t('ignoredByUser', $recipient['name']['first'])]);
            }

        }

        $fields = [
            'subject' => [['required']],
            'message' => [['required']],
            'sender' => $isMass ? [['required']] : false,
            'prev_id' => [['hash']],
            'captcha' => [['required']]
        ];

        $validator = new Validator();
        $errors = $validator->validate($fields);

        if ($errors){
            Response::json(['success' => false, 'errors' => $errors]);
        }

        $data = Request::getList(array_keys($fields));

        if ($isMass){

            $isToOnlineOnly = Request::post('is_online_only');

            $this->sendMassMail($data, $isToOnlineOnly);

        } else {

            $this->sendMail($recipientId, [
                'id' => User::getId(),
                'name' => User::get('name')['full']
            ], $data);

            if (empty($recipient['online'])){

                $mailer = new Mailer();

                $mailer->sendLetter('message', $recipient['email'], [
                    'name' => $recipient['name']['first'],
                    'sender' => User::get('name')['full']
                ], 'en');

            }

        }

        Response::json(['success' => true]);

    }

    public function sendMail($recipientId, $sender, $data){

        $message = [
            'to' => $recipientId,
            'unread' => true,
            'sender' => [
                'id' => $sender['id'],
                'name' => $sender['name']
            ],
            'subject' => $data['subject'],
            'text' => $data['message'],
            'received' => new \MongoDate(),
            'prev_id' => empty($data['prev_id']) ? false : $data['prev_id']
        ];

        Storage::get('mail')->insert($message);

        Storage::get('members')->update([
            '_id' => Storage::getMongoId($recipientId),
        ], [
            '$inc' => [
                'inbox_unread' => 1
            ]
        ]);

    }

    private function sendMassMail($data, $isToOnlineOnly=false){

        $messageTemplate = [
            'unread' => true,
            'sender' => [
                'id' => '0',
                'name' => $data['sender']
            ],
            'subject' => $data['subject'],
            'text' => $data['message'],
            'received' => new \MongoDate()
        ];

        $membersIds = Members::getAllIds($isToOnlineOnly);

        $mailCollection = Storage::get('mail');
        $membersCollection = Storage::get('members');

        foreach($membersIds as $id){

            $message = $messageTemplate;

            $message['to'] = $id;

            $mailCollection->insert($message);

            $membersCollection->update([
                '_id' => Storage::getMongoId($id),
            ], [
                '$inc' => [
                    'inbox_unread' => 1
                ]
            ]);

        }

    }

    private function getRecipient($recipientId){

        if (!$recipientId && !User::isAdmin()) { Response::error404(); }

        if ($recipientId) {

            $recipient = Storage::get('members')->findOne([
                '_id' => Storage::getMongoId($recipientId)
            ]);

            if (!$recipient) { Response::error404(); }

            return $recipient;

        }

        return false;

    }

    private function getMessages($userId, $mode='inbox', $skip=0){

        $limit = 15;

        $condition = ($mode=='inbox') ? ['to' => $userId] : ['sender.id' => $userId];

        if ($mode=='outbox'){
            $condition['is_request'] = ['$ne' => true];
        }

        $cursor = Storage::get('mail')->
                    find($condition)->
                    sort(['received' => -1])->
                    skip($skip)->
                    limit($limit);

        $result = [
            'total' => $cursor->count(),
            'messages' => []
        ];

        if (!$cursor->count(true)){
            return $result;
        }

        foreach($cursor as $message){
            $result['messages'][] = $message;
        }

        return $result;

    }

    private function getNewMessages($userId, $ts){

        $cursor = Storage::get('mail')->
                    find([
                        'to' => $userId,
                        'received' => [
                            '$gte' => new \MongoDate($ts+1)
                        ]
                    ])->
                    sort(['received' => -1]);

        if (!$cursor->count(true)){
            return [];
        }

        $messages = [];

        foreach($cursor as $message){
            $messages[] = $message;
        }

        return $messages;

    }

    private function getMessage($id){

        $message = Storage::get('mail')->findOne(['_id' => Storage::getMongoId($id)]);

        if (!$message) { return false; }

        if ($message['sender']['id']){
            $message['sender']['member'] = Storage::get('members')->findOne(['_id' => Storage::getMongoId($message['sender']['id'])]);
        }

        return $message;

    }

    private function messageRead($message){

        Storage::get('mail')->update([
            '_id' => $message['_id'],
        ], [
            '$set' => [
                'unread' => false
            ]
        ]);

        Storage::get('members')->update([
            '_id' => User::getMongoId(),
        ], [
            '$inc' => [
                'inbox_unread' => -1
            ]
        ]);

        User::set('inbox_unread', User::get('inbox_unread') - 1);

    }

    private function messageDelete($message){

        Storage::get('mail')->remove([
            '_id' => $message['_id']
        ], [
            'justOne' => true
        ]);

    }

    private function formatMessageText($text){

        if (is_array($text)){
            $text = call_user_func_array('t', $text);
        }

        $text = nl2br(html($text));

        return $text;

    }

    public function onNewMember($member){

        $this->sendMail((string)$member['_id'], [
            'id' => 0,
            'name' => t('mailSystemSender'),
        ], [
            'subject' => t('mailWelcomeMessageSubject'),
            'message' => t('mailWelcomeMessageText')
        ]);

        return $member;

    }

    public function onMemberLogin($id){

        $inboxUnreadCount = Storage::get('mail')->count([
            '$and' => [
                ['to' => $id],
                ['unread' => true]
            ]
        ]);

        Storage::get('members')->update(['_id' => Storage::getMongoId($id)], [
            '$set' => [
                'inbox_unread' => $inboxUnreadCount
            ]
        ]);

    }

}

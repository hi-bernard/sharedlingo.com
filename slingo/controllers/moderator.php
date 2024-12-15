<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Request;
use SLingo\Core\Response;
use SLingo\Core\Storage;
use SLingo\Core\Validator;
use SLingo\Core\User;

class moderator extends Controller {

    private $maxBlockTime = 4320;

    public $isModeratorOnly = true;

    public function actionJs(){

        $file = Request::get('file', 'moderator');

        $jsFile = ROOT_PATH . "/slingo/secured/moderator/{$file}.js";

        if (!file_exists($jsFile)) { Response::error404(); }

        $js = file_get_contents($jsFile);

        Response::set($js);
        Response::send();

    }

    public function actionBlock(){

        $id = Request::post('id');

        if (!$id) { Response::error404(); }

        $membersCollection = Storage::get('members');
        $member = $membersCollection->findOne(['_id' => Storage::getMongoId($id)]);

        if (!$member) { Response::error404(); }

        $isSubmit = Request::postHas('is_submit');

        if (!$isSubmit){
            Response::view('moderator/block', [
                'member' => $member,
                'id' => $id,
                'maxBlockTime' => $this->maxBlockTime
            ]);
            return;
        }

        $this->performBlock($id, $member);

    }

    private function performBlock($id, $member){

        if (!empty($member['moderator']) || !empty($member['moderator'])){
            if (!User::isAdmin()){
                Response::json(['success' => false, 'alert' => t('blockNotAllowed')]);
            }
        }

        $fields = [
            'time' => [['required'], ['number'], ['min', 1], ['max', $this->maxBlockTime]],
            'reason' => [['required']],
        ];

        $validator = new Validator();

        $errors = $validator->validate($fields);

        if ($errors){
            Response::json(['success' => false, 'errors' => $errors]);
        }

        $data = Request::getList(array_keys($fields));

        $bansCount = empty($member['bans_count']) ? 1 : $member['bans_count'] + 1;

        Storage::get('members')->update(['_id' => Storage::getMongoId($id)], [
            '$set' => [
                'banned' => true,
                'ban_until' => new \MongoDate(time() + 60*$data['time']),
                'ban_reason' => $data['reason'],
                'bans_count' => $bansCount
            ]
        ]);

        Storage::get('modlog')->insert([
            'date' => new \MongoDate(),
            'moderator' => [
                'id' => User::getId(),
                'name' => User::get('name')['full']
            ],
            'subject' => [
                'id' => $id,
                'name' => $member['name']['full']
            ],
            'time' => $data['time'],
            'reason' => $data['reason']
        ]);

        Response::json(['success' => true, 'id' => $id, 'time' => $data['time']]);

    }

}

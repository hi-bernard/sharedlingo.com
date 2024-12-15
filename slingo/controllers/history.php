<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Request;
use SLingo\Core\Response;
use SLingo\Core\Storage;
use SLingo\Core\User;

class history extends Controller {

    private $limit = 30;

    public $isAuthRequired = true;

    public function actionDialog(){

        if (!Request::isAjax()) { Response::error404(); }
        if (!User::isPremium()){ Response::error404(); }

        $view = Request::isMobile() ? 'history/dialog.mobile' : 'history/dialog';

        Response::view($view, [
            'skip' => $this->limit,
        ]);

    }

    public function actionGet(){

        if (!Request::isAjax()) { Response::error404(); }
        if (!User::isPremium()){ Response::error404(); }

        usleep(100000);

        $name = Request::post('name');
        $skip = Request::post('skip', 0);

        $filters = [];

        if (!empty($name)){
            $filters['name'] = $name;
        }

        $list = $this->getRoomsList($filters, $skip);

        $html = Response::render('history/rows', ['rooms' => $list['rooms']]);

        Response::json([
            'success' => true,
            'html' => $html,
            'total' => $list['total'],
            'count' => count($list['rooms'])
        ]);

    }

    public function actionRoom(){

        if (!Request::isAjax()) { Response::error404(); }
        if (!User::isPremium()){ Response::error404(); }

        $id = Request::post('id');
        $room = Storage::get('log_rooms')->findOne(['_id' => Storage::getMongoId($id)]);
        if (!$room || $room['from'] != User::getId()) { Response::error404(); }

        $messages = $this->getRoomMessages($id);

        Response::view('history/log', [
            'room' => $room,
            'messages' => $messages
        ]);

    }

    public function actionDownload($id=''){

        if (!$id) { Response::error404(); }

        $room = Storage::get('log_rooms')->findOne(['_id' => Storage::getMongoId($id)]);
        if (!$room || $room['from'] != User::getId()) { Response::error404(); }

        $messages = $this->getRoomMessages($id);

        $filename = str_replace(' ', '_', $room['to']['name']) . '_' . date('Y-m-d', $room['created']->sec) . '.txt';

        $log = '';

        foreach($messages as $msg) {
            $log .= $msg['sender']['name'] . ': ' . $msg['text'] . "\n";
        }

        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="'.$filename.'"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . sizeof($log));

        echo $log;

        exit;

    }

    public function actionDelete(){

        if (!Request::isAjax()) { Response::error404(); }

        $id = Request::post('id');

        $roomsLogStorage = Storage::get('log_rooms');

        $room = $roomsLogStorage->findOne(['_id' => Storage::getMongoId($id)]);
        if (!$room || $room['from'] != User::getId()) { Response::error404(); }

        $roomsLogStorage->remove(['_id' => Storage::getMongoId($id)]);

        Storage::get('log_messages')->remove(['roomId' => $id]);

        Response::json(['success' => true]);

    }

    private function getRoomMessages($roomId){

        $cursor = Storage::get('log_messages')->
                    find(['roomId' => $roomId])->
                    sort(['sent' => 1]);

        if (!$cursor->count(true)){
            return [];
        }

        $messages = [];

        foreach($cursor as $message){
            $messages[] = $message;
        }

        return $messages;

    }

    private function getRoomsList($filters = [], $skip = 0){

        $query = $this->buildQuery($filters);

        $cursor = Storage::get('log_rooms')->
                    find($query)->
                    sort(['created' => -1])->
                    limit($this->limit);

        if ($skip){
            $cursor->skip($skip);
        }

        $total = $cursor->count();

        $result = [
            'total' => $total,
            'rooms' => []
        ];

        if (!$cursor->count(true)){
            return $result;
        }

        foreach($cursor as $room){
            $result['rooms'][] = $room;
        }

        return $result;

    }

    private function buildQuery($filters){

        $query = [
            'from' => User::getId(),
        ];

        if (!empty($filters['name'])){
            $name = trim($filters['name']);
            $query['to.name'] = new \MongoRegex("/{$name}/i");
        }

        return $query;

    }

}

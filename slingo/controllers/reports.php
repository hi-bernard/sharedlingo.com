<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Members;
use SLingo\Core\Request;
use SLingo\Core\Response;
use SLingo\Core\Storage;
use SLingo\Core\Validator;
use SLingo\Core\User;

class reports extends Controller {

    public $isAjaxOnly = true;
    public $isAuthRequired = true;

    private $limit = 10;

    private function getReasons(){
        return [
            1 => t('reportReasonLang'),
            2 => t('reportReasonHarass'),
            3 => t('reportReasonRude'),
            4 => t('reportReasonSpam'),
            5 => t('reportReasonOther'),
        ];
    }

    public function actionCreate(){

        $suspectId = Request::post('id');
        $suspect = Members::getMember($suspectId);

        if (!$suspect) { Response::error404(); }

        Response::view('reports/create', [
            'id' => $suspectId,
            'suspect' => $suspect,
            'reasons' => $this->getReasons()
        ]);

    }

    public function actionSend(){

        $suspectId = Request::post('id');
        $suspect = Members::getMember($suspectId);
        if (!$suspect){ Response::error404(); }

        $fields = [
            'reason' => [['required'], ['in', array_keys($this->getReasons())]],
            'message' => [['required']],
            'captcha' => [['required']],
        ];

        $validator = new Validator();
        $errors = $validator->validate($fields);

        if ($errors){
            Response::json(['success' => false, 'errors' => $errors]);
        }

        $data = Request::getList(array_keys($fields));

        $mailCollection = Storage::get('mail');

        $suspectMail = [];
        $reporterMail = [];

        $suspectMailCursor = $mailCollection->find(['sender.id' => $suspectId, 'to' => User::getId()])->sort(['received' => -1])->limit(5);

        if ($suspectMailCursor->count(true)) {
            foreach($suspectMailCursor as $message){
                $suspectMail[] = [
                    'subject' => $message['subject'],
                    'text' => $message['text'],
                    'received' => $message['received']
                ];
            }
        }

        $reporterMailCursor = $mailCollection->find(['sender.id' => User::getId(), 'to' => $suspectId])->sort(['received' => -1])->limit(5);

        if ($reporterMailCursor->count(true)) {
            foreach($reporterMailCursor as $message){
                $reporterMail[] = [
                    'subject' => $message['subject'],
                    'text' => $message['text'],
                    'received' => $message['received']
                ];
            }
        }

        $report = [
            'created' => new \MongoDate(),
            'suspect' => [
                'id' => $suspectId,
                'name' => $suspect['name']['full'],
                'log' => [],
                'mail' => $suspectMail
            ],
            'reporter' => [
                'id' => User::getId(),
                'name' => User::get('name')['full'],
                'log' => [],
                'mail' => $reporterMail
            ],
            'reason' => $data['reason'],
            'message' => $data['message'],
            'result' => 0
        ];

        Storage::get('reports')->insert($report);

        $reportsCount = empty($suspect['reports_count']) ? 1 : $suspect['reports_count'] + 1;

        Storage::get('members')->update(['_id' => $suspect['_id']], [
            '$set' => [
                'reports_count' => $reportsCount
            ]
        ]);

        Response::json([
            'success' => true,
            'report_id' => (string)$report['_id'],
            'suspect_id' => $suspectId,
            'user_id' => User::getId()
        ]);

    }

    public function actionReports(){

        if (!User::isModerator()) { Response::error404(); }

        $view = Request::isMobile() ? 'reports/reports.mobile' : 'reports/reports';

        Response::view($view);

    }

    public function actionGetReports(){

        if (!User::isModerator()) { Response::error404(); }

        $skip = Request::post('skip', 0);

        $list = $this->getReports($skip);

        $html = Response::render('reports/reports.rows', [
            'today' => date('m/d/Y'),
            'reports' => $list['reports'],
            'reasons' => $this->getReasons()
        ]);

        Response::json([
            'success' => true,
            'html' => $html,
            'total' => $list['total'],
            'count' => count($list['reports'])
        ]);

    }

    public function actionReport(){

        if (!User::isModerator()) { Response::error404(); }

        $id = Request::post('id');

        if (!$id) { Response::error404(); }

        $report = $this->getReport($id);

        if (!$report) { Response::error404(); }

        $html = Response::render('reports/report', [
            'report' => $report,
            'reasons' => $this->getReasons()
        ]);

        $report['id'] = (string)$report['_id'];
        unset($report['_id']);

        Response::json([
            'report' => $report,
            'html' => $html
        ]);

    }

    public function actionResolve(){

        $id = Request::post('id');
        $comment = Request::post('comment');
        $isNotify = Request::post('notify');

        if (!$comment) { Response::error404(); }

        $report = $this->getReport($id);

        if (!$report || $report['result']) { Response::error404(); }

        $report['result'] = [
            'moderator' => [
                'id' => User::getId(),
                'name' => User::get('name')['full']
            ],
            'comment' => $comment,
            'date' => new \MongoDate()
        ];

        Storage::get('reports')->update([
            '_id' => Storage::getMongoId($id)
        ], [
            '$set' => [
                'result' => $report['result']
            ]
        ]);

        if ($isNotify){

            Controller::get('mail')->sendMail($report['reporter']['id'], [
                'id' => 0,
                'name' => t('appTitle')
            ], [
                'subject' => ['reportNotifySubject', $report['suspect']['name']],
                'message' => ['reportNotifyText', $report['suspect']['name'], $comment]
            ]);

        }

        $view = Request::isMobile() ? 'reports/report.row.mobile' : 'reports/report.row';

        $html = Response::render($view, [
            'report' => $report,
            'reasons' => $this->getReasons(),
            'today' => date('m/d/Y'),
        ]);

        Response::json([
            'success' => true,
            'reporter_id' => $report['reporter']['id'],
            'html' => $html
        ]);

    }

    private function getReports($skip = 0){

        $cursor = Storage::get('reports')->
                    find([])->
                    sort(['created' => -1])->
                    limit($this->limit);

        if ($skip){
            $cursor->skip($skip);
        }

        $total = $cursor->count();

        $result = [
            'total' => $total,
            'reports' => []
        ];

        if (!$cursor->count(true)){
            return $result;
        }

        foreach($cursor as $report){
            $result['reports'][] = $report;
        }

        return $result;

    }

    private function getReport($id){

        return Storage::get('reports')->findOne([
            '_id' => Storage::getMongoId($id)
        ]);

    }

}

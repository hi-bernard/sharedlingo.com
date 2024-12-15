<?php

namespace SLingo\Controllers;

use SLingo\Core\Controller;
use SLingo\Core\Request;
use SLingo\Core\Response;
use SLingo\Core\Storage;

class admin extends Controller {

    public $isAdminOnly = true;

    public function actionJs(){

        $file = Request::get('file', 'admin');

        $jsFile = ROOT_PATH . "/slingo/secured/admin/{$file}.js";

        if (!file_exists($jsFile)) { Response::error404(); }

        $js = file_get_contents($jsFile);

        Response::set($js);
        Response::send();

    }

    public function actionStatsDialog(){

        $months = [];
        $years = [];

        for ($m=1; $m<=12; $m++) {
            $fM = $m>9 ? $m : '0'.$m;
            $months[$m] = date('F', strtotime("01.{$fM}.2016"));
        }

        for ($y=2016; $y<=intval(date('Y')); $y++){
            $years[] = $y;
        }

        Response::view('admin/stats', [
            'month' => intval(date('m')),
            'year' => intval(date('Y')),
            'months' => $months,
            'years' => $years
        ]);

    }

    public function actionStats(){

        $month = intval(Request::post('month', date('m')));
        $year = intval(Request::post('year', date('Y')));

        $stats = $this->getStats($month, $year);

        Response::json([
            'success' => true,
            'stats' => $stats
        ]);

    }

    private function getStats($month, $year){

        $stats = [
            'labels' => [],
            'values' => [
                'max' => [],
                'avg' => [],
                'reg' => []
            ]
        ];

        $dataOnline = [];
        $dataReg = [];

        $cursorOnline = Storage::get('day_stats')->
                    find([
                        'month' => $month,
                        'year' => $year
                    ])->
                    sort(['day' => 1]);

        if ($cursorOnline->count(true)){
            foreach($cursorOnline as $day){
                $dataOnline[$day['date']] = $day;
            }
        }

        $cursorReg = Storage::get('reg_stats')->
                    find([
                        'month' => $month,
                        'year' => $year
                    ])->
                    sort(['day' => 1]);

        if ($cursorReg->count(true)){
            foreach($cursorReg as $day){
                $dataReg[$day['date']] = $day['count'];
            }
        }

        $startDay = 1;
        $endDay = date('t', strtotime("01.{$month}.{$year}"));

        $fMonth = ($month>9 ? $month : '0'.$month);

        for ($s = $startDay; $s <= $endDay; $s++){

            $fDay = ($s>9 ? $s : '0'.$s);

            $date = join('-', [$fDay, $fMonth, $year]);

            $isStatExists = !empty($dataOnline[$date]);
            $isRegStatExists = !empty($dataReg[$date]);

            $dayNum = date('N', strtotime("{$fDay}.{$fMonth}.{$year}"));

            if ($dayNum == 6 || $dayNum == 7) { $fDay = "[$fDay]"; }

            $stats['labels'][] = $fDay;
            $stats['values']['max'][] = $isStatExists ? $dataOnline[$date]['max'] : 0;
            $stats['values']['avg'][] = $isStatExists ? $dataOnline[$date]['avg'] : 0;
            $stats['values']['reg'][] = $isRegStatExists ? $dataReg[$date] : 0;

        }

        return $stats;

    }

    public function actionShitMailDialog(){

        Response::view('admin/shitmail/dialog');

    }

    public function actionShitMailGet(){

        usleep(100000);

        $limit = 20;

        $filter = Request::post('domain');
        $skip = Request::post('skip', 0);

        $query = empty($filter) ? [] : ['domain' => new \MongoRegex("/{$filter}/i")];

        $cursor = Storage::get('shitmail')->
                    find($query)->
                    sort(['_id' => -1])->
                    limit($limit);

        if ($skip){
            $cursor->skip($skip);
        }

        $total = $cursor->count();
        $domains = [];

        if ($cursor->count(true)){
            foreach($cursor as $domain){
                $domains[] = $domain;
            }
        }

        $html = Response::render('admin/shitmail/rows', ['domains' => $domains]);

        Response::json([
            'success' => true,
            'html' => $html,
            'total' => $total,
            'count' => count($domains)
        ]);

    }

    public function actionShitMailAdd(){

        $domain = trim(Request::post('domain'));

        if (mb_strstr($domain, '@')){
            list($addr, $domain) = explode('@', $domain);
        }

        $collection = Storage::get('shitmail');

        $existRecord = $collection->findOne(['domain' => $domain]);

        if (!empty($existRecord)) {
            Response::json([
                'success' => false,
                'error' => t('shitMailExists', $domain)
            ]);
        }

        $last = $collection->find()->sort(['_id' => -1])->limit(1)->getNext();

        $id = $last['_id'] + 1;

        $collection->insert([
            '_id' => intval($id),
            'domain' => $domain
        ]);

        Response::json([
            'success' => true
        ]);

    }

    public function actionShitMailDelete(){

        $id = Request::post('id');

        Storage::get('shitmail')->remove(['_id' => (int)$id]);

        Response::json([
            'success' => true
        ]);

    }

}

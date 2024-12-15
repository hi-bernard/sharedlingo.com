<?php

include $_SERVER['DOCUMENT_ROOT'] . '/bootstrap.php';

$db = SLingo\Core\Storage::get('day_stats');

$today = time();
$daysToImport = 80;

for ($s = 0; $s <= $daysToImport; $s++){

    $time = $today - (60*60*24)*$s;

    $d = intval(date('d', $time));
    $m = intval(date('m', $time));
    $y = intval(date('Y', $time));

    $date = date('d-m-Y', $time);

    $max = rand(120, 180);
    $max_time = $time - rand(60, 300);
    $avg = rand(60, 120);
    $avg_summ = rand(1000000,90000000);
    $ticks = rand(1000000,90000000);

    $db->insert([
        'date' => $date,
        'day' => $d,
        'month' => $m,
        'year' => $y,
        'max' => $max,
        'max_time' => new \MongoDate($max_time),
        'avg' => $avg,
        'avg_summ' => $avg_summ,
        'ticks' => $ticks
    ]);

}
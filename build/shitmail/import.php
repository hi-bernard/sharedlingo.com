<?php

include $_SERVER['DOCUMENT_ROOT'] . '/bootstrap.php';

$collection = SLingo\Core\Storage::get('shitmail');

$collection->remove([]);

$domainsFile = file_get_contents('domains.txt');
$domains = explode("\n", $domainsFile);

$id = 1;

foreach($domains as $domain){

    $domain = trim($domain);
    if (!$domain) { continue; }

    $collection->insert([
        '_id' => $id,
        'domain' => $domain
    ]);

    $id++;

}

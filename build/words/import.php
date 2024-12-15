<?php

include $_SERVER['DOCUMENT_ROOT'] . '/bootstrap.php';

if (isset($_GET['lang'])){
    $langs = [$_GET['lang']];
} else {
    $langs = ['en', 'es', 'de', 'ru', 'pt', 'fr'];
}

foreach($langs as $lang){

    $collection = SLingo\Core\Storage::get('words_'.$lang);

    $collection->remove([]);

    $wordsFile = file_get_contents($lang . '.txt');
    $words = explode("\n", $wordsFile);

    $id = 1;

    foreach($words as $word){

        $word = trim($word);
        if (!$word) { continue; }

        $collection->insert([
            '_id' => $id,
            'word' => $word
        ]);

        $id++;

    }

}


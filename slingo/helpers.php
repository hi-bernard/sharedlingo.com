<?php

function t($phraseId) {
    if (func_num_args() > 1){
        return call_user_func_array('\SLingo\Core\Lang::get', func_get_args());
    }
    return \SLingo\Core\Lang::get($phraseId);
}

function html($html){
    return htmlspecialchars($html);
}

function dump($var){
    echo '<pre>'; print_r($var); die();
}

function stringToCamel($string, $delimiter = '-'){

    $result = '';
    $words = explode($delimiter, mb_strtolower($string));

    foreach($words as $word){
        $result .= ucfirst($word);
    }

    return $result;

}

function resourcesList($type, $listName){

    $tags = '';

    if ($type == 'css'){
        $tag = '<link rel="stylesheet" href="%s">';
    }

    if ($type == 'js'){
        $tag = '<script src="%s"></script>';
    }

    if (\SLingo\Core\Config::isDev()) {
        $list = \SLingo\Core\Config::getBuildList("{$type}.{$listName}");
    } else {
        $list = ["/static/prod/{$listName}.{$type}?v=" . \SLingo\Core\Config::get('build')];
    }

    foreach($list as $url){
        $tags .= sprintf($tag, $url) . "\n";
    }

    return $tags;

}

function css($listName){
    return resourcesList('css', $listName);
}

function js($listName){
    return resourcesList('js', $listName);
}
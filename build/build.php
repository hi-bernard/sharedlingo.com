<?php

define('BUILD_PATH', dirname(__FILE__));
define('ROOT_PATH', dirname(BUILD_PATH));
define('DIST_PATH', BUILD_PATH . '/dist');
define('TMP_PATH', BUILD_PATH . '/tmp');

// clear
out("Clearing...");
rm(DIST_PATH . '/*');
rm(TMP_PATH . '/*');

// copy dist
out("Copying files...");
cp(ROOT_PATH . '/*', DIST_PATH);
cp(ROOT_PATH . '/.htaccess', DIST_PATH . '/.htaccess');
rm(DIST_PATH . '/build');

out("Compiling CSS...");
compile('css');

out("Compiling JS...");
compile('js');

rmEmptyDirs(DIST_PATH . '/static');

$build = time();
replace(DIST_PATH . '/slingo/config.php', '{build}', $build);

out("Packing...");
exec('cd '. DIST_PATH. '; zip -r dist.zip * .htaccess; cd '.BUILD_PATH.';');

$deploy = readline("Deploy now? (y/n): ");

if (strtolower($deploy) === 'y'){

    out("Uploading to server...");
    exec('scp -P 7307 ' . DIST_PATH . '/dist.zip r2@sharedlingo.com:/var/www/dist');

    out('Deploying...');
    exec("ssh r2@sharedlingo.com -p7307 'cd /var/www; bash deploy.sh';");

}

out("Done!");

/* ========================================================================== */

function out($string){ echo $string . "\n"; }
function rm($path) { exec('rm -rf ' . $path); }
function cp($from, $to) { exec("cp -r {$from} {$to} > /dev/null"); }
function minify($from, $to) { exec("minify --output {$to} {$from}"); }

function compile($type){

    foreach(glob(BUILD_PATH . "/{$type}.*.list") as $cssListFile){

        $file = basename($cssListFile);

        preg_match("/^{$type}\.([a-z]+)\.list$/i", $file, $matches);

        $name = $matches[1];
        $list = explode("\n", file_get_contents($cssListFile));
        $result = '';

        foreach($list as $cssFile){
            $cssFile = trim($cssFile);
            if (!$cssFile) { continue; }
            $tmpFile = TMP_PATH . '/' . basename($cssFile);
            minify(ROOT_PATH . $cssFile, $tmpFile);
            $result .= file_get_contents($tmpFile) . "\n";
            rm($tmpFile);
            rm(DIST_PATH . $cssFile);
        }

        file_put_contents(DIST_PATH . '/static/prod/' . $name . '.' . $type, $result);

    }


}

function replace($file, $find, $replace){
    $content = file_get_contents($file);
    $content = str_replace($find, $replace, $content);
    file_put_contents($file, $content);
}

function rmEmptyDirs($path){
    $empty = true;
    foreach (glob($path."/*") as $file) {
        $empty &= is_dir($file) && rmEmptyDirs($file);
    }
    return $empty && rmdir($path);
}

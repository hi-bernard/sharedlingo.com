<?php

namespace SLingo\Core;

class Response {

	private static $output = "";

	public static function header($header){
		header($header);
	}

	public static function set($content){
		self::$output = $content;
	}

    public static function append($content){
        self::$output .= $content;
    }

	public static function json($data){

		self::header('Content-Type: application/json');

		if (is_array($data)){
			$data = json_encode($data);
		}

		self::set($data);
        self::send();

	}

    public static function view($viewName, $data = []){
        self::set(self::render($viewName, $data));
    }

    public static function page($viewName, $data = []){
        $viewHtml = self::render($viewName, $data);
        self::set(self::render('layout', ['html' => $viewHtml]));
    }

    public static function error404(){
        self::header("HTTP/1.0 404 Not Found");
        self::header("HTTP/1.1 404 Not Found");
        self::header("Status: 404 Not Found");
        self::view('error404');
        self::send();
    }

    public static function redirect($url, $code=303){
        if ($code == 301){
            self::header('HTTP/1.1 301 Moved Permanently');
        } else {
            self::header('HTTP/1.1 303 See Other');
        }
        self::header('Location: '.$url);
        self::send();
    }

    public static function render($viewName, $data = []){

        ob_start();

        extract($data);
        include ROOT_PATH . '/slingo/views/' . $viewName . '.php';

        return ob_get_clean();

    }

    public static function getOutput(){
        return self::$output;
    }

    public static function send(){
        if (self::$output) { echo self::$output; }
        exit;
    }


}

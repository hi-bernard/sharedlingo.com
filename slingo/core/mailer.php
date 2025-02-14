<?php

namespace SLingo\Core;

use SLingo\Loader;
use SLingo\Core\Config;
use SLingo\Core\Lang;

class Mailer {

    private $mailer;
    private $errorInfo;

    public function __construct() {

        Loader::loadLibrary('phpmailer.php');

        $this->mailer = new \PHPMailer();
        $this->mailer->CharSet = 'UTF-8';

        $this->initTransport()->setFrom(Config::get('mail_from'));

    }

    public function initTransport(){

        $transport = Config::get('mail_transport', 'mail');

        if ($transport == 'mail') {
            return $this;
        }

        if ($transport == 'smtp') {

            Loader::loadLibrary('phpmailer/smtp.php');

            $this->mailer->IsSMTP();

            $this->mailer->SMTPKeepAlive = true;
            $this->mailer->Host = Config::get('mail_smtp_host', 'localhost');
            $this->mailer->Port = Config::get('mail_smtp_port', 25);

            if (Config::is('mail_smtp_user')){
                $this->mailer->SMTPAuth = true;
                $this->mailer->Username = Config::get('mail_smtp_user');
                $this->mailer->Password = Config::get('mail_smtp_pass');
            }

            if (Config::is('mail_smtp_enc')){
                $this->mailer->SMTPSecure = Config::get('mail_smtp_enc');
            }

            return $this;

        }

    }

    public function setFrom($email, $name=''){
        $this->mailer->SetFrom($email, $name);
        return $this;
    }

    public function setReplyTo($email, $name=''){
        $this->mailer->ClearReplyTos();
        $this->mailer->AddReplyTo($email, $name);
        return $this;
    }

    public function addTo($email, $name=''){
        $this->mailer->AddAddress($email, $name);
        return $this;
    }

    public function setSubject($subject){
        $this->mailer->Subject = $subject;
        return $this;
    }

    public function setBodyHTML($message, $is_auto_alt = true){

        $this->mailer->MsgHTML( $message );

        if ($is_auto_alt){
            $this->setBodyText( strip_tags($message) );
        }

        return $this;

    }

    public function setBodyText($message){
        $this->mailer->AltBody = $message;
        return $this;
    }

    public function parseSubject($letter_text){

        if(preg_match('/\[subject:(.+)\]/iu', $letter_text, $matches)){

            list($subj_tag, $subject) = $matches;

            $letter_text = trim(str_replace($subj_tag, '', $letter_text));

            $this->setSubject($subject);

        }

        return $letter_text;

    }

    public function addAttachment($file){
        $this->mailer->AddAttachment($file);
        return $this;
    }

    public function clearTo(){
        $this->mailer->ClearAddresses();
        return $this;
    }

    public function clearAttachments(){
        $this->mailer->ClearAttachments();
        return $this;
    }

    public function getErrorInfo(){
        return $this->errorInfo;
    }

    public function send(){
        $result = $this->mailer->Send();
        if (!$result) {
            $this->errorInfo = $this->mailer->ErrorInfo;
        }
        return $result;
    }

    public function sendLetter($letter, $to, $data=[], $lang = false){

        if (!$lang) { $lang = Lang::getCurrentLangId(); }

        $letterFile = ROOT_PATH . '/slingo/langs/' . $lang . '/letters/' . $letter . '.html';
        $letterText = $this->parseSubject(file_get_contents($letterFile));

        foreach($data as $key=>$value){
            $letterText = str_replace('{'.$key.'}', $value, $letterText);
        }

        $this->addTo($to);

        $this->setBodyHTML($letterText);

        return $this->send();

    }

}

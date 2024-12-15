<?php

namespace SLingo\Core;

use SLingo\Core\User;

class Validator {

    public function validate($schema){

        $errors = [];

        foreach ($schema as $fieldName => $rules){

            if (empty($rules)) { continue; }

            foreach($rules as $rule){

                $ruleName = $rule[0];
                $ruleParams = count($rule)>1 ? array_slice($rule, 1) : [];

                $result = $this->processRule($fieldName, $ruleName, $ruleParams);

                if ($result !== true){
                    $errors[$fieldName] = $result;
                }

            }

        }

        return $errors;

    }

    private function processRule($fieldName, $ruleName, $ruleParams){

        if ($fieldName == 'captcha'){
            return $this->validateCaptcha();
        }

        $value = Request::post($fieldName);

        $ruleMethod = 'test' . ucfirst($ruleName);

        if (is_array($value)){

            foreach($value as $item){

                $itemRuleParams = $ruleParams;
                array_unshift($itemRuleParams, $item);

                $result = call_user_func_array([$this, $ruleMethod], $itemRuleParams);

                if ($result !== true){ return $result; }

            }

            return true;

        } else {

            array_unshift($ruleParams, $value);
            return call_user_func_array([$this, $ruleMethod], $ruleParams);

        }

    }

    private function validateCaptcha(){

        $captchaCode = Request::post('g-recaptcha-response');

        if (empty($captchaCode)) { return t('valErrorRequired'); }

        $data = array(
            'secret' => "6Lct9AYUAAAAAAM3UpIFz2Cekvm3ZuapgeECgcGU",
            'response' => $captchaCode,
            'ip' => User::getIp()
        );

        $verify = \curl_init();
        \curl_setopt($verify, CURLOPT_URL, "https://www.google.com/recaptcha/api/siteverify");
        \curl_setopt($verify, CURLOPT_POST, true);
        \curl_setopt($verify, CURLOPT_POSTFIELDS, http_build_query($data));
        \curl_setopt($verify, CURLOPT_SSL_VERIFYPEER, false);
        \curl_setopt($verify, CURLOPT_RETURNTRANSFER, true);
        $response = \curl_exec($verify);

        $responseKeys = json_decode($response,true);

        if(intval($responseKeys["success"]) !== 1) {
            return t('valErrorRequired');
        }

        return true;

    }

    public function testRequired($value){
        if (!empty($value)){ return true; }
        return t('valErrorRequired');
    }

    public function testEmail($value){
        if (empty($value)){ return true; }
        if (filter_var($value, FILTER_VALIDATE_EMAIL)){ return true; }
        return t('valErrorEmail');
    }

    public function testLen($value, $len){
        if (empty($value)){ return true; }
        if (mb_strlen($value)==$len) { return true; }
        return t('valErrorLen', $len);
    }

    public function testMinlen($value, $min){
        if (empty($value)){ return true; }
        if (mb_strlen($value)>=$min) { return true; }
        return t('valErrorMinLen', $min);
    }

    public function testMaxlen($value, $max){
        if (empty($value)){ return true; }
        if (mb_strlen($value)<=$max) { return true; }
        return t('valErrorMaxLen', $max);
    }

    public function testMin($value, $min){
        if (empty($value)){ return true; }
        if (intval($value)>=$min) { return true; }
        return t('valErrorMin', $min);
    }

    public function testMax($value, $max){
        if (empty($value)){ return true; }
        if (intval($value)<=$max) { return true; }
        return t('valErrorMax', $max);
    }

    public function testAlpha($value){
        if (empty($value)){ return true; }
        if (preg_match('/([a-zA-Z]+)/i', $value)) { return true; }
        return t('valErrorAlpha');
    }

    public function testNumber($value){
        if (empty($value)){ return true; }
        if (is_numeric($value)) { return true; }
        return t('valErrorNumber');
    }

    public function testHash($value){
        if (empty($value)){ return true; }
        if (preg_match('/([a-zA-Z0-9]+)/i', $value)) { return true; }
        return t('valErrorHash');
    }

    public function testCode($value){
        if (empty($value)){ return true; }
        if (preg_match('/([a-zA-Z0-9]{2})/i', $value)) { return true; }
        return t('valErrorCode');
    }

    public function testIn($value, $in){
        if (empty($value)){ return true; }
        if (in_array($value, $in)) { return true; }
        return t('valErrorIn', implode(', ', $in));
    }

    public function testMatch($value, $match){
        if (empty($value)){ return true; }
        if ($value == $match) { return true; }
        return t('valErrorMatch');
    }

    public function testColor($value){
        if (empty($value)){ return true; }
        if (preg_match('/^#([0-9a-f]{6})$/i', mb_strtolower($value))){ return true; }
        return t('valErrorColor');
    }

}

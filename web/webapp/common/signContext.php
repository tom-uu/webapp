<?php
require_once(dirname(__FILE__).'/context.php');
class SignContext extends Context{
    protected $privateKey;
    public function __construct($model,$userId,$postData){
        global $private_key;
        parent::__construct($model,$userId,$postData);
        $this->privateKey = $private_key;
    }
}


<?php
class Context{
    protected $userId;
    protected $model;
    protected $postData;
    public function __construct($model,$userId,$postData){
        $this->model = $model;
        $this->userId = $userId;
        $this->postData = $postData;
    }
}


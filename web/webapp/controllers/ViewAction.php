<?php
require_once(dirname(__FILE__).'/../common/router.php');

class ViewAction{
    private $router;
    private $context;
    public function __construct(){
        $this->router = new Router();
        $this->context = new $this->router->contextName(filter_input(INPUT_COOKIE,'id'),$this->router->postData);
    }
    public function callContext(){
        $this->router->callFunc($this->context,'callBack');
    }
}

class Context{
    protected $userId;
    protected $postData;
    public function __construct($userId,$postData){
        $this->userId = $userId;
        $this->postData = $postData;
    }
}

class LoadView extends Context{
    public function callBack($compName){
        $file = array();
        $file["html"] = file_get_contents(dirname(__FILE__)."/../views/$compName.html", FILE_USE_INCLUDE_PATH);
        echo json_encode($file);
    }
}

(new ViewAction())->callContext();

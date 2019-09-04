<?php

class Controller {
    private $router;
    private $context;
    public function __construct($model){
        //把控制器内已经有了属性和相关的值，那么其他类只需要直接用就好了，使用方法就是通过传入回调来获取控制器中的属性；这样就避免了不同类中重复定义属性数据而造成冗余的麻烦；2019.1.27.18:13
        global $db1;
        $this->router = new Router();
        $this->context = new $this->router->contextName(new $model($db1),filter_input(INPUT_COOKIE,'id'),$this->router->postData);
    }//这里的setModel是在控制器的具体实现类中，设置把控制器的哪些相关数据赋予数据模型类；数据类被赋予和数据存取相关的方法，以便从控制器中存取数据；2019.1.27.18:21 
    public function callContext(){
        $this->router->callFunc($this->context,'callBack');
    }
}

<?php
class Router{
    private $uri;
    private $scriptUri;
    private $className;
    public $postData;
    public $contextName;
    public $params;
    public function __construct()
    {   
        $post_data = json_decode(file_get_contents('php://input'),TRUE);
        if(!isset($post_data)){
            $post_data=null;
        }
        if(is_string($_SERVER['REQUEST_URI'])){
            $this->uri = $_SERVER['REQUEST_URI'];
        }
        if(is_string($_SERVER['SCRIPT_NAME'])){
            $this->scriptUri = $_SERVER['SCRIPT_NAME'];
        }
        if(is_string(basename($this->scriptUri))){
            $file_name = basename($this->scriptUri);
            $this->className = substr($file_name, 0,strpos($file_name,'.php'));
        }
        $this->postData = $post_data;
        $this->setContext($this->explodeUri($this->detectUri()));//截取url中类名之后的url字符串;因此这是提取url中字符的第一步，还需要再进行提炼并组合成合适的数据结构；所以还需要，下面的explode_uri方法，将提取的url参数封装成一个数组，便于进行取值操作；2017.8.23.11:30写
    }
    private function detectUri() {
	if (!isset($this->uri) OR !isset($this->scriptUri)) {
            return '';
	}
        $uri = $this->uri;//这个数组项可以提取请求的url,即把前端的url的写法原样提取出来；2017.8.23.11:32写
	if (strpos($uri,$this->scriptUri) === 0) {
            
            $uri = substr($uri, strlen($this->scriptUri));
	}
        
	if ($uri == '/' || empty($uri)) {
            return '/';
	}
        return str_replace(array('//', '../'), '/', trim(parse_url($uri, PHP_URL_PATH), '/'));
    }
    private function explodeUri($uri) {
	foreach (explode('/', preg_replace("|/*(.+?)/*$|", "\\1", $uri)) as $val) {
            $val = trim($val);
            if ($val != '') {
                $segments[] = $val;
            }
	}
	return $segments;
    }
    private function setContext($uri_segments){
        $this->contextName = $uri_segments[0];
        $this->params = array_slice($uri_segments, 1);
    }
    public function callFunc($context,$funName){
        $count_params = count($this->params);
        if($count_params == 0){
            call_user_func(array($context,$funName));
        }else if($count_params > 0){
            call_user_func_array(array($context,$funName), $this->params);
        }
    }
}
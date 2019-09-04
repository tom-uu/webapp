<?php 
include_once dirname(__FILE__).'/../common/key.php';//注意文件引入的顺序，key要在route前引用，因为在route内类就被实例化了，再引入key无济于事，实例化后的对象是不能再调用外部变量的；2017.8.25.20:34写
include_once dirname(__FILE__).'/../models/MyModel.php';
include_once dirname(__FILE__).'/../common/router.php';

class MyAction
{
	private $user_id;
	private $model;
	public function __construct()
	{		
		if(isset($_COOKIE) && !empty($_COOKIE['id'])){
			$this->user_id = $_COOKIE['id'];
		}
		$this->model = new MyModel($this->user_id);
	}
	
	public function loadView(){
		$file = array();
		$file["html"] = file_get_contents(dirname(__FILE__).'/../views/userHome.html', FILE_USE_INCLUDE_PATH);
		$file["pageData"]["userHead"] = $this->model->getUserPageInfo();
		$file["pageData"]["userTrends"] = "11111";
		echo isset($file) && !empty($file) ? json_encode($file) : false;
	}
}
?>
<?php
include_once dirname(__FILE__).'/../../models/my_models/MyInfoModel.php';
include_once dirname(__FILE__).'/../../common/route.php';

class MyInfoAction
{
	private $user_id;
	private $model;
	private $user_info;
	public function __construct($input)
	{
		if(isset($_COOKIE) && !empty($_COOKIE['id'])){
			$this->user_id = $_COOKIE['id'];
		}
		if(isset($input["set"][0]) && !empty($input['set'][0])){
			$this->user_info = $input['set'][0];
		}
		$this->model = new MyInfoModel($this->user_id);
	}
	
	public function loadView(){
		$file = array();		
		$file["html"] = file_get_contents(dirname(__FILE__).'/../../views/user_page/information.html', FILE_USE_INCLUDE_PATH);
		$file["pageData"] = $this->getUserInfo();
		echo isset($file) && !empty($file) && $file["pageData"] != false ? json_encode($file) : false;
	}
	
	public function getUserInfo(){
		return $this->model->getUserInfo();
	}
	
	public function setUserInfo($info_type){
		$tb_name = "";
		switch ($info_type){
			case 0:
				$tb_name = "user_info";
				break;
			case 1:
				$tb_name = "user_info_ex";
				break;
		}
		if($tb_name != "" && isset($this->user_info) && !empty($this->user_info)){
			echo $this->model->setUserInfo($tb_name,$this->user_info);
		}
	}
}
?>

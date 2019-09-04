<?php
include_once dirname(__FILE__).'/../../common/database.php';

class MyInfoModel{
	private $user_id;
	public function __construct($user_id){
		global $db;
		$this->db = new mysqli($db['hostname'],$db['username'],$db['password'],$db['database']);
		$this->user_id = $user_id;
	}
	public function getUserInfo(){
		return $this->db->query("SELECT a.age,a.telephone,a.email,a.address,b.degree,b.school,b.major,b.profession,b.interests,b.focus FROM user_info a,user_info_ex b WHERE a.userId='$this->user_id' AND a.userId=b.userId")->fetch_assoc();
	}
	public function setUserInfo($tb_name,$info_array){		
		$setStr = "";
		$i = 0;
		foreach ($info_array as $key=>$value){
			if($i > 0){
				$setStr .= ",";
			}
			$setStr .= $key == 'age' ? "$key=$value" : "$key='$value'";
			$i++;
		}
		return $this->db->query("UPDATE $tb_name SET ".$setStr." WHERE userId='$this->user_id'");
	}
}
?>

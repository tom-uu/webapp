<?php
include_once dirname(__FILE__).'/../common/db.php';

class MyModel{
	private $user_id;
	public function __construct($user_id){
		global $db;
		$this->db = new mysqli($db['hostname'],$db['username'],$db['password'],$db['database']);
		$this->user_id = $user_id;
	}
	public function getUserPageInfo(){
		return $this->db->query("SELECT alias,gender,motto FROM user_info WHERE userId='$this->user_id'")->fetch_assoc();
	}
	public function getUserTrendsInfo($user_name){
		return $this->db->query("SELECT userId,userPassWord FROM user WHERE userName='$user_name'")->fetch_assoc();			
	}
	public function setSignInInfo($user_name,$client_ip){//这个模块被独立提取出来，实际上是按照低耦合的要求的来操作，为的是可重用，这个模块当然可以和上面的代码混合在一起，但是这样做应用适用范围就减少了，灵活性降低，可重用性不高，但是性能可能会高一些;所以，在性能和可重用性之间要把握好尺度，以何种粒度和尺度来划分模块，耦合度降低到何种程度是需要考虑的重点问题;(本质就是问题划分操作;2017.8.29.16:54补)2017.8.29.16:53写
		return $this->db->query("UPDATE user SET lastLoginIp='$client_ip',lastLoginTime=now() WHERE userName='$user_name'");//必须加上''，才可以添加到mysql的字段中;2017.8.29.17:29写
	}
}
?>
<?php
require_once(dirname(__FILE__).'/../common/db.php');
include_once dirname(__FILE__).'/Model.php';
require_once(dirname(__FILE__).'/../common/httpRequest.php');

class SignUpModel extends Model{}

trait AddSignInfo{
    private $piKey;
    private $signInfo;
    private $docDbName;
    private $userName;
    public function decodeInfo($private_key,$postData){
        if(isset($private_key) && !empty($private_key)){
            $this->piKey = openssl_pkey_get_private($private_key);
        }
        if(!empty($this->piKey)){
            $this->signInfo = $postData;
            foreach ($this->signInfo as $key=>$value){
                $value = str_replace("%2B","+",$value);
                openssl_private_decrypt(base64_decode($value),$this->signInfo[$key],$this->piKey);
            }
            $this->signInfo["userpwd"] = password_hash($this->signInfo["userpwd"], PASSWORD_DEFAULT);
            return true;
        }else{
            return false;
        }
    }
    public function getUserGuid(){
        return md5(uniqid(mt_rand(),true));
    }
    public function countUserNameSql($username){
        return "SELECT COUNT(userName) AS countUserName FROM user WHERE userName='$username'";
    }
    public function addDesignDoc($designJson){
        $strRes = $this->httpCurl($this->docDbName."/_design/showList", $designJson, "PUT");
        $res = json_decode($strRes,true);
        return isset($res["ok"]) ? true : false;
    }
    public function addDocdb(){
        $this->userName = $this->signInfo['username'];
        $this->docDbName = "jl_".$this->userName;
        $strRes = $this->httpCurl($this->docDbName, null, "PUT");
        $res = json_decode($strRes,true);
        return isset($res["ok"]) ? true : false;
    }
    public function addSignInfoSql(){
        $guid = $this->getUserGuid();
        $sql = "INSERT INTO user (userId,userName,userPassWord,docDb) VALUES ('$guid','$this->userName','{$this->signInfo['userpwd']}','$this->docDbName');"
              ."SELECT LAST_INSERT_ID() INTO @insert_id;"
              ."INSERT INTO user_info (id,userId,level,email,registerTime) VALUES (@insert_id,'$guid',0,'{$this->signInfo['email']}',now());";
        return $sql;
    }
}
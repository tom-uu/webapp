<?php
require_once(dirname(__FILE__).'/../common/db.php');
include_once dirname(__FILE__).'/Model.php';

class SignInModel extends Model{}

trait CheckSignInfo{
    private $piKey;
    private $username;
    private $userpwd;
    private $clientIp;
    public function getUserSignInfoSql(){
        return "SELECT a.userId AS userId,a.userName AS userName,a.userPassWord AS userPassWord,a.docDb AS docDb,b.registerTime AS registerTime FROM user a INNER JOIN user_info b ON a.id=b.id WHERE a.userName='$this->username'";
    }
    public function getUpdateClientIpSql(){
        return "UPDATE user SET lastLoginIp='$this->clientIp',lastLoginTime=now() WHERE userName='$this->username'";
    }
    public function vertifyPassWord($sign_pwd,$user_pwd){
        return password_verify($sign_pwd,$user_pwd);
    }
    public function getClientIp(){
        if(getenv('HTTP_CLIENT_IP') && strcasecmp(getenv('HTTP_CLIENT_IP'), 'unknown')){
                $ip = getenv('HTTP_CLIENT_IP');
        }
        elseif(getenv('HTTP_X_FORWARDED_FOR') && strcasecmp(getenv('HTTP_X_FORWARDED_FOR'), 'unknown')){
                $ip = getenv('HTTP_X_FORWARDED_FOR');
        }
        elseif(getenv('REMOTE_ADDR') && strcasecmp(getenv('REMOTE_ADDR'), 'unknown')){
                $ip = getenv('REMOTE_ADDR');
        }
        else{
            $filter_ip = filter_input(INPUT_SERVER,'REMOTE_ADDR');
            $ip = strcasecmp($filter_ip, 'unknown') ? $filter_ip : false;
        }
        return $ip;
    }
    public function decodeInfo($private_key,$postData){
        if(isset($private_key) && !empty($private_key)){
            $this->piKey = openssl_pkey_get_private($private_key);
        }
        if(!empty($this->piKey) && !empty($postData["username"]) && !empty($postData["userpwd"])){
            $this->username = $postData["username"];
            $this->userpwd = $postData["userpwd"];
            $this->clientIp = $this->getClientIp();
            if($this->clientIp && !empty($this->clientIp)){
                openssl_private_decrypt(base64_decode(str_replace("%2B","+",$this->username)),$this->username,$this->piKey);
                openssl_private_decrypt(base64_decode(str_replace("%2B","+",$this->userpwd)),$this->userpwd,$this->piKey);
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
}
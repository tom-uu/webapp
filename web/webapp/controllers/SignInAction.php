<?php
include_once dirname(__FILE__).'/../common/key.php';
require_once(dirname(__FILE__).'/Controller.php');
require_once(dirname(__FILE__).'/../models/SignInModel.php');
require_once(dirname(__FILE__).'/../common/signContext.php');
require_once(dirname(__FILE__).'/../common/router.php');

class SignInAction extends Controller{}

class SignIn extends SignContext{
    use CheckSignInfo;
    public function setCookie($flag,$userId,$userName,$docDbName,$regTime){
        if($flag === true){
            setrawcookie("id",$userId,0,"/webapp/",null,null,true);
            setrawcookie("name",$userName,0,"/webapp/",null,null,true);
            setrawcookie("docDbHost","couchdb",0,"/webapp/",null,null,true);
            setrawcookie("docDb",$docDbName,0,"/webapp/",null,null,true);
            setrawcookie("regTime",$regTime,0,"/webapp/",null,null,true);
        }
    }
    public function updateClientIp($flag){
        return $flag === true ? $this->model->query("query",$this->getUpdateClientIpSql()) : false;
    }
    public function checkPassWord($userpwd){
        return $this->vertifyPassWord($this->userpwd,$userpwd) ? true : false;
    }
    public function callBack(){
        if($this->decodeInfo($this->privateKey,$this->postData)){
            $this->model->connect();
            $res = array();
            $signInfo = $this->model->query("query",$this->getUserSignInfoSql())->fetch_assoc();
            $res["username"] = $signInfo === NULL ? false : true;
            if($res["username"] === true){
                $res["userpwd"] = $this->checkPassWord($signInfo["userPassWord"]);
                $updateRes = $this->updateClientIp($res["userpwd"]);
                $this->setCookie($updateRes,$signInfo["userId"],$signInfo["userName"],$signInfo["docDb"],$signInfo["registerTime"]);
            }
            $this->model->close();
            echo json_encode($res);
        }else{
            echo false;
        }
    }
}

class SignOut extends SignContext{
    public function callBack(){
        $resFlag = false;
        if(isset($this->userId) && !empty($this->userId)){
            $timeValue = time()-3600;
            setrawcookie("id",null,$timeValue,"/webapp/",null,null,true);
            setrawcookie("name",null,$timeValue,"/webapp/",null,null,true);
            setrawcookie("docDbHost",null,$timeValue,"/webapp/",null,null,true);
            setrawcookie("docDb",null,$timeValue,"/webapp/",null,null,true);
            setrawcookie("regTime",null,$timeValue,"/webapp/",null,null,true);
            $resFlag = true;
        }
        echo $resFlag;
    }
}

(new SignInAction('SignInModel'))->callContext();
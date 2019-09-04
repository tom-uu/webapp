<?php 
include_once dirname(__FILE__).'/../common/key.php';
require_once(dirname(__FILE__).'/Controller.php');
require_once(dirname(__FILE__).'/../models/SignUpModel.php');
require_once(dirname(__FILE__).'/../common/signContext.php');
require_once(dirname(__FILE__).'/../common/router.php');

class SignUpAction extends Controller{}

class SignUp extends SignContext{
    use AddSignInfo,httpRequest;
    public function checkUserName($username){
        $countUserName = $this->model->query("query",$this->countUserNameSql($username))->fetch_assoc()['countUserName'];
        return $countUserName > 0 ? false : true;
    }
    public function getDesignJson(){
        return file_get_contents(dirname(__FILE__).'/../json/doc_list.json', FILE_USE_INCLUDE_PATH);
    }
    public function addSignInfo(){
        $this->model->query("multi_query",$this->addSignInfoSql());
        $this->model->fetchResults();
        return $this->model->checkResults();
    }
    public function callBack(){
        if($this->decodeInfo($this->privateKey,$this->postData)){
            $res = array();
            $this->model->connect();
            if($this->checkUserName($this->signInfo["username"])){
                $dbRes = $this->addDocdb();
                $docRes = $this->addDesignDoc($this->getDesignJson());
                $dbRes && $docRes ? $res["rows"] = $this->addSignInfo() : $res["docDb"] = false;                
            }else{
                $res["username"] = false;
            }
            $this->model->close();
            echo json_encode($res);
        }else{
            echo false;
        }
    }
}

(new SignUpAction('SignUpModel'))->callContext();
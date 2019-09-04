<?php
require_once(dirname(__FILE__).'/Controller.php');
require_once(dirname(__FILE__).'/../models/CollectModel.php');
require_once(dirname(__FILE__).'/../common/router.php');

class CollectAction extends Controller{}

class Context{
    protected $userId;
    protected $model;
    protected $postData;
    public function __construct($model,$userId,$postData){
        $this->model = $model;
        $this->userId = $userId;
        $this->postData = $postData;
    }
}

class LoadView extends Context{
    use getCollectOrderList_T,getOrderDocInfo_T,fetchResult_T,countRowSql_T;
    public function getDocListData($collectId,$startNum,$limitNum){
        $res = $this->model->query("query",$this->getOrderDocInfoSql($collectId,$startNum,$limitNum));
        return $this->fetchResult($res);
    }
    public function getCollectOrderData(){
        $res = $this->model->query("query",$this->getCollectOrderListSql());
        return $this->fetchResult($res);
    }
    public function getDisplayData($startNum,$limitNum){
        $data = array();
        $this->model->connect();
        $data["orderList"] = $this->getCollectOrderData();
        $data["docList"] = $this->getDocListData($data["orderList"][0]["collectId"],$startNum,$limitNum);
        $data["countDoc"] = $this->model->query("query",$this->getCountRowSql())->fetch_assoc()["num"];
        $this->model->close();
        return $data;
    }
    public function callBack($startNum,$limitNum){
        $file = array();
        $file["html"] = file_get_contents(dirname(__FILE__)."/../views/collect.html", FILE_USE_INCLUDE_PATH);
        $file["pageData"] = $this->getDisplayData($startNum,$limitNum);
        echo json_encode($file);
    }
}

class GetOrderDocInfo extends Context{
    use getOrderDocInfo_T,fetchResult_T,countRowSql_T;
    public function callBack($collectId,$startNum,$limitNum){
        $data = array();
        $this->model->connect();
        $sql = $this->getOrderDocInfoSql($collectId,$startNum,$limitNum);
        $res = $this->model->query("query",$sql);
        if($res){
            $data["docList"] = $this->fetchResult($res);
            $data["countDoc"] = $this->model->query("query",$this->getCountRowSql())->fetch_assoc()["num"];
        }
        $this->model->close();
        echo $res ? json_encode($data) : $res;
    }
}

class GetOrderDocId extends Context{
    use getOrderDocId_T;
    public function callBack($collectId,$startNum){
        $data = array();
        $this->model->connect();
        $sql = $this->getOrderDocIdSql($collectId,$startNum);
        $res = $this->model->query("query",$sql);
        if($res){
            $data["docId"] = $res->fetch_assoc()["docId"];
        }
        $this->model->close();
        echo $res ? json_encode($data) : $res;
    }
}

class AddCollectOrder extends Context{
    use addCollectOrder_T,countCollectOrder_T;
    public function callBack(){
        $sql = $this->collectOrderSql($this->postData);
        $data = array();
        if($sql != false){
            $this->model->connect();
            $this->model->query("multi_query",$sql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
            if($checkRes){
                $data["collectInfo"] = $this->collectInfo;
                $data["countCollect"] = $this->model->query("query",$this->countCollectOrderSql())->fetch_assoc()["countCollect"];
            }
            $this->model->close(); 
        }
        echo count($data) > 0 ? json_encode($data) : false;
    }
}

class DeleteCollectOrder extends Context{
    use deleteCollectOrder_T,fetchResult_T;
    public function getDeleteCollectOrderArr(){
        $sql = $this->getDeleteCollectOrderSql($this->postData);
        $info = array();
        if($sql != false){
            $res = $this->model->query("query",$sql);
            if($res != false){
                $info  = $this->fetchResult($res);
            }
        }
        return $info ;
    }
    public function callBack(){
        $this->model->connect();
        $info = $this->getDeleteCollectOrderArr();
        $sql = $this->deleteCollectOrderSql($info);
        if($sql != false){
            $this->model->query("multi_query",$sql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
        }
        $this->model->close();
        echo $sql != false && !is_array($checkRes) ? true : false;
    }
}

class ArrangeCollectOrder extends Context{
    use arrangeCollectOrder_T;
    public function callBack(){
        $this->model->connect();
        $sql = $this->arrangeCollectOrderSql($this->postData);
        if($sql != false){
            $this->model->query("multi_query",$sql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
        }
        $this->model->close();
        echo $sql == false || is_array($checkRes) ? false : true;
    }
}

(new CollectAction('CollectModel'))->callContext();
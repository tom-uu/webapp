<?php
require_once(dirname(__FILE__).'/Controller.php');
require_once(dirname(__FILE__).'/../models/IssueOrderModel.php');
require_once(dirname(__FILE__).'/../common/context.php');
require_once(dirname(__FILE__).'/../common/router.php');

class IssueOrderAction extends Controller{}

class LoadView extends Context{
    use loadOrderList_T,countCollectOrder_T,fetchResult_T;
    public function callBack($issueId){
        $this->model->connect();
        $res = $this->model->query("query",$this->loadOrderListSql($issueId));
        if($res){
            $data["orderList"] = $this->fetchResult($res);
            $data["countCollect"] = $this->model->query("query",$this->countCollectOrderSql())->fetch_assoc()["countCollect"];
        }
        $this->model->close();
        echo $res ? json_encode($data) : $res;
    }
}

class AddOrder extends Context{
    use addOrder_T;
    public function callBack($issueId){
        $sql = $this->addOrderSql($issueId,$this->postData);
        $data = array();
        if($sql != false){
            $this->model->connect();
            if($this->model->query("query",$sql)){
                $data["orderId"] = $this->orderId;
                $data["time"] = $this->time;
            }
            $this->model->close();
        }
        echo count($data) > 0 ? json_encode($data) : false;
    }
}

class UpdateOrderName extends Context{
    use updateOrderName_T;
    public function callBack($issueId,$orderId){
        $sql = $this->updateOrderNameSql($issueId,$orderId,$this->postData);
        if($sql != false){
            $this->model->connect();
            $res = $this->model->query("query",$sql);
            $this->model->close();
            echo $res;
        }else{
            echo false;
        }
    }
}

class DeleteOrder extends Context{
    use deleteOrder_T;
    public function callBack($issueId){
        $sql = $this->deleteOrderSql($issueId, $this->postData);
        if($sql != false){
            $this->model->connect();
            $res = $this->model->query("query",$sql);
            $this->model->close();
            echo $res;
        }else{
            echo false;
        }
    }
}

class GetOrderDocList extends Context{
    use getOrderDocList_T,fetchResult_T,countRowSql_T;
    public function callBack($issueId,$orderId,$startNum,$limitNum){
        $data = array();
        $this->model->connect();
        $sql = $this->getOrderDocListSql($issueId,$orderId,$startNum,$limitNum);
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
    public function callBack($issueId,$orderId,$startNum){
        $data = array();
        $this->model->connect();
        $sql = $this->getOrderDocIdSql($issueId,$orderId,$startNum);
        $res = $this->model->query("query",$sql);
        if($res){
            $data["docId"] = $res->fetch_assoc()["docId"];
        }
        $this->model->close();
        echo $res ? json_encode($data) : $res;
    }
}

class GetIssueDocList extends Context{
    use loadIssueDocList_T,fetchResult_T,countRowSql_T;
    public function callBack($issueId,$orderId,$startNum,$limitNum){
        $data = array();
        $this->model->connect();
        $res = $this->model->query("query",$this->getIssueDocInfoSql($issueId,$orderId,$startNum,$limitNum));
        if($res != false){
            $data["docList"] = $this->fetchResult($res);
            $data["countDoc"] = $this->model->query("query",$this->getCountRowSql())->fetch_assoc()["num"];
        }
        $this->model->close();
        echo json_encode($data);
    }
}

class AddOrderDoc extends Context{
    use addOrderDoc_T,loadIssueDocList_T,countRowSql_T;
    public function getIssueDocInfo($sql){
        $data = array();
        $issueDocInfoRes = $this->model->query("query",$sql);
        if($issueDocInfoRes != false){
            $data["docInfo"] = $issueDocInfoRes->fetch_assoc();
            $data["countDoc"] = $this->model->query("query",$this->getCountRowSql())->fetch_assoc()["num"];
        }
        return $data;
    }
    public function callBack($issueId,$orderId,$startNum){
        $addOrderDocSql = $this->addOrderDocSql($issueId,$orderId,$this->postData);
        if($addOrderDocSql != false){
            $data = array();
            $this->model->connect();
            $this->model->query("multi_query",$addOrderDocSql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
            if(!is_array($checkRes)){
                $data = $this->getIssueDocInfo($this->getIssueDocInfoSql($issueId,$orderId,$startNum,1));
            }
            $this->model->close(); 
            echo $checkRes ? json_encode($data) : $checkRes;
        }else{
            echo false;
        }
    }
}

class DeleteOrderDoc extends Context{
    use deleteOrderDoc_T,fetchResult_T;
    public function getMiddleOrderInfo($issueId,$orderId,$data){
        $midInfoSql = $this->getMiddleOrderInfoSql($issueId,$orderId,$data);
        if($midInfoSql != false){
            $midInfoRes = $this->model->query("query",$midInfoSql);
            if($midInfoRes != false){
                $orderDocArr = $this->fetchResult($midInfoRes);
                return $this->updateMiddleOrderNumSql($orderDocArr);
            }
        }
        return null;
    }
    public function callBack($issueId,$orderId){
        $this->model->connect();
        $preUpdateSql = $this->getMiddleOrderInfo($issueId,$orderId,$this->postData);
        $checkRes = false;
        if($preUpdateSql !== null){
            $updateSql = $this->deleteOrderDocSql($preUpdateSql);
            $this->model->query("multi_query",$updateSql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
        }
        $this->model->close();
        echo $checkRes;
    }
}

class ArrageOrderDoc extends Context{
    use arrangeOrderDoc_T;
    public function callBack($issueId,$orderId,$docId,$referDocId){
        $this->model->connect();
        $sql = $this->arrangeOrderDocSql($issueId,$orderId,$docId,$referDocId);
        echo $sql;
        $this->model->query("multi_query",$sql);
        $this->model->fetchResults();
        $this->model->close();
        echo $this->model->checkResults();
    }
}

(new IssueOrderAction('IssueOrderModel'))->callContext();
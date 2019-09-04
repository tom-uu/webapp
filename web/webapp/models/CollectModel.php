<?php
require_once(dirname(__FILE__).'/../common/db.php');
include_once dirname(__FILE__).'/Model.php';

class CollectModel extends Model{}

trait getItemId_T{
    public function getDateTime(){
        $mtimestamp = sprintf("%.3f", microtime(true));
        $timestamp = floor($mtimestamp);
        $milliseconds = round(($mtimestamp - $timestamp) * 1000);
        return $datetime = date("YmdHis", $timestamp). $milliseconds;
    }
    public function getIdByIndex($index){
        $datetime = $this->getDateTime();
        $all=($datetime).($index < 10 ? '0'.$index : $index);
        $id=base_convert($all,10,36);
        return $id;
    }
}

trait fetchResult_T{
    public function fetchResult($result){
        $res = array();
        if($result !== false){
            while($row = $result->fetch_array(MYSQLI_ASSOC)){
                $res[] = $row;
            }
            $result->free();
        }
        return $res;
    }
}

trait implodeStr_T{
    public function implodeStr($array_data){
        return implode(",",array_map(function($value){return "'$value'";},$array_data));
    }
}

trait countRowSql_T{
    public function getCountRowSql(){
        return "SELECT FOUND_ROWS() AS num";
    }
}

trait countCollectOrder_T{
    public function countCollectOrderSql(){
        return "SELECT count(collectId) AS countCollect FROM collect WHERE userId='$this->userId'";
    }
}

trait getOrderDocInfo_T{
    public function getOrderDocInfoSql($collectId,$startNum,$limitNum){
        return "SELECT SQL_CALC_FOUND_ROWS a.docId AS docId,c.editTime AS time FROM issue_order_doc a INNER JOIN collect b ON a.userId=b.userId AND a.issueId=b.issueId AND a.orderId=b.orderId INNER JOIN doc c ON a.userId=c.userId AND a.docId=c.docId WHERE a.userId='$this->userId' AND b.collectId='$collectId' ORDER BY a.orderNum LIMIT $startNum,$limitNum";
    }
}

trait getCollectOrderList_T{
    public function getCollectOrderListSql(){
        return "SELECT a.collectId AS collectId,b.orderName AS orderName,(SELECT count(docId) FROM issue_order_doc WHERE userId=a.userId AND issueId=a.issueId AND orderId=a.orderId ) AS docNum FROM collect a INNER JOIN issue_order b ON a.userId=b.userId AND a.issueId=b.issueId AND a.orderId=b.orderId WHERE a.userId='$this->userId' ORDER BY a.orderNum";
    }
}

trait getOrderDocId_T{
    public function getOrderDocIdSql($collectId,$startNum){
        return "SELECT a.docId AS docId FROM issue_order_doc a INNER JOIN collect b ON a.userid=b.userId AND a.issueId=b.issueId AND a.orderId=b.orderId WHERE a.userId='$this->userId' AND b.collectId='$collectId' ORDER BY a.orderNum LIMIT $startNum,1";
    }
}

trait addCollectOrder_T{
    use getItemId_T;
    private $orderIds;
    public $collectInfo = array();
    private function getOrderIdsValueStr($userId,$issueId,$orderIds){
        $count = count($orderIds);
        $sql = '';
        if($count > 0){
            for($i=0;$i<$count;$i++){
                $collectId = $this->getIdByIndex($i);
                $orderId = $orderIds[$i];
                $sql .= "('$userId','$collectId','$issueId','$orderId',@orderNum+$i)";
                if($i < $count-1){
                    $sql .= ',';
                }
                array_push($this->collectInfo,["orderId"=>$orderId,"collectId"=>$collectId]);
            }
        }
        return $sql;
    }
    public function collectOrderSql($data){
        if(!empty($data) && isset($data["issueId"]) && isset($data["orderIds"])){
            $userId = $this->userId;
            $issueId = $data["issueId"];
            $orderIds = $data["orderIds"];
            $orderIdsValue = $this->getOrderIdsValueStr($userId,$issueId,$orderIds);
            return !empty($orderIdsValue) ? "START TRANSACTION;SELECT MAX(orderNum) INTO @maxOrderNum FROM collect WHERE userId='$userId';"
                ."SET @orderNum=if(ISNULL(@maxOrderNum),1,@maxOrderNum+1);"
                ."INSERT INTO collect (userId,collectId,issueId,orderId,orderNum) VALUES $orderIdsValue;COMMIT;" : false;
        }else{
            return false;
        }
    }
}

trait resetCollectOrderNum_T{
    private function buildCollectUpdateSql($numOffset,$headNum,$tailNum){
        return $tailNum-$headNum > 1 ? "UPDATE collect SET orderNum=orderNum-$numOffset WHERE userId='$this->userId' AND orderNum>$headNum AND orderNum<$tailNum;" : "";
    }
    public function updateCollectInfoSql($innerInfo){
        $len = count($innerInfo);
        $updateSql = "";
        $offset = 0;
        for($i=0;$i<$len;$i++){
            $thisInfo = $innerInfo[$i];
            $orderNum = $thisInfo["orderNum"];
            $offset++;
            if($i<$len-1){
                $nextInfo = $innerInfo[$i+1];
                $nextOrderNum = $nextInfo["orderNum"];
                $updateSql .= $this->buildCollectUpdateSql($offset,$orderNum,$nextOrderNum);
            }else if($i === $len-1){
                $updateSql .= "UPDATE collect SET orderNum=orderNum-$offset WHERE userId='$this->userId' AND orderNum>$orderNum;";
            }
        }
        return $updateSql;
    }
}

trait deleteCollectOrder_T{
    use implodeStr_T,resetCollectOrderNum_T;
    private $idsStr;
    private function getDeleteOrderNumSql($idsStr){
        return "SELECT orderNum FROM collect WHERE userId='$this->userId' AND collectId IN ($idsStr) ORDER BY orderNum";
    }
    public function getDeleteCollectOrderSql($data){
        if(isset($data) && isset($data["ids"])){
            $ids = $data["ids"];
            $this->idsStr = $this->implodeStr($ids);
            return $this->getDeleteOrderNumSql($this->idsStr);
        }else{
            return false;
        }
    }
    public function deleteCollectOrderSql($collectInfo){
        $collectIdsStr = $this->idsStr; 
        return isset($collectIdsStr) && !empty($collectIdsStr) ? "START TRANSACTION;DELETE FROM collect WHERE userId='$this->userId' AND collectId IN ($collectIdsStr);".$this->updateCollectInfoSql($collectInfo)."COMMIT;" : false;
    }
}

trait arrangeCollectOrder_T{
    public function arrangeCollectOrderSql($info){
        if(isset($info) && isset($info["id"]) && isset($info["refId"])){
            $collectId = $info["id"];
            $referCollectId = $info["refId"];
            $whereStr = "WHERE userId='$this->userId'";
            return "START TRANSACTION;SELECT orderNum INTO @orderNum FROM collect $whereStr AND collectId='$collectId';"
                  ."SELECT orderNum INTO @refOrderNum FROM collect $whereStr AND collectId='$referCollectId';"
                  ."SET @offset=if(@orderNum>@refOrderNum,1,-1);"
                  ."SET @headNum=if(@orderNum>@refOrderNum,@refOrderNum,@orderNum+1);"
                  ."SET @tailNum=if(@orderNum>@refOrderNum,@orderNum-1,@refOrderNum-1);"
                  ."SET @targetNum=if(@orderNum>@refOrderNum,@refOrderNum,@refOrderNum-1);"
                  ."UPDATE collect SET orderNum=orderNum+@offset $whereStr AND orderNum>=@headNum AND orderNum<=@tailNum;"
                  ."UPDATE collect SET orderNum=@targetNum $whereStr AND collectId='$collectId';COMMIT;";
        }else{
            return false;
        }
    }
}
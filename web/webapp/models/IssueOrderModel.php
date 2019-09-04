<?php
require_once(dirname(__FILE__).'/../common/db.php');
include_once dirname(__FILE__).'/Model.php';

class IssueOrderModel extends Model{}

trait getItemId_T{
    public function getItemId(){//之前用这段代码获取Id时，前台插入时会出现操作完毕但是没有插入数据的情况，可能是重复插入Id导致的；因此换了下面的代面避免这个问题；2019.2.22.20:22
        $mtimestamp = sprintf("%.3f", microtime(true)); // 带毫秒的时间戳
        $timestamp = floor($mtimestamp); // 时间戳
        $milliseconds = round(($mtimestamp - $timestamp) * 1000); // 毫秒
        $datetime = date("YmdHis", $timestamp). $milliseconds;
        $all=($datetime).mt_rand(0,999);//两位随机,当前时间戳-新时间戳
        $id=base_convert($all,10,36);//把10进制转为36进制的唯一ID
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

trait loadOrderList_T{
    public function loadOrderListSql($issueId){
        $userId = "$this->userId";
        return "SELECT a.orderId AS orderId,a.orderName AS orderName,a.createTime AS time,count(b.docId) AS docNum,IFNULL(c.collectId,0) AS collectId FROM issue_order a LEFT JOIN issue_order_doc b ON a.userId=b.userId AND a.issueId=b.issueId AND a.orderId=b.orderId LEFT JOIN collect c ON a.userId=c.userId AND a.issueId=c.issueId AND a.orderId=c.orderId WHERE a.userId='$userId' AND a.issueId='$issueId' GROUP BY orderId,collectId ORDER BY a.createTime";
    }
}

trait countCollectOrder_T{
    public function countCollectOrderSql(){
        return "SELECT count(collectId) AS countCollect FROM collect WHERE userId='$this->userId'";
    }
}

trait addOrder_T{
    use getItemId_T;
    private $orderId;
    private $time;
    public function addOrderSql($issueId,$data){
        if(isset($data["orderName"])){
            $this->orderId = $this->getItemId();
            $this->time = date('Y-m-d H:i:s', time());
            return "INSERT INTO issue_order (userId,issueId,orderId,orderName,createTime) VALUES ('$this->userId','$issueId','$this->orderId','".$data["orderName"]."','$this->time')";
        }else{
            return false;
        }
    }
}

trait updateOrderName_T{
    public function updateOrderNameSql($issueId,$orderId,$data){
        return isset($data["orderName"]) ? "UPDATE issue_order SET orderName='".$data["orderName"]."' WHERE userId='$this->userId' AND issueId='$issueId' AND orderId='$orderId'" : false;
    }
}

trait deleteOrder_T{
    use implodeStr_T;
    public function deleteOrderSql($issueId,$data){
        return isset($data["orderIds"]) ? "DELETE FROM issue_order WHERE userId='$this->userId' AND issueId='$issueId' AND orderId IN (".$this->implodeStr($data["orderIds"]).")" : false;
    }
}

trait loadIssueDocList_T{
    public function getIssueDocInfoSql($issueId,$orderId,$startNum,$limitNum){
        return "SELECT SQL_CALC_FOUND_ROWS a.docId AS docId,b.editTime AS time FROM issue_doc a INNER JOIN doc b ON a.userId=b.userId AND a.docId=b.docId WHERE a.userId='$this->userId' AND a.issueId='$issueId' AND a.docId NOT IN (SELECT docId FROM issue_order_doc WHERE userId='$this->userId' AND issueId='$issueId' AND orderId='$orderId') ORDER BY time DESC LIMIT $startNum,$limitNum"; 
    }
}

trait addOrderDoc_T{
    private $issueId;
    private $orderId;
    public function addOrderDocSql($issueId,$orderId,$data){
        if(isset($data) && !empty($data) && isset($data["docId"])){
            $this->issueId = $issueId;
            $this->orderId = $orderId;
            $docId = $data["docId"];
            return "START TRANSACTION;SELECT MAX(orderNum) INTO @maxOrderNum FROM issue_order_doc WHERE userId='$this->userId' AND issueId='$issueId' AND orderId='$orderId';"
                ."SET @orderNum=if(ISNULL(@maxOrderNum),1,@maxOrderNum+1);"
               ."INSERT INTO issue_order_doc (userId,issueId,orderId,docId,orderNum) VALUES ('$this->userId','$issueId','$orderId','$docId',@orderNum);COMMIT;";
        }else{
            return false;
        }
    }
}

trait deleteOrderDoc_T{
    use implodeStr_T;
    private $issueId;
    private $orderId;
    private $tailOrderNum;
    private $whereStr;
    private $docIdsNum;
    private $docIdsStr;
    private $docIds;
    public function yieldData($data){
        foreach ($data as $key=>$value){
            yield $key=>$value;
        }
    }
    public function updateMiddleOrderNumSql($orderDocArr){
        $countData = count($orderDocArr);
        $yield_data = $this->yieldData($orderDocArr);
        $whenSql = "";
        $count = $n = 0;
        foreach($yield_data as $value){
            $docId = $value["docId"];
            $preOrderNum = $value["orderNum"];
            if(in_array($docId,$this->docIds)){
                $count++;
            }else{
                $orderNum = $preOrderNum-$count;
                $whenSql .= "WHEN '$docId' THEN $orderNum ";
            }
            if($n === $countData-1){
                $this->tailOrderNum = $preOrderNum;
            }
            $n++;
        }
        return $this->docIdsNum === $count ? false : "UPDATE issue_order_doc SET orderNum=CASE docId $whenSql END WHERE docId NOT IN(".$this->docIdsStr.") AND userId='$this->userId' AND issueId='$this->issueId' AND orderId='$this->orderId';";
    }
    public function getMiddleOrderInfoSql($issueId,$orderId,$data){
        if(isset($data["docIds"]) && count($data["docIds"]) > 0){
            $this->issueId = $issueId;
            $this->orderId = $orderId;
            $docIds = $data["docIds"];
            $this->docIdsNum = count($docIds);
            $this->docIds = $docIds;
            $this->docIdsStr = $this->implodeStr($docIds);
            $this->whereStr = "WHERE userId='$this->userId' AND issueId='$issueId' AND orderId='$orderId'";
            $docIdsCondition = "AND docId IN (".$this->docIdsStr.")";
            $minOrderNumSql = "SELECT MIN(orderNum) FROM issue_order_doc $this->whereStr $docIdsCondition";
            $maxOrderNumSql = "SELECT MAX(orderNum) FROM issue_order_doc $this->whereStr $docIdsCondition";
            return "SELECT docId,orderNum FROM issue_order_doc $this->whereStr AND orderNum>=($minOrderNumSql) AND orderNum <=($maxOrderNumSql);";
        }else{
            return false;
        }      
    }
    public function deleteOrderDocSql($updateMiddleInfoSql){
        $sql = "START TRANSACTION;";
        if($updateMiddleInfoSql != false){
            $sql .= $updateMiddleInfoSql;
        }
        $sql .= "SELECT orderNum INTO @orderNum FROM issue_order_doc $this->whereStr AND docId IN (".$this->docIdsStr.");"
             ."DELETE FROM issue_order_doc WHERE userId='$this->userId' AND issueId='$this->issueId' AND orderId='$this->orderId' AND docId IN (".$this->docIdsStr.");"
             ."UPDATE issue_order_doc SET orderNum=orderNum-$this->docIdsNum $this->whereStr AND orderNum > $this->tailOrderNum;COMMIT;";
        return $sql;
    }
}

trait setOrderDocNum_T{
    public function setOrderDocNumSql(){
        return "SELECT count(docId) INTO @docNum FROM issue_order_doc WHERE userId='$this->userId' AND issueId='$this->issueId' AND orderId='$this->orderId';"
               ."UPDATE issue_order SET docNum=@docNum WHERE userId='$this->userId' AND issueId='$this->issueId' AND orderId='$this->orderId';";
    } 
}

trait arrangeOrderDoc_T{
    public function arrangeOrderDocSql($issueId,$orderId,$docId,$referDocId){
        $whereStr = "WHERE userId='$this->userId' AND issueId='$issueId' AND orderId='$orderId'";
        return "START TRANSACTION;SELECT CAST(orderNum AS SIGNED) INTO @orderNum FROM issue_order_doc $whereStr AND docId='$docId';"
              ."SELECT CAST(orderNum AS SIGNED) INTO @refOrderNum FROM issue_order_doc $whereStr AND docId='$referDocId';"
              ."SET @offset=if(@orderNum>@refOrderNum,1,-1);"
              ."SET @headNum=if(@orderNum>@refOrderNum,@refOrderNum,@orderNum+1);"
              ."SET @tailNum=if(@orderNum>@refOrderNum,@orderNum-1,@refOrderNum-1);"
              ."SET @targetNum=if(@orderNum>@refOrderNum,@refOrderNum,@refOrderNum-1);"
              ."UPDATE issue_order_doc SET orderNum=orderNum+@offset $whereStr AND orderNum>=@headNum AND orderNum<=@tailNum;"
              ."UPDATE issue_order_doc SET orderNum=@targetNum $whereStr AND docId='$docId';COMMIT;";
    }
}

trait getOrderDocList_T{
    public function getOrderDocListSql($issueId,$orderId,$startNum,$limitNum){
        return "SELECT SQL_CALC_FOUND_ROWS a.docId AS docId,c.editTime AS time FROM issue_order_doc a INNER JOIN issue_doc b ON a.userId=b.userId AND a.issueId=b.issueId AND a.docId=b.docId INNER JOIN doc c ON b.userId=c.userId AND b.docId=c.docId WHERE a.userId='$this->userId' AND a.issueId='$issueId' AND a.orderId='$orderId' ORDER BY a.orderNum LIMIT $startNum,$limitNum";
    }
}

trait getOrderDocId_T{
    public function getOrderDocIdSql($issueId,$orderId,$startNum){
        return "SELECT docId FROM issue_order_doc WHERE userId='$this->userId' AND issueId='$issueId' AND orderId='$orderId' ORDER BY orderNum LIMIT $startNum,1";
    }
}
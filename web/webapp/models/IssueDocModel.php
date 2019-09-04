<?php
require_once(dirname(__FILE__).'/../common/db.php');
include_once dirname(__FILE__).'/Model.php';

class IssueDocModel extends Model{}

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

trait addDoc_T{
    private $docId;
    private $addTime;
    private $issueId;
    public function addDocInfoSql($issueId,$data){
        $this->issueId = $issueId;
        if(isset($data) && !empty($data) && isset($data["docId"])){
            $this->docId = $data["docId"];
            $this->addTime = date('Y-m-d H:i:s', time());
            $valueStr = "('$this->userId','$this->issueId','$this->docId','$this->addTime')";
            $addNewDocInfoSql = "INSERT INTO doc (userId,docId,createTime,editTime) VALUES ('$this->userId','$this->docId','$this->addTime','$this->addTime');";
            $deleteRecentDocInfoSql = "DELETE FROM issue_recent_doc WHERE userId='$this->userId' AND issueId='$this->issueId';";
            $addRecentDocInfoSql = "INSERT INTO issue_recent_doc (userId,issueId,docId,addTime) VALUES ('$this->userId','$this->issueId','$this->docId','$this->addTime');";
            return "START TRANSACTION;".$addNewDocInfoSql."INSERT INTO issue_doc (userId,issueId,docId,addTime) VALUES $valueStr;".$deleteRecentDocInfoSql.$addRecentDocInfoSql."COMMIT;";
        }else{
            return null;
        }
    }
}

trait addDocByList_T{
    private $docId;
    private $addTime;
    private $issueId;
    public function addDocInfoSql($data){
        $this->issueId = $data["issueId"];
        if(isset($data) && !empty($data) && isset($data["docId"])){
            $this->docId = $data["docId"];
            $this->addTime = date('Y-m-d H:i:s', time());
            $preValueStr = "('$this->userId','$this->issueId','$this->docId'";
            $deleteRecentDocInfoSql = "DELETE FROM issue_recent_doc WHERE userId='$this->userId' AND issueId='$this->issueId';";
            $addRecentDocInfoSql = "INSERT INTO issue_recent_doc (userId,issueId,docId,addTime) VALUES $preValueStr,'$this->addTime');";
            return "START TRANSACTION;INSERT INTO issue_doc (userId,issueId,docId) VALUES $preValueStr);".$deleteRecentDocInfoSql.$addRecentDocInfoSql."COMMIT;";
        }else{
            return false;
        }
    }
}

trait loadDocList_T{
    public function getDocInfoSql($issueId,$condition,$startNum,$limitNum){
        $conditionStr = empty($condition) ? "" : $condition;
        return "SELECT SQL_CALC_FOUND_ROWS a.docId AS docId,b.editTime AS time FROM issue_doc a INNER JOIN doc b ON a.userId=b.userId AND a.docId=b.docId WHERE a.userId='$this->userId' AND a.issueId='$issueId'$conditionStr ORDER BY time DESC LIMIT $startNum,$limitNum"; 
    }
}

trait loadAddDocList_T{
    public function loadAddDocListSql($infoData,$startNum,$limitNum){
        if(!empty($infoData) && isset($infoData["issueId"])){
            $issueId = $infoData["issueId"];
            $classId = $infoData["classId"];
            $userId = $this->userId;
            $clsCondition = $classId !== '0' ? "IN (SELECT docId FROM doc_tag WHERE userId='$userId' AND classId='$classId')" : "NOT IN (SELECT docId FROM doc_tag WHERE userId='$userId')";
            return "SELECT SQL_CALC_FOUND_ROWS docId,editTime AS time FROM doc WHERE userId='$userId' AND docId NOT IN (SELECT docId FROM issue_doc WHERE userId='$userId' AND issueId='$issueId') AND docId $clsCondition ORDER BY editTime DESC LIMIT $startNum,$limitNum";
        }else{
            return false;
        }
    }
}

trait getDocEditTime_T{
    public function getDocMinEditTimeSql(){
        return "SELECT MIN(DATE_FORMAT(editTime,'%Y-%m-%d')) AS minTime FROM doc WHERE userId='$this->userId'";
    }
}

trait getDocMinEditTime_T{
    public function getDocMinEditTimeSql($issueId){
        return "SELECT MIN(DATE_FORMAT(a.editTime,'%Y-%m-%d')) AS minTime FROM doc a INNER JOIN issue_doc b ON a.userId=b.userId AND a.docId=b.docId WHERE a.userId='$this->userId' AND b.issueId='$issueId'";
    } 
}

trait deleteDocInfo_T{
    use implodeStr_T;    
    private $issueId; 
    private $docInfo;
    private $conditionStr;
    public function deleteDocInfoSql($issueId,$docInfo){
        $this->issueId = $issueId;
        if(is_array($docInfo) && isset($docInfo["docIds"])){
            $docIds = $docInfo["docIds"];
            return "START TRANSACTION;DELETE FROM issue_doc WHERE userId='$this->userId' AND issueId='$issueId' AND docId IN (".$this->implodeStr($docIds).");"."COMMIT;";
        }else{
            return null;
        }
        
    }
    public function countRecentDocInfoSql(){
        return "SELECT COUNT(docId) AS num FROM issue_recent_doc WHERE userId='$this->userId' AND issueId='$this->issueId'";
    }
    public function setRecentDocInfoSql(){
        $whereStr = "WHERE userId='$this->userId' AND issueId='$this->issueId'";
        return "SELECT docId,addTime INTO @docId,@addTime FROM issue_doc $whereStr AND addTime=(SELECT MAX(addTime) FROM issue_doc $whereStr);"
                ."INSERT INTO issue_recent_doc (userId,issueId,docId,addTime) VALUES ('$this->userId','$this->issueId',@docId,@addTime);";
    }
    public function getConditionSql(){
        $addTime = array();
        if(isset($this->docInfo["addTime"])){
            $addTime = $this->docInfo["addTime"];
            return  " AND date(addTime) BETWEEN'".$addTime["startTime"]."' AND '".$addTime["endTime"]."'";
        }else{
            return null;
        }
    }
}

trait getDocGroupInfo_T{
    public function getDocGroupInfoSql($topId,$issueId){
        $userId = $this->userId;
        $topInfoStr = "doc_class WHERE userId='$userId' AND classId='$topId'";
        return "SELECT a.classId AS classId,a.className AS className,(SELECT COUNT(b.docId) FROM doc_tag b WHERE b.userId='$userId' AND b.classId=a.classId AND b.docId NOT IN (SELECT docId FROM issue_doc WHERE userId='$userId' AND issueId='$issueId')) AS countSub FROM doc_class a WHERE a.userId='$userId' AND a.leftNum>(SELECT leftNum FROM $topInfoStr) AND a.rightNum<(SELECT rightNum FROM $topInfoStr) ORDER BY a.nodeId;";
    }
}


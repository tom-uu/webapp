<?php
require_once(dirname(__FILE__).'/../common/db.php');
include_once dirname(__FILE__).'/Model.php';

class DocModel extends Model{}

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

trait getAllDocList_T{
    public function getDocListSql(){
        return "SELECT a.docId AS docId,a.editTime AS editTime,c.classId AS classId,c.className AS className,(c.rightNum-c.leftNum) AS numLen FROM doc a"
               ."LEFT JOIN doc_top_tag b ON a.userId=b.userId AND a.docId=b.docId INNER JOIN doc_class c ON b.topId=c.classId WHERE userId='$this->userId' ORDER BY editTime DESC LIMIT 0,10";
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

trait docListCondition_T{
    public $whereStr;
    public $orderStr;
    public $docIds = array();
    public $startNum;
    public $limitNum;
    private function getDataCondtion($conditionInfo){
        $sql = "";
        if(isset($conditionInfo["timeType"])){
            $dateInfo = $conditionInfo["date"];
            $timeType = $conditionInfo["timeType"];
            if($timeType === 0){
                $sql .= "AND date(createTime) BETWEEN '".$dateInfo["start"]."' AND '".$dateInfo["end"]."'";
            }else if($timeType === 1){
                $sql .= "AND date(editTime) BETWEEN '".$dateInfo["start"]."' AND '".$dateInfo["end"]."'";
                $this->orderSql = "ORDER BY a.editTime DESC";
            }
        }
        return $sql;
    }
    public function getConditionStr($conditionInfo){
        $this->whereStr = "WHERE a.userId='$this->userId'";
        $this->orderSql = "ORDER BY a.createTime DESC";
        if(isset($conditionInfo["date"]) && !empty($conditionInfo["date"])){
            $this->whereStr .= $this->getDataCondtion($conditionInfo);
        }
        if(isset($conditionInfo["classIds"]) && !empty($conditionInfo["classIds"])){
            return $conditionInfo["classIds"];
        }else{
            return null;
        }
    }
    public function getLimitSql($conditionInfo,$startNum,$limitNum){
        $sql = "";
        $this->startNum = $startNum;
        $this->limitNum = $limitNum;
        $classIds = $this->getConditionStr($conditionInfo);
        if(isset($classIds) && !empty($classIds)){
            $countClsIds = count($classIds);
            if($countClsIds > 0 && $classIds[0] !== "all"){
                $sql .= "SELECT SQL_CALC_FOUND_ROWS c.docId AS docId FROM (SELECT DISTINCT a.docId AS docId,b.editTime AS editTime FROM doc_tag a INNER JOIN doc b ON a.userId=b.userId AND a.docId=b.docId $this->whereStr AND a.classId IN(".$this->implodeStr($classIds).") $this->orderStr) c LIMIT $startNum,".$limitNum;
            }else if($countClsIds === 0){
                $sql .= "SELECT SQL_CALC_FOUND_ROWS a.docId AS docId FROM doc a $this->whereStr a.docId NOT IN(SELECT docId FROM doc_tag WHERE userId='$this->userId') GROUP BY docId $this->orderStr LIMIT $startNum,$limitNum";
            }
        }
        return $sql;
    }
    public function getDocInfoSql(){
        if(count($this->docIds) > 0){
            return "SELECT a.docId AS docId,a.createTime AS createTime,a.editTime AS editTime FROM doc a $this->whereStr AND docId IN (".$this->implodeStr($this->docIds).") $this->orderSql";
        }else{
            return "SELECT SQL_CALC_FOUND_ROWS a.docId AS docId,a.createTime AS createTime,a.editTime AS editTime FROM doc a $this->whereStr $this->orderSql LIMIT $this->startNum,$this->limitNum";
        }
    }
    public function getDocIds($res){
        if($res !== false){
            while($row = $res->fetch_array(MYSQLI_ASSOC)){
                $this->docIds[] = $row["docId"];
            }
            $res->free();
        }
    }
    public function fetchDocRes($result){
        $res = array();
        $idsFlag = false;
        if(count($this->docIds) === 0){
            $idsFlag = true;
        }
        if($result !== false){
            while($row = $result->fetch_array(MYSQLI_ASSOC)){
                $res[] = $row;
                if($idsFlag){
                    $this->docIds[] = $row["docId"];
                }
            }
            $result->free();
        }
        return $res;
    }
    public function fetchDocIds($docInfo){
        foreach($docInfo AS $value){
            $this->docIds[] = $value["docId"];
        }
    }
}

trait docListNoCondition_T{
    public $orderStr;
    public function getDocListSql($startNum,$limitNum){
        return "SELECT SQL_CALC_FOUND_ROWS docId,createTime,editTime FROM doc WHERE userId='$this->userId' ORDER BY createTime DESC LIMIT $startNum,$limitNum";
    }
    public function yieldDocId($data){
        foreach ($data as $value){
            yield $value["docId"];
        }
    }
    public function getDocIds($docInfo){
        $docIdsData = $this->yieldDocId($docInfo);
        $docIds = array();
        foreach($docIdsData AS $value){
            $docIds[] = $value;
        }
        return $docIds;
    }
}

trait docClassInfo_T{
    public function getDocClassInfoSql($docIds){
        return count($docIds) > 0 ? "SELECT a.docId AS docId,b.classId AS classId,b.className AS className,(b.rightNum-b.leftNum) AS numLen FROM doc_tag a INNER JOIN doc_class b ON a.userId=b.userId AND a.classId=b.classId WHERE a.userId='$this->userId' AND a.docId IN(".$this->implodeStr($docIds).")" : null;
    }
}

trait getTopClsInfo_T{
    public function getTopClsSql(){
        return "SELECT classId,className,leftNum,rightNum FROM doc_class WHERE userId='$this->userId' AND nodeId>1 ORDER BY nodeId";
    }
    
}

trait getFreqClsInfo_T{
    public function getFreqClsSql(){
        return "SELECT a.classId AS classId,a.className AS className,a.leftNum AS leftNum,a.rightNum AS rightNum,(SELECT c.classId FROM doc_class c WHERE c.userId='$this->userId' AND c.leftNum<a.leftNum AND c.rightNum>a.rightNum AND c.nodeId<>1) AS topId FROM doc_class a INNER JOIN doc_freq_class b ON a.userId=b.userId AND a.classId=b.classId WHERE a.userId='$this->userId' ORDER BY b.nodeId";
    }
}

trait getDocMinEditTime{
    public function getDocMinEditTimeSql(){
        return "SELECT MIN(DATE_FORMAT(editTime,'%Y-%m-%d')) As minTime FROM doc WHERE userId='$this->userId'";
    } 
}

trait addDocInfo_T{
    public function addDocInfoSql($docInfo){
        if(isset($docInfo) && isset($docInfo["docId"])){
            $userId = $this->userId;
            $docId = $docInfo["docId"];
            $time = date('Y-m-d H:i:s', time());
            $sql = "START TRANSACTION;INSERT INTO doc (userId,docId,createTime,editTime) VALUES ('$userId','$docId','$time','$time');";
            if(isset($docInfo["groupId"])){
                $groupId = $docInfo["groupId"];
                $sql .= "SELECT leftNum,rightNum INTO @leftNum,@rightNum FROM doc_class WHERE userId='$userId' AND classId='$groupId';"
                       ."SELECT classId INTO @topClsId FROM doc_class WHERE userId='$userId' AND leftNum<@leftNum AND rightNum>@rightNum AND nodeId<>1;"
                       ."INSERT INTO doc_tag (userId,docId,classId) VALUES ('$userId','$docId',@topClsId),('$userId','$docId','$groupId');";
            }
            $sql .= "COMMIT;";
            return $sql;
        }else{
            return false;
        }
    }
}

trait updateEditTime_T{
    public function updateEditTimeSql($docId){
        $time = date('Y-m-d H:i:s', time());
        return "UPDATE doc SET editTime='$time' WHERE userId='$this->userId' AND docId='$docId';";
    }
}

trait setDocPath_T{
    public function setDocPathSql($docId,$groupId){
        $userId = $this->userId;
        return "START TRANSACTION;"
              ."SELECT leftNum,rightNum INTO @leftNum,@rightNum FROM doc_class WHERE userId='$userId' AND classId='$groupId';"
              ."SELECT classId INTO @topClsId FROM doc_class WHERE userId='$userId' AND leftNum<@leftNum AND rightNum>@rightNum AND nodeId<>1;"
              ."DELETE FROM doc_tag WHERE userId='$userId' AND docId='$docId';"
              ."INSERT INTO doc_tag (userId,docId,classId) VALUES ('$userId','$docId',@topClsId),('$userId','$docId','$groupId');COMMIT;";
    }
}

trait deleteDocInfo_T{
    use implodeStr_T;
    public function getRecentIssueIdsSql($docId){
        return "SELECT issueId FROM issue_recent_doc WHERE userId='$this->userId' AND docId='$docId';";
    }
    private function getInsertIssueRecentDocSql($issueIds){
        $sql = '';
        $time = date('Y-m-d H:i:s', time());
        $usrId = $this->userId;
        for($i=0,$len=count($issueIds);$i<$len;$i++){
            $issueId = $issueIds[$i];
            $sql .= "INSERT INTO issue_recent_doc (userId,issueId,docId,addTime) SELECT a.userId,a.issueId,a.docId,'$time' FROM issue_doc a INNER JOIN doc b ON a.userId=b.userId AND a.docId=b.docId WHERE a.userId='$usrId' AND a.issueId='$issueId' ORDER BY b.editTime LIMIT 1;";
        }
        return $sql;
    }
    public function deleteDocInfoSql($docId,$issueIds){
        $deleteSql = "DELETE FROM doc WHERE userId='$this->userId' AND docId='$docId';";
        return !empty($issueIds) ? "START TRANSACTION;$deleteSql".$this->getInsertIssueRecentDocSql($issueIds)."COMMIT;" : $deleteSql;
    }
    public function fetchIssueIdsRes($result){
        $res = array();
        if($result !== false){
            while($row = $result->fetch_array(MYSQLI_ASSOC)){
                $res[] = $row["issueId"];
            }
            $result->free();
        }
        return $res;
    }
}
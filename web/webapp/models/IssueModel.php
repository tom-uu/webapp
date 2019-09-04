<?php
require_once(dirname(__FILE__).'/../common/db.php');
include_once dirname(__FILE__).'/Model.php';

class IssueModel extends Model{}

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

trait getAllIssueList_T{
    public function getIssueListSql(){
        return "SELECT a.issueId AS issueId,a.issueDesc AS issueDesc,a.createTime AS createTime,c.classId AS classId,c.className AS className,(c.rightNum-c.leftNum) AS numLen FROM issue a"
               ."LEFT JOIN issue_top_tag b ON a.userId=b.userId AND a.issueId=b.issueId INNER JOIN issue_class c ON b.topId=c.classId WHERE userId='$this->userId' ORDER BY createTime DESC LIMIT 0,10";
    }
}

trait issueListCondition_T{
    public $whereStr;
    public $orderStr;
    public $issueIds = array();
    public $startNum;
    public $limitNum;
    public $endTimeStr = "";
    public function setStatusCondition($status){
        $userId = $this->userId;
        if($status === "2"){
            $this->endTimeStr = "AND a.issueId IN (SELECT issueId FROM issue_end_time WHERE userId='$userId')";
        }else if($status === "1"){
            $this->endTimeStr = "AND a.issueId NOT IN (SELECT issueId FROM issue_end_time WHERE userId='$userId') AND a.issueId IN (select issueId FROM issue_doc WHERE userId='$userId')";
        }else if($status === "0"){
            $this->endTimeStr = "AND a.issueId NOT IN (SELECT issueId FROM issue_end_time WHERE userId='$userId') AND a.issueId NOT IN (select issueId FROM issue_doc WHERE userId='$userId')";
        }
    }
    private function getDataCondtion($conditionInfo){
        $sql = "";
        if(isset($conditionInfo["timeType"])){
            $dateInfo = $conditionInfo["date"];
            $timeType = $conditionInfo["timeType"];
            if($timeType === 0){
                $sql .= "AND date(createTime) BETWEEN '".$dateInfo["start"]."' AND '".$dateInfo["end"]."'";
            }else if($timeType === 1){
                $sql .= "AND a.issueId IN (SELECT issueId FROM issue_end_time WHERE userId='$this->userId' AND date(endTime) BETWEEN '".$dateInfo["start"]."' AND '".$dateInfo["end"]."')";
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
        if(isset($conditionInfo["status"])){
            $this->setStatusCondition($conditionInfo["status"]);
        }
        if(isset($conditionInfo["classIds"]) && !empty($conditionInfo["classIds"])){
            return $conditionInfo["classIds"];
        }else{
            return false;
        }
    }
    public function getLimitSql($conditionInfo,$startNum,$limitNum){
        $sql = "";
        $this->startNum = $startNum;
        $this->limitNum = $limitNum;
        $classIds = $this->getConditionStr($conditionInfo);
        if($classIds !== false){
            $countClsIds = count($classIds);
            if($countClsIds > 0 && $classIds[0] !== "all"){
                $sql .= "SELECT SQL_CALC_FOUND_ROWS c.issueId AS issueId FROM (SELECT DISTINCT a.issueId AS issueId,b.createTime AS createTime FROM issue_tag a INNER JOIN issue b ON a.userId=b.userId AND a.issueId=b.issueId $this->whereStr $this->endTimeStr AND a.classId IN (".$this->implodeStr($classIds).") ORDER BY b.createTime DESC) c LIMIT $startNum,".$limitNum;
            }else if($countClsIds === 0){
                $sql .= "SELECT SQL_CALC_FOUND_ROWS a.issueId AS issueId FROM issue a $this->whereStr $this->endTimeStr a.issueId NOT IN (SELECT issueId FROM issue_tag WHERE userId='$this->userId') GROUP BY a.issueId $this->orderStr LIMIT $startNum,$limitNum";
            }
        }
        return $sql;
    }
    public function getIssueInfoSql($issueIds){
        $docCountStr = "count(b.docId) AS docNum,a.createTime AS createTime FROM issue a LEFT JOIN issue_doc b ON a.userId=b.userId AND a.issueId=b.issueId";
        if($issueIds !== false && count($issueIds) > 0){
            return "SELECT a.issueId AS issueId,a.issueDesc AS issueDesc,$docCountStr WHERE a.userId='$this->userId' AND a.issueId IN (".$this->implodeStr($issueIds).") GROUP BY a.issueId $this->orderSql";
        }else if($issueIds === false){
            return "SELECT SQL_CALC_FOUND_ROWS a.issueId AS issueId,a.issueDesc AS issueDesc,$docCountStr $this->whereStr $this->endTimeStr GROUP BY a.issueId $this->orderSql LIMIT $this->startNum,$this->limitNum";
        }else{
            return null;
        }
    }
    public function getIssueIds($res){
        $issueIds = array();
        if($res !== false){
            while($row = $res->fetch_array(MYSQLI_ASSOC)){
                $issueIds[] = $row["issueId"];
            }
            $res->free();
        }
        return $issueIds;
    }
    public function fetchIssueRes($result){
        $res = array();
        if($result !== false){
            while($row = $result->fetch_array(MYSQLI_ASSOC)){
                $res[] = $row;
                $this->issueIds[] = $row["issueId"];
            }
            $result->free();
        }
        return $res;
    }
}

trait issueListNoCondition_T{
    public $orderStr;
    public function getIssueListSql($startNum,$limitNum){
        return "SELECT SQL_CALC_FOUND_ROWS a.issueId AS issueId,a.issueDesc AS issueDesc,count(b.docId) AS docNum,a.createTime AS createTime FROM issue a LEFT JOIN issue_doc b ON a.userId=b.userId AND a.issueId=b.issueId WHERE a.userId='$this->userId' GROUP BY a.issueId ORDER BY a.createTime DESC LIMIT $startNum,$limitNum";
    }
    public function yieldIssueId($data){
        foreach ($data as $value){
            yield $value["issueId"];
        }
    }
    public function getIssueIds($issueInfo){
        $issueIdsData = $this->yieldIssueId($issueInfo);
        $issueIds = array();
        foreach($issueIdsData AS $value){
            $issueIds[] = $value;
        }
        return $issueIds;
    }
}

trait issueClassInfo_T{
    public function getIssueClassInfoSql($issueIds){
        $sql = "";
        if(count($issueIds) > 0){
            $sql .= "SELECT a.issueId AS issueId,b.classId AS classId,b.className AS className,(b.rightNum-b.leftNum) AS numLen FROM issue_tag a INNER JOIN issue_class b ON a.userId=b.userId AND a.classId=b.classId WHERE a.userId='$this->userId' AND a.issueId IN(".$this->implodeStr($issueIds).")";
        }
        return $sql;
    }
}

trait getTopClsInfo_T{
    public function getTopClsSql(){
        return "SELECT classId,className,leftNum,rightNum FROM issue_class WHERE userId='$this->userId' AND nodeId>1 ORDER BY nodeId";
    }
    
}

trait getFreqClsInfo_T{
    public function getFreqClsSql(){
        return "SELECT a.classId AS classId,a.className AS className,a.leftNum AS leftNum,a.rightNum AS rightNum,(SELECT c.classId FROM issue_class c WHERE c.userId='$this->userId' AND c.leftNum<a.leftNum AND c.rightNum>a.rightNum AND c.nodeId<>1) AS topId FROM issue_class a INNER JOIN issue_freq_class b ON a.userId=b.userId AND a.classId=b.classId WHERE a.userId='$this->userId' ORDER BY b.nodeId";
    }
}

trait getIssueMinCreateTime{
    public function getIssueMinCreateTimeSql(){
        return "SELECT MIN(DATE_FORMAT(createTime,'%Y-%m-%d')) As minTime FROM issue WHERE userId='$this->userId'";
    } 
}

trait addIssueInfo_T{
    public $issueId;
    public $createTime;
    public function addIssueClassInfoSql($classIds){
        $len=count($classIds);
        $sql = "";
        if($len > 0){
            $sql .= "INSERT INTO issue_tag (userId,issueId,classId) VALUES ";
            for($i=0,$len=count($classIds);$i<$len;$i++){
                $value = $classIds[$i];
                if($i > 0){
                    $sql .= ',';
                }
                $sql .= "('$this->userId','$this->issueId','$value')";
            }
        }
        return $sql;
    }
    public function addIssueInfoSql($issueData){
        $issueDesc = $issueData["desc"];
        $this->createTime = date('Y-m-d H:i:s', time());
        $this->issueId = $this->getItemId();
        $sql = "INSERT INTO issue (userId,issueId,issueDesc,createTime) VALUES ('$this->userId','$this->issueId','$issueDesc','$this->createTime');";
        return $sql.$this->addIssueClassInfoSql($issueData["classIds"]);
    }
}

trait editIssueInfo_T{
    public $issueId;
    public function addTagInfoSql($addIdsArr){
        $sql = "INSERT INTO issue_tag (userId,issueId,classId) VALUES ";
        for($i=0,$len=count($addIdsArr);$i<$len;$i++){
            $value = $addIdsArr[$i];
            if($i > 0){
                $sql .= ',';
            }
            $sql .= "('$this->userId','$this->issueId','$value')";
        }
        return $sql;
    }
    public function editIssueInfoSql($editData){
        $this->issueId = $editData["issueId"];
        $sql = "";
        if(isset($editData["desc"]) && !empty($editData["desc"])){
            $sql .= "UPDATE issue SET issueDesc='".$editData["desc"]."' WHERE userId='$this->userId' AND issueId='$this->issueId';";
        }
        if(isset($editData["classIds"]) && !empty($editData["classIds"])){
            $classIds = $editData["classIds"];
            if(isset($classIds ["delete"]) && !empty($classIds ["delete"])){
                $deleteIdsStr = $this->implodeStr($classIds ["delete"]);
                $sql .= "DELETE FROM issue_tag WHERE userId='$this->userId' AND issueId='$this->issueId' AND classId IN($deleteIdsStr);";
            }
            if(isset($classIds ["add"]) && !empty($classIds ["add"])){
                $sql .= $this->addTagInfoSql($classIds ["add"]);
            }
        }
        return $sql;
    }
}

trait deleteIssueInfo_T{
    public function deleteIssueInfoSql($issueId){
        $conditionSql = "WHERE userId='$this->userId' AND issueId='$issueId'";
        $sql = "DELETE FROM issue ".$conditionSql.";";
        $sql .= "DELETE FROM issue_tag ".$conditionSql;
        return $sql;
    }
}

trait getIssueStatus_T{
    public function getIssueStatusSql($issueIds){
        return "SELECT issueId,endTime FROM issue_end_time WHERE userId='$this->userId' AND issueId IN (".$this->implodeStr($issueIds).")";
    }
}

trait setIssueStatus_T{
    private $endTime;
    public function setIssueStatusSql($issueId,$status){
        if($status === "1"){
            $this->endTime = date('Y-m-d H:i:s', time());
            return "INSERT INTO issue_end_time (userId,issueId,endTime) VALUES ('$this->userId','$issueId','$this->endTime')";
        }else if($status === "2"){
            return "DELETE FROM issue_end_time WHERE userId='$this->userId' AND issueId='$issueId'";
        }else{
            return null;
        }
    }
}

trait getRecentDocInfo_T{
    public function getRecentDocInfoSql($issueIds){
        return "SELECT issueId,docId,addTime FROM issue_recent_doc WHERE userId='$this->userId' AND issueId IN (".$this->implodeStr($issueIds).")";
    }
}
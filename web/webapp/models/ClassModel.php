<?php
require_once(dirname(__FILE__).'/../common/db.php');
include_once dirname(__FILE__).'/Model.php';

class ClassModel extends Model{}

trait fetchResultTrait{
    public function fetchResult($result){
        $res = array();
        while($row = $result->fetch_array(MYSQLI_ASSOC)){
            $res[] = $row;
        }
        $result->free();
        return $res;
    }
}

trait getItemId_T{
    public function getDateTime(){
        $mtimestamp = sprintf("%.3f", microtime(true));
        $timestamp = floor($mtimestamp);
        $milliseconds = round(($mtimestamp - $timestamp) * 1000);
        return $datetime = date("YmdHis", $timestamp). $milliseconds;
    }
    public function getClsId(){
        $datetime = $this->getDateTime();
        $all=($datetime).mt_rand(0,999);
        $id=base_convert($all,10,36);
        return $id;
    }
    public function getIdByIndex($index){
        $datetime = $this->getDateTime();
        $all=($datetime).($index < 10 ? '0'.$index : $index);
        $id=base_convert($all,10,36);
        return $id;
    }
}

trait yieldDataTrait{
    public function yieldData($data){
        foreach ($data as $key=>$value){
            yield $key=>$value;
        }
    }
}

trait implodeStr_T{
    public function implodeStr($array_data){
        return implode(",",array_map(function($value){return "'$value'";},$array_data));
    }
}

trait getTopClsTrait{
    public function getTopClsSql(){
        $clsTName = $this->clsTName;
        $userId = $this->userId;
        return "SELECT a.classId AS classId,a.className AS className,"
              ."(SELECT COUNT(b.nodeId) FROM $clsTName b WHERE b.userId='$userId' AND b.leftNum>a.leftNum AND b.rightNum<a.rightNum) AS countSub"
              ." FROM $clsTName a WHERE a.userId='$userId' AND "
              ."(SELECT COUNT(c.nodeId) FROM $clsTName c WHERE c.userId='$userId' AND c.leftNum<a.leftNum AND c.rightNum>a.rightNum)=1 ORDER BY a.nodeId";
    }
}

trait addTopClsTrait{
    use getItemId_T;
    private $id;
    public function checkRootSql(){
        return "SELECT classId FROM $this->clsTName WHERE userId='$this->userId' AND nodeId=1";
    }
    public function addTopClsSql($rootId,$data){
        $addRootSql = "";
        if(!isset($rootId)){
            $root_Node_id = $this->getIdByIndex(0);
            $addRootSql = "INSERT INTO $this->clsTName (userId,classId,className,nodeId,leftNum,rightNum) VALUES ('$this->userId','$root_Node_id','tnode',1,1,2);";
        }
        $this->id = $top_id = $this->getIdByIndex(1);
        $name = $data["name"];
        return is_array($data) && isset($top_id) && isset($name) ?  "START TRANSACTION;$addRootSql"
                ."SELECT rightNum INTO @rightNum FROM $this->clsTName WHERE userId='$this->userId' AND nodeId=1;"
                ."SET @nodeId=(@rightNum DIV 2)+1;"
                ."INSERT INTO $this->clsTName (userId,classId,className,nodeId,leftNum,rightNum) VALUES ('$this->userId','$top_id','$name',@nodeId,@rightNum,@rightNum+1);"
                ."UPDATE $this->clsTName SET rightNum=@rightNum+2 WHERE userId='$this->userId' AND nodeId=1;COMMIT;" : false;
    }
}

trait deleteTopClsTrait{
    use implodeStr_T;
    private $topIdsStr;
    private $countTopIds = 0;
    private $offset = 0;
    public function getDeleteTopClsSql($topData){
        if(isset($topData) && isset($topData["ids"])){
            $topIds = $topData["ids"];
            $this->countTopIds = count($topIds);
            $this->topIdsStr = $this->implodeStr($topIds);
            return "SELECT leftNum,rightNum FROM $this->clsTName WHERE userId='$this->userId' AND classId IN ($this->topIdsStr) ORDER BY nodeId";
        }else{
            return false;
        }
    }
    public function buildInnerUpdateSql($nodeOffset,$numOffset,$nextLeftNum,$rightNum){
        return $nextLeftNum-$rightNum > 1 ? "UPDATE $this->clsTName SET nodeId=nodeId-$nodeOffset,leftNum=leftNum-$numOffset,rightNum=rightNum-$numOffset WHERE userId='$this->userId' AND leftNum>$rightNum AND rightNum<$nextLeftNum;" : "";
    }
    public function getUpdateSql($innerInfo){
        $len=count($innerInfo);$offset = 0;$updateSql = "";$userId = $this->userId;
        for($i=0;$i<$len;$i++){
            $thisInfo = $innerInfo[$i];
            $leftNum = $thisInfo["leftNum"];
            $rightNum = $thisInfo["rightNum"];
            $thisOffset = $rightNum-$leftNum+1;
            $offset += $thisOffset;
            $nodeOffset = $offset/2;
            $updateSql .= "DELETE FROM $this->clsTName WHERE userId='$userId' AND leftNum>$leftNum AND rightNum<$rightNum;";
            if($i<$len-1){
                $nextInfo = $innerInfo[$i+1];
                $updateSql .= $this->buildInnerUpdateSql($nodeOffset,$offset,$nextInfo["leftNum"],$rightNum);
            }else if($i === $len-1){
                $updateSql .= "UPDATE $this->clsTName SET nodeId=nodeId-$nodeOffset,leftNum=leftNum-$offset,rightNum=rightNum-$offset WHERE userId='$userId' AND leftNum>$rightNum;";
            }
        }
        $this->offset = $offset;
        return $updateSql;
    }
    public function getDeleteFreqClsSql($getDeleteTopClsSql){
        return $this->getFreqClsSqlOnDelete("SELECT a.classId AS classId FROM $this->clsTName a INNER JOIN ($getDeleteTopClsSql) b ON a.leftNum>b.leftNum AND a.rightNum<b.rightNum");
    }
    public function deleteTopClsSql($innerInfo,$freqClsInfo){
        $topIdsStr = $this->topIdsStr;
        $userId = $this->userId;
        if(isset($topIdsStr) && !empty($topIdsStr)){
            return "START TRANSACTION;"
                  .$this->updateFreqClsSql($freqClsInfo)
                  .$this->getUpdateSql($innerInfo)
                  ."DELETE FROM $this->clsTName WHERE userId='$userId' AND classId IN ($topIdsStr);"
                  ."UPDATE $this->clsTName SET rightNum=rightNum-$this->offset WHERE userId='$userId' AND nodeId=1;COMMIT;";
        }else{
            return false;
        }
    }
}

trait arrangeTopClsTrait{
    use implodeStr_T;
    private $whereStr; 
    public function getTopClsSql($classId){
        $tbName = $this->clsTName;
        $whereStr = $this->whereStr = "WHERE userId='$this->userId'";
        return "SELECT classId FROM $tbName $whereStr AND leftNum>=(SELECT leftNum FROM $tbName $whereStr AND classId='$classId') AND rightNum<=(SELECT rightNum FROM $tbName $whereStr AND classId='$classId')";
    }
    public function updateTopClsSql($classId,$referId,$onMoveIds){
        $tbName = $this->clsTName;
        $whereStr = $this->whereStr;
        $moveIdsStr = $this->implodeStr($onMoveIds);
        return "START TRANSACTION;SELECT leftNum,rightNum INTO @leftNum,@rightNum FROM $tbName $whereStr AND classId='$classId';"
              ."SELECT leftNum,rightNum INTO @refLeftNum,@refRightNum FROM $tbName $whereStr AND classId='$referId';"
              ."SET @outerOffset=if(@leftNum>@refLeftNum,@refLeftNum-@leftNum,@refLeftNum-@rightNum-1);"
              ."SET @innerOffset=if(@leftNum>@refLeftNum,@rightNum-@leftNum+1,@leftNum-@rightNum-1);"
              ."SET @leftLineNum=if(@leftNum>@refLeftNum,@refLeftNum-1,@rightNum);"
              ."SET @rightLineNum=if(@leftNum>@refLeftNum,@leftNum,@refLeftNum);"
              ."UPDATE $tbName SET nodeId=nodeId+(@innerOffset DIV 2),leftNum=leftNum+@innerOffset,rightNum=rightNum+@innerOffset $whereStr AND leftNum>@leftLineNum AND rightNum<@rightLineNum;"
              ."UPDATE $tbName SET nodeId=nodeId+(@outerOffset DIV 2),leftNum=leftNum+@outerOffset,rightNum=rightNum+@outerOffset $whereStr AND ClassId IN ($moveIdsStr);COMMIT;";
    }
    public function fetchOnMoveRes($result){
        $res = array();
        while($row = $result->fetch_array(MYSQLI_ASSOC)){
            $res[] = $row["classId"];
        }
        $result->free();
        return $res;
    }
}

trait getSubClsTrait{
    public function getSubClsSql($topId){
        $topInfoStr = "$this->clsTName WHERE userId='$this->userId' AND classId='$topId'";
        $tagTbName = $this->fieldName."_tag";
        $targetIdName = $this->fieldName."Id";
        return "SELECT a.classId AS classId,a.className AS className,(SELECT COUNT(b.$targetIdName) FROM $tagTbName b WHERE b.userId='$this->userId' AND b.classId=a.classId) AS countSub FROM $this->clsTName a WHERE a.userId='$this->userId' AND a.leftNum>(SELECT leftNum FROM $topInfoStr) AND a.rightNum<(SELECT rightNum FROM $topInfoStr) ORDER BY a.nodeId;";
    }
}

trait addSubClsTrait{
    use getItemId_T;
    private $id;
    public function addSubClsSql($topId,$data){
        $this->id = $id = $this->getClsId();
        $name = $data["name"];
        return isset($data) && isset($name) ? "SELECT nodeId,leftNum,rightNum INTO @nodeId,@leftNum,@rightNum FROM $this->clsTName WHERE userId='$this->userId' AND classId='$topId';SET @countSub=(@rightNum-@leftNum-1) DIV 2;"
                ."START TRANSACTION;UPDATE $this->clsTName SET nodeId=nodeId+1,leftNum=leftNum+2,rightNum=rightNum+2 WHERE userId='$this->userId' AND leftNum>@rightNum;"
                ."UPDATE $this->clsTName SET rightNum=rightNum+2 WHERE userId='$this->userId' AND leftNum<=@leftNum AND rightNum>=@rightNum;"
                ."INSERT INTO $this->clsTName (userId,classId,className,nodeId,leftNum,rightNum) VALUES ('$this->userId','$id','$name',@nodeId+@countSub+1,@rightNum,@rightNum+1);COMMIT;" : false;
    }
}

trait deleteSubClsTrait{
    use implodeStr_T;
    private $subIdsStr;
    private $countSubIds = 0;
    private $offset = 0;
    public function getDeleteSubClsSql($subData){
        if(isset($subData) && isset($subData["ids"])){
            $subIds = $subData["ids"];
            $this->countSubIds = count($subIds);
            $this->subIdsStr = $this->implodeStr($subIds);
            return "SELECT leftNum,rightNum FROM $this->clsTName WHERE userId='$this->userId' AND classId IN ($this->subIdsStr) ORDER BY nodeId";
        }else{
            return false;
        }
    }
    public function buildInnerUpdateSql($nodeOffset,$numOffset,$nextLeftNum,$rightNum){
        return $nextLeftNum-$rightNum > 1 ? "UPDATE $this->clsTName SET nodeId=nodeId-$nodeOffset,leftNum=leftNum-$numOffset,rightNum=rightNum-$numOffset WHERE userId='$this->userId' AND leftNum>$rightNum AND rightNum<$nextLeftNum;" : "";
    }
    public function updateInnerSubClsSql($innerInfo){
        $len = count($innerInfo);
        $updateSql = "";
        $offset = 0;
        for($i=0;$i<$len;$i++){
            $thisInfo = $innerInfo[$i];
            $rightNum = $thisInfo["rightNum"];
            $offset += 2;
            $nodeOffset = $offset/2;
            if($i<$len-1){
                $nextInfo = $innerInfo[$i+1];
                $nextLeftNum = $nextInfo["leftNum"];
                $updateSql .= $this->buildInnerUpdateSql($nodeOffset,$offset,$nextLeftNum,$rightNum);
            }else if($i === $len-1){
                $updateSql .= "UPDATE $this->clsTName SET nodeId=nodeId-$nodeOffset,leftNum=leftNum-$offset,rightNum=rightNum-$offset WHERE userId='$this->userId' AND leftNum>$rightNum AND rightNum<@rightNum;";
            }
        }
        $this->offset = $offset;
        return $updateSql;
    }
    public function updateOuterClsSql($topId){
        $len=$this->countSubIds;
        $numOffset = $this->offset;
        $whereSql = "WHERE userId='$this->userId'";
        if($len > 0){
            return "UPDATE $this->clsTName SET rightNum=rightNum-$numOffset $whereSql AND classId='$topId';"
                  ."UPDATE $this->clsTName SET nodeId=nodeId-$len,leftNum=leftNum-$numOffset,rightNum=rightNum-$numOffset $whereSql AND leftNum>@rightNum;"
                  ."UPDATE $this->clsTName SET rightNum=rightNum-$numOffset $whereSql AND nodeId=1;";
        }else{
            return false;
        }
    }
    public function getDeleteFreqClsSql(){
        return $this->getFreqClsSqlOnDelete($this->subIdsStr);
    }
    public function deleteSubClsSql($topId,$innerInfo,$freqInfo){
        $subIdsStr = $this->subIdsStr;
        if(isset($subIdsStr) && !empty($subIdsStr)){
            return "START TRANSACTION;"
                  .$this->updateFreqClsSql($freqInfo)
                  ."SELECT leftNum,rightNum INTO @leftNum,@rightNum FROM $this->clsTName WHERE userId='$this->userId' AND classId='$topId';"
                  ."DELETE FROM $this->clsTName WHERE userId='$this->userId' AND classId IN ($subIdsStr);"
                  .$this->updateInnerSubClsSql($innerInfo)
                  .$this->updateOuterClsSql($topId)
                  ."COMMIT;";
        }else{
            return false;
        }
    }
}

trait arrangeSubClsTrait{
    public function arrangeSubClsSql($classId,$referId){
        $whereStr = "WHERE userId='$this->userId'";
        $tbName = $this->clsTName;
        return "START TRANSACTION;SELECT leftNum,rightNum INTO @leftNum,@rightNum FROM $tbName $whereStr AND classId='$classId';"
              ."SELECT leftNum,rightNum INTO @refLeftNum,@refRightNum FROM $tbName $whereStr AND classId='$referId';"
              ."SET @outerOffset=if(@leftNum>@refLeftNum,@refLeftNum-@leftNum,@refLeftNum-@rightNum-1);"
              ."SET @leftLineNum=if(@leftNum>@refLeftNum,@refLeftNum-1,@rightNum);"
              ."SET @rightLineNum=if(@leftNum>@refLeftNum,@leftNum,@refLeftNum);"
              ."SET @innerOffset=if(@leftNum>@refLeftNum,@rightNum-@leftNum+1,@leftNum-@rightNum-1);"
              ."UPDATE $tbName SET nodeId=nodeId+(@innerOffset DIV 2),leftNum=leftNum+@innerOffset,rightNum=rightNum+@innerOffset $whereStr AND leftNum>@leftLineNum AND rightNum<@rightLineNum;"
              ."UPDATE $tbName SET nodeId=nodeId+(@outerOffset DIV 2),leftNum=leftNum+@outerOffset,rightNum=rightNum+@outerOffset $whereStr AND ClassId='$classId';COMMIT;";
    }
}

trait getAllSubClsTrait{
    public function getAllSubClsSql(){
        $tbName = $this->clsTName;
        $userId = $this->userId;
        $tagTbName = $this->fieldName."_tag";
        $targetIdName = $this->fieldName."Id";
        return "SELECT a.classId AS classId,a.className AS className,(SELECT COUNT(b.$targetIdName) FROM $tagTbName b WHERE b.userId='$userId' AND b.classId=a.classId) AS countSub FROM $tbName a "
              ."WHERE a.userId='$userId' AND a.rightNum=a.leftNum+1 AND (SELECT COUNT(c.nodeId) FROM $tbName c WHERE c.userId='$userId' AND c.leftNum<a.leftNum AND c.rightNum>a.rightNum)>1 "
              ."AND a.classId NOT IN (SELECT classId FROM $this->freqClsTName WHERE userId='$userId')";
    }
}

trait getFreqClsTrait{
    public function getFreqClsSql(){
        $userId = $this->userId;
        $tagTbName = $this->fieldName."_tag";
        $targetIdName = $this->fieldName."Id";
        return "SELECT b.classId AS classId,a.className AS className,(SELECT COUNT(c.$targetIdName) FROM $tagTbName c WHERE c.userId='$userId' AND c.classId=a.classId) AS countSub FROM $this->clsTName a INNER JOIN $this->freqClsTName b ON a.userId=b.userId AND a.classId=b.classId WHERE a.userId='$userId' ORDER BY b.nodeId"; 
    }
}

trait addFreqClsTrait{
    use implodeStr_T;
    public function getFreqClsValueStr($clsIds){
        $str = "";
        $len = count($clsIds);
        $userId = $this->userId;
        for($i=0;$i<$len;$i++){
            $id = $clsIds[$i];
            $addNum = $i+1;
            $str .= "('$userId','$id',IFNULL(@nodeId,0)+$addNum)";
            $str .= $i<$len-1 ? ',' : ';';
        }
        return $str;
    }
    public function addFreqClsSql($data){
        if(isset($data) && isset($data["ids"])){
            $clsIds = $data["ids"];
            return count($clsIds) > 0 ? "SELECT MAX(nodeId) INTO @nodeId FROM $this->freqClsTName WHERE userId='$this->userId' ORDER BY nodeId;"
              ."INSERT INTO $this->freqClsTName (userId,classId,nodeId) VALUES ".$this->getFreqClsValueStr($clsIds) : false;
        }else{
            return false;
        }
    }
}

trait deleteFreqClsTrait{
    use implodeStr_T,resetFreqClsNodeId;
    private $idsStr;
    public function getDeleteFreqClsSql($data){
        if(isset($data) && isset($data["ids"])){
            $ids = $data["ids"];
            $this->idsStr = $this->implodeStr($ids);
            return $this->getFreqClsSqlOnDelete($this->idsStr);
        }else{
            return false;
        }
    }
    public function deleteFreqClsSql($freqInfo){
        $freqIdsStr = $this->idsStr; 
        return isset($freqIdsStr) && !empty($freqIdsStr) ? "START TRANSACTION;DELETE FROM $this->freqClsTName WHERE userId='$this->userId' AND classId IN ($freqIdsStr);".$this->updateFreqClsSql($freqInfo)."COMMIT;" : false;
    }
}

trait arrangeFreqClsTrait{
    public function arrangeSubClsSql($classId,$referClassId){
        $whereStr = "WHERE userId='$this->userId'";
        return "START TRANSACTION;SELECT nodeId INTO @nodeId FROM $this->freqClsTName $whereStr AND classId='$classId';"
              ."SELECT nodeId INTO @refNodeId FROM $this->freqClsTName $whereStr AND classId='$referClassId';"
              ."SET @offset=if(@nodeId>@refNodeId,1,-1);"
              ."SET @headId=if(@nodeId>@refNodeId,@refNodeId,@nodeId+1);"
              ."SET @tailId=if(@nodeId>@refNodeId,@nodeId-1,@refNodeId-1);"
              ."SET @targetId=if(@nodeId>@refNodeId,@refNodeId,@refNodeId-1);"
              ."UPDATE $this->freqClsTName SET nodeId=nodeId+@offset $whereStr AND nodeId>=@headId AND nodeId<=@tailId;"
              ."UPDATE $this->freqClsTName SET nodeId=@targetId $whereStr AND classId='$classId';COMMIT;";
    }
}

trait resetFreqClsNodeId{
    public function getFreqClsSqlOnDelete($idsStr){
        return "SELECT nodeId FROM $this->freqClsTName WHERE userId='$this->userId' AND classId IN ($idsStr) ORDER BY nodeId";
    }
    public function buildFreqUpdateSql($nodeOffset,$headId,$tailId){
        return $tailId-$headId > 1 ? "UPDATE $this->freqClsTName SET nodeId=nodeId-$nodeOffset WHERE userId='$this->userId' AND nodeId>$headId AND nodeId<$tailId;" : "";
    }
    public function updateFreqClsSql($innerInfo){
        $len = count($innerInfo);
        $updateSql = "";
        $offset = 0;
        for($i=0;$i<$len;$i++){
            $thisInfo = $innerInfo[$i];
            $nodeId = $thisInfo["nodeId"];
            $offset ++;
            if($i<$len-1){
                $nextInfo = $innerInfo[$i+1];
                $nextNodeId = $nextInfo["nodeId"];
                $updateSql .= $this->buildFreqUpdateSql($offset,$nodeId,$nextNodeId);
            }else if($i === $len-1){
                $updateSql .= "UPDATE $this->freqClsTName SET nodeId=nodeId-$offset WHERE userId='$this->userId' AND nodeId>$nodeId;";
            }
        }
        return $updateSql;
    }
}

trait renameClassTrait{
    public function renameClassSql($data){
        if(isset($data) && isset($data["id"]) && isset($data["name"])){
            $id = $data["id"];
            $name = $data["name"];
            return "UPDATE $this->clsTName SET className='$name' WHERE userId='$this->userId' AND classId='$id';";
        }
    }
}
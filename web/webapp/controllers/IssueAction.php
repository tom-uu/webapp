<?php
require_once(dirname(__FILE__).'/Controller.php');
require_once(dirname(__FILE__).'/../models/IssueModel.php');
require_once(dirname(__FILE__).'/../common/context.php');
require_once(dirname(__FILE__).'/../common/router.php');

class IssueAction extends Controller{}

class LoadView extends Context{//场景类的任务是建立一个运行时容器环境，包含了所需的数据和算法，并把相关的算法和数据进行组合，并调用完成相关功能的执行；2019.1.23.21:17
    use issueListNoCondition_T,issueClassInfo_T,fetchResult_T,getTopClsInfo_T,getFreqClsInfo_T,implodeStr_T,getIssueMinCreateTime,countRowSql_T,getRecentDocInfo_T,getIssueStatus_T;
    public function getView(){
        $html = file_get_contents(dirname(__FILE__).'/../views/issue.html', FILE_USE_INCLUDE_PATH);
        return $html;
    }
    public function getIssueListData($startNum,$limitNum){
        $sql = $this->getIssueListSql($startNum,$limitNum);
        $res = $this->model->query("query",$sql);
        return $this->fetchResult($res);
    }
    public function getIssueClassInfo($issueIds){
        $sql = $this->getIssueClassInfoSql($issueIds);
        $res = $this->model->query("query",$sql);
        return $this->fetchResult($res);
    }
    public function getDisplayData($startNum,$limitNum){
        $data = array();
        $this->model->connect();
        $data["issueList"] = $this->getIssueListData($startNum,$limitNum);
        $data["countIssue"] = $this->model->query("query",$this->getCountRowSql())->fetch_assoc()["num"];
        $issueIds = $this->getIssueIds($data["issueList"]);
        $data["issueTagList"] = $this->getIssueClassInfo($issueIds);
        $data["topClsList"] = $this->fetchResult($this->model->query("query",$this->getTopClsSql()));
        $data["freqClsList"] = $this->fetchResult($this->model->query("query",$this->getFreqClsSql()));
        $data["minTime"] = $this->model->query("query",$this->getIssueMinCreateTimeSql())->fetch_assoc()["minTime"];
        if(count($data["issueList"]) > 0){
            $data["recentDocList"] = $this->fetchResult($this->model->query("query",$this->getRecentDocInfoSql($issueIds)));
            $data["statusList"] = $this->fetchResult($this->model->query("query",$this->getIssueStatusSql($issueIds)));
        }
        $this->model->close();
        return $data;
    }
    public function callBack($startNum,$limitNum){//浏览器端传入的参数由context处理；和数据模型有关的就传给数据模型，这里是fieldName和数据模型有关，因为此数据是数据库中重要的选表的参数，而且在整个会话过程中保持不变，自然而然要传给model对象，这样把个类型数据合理分配到对应的对象（controller,model,context中）,这样各个对象才能互相不产生干涉，协调工作；2019.1.27.18：48
        $file = array();
        $file["html"] = $this->getView();
        $file["pageData"] = $this->getDisplayData($startNum,$limitNum);
        echo json_encode($file);
    }
}

class GetTopClsInfo extends Context{
    use getTopClsInfo_T,fetchResult_T;
    public function callBack(){
        $data = array();
        $this->model->connect();
        $data["topClsList"] = $this->fetchResult($this->model->query("query",$this->getTopClsSql()));
        $this->model->close();
        echo json_encode($data);
    }
}

class GetFreqClsInfo extends Context{
    use getFreqClsInfo_T,fetchResult_T;
    public function callBack(){
        $data = array();
        $this->model->connect();
        $data["freqClsList"] = $this->fetchResult($this->model->query("query",$this->getFreqClsSql()));
        $this->model->close();
        echo json_encode($data);
    }
}

class GetIssueListAll extends Context{
    use issueListNoCondition_T,issueClassInfo_T,fetchResult_T,implodeStr_T,countRowSql_T,getRecentDocInfo_T,getIssueStatus_T;
    public function getIssueListData($startNum,$limitNum){
        $sql = $this->getIssueListSql($startNum,$limitNum);
        $res = $this->model->query("query",$sql);
        return $this->fetchResult($res);
    }
    public function getIssueClassInfo($issueIds){
        $sql = $this->getIssueClassInfoSql($issueIds);
        $res = $this->model->query("query",$sql);
        return $this->fetchResult($res);
    }
    public function callBack($startNum,$limitNum){
        $data = array();
        $this->model->connect();
        $data["issueList"] = $this->getIssueListData($startNum,$limitNum);
        $data["countIssue"] = $this->model->query("query",$this->getCountRowSql())->fetch_assoc()["num"];
        $issueIds = $this->getIssueIds($data["issueList"]);
        $data["issueTagList"] = $this->getIssueClassInfo($issueIds);
        if(count($data["issueList"]) > 0){
            $data["recentDocList"] = $this->fetchResult($this->model->query("query",$this->getRecentDocInfoSql($issueIds)));
            $data["statusList"] = $this->fetchResult($this->model->query("query",$this->getIssueStatusSql($issueIds)));
        }
        $this->model->close();
        echo count($data["issueList"]) > 0 ? json_encode($data) : false;
    }
}

class GetIssueList extends Context{
    use issueClassInfo_T,implodeStr_T,fetchResult_T,getRecentDocInfo_T,getIssueStatus_T;
    public function callBack($startNum,$limitNum){
        $this->model->connect();
        $getConditionIssueInfo = new GetConditionIssueInfo($this->model,$this->userId,$this->postData);
        $data = $getConditionIssueInfo->getIssueInfo($startNum,$limitNum);
        $issueIds = $getConditionIssueInfo->issueIds;
        if(count($data["issueList"]) > 0){
            $data["recentDocList"] = $this->fetchResult($this->model->query("query",$this->getRecentDocInfoSql($issueIds)));
            $data["statusList"] = $this->fetchResult($this->model->query("query",$this->getIssueStatusSql($issueIds)));
        }
        $tagInfoRes = $this->model->query("query",$this->getIssueClassInfoSql($issueIds));
        $data["issueTagList"] = $this->fetchResult($tagInfoRes);
        $this->model->close();
        echo json_encode($data);
    }
}

class AddIssue extends Context{
    use getItemId_T,addIssueInfo_T;
    public function callBack(){
        $this->model->connect();
        $sql = $this->addIssueInfoSql($this->postData);
        $this->model->query("multi_query",$sql);
        $this->model->fetchResults();
        $this->model->close();
        echo $this->model->checkResults();
    }
}

class EditIssue extends Context{
    use editIssueInfo_T,implodeStr_T;
    public function callBack(){
        $this->model->connect();
        $sql = $this->editIssueInfoSql($this->postData);
        $this->model->query("multi_query",$sql);
        $this->model->fetchResults();
        $this->model->close();
        echo $this->model->checkResults();
    }
}

class DeleteIssue extends Context{
    use deleteIssueInfo_T,issueClassInfo_T,fetchResult_T,implodeStr_T,getRecentDocInfo_T,getIssueStatus_T;
    public function callBack($issueId,$dataNum){
        $this->model->connect();
        $this->model->query("multi_query",$this->deleteIssueInfoSql($issueId));
        $this->model->fetchResults();
        $res = array();
        $res["flag"] = $this->model->checkResults();
        if($res["flag"]){
            $getConditionIssueInfo = new GetConditionIssueInfo($this->model,$this->userId,$this->postData);
            $data = $getConditionIssueInfo->getIssueInfo($dataNum,1);
            $issueIds = $getConditionIssueInfo->issueIds;
            if(count($data["issueList"]) > 0){
                $data["recentDocList"] = $this->fetchResult($this->model->query("query",$this->getRecentDocInfoSql($issueIds)));
                $data["statusList"] = $this->fetchResult($this->model->query("query",$this->getIssueStatusSql($issueIds)));
            }
            $res = array_merge($res,$data);
            $tagInfoRes = $this->model->query("query",$this->getIssueClassInfoSql($issueIds));
            $res["tag"] = $this->fetchResult($tagInfoRes);
        }
        $this->model->close();
        echo json_encode($res);
    }
}

class GetConditionIssueInfo extends Context{
    use issueListCondition_T,implodeStr_T,countRowSql_T;
    public function setLimit($limitSql){
        if(strlen($limitSql) > 0){
            $classIdsRes = $this->model->query("query",$limitSql);
            return $this->getIssueIds($classIdsRes);
        }else{
            return false;
        }
    }
    public function getIssueInfo($startNum,$limitNum){
        $data = array();
        $limitSql = $this->getLimitSql($this->postData,$startNum,$limitNum);
        $limitIssueIds = $this->setLimit($limitSql);
        $countIssueSql = $this->getCountRowSql();
        if($limitIssueIds !== false){
            $data["countIssue"] = count($limitIssueIds) > 0 ? $this->model->query("query",$countIssueSql)->fetch_assoc()["num"] : 0;
        }
        $issueInfoSql = $this->getIssueInfoSql($limitIssueIds);
        $data["issueList"] = !empty($issueInfoSql) ? $this->fetchIssueRes($this->model->query("query",$issueInfoSql)) : array();
        if($limitIssueIds === false){
            $data["countIssue"] = $this->model->query("query",$countIssueSql)->fetch_assoc()["num"];
        }
        return $data;
    }
}

class SetIssueStatus extends Context{
    use setIssueStatus_T;
    public function callBack($issueId,$status){
        $this->model->connect();
        $res = $this->model->query("query",$this->setIssueStatusSql($issueId,$status));
        $timeData = array();
        if($res && isset($this->endTime)){
            $timeData["endTime"] = $this->endTime;
        }
        $this->model->close();
        echo count($timeData) > 0 ? json_encode($timeData) : $res;
    }
}

(new IssueAction('IssueModel'))->callContext();
<?php
require_once(dirname(__FILE__).'/Controller.php');
require_once(dirname(__FILE__).'/../models/DocModel.php');
require_once(dirname(__FILE__).'/../common/router.php');

class DocAction extends Controller{}

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

class LoadView extends Context{//场景类的任务是建立一个运行时容器环境，包含了所需的数据和算法，并把相关的算法和数据进行组合，并调用完成相关功能的执行；2019.1.23.21:17
    use docListNoCondition_T,docClassInfo_T,fetchResult_T,getTopClsInfo_T,getFreqClsInfo_T,implodeStr_T,getDocMinEditTime,countRowSql_T;
    public function getView(){
        $html = file_get_contents(dirname(__FILE__).'/../views/doc.html', FILE_USE_INCLUDE_PATH);
        return $html;
    }
    public function getDocListData($startNum,$limitNum){
        $res = $this->model->query("query",$this->getDocListSql($startNum,$limitNum));
        return $this->fetchResult($res);
    }
    public function getDocClassInfo($docIds){
        $sql = $this->getDocClassInfoSql($docIds);
        if(!empty($sql)){
            $res = $this->model->query("query",$sql);
            return $this->fetchResult($res);
        }else{
            return array();
        }
    }
    public function getDisplayData($startNum,$limitNum){
        $data = array();
        $this->model->connect();
        $data["docList"] = $this->getDocListData($startNum,$limitNum);
        $data["countDoc"] = $this->model->query("query",$this->getCountRowSql())->fetch_assoc()["num"];
        $docIds = $this->getDocIds($data["docList"]);
        $data["docTagList"] = $this->getDocClassInfo($docIds);
        $data["topClsList"] = $this->fetchResult($this->model->query("query",$this->getTopClsSql()));
        $data["freqClsList"] = $this->fetchResult($this->model->query("query",$this->getFreqClsSql()));
        $data["minTime"] = $this->model->query("query",$this->getDocMinEditTimeSql())->fetch_assoc()["minTime"];
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

class GetDocListAll extends Context{
    use docListNoCondition_T,docClassInfo_T,fetchResult_T,implodeStr_T,countRowSql_T;
    public function getDocListData($startNum,$limitNum){
        $sql = $this->getDocListSql($startNum,$limitNum);
        $res = $this->model->query("query",$sql);
        return $this->fetchResult($res);
    }
    public function getDocClassInfo($docIds){
        $sql = $this->getDocClassInfoSql($docIds);
        $res = $this->model->query("query",$sql);
        return $this->fetchResult($res);
    }
    public function callBack($startNum,$limitNum){
        $data = array();
        $this->model->connect();
        $data["docList"] = $this->getDocListData($startNum,$limitNum);
        $data["countDoc"] = $this->model->query("query",$this->getCountRowSql())->fetch_assoc()["num"];
        $docIds = $this->getDocIds($data["docList"]);
        $data["docTagList"] = $this->getDocClassInfo($docIds);
        $this->model->close();
        echo count($data["docList"]) > 0 ? json_encode($data) : false;
    }
}

class GetDocList extends Context{
    use docClassInfo_T,implodeStr_T,fetchResult_T;
    public function callBack($startNum,$limitNum){
        $this->model->connect();
        $getConditionDocInfo = new GetConditionDocInfo($this->model,$this->userId,$this->postData);
        $data = $getConditionDocInfo->getDocInfo($startNum,$limitNum);
        $docIds = $getConditionDocInfo->docIds;
        $tagInfoRes = $this->model->query("query",$this->getDocClassInfoSql($docIds));
        $data["docTagList"] = $this->fetchResult($tagInfoRes);
        $this->model->close();
        echo json_encode($data);
    }
}

class AddDoc extends Context{
    use addDocInfo_T;
    public function callBack(){
        $this->model->connect();
        $sql = $this->addDocInfoSql($this->postData);
        $this->model->query("multi_query",$sql);
        $this->model->fetchResults();
        $this->model->close();
        echo $this->model->checkResults();
    }
}

class UpdateEditTime extends Context{
    use updateEditTime_T;
    public function callBack($docId){
        $this->model->connect();
        $sql = $this->updateEditTimeSql($docId);
        $this->model->query("multi_query",$sql);
        $this->model->fetchResults();
        $this->model->close();
        echo $this->model->checkResults();
    }
}

class SetDocPath extends Context{
    use setDocPath_T;
    public function callBack($docId,$groupId){
        $this->model->connect();
        $sql = $this->setDocPathSql($docId,$groupId);
        echo $sql;
        $this->model->query("multi_query",$sql);
        $this->model->fetchResults();
        $this->model->close();
        echo $this->model->checkResults();
    }
}

class DeleteDoc extends Context{
    use deleteDocInfo_T,docClassInfo_T,fetchResult_T;
    private function getRecentIssueIds($docId){
        $issueIdsRes = $this->model->query("query",$this->getRecentIssueIdsSql($docId));
        return $this->fetchIssueIdsRes($issueIdsRes);
    }
    public function callBack($docId,$dataNum){
        $this->model->connect();
        $issueIds = $this->getRecentIssueIds($docId);
        $queryType = !empty($issueIds) ? "multi_query" : "query";
        $this->model->query($queryType,$this->deleteDocInfoSql($docId,$issueIds));
        $this->model->fetchResults();
        $res = array();
        $res["flag"] = $this->model->checkResults();
        if($res["flag"]){
            $getConditionDocInfo = new GetConditionDocInfo($this->model,$this->userId,$this->postData);
            $data = $getConditionDocInfo->getDocInfo($dataNum,1);
            $docIds = $getConditionDocInfo->docIds;
            $res = array_merge($res,$data);
            $tagInfoRes = $this->model->query("query",$this->getDocClassInfoSql($docIds));
            $res["tag"] = $this->fetchResult($tagInfoRes);
        }
        $this->model->close();
        echo json_encode($res);
    }
}

class GetConditionDocInfo extends Context{
    use docListCondition_T,implodeStr_T,countRowSql_T;
    public function setLimit($limitSql){
        if(strlen($limitSql) > 0){
            $classIdsRes = $this->model->query("query",$limitSql);
            $this->getDocIds($classIdsRes);
            return true;
        }else{
            return false;
        }
    }
    public function getDocInfo($startNum,$limitNum){
        $data = array();
        $limitSql = $this->getLimitSql($this->postData,$startNum,$limitNum);
        $classIdsFlag = $this->setLimit($limitSql);
        $countDocSql = $this->getCountRowSql();
        if($classIdsFlag){
            $data["countDoc"] = $this->model->query("query",$countDocSql)->fetch_assoc()["num"];
        }
        $docInfoRes = $this->model->query("query",$this->getDocInfoSql());
        $data["docList"] = $this->fetchDocRes($docInfoRes);
        if(!$classIdsFlag){
            $data["countDoc"] = $this->model->query("query",$countDocSql)->fetch_assoc()["num"];
            $this->getDocIds($docInfoRes);
        }
        return $data;
    }
}

(new DocAction('DocModel'))->callContext();
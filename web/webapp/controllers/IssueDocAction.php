<?php
require_once(dirname(__FILE__).'/Controller.php');
require_once(dirname(__FILE__).'/../models/IssueDocModel.php');
require_once(dirname(__FILE__).'/../common/context.php');
require_once(dirname(__FILE__).'/../common/router.php');

class IssueDocAction extends Controller{}

class LoadView extends Context{
    public function getView(){
        return file_get_contents(dirname(__FILE__)."/../views/issueDocs.html", FILE_USE_INCLUDE_PATH);
    }
    public function callBack($issueId,$startNum,$limitNum){
        $file = array();
        $file["data"] = array();
        $file["html"] = $this->getView();
        $DocInfo = new GetDocListInfo($this->model,$this->userId,$this->postData);
        $file["data"] = $DocInfo->getDocList($issueId, $startNum, $limitNum,1);
        echo json_encode($file);
    }
}

class GetDocListInfo extends Context{
    use loadDocList_T,fetchResult_T,countRowSql_T,getDocMinEditTime_T;
    public function getDocList($issueId,$startNum,$limitNum,$getMinTime){
        $data = array();
        $this->model->connect();
        $res = $this->model->query("query",$this->getDocInfoSql($issueId,null,$startNum,$limitNum));
        if($res != false){
            $data["docList"] = $this->fetchResult($res);
            $data["countDoc"] = $this->model->query("query",$this->getCountRowSql())->fetch_assoc()["num"];
        }
        if($getMinTime){
            $data["minTime"] = $this->model->query("query",$this->getDocMinEditTimeSql($issueId))->fetch_assoc()["minTime"];
        }
        $this->model->close();
        return $data;
    }
    public function callBack($issueId,$startNum,$limitNum,$getMinTime){
        echo json_encode($this->getDocList($issueId,$startNum,$limitNum,$getMinTime));
    }
}

class GetAddDocList extends Context{
    use loadAddDocList_T,fetchResult_T,countRowSql_T,getDocEditTime_T;
    public function callBack($startNum,$limitNum){
        $data = array();
        $this->model->connect();
        $sql = $this->loadAddDocListSql($this->postData,$startNum,$limitNum);
        if($sql != false){
            $res = $this->model->query("query",$sql);
            if($res != false){
                $data["docList"] = $this->fetchResult($res);
                $data["countDoc"] = $this->model->query("query",$this->getCountRowSql())->fetch_assoc()["num"];
            }
        }
        $this->model->close();
        echo count($data) > 0 ? json_encode($data) : false;
    }
}

class AddDocInfoByList extends Context{
    use addDocByList_T,loadAddDocList_T,fetchResult_T,countRowSql_T;
    public function callBack($startNum){
        $sql = $this->addDocInfoSql($this->postData);
        if($sql != false){
            $data = array();
            $this->model->connect();
            $this->model->query("multi_query",$sql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
            if(!is_array($checkRes)){
                $data["docInfo"] = $this->model->query("query",$this->loadAddDocListSql($this->postData,$startNum,1))->fetch_assoc();
                $data["countDoc"] = $this->model->query("query",$this->getCountRowSql())->fetch_assoc()["num"];
            }
            $this->model->close();
            echo $checkRes ? json_encode($data) : $checkRes;
        }else{
            echo false;
        }
    }
}

class AddDocInfoByData extends Context{
    use addDoc_T;
    public function callBack($issueId){
        $sql = $this->addDocInfoSql($issueId,$this->postData);
        if(!empty($sql)){
            $this->model->connect();
            $this->model->query("multi_query",$sql);
            $this->model->fetchResults();
            $this->model->close();
            echo $this->model->checkResults();
        }else{
            echo false;
        }
    }
}

class DeleteDocInfo extends Context{
    use loadDocList_T,fetchResult_T,countRowSql_T,deleteDocInfo_T;
    public function setRecentDocInfo() {
       if($this->model->query("query",$this->countRecentDocInfoSql())->fetch_assoc()["num"] == 0){
           $this->model->query("multi_query",$this->setRecentDocInfoSql());
       }
    }
    public function getDocList($docListSql){
        $data = array();
        $res = $this->model->query("query",$docListSql);
        if($res != false){
            $data["docList"] = $this->fetchResult($res);
            $data["countDoc"] = $this->model->query("query",$this->getCountRowSql())->fetch_assoc()["num"];
        }
        return $data;
    }
    public function callBack($issueId,$startNum,$limitNum){
        $this->model->connect();
        $deleteSql = $this->deleteDocInfoSql($issueId,$this->postData);
        $data = array();
        if(!empty($deleteSql)){
            $this->model->query("multi_query",$deleteSql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
            if($checkRes){
                $docListSql = $this->getDocInfoSql($issueId,$this->getConditionSql(),$startNum,$limitNum);
                $data = $this->getDocList($docListSql);
                $this->setRecentDocInfo();//这里需要注意语句的顺序，如果把这句放在获取doclist之前则，doclist结果集为false；这个原因还不清楚；2019.6.24.22:24
            }
        }
        $this->model->close();
        echo $checkRes ? json_encode($data) : $checkRes;
    }
}

class GetDocGroupInfo extends Context{
    use getDocGroupInfo_t,fetchResult_T;
    public function callBack($topId,$issueId){
        $this->model->connect();
        $subClsSql = $this->getDocGroupInfoSql($topId,$issueId);
        $res = $this->model->query("query",$subClsSql);
        $data = array();
        if($res != false){
            $data["subClsList"] = $this->fetchResult($res);
        }
        $this->model->close();
        echo $res != false ? json_encode($data) : $res;
    }
}

(new IssueDocAction('IssueDocModel'))->callContext();
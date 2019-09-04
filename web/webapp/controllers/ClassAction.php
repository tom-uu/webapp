<?php
require_once(dirname(__FILE__).'/Controller.php');
require_once(dirname(__FILE__).'/../models/ClassModel.php');
require_once(dirname(__FILE__).'/../common/context.php');
require_once(dirname(__FILE__).'/../common/router.php');

class ClassAction extends Controller{}

class ClassContext extends Context{
    protected $clsTName;
    protected $freqClsTName;
    protected $fieldName;
    private function setFieldName($fieldName){
        if(!isset($this->fieldName)){
            $this->fieldName = $fieldName;
        }
    }
    public function setTbName($fieldName){
        $this->setFieldName($fieldName);
        $this->clsTName = $fieldName."_class";
    }
    public function setFreqTbName($fieldName){
        $this->setFieldName($fieldName);
        $this->freqClsTName = $fieldName."_freq_class";
    }
}

class LoadView extends ClassContext{
    use getTopClsTrait,getFreqClsTrait,fetchResultTrait;
    public function getView(){
        $html = file_get_contents(dirname(__FILE__).'/../views/class.html', FILE_USE_INCLUDE_PATH);
        return $html;
    }
    public function callBack($fieldName,$getHtml){
        $file = array();$this->setTbName($fieldName);$this->setFreqTbName($fieldName);
        $this->model->connect();
        $data = array();
        $topClsSql = $this->getTopClsSql();
        $topRes = $this->model->query("query",$topClsSql);
        if($topRes != false){
            $data["topClsList"]=$this->fetchResult($topRes);
            $freqClsSql = $this->getFreqClsSql();
            $freqRes = $this->model->query("query",$freqClsSql);
            if($freqRes != false){
                $data["freqClsList"]=$this->fetchResult($freqRes);
            }
        }
        if($getHtml === "1"){
            $file["html"] = $this->getView();
        }
        $file["pageData"] = $data;
        $this->model->close();
        echo json_encode($file);
    }
}

class GetTopClass extends ClassContext{
    use getTopClsTrait,fetchResultTrait;
    public function callBack($fieldName){
        $this->setTbName($fieldName);
        $this->model->connect();
        $data = array();
        $topClsSql = $this->getTopClsSql();
        $topRes = $this->model->query("query",$topClsSql);
        if($topRes != false){
            $data["topClsList"]=$this->fetchResult($topRes);
        }
        $this->model->close();
        echo json_encode($data);
    }
}

class AddTopClass extends ClassContext{
    use addTopClsTrait;
    public function callBack($fieldName){
        $this->setTbName($fieldName);
        $this->model->connect();
        $classId = $this->model->query("query",$this->checkRootSql())->fetch_assoc()["classId"];
        $this->model->query("multi_query",$this->addTopClsSql($classId,$this->postData));
        $this->model->fetchResults();
        $this->model->close();
        if(!is_array($this->model->checkResults())){
            $data = array();
            $data["id"] = $this->id;
            echo json_encode($data);
        }else{
            echo false;
        }
    }
}

class DeleteTopClass extends ClassContext{
    use deleteTopClsTrait,resetFreqClsNodeId,fetchResultTrait;
    public function getDeleteFreqClsArr($topSql){
        $sql = $this->getDeleteFreqClsSql($topSql);
        $info = array();
        if($sql != false){
            $res = $this->model->query("query",$sql);
            if($res != false){
                $info = $this->fetchResult($res);
            }
        }
        return $info;
    }
    public function getDeleteTopClsArr(){
        $sql = $this->getDeleteTopClsSql($this->postData);
        $info = array();
        if($sql != false){
            $res = $this->model->query("query",$sql);
            if($res != false){
                $info["topCls"] = $this->fetchResult($res);
                $info["freqCls"] = $this->getDeleteFreqClsArr($sql);
            }
        }
        return $info;
    }
    public function callBack($fieldName){
        $this->setTbName($fieldName);
        $this->setFreqTbName($fieldName);
        $this->model->connect();
        $clsInfo = $this->getDeleteTopClsArr();
        $freqClsInfo = $clsInfo["freqCls"];
        $sql = $this->deleteTopClsSql($clsInfo["topCls"],$freqClsInfo);
        if($sql != false){
            $this->model->query("multi_query",$sql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
        }
        $this->model->close();
        echo $sql != false && !is_array($checkRes) ? json_encode(array("countFreq"=>count($freqClsInfo))) : false;
    }
}

class ArrangeTopClass extends ClassContext{
    use arrangeTopClsTrait;
    public function callBack($fieldName,$classId,$referId){
        $this->setTbName($fieldName);
        $this->model->connect();
        $res = $this->model->query("query",$this->getTopClsSql($classId));
        if($res != false){
            $classIds = $this->fetchOnMoveRes($res);
            $sql = $this->updateTopClsSql($classId,$referId,$classIds);
            $this->model->query("multi_query",$sql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
        }
        $this->model->close();
        echo $res != false && !is_array($checkRes) ? true : false;
    }
}

class GetSubClass extends ClassContext{
    use getSubClsTrait,fetchResultTrait;
    public function callBack($fieldName,$topId){
        $this->setTbName($fieldName);
        $this->model->connect();
        $subClsSql = $this->getSubClsSql($topId);
        $res = $this->model->query("query",$subClsSql);
        $data = array();
        if($res != false){
            $data["subClsList"] = $this->fetchResult($res);
        }
        $this->model->close();
        echo $res != false ? json_encode($data) : $res;
    }
}

class AddSubClass extends ClassContext{
    use addSubClsTrait;
    public function callBack($fieldName,$topId){
        $this->setTbName($fieldName);
        $this->model->connect();
        $sql = $this->addSubClsSql($topId,$this->postData);
        if($sql != false){
            $this->model->query("multi_query",$sql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
        }
        $this->model->close();
        echo isset($checkRes) && !is_array($checkRes) ? json_encode(array("id"=>$this->id)) : false;
    }
}

class DeleteSubClass extends ClassContext{
    use deleteSubClsTrait,resetFreqClsNodeId,fetchResultTrait;
    public function getDeleteFreqClsArr(){
        $sql = $this->getDeleteFreqClsSql();
        $info = array();
        if($sql != false){
            $res = $this->model->query("query",$sql);
            if($res != false){
                $info = $this->fetchResult($res);
            }
        }
        return $info;
    }
    public function getDeleteSubClsArr(){
        $sql = $this->getDeleteSubClsSql($this->postData);
        $info = array();
        if($sql != false){
            $res = $this->model->query("query",$sql);
            if($res != false){
                $info["subCls"] = $this->fetchResult($res);
                $info["freqCls"] = $this->getDeleteFreqClsArr();
            }
        }
        return $info;
    }
    public function callBack($fieldName,$topId){
        $this->setTbName($fieldName);
        $this->setFreqTbName($fieldName);
        $this->model->connect();
        $clsInfo = $this->getDeleteSubClsArr($topId);
        $freqClsInfo = $clsInfo["freqCls"];
        $sql = $this->deleteSubClsSql($topId,$clsInfo["subCls"],$freqClsInfo);
        if($sql != false){
            $this->model->query("multi_query",$sql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
        }
        $this->model->close();
        echo $sql != false && !is_array($checkRes) ? json_encode(array("countFreq"=>count($freqClsInfo))) : false;
    }
}

class ArrangeSubClass extends ClassContext{
    use arrangeSubClsTrait;
    public function callBack($fieldName,$classId,$referClassId){
        $this->setTbName($fieldName);
        $this->model->connect();
        $sql = $this->arrangeSubClsSql($classId, $referClassId);
        $this->model->query("multi_query",$sql);
        $this->model->fetchResults();
        $this->model->close();
        $checkRes = $this->model->checkResults();
        echo is_array($checkRes) ? false : true;
    }
}

class GetAllSubClass extends ClassContext{
    use getAllSubClsTrait,fetchResultTrait;
    public function callBack($fieldName){
        $this->setTbName($fieldName);
        $this->setFreqTbName($fieldName);
        $this->model->connect();
        $sql = $this->getAllSubClsSql();
        $res = $this->model->query("query",$sql);
        $data = array();
        if($res != false){
            $data["subClsList"] = $this->fetchResult($res);
        }
        $this->model->close();
        echo $res != false ? json_encode($data) : $res;
    }
}

class GetFreqClass extends ClassContext{
    use getFreqClsTrait,fetchResultTrait;
    public function callBack($fieldName){
        $this->setTbName($fieldName);
        $this->setFreqTbName($fieldName);
        $this->model->connect();
        $sql = $this->getFreqClsSql();
        $res = $this->model->query("query",$sql);
        $data = array();
        if($res != false){
            $data["freqClsList"]=$this->fetchResult($res);
        }
        $this->model->close();
        echo $res != false ? json_encode($data) : $res;
    }
}

class AddFreqClass extends ClassContext{
    use addFreqClsTrait;
    public function callBack($fieldName){
        $this->setTbName($fieldName);
        $this->setFreqTbName($fieldName);
        $this->model->connect();
        $sql = $this->addFreqClsSql($this->postData);
        echo $sql;
        if($sql != false){
           $this->model->query("multi_query",$sql);
           $this->model->fetchResults();
           $checkRes = $this->model->checkResults(); 
        }
        $this->model->close();
        echo $sql != false && !is_array($checkRes) ? true : false;
    }
}

class DeleteFreqClass extends ClassContext{
    use deleteFreqClsTrait,fetchResultTrait;
    public function getDeleteFreqClsArr(){
        $sql = $this->getDeleteFreqClsSql($this->postData);
        $info = array();
        if($sql != false){
            $res = $this->model->query("query",$sql);
            if($res != false){
                $info  = $this->fetchResult($res);
            }
        }
        return $info ;
    }
    public function callBack($fieldName){
        $this->setFreqTbName($fieldName);
        $this->model->connect();
        $info = $this->getDeleteFreqClsArr();
        $sql = $this->deleteFreqClsSql($info);
        echo $sql;
        if($sql != false){
            $this->model->query("multi_query",$sql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
        }
        $this->model->close();
        echo $sql != false && !is_array($checkRes) ? true : false;
    }
}

class ArrangeFreqClass extends ClassContext{
    use arrangeFreqClsTrait;
    public function callBack($fieldName,$clsId,$refClsId){
        $this->setFreqTbName($fieldName);
        $this->model->connect();
        $sql = $this->arrangeSubClsSql($clsId,$refClsId);
        if($sql != false){
            $this->model->query("multi_query",$sql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
        }
        $this->model->close();
        echo $sql == false || is_array($checkRes) ? false : true;
    }
}

class RenameClass extends ClassContext{
    use renameClassTrait;
    public function callBack($fieldName){
        $this->setTbName($fieldName);
        $this->model->connect();
        $sql = $this->renameClassSql($this->postData);
        if($sql != false){
            $this->model->query("query",$sql);
            $this->model->fetchResults();
            $checkRes = $this->model->checkResults();
        }
        $this->model->close();
        echo $sql == false || is_array($checkRes) ? false : true;
    }
}

(new ClassAction('ClassModel'))->callContext();
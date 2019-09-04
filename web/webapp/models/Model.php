<?php

class Model {
    private $db;
    public function __construct($db){
        $this->db = new DB($db);
    }
    public function getDBInfo(){
        return $this->db;
    }
    public function connect(){
        $this->db->connect();
    }
    public function query($query_fun,$sql){
        return $this->db->$query_fun($sql);
    }
    public function fetchResults(){
        do {
            $result = $this->db->store_result();
            $this->_resultMulti[] = $result;
            $this->_errnoMulti[] = $this->db->get_errno();
            if(is_object($result)) {
                $result->free_result();
            }
        } while($this->db->next_result());
    }
    public function checkResults(){
        $res = array();
        for ($i=0,$len=count($this->_errnoMulti);$i<$len;$i++){
            if($this->_errnoMulti[$i] !== 0){
                $res[] = $this->_errnoMulti[$i];
            }
        }
        return count($res) === 0 ? true : $res;
    }
    public function close(){
        $this->db->close();
    }
}

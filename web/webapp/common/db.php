<?php

$db1['hostname'] = 'localhost';
$db1['username'] = 'root';
$db1['password'] = '123456';
$db1['database'] = 'conception';

class DB{
    private $config;
    public $mysqli;
    public function __construct($config){
        $this->setDBConfig($config);
    }
    public function setDBConfig($config){
        $this->config = $config;
    }
    public function getDBConfig(){
        return $this->config;
    }
    public function connect(){
        $this->mysqli = new mysqli($this->config['hostname'], $this->config['username'], $this->config['password'],$this->config['database']);
    }
    public function query($sql){
        return $this->mysqli->query($sql);
    }
    public function multi_query($sql){
        return $this->mysqli->multi_query($sql);
    }
    public function next_result(){
        return $this->mysqli->next_result();
    }
    public function store_result(){
        return $this->mysqli->store_result();
    }
    public function get_errno(){
        return $this->mysqli->errno;
    }
    public function close(){
        return mysqli_close($this->mysqli);
    }
}

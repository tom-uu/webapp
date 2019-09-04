<?php
$couchdb_url = "http://admin:123456@localhost:5984/";
trait httpRequest{
    private $url;
    private $data;
    private $type;
    public function setHttpType($curl){
        switch ($this->type){
            case "POST":
                curl_setopt($curl,CURLOPT_POST,1);
                break;
            case "PUT":
                curl_setopt($curl,CURLOPT_CUSTOMREQUEST,"PUT");
                break;
        }
        if(!empty($this->data)){
            curl_setopt($curl,CURLOPT_POSTFIELDS,$this->data);
        }
        curl_setopt($curl,CURLOPT_RETURNTRANSFER,1);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json; charset=utf-8',
            'Content-Length: '. strlen($this->data)
        ));
    }
    public function setCurl($curl){
        curl_setopt($curl,CURLOPT_URL,$this->url);
        curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,FALSE);
        curl_setopt($curl,CURLOPT_SSL_VERIFYHOST,FALSE);
        $this->setHttpType($curl);
    }
    public function httpCurl($path_url,$data,$type)
    {
        global $couchdb_url;
        $this->url = $couchdb_url.$path_url;
        $this->data = $data;
        $this->type = $type;
        $curl = curl_init();
        $this->setCurl($curl);
        $output = curl_exec($curl);
        curl_close($curl);
        return $output;
    }
}


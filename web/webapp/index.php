<!DOCTYPE html>
<?php if(filter_input(INPUT_COOKIE,'id') !== NULL){$signed_hide='hide';$nosign_outwidth_hide=$nosign_hide='';$docDbName=filter_input(INPUT_COOKIE,'docDbHost');}else{$signed_hide='';$nosign_hide='hide';$nosign_outwidth_hide='out_width_hide';$docDbName="";header("location:sign.php");}?>	
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<meta http-equiv="Access-Control-Allow-Origin" content="*">
<title>净虑</title>
<link type="text/css" href="./css/mainPage.css" rel="stylesheet" />
<link type="text/css" href="./css/fontIcon.css" rel="stylesheet" />
<link type="text/css" href="./css/icon.css" rel="stylesheet" />
<link type="text/css" href="/webapp/css/infoSection.css" rel="stylesheet" />
</head>
<body>	
<nav id="outerNav" class="nav">
    <div class="nav_container">
        <div id="userContainer" class="user_container">	
            <div>
                <a id="userImage" class="user-image"><img class="user_photo" src="/webapp/images/user_default.jpg"/></a>
                <div id="userList" class="user_list list hide">
                    <a>我的账号</a>
                    <a id="signOutTrigger" class="icon-btn"><span class="icon-quit-m"></span><span>退出</span></a>
                </div>		
            </div>			
        </div>	
        <div class="nav_header">
            <button id="nav_toggle" class="navbar-toggle" type="button">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <div id="navViewName" class="viewname">精选</div>
            <div id="siteTitle" class="headTitleContainer">
                <span id="wholeTitle" class="mainHeadTitle">净虑</span>
            </div>
        </div>
        <div id="navBar" class="navbar-collapse collapse">
            <div class="navMenu">
                <div class="searchContainer">
                    <a id="searchCancelButton" class="cancel_botton search_cancel icon-btn hide"><span class="icon-cancel-m"></span></a>								
                    <a id="searchButton" class="search icon-btn"><span class="icon-search-l"></span></a>	
                    <div id="searchInput" class="cd_search_text inputWidthCollapse">
                        <input type="text" name="searchText" placeholder="搜索"/>
                    </div>																
                </div>
                <ul id="navigation" class="navbar-nav">
                    <li class="item current"><a id="navCollect">精选</a></li>
                    <li class="item"><a id="navIssue">专题</a></li>
                    <li class="item"><a id="navDoc">文档</a></li>
                    <li class="item hide"><a id="navMyInfo">我的</a></li>								
                </ul>
            </div>	
        </div>	
    </div>		
</nav>
<div id="content" class="content"></div>
<div id="userNav" class="right_nav"></div>
</body>
<script type="text/javascript" src="/webapp/script/lib/common.js"></script>
<script type="text/javascript" src="/webapp/script/lib/fastclick.js"></script>
<script type="text/javascript">
    function signInStatus(){
        return <?php echo filter_input(INPUT_COOKIE,'id') === NULL ? 0 : 1;?>
    }
    
    function checkSmallWin(){
        return document.documentElement.clientWidth < 756 ? true : false;
    }
    
    function getDocDbHost(){
        return "<?php echo $docDbName?>";
    }
    
    function getDocDbName(){
        return "<?php echo strlen($docDbName) > 0 ?  '/'.$docDbName.'/'.filter_input(INPUT_COOKIE,'docDb').'/' : 0;?>";
    }
    
    function getUserName(){
        return "<?php echo filter_input(INPUT_COOKIE,"name") !== NULL ? filter_input(INPUT_COOKIE,"name") : 0 ?>";
    }
    
    function getViewCss(key){
        var map = {
            "textReader" : "/webapp/css/textReader.css",
            "textEditor" : "/webapp/css/textEditor.css",
            "collect" : "/webapp/css/collect.css",
            "issue" : "/webapp/css/issuePage.css",
            "issueDocs" : "/webapp/css/issueDocs.css",
            "doc" : "/webapp/css/docPage.css",
            "docPath" : "/webapp/css/docPath.css",
            "class" : "/webapp/css/class.css"
        };
        return map.hasOwnProperty(key) ? map[key] : null;
    }
    
    function checkViewScript(key){
        var map = {
            "issue" : function(){
                return typeof IssueView === "function" ? true : false;
            },"issueDocs" : function(){
                return typeof IssueDocs_V === "function" ? true : false;
            },"textReader" : function(){
                return typeof TextReader_V === "function" ? true : false;
            },"textEditor" : function(){
                return typeof TextEditor_V === "function" ? true : false;
            },"class" : function(){
                return typeof Class_V === "function" ? true : false;
            }
        };
        return map.hasOwnProperty(key) ? map[key]() : false;
    }
    
    function viewId(key){
        var map = {
            "collect" : "collect-view",
            "issue" : "issue-view",
            "issueDocs" : "issue-docs-view",
            "doc" : "doc-view",
            "textReader" : "textReaderView",
            "textEditor" : "textEditorView",
            "myInfo" : "my-info-View",
            "class" : "class-view"
        };
        return map.hasOwnProperty(key) ? map[key] : false;
    }
    
    function loadView(key,container,viewHtml,callBack){       
        var id = viewId(key);
        var scriptFlag = checkViewScript(key);
        var setPageHtml = function(tmpDiv){
            var viewNode = tmpDiv.querySelector("#"+id);
            var thisHtml = "<div id=\""+id+"\"";
            var thisClassName = viewNode.className;
            if(thisClassName && thisClassName.length > 0){
                thisHtml += " class=\""+thisClassName+"\"";
            }
            thisHtml += '>'+tmpDiv.querySelector("#"+id).innerHTML+"</div>";
            container.innerHTML = thisHtml;
            callBack();
        };
        if(id){
            var tmpDiv = document.createElement('div');
            tmpDiv.innerHTML = viewHtml;
            if(scriptFlag){
                setPageHtml(tmpDiv);
            }else{
                loadScriptBySrc(tmpDiv.querySelector("script").src,function(){
                    setPageHtml(tmpDiv);
                });
            }
        }
    }
    
    function LoadDocList_C(docIds){
        return function(callBack){
            requestServer("POST",getDocDbName()+"_design/showList/_list/docSummary/show",JSON.stringify({"keys":docIds}),function(res){
                callBack(res);
            },"application/json");
        };
    }
</script>
<script type="text/javascript" src="/webapp/script/index.js"></script>
</html>
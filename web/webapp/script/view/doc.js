function DocView(contentNode,pageData){
    var viewContainer = contentNode.querySelector("#doc-view");
    var docContent = viewContainer.querySelector("#doc-content-view");
    var conView = {
        docListView : docContent.querySelector("#doc-list-view"),
        docInfoView : docContent.querySelector("#doc-info-view"),
        dimensions : docContent.querySelector("#doc-dimensions-view"),
        search : docContent.querySelector(".doc-search-view"),
        condition : docContent.querySelector(".doc-condition-view"),
        freqClassify : docContent.querySelector(".freqCls-classify-view"),
        topClassify : docContent.querySelector(".topCls-classify-view")
    };
    var viewFrag = {
        "docContent":document.createDocumentFragment(),
        "class":document.createDocumentFragment(),
        "classList":document.createDocumentFragment(),
        "docList":document.createDocumentFragment(),
        "editDoc":document.createDocumentFragment(),
        "textReader":document.createDocumentFragment(),
        "textEditor":document.createDocumentFragment()
    };

    var controller = Controller("Doc");
    var sectionTouch = SectionTouch_I(docContent);
    sectionTouch.setView(controller);
    
    var contentChange = ContentChange_I(controller);
        
    var viewDisplay = function(flag){
        var listView = conView.docListView;
        if(flag){
            docContent.appendChild(viewFrag.docContent);
            contentChange("setScroll")(listView);
        }else{
            contentChange("recordScroll")(listView);
            viewFrag.docContent.appendChild(docContent.children[0]);
        }
    };
    
    function showDimensionSearchView(flag){
        if(flag){
            removeClass(conView.condition,"hide");
            removeClass(conView.search,"hide");
        }else{
            addClass(conView.condition,"hide");
            addClass(conView.search,"hide");
        }
    }
    
    function loadDoc_c(){
        var startNum = 0;
        var limitNum = 10;
        var reqData = null;
        return {
            "setNum" : function(){
                if(arguments.length > 0){
                    startNum = arguments[0];
                    if(arguments.length > 1){
                        limitNum = arguments[1];
                    }
                }
            },"setReqData" : function(reqInfo){
                reqData = reqInfo;
            },"process" : function(callBack){
                if(reqData === null){
                    requestServer("GET","/webapp/controllers/DocAction.php/GetDocListAll/"+startNum+'/'+limitNum+'/',null,function(res){
                        callBack(res);
                    });
                }else{
                    requestServer("POST","/webapp/controllers/DocAction.php/GetDocList/"+startNum+'/'+limitNum+'/',JSON.stringify(reqData),function(res){
                        callBack(res);
                    });
                }
            }
        };
    }

    function setDocPath_c(docId,groupId){
        return function(callBack){
            requestServer("GET","/webapp/controllers/DocAction.php/SetDocPath/"+docId+'/'+groupId+'/',null,function(res){
                callBack(res);
            });
        };
    }

    function deleteDocInfo_c(docId,dataNum){
        var reqData = null;
        return {
            "setReqData" : function(reqInfo){
                reqData = reqInfo;
            },"process" : function(callBack){
                requestServer("POST","/webapp/controllers/DocAction.php/DeleteDoc/"+docId+"/"+dataNum+"/",JSON.stringify(reqData),function(res){
                    callBack(res);
                });
            }
        };
    }

    function deleteDoc_c(docId,rev){
        return function(callBack){
            requestServer("DELETE",getDocDbName()+docId+"?rev="+rev,null,function(res){
                callBack(res);
            });
        };
    }
    
    function loadClassView_c(getHtml){
        return function(callBack){
            requestServer("GET","/webapp/controllers/ClassAction.php/LoadView/doc/"+getHtml+"/",null,function(resText){
                callBack(resText);
            });
        };
    }
    
    function loadClassViewFun(viewCallBack,folderId){
        var topContext = controller.topContext();
        var tabViewSetFun = controller.getGContext("tabView").getTrait("setView");
        var loadClassView = function(contextKey,pageData){
            typeof folderId === "string" || folderId === null ? Class_V(controller,docContent,viewFrag,pageData,"doc",viewCallBack,folderId) : Class_V(controller,docContent,viewFrag,pageData,"doc",viewCallBack);
            tabViewSetFun(contextKey);
        };
        if(topContext.getKey() === "docList"){
            var key = "class";
            var topViewDisplayFun = topContext.getTrait("viewDisplay");
            addCss(getViewCss(key));
            if(viewFrag.class.childElementCount === 0){
                loadClassView_c(1)(function(res){
                    var fileData = JSON.parse(res);
                    var containerDiv = document.createElement('div');
                    containerDiv.innerHTML = fileData["html"];
                    topViewDisplayFun(false,key);
                    loadView(key,docContent,fileData["html"],function(){
                        loadClassView(key,fileData["pageData"]);
                    });
                });
            }else{
                loadClassView_c(0)(function(res){
                    var fileData = JSON.parse(res);
                    topViewDisplayFun(false,key);
                    loadClassView(key,fileData["pageData"]);
                });
            }
        }
    }
    
    function loadTopClsList_c(){
        return function(callBack){
            requestServer("GET","/webapp/controllers/DocAction.php/GetTopClsInfo/",null,function(res){
                callBack(res);
            });
        };
    }

    function loadFreqClsList_c(){
        return function(callBack){
            requestServer("GET","/webapp/controllers/DocAction.php/GetFreqClsInfo/",null,function(res){
                callBack(res);
            });
        };
    }
    
    function loadClsList_c(classType){
        var loadEndCallBack = function(res){
            if(res){
                var data = JSON.parse(res);
                if(data.hasOwnProperty(classType+"ClsList")){
                    controller.getGContext(classType+"TagView").getTrait("setList")(data[classType+"ClsList"]);
                }
            }
        };
        if(classType === "top"){
            loadTopClsList_c()(loadEndCallBack);
        }else if(classType === "freq"){
            loadFreqClsList_c()(loadEndCallBack);
        }
    }
    
    function loadEditorView(tabKey,docId,groupId){
        viewDisplay(false);
        var key = "textEditor";
        var editorFrag = viewFrag.textEditor;
        var docData = {};
        if(typeof groupId === "string"){
            docData.groupId = groupId;
        }
        if(typeof docId === "string"){
            docData.docId = docId;
        }
        if(editorFrag.childElementCount === 0){
            addCss("/webapp/css/"+key+".css");
            LoadCompView_C(key)(function(res){
                var fileData = JSON.parse(res);
                loadView(key,docContent,fileData["html"],function(){
                    TextEditor_V(controller,docContent,viewFrag,null,docData);
                });
            });
        }else if(checkViewScript(key)){
            TextEditor_V(controller,docContent,viewFrag,null,docData);
        }
        controller.getGContext("tabView").getTrait("setView")(tabKey);
    };
    
    function PageTab_V(){
        var view = View({"id":"doc-tab-view"});
        view.init();
        var titleText = view.get(".tab-title-text");
        var addDocTrigger = view.get(".tab-add-trigger");
        var moreTrigger = view.get(".tab-more-trigger");
        var moreBtnsView = view.get(".tab-more-btns");
        var submitTrigger = view.get(".tab-ok-trigger");
        var backView = view.get(".tab-back-view");
        var backTrigger = view.get(".tab-back-trigger");
        var pageTabTitleMap = {
            "docList":"文档列表",
            "addDoc":"添加文档",
            "class":"文档目录",
            "textEditor":"编辑文档",
            "textReader":"浏览文档"
        };
        var setPageTitle = function(key){
            titleText.innerText = pageTabTitleMap[key];
        };
        var setTabReturnStyle = function(contextKey){
            if(contextKey !== 'docList'){
                addClass(addDocTrigger,"hide");
                removeClass(backView,"hide");
                contextKey === "textEditor" || contextKey === "addDoc" ? removeClass(submitTrigger,"hide") : addClass(submitTrigger,"hide");
                contextKey !== "textReader" ? addClass(moreTrigger,"hide") : removeClass(moreTrigger,"hide");
            }else{
                removeClass(addDocTrigger,"hide");
                addClass(backView,"hide");
                addClass(submitTrigger,"hide");
                addClass(moreTrigger,"hide");
            }
        };
        var changeView = function(contextKey){
            setTabReturnStyle(contextKey);
            setPageTitle(contextKey);
        };
        var tabPageBack = function(){
            if(controller.getContextLen() > 1){
                var popContext = controller.popContext();
                var nextContext = controller.topContext();
                var nextKey = nextContext.getKey();
                var pageBackFun = popContext.getTrait("pageBack");
                if(typeof pageBackFun === 'function'){
                    pageBackFun();
                }
                var popKey = popContext.getTrait("viewDisplay")(false);
                changeView(nextKey);
                if(typeof nextContext.reset === 'function'){
                    nextContext.reset(popContext.popInfo,popKey);
                }
                nextContext.getTrait("viewDisplay")(true);
            }
        };
        return {
            "setView" : function(){
                var thisContext = Context("tabView");
                thisContext.setTrait("setView",changeView);
                thisContext.setTrait("tabPageBack",tabPageBack);
                thisContext.setTrait("moreTrigger",moreTrigger);
                thisContext.setTrait("moreBtnsView",moreBtnsView);
                thisContext.setTrait("submitTrigger",submitTrigger);
                controller.setGContext(thisContext);
            },"event" : function(){
                setPageTitle("docList");
                addDocTrigger.addEventListener("click",function(){
                    var topContext = controller.topContext();
                    if(topContext.getKey() === 'docList'){
                        loadEditorView("addDoc");
                    }
                });
                backTrigger.addEventListener("click",tabPageBack);
            }
        };
    }

    function DocList_V(){
        var view = View({"id":"doc-list-view"});
        var listView = view.init();
        var pageBarNode = docContent.querySelector(".paging");
        var pageNumList = pageBarNode.querySelector(".page-num");
        var itemTmp = view.get(".doc-item-template");
        itemTmp = itemTmp.parentNode.removeChild(itemTmp);
        var emptyItemHtml = listView.innerHTML;
        var docListFrag = document.createDocumentFragment();
        var onEditDocNode = null;
        var loadDocJson = {};
        var setDocJson = function(loadRes){
            if(loadRes.hasOwnProperty("docView")){
                loadDocJson[loadRes.docId] = loadRes.docView;
            }
        };
        var getDocIds = function(docList){
            var docIds = new Array();
            var checkIds = function(id){
                for(var i=0,len=docIds.length;i<len;i++){
                    var thisId = docIds[i];
                    if(thisId === id){
                        return true;
                    }
                }
                return false;
            };
            fetchArr(docList,function(i){
                var thisElem = docList[i];
                var docId = thisElem.docId;
                if(!checkIds(docId)){
                    docIds.push(docId);
                }
            });
            return docIds;
        };
        var setDocHtml = function(docData,docInfo,loadDocJson){               
            var thisId = docData.id;
            var docValue = docData.value;
            var thisTitle = docValue.title;
            var thisText = docValue.text;
            var thisDocView = loadDocJson[thisId];
            var docHtml = "<div>";
            if(thisTitle !== "0"){
                docHtml += "<h3>"+thisTitle+"</h3>";
            }
            docHtml +="<p>"+thisText+"</p><p>";
            if(docValue.hasOwnProperty("countAudio")){
                docHtml +="<span class=\"audio-tip\"><i class=\"icon\">&#xf1C7;</i> +"+docValue.countAudio+"</span>";
            }
            docHtml += "<span>修改时间</span><span>"+docInfo.editTime+"</span></p></div>";
            thisDocView.innerHTML = docHtml;
            return thisDocView;
        };
        var emptyInfoDisplay = function(){
            listView.innerHTML = emptyItemHtml;
            controller.getGContext("docList").getTrait("setPage")(0);
            addClass(pageBarNode,"hide");
        };
        var getDocData = function(docData,docId){
            for(var i=0,len=docData.length;i<len;i++){
                var thisData = docData[i];
                var thisDocId = thisData.id;
                if(thisDocId === docId){
                    return thisData;
                }
            }
            return null;
        };
        var loadDocSummary = function(docList,callBack){
            var docIds = getDocIds(docList);
            if(docIds.length > 0){
                LoadDocList_C(docIds)(function(res){
                    var docListData = JSON.parse(res);
                    if(docListData.length > 0){
                        fetchArr(docList,function(i){
                            var thisDocInfo = docList[i];
                            var thisDocData = getDocData(docListData,thisDocInfo.docId);
                            var thisDocView = setDocHtml(thisDocData,thisDocInfo,loadDocJson);
                            thisDocView.parentNode.setAttribute("data-rev",thisDocData.value.rev);
                            removeClass(thisDocView,"hide");
                        });
                    }
                    if(typeof callBack === "function"){
                        callBack();
                    }
                    loadDocJson = {};
                });
            }
        };
        var loadData = function(docData,tagData,callBack){
            var tagDataJson = {};
            for(var i=0,len=tagData.length;i<len;i++){
                var thisElement = tagData[i];
                var thisDocId = thisElement.docId;
                if(!tagDataJson.hasOwnProperty(thisDocId)){
                    tagDataJson[thisDocId] = new Array();
                }
                tagDataJson[thisDocId].push(thisElement);
            }
            if(docData){
                if(docData.length > 0){
                    fetchArr(docData,function(i){
                        var setDocDataInterac = SetDocData_I(itemTmp);
                        var loadRes = setDocDataInterac.getItemByLoadData(docData[i]);
                        var docItem = loadRes.node;
                        setDocDataInterac.loadDocTag(tagDataJson);
                        docListFrag.appendChild(docItem);
                        setDocJson(loadRes);
                    });
                    loadDocSummary(docData,function(){
                        if(docListFrag.childElementCount > 0){
                            listView.innerHTML = "";
                            listView.appendChild(docListFrag);
                            if(typeof callBack === "function"){
                                callBack();
                            }
                            removeClass(pageBarNode,"hide");
                        }
                    });
                }else{
                    listView.innerHTML = emptyItemHtml;
                    if(typeof callBack === "function"){
                        callBack();
                    }
                }
            }
        };
        var getTotalNum = function(){
            return parseInt(pageBarNode.querySelector(".page-totalItem-text").innerText);
        };
        var getPageNum = function(){
            var focusNumNode = pageNumList.querySelector(".focus");               
            if(focusNumNode !== null){
                return parseInt(focusNumNode.innerText);
            }else if(pageNumList.firstChild !== null){
                return parseInt(pageNumList.firstChild.innerText);
            }else{
                return 0;
            }
        };
        var getTotalPageNum = function(){
            return parseInt(pageBarNode.querySelector(".page-totalPage-text").innerText);
        };
        var loadDataContext = loadDoc_c();
        var resetFun = function(info){
            if(info.hasOwnProperty("resetFlag") && info.resetFlag){
                var docListContext = controller.getGContext("docList");
                var conditionContext = controller.getGContext("conditionView");
                var resetDocList = docListContext.getTrait("resetList");
                var condition = conditionContext.getTrait("condition");
                var startNum = (getPageNum()-1)*10;
                startNum = startNum > 0 ? startNum : 0;
                loadDataContext.setNum(startNum);
                loadDataContext.setReqData(condition.info);
                loadDataContext.process(function(res){
                    if(res){
                        var resData = JSON.parse(res);
                        parseInt(resData.countDoc) > 0 ? resetDocList(resData) : emptyInfoDisplay();
                        docListContext.getTrait("setPage")(resData["countDoc"],getPageNum());
                    }else{
                        emptyInfoDisplay();
                    }
                });
            }
        };
        var setListPageBarView = function(countDoc){
            var pagingInteraction = PagingInteraction(pageBarNode);
            var resetDocList = function(pageData){
                var docListData = pageData["docList"];
                loadData(pageData["docList"],pageData["docTagList"]);
                pagingInteraction.setPage(parseInt(pageData["countDoc"]),1);
                if(docListData.length > 0){
                    showDimensionSearchView(true);
                }
            };
            pagingInteraction.initPaging(countDoc,1,function(startNum,pageBarCallBack){
                loadDataContext.setNum(startNum);
                loadDataContext.process(function(res){
                    var flag = false;
                    if(res !== false){
                        resetDocList(JSON.parse(res));
                        flag = true;
                    }else{
                        alert("获取文档时失败.");
                    }
                    pageBarCallBack(flag);
                });
            });
            pagingInteraction.event();
            controller.getGContext("docList").setTrait("setPage",pagingInteraction.setPage);
            controller.getGContext("docList").setTrait("resetList",resetDocList);
            if(parseInt(countDoc) > 0){
                removeClass(pageBarNode,"hide");
            }
        };
        var editDocResetFun = function(info){
            if(info.hasOwnProperty("editDoc")){
                var docNode = info.editDoc.node;
                var data = info.editDoc.data;
                var descText = docNode.querySelector(".doc-item-textTrigger");
                var tagList = docNode.querySelector(".doc-tagItem-list");
                var tagIcons = docNode.querySelectorAll(".tag_icon");
                var topTagIcon = tagIcons[0];
                var subTagIcon = tagIcons[1];
                var tagNameNodeTmp = document.createElement("li");
                var topTagFlag = hasClass(topTagIcon,"hide");
                var dataClassFlag = data.hasOwnProperty("class");
                var tagIconReset = function(){
                    var ulBox = document.createElement("ul");
                    ulBox.appendChild(topTagIcon);
                    ulBox.appendChild(subTagIcon);
                    tagList.innerHTML = "";
                    return ulBox;
                };
                if(data.hasOwnProperty("desc")){
                    descText.innerText = data.desc;
                }
                if(dataClassFlag){
                    tagIconReset();
                    var newTopTag = tagNameNodeTmp.cloneNode(true);
                    var topTagInfo = data.class.top;
                    newTopTag.setAttribute("data-id",topTagInfo.classId);
                    newTopTag.innerHTML = "<a>"+topTagInfo.className+"</a>";
                    addClass(newTopTag,"top-tag");
                    removeClass(topTagIcon,"hide");
                    tagList.appendChild(topTagIcon);
                    tagList.appendChild(newTopTag);
                    if(data.class.hasOwnProperty("sub")){
                        var subTagInfo = data.class.sub;
                        removeClass(subTagIcon,"hide");
                        tagList.appendChild(subTagIcon);
                        fetchArr(subTagInfo,function(i){
                            var newSubTag = tagNameNodeTmp.cloneNode(true);
                            newSubTag.setAttribute("data-id",subTagInfo[i].classId);
                            newSubTag.innerHTML = "<a>"+subTagInfo[i].className+"</a>";
                            addClass(newSubTag,"sub-tag");
                            tagList.appendChild(newSubTag);
                        });
                    }else{
                        addClass(subTagIcon,"hide");
                        tagList.appendChild(subTagIcon);
                    }
                }else if(!topTagFlag){
                    tagIconReset();
                    addClass(topTagIcon,"hide");
                    addClass(subTagIcon,"hide");
                    tagList.appendChild(topTagIcon);
                    tagList.appendChild(subTagIcon);
                }
            }
            if(onEditDocNode !== null){
               onEditDocNode = null; 
            }
        };
        var classReset = function(info){
            if(info.hasOwnProperty("pathChanged")){
                loadClsList_c("top");
                controller.getGContext("conditionView").getTrait("selectEventProcess")();
            }
            if(info.hasOwnProperty("freqChanged")){
                loadClsList_c("freq");
            }
        };
        var setDocPath = function(docItem){
            var docId = docItem.getAttribute("data-docId");
            loadClassViewFun(function(clsId,pathChanged){
                setDocPath_c(docId,clsId)(function(res){
                    if(res){
                        if(!pathChanged){
                            controller.getGContext("conditionView").getTrait("selectEventProcess")();
                        }
                        tipView(true,"文档已归于指定目录.");
                    }
                });
            },null);
        };
        var deleteDoc_i = function(thisItem,conditionInfo){
            var doDeleteDoc = deleteDocInfo_c(thisItem.getAttribute("data-docId"),getPageNum()*10-1);
            doDeleteDoc.setReqData(conditionInfo);
            doDeleteDoc.process(function(res){
                var resData = JSON.parse(res);
                if(resData.flag){
                    deleteDoc_c(thisItem.getAttribute("data-docId"),thisItem.getAttribute("data-rev"))(function(res){
                        if(res){
                            if(JSON.parse(res).hasOwnProperty("ok")){
                                listView.removeChild(thisItem);
                                var countDoc = parseInt(resData.countDoc);
                                controller.getGContext("docList").getTrait("setPage")(parseInt(resData["countDoc"]));
                                if(countDoc === 0){
                                    emptyInfoDisplay();
                                }
                                tipView(true,"已删除所选文档.");
                            }
                        }
                    });
                }
                if(resData.hasOwnProperty("docList") && resData["docList"].length > 0){
                    var resDocList = resData["docList"];
                    var thisDocInfo = resDocList[0];
                    var tagInfo = {};
                    tagInfo[thisDocInfo["docId"]] = resData["tag"];
                    var setDocDataInterac = SetDocData_I(itemTmp);
                    var loadRes = setDocDataInterac.getItemByLoadData(thisDocInfo);
                    var docItem = loadRes.node;
                    if(resData.hasOwnProperty("tag")){
                        setDocDataInterac.loadDocTag(tagInfo);
                    }
                    docListFrag.appendChild(docItem);
                    setDocJson(loadRes);
                    loadDocSummary(resDocList,function(){
                        if(docListFrag.childElementCount > 0){
                            listView.appendChild(docListFrag);
                        }
                    });
                }
            });
        };
        var overlayDelete_i = function(thisItem,conditionInfo){
            var docContentView = thisItem.querySelector(".doc-view").firstChild;
            var docH = docContentView.querySelector("h3");
            var para = docContentView.querySelector("p");
            var docText = para.innerText;
            var content = "";
            if(docH !== null){
                content += docH.innerText;
            }
            content += docText.length <= 100 ? docText : docText.substring(0,100)+"...";
            window.setDialogBox({
                title: "删除文档",
                content: content,
                callBack : function(){
                    deleteDoc_i(thisItem,conditionInfo);
                }
            });
        };
        return {
            "setView" : function(docData,tagData,countDoc){
                var thisContext = Context("docList");
                thisContext.setTrait("listView",listView);
                thisContext.setTrait("viewDisplay",viewDisplay);
                thisContext.setTrait("reset",{
                    "textReader" : resetFun,
                    "textEditor" : resetFun,
                    "editDoc" : editDocResetFun,
                    "class" : classReset
                });
                thisContext.setTrait("getTotalNum",getTotalNum);
                thisContext.setTrait("getTotalPageNum",getTotalPageNum);
                thisContext.setTrait("getPageNum",getPageNum);
                thisContext.setTrait("getEditNode",function(){
                    return onEditDocNode;
                });
                thisContext.setTrait("setEditNode",function(node){
                    onEditDocNode = node;
                });
                thisContext.setTrait("emptyInfoDisplay",emptyInfoDisplay);
                thisContext.setTrait("loadData",loadData);
                thisContext.setTrait("loadDataContext",loadDataContext);
                controller.setGContext(thisContext);
                controller.pushContext(thisContext);
                loadData(docData,tagData,function(){
                    setListPageBarView(countDoc);
                    removeClass(viewContainer,"hide");
                });
                if(docData.length > 0){
                    showDimensionSearchView(true);
                }
            },"event" : function(){
                var tabViewSetFun = controller.getGContext("tabView").getTrait("setView");
                var topClsContext = controller.getGContext("topTagView");
                var getTagViewTopNode = topClsContext.getTrait("getTopItemNode");
                var getTagViewSubNode = topClsContext.getTrait("getSubItemNode");
                var tagViewContext = controller.getGContext("tagView");
                var tagViewTopCheckFun = tagViewContext.getTrait("topCheckFun");
                var tagDoSelectFun = tagViewContext.getTrait("topDoSelect");
                var tagViewClearCheckStyle = tagViewContext.getTrait("clearCheckStyle");
                var conditionContext = controller.getGContext("conditionView");
                var conditionAddClsItem = conditionContext.getTrait("addClsListItem");
                var selectEventProcess = conditionContext.getTrait("selectEventProcess");
                var conditionInfo = conditionContext.getTrait("condition");
                var loadReaderView = function(docId){
                    var viewKey = "textReader";
                    var callTextReader = function(){
                        if(typeof TextReader_V !== "undefined"){
                            TextReader_V(controller,docContent,viewFrag,docId,true);
                            tabViewSetFun(viewKey);
                        }
                    };
                    viewDisplay(false,viewKey);
                    if(viewFrag[viewKey].childElementCount === 0){
                        addCss("/webapp/css/"+viewKey+".css");
                        LoadCompView_C(viewKey)(function(res){
                            var fileData = JSON.parse(res);
                            loadView(viewKey,docContent,fileData["html"],callTextReader);
                        });
                    }else if(checkViewScript(viewKey)){
                        callTextReader();
                    }
                };
                var listView_i = function(e){
                    var target = e.target;
                    if(e.target.nodeName === 'A'){
                        if(hasClass(target,"doc-delete-trigger")){
                            overlayDelete_i(target.parentNode.parentNode.parentNode,conditionInfo);
                        }else if(hasClass(target,"doc-edit-trigger")){
                            setDocPath(target.parentNode.parentNode.parentNode);
                        }else if(target.parentNode.nodeName === 'LI'){
                            var thisTagItem = target.parentNode;
                            var thisTagList = thisTagItem.parentNode;
                            if(hasClass(thisTagItem,"tag_icon")){
                                if(thisTagItem === thisTagList.children[0]){
                                    var tagClsId = thisTagItem.nextSibling.getAttribute("data-id");
                                    var folderId = tagClsId === null ? 0 : tagClsId;
                                    loadClassViewFun(function(clsId,clsName){
                                        tagDoSelectFun(clsId,clsName);
                                    },folderId);
                                }else{
                                    var topId = thisTagList.children[1].getAttribute("data-id");
                                    var thisSubNode = thisTagItem.nextSibling;
                                    tagViewClearCheckStyle();
                                    while(thisSubNode && thisSubNode.nodeName === 'LI'){
                                        var thisTag = thisSubNode.cloneNode(true);
                                        thisTag.setAttribute("data-topId",topId);
                                        conditionAddClsItem(thisTag);
                                        thisSubNode = thisSubNode.nextSibling;
                                    }
                                    selectEventProcess();
                                }
                            }else if(hasClass(thisTagItem,"top-tag")){
                                var theTopNode = getTagViewTopNode(thisTagItem.getAttribute("data-id"));
                                tagViewTopCheckFun(theTopNode,false,true);
                            }else if(hasClass(thisTagItem,"sub-tag")){
                                var theSubNode = getTagViewSubNode(thisTagList.children[1].getAttribute("data-id"),thisTagItem.getAttribute("data-id"));
                                tagViewTopCheckFun(theSubNode,false,true);
                            }
                        }
                    }else{
                        var thisNode = null;
                        if(e.target.nodeName === "DIV" && hasClass(e.target.parentNode,"doc-view")){
                            thisNode = e.target;
                        }else if(e.target.nodeName === "H3" && e.target.parentNode.nodeName === "DIV" || e.target.nodeName === "P"){
                            thisNode = e.target.parentNode;
                        }
                        if(thisNode !== null){
                            var thisDocNode = thisNode.parentNode;
                            var id = thisDocNode.parentNode.getAttribute("data-docId");
                            loadReaderView(id);
                        }
                    }
                };
                listView.addEventListener('click',listView_i);
            }
        };
    }

    function SetDocData_I(itemTmp){
        var view = View({"node":itemTmp.cloneNode(true)});
        var item = view.init();
        var dateTimeText = view.get(".doc-display-timeText");
        var tagList = view.get(".doc-tagItem-list");
        var tagIcons = tagList.querySelectorAll(".tag_icon");
        var docView = view.get(".doc-view");
        var topTagIcon = tagIcons[0];
        var subTagIcon = tagIcons[1];
        var topTagItem = topTagIcon.nextSibling;
        var tagItemTmp = topTagItem.cloneNode(true);
        var docId = "";
        var setTopTagItem = function(topData){
            var topTagIcon = topTagItem.previousSibling;
            topTagItem.setAttribute("data-id",topData.classId);
            topTagItem.children[0].innerText = topData.className;
            addClass(topTagItem,"top-tag");
            topTagIcon.querySelector("a").innerHTML = "&#xe83e;";
        };
        var getSubTagItem = function(subData){
            var newTag = tagItemTmp.cloneNode(true);
            newTag.setAttribute("data-id",subData.classId);
            newTag.children[0].innerText = subData.className;
            addClass(newTag,"sub-tag");
            return newTag;
        };
        return {
            "getItemByLoadData" : function(data){
                var backJson = {"node":item};
                backJson.docId = docId = data.docId;
                item.setAttribute("data-docId",docId);
                dateTimeText.innerText = data.createTime;
                backJson.docView = docView;
                return backJson;
            },"loadDocTag" : function(docTagList){
                if(docTagList.hasOwnProperty(docId)){
                    var thisData = docTagList[docId];
                    fetchArr(thisData,function(i){
                        var thisElement = thisData[i];
                        if(thisElement["numLen"] > 1){
                            setTopTagItem(thisElement);
                            removeClass(topTagIcon,"hide");
                        }else{
                            tagList.appendChild(getSubTagItem(thisElement));
                            removeClass(subTagIcon,"hide");
                        }
                    });
                }
            },"getItemByAddData" : function(data){
                docId = data.docId;
                item.setAttribute("data-docId",docId);
                dateTimeText.innerText = data.createTime;
                if(data.hasOwnProperty("class") && data.class.hasOwnProperty("top")){
                    setTopTagItem(data.class.top);
                    removeClass(topTagIcon,"hide");
                    if(data.class.hasOwnProperty("sub")){
                        fetchArr(data.class.sub,function(i){
                            tagList.appendChild(getSubTagItem(data.class.sub[i]));
                        });
                        removeClass(subTagIcon,"hide");
                    }
                }
                return item;
            }
        };
    }

    function ClsTag_I(){
        var tagView = conView.dimensions;
        var stateKey = "list";
        var topList = null;
        var freqList = null;
        var clsSelectList = null;
        var removeViewSelectedStyle = function(listKey){
            var clsList = null;
            switch(listKey){
                case 'top':
                    clsList = topList;
                    break;
                case 'freq':
                    clsList = freqList;
                    break;
            }
            var selectedItems = clsList.getElementsByClassName("selected");
            while(selectedItems.length > 0){
                removeClass(selectedItems[0],"selected");
            }
        };
        return {
            "setView" : function(topClsData,freqClsData,startTime,endTime){
                var thisContext = Context("tagView");
                controller.setGContext(thisContext);
                var topInterac = DocTopCls_I();
                var freqInterac = DocFreqCls_I(tagView);
                var docConditionInterac = DocCondition_I();
                docConditionInterac.setView();
                docConditionInterac.setTime(startTime,endTime);
                topInterac.setView(topClsData);
                freqInterac.setView(freqClsData);
                var topTagContext =  controller.getGContext("topTagView");
                var freqTagContext = controller.getGContext("freqTagView");
                topList = topTagContext.getTrait("list");
                freqList = controller.getGContext("freqTagView").getTrait("list");
                clsSelectList = controller.getGContext("conditionView").getTrait("clsSelectList");
                thisContext.setTrait("freqUnSelect",function(clsId){
                    var selectedFreqItems = freqList.getElementsByClassName("selected");
                    for(var i=0,len=selectedFreqItems.length;i<len;i++){
                        var thisItem = selectedFreqItems[i];
                        if(thisItem.getAttribute("data-id") === clsId){
                            removeClass(thisItem,"selected");
                            break;
                        }
                    }
                });
                thisContext.setTrait("setState",function(operKey){
                    var searchView = tagView.get(".doc-search-view");
                    var selectedTagViewNode = tagView.get(".doc-condition-view");
                    var topMultiCheckView = topTagContext.getTrait("multiCheckView");
                    var freqMultiCheckView = freqTagContext.getTrait("multiCheckView");
                    var topMultiCheckStyle = topTagContext.getTrait("multiCheckStyle");
                    var freqMultiCheckStyle = freqTagContext.getTrait("multiCheckStyle");
                    var setTopMultiCheck = topTagContext.getTrait("setMultiCheck");
                    var topMultiCheck = topTagContext.getTrait("multiCheckBox");
                    var freqMultiCheck = freqTagContext.getTrait("multiCheckBox");
                    var topRemoveEditStyle = topTagContext.getTrait("removeEditStyle");
                    switch(operKey){
                        case 'edit':
                            addClass(searchView,"hide");
                            addClass(selectedTagViewNode,"hide");
                            removeViewSelectedStyle("top");
                            removeViewSelectedStyle("freq");
                            addClass(topMultiCheckView,"hide");
                            addClass(freqMultiCheckView,"hide");
                            topMultiCheckStyle(false);
                            freqMultiCheckStyle(false);
                            topMultiCheck.checked ? setTopMultiCheck(false) : setTopMultiCheck(true);
                            if(freqMultiCheck.checked){
                                freqMultiCheckStyle(false);
                            }
                            break;
                        case 'list':
                            if(stateKey === 'edit'){
                                topMultiCheckStyle(false);
                                topRemoveEditStyle();
                                freqMultiCheckStyle(false);
                                topMultiCheck.checked = false;
                                freqMultiCheck.checked = false;
                            }
                            removeClass(searchView,"hide");
                            removeClass(selectedTagViewNode,"hide");
                            removeClass(topMultiCheckView,"hide");
                            removeClass(freqMultiCheckView,"hide");
                            break;
                    }
                    if(operKey !== 'recover'){
                        stateKey = operKey;
                    }
                });
                topInterac.event();
                freqInterac.event();
                docConditionInterac.event();
            },"event" : function(){
                var conditionContext = controller.getGContext("conditionView");
                var topClsContext = controller.getGContext("topTagView");
                var freqClsContext = controller.getGContext("freqTagView");
                var addClsListItem = conditionContext.getTrait("addClsListItem");
                var setAllFrag = conditionContext.getTrait("setAllFrag");
                var hideSubUl = topClsContext.getTrait("hideSubUl");
                var getTopItemNode = topClsContext.getTrait("getTopItemNode");
                var getSubItemNode = topClsContext.getTrait("getSubItemNode");
                var topMultiCheck = topClsContext.getTrait("multiCheckBox");
                var topMultiCheckFun = topClsContext.getTrait("multiCheckFun");
                var topMultiCheckStyle = topClsContext.getTrait("multiCheckStyle");
                var topEditCheckFun = topClsContext.getTrait("editCheckFun");
                var freqMultiCheck = freqClsContext.getTrait("multiCheckBox");
                var freqMultiCheckFun = freqClsContext.getTrait("multiCheckFun");
                var freqMultiCheckStyle = freqClsContext.getTrait("multiCheckStyle");
                var freqEditCheckFun = freqClsContext.getTrait("editCheckFun");
                var conditionMultiCheckFun = conditionContext.getTrait("multiCheckFun");
                var selectEventProcess = conditionContext.getTrait("selectEventProcess");
                controller.getGContext("tagView").setTrait("resetTopEditCheck",function(){
                    var checkedTopNode = topList.querySelector(".selected_color");
                    var checkInfo = topEditCheckFun(checkedTopNode,false);
                    var flexBtn = checkedTopNode.firstChild;
                    fetchArr(checkInfo,function(i){
                        freqEditCheckFun(checkInfo[i]);
                    });
                    removeClass(checkedTopNode.parentNode,"show");
                    if(flexBtn.innerText === '-'){
                        flexBtn.innerText = '+';
                    }
                });
                var topDoSelect = function(clsId,clsName,getTopId){
                    var newItem = document.createElement("li");
                    newItem.innerHTML = "<a>"+clsName+"</a>";
                    newItem.setAttribute("data-id",clsId);
                    var isTop = false;
                    if(typeof getTopId === "function"){
                        var topId = getTopId();
                        if(topId !== null){
                            newItem.setAttribute("data-topId",topId);
                        }else{
                            isTop = true;
                        }
                    }
                    setAllFrag(false);
                    clsSelectList.innerHTML = "";
                    addClsListItem(newItem,isTop);
                    if(freqMultiCheck.checked){
                        freqMultiCheckStyle(false);
                        freqMultiCheck.checked = false;
                    }
                    selectEventProcess();
                };
                var topDoMultiCheck = function(checkedNode,isCheck,conditionFlag){
                    var freqFlag = false;
                    if(freqMultiCheck.checked){
                        freqFlag = true;
                    }
                    var checkInfo = topMultiCheckFun(checkedNode,isCheck,conditionFlag,freqFlag);
                    if(conditionFlag){
                        conditionMultiCheckFun(checkInfo.condition);
                    }
                    if(freqFlag){
                        freqMultiCheckFun(checkInfo.freq,conditionFlag);
                    }
                };
                var topCheckFun = function(thisNode,isCheck,freqflag){
                    var thisContext = controller.topContext();
                    var thisKey = thisContext.getKey();
                    if(thisKey === 'addDoc' || thisKey === 'editDoc'){
                        var checkInfo = topEditCheckFun(thisNode,isCheck);
                        var thisId = thisNode.getAttribute("data-id");
                        fetchArr(checkInfo,function(i){
                            var info = null;
                            var thisCheckInfo = checkInfo[i];
                            if(freqflag){
                                freqEditCheckFun(thisCheckInfo);
                            }
                            if(thisCheckInfo["key"] === 'add'){
                                if(thisCheckInfo.hasOwnProperty("topId")){
                                    if(thisId === thisCheckInfo["topId"]){
                                        var newTag = thisNode.cloneNode(false);
                                        newTag.innerHTML = "<a>"+thisNode.firstChild.lastChild.firstChild.innerText+"</a>";
                                        info = {"key":"add","top":newTag};
                                    }else{
                                        var topNode = thisNode.parentNode.parentNode;
                                        if(topNode.getAttribute("data-id") === thisCheckInfo["topId"]){
                                           var newTag = topNode.cloneNode(false); 
                                           newTag.innerHTML = "<a>"+topNode.firstChild.lastChild.innerText+"</a>";
                                           info = {"key":"add","top":newTag};
                                        }
                                    }

                                }else if(thisCheckInfo.hasOwnProperty("subId")){
                                    var newTag = thisNode.cloneNode(false);
                                    var topNode = thisNode.parentNode.parentNode;
                                    newTag.setAttribute("data-topId",topNode.getAttribute("data-id"));
                                    newTag.innerHTML = "<a>"+thisNode.firstChild.lastChild.firstChild.innerText+"</a>";
                                    info = {"key":"add","sub":newTag};
                                }
                            }else if(thisCheckInfo["key"] === 'remove'){
                                if(thisCheckInfo.hasOwnProperty("topId")){
                                    info = {"key":"remove","topId":thisCheckInfo["topId"]};
                                }else if(thisCheckInfo.hasOwnProperty("subId")){
                                    info = {"key":"remove","subId":thisCheckInfo["subId"]};
                                }
                            }
                            if(info !== null){
                                thisContext.getTrait("tagItemFun")(info);
                            }
                        });
                    }else if(topMultiCheck.checked){
                        topDoMultiCheck(thisNode,isCheck,true);
                    }else{
                        var clsName = hasClass(thisNode.parentNode,"topCls-display-list") ? thisNode.firstChild.lastChild.firstChild.innerText : thisNode.firstChild.lastChild.innerText;
                        topDoSelect(thisNode.getAttribute("data-id"),clsName,function(){
                            return thisNode.parentNode !== topList ? thisNode.parentNode.parentNode.getAttribute("data-id") : null;
                        });
                    }
                };
                controller.getGContext("tagView").setTrait("topCheckFun",topCheckFun);
                controller.getGContext("tagView").setTrait("topDoMultiCheck",topDoMultiCheck);
                controller.getGContext("tagView").setTrait("clearCheckStyle",function(){
                    var onShowItem = topList.querySelector(".show");
                    var firstTagItem = clsSelectList.children[0];
                    if(freqMultiCheck.checked){
                        freqMultiCheckStyle(false);
                        freqMultiCheck.checked = false;
                    }
                    if(topMultiCheck.checked){
                        topMultiCheckStyle(false);
                        topMultiCheck.checked = false;
                    }
                    if(onShowItem !== null){
                        removeClass(onShowItem,"show");
                        onShowItem.firstChild.firstChild.innerText = '+';
                    }
                    if(firstTagItem.getAttribute("data-id") === "all"){
                        setAllFrag(false);
                    }else{
                        clsSelectList.innerHTML = "";
                    }
                });
                controller.getGContext("tagView").setTrait("topDoSelect",topDoSelect);
                topList.addEventListener("click",function(e){
                    var thisNode = null;
                    var target = e.target;
                    if(target.nodeName === 'SPAN'){
                        thisNode = target.parentNode;
                        var thisNodeParent = thisNode.parentNode;
                        if(thisNode.nodeName === "LI"){
                            if(thisNodeParent === topList){
                                if(hasClass(thisNode,"show")){
                                    removeClass(thisNode,"show");
                                    target.firstChild.innerText = "+";
                                }else{
                                    addClass(thisNode,"show");
                                    target.firstChild.innerText = "-";
                                    hideSubUl(thisNode);
                                }
                            }else if(topMultiCheck.checked){
                                topDoMultiCheck(thisNode,false,true);
                            }
                        }else if(thisNode.nodeName === 'A'){
                            topCheckFun(thisNodeParent.parentNode,false,true);
                        }
                    }else if(target.nodeName === 'A'){
                        thisNode = target.parentNode.parentNode;
                        if(target.nextSibling && target.nextSibling.nodeName === 'A'){
                            if(hasClass(thisNode,"show")){
                                removeClass(thisNode,"show");
                                target.innerText = "+";
                            }else{
                                addClass(thisNode,"show");
                                target.innerText = "-";
                                hideSubUl(thisNode);
                            }
                        }else{
                            topCheckFun(thisNode,false,true);
                        }
                    }else if(target.nodeName === 'INPUT'){
                        topCheckFun(target.parentNode.parentNode,true,true);
                    }
                });
                freqList.addEventListener("click",function(e){
                    var doSelect = function(thisNode){
                        var newItem = thisNode.cloneNode(true);
                        newItem.setAttribute("data-topId",thisNode.getAttribute("data-topId"));
                        newItem.setAttribute("data-id",thisNode.getAttribute("data-id"));
                        setAllFrag(false);
                        clsSelectList.innerHTML = "";
                        addClsListItem(newItem);
                        if(topMultiCheck.checked){
                            topMultiCheckStyle(false);
                            topMultiCheck.checked = false;
                        }
                        selectEventProcess();
                    };
                    if(e.target.nodeName === 'A'){
                        var thisContext = controller.topContext();
                        var thisKey = thisContext.getKey();
                        var thisNode = e.target.parentNode;
                        var keyFlag = (thisKey === 'addDoc' || thisKey === 'editDoc') ? true : false;
                        if(keyFlag){
                            if(hasClass(thisNode,"selected")){
                                var subNode = topClsContext.getTrait("getSubItemNode")(thisNode.getAttribute("data-topId"),thisNode.getAttribute("data-id"));
                                topCheckFun(subNode,false,false);
                                removeClass(thisNode,"selected");
                            }else{
                                var selectedFreqItems = freqList.getElementsByClassName("selected");
                                var subNode = topClsContext.getTrait("getSubItemNode")(thisNode.getAttribute("data-topId"),thisNode.getAttribute("data-id"));
                                if(selectedFreqItems.length < 3){
                                    var selectedTopItems = topList.getElementsByClassName("selected");
                                    if(selectedTopItems.length > 0 && selectedTopItems[0].getAttribute("topId") !== thisNode.getAttribute("topId")){
                                        fetchArr(selectedTopItems,function(i){
                                            removeClass(selectedTopItems[i],"selected");
                                        });
                                    }
                                    topCheckFun(subNode,false,false);
                                    addClass(thisNode,"selected");
                                }else{
                                    alert("three tag limit!");
                                }
                            }
                        }else if(!keyFlag){
                            if(freqMultiCheck.checked){
                                var freqCheckInfo = {"subId":thisNode.getAttribute("data-id")};
                                freqCheckInfo.key = hasClass(thisNode,"selected") ? "remove" : "add";
                                var res = freqMultiCheckFun(freqCheckInfo,true);
                                if(res !== null && typeof res === 'object'){
                                    conditionMultiCheckFun(res);
                                }
                                if(topMultiCheck.checked){
                                    var thisTopItem = topClsContext.getTrait("getTopItemNode")(thisNode.getAttribute("data-topId"));
                                    var thisSubItems = thisTopItem.querySelector("ul").children;
                                    for(var i=0,len=thisSubItems.length;i<len;i++){
                                        var thisSubItem = thisSubItems[i];
                                        if(thisSubItem.getAttribute("data-id") === thisNode.getAttribute("data-id")){
                                            var checkInfo = topMultiCheckFun(thisSubItem,false,true,false);
                                            conditionMultiCheckFun(checkInfo.condition);
                                            break;
                                        }
                                    }
                                }
                            }else{
                                doSelect(thisNode);
                            }
                        }
                    }
                });
                clsSelectList.addEventListener("click",function(e){
                    if(e.target.nodeName !== 'UL'){
                        var thisNode = null;
                        if(e.target.nodeName === 'li'){
                            thisNode = e.target;
                        }else if(e.target.nodeName === 'A'){
                            thisNode = e.target.parentNode;
                        }else if(e.target.nodeName === 'SPAN'){
                            thisNode = e.target.parentNode.parentNode;
                        }
                        if(thisNode !== null && thisNode.hasAttribute("data-id")){
                            var thisId = thisNode.getAttribute("data-id");
                            if(thisId !== "all"){
                                var removedFlag = false;
                                if(thisNode.hasAttribute("data-topId")){
                                    if(topMultiCheck.checked){
                                        var subNode = getSubItemNode(thisNode.getAttribute("data-topId"),thisId);
                                        if(subNode !== null){
                                            var checkInfo = topMultiCheckFun(subNode,false,true,false);
                                            conditionMultiCheckFun(checkInfo.condition);
                                            removedFlag = true;
                                        }
                                    }
                                    if(freqMultiCheck.checked){
                                        freqMultiCheckFun({"key":"remove","subId":thisId},false);
                                    }
                                }else{
                                    if(topMultiCheck.checked){
                                        var topNode = getTopItemNode(thisId);
                                        if(topNode !== null){
                                            var checkInfo = topMultiCheckFun(topNode,false,true,false);
                                            conditionMultiCheckFun(checkInfo.condition);
                                            removedFlag = true;
                                        }
                                    }
                                    if(freqMultiCheck.checked){
                                        freqMultiCheckFun({"key":"remove","topId":thisId},true);
                                    }
                                }
                                if(!removedFlag){
                                    clsSelectList.removeChild(thisNode);
                                }
                                setAllFrag(true);
                            }
                        }
                    }
                });
            }
        };
    };

    function DocCondition_I(){
        var selectView = conView.condition;
        var tagViews = selectView.querySelectorAll(".tag_content");
        var selectTrigger = selectView.querySelector(".triggerBtn");
        var clsSelectList = selectView.querySelector(".cls-select-list");
        var dateTimeList = selectView.querySelector(".dateTime-display-list");
        var timeSelectList = selectView.querySelector(".time-select-list");
        var timeInputs = dateTimeList.querySelectorAll("input");
        var startTimeInput = timeInputs[0];
        var endTimeInput = timeInputs[1];
        var allSelectTag = clsSelectList.firstChild;
        var deleteCompTmp = clsSelectList.removeChild(clsSelectList.lastChild).lastChild.cloneNode(true);
        var allSelectFrag = document.createDocumentFragment();
        var nowCondition = {};
        nowCondition.info = null;
        var checkList = function(clsId){
            var items = clsSelectList.children;
            var flag = true;
            for(var i=0,len=items.length;i<len;i++){
                var thisItem = items[i];
                if(thisItem.getAttribute("data-id") === clsId){
                    flag = false;
                    break;
                }
            }
            return flag;
        };
        var addItemDeleteStyle = function(itemNode){
            itemNode.appendChild(deleteCompTmp.cloneNode(true));
        };
        var subItemIsAllChecked = function(ulNode){
            var subChecks = ulNode.querySelectorAll("input");
            var flag = true;
            for(var i=0,len=subChecks.length;i<len;i++){
                if(subChecks[i].checked === false){
                    flag = false;
                    break;
                }
            }
            return flag;
        };
        var subItemAllCheck = function(topNode,flag){
            var thisChecks = topNode.querySelector("ul").querySelectorAll("input");
            var checkFun = flag ? function(thisCheck){
                if(!thisCheck.checked){
                    thisCheck.checked = true;
                }
            } : function(thisCheck){
                if(thisCheck.checked){
                    thisCheck.checked = false;
                }
            };
            fetchArr(thisChecks,function(i){
                checkFun(thisChecks[i]);
            });
        };
        var setAllFrag = function(flag){
            if(flag){
                if(clsSelectList.innerHTML.length === 0){
                    clsSelectList.appendChild(allSelectFrag);
                }
            }else if(allSelectTag.parentNode === clsSelectList){
                allSelectFrag.appendChild(allSelectTag);
            }
        };
        var removeSubItemByTopId = function(topId){
            var subClsItems = clsSelectList.querySelectorAll(".subTag");
            for(var i=0,len=subClsItems.length;i<len;i++){
                var thisItem = subClsItems[i];
                if(thisItem.getAttribute("data-topId") === topId){
                    clsSelectList.removeChild(thisItem);
                }
            }
            setAllFrag(true);
        };
        var addClsListItem = function(selectTagItem,isTop){
            if(checkList(selectTagItem.getAttribute("data-id"))){
                addItemDeleteStyle(selectTagItem);
                if(allSelectTag.parentNode === clsSelectList){
                    setAllFrag(false);
                }
                if(!selectTagItem.hasAttribute("data-topId") && isTop){
                    addClass(selectTagItem,"solid_border");
                    clsSelectList.insertBefore(selectTagItem,clsSelectList.firstChild);
                    removeSubItemByTopId(selectTagItem.hasAttribute("data-id"));
                }else{
                    addClass(selectTagItem,"subTag");
                    clsSelectList.appendChild(selectTagItem);
                }
                return true;
            }else{
                return false;
            }
        };
        var removeClsListItem = function(key,id){
            if(key === 'top'){
                var topClsItems = clsSelectList.querySelectorAll(".solid_border");
                for(var i=0,len=topClsItems.length;i<len;i++){
                    var thisItem = topClsItems[i];
                    if(thisItem.getAttribute("data-id") === id){
                        clsSelectList.removeChild(thisItem);
                        break;
                    }
                }
            }else if(key === 'sub'){
                var subClsItems = clsSelectList.querySelectorAll(".subTag");
                for(var i=0,len=subClsItems.length;i<len;i++){
                    var thisItem = subClsItems[i];
                    if(thisItem.getAttribute("data-id") === id){
                        clsSelectList.removeChild(thisItem);
                        break;
                    }
                }
            }
            setAllFrag(true);
        };
        var getSubItems = function(topId){
            var topItems = clsSelectList.querySelectorAll(".solid_border");
            var subTagItems = clsSelectList.querySelectorAll(".subTag");
            var subItemsArr = new Array();
            var topFlag = false;
            if(clsSelectList.children[0].getAttribute("data-id") === 'all'){
                return "all";
            }else{
                for(var i=0,len=topItems.length;i<len;i++){
                    var thisTopItem = topItems[i];
                    if(thisTopItem.getAttribute("data-id") === topId){
                        topFlag = true;
                        break;
                    }
                }
                if(topFlag){
                    fetchArr(subTagItems,function(i){
                        var thisSubItem = subTagItems[i];
                        if(thisSubItem.getAttribute("data-topId") === topId){
                            subItemsArr.push(subTagItems[i].getAttribute("data-id"));
                        }
                    });
                    return subItemsArr;
                }else{
                    return null;
                }
            }
        };
        var multiCheckFun = function(checkJsonArr){
            fetchArr(checkJsonArr,function(i){
                var checkJson = checkJsonArr[i];
                if(checkJson.hasOwnProperty("key")){
                    var key = checkJson["key"];
                    if(key === 'add' && checkJson.hasOwnProperty("item")){
                        checkJson.hasOwnProperty("isTop") ? addClsListItem(checkJson["item"],true) : addClsListItem(checkJson["item"]);
                    }else if(key === 'remove' && checkJson.hasOwnProperty("type")){
                        var type = checkJson["type"];
                        if(type === 'single'){
                            if(checkJson.hasOwnProperty("topId")){
                                removeClsListItem("top",checkJson["topId"]);
                            }else if(checkJson.hasOwnProperty("subId")){
                                removeClsListItem("sub",checkJson["subId"]);
                            }
                        }else if(type === 'multi' && checkJson.hasOwnProperty("topId")){
                            removeSubItemByTopId(checkJson["topId"]);
                        }
                    }
                }
            });
        };
        var compareDate = function(start,end){
            var startTime = new Date(Date.parse(start));
            var endTime = new Date(Date.parse(end));
            return startTime <= endTime;
        };
        var checkClsId = function(clsId){
            var selectItem = clsSelectList.querySelector("li[data-id=\""+clsId+"\"]");
            if(selectItem === null){
                return clsSelectList.querySelector("li[data-id=\"all\"]") === null ? false : true;
            }else{
                return true;
            }
        };
        var getConditionInfo = function(){
            var startTime = startTimeInput.value;
            var endTime = endTimeInput.value;
            var startTimeCheck = timeSelectList.querySelector("input[value=\"0\"]");
            if(compareDate(startTime,endTime)){
                var tagItems = clsSelectList.children;
                var tagIds = new Array();
                var data = {};
                fetchArr(tagItems,function(i){
                    tagIds.push(tagItems[i].getAttribute("data-id"));
                });
                data.classIds = tagIds;
                data.date = {"start":startTime,"end":endTime};
                data.timeType = startTimeCheck.checked ? 0 : 1;
                return data;
            }else{
                return null;
            }
        };
        var checkListFun = function(target){
            if(target.nodeName !== 'ul'){
                var thisCheck = null;
                if(target.nodeName === 'LI'){
                    thisCheck = target.firstChild;
                }else if(target.nodeName === 'INPUT'){
                    thisCheck = target;
                }else if(target.nodeName === 'SPAN'){
                    thisCheck = target.previousSibling;
                }
                if(thisCheck !== null){
                    if(target.nodeName !== 'INPUT' && !thisCheck.checked){
                        thisCheck.checked = true;
                    }
                }
            }
        };
        return {
            "setView" : function(){
                var thisContext = Context("conditionView");
                thisContext.setTrait("addClsListItem",addClsListItem);
                thisContext.setTrait("statusTagView",tagViews[1]);
                thisContext.setTrait("clsSelectList",clsSelectList);
                thisContext.setTrait("setAllFrag",setAllFrag);
                thisContext.setTrait("getSubItems",getSubItems);
                thisContext.setTrait("subItemIsAllChecked",subItemIsAllChecked);
                thisContext.setTrait("subItemAllCheck",subItemAllCheck);
                thisContext.setTrait("removeClsListItem",removeClsListItem);
                thisContext.setTrait("removeSubItemByTopId",removeSubItemByTopId);
                thisContext.setTrait("multiCheckFun",multiCheckFun);
                thisContext.setTrait("condition",nowCondition);
                controller.setGContext(thisContext);
            },"setTime" : function(startTime,endTime){
                startTimeInput.value = startTime !== null ? startTime : endTime;
                endTimeInput.value = endTime;
            },"event" : function(){
                var docListContext = controller.getGContext("docList");
                var loadDataContext = docListContext.getTrait("loadDataContext");
                var contentShift = controller.getGContext("sectionTouchMove").getTrait("contentShift");
                var selectEventProcess = function(clsId){
                    var exFlag = true;
                    if(typeof clsId === "string"){
                        exFlag = checkClsId(clsId);
                    }
                    if(exFlag){
                        var resetDocList = docListContext.getTrait("resetList");
                        nowCondition.info = getConditionInfo();
                        loadDataContext.setNum(0);
                        loadDataContext.setReqData(getConditionInfo());
                        loadDataContext.process(function(res){
                            if(res){
                                var resData = JSON.parse(res);
                                parseInt(resData.countDoc) > 0 ? resetDocList(resData) : docListContext.getTrait("emptyInfoDisplay")();
                                contentShift(1,0);
                            }else{
                                resetDocList();
                            }
                        });
                    }
                };
                controller.getGContext("conditionView").setTrait("selectEventProcess",selectEventProcess);
                timeSelectList.addEventListener("click",function(e){
                    checkListFun(e.target);
                });
                selectTrigger.addEventListener("click",function(){
                    selectEventProcess();
                });
            }
        };
    };

    function DocTopCls_I(){
        var topClassifyView = conView.topClassify;
        var countFolderNode = topClassifyView.querySelector(".count-folder");
        var multiCheckView = topClassifyView.querySelector(".topCls-select-check");
        var classViewTrigger = topClassifyView.querySelector(".class-view-trigger");
        var listNode = topClassifyView.querySelector(".topCls-display-list");
        var multiCheckBox = multiCheckView.querySelector("input");
        var topFectory = function(topId,topName){
            var newTopNode = document.createElement("LI");
            newTopNode.setAttribute("data-id",topId);
            newTopNode.innerHTML = "<span><a>+</a><a><span>"+topName+"</span></a></span><ul></ul>";
            return newTopNode;
        };
        var getTopItemNode = function(clsId){
            var items = listNode.children;
            var node = null;
            for(var i=0,len=items.length;i<len;i++){
                var thisItem = items[i];
                if(thisItem.getAttribute("data-id") === clsId){
                    node = thisItem;
                    break;
                }
            }
            return node;
        };
        var getSubItemNode = function(topId,subId){
            var thisTopItem = getTopItemNode(topId);
            var thisSubItems = thisTopItem.querySelector("ul").children;
            var subNode = null;
            for(var i=0,len=thisSubItems.length;i<len;i++){
                var thisSubItem = thisSubItems[i];
                if(thisSubItem.getAttribute("data-id") === subId){
                    subNode = thisSubItem;
                    break;
                }
            }
            return subNode;
        };
        var getTopClsJson = function(clsListData){
            var topDataList = new Array();
            var topStack = new Array();
            fetchArr(clsListData,function(i){
                var thisData = clsListData[i];
                var thisJson = {"classId":thisData["classId"],"className":thisData["className"]};
                var thisLeftNum = parseInt(thisData["leftNum"]);
                var thisRightNum = parseInt(thisData["rightNum"]);
                if((thisRightNum-thisLeftNum)>1){
                    topDataList.push(thisJson);
                    topStack.push(thisData);
                }else if((thisData["rightNum"]-thisData["leftNum"]) === 1){
                    var topStackData = topStack[topStack.length-1];
                    var topRightNum = parseInt(topStackData["rightNum"]);
                    var topJson = topDataList[topDataList.length-1];
                    if(typeof topJson.subClsList === 'undefined'){
                        topJson.subClsList = new Array();
                    }
                    if(topRightNum>thisRightNum){
                        topJson.subClsList.push(thisJson);
                    }else{
                        topDataList.push(thisJson);
                        topStack.push(thisData);
                    }
                }
            });
            return topDataList;
        };
        var setList = function(topListData){
            var listData = getTopClsJson(topListData);
            var listDataLen = listData.length;
            if(listDataLen > 0){
                if(listNode.innerText.length > 0){
                    listNode.innerText = "";
                }
                var topFrag = document.createDocumentFragment();
                var subFrag = document.createDocumentFragment();
                fetchArr(listData,function(i){
                    var thisTopData = listData[i];
                    var newTopNode = topFectory(thisTopData.classId,thisTopData.className);
                    var newTopNameNode = newTopNode.querySelector("span").lastChild;
                    var thisUl = newTopNode.querySelector("ul");
                    if(thisTopData.hasOwnProperty("subClsList")){
                        var subClsList = thisTopData.subClsList;
                        var len = subClsList.length;
                        var countStr = len > 0 ? len+"项" : "空";
                        fetchArr(subClsList,function(i){
                            var thisSubData = subClsList[i];
                            var newSubNode = document.createElement("LI");
                            newSubNode.setAttribute("data-id",thisSubData.classId);
                            newSubNode.innerHTML = '<span><input type="checkBox" class="hide"><a>'+thisSubData.className+'</a></span>';
                            subFrag.appendChild(newSubNode);
                        });
                        newTopNameNode.innerHTML = newTopNameNode.innerHTML+"<span>"+countStr+"</span>";
                        thisUl.appendChild(subFrag);
                    }else{
                        newTopNameNode.innerHTML = newTopNameNode.innerHTML+"<span>空</span>";
                    }
                    topFrag.appendChild(newTopNode);
                });
                listNode.appendChild(topFrag);
                countFolderNode.innerText = listDataLen+"项";
                removeClass(multiCheckView,"hide");
            }else{
                countFolderNode.innerText = "空";
            }
        };
        var hideSubUl = function(thisNode){
            var topItems = listNode.children;
            fetchArr(topItems,function(i){
                var thisTopItem = topItems[i];
                if(thisNode !== thisTopItem){
                    var flexBtn = thisTopItem.firstChild.firstChild;
                    removeClass(thisTopItem,"show");
                    if(flexBtn.innerText === '-'){
                        flexBtn.innerText = '+';
                    }
                }
            });
        };
        var multiCheckFun = function(itemNode,isCheck,conditionFlag,freqFlag){
            var conditionContext = controller.getGContext("conditionView");
            var checkInfo = {"freq":null,"condition":new Array()};
            if(itemNode.parentNode === listNode){
                var subItemAllCheck = conditionContext.getTrait("subItemAllCheck");
                var topId = itemNode.getAttribute("data-id");
                if(hasClass(itemNode.firstChild,"selected_color")){
                    removeClass(itemNode.firstChild,"selected_color");
                    subItemAllCheck(itemNode,false);
                    if(conditionFlag){
                        checkInfo.condition.push({"key":"remove","type":"single","topId":topId});
                    }
                    if(freqFlag){
                        checkInfo.freq = {"key":"remove","topId":topId};
                    }
                }else{
                    subItemAllCheck(itemNode,true);
                    if(conditionFlag){
                        var selectItemNode = document.createElement("li");
                        selectItemNode.innerHTML = "<a>"+itemNode.firstChild.lastChild.firstChild.innerText+"</a>";
                        addClass(itemNode.firstChild,"selected_color");
                        selectItemNode.setAttribute("data-id",topId);
                        checkInfo.condition.push({"key":"remove","type":"multi","topId":topId});
                        checkInfo.condition.push({"key":"add","item":selectItemNode,"isTop":true});
                    }
                    if(freqFlag){
                        checkInfo.freq = {"key":"add","topId":topId};
                    }
                }
            }else{
                var topTagNode = itemNode.parentNode.parentNode;
                var topId = topTagNode.getAttribute("data-id");
                var subItemIsAllChecked = conditionContext.getTrait("subItemIsAllChecked");
                var thisSubUl = topTagNode.querySelector("ul");
                var thisCheck = itemNode.firstChild.firstChild;
                if(!isCheck && thisCheck.checked || isCheck && !thisCheck.checked){
                    var subId = itemNode.getAttribute("data-id");
                    if(!isCheck){
                        thisCheck.checked = false;
                    }
                    if(hasClass(topTagNode.firstChild,"selected_color")){
                        removeClass(topTagNode.firstChild,"selected_color");
                        if(conditionFlag){
                            var subNodes = thisSubUl.children;
                            checkInfo.condition.push({"key":"remove","type":"single","topId":topId});
                            fetchArr(subNodes,function(i){
                                var thisSubNode = subNodes[i];
                                if(thisSubNode !== itemNode){
                                    var thisSelectNode = document.createElement("li");
                                    var thisSubId = thisSubNode.getAttribute("data-id");
                                    thisSelectNode.innerHTML = "<a>"+thisSubNode.firstChild.lastChild.innerText+"</a>";
                                    thisSelectNode.setAttribute("data-topId",topId);
                                    thisSelectNode.setAttribute("data-id",thisSubId);
                                    checkInfo.condition.push({"key":"add","item":thisSelectNode});
                                }
                            });
                        }
                        if(freqFlag){
                            checkInfo.freq = {"key":"remove","subId":subId};
                        }
                    }else{
                        if(conditionFlag){
                            if(hasClass(topTagNode.firstChild,"selected_color")){
                                checkInfo.condition.push({"key":"remove","type":"single","topId":topId});
                            }
                            checkInfo.condition.push({"key":"remove","type":"single","subId":subId});
                        }
                        if(freqFlag){
                            checkInfo.freq = {"key":"remove","subId":subId};
                        }
                    }
                }else if(isCheck && thisCheck.checked || !isCheck && !thisCheck.checked){
                    var selectItemNode = document.createElement("li");
                    if(!isCheck){
                        thisCheck.checked = true;
                    }
                    if(subItemIsAllChecked(thisSubUl)){
                        addClass(topTagNode.firstChild,"selected_color");
                        if(conditionFlag){
                            selectItemNode.setAttribute("data-id",topId);
                            selectItemNode.innerHTML = "<a>"+topTagNode.firstChild.lastChild.firstChild.innerText+"</a>";
                            checkInfo.condition.push({"key":"remove","type":"multi","topId":topId});
                            checkInfo.condition.push({"key":"add","item":selectItemNode,"isTop":true});
                        }
                        if(freqFlag){
                            checkInfo.freq = {"key":"add","topId":topId};
                        }
                    }else{
                        var subId = itemNode.getAttribute("data-id");
                        if(conditionFlag){
                            selectItemNode.setAttribute("data-topId",topId);
                            selectItemNode.setAttribute("data-id",subId);
                            selectItemNode.innerHTML = "<a>"+itemNode.firstChild.lastChild.innerText+"</a>";
                            checkInfo.condition.push({"key":"add","item":selectItemNode});
                        }
                        if(freqFlag){
                            checkInfo.freq = {"key":"add","subId":subId};
                        }
                    }
                }
            }
            return checkInfo;
        };
        var multiCheckStyle = function(flag,selectList){
            var checkBoxs = listNode.querySelectorAll("input");
            if(flag){
                var topItems = selectList.querySelectorAll(".solid_border");
                var subItems = selectList.querySelectorAll(".subTag");
                fetchArr(topItems,function(i){
                    var thisTopNode = getTopItemNode(topItems[i].getAttribute("data-id"));
                    var subCheckBoxes = thisTopNode.querySelectorAll("input");
                    fetchArr(subCheckBoxes,function(i){
                        subCheckBoxes[i].checked = true;
                    });
                    addClass(thisTopNode.firstChild,"selected_color");
                });
                fetchArr(subItems,function(i){
                    var thisSubItem = subItems[i];
                    var thisCheck = getSubItemNode(thisSubItem.getAttribute("data-topId"),thisSubItem.getAttribute("data-id")).firstChild.firstChild;
                    thisCheck.checked = true;
                });
                fetchArr(checkBoxs,function(i){
                    removeClass(checkBoxs[i],"hide");
                });
            }else{
                var topNodes = listNode.querySelectorAll(".selected_color");
                fetchArr(topNodes,function(i){
                    removeClass(topNodes[i],"selected_color");
                });
                fetchArr(checkBoxs,function(i){
                    var thisCheck = checkBoxs[i];
                    if(thisCheck.checked){
                        thisCheck.checked = false;
                    }
                    addClass(thisCheck,"hide");
                });
            }
        };
        var setMultiCheck = function(flag){
            var checkBoxs = listNode.querySelectorAll("input");
            if(flag){
                fetchArr(checkBoxs,function(i){
                    removeClass(checkBoxs[i],"hide");
                });
            }else{
                var topTexts = listNode.querySelectorAll(".selected_color");
                fetchArr(topTexts,function(i){
                    removeClass(topTexts[i],"selected_color");
                });
                fetchArr(checkBoxs,function(i){
                    var thisCheck = checkBoxs[i];
                    if(thisCheck.checked){
                        thisCheck.checked = false;
                    }
                });
            }
        };
        var checkDisabledFun = function(checkBoxes,flag){
            if(flag){
                fetchArr(checkBoxes,function(i){
                    var thisCheck = checkBoxes[i];
                    if(!thisCheck.checked && !thisCheck.disabled){
                        thisCheck.disabled = true;
                    }
                });
            }else{
                fetchArr(checkBoxes,function(i){
                    var theCheck = checkBoxes[i];
                    if(!theCheck.checked && theCheck.disabled){
                        theCheck.disabled = false;
                    }
                });
            }
        };
        var removeSubCheckStyle = function(topNode){
            var subChecks = topNode.querySelector("ul").querySelectorAll("input");
            var checkBoxes = listNode.querySelectorAll("input");
            fetchArr(subChecks,function(i){
                var subCheck = subChecks[i];
                if(subCheck.checked){
                    subCheck.checked =false;
                }
            });
            checkDisabledFun(checkBoxes,false);
        };
        var editCheckFun = function(itemNode,isCheck){
            var checkBoxes = listNode.querySelectorAll("input");
            var countCheckedItem = function(subUl){
                var subItems = subUl.children;
                var count = 0;
                fetchArr(subItems,function(i){
                    if(subItems[i].firstChild.firstChild.checked){
                        count++;
                    }
                });
                return count;
            };
            var checkInfo = new Array();
            if(itemNode !== null){
                if(itemNode.parentNode !== listNode){
                    var thisCheck = itemNode.firstChild.firstChild;
                    if((!isCheck && !thisCheck.disabled && thisCheck.checked) || (isCheck && !thisCheck.checked)){
                        if(!isCheck){
                            thisCheck.checked = false;
                        }
                        if(countCheckedItem(itemNode.parentNode) < 3){
                            checkDisabledFun(checkBoxes,false);
                        }
                        checkInfo.push({"key":"remove","subId":itemNode.getAttribute("data-id")});
                    }else if((!isCheck && !thisCheck.disabled && !thisCheck.checked) || (isCheck && thisCheck.checked)){
                        var topNode = itemNode.parentNode.parentNode;
                        var selectedTopText = listNode.querySelector(".selected_color");
                        if(!isCheck){
                            thisCheck.checked = true;
                        }
                        if(countCheckedItem(itemNode.parentNode) >= 3){
                            checkDisabledFun(checkBoxes,true);
                        }
                        if(selectedTopText !== null){
                            var selectedTopItem = selectedTopText.parentNode;
                            if(selectedTopItem !== topNode){
                                removeSubCheckStyle(selectedTopItem);
                                removeClass(selectedTopText,"selected_color");
                                addClass(topNode.firstChild,"selected_color");
                                checkInfo.push({"key":"remove","topId":selectedTopItem.getAttribute("data-id")});
                            }
                        }else{
                            addClass(topNode.firstChild,"selected_color");
                        }
                        checkInfo.push({"key":"add","topId":topNode.getAttribute("data-id")});
                        checkInfo.push({"key":"add","subId":itemNode.getAttribute("data-id")});
                    }
                }else{
                    var selectedTopText = listNode.querySelector(".selected_color");
                    if(selectedTopText !== null){
                        var selectedTopItem = selectedTopText.parentNode;
                        if(selectedTopItem !== itemNode){
                            removeSubCheckStyle(selectedTopItem);
                            removeClass(selectedTopText,"selected_color");
                            addClass(itemNode.firstChild,"selected_color");
                            checkInfo.push({"key":"remove","topId":selectedTopItem.getAttribute("data-id")});
                            checkInfo.push({"key":"add","topId":itemNode.getAttribute("data-id")});
                        }else{
                            removeSubCheckStyle(itemNode);
                            removeClass(itemNode.firstChild,"selected_color");
                            checkInfo.push({"key":"remove","topId":itemNode.getAttribute("data-id")});
                        }
                    }else{
                        addClass(itemNode.firstChild,"selected_color");
                        checkInfo.push({"key":"add","topId":itemNode.getAttribute("data-id")});
                    }
                }
            }
            return checkInfo;
        };
        var removeEditStyle = function(){
            var checkBoxes = listNode.querySelectorAll("input");
            var selectedTopItem = listNode.querySelector(".show");
            fetchArr(checkBoxes,function(i){
                var thisCheck = checkBoxes[i];
                if(!thisCheck.checked && thisCheck.disabled){
                    thisCheck.disabled = false;
                }
            });
            if(selectedTopItem !== null){
                removeClass(selectedTopItem,"show");
                selectedTopItem.firstChild.firstChild.innerText = '+';
            }
        };
        return {
            "setView" : function(topListData){
                var thisContext = Context("topTagView");
                thisContext.setTrait("list",listNode);
                thisContext.setTrait("setList",setList);
                thisContext.setTrait("getTopItemNode",getTopItemNode);
                thisContext.setTrait("hideSubUl",hideSubUl);
                thisContext.setTrait("multiCheckFun",multiCheckFun);
                thisContext.setTrait("getSubItemNode",getSubItemNode);
                thisContext.setTrait("multiCheckStyle",multiCheckStyle);
                thisContext.setTrait("multiCheckBox",multiCheckBox);
                thisContext.setTrait("multiCheckView",multiCheckView);
                thisContext.setTrait("setMultiCheck",setMultiCheck);
                thisContext.setTrait("editCheckFun",editCheckFun);
                thisContext.setTrait("removeEditStyle",removeEditStyle);
                controller.setGContext(thisContext);
                setList(topListData);
            },"event" : function(){
                classViewTrigger.addEventListener("click",function(){
                    loadClassViewFun(function(clsId,clsName){
                        controller.getGContext("tagView").getTrait("topDoSelect")(clsId,clsName);
                    });
                });
                multiCheckBox.addEventListener("click",function(){
                    var conditionList = controller.getGContext("conditionView").getTrait("clsSelectList");
                    this.checked ? multiCheckStyle(true,conditionList) : multiCheckStyle(false);
                });
            }
        };
    };

    function DocFreqCls_I(){
        var freqClsView = conView.freqClassify;
        var countCommonNode = freqClsView.querySelector(".count-common");
        var multiCheckView = freqClsView.querySelector(".freqCls-select-check");
        var freqClsList = freqClsView.querySelector(".freqCls-display-list");
        var classViewTrigger = freqClsView.querySelector(".class-view-trigger");
        var multiCheckBox = multiCheckView.querySelector("input");
        var fectory = function(clsData){
            var newLi = document.createElement("li");
            var newA = document.createElement("a");
            newLi.appendChild(newA);
            if(clsData.hasOwnProperty("topId")){
                newLi.setAttribute("data-topId",clsData.topId);
            }
            newLi.setAttribute("data-id",clsData.classId);
            newA.innerText = clsData.className;
            return newLi;
        };
        var setList = function(freqClsListData){
            var listDataLen = freqClsListData.length;
            if(freqClsListData.length > 0){
                if(freqClsList.innerHTML.length > 0){
                    freqClsList.innerHTML = "";
                }
                var frag = document.createDocumentFragment();
                fetchArr(freqClsListData,function(i){
                    frag.appendChild(fectory(freqClsListData[i]));
                });
                freqClsList.appendChild(frag);
                countCommonNode.innerText = listDataLen+"项";
                removeClass(freqClsView,"hide");
            }else{
                if(freqClsList.innerHTML.length > 0){
                    freqClsList.innerHTML = "";
                }
                addClass(freqClsView,"hide");
            }
        };
        var addCheckedStyleBySubId = function(id){
            var freqTagItems = freqClsList.children;
            var item = null;
            for(var i=0,len=freqTagItems.length;i<len;i++){
                var thisFreqItem = freqTagItems[i];
                if(thisFreqItem.getAttribute("data-id") === id){
                    addClass(thisFreqItem,"selected");
                    item = thisFreqItem;
                    break;
                }
            }
            return item;
        };
        var addCheckedStyleByTopId = function(id){
            var freqTagItems = freqClsList.children;
            fetchArr(freqTagItems,function(i){
                var thisFreqItem = freqTagItems[i];
                if(thisFreqItem.getAttribute("data-topId") === id){
                    addClass(thisFreqItem,"selected");
                }
            });
        };
        var removeCheckedStyleBySubId = function(id){
            var selectedItems = freqClsList.querySelectorAll(".selected");
            var flag = false;
            for(var i=0,len=selectedItems.length;i<len;i++){
                var thisItem = selectedItems[i];
                if(thisItem.getAttribute("data-id") === id){
                    removeClass(thisItem,"selected");
                    flag = true;
                    break;
                }
            }
            return flag;
        };
        var removeCheckedStyleByTopId = function(id){
            var selectedItems = freqClsList.querySelectorAll(".selected");
            fetchArr(selectedItems,function(i){
                var thisItem = selectedItems[i];
                if(thisItem.getAttribute("data-topId") === id){
                    removeClass(thisItem,"selected");
                }
            });
        };
        var multiCheckFun = function(checkJson,conditionFlag){
            var res = null;
            if(checkJson.hasOwnProperty("key")){
                if(checkJson["key"] === 'add'){
                    if(checkJson.hasOwnProperty("topId")){
                        addCheckedStyleByTopId(checkJson["topId"]);
                        res = true;
                    }else if(checkJson.hasOwnProperty("subId")){
                        var item = addCheckedStyleBySubId(checkJson["subId"]);
                        if(item !== null && conditionFlag){
                            var cloneItem = item.cloneNode(true);
                            removeClass(cloneItem,"selected");
                            res = new Array();
                            res.push({"key":"add","item":cloneItem});
                        }
                    }
                }else if(checkJson["key"] === 'remove'){
                    if(checkJson.hasOwnProperty("topId")){
                        removeCheckedStyleByTopId(checkJson["topId"]);
                        res = true;
                    }else if(checkJson.hasOwnProperty("subId")){
                        var subId = checkJson["subId"];
                        if(removeCheckedStyleBySubId(subId) && conditionFlag){
                            res = new Array();
                            res.push({"key":"remove","type":"single","subId":subId});
                        }
                    }
                }
            }
            return res;
        };
        var multiCheckStyle = function(flag,selectList){
            var thisNodes = freqClsList.children;
            if(flag){
                var topItems = selectList.querySelectorAll(".solid_border");
                var subItems = selectList.querySelectorAll(".subTag");
                fetchArr(topItems,function(i){
                    var thisTopId = topItems[i].getAttribute("data-id");
                    fetchArr(thisNodes,function(j){
                        var thisNode = thisNodes[j];
                        if(thisNode.getAttribute("data-topId") === thisTopId){
                            addClass(thisNode,"selected");
                        }
                    });
                });
                fetchArr(subItems,function(i){
                    var thisSubId = subItems[i].getAttribute("data-id");
                    for(var j=0,len=thisNodes.length;i<len;i++){
                        var thisNode = thisNodes[j];
                        if(thisNode.getAttribute("data-id") === thisSubId){
                            addClass(thisNode,"selected");
                            break;
                        }
                    };
                });
            }else{
                fetchArr(thisNodes,function(i){
                    removeClass(thisNodes[i],"selected");
                });
            }
        };
        var editCheckFun = function(checkInfo){
            var freqItems = freqClsList.children;
            if(checkInfo.hasOwnProperty("key")){
                var key = checkInfo["key"];
                if(key === 'add'){
                    var subId = checkInfo["subId"];
                    for(var i=0,len=freqItems.length;i<len;i++){
                        var thisItem = freqItems[i];
                        if(thisItem.getAttribute("data-id") === subId){
                            addClass(thisItem,"selected");
                            break;
                        }
                    }
                }else if(key === 'remove'){
                    if(checkInfo.hasOwnProperty("subId")){
                        var subId = checkInfo["subId"];
                        for(var i=0,len=freqItems.length;i<len;i++){
                            var thisItem = freqItems[i];
                            if(thisItem.getAttribute("data-id") === subId){
                                removeClass(thisItem,"selected");
                                break;
                            }
                        }
                    }else if(checkInfo.hasOwnProperty("topId")){
                        var topId = checkInfo["topId"];
                        fetchArr(freqItems,function(i){
                            var thisItem = freqItems[i];
                            if(thisItem.getAttribute("data-topId") === topId){
                                removeClass(thisItem,"selected");
                            }
                        });
                    }
                }
            }
        };
        return {
            "setView" : function(freqClsListData){
                var thisContext = Context("freqTagView");
                thisContext.setTrait("list",freqClsList);
                thisContext.setTrait("setList",setList);
                thisContext.setTrait("multiCheckView",multiCheckView);
                thisContext.setTrait("multiCheckBox",multiCheckBox);
                thisContext.setTrait("multiCheckFun",multiCheckFun);
                thisContext.setTrait("multiCheckStyle",multiCheckStyle);
                thisContext.setTrait("editCheckFun",editCheckFun);
                thisContext.setTrait("updateList",function(updateData){
                    var clsItems = freqClsList.children;
                    if(updateData.hasOwnProperty("delete")){
                        var deleteIds = updateData.delete;
                        for(var i=0;i<clsItems.length;){
                            var thisItem = clsItems[i];
                            var thisId = thisItem.getAttribute("data-id");
                            var index = deleteIds.indexOf(thisId);
                            if(index !== -1){
                                freqClsList.removeChild(thisItem);
                                deleteIds.splice(index,1);
                            }else{
                                i++;
                            }
                        }
                    }
                    if(updateData.hasOwnProperty("add")){
                        var frag = document.createDocumentFragment();
                        fetchArr(updateData.add,function(i){
                            frag.appendChild(fectory(updateData.add[i]));
                        });
                        freqClsList.appendChild(frag);
                    }
                    if(updateData.hasOwnProperty("name")){
                        fetchArr(updateData.name,function(i){
                            var thisData = updateData.name[i];
                            for(var j=0,len=clsItems;j<len;j++){
                                var thisItem = clsItems[j];
                                if(thisItem.getAttribute("data-id") === thisData.classId){
                                    thisItem.children[0].innerText = thisData.className;
                                    break;
                                }
                            };
                        });
                    }
                });
                controller.setGContext(thisContext);
                setList(freqClsListData);
            },"event" : function(){
                classViewTrigger.addEventListener("click",function(){
                    loadClassViewFun(function(clsId,clsName){
                        controller.getGContext("tagView").getTrait("topDoSelect")(clsId,clsName);
                    });
                });
                multiCheckBox.addEventListener("click",function(){
                    var conditionList = controller.getGContext("conditionView").getTrait("clsSelectList");
                    this.checked ? multiCheckStyle(true,conditionList) : multiCheckStyle(false);
                });
            }
        };
    };

    function DocSearch_I(tagView){
        var searchInput = conView.search.querySelector(".doc-search-input");
        return {
            "event" : function(){
                searchInput.addEventListener("focus",function(){
                    console.info("111");
                });
                searchInput.addEventListener("blur",function(){
                    console.info("222");
                });
            }
        };
    };
    var o = new Object();
    return {
        "init":function(){
            o.docList = DocList_V();
            o.pageTab = PageTab_V();
            o.clsTag = ClsTag_I();
            o.docSearch = DocSearch_I();
            removeClass(conView.docEditView,"hide");
            o.pageTab.setView();
            o.docList.setView(pageData["docList"],pageData["docTagList"],pageData["countDoc"]);
            o.clsTag.setView(pageData["topClsList"],pageData["freqClsList"],pageData["minTime"],formatDate(new Date()));
            o.clsTag.event();
            o.docList.event();
            o.pageTab.event();
            o.docSearch.event();
            sectionTouch.event();
        },"free":function(){
            sectionTouch.removeEvent();
            o.docList = o.pageTab = o.clsTag = o.docSearch = sectionTouch = null;
        }
    };
}
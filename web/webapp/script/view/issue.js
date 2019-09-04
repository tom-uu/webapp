    function IssueView(contentNode,pageData){
        var viewContainer = contentNode.querySelector("#issue-view");
        var issueContent = viewContainer.querySelector("#issue-content-view");
        var conView = {
            issueInfo : issueContent.querySelector("#issue-info-view"),
            issueEdit : issueContent.querySelector("#issue-edit-view"),
            dimensions : issueContent.querySelector("#issue-dimensions-view"),
            search : issueContent.querySelector(".issue-search-view"),
            condition : issueContent.querySelector(".issue-condition-view"),
            freqClassify : issueContent.querySelector(".freqCls-classify-view"),
            topClassify : issueContent.querySelector(".topCls-classify-view")
        };
        var viewFrag = {
            "issueContent":document.createDocumentFragment(),
            "class":document.createDocumentFragment(),
            "issueList":document.createDocumentFragment(),
            "editIssue":document.createDocumentFragment(),
            "issueDocs":document.createDocumentFragment(),
            "textReader":document.createDocumentFragment(),
            "textEditor":document.createDocumentFragment()
        };

        var controller = Controller("Issue");
        var sectionTouch = SectionTouch_I(issueContent);
        sectionTouch.setView(controller);
        var contentChange = ContentChange_I(controller);
        
        function LoadIssue_C(){
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
                        requestServer("GET","/webapp/controllers/IssueAction.php/GetIssueListAll/"+startNum+'/'+limitNum+'/',null,function(res){
                            callBack(res);
                        });
                    }else{
                        requestServer("POST","/webapp/controllers/IssueAction.php/GetIssueList/"+startNum+'/'+limitNum+'/',JSON.stringify(reqData),function(res){
                            callBack(res);
                        });
                    }
                }
            };
        }
        
        function LoadTopClsList_C(){
            return function(callBack){
                requestServer("GET","/webapp/controllers/IssueAction.php/GetTopClsInfo/",null,function(res){
                    callBack(res);
                });
            };
        }
        
        function LoadFreqClsList_C(){
            return function(callBack){
                requestServer("GET","/webapp/controllers/IssueAction.php/GetFreqClsInfo/",null,function(res){
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
                LoadTopClsList_C()(loadEndCallBack);
            }else if(classType === "freq"){
                LoadFreqClsList_C()(loadEndCallBack);
            }
        }
        
        function AddIssue_C(issueData){
            return function(callBack){
                requestServer("POST","/webapp/controllers/IssueAction.php/AddIssue/",JSON.stringify(issueData),function(res){
                    callBack(res);
                });
            };
        }

        function EditIssue_C(editData){
            return function(callBack){
                requestServer("POST","/webapp/controllers/IssueAction.php/EditIssue/",JSON.stringify(editData),function(res){
                    callBack(res);
                });
            };
        }

        function SetIssueStatus_C(issueId,status){
            return function(callBack){
                requestServer("GET","/webapp/controllers/IssueAction.php/SetIssueStatus/"+issueId+'/'+status+'/',null,function(res){
                    callBack(res);
                });
            };
        }

        function DeleteIssue_C(issueId,dataNum){
            var reqData = null;
            return {
                "setReqData" : function(reqInfo){
                    reqData = reqInfo;
                },"process" : function(callBack){
                    requestServer("POST","/webapp/controllers/IssueAction.php/DeleteIssue/"+issueId+"/"+dataNum+"/",JSON.stringify(reqData),function(res){
                        callBack(res);
                    });
                }
            };
        }

        function LoadClassView_C(getHtml){
            return function(callBack){
                requestServer("GET","/webapp/controllers/ClassAction.php/LoadView/issue/"+getHtml+"/",null,function(resText){
                    callBack(resText);
                });
            };
        }

        function LoadIssueDocs_C(issueId,startNum,limitNum){
            return function(callBack){
                requestServer("GET","/webapp/controllers/IssueDocAction.php/LoadView/"+issueId+'/'+startNum+'/'+limitNum+'/',null,function(resText){
                    callBack(resText);
                });
            };
        }

        function GetDocInfo_C(issueId,startNum,limitNum,getMinTime){
            return function(callBack){
                requestServer("GET","/webapp/controllers/IssueDocAction.php/GetDocListInfo/"+issueId+'/'+startNum+'/'+limitNum+'/'+getMinTime+'/',null,function(resText){
                    callBack(resText);
                });
            };
        }

        function showDimensionSearchView(flag){
            if(flag){
                removeClass(conView.condition,"hide");
                removeClass(conView.search,"hide");
            }else{
                addClass(conView.condition,"hide");
                addClass(conView.search,"hide");
            }
        }
        
        function loadClassViewFun(viewCallBack,folderId){
            var topContext = controller.topContext();
            var tabViewSetFun = controller.getGContext("tabView").getTrait("setView");
            var loadClassView = function(contextKey,pageData){
                typeof folderId === "string" ? Class_V(controller,issueContent,viewFrag,pageData,"issue",viewCallBack,folderId) : Class_V(controller,issueContent,viewFrag,pageData,"issue",viewCallBack);
                tabViewSetFun(contextKey);
            };
            if(topContext.getKey() === 'issueList'){
                var key = "class";
                var topViewDisplayFun = topContext.getTrait("viewDisplay");
                addCss(getViewCss(key));
                if(viewFrag.class.childElementCount === 0){
                    LoadClassView_C(1)(function(res){
                        var fileData = JSON.parse(res);
                        var containerDiv = document.createElement('div');
                        containerDiv.innerHTML = fileData["html"];
                        topViewDisplayFun(false,key);
                        loadView(key,issueContent,fileData["html"],function(){
                            loadClassView(key,fileData["pageData"]);
                        });
                    });
                }else{
                    LoadClassView_C(0)(function(res){
                        var fileData = JSON.parse(res);
                        topViewDisplayFun(false,key);
                        loadClassView(key,fileData["pageData"]);
                    });
                }
            }
        }
        
        function PageTab_I(){
            var view = View({"id":"issue-tab-view"});
            view.init();
            var titleText = view.get(".tab-title-text");
            var addIssueTrigger = view.get(".tab-add-trigger");
            var moreTrigger = view.get(".tab-more-trigger");
            var moreBtnsView = view.get(".tab-more-btns");
            var submitTrigger = view.get(".tab-ok-trigger");
            var backView = view.get(".tab-back-view");
            var backTrigger = view.get(".tab-back-trigger");
            var pageTabTitleMap = {
                "issueList":"专题列表",
                "issueDocs":"专题文档",
                "addIssue":"添加专题",
                "editIssue":"编辑专题",
                "class":"专题标签",
                "textEditor":"编辑文档",
                "textReader":"浏览文档"
            };
            var setPageTitle = function(key){
                titleText.innerText = pageTabTitleMap[key];
            };
            var setTabReturnStyle = function(contextKey){
                if(contextKey !== 'issueList'){
                    addClass(addIssueTrigger,"hide");
                    removeClass(backView,"hide");
                    contextKey === "textEditor" ? removeClass(submitTrigger,"hide") : addClass(submitTrigger,"hide");
                    contextKey === "textReader" ? removeClass(moreTrigger,"hide") : addClass(moreTrigger,"hide");
                }else{
                    removeClass(addIssueTrigger,"hide");
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
                var popContext = controller.popContext();
                var nextContext = controller.topContext();
                var nextKey = nextContext.getKey();
                var pageBackFun = popContext.getTrait("pageBack");
                if(typeof pageBackFun === 'function'){
                    pageBackFun();
                }
                var popKey = popContext.getTrait("viewDisplay")(false);
                changeView(nextKey);
                nextKey === 'issueList' ? nextContext.getTrait("viewDisplay")(true,popKey) : nextContext.getTrait("viewDisplay")(true);
                if(typeof nextContext.reset === 'function'){
                    nextContext.reset(popContext.popInfo,popKey);
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
                    setPageTitle("issueList");
                    addIssueTrigger.addEventListener("click",function(){
                        var topContext = controller.topContext();
                        if(topContext.getKey() === 'issueList'){
                            var contextKey = "addIssue";
                            topContext.getTrait("viewDisplay")(false,contextKey);
                            var editIssueInteraction = EditIssue_I(contextKey);
                            if(editIssueInteraction.setView()){
                                editIssueInteraction.event();
                                changeView(contextKey);
                            }else{
                                topContext.getTrait("viewDisplay")(true,contextKey);
                            }
                        }
                    });
                    backTrigger.addEventListener("click",tabPageBack);
                }
            };
        }

        function issueList_I(){
            var view = View({"id":"issue-list-view"});
            var listView = view.init();
            var pageBarNode = issueContent.querySelector(".paging");
            var pageNumList = pageBarNode.querySelector(".page-num");
            var itemTmp = view.get(".issue-item-template");
            itemTmp.parentNode.removeChild(itemTmp);
            var emptyItemHtml = listView.innerHTML;
            var issueListFrag = document.createDocumentFragment();
            var onEditIssueNode = null;
            var issueItemJson = {};
            var loadDocJson = {};
            var getDocJson = function(loadRes){
                if(loadRes.hasOwnProperty("docView")){
                    loadDocJson[loadRes.issueId] = loadRes.docView;
                }
            };
            var getRecentDocIds = function(recentDocList){
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
                fetchArr(recentDocList,function(i){
                    var thisElem = recentDocList[i];
                    var docId = thisElem.docId;
                    if(!checkIds(docId)){
                        docIds.push(docId);
                    }
                });
                return docIds;
            };
            var setDocHtml = function(docData,recentInfo,loadDocJson){               
                var thisId = docData.id;
                var docValue = docData.value;
                var thisTitle = docValue.title;
                var thisText = docValue.text;
                var thisDocView = loadDocJson[recentInfo.issueId];
                var docHtml = "<div data-docId='"+thisId+"'>";
                if(thisTitle !== "0"){
                    docHtml += "<h3>"+thisTitle+"</h3>";
                }
                docHtml +="<p>"+thisText+"</p><p>";
                if(docValue.hasOwnProperty("countAudio")){
                    docHtml +="<span class=\"audio-tip\"><i class=\"icon\">&#xf1C7;</i> +"+docValue.countAudio+"</span>";
                }
                docHtml += "<span>归档于</span><span>"+recentInfo.addTime+"</span></p></div>";
                thisDocView.innerHTML = docHtml;
                thisDocView.parentNode.querySelector(".issue-status-tag").setAttribute("data-v","1");
                return thisDocView;
            };
            var emptyInfoDisplay = function(){
                listView.innerHTML = emptyItemHtml;
                controller.getGContext("issueList").getTrait("setPage")(0);
                addClass(pageBarNode,"hide");
            };
            var getRecentDocData = function(docData,docId){
                for(var i=0,len=docData.length;i<len;i++){
                    var thisData = docData[i];
                    var thisDocId = thisData.id;
                    if(thisDocId === docId){
                        return thisData;
                    }
                }
                return null;
            };
            var loadDocSummary = function(recentDocList,callBack){
                var docIds = getRecentDocIds(recentDocList);
                if(docIds.length > 0){
                    LoadDocList_C(docIds)(function(res){
                        var docListData = JSON.parse(res);
                        if(docListData.length > 0){
                            fetchArr(recentDocList,function(i){
                                var thisRecentInfo = recentDocList[i];
                                var thisDocData = getRecentDocData(docListData,thisRecentInfo.docId);
                                var thisDocView = setDocHtml(thisDocData,thisRecentInfo,loadDocJson);
                                removeClass(thisDocView,"hide");
                            });
                        }
                        callBack();
                        loadDocJson = {};
                    });
                }else{
                    callBack();
                    loadDocJson = {};
                }
            };
            var loadIssueStatus = function(statusList){
                if(Object.keys(issueItemJson).length > 0){
                    fetchArr(statusList,function(i){
                        var thisData = statusList[i];
                        var thisTime = thisData.endTime;
                        var thisStatusBtn = issueItemJson[thisData.issueId].querySelector(".issue-status-tag");
                        var textNode = document.createElement("span");
                        textNode.innerText = '-';
                        thisStatusBtn.parentNode.insertBefore(textNode,thisStatusBtn);
                        thisStatusBtn.setAttribute("data-v","2");
                        thisStatusBtn.setAttribute("title",thisTime);
                        removeClass(thisStatusBtn,"icon");
                        thisStatusBtn.innerHTML = thisTime;
                    });
                }
            };
            var loadData = function(issueData,tagData,recentDocData,statusData,callBack){
                var tagDataJson = {};
                for(var i=0,len=tagData.length;i<len;i++){
                    var thisElement = tagData[i];
                    var thisIssueId = thisElement.issueId;
                    if(!tagDataJson.hasOwnProperty(thisIssueId)){
                        tagDataJson[thisIssueId] = new Array();
                    }
                    tagDataJson[thisIssueId].push(thisElement);
                }
                if(issueData){
                    if(issueData.length > 0){
                        fetchArr(issueData,function(i){
                            var setIssueDataInterac = SetIssueData_I(itemTmp);
                            var loadRes = setIssueDataInterac.getItemByLoadData(issueData[i]);
                            var issueItem = loadRes.node;
                            issueItemJson[loadRes.issueId] = issueItem;
                            setIssueDataInterac.loadIssueTag(tagDataJson);
                            issueListFrag.appendChild(issueItem);
                            getDocJson(loadRes);
                        });
                        loadDocSummary(recentDocData,function(){
                            if(issueListFrag.childElementCount > 0){
                                listView.innerHTML = "";
                                listView.appendChild(issueListFrag);
                                if(typeof callBack === "function"){
                                    callBack();
                                }
                                removeClass(pageBarNode,"hide");
                            }
                        });
                        loadIssueStatus(statusData);
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
            var viewDisplay = function(flag,contextKey){
                var contextFlag = contextKey === 'addIssue' || contextKey === "editIssue";
                if(flag){
                    issueContent.appendChild(viewFrag.issueContent);
                    contextFlag ? conView.issueInfo.appendChild(viewFrag.issueList) : issueContent.appendChild(viewFrag.issueContent);
                    contentChange("setScroll")(listView);
                }else if(!contextFlag){
                    contentChange("recordScroll")(listView);
                    viewFrag.issueContent.appendChild(issueContent.children[0]);
                }else{
                    viewFrag.issueList.appendChild(listView);
                    viewFrag.issueList.appendChild(pageBarNode);
                    contentChange("recordScroll")(listView);
                }
                return contextKey;
            };
            var loadDataContext = LoadIssue_C();
            var resetFun = function(flag){
                if(flag.hasOwnProperty("resetFlag") && flag.resetFlag){
                    var issueListContext = controller.getGContext("issueList");
                    var conditionContext = controller.getGContext("conditionView");
                    var resetIssueList = issueListContext.getTrait("resetList");
                    var condition = conditionContext.getTrait("condition");
                    var startNum = (getPageNum()-1)*10;
                    startNum = startNum > 0 ? startNum : 0;
                    loadDataContext.setNum(startNum);
                    loadDataContext.setReqData(condition.info);
                    loadDataContext.process(function(res){
                        if(res){
                            var resData = JSON.parse(res);
                            parseInt(resData.countIssue) > 0 ? resetIssueList(resData) : emptyInfoDisplay();
                            issueListContext.getTrait("setPage")(resData["countIssue"],getPageNum());
                        }else{
                            emptyInfoDisplayy();
                        }
                    });
                }
            };
            var setListPageBarView = function(countIssue){
                var pagingInteraction = PagingInteraction(pageBarNode);
                var resetIssueList = function(pageData){
                    if(typeof pageData === "object"){
                        var issueListData = pageData["issueList"];
                        loadData(pageData["issueList"],pageData["issueTagList"],pageData["recentDocList"],pageData["statusList"]);
                        pagingInteraction.setPage(parseInt(pageData["countIssue"]),1);
                        if(issueListData.length > 0){
                            showDimensionSearchView(true);
                        }
                    }else{
                        pagingInteraction.setPage(0,1);
                    }
                };
                pagingInteraction.initPaging(countIssue,1,function(startNum,pageBarCallBack){
                    loadDataContext.setNum(startNum);
                    loadDataContext.process(function(res){
                        var flag = false;
                        if(res !== false){
                            resetIssueList(JSON.parse(res));
                            flag = true;
                        }else{
                            alert("get issue data failed");
                        }
                        pageBarCallBack(flag);
                    });
                });
                pagingInteraction.event();
                controller.getGContext("issueList").setTrait("setPage",pagingInteraction.setPage);
                controller.getGContext("issueList").setTrait("resetList",resetIssueList);
                if(parseInt(countIssue) > 0){
                    removeClass(pageBarNode,"hide");
                }
            };
            var editIssueResetFun = function(info){
                if(info.hasOwnProperty("editIssue")){
                    var issueNode = info.editIssue.node;
                    var data = info.editIssue.data;
                    var descText = issueNode.querySelector(".issue-item-textTrigger");
                    var tagList = issueNode.querySelector(".issue-tagItem-list");
                    var tagIcons = issueNode.querySelectorAll(".tag_icon");
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
                if(onEditIssueNode !== null){
                   onEditIssueNode = null; 
                }
            };
            var docReset = function(info){
                if(info.hasOwnProperty("issueId")){
                    var resetItem = listView.querySelector("section[issueId='"+info.issueId+"']");
                    var docNumText = resetItem.querySelector("span[class='num']");
                    var thisDocView = resetItem.querySelector(".issue-doc-view");
                    docNumText.innerText = info.docNum;
                    thisDocView.innerHTML = info.recentDocHtml;
                    removeClass(thisDocView,"hide");
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
            var setIssueStatus = function(thisBtn){
                var thisValue = thisBtn.getAttribute("data-v");
                var timeView = thisBtn.parentNode;
                var thisItem = timeView.parentNode;
                if(thisValue === "1" || thisValue === "2"){
                    SetIssueStatus_C(thisItem.getAttribute("issueId"),thisValue)(function(res){
                        if(res){
                            if(thisValue === "1"){
                                var data = JSON.parse(res);
                                if(data.hasOwnProperty("endTime")){
                                    var endTime = data["endTime"];
                                    var textNode = document.createElement("span");
                                    textNode.innerText = '-';
                                    thisBtn.setAttribute("data-v","2");
                                    thisBtn.setAttribute("title",endTime);
                                    removeClass(thisBtn,"icon");
                                    timeView.insertBefore(textNode,thisBtn);
                                    thisBtn.innerHTML = endTime;
                                }
                            }else if(thisValue === "2"){
                                thisBtn.setAttribute("data-v","1");
                                thisBtn.removeAttribute("title");
                                timeView.removeChild(timeView.children[1]);
                                addClass(thisBtn,"icon");
                                thisBtn.innerHTML = "&#xf128;";
                            }
                            tipView(true,"问题状态已更新.");
                        }else{
                            alert("更新问题状态失败");
                        }
                    });
                }
            };
            var deleteIssue_i = function(thisItem,conditionInfo){
                 window.setDialogBox({
                    title: "删除主题",
                    content: thisItem.querySelector(".issue-title").innerText,
                    callBack : function(){
                        var doDeleteIssue = DeleteIssue_C(thisItem.getAttribute("issueId"),getPageNum()*10-1);
                        doDeleteIssue.setReqData(conditionInfo);
                        doDeleteIssue.process(function(res){
                            var resData = JSON.parse(res);
                            if(resData.flag){
                                listView.removeChild(thisItem);
                                var countIssue = parseInt(resData.countIssue);
                                controller.getGContext("issueList").getTrait("setPage")(parseInt(resData["countIssue"]));
                                if(countIssue === 0){
                                    emptyInfoDisplay();
                                }
                                tipView(true,"已删除所选主题.");
                            }
                            if(resData.hasOwnProperty("issueList") && resData["issueList"].length > 0){
                                var thisIssueInfo = resData["issueList"][0];
                                var tagInfo = {};
                                tagInfo[thisIssueInfo["issueId"]] = resData["tag"];
                                var setIssueDataInterac = SetIssueData_I(itemTmp);
                                var loadRes = setIssueDataInterac.getItemByLoadData(thisIssueInfo);
                                var issueItem = loadRes.node;
                                issueItemJson[loadRes.issueId] = issueItem;
                                issueListFrag.appendChild(issueItem);
                                getDocJson(loadRes);
                                if(resData.hasOwnProperty("tag")){
                                    setIssueDataInterac.loadIssueTag(tagInfo);
                                }
                                loadIssueStatus(resData["statusList"]);
                                loadDocSummary(resData["recentDocList"],function(){
                                    if(issueListFrag.childElementCount > 0){
                                        listView.appendChild(issueListFrag);
                                    }
                                });
                            }
                        });
                    }
                });
            };
            return {
                "setView" : function(issueData,tagData,recentDocData,statusData,countIssue){
                    var thisContext = Context("issueList");
                    thisContext.setTrait("listView",listView);
                    thisContext.setTrait("viewDisplay",viewDisplay);
                    thisContext.setTrait("reset",{
                        "textReader" : resetFun,
                        "addIssue" : resetFun,
                        "editIssue" : editIssueResetFun,
                        "issueDocs":docReset,
                        "class" : classReset
                    });
                    thisContext.setTrait("getTotalNum",getTotalNum);
                    thisContext.setTrait("getTotalPageNum",getTotalPageNum);
                    thisContext.setTrait("getPageNum",getPageNum);
                    thisContext.setTrait("getEditNode",function(){
                        return onEditIssueNode;
                    });
                    thisContext.setTrait("setEditNode",function(node){
                        onEditIssueNode = node;
                    });
                    thisContext.setTrait("emptyInfoDisplay",emptyInfoDisplay);
                    thisContext.setTrait("loadData",loadData);
                    thisContext.setTrait("loadDataContext",loadDataContext);
                    controller.setGContext(thisContext);
                    controller.pushContext(thisContext);
                    loadData(issueData,tagData,recentDocData,statusData,function(){
                        setListPageBarView(countIssue);
                        removeClass(viewContainer,"hide");
                    });
                    if(issueData.length > 0){
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
                    var getIssueTagData = function(tagList){
                        var tagArray = new Array();
                        var topTag = tagList.querySelector(".top-tag");
                        if(topTag !== null){
                            var newTopTag = topTag.cloneNode(true);
                            var topId = newTopTag.getAttribute("data-id");
                            var subTags = tagList.querySelectorAll(".sub-tag");
                            tagArray.push(newTopTag);
                            fetchArr(subTags,function(i){
                                var thisSubTag = subTags[i].cloneNode(true);
                                thisSubTag.setAttribute("data-topId",topId);
                                tagArray.push(thisSubTag);
                            });
                            return tagArray;
                        }else{
                            return null;
                        }
                    };
                    var getDetailData = function(issueItem){
                        var data = {};
                        var docNumView = issueItem.querySelector(".issue-docTotal-view");
                        var docNum = docNumView.querySelector(".num");
                        var tagList = issueItem.querySelector(".issue-tagItem-list");
                        var topTag = tagList.querySelector(".top-tag");
                        var subTags = tagList.querySelectorAll(".sub-tag");
                        var statusBtn = issueItem.querySelector(".issue-status-tag");
                        data.desc = issueItem.querySelector(".issue-item-textTrigger").innerText;
                        data.time = issueItem.querySelector(".issue-display-timeText").innerText;
                        data.docCount = docNum.innerText;
                        if(topTag !== null && topTag.firstChild.innerText.length > 0){
                            data.tagList = {};
                            data.tagList.topTag = topTag.firstChild.innerText;
                            if(subTags.length > 0){
                                var subArr = data.tagList.subTag = new Array();
                                fetchArr(subTags,function(i){
                                    subArr.push(subTags[i].firstChild.innerText);
                                });
                            }
                        }
                        if(statusBtn.hasAttribute("title")){
                            data.endTime = statusBtn.getAttribute("title");
                        }
                        return data;
                    };
                    var loadReaderView = function(docId){
                        var viewKey = "textReader";
                        var callTextReader = function(){
                            if(typeof TextReader_V !== "undefined"){
                                TextReader_V(controller,issueContent,viewFrag,docId,true);
                                tabViewSetFun(viewKey);
                            }
                        };
                        viewDisplay(false,viewKey);
                        if(viewFrag[viewKey].childElementCount === 0){
                            addCss("/webapp/css/"+viewKey+".css");
                            LoadCompView_C(viewKey)(function(res){
                                var fileData = JSON.parse(res);
                                loadView(viewKey,issueContent,fileData["html"],callTextReader);
                            });
                        }else if(checkViewScript(viewKey)){
                            callTextReader();
                        }
                    };
                    var loadIssueDocsView = function(issueId,issueData,docData){
                        IssueDocs_V(controller,issueContent,viewFrag,issueId,issueData,docData,GetDocInfo_C,LoadDocList_C);
                        tabViewSetFun("issueDocs");
                    };
                    var issueDocsEventFun = function(issueItem){
                        var topContext = controller.topContext();
                        if(topContext.getKey() === 'issueList'){
                            var issueId = issueItem.getAttribute("issueId");
                            var issueData = getDetailData(issueItem);
                            var viewKey = "issueDocs";
                            viewDisplay(false,viewKey);
                            if(viewFrag.issueDocs.childElementCount === 0){
                                addCss("/webapp/css/issueDocs.css");
                                LoadIssueDocs_C(issueId,0,10)(function(res){
                                    var fileData = JSON.parse(res);
                                    var docData = fileData["data"];
                                    var pageHtml = fileData["html"];
                                    loadView(viewKey,issueContent,pageHtml,function(){
                                        loadIssueDocsView(issueId,issueData,docData);
                                    });
                                });
                            }else{
                                loadIssueDocsView(issueId,issueData,null);
                            }
                        }
                    };
                    listView.addEventListener("click",function(e){
                        if(e.target.nodeName === 'A'){
                            var target = e.target;
                            if(hasClass(target,"issue-delete-trigger")){
                                deleteIssue_i(target.parentNode.parentNode.parentNode,conditionInfo);
                            }else if(hasClass(target,"issue-edit-trigger")){
                                var topContext = controller.topContext();
                                if(topContext.getKey() === 'issueList' && onEditIssueNode === null){
                                    var contextKey = "editIssue";
                                    var thisItem = target.parentNode.parentNode;
                                    var editIssueInteraction = EditIssue_I(contextKey);
                                    var editIssueViewData = {"id":thisItem.getAttribute("issueId"),"desc":thisItem.querySelector(".issue-item-textTrigger").innerText};
                                    var tagData = getIssueTagData(thisItem.querySelector(".issue-tagItem-list"));
                                    viewDisplay(false,contextKey);
                                    onEditIssueNode = thisItem;
                                    if(tagData !== null && tagData.length > 0){
                                        editIssueViewData.tags = tagData;
                                    }
                                    if(editIssueInteraction.setView(editIssueViewData)){
                                        editIssueInteraction.event();
                                        tabViewSetFun(contextKey);
                                    }else{
                                        viewDisplay(true,contextKey);
                                        alert("issueEditView init failed");
                                    }
                                }
                            }else if(hasClass(target,"issue-docTotal-Btn")){
                                issueDocsEventFun(target.parentNode.parentNode.parentNode);
                            }else if(target.parentNode.nodeName === 'LI'){
                                var thisTagItem = target.parentNode;
                                var thisTagList = thisTagItem.parentNode;
                                if(hasClass(thisTagItem,"tag_icon")){
                                    if(thisTagItem === thisTagList.children[0]){
                                        var tagClsId = thisTagItem.nextSibling.getAttribute("data-id");
                                        loadClassViewFun(function(clsId,clsName){
                                            tagDoSelectFun(clsId,clsName);
                                        },tagClsId);
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
                            }else if(hasClass(e.target,"issue-status-tag")){
                                setIssueStatus(e.target);
                            }
                        }else if(e.target.nodeName === 'SPAN' && hasClass(e.target.parentNode,"issue-docTotal-Btn")){
                            issueDocsEventFun(e.target.parentNode.parentNode.parentNode.parentNode);
                        }else {
                            var thisNode = null;
                            if(e.target.nodeName === "DIV" && e.target.hasAttribute("data-docId")){
                                thisNode = e.target;
                            }else if(e.target.nodeName === "H3" && e.target.parentNode.nodeName === "DIV" || e.target.nodeName === "P"){
                                thisNode = e.target.parentNode;
                            }
                            if(thisNode !== null){
                                var thisDocNode = thisNode.parentNode;
                                var issueId = thisDocNode.parentNode.getAttribute("issueId");
                                loadReaderView(thisNode.getAttribute("data-docId"));
                            }
                        }
                    });
                }
            };
        }

        function SetIssueData_I(itemTmp){
            var view = View({"node":itemTmp.cloneNode(true)});
            var item = view.init();
            var descNode = view.get(".issue-item-textTrigger");
            var dateTimeText = view.get(".issue-display-timeText");
            var tagList = view.get(".issue-tagItem-list");
            var tagIcons = tagList.querySelectorAll(".tag_icon");
            var docNumView = view.get(".issue-docTotal-view");
            var docView = view.get(".issue-doc-view");
            var docNumView = docNumView.querySelector(".num");
            var topTagIcon = tagIcons[0];
            var subTagIcon = tagIcons[1];
            var topTagItem = topTagIcon.nextSibling;
            var tagItemTmp = topTagItem.cloneNode(true);
            var issueId = "";
            var setTopTagItem = function(topData){
                topTagItem.setAttribute("data-id",topData.classId);
                topTagItem.children[0].innerText = topData.className;
                addClass(topTagItem,"top-tag");
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
                    var docNum = data.docNum;
                    descNode.innerText = data.issueDesc;
                    issueId = data.issueId;
                    item.setAttribute("issueId",issueId);
                    dateTimeText.innerText = data.createTime;
                    docNumView.innerText = docNum;
                    backJson.issueId = issueId;
                    backJson.docNum = parseInt(docNum);
                    if(backJson.docNum > 0){
                        backJson.docView = docView;
                    }
                    return backJson;
                },"loadIssueTag" : function(issueTagList){
                    if(issueTagList.hasOwnProperty(issueId)){
                        var thisData = issueTagList[issueId];
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
                    descNode.innerText = data.issueDesc;
                    issueId = data.issueId;
                    item.setAttribute("issueId",issueId);
                    dateTimeText.innerText = data.createTime;
                    docNumView.innerText = 0;
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

        function EditIssue_I(contextKey){
            var view = View({"node":conView.issueEdit});
            var editViewNode = view.init();
            var descTextArea = view.get(".issue-edit-textarea");
            var topClsList = view.get(".issue-edit-topCls");
            var subClsList = view.get(".issue-edit-subClsList");
            var cancelTrigger = view.get(".issue-edit-cancelTrigger");
            var submitTrigger = view.get(".issue-edit-submitTrigger");
            var nowContextKey = "";
            var tagViewContext = controller.getGContext("tagView");
            var setClsTag = function(tagItem){
                tagItem.appendChild(document.createElement("a"));
                addClass(tagItem.lastChild,"class_delete_btn icon-btn");
                tagItem.lastChild.appendChild(document.createElement("span"));
                addClass(tagItem.lastChild.firstChild,"icon-delete-s");
                tagItem.hasAttribute("data-topId") ? subClsList.appendChild(tagItem) : topClsList.appendChild(tagItem);
                return tagItem;
            };
            var getData = function(){
                var data = {};
                if(trim(descTextArea.value).length > 0){
                    data.desc = descTextArea.value;
                }
                if(topClsList.innerHTML.length > 0){
                    var topItem = topClsList.firstChild;
                    var topId = topItem.getAttribute("data-id");
                    var subClsItems = subClsList.children;
                    data.classIds = new Array();
                    data.classIds.push(topId);
                    data.class = {};
                    if(topItem.firstChild.innerText.length > 0){
                        data.class.top = {"classId":topId,"className":topItem.firstChild.innerText};
                        if(subClsItems.length > 0){
                            data.class.sub = new Array();
                            fetchArr(subClsItems,function(i){
                                var thisItem = subClsItems[i];
                                var subId = thisItem.getAttribute("data-id");
                                data.classIds.push(subId);
                                data.class.sub.push({"classId":subId,"className":thisItem.firstChild.innerText});
                            });
                        }
                    }
                }
                return data.hasOwnProperty("desc") ? data : null;
            };
            var setData = function(data){
                var topId = "";
                descTextArea.value = data.desc;
                if(data.hasOwnProperty("tags")){
                    var tags = data.tags;
                    data.class = {};
                    fetchArr(tags,function(i){
                        var thisTag = tags[i];
                        var listKey = thisTag.hasAttribute("data-topId") ? "freq" : "top";
                        setClsTag(thisTag);
                        if(listKey === 'freq'){
                            if(!data.class.hasOwnProperty("subId")){
                                data.class.subId = new Array();
                            }
                            data.class.subId.push(thisTag.getAttribute("data-id"));
                        }else if(listKey === 'top'){
                            data.class.topId = thisTag.getAttribute("data-id");
                        }
                        if(topId.length === 0 && listKey === "top"){
                            topId = thisTag.getAttribute("data-id");
                        }
                    });
                }
                controller.topContext().setTrait("preData",data);
            };
            var resetView = function(){
                descTextArea.value = topClsList.innerText = subClsList.innerText = "";
                tagViewContext.getTrait("setState")("recover");
            };
            var viewDisplay = function(flag){
                if(flag){
                    conView.issueInfo.appendChild(viewFrag.editIssue);
                }else{
                    viewFrag.editIssue.appendChild(editViewNode);
                }
                return contextKey;
            };
            var getEditTagData = function(preData,nowData,editClassIds){
                var pushId = function(key,id){
                    if(!editClassIds.hasOwnProperty(key)){
                        editClassIds[key] = new Array();
                    }
                    editClassIds[key].push(id);
                };
                var fetchAndPushId = function(fetchData,checkData,checkKey,operkey){
                    if(checkKey === 'pre' || checkKey === 'now'){
                        var checkIds = new Array();
                        if(checkKey === 'now'){
                            fetchArr(checkData,function(i){
                                checkIds.push(checkData[i].classId);
                            });
                        }
                        fetchArr(fetchData,function(i){
                            var thisId = (checkKey === 'pre' ?  fetchData[i].classId : fetchData[i]);
                            if(checkKey === 'pre'){
                                thisId = fetchData[i].classId;
                                if(typeof checkData !== "string" || checkData.indexOf(thisId) === -1){
                                    pushId(operkey,thisId);
                                }
                            }else{
                                thisId = fetchData[i];
                                if(checkIds.indexOf(thisId) === -1){
                                    pushId(operkey,thisId);
                                }
                            }
                        });
                    }
                };
                if(nowData !== null && nowData.hasOwnProperty("top")){
                    if(preData !== null){
                        if(nowData.top.classId !== preData.topId){
                            pushId("delete",preData.topId);
                            fetchArr(preData.subId,function(i){
                                pushId("delete",preData.subId[i]);
                            });
                            pushId("add",nowData.top.classId);
                        }else{
                            if(nowData.hasOwnProperty("sub") && preData.hasOwnProperty("subId")){
                                fetchAndPushId(nowData.sub,preData.subId,"pre","add");
                                fetchAndPushId(preData.subId,nowData.sub,"now","delete");
                            }else if(!nowData.hasOwnProperty("sub") && preData.hasOwnProperty("subId")){
                                fetchArr(preData.subId,function(i){
                                    pushId("delete",preData.subId[i]);
                                });
                            }else if(nowData.hasOwnProperty("sub") && !preData.hasOwnProperty("subId")){
                                fetchAndPushId(nowData.sub,preData.subId,"pre","add");
                            }
                        }
                    }else{
                        pushId("add",nowData.top.classId);
                        if(nowData.hasOwnProperty("sub")){
                            fetchArr(nowData.sub,function(i){
                                pushId("add",nowData.sub[i].classId);
                            });
                        }
                    }
                }else if(preData !== null && preData.hasOwnProperty("topId")){
                    pushId("delete",preData.topId);
                    fetchArr(preData.subId,function(i){
                        pushId("delete",preData.subId[i]);
                    });
                }
            };
            var submitHandler = function(){
                var resetTopEditCheck = controller.getGContext("tagView").getTrait("resetTopEditCheck");
                var listContext = controller.getGContext("issueList");
                var thisContext = controller.topContext();
                switch (nowContextKey){
                    case 'addIssue':
                        var addData = getData();
                        var newData = {"issueDesc":addData.desc};
                        if(addData.hasOwnProperty("class")){
                            newData.class = addData.class;
                            delete addData.class;
                        }
                        if(addData !== null){
                            AddIssue_C(addData)(function(res){
                                if(res){
                                    thisContext.popInfo.resetFlag = true;
                                    resetView();
                                    if(addData.hasOwnProperty("classIds")){
                                        resetTopEditCheck();
                                    }
                                }else{
                                    alert("add failed");
                                }
                            });
                        }else{
                            alert("issue description is none!");
                        }
                        break;
                    case 'editIssue':
                        var editData = {"classIds":{}};
                        var nowData = getData();
                        var preData = controller.topContext().getTrait("preData");
                        var preClassInfo = null;
                        var nowClassInfo = null;
                        if(nowData.desc !== preData.desc){
                            if(trim(nowData.desc).length === 0){
                                alert("text not input");
                            }else{
                                editData.desc = nowData.desc;
                            }
                        }else{
                            delete nowData.desc;
                        }
                        if(preData.hasOwnProperty("class")){
                            preClassInfo = preData.class;
                        }
                        if(nowData.hasOwnProperty("class")){
                            nowClassInfo = nowData.class;
                        }
                        getEditTagData(preClassInfo,nowClassInfo,editData.classIds);
                        editData.issueId = preData.id;
                        EditIssue_C(editData)(function(res){
                            if(res){
                                delete nowData.classIds;
                                thisContext.setPopInfo("editIssue",{"node":listContext.getTrait("getEditNode")(),"data":nowData});
                                resetView();
                                controller.getGContext("tabView").getTrait("tabPageBack")();
                            }else{
                                alert("add failed");
                            }
                        });
                        break;
                }
            };
            var topClsFun = function(e){
                var thisNode = null;
                if(e.target.nodeName !== 'UL'){
                    var topTagContext = controller.getGContext("topTagView");
                    var freqTagContext = controller.getGContext("freqTagView");
                    if(e.target.nodeName === 'LI'){
                        thisNode = e.target;
                    }
                    if(e.target.nodeName === 'A'){
                        thisNode = e.target.parentNode;
                    }
                    if(e.target.nodeName === 'SPAN'){
                        thisNode = e.target.parentNode.parentNode;
                    }
                    if(thisNode !== null){
                        var topTagNode = topTagContext.getTrait("getTopItemNode")(thisNode.getAttribute("data-id"));
                        var freqEditCheckFun = freqTagContext.getTrait("editCheckFun");
                        var checkInfo = topTagContext.getTrait("editCheckFun")(topTagNode,false,true);
                        fetchArr(checkInfo,function(i){
                            freqEditCheckFun(checkInfo[i]);
                        });
                        subClsList.innerHTML = topClsList.innerHTML = "";
                    }
                }    
                tagViewContext.getTrait("setState")("recover");
            };
            var subClsFun = function(e){
                var topTagContext = controller.getGContext("topTagView");
                var freqTagContext = controller.getGContext("freqTagView");
                if(e.target.nodeName !== 'UL'){
                    var thisNode = null;
                    if(e.target.nodeName === 'LI'){
                        thisNode = e.target;
                    }else if(e.target.nodeName === 'A'){
                        thisNode = e.target.parentNode;
                    }else if(e.target.nodeName === 'SPAN'){
                        thisNode = e.target.parentNode.parentNode;
                    }
                    if(thisNode !== null){
                        var subTagNode = topTagContext.getTrait("getSubItemNode")(thisNode.getAttribute("data-topId"),thisNode.getAttribute("data-id"));
                        var freqEditCheckFun = freqTagContext.getTrait("editCheckFun");
                        var checkInfo = topTagContext.getTrait("editCheckFun")(subTagNode,false,true);
                        fetchArr(checkInfo,function(i){
                            freqEditCheckFun(checkInfo[i]);
                        });
                        subClsList.removeChild(thisNode);
                    }
                }
            };
            var removeEvent = function(){
                cancelTrigger.removeEventListener("click",resetView);
                submitTrigger.removeEventListener("click",submitHandler);
                topClsList.removeEventListener("click",topClsFun);
                subClsList.removeEventListener("click",subClsFun);
            };
            return {
                "setView" : function(data){
                    if(contextKey === 'addIssue' || contextKey === 'editIssue'){
                        var thisContext = Context(contextKey);
                        controller.pushContext(thisContext);
                        nowContextKey = contextKey;
                        tagViewContext.getTrait("setState")("edit");
                        if(contextKey === 'addIssue'){
                            contentChange("contentShift")(1,0);
                        }
                        thisContext.setTrait("tagItemFun",function(jsonInfo){
                            if(jsonInfo.hasOwnProperty("key")){
                                var key = jsonInfo["key"];
                                if(key === 'add'){
                                    if(jsonInfo.hasOwnProperty("top")){
                                        var thisTag = jsonInfo["top"];
                                        if(topClsList.innerHTML.length > 0){
                                            if(thisTag.getAttribute("data-id") !== topClsList.firstChild.getAttribute("data-id")){
                                                topClsList.innerHTML = subClsList.innerHTML = "";
                                                topClsList.appendChild(setClsTag(thisTag));
                                            }
                                        }else{
                                            topClsList.appendChild(setClsTag(thisTag));
                                        }
                                    }else if(jsonInfo.hasOwnProperty("sub")){
                                        var thisTag = jsonInfo["sub"];
                                        if(topClsList.innerHTML.length > 0 && (thisTag.getAttribute("data-topId") !== topClsList.firstChild.getAttribute("data-id"))){
                                            topClsList.innerHTML = subClsList.innerHTML = "";
                                        }
                                        if(subClsList.innerHTML.length > 0){
                                            var thisId = thisTag.getAttribute("data-id");
                                            for(var i=0,len=subClsList.children.length;i<len;i++){
                                                if(subClsList.children[i].getAttribute("data-id") === thisId){
                                                    break;
                                                }
                                                if(i === len-1){
                                                    subClsList.appendChild(setClsTag(thisTag));
                                                }
                                            }
                                        }else{
                                            subClsList.appendChild(setClsTag(thisTag));
                                        }
                                    }
                                }else if(key === 'remove'){
                                    if(jsonInfo.hasOwnProperty("topId") && topClsList.innerHTML.length > 0 && (topClsList.firstChild.getAttribute("data-id") === jsonInfo["topId"])){
                                        topClsList.innerHTML = subClsList.innerHTML = "";
                                    }else if(jsonInfo.hasOwnProperty("subId")){
                                        if(subClsList.innerHTML.length > 0){
                                            var subTags = subClsList.children;
                                            for(var i=0,len=subTags.length;i<len;i++){
                                                var thisSubTag = subTags[i];
                                                if(thisSubTag.getAttribute("data-id") === jsonInfo["subId"]){
                                                    subClsList.removeChild(thisSubTag);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        thisContext.setTrait("pageBack",function(){
                            resetView();
                            removeEvent();
                            tagViewContext.getTrait("setState")("list");
                        });
                        if(contextKey === "editIssue" && arguments.length > 0){
                            var topEditCheckFun = controller.getGContext("topTagView").getTrait("editCheckFun");
                            var freqEditCheckFun = controller.getGContext("freqTagView").getTrait("editCheckFun");
                            var getTopItemNode = controller.getGContext("topTagView").getTrait("getTopItemNode");
                            var getSubItemNode = controller.getGContext("topTagView").getTrait("getSubItemNode");
                            setData(data);
                            if(data.hasOwnProperty("class")){
                                var classIdInfo = data.class;
                                var topId = classIdInfo.topId;
                                var topNode = getTopItemNode(topId);
                                if(topNode !== null){
                                    topEditCheckFun(topNode);
                                    if(classIdInfo.hasOwnProperty("subId")){
                                        var subIds = classIdInfo.subId;
                                        fetchArr(subIds,function(i){
                                            var checkInfo = topEditCheckFun(getSubItemNode(topId,subIds[i]));
                                            fetchArr(checkInfo,function(i){
                                                freqEditCheckFun(checkInfo[i]);
                                            });
                                        });
                                    }
                                }
                            }
                        }
                        thisContext.setTrait("viewDisplay",viewDisplay);
                        viewDisplay(true);
                        return true;
                    }else{
                        return false;
                    }
                },"event" : function(){
                    cancelTrigger.addEventListener("click",resetView);
                    submitTrigger.addEventListener("click",submitHandler);
                    topClsList.addEventListener("click",topClsFun);
                    subClsList.addEventListener("click",subClsFun);
                }
            };
        }

        function ClsTag_I(){
            var stateKey = "list";
            var topList = null;
            var freqList = null;
            var clsSelectList = null;
            var hideSearchViewFlag = false;
            var hideTopMultiCheck = false;
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
                    var topInterac = IssueTopCls_I();
                    var freqInterac = IssueFreqCls_I();
                    var issueConditionInterac = IssueCondition_I();
                    issueConditionInterac.setView();
                    issueConditionInterac.setTime(startTime,endTime);
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
                        var searchView = conView.search;
                        var selectedTagViewNode = conView.condition;
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
                                if(hasClass(searchView,"hide")){
                                    hideSearchViewFlag = true;
                                }else{
                                    addClass(searchView,"hide");
                                    addClass(selectedTagViewNode,"hide");
                                }
                                removeViewSelectedStyle("top");
                                removeViewSelectedStyle("freq");
                                hasClass(topMultiCheckView,"hide") ? hideTopMultiCheck = true : addClass(topMultiCheckView,"hide");
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
                                if(!hideSearchViewFlag){
                                    removeClass(searchView,"hide");
                                    removeClass(selectedTagViewNode,"hide");
                                }else{
                                    hideSearchViewFlag = false;
                                }
                                !hideTopMultiCheck ?  removeClass(topMultiCheckView,"hide") : hideTopMultiCheck = false;
                                removeClass(freqMultiCheckView,"hide");
                                break;
                        }
                        if(operKey !== 'recover'){
                            stateKey = operKey;
                        }
                    });
                    topInterac.event();
                    freqInterac.event();
                    issueConditionInterac.event();
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
                        if(thisKey === 'addIssue' || thisKey === 'editIssue'){
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
                                            newTag.innerHTML = "<a>"+thisNode.firstChild.lastChild.innerText+"</a>";
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
                                        newTag.innerHTML = "<a>"+thisNode.firstChild.lastChild.innerText+"</a>";
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
                                topCheckFun(thisNode.parentNode.parentNode,false,true);
                            }
                        }else if(target.nodeName === 'A'){
                            thisNode = e.target.parentNode.parentNode;
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
                        }else if(e.target.nodeName === 'INPUT'){
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
                            var keyFlag = (thisKey === 'addIssue' || thisKey === 'editIssue') ? true : false;
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

        function IssueCondition_I(){
            var selectView = conView.condition;
            var statusView = selectView.querySelector(".status_select");
            var selectTrigger = selectView.querySelector(".triggerBtn");
            var clsSelectList = selectView.querySelector(".cls-select-list");
            var statusSelectList = selectView.querySelector(".status-select-list");
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
            var addClsListItem = function(selectTagItem){
                if(checkList(selectTagItem.getAttribute("data-id"))){
                    addItemDeleteStyle(selectTagItem);
                    if(allSelectTag.parentNode === clsSelectList){
                        setAllFrag(false);
                    }
                    if(!selectTagItem.hasAttribute("data-topId")){
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
            var getConditionInfo = function(){
                var startTime = startTimeInput.value;
                var endTime = endTimeInput.value;
                var radioBtns = statusSelectList.querySelectorAll("input[type=\"radio\"]");
                var startTimeCheck = timeSelectList.querySelector("input[value=\"0\"]");
                var getStatusValue = function(){
                    for(var i=0,len=radioBtns.length;i<len;i++){
                        var thisRadio = radioBtns[i];
                        if(thisRadio.checked && thisRadio.value !== "-1"){
                            return thisRadio.value;
                        }
                    }
                    return null;
                };
                if(compareDate(startTime,endTime)){
                    var tagItems = clsSelectList.children;
                    var tagIds = new Array();
                    var data = {};
                    var status = getStatusValue();
                    if(status !== null){
                        data.status = status;
                    }
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
            var checkListFun = function(target,callBack){
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
                        callBack(thisCheck);
                    }
                }
            };
            return {
                "setView" : function(){
                    var thisContext = Context("conditionView");
                    thisContext.setTrait("addClsListItem",addClsListItem);
                    thisContext.setTrait("statusTagView",statusView);
                    thisContext.setTrait("clsSelectList",clsSelectList);
                    thisContext.setTrait("statusSelectList",statusSelectList);
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
                    var issueListContext = controller.getGContext("issueList");
                    var loadDataContext = issueListContext.getTrait("loadDataContext");
                    var selectEventProcess = function(){
                        var resetIssueList = issueListContext.getTrait("resetList");
                        nowCondition.info = getConditionInfo();
                        loadDataContext.setNum(0);
                        loadDataContext.setReqData(getConditionInfo());
                        loadDataContext.process(function(res){
                            if(res){
                                var resData = JSON.parse(res);
                                parseInt(resData.countIssue) > 0 ? resetIssueList(resData) : issueListContext.getTrait("emptyInfoDisplay")();
                                contentChange("contentShift")(1,0);
                            }else{
                                resetIssueList();
                            }
                        });
                    };
                    controller.getGContext("conditionView").setTrait("selectEventProcess",selectEventProcess);
                    statusSelectList.addEventListener("click",function(e){
                        checkListFun(e.target,function(thisCheck){
                            var startTimeCheck = timeSelectList.querySelector("input[value=\"0\"]");
                            var endTimeCheck = timeSelectList.querySelector("input[value=\"1\"]");
                            if(endTimeCheck.checked){
                                thisCheck.value === "2" ? endTimeCheck.checked = true : startTimeCheck.checked = true;
                            }
                        });
                    });
                    timeSelectList.addEventListener("click",function(e){
                        checkListFun(e.target,function(thisCheck){
                            if(thisCheck.value === "1"){
                                var solvedCheck = statusSelectList.querySelector("input[value=\"2\"]");
                                if(!solvedCheck.checked){
                                    solvedCheck.checked = true;
                                }
                            }
                        });
                    });
                    selectTrigger.addEventListener("click",function(){
                        selectEventProcess();
                    });
                }
            };
        };

        function IssueTopCls_I(){
            var topClassifyView = conView.topClassify;
            var countTopNode = topClassifyView.querySelector(".count-top-tag");
            var multiCheckView = topClassifyView.querySelector(".topCls-select-check");
            var classViewTrigger = topClassifyView.querySelector(".class-view-trigger");
            var listNode = topClassifyView.querySelector(".topCls-display-list");
            var emptyTipHtml = listNode.innerHTML;
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
                    if(listNode.innerHTML.length > 0){
                        listNode.innerHTML = "";
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
                    countTopNode.innerText = listDataLen+"项";
                    classViewTrigger.removeAttribute("style");
                    removeClass(multiCheckView,"hide");
                }else{
                    var listNodeHtml = listNode.innerHTML;
                    if(listNodeHtml.length > 0 && listNodeHtml !== emptyTipHtml){
                        listNode.innerHTML = emptyTipHtml;
                    }
                    countTopNode.innerText = "空";
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
                            checkInfo.condition.push({"key":"add","item":selectItemNode});
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

        function IssueFreqCls_I(){
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
                    thisContext.setTrait("updateList",function(){
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

        function IssueSearch_I(){
            var searchInput = conView.search.querySelector(".issue-search-input");
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
                o.issueList = issueList_I();
                o.pageTab = PageTab_I();
                o.clsTag = ClsTag_I();
                o.issueSearch = IssueSearch_I();
                viewFrag.editIssue.appendChild(conView.issueEdit);
                removeClass(conView.issueEdit,"hide");
                o.pageTab.setView();
                o.issueList.setView(pageData["issueList"],pageData["issueTagList"],pageData["recentDocList"],pageData["statusList"],pageData["countIssue"]);
                o.clsTag.setView(pageData["topClsList"],pageData["freqClsList"],pageData["minTime"],formatDate(new Date()));
                o.clsTag.event();
                o.issueList.event();
                o.pageTab.event();
                o.issueSearch.event();
                sectionTouch.event();
            },"free":function(){
                sectionTouch.removeEvent();
                o.issueList = o.pageTab = o.clsTag = o.issueSearch = o.sectionTouch = null;
            }
        };
    }
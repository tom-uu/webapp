function IssueDocs_V(controller,issueContent,viewFrag,issueId,issueData,docData,GetDocInfo_C,LoadDocList_C){
    var viewController = Controller("IssueDocs");
    var sectionTouch = SectionTouch_I(issueContent);
    sectionTouch.setView(controller);
    var contentChange = ContentChange_I(controller);
    var contextKey = viewDisplay(true); 
    var editorContextKey = "textEditor";
    var readerContextKey = "textReader";
    var thisViewNode = issueContent.querySelector("#issue-docs-view");
    var issueTopView = thisViewNode.querySelector("#issue-top-view");
    var dateConditionView = issueContent.querySelector(".issue-condition-view");
    var docSearchView = issueContent.querySelector(".issue-search-view");
    var infoView = thisViewNode.children[0];
    var issueDocPageBarNode = infoView.querySelector(".paging");
    var pageBarTemp = issueDocPageBarNode.cloneNode(true);
    var pageBarOriHtml = issueDocPageBarNode.innerHTML;
    var docView = thisViewNode.querySelector(".docs-list-view");
    var tagSectionView = thisViewNode.querySelector(".section_content_tag");
    var emptyDocText = docView.innerText;
    var recentDocHtml = "";
    var textEditorFrag = viewFrag[editorContextKey];
    var textReaderFrag = viewFrag[readerContextKey];
    var docViewFrag = document.createDocumentFragment();
    var docChanged_f = false;
    var dimensionView = View({"node":thisViewNode.children[1]});
    dimensionView.init();
    var issueBottomView = issueTopView.querySelector(".issue-bottom-view");
    var writeDocTrigger = issueBottomView.querySelector(".wirte-doc-trigger");
    var rmDocTrigger = issueBottomView.querySelector(".rm-doc-trigger");
    var rmDocBtnView = issueBottomView.querySelector(".rm-doc-btns-view");
    var addDocTrigger = issueBottomView.querySelector(".add-doc-trigger");
    var rmAddDocTrigger = issueBottomView.querySelector(".rm-add-doc-trigger");
    var cancelRmBtn = rmDocBtnView.querySelector(".cancel-rm-btn");
    var allCheck = rmDocBtnView.querySelector("input");   
    var addDocPagingInterac = null;
    var reloadIssueDocList = false;
    var orderDocReadTask = {
        task : new Array(),
        push : function(orderReadTask){
            var thisTask = this.task;
            if(thisTask.length === 0){
                thisTask.push(orderReadTask);
            }
        },pop : function(){
            var thisTask = this.task;
            if(thisTask.length === 1){
                return thisTask.pop();
            }
        },get : function(){
            return this.task.length > 0 ? this.task[0] : false;
        },set : function(key,value){
            var orderDocRead = this.get();
            if(orderDocRead !== false && (key === "startNum" || key === "countDoc")){
                orderDocRead[key] = value;
            }
        },orderRead_v(orderId,countDoc,startNum,orderName){
            return {
                "countDoc" : countDoc,
                "startNum" : startNum,
                "orderName" : orderName,
                "getOrderId" : function(startNum,callBack){
                    getOrderDocId_c(orderId,startNum)(function(res){
                        if(res){
                            var docData = JSON.parse(res);
                            if(docData.hasOwnProperty("docId")){
                                callBack(docData.docId);
                            }
                        }else{
                            alert("获取文档信息失败.");
                        }
                    });
                }
            };
        }
    };

    function setController(pageCallBack,resetDocListCallBack,setPopInfo){
        var thisContext = Context(contextKey);
        thisContext.setTrait("viewDisplay",viewDisplay);
        thisContext.setTrait("reset",{
            "textEditor":function(info){
                if(info.hasOwnProperty("add") && info.add){
                    resetDocListCallBack(function(){
                        if(!docChanged_f){
                            docChanged_f = true;
                            viewController.getGContext("issueInfo").getTrait("docCountIncrease")();
                        }
                        setPopInfo(thisContext);
                    });
                }
            }
        });
        thisContext.setTrait("pageBack",function(){
            pageCallBack(thisContext);
        });
        controller.pushContext(thisContext);
    }

    function viewDisplay(flag){
        var viewKey = "issueDocs";
        var issueDocsFrag = viewFrag[viewKey];
        if(flag && issueDocsFrag.childElementCount > 0){
            issueContent.appendChild(issueDocsFrag);
            contentChange("contentShift")(1,0);
            contentChange("setScroll")(issueContent.querySelector("#issue-docs-view").children[0]);
        }else if(!flag){
            var subContentNodes = issueContent.children;
            contentChange("recordScroll")(subContentNodes[0].children[0]);
            while(subContentNodes.length > 0){
                issueDocsFrag.appendChild(subContentNodes[0]);
            }
        }
        return viewKey;
    }

    function getAddDocList_c(classId,startNum,limitNum){
        return function(callBack){
            requestServer("POST","/webapp/controllers/IssueDocAction.php/GetAddDocList/"+startNum+'/'+limitNum+'/',JSON.stringify({"issueId":issueId,"classId":classId}),function(resText){
                callBack(resText);
            });
        };
    }

    function addIssueDocInfo_c(classId,docId,startNum){
        return function(callBack){
            requestServer("POST","/webapp/controllers/IssueDocAction.php/AddDocInfoByList/"+startNum+'/',JSON.stringify({"issueId":issueId,"classId":classId,"docId":docId}),function(res){
                callBack(res);
            });
        };
    }

    function deleteIssueDocInfo_c(docIds,startNum,limitNum){
        return function(callBack){
            requestServer("POST","/webapp/controllers/IssueDocAction.php/DeleteDocInfo/"+issueId+'/'+startNum+'/'+limitNum+'/',JSON.stringify({"docIds":docIds}),function(res){
                callBack(res);
            });
        };
    }

    function loadOrderList_c(){
        return function(callBack){
            requestServer("GET","/webapp/controllers/IssueOrderAction.php/LoadView/"+issueId+'/',null,function(res){
                callBack(res);
            });
        };
    }

    function updateOrderName_c(orderId,orderName){
        return function(callBack){
            requestServer("POST","/webapp/controllers/IssueOrderAction.php/UpdateOrderName/"+issueId+'/'+orderId+'/',JSON.stringify({"orderName":orderName}),function(res){
                callBack(res);
            });
        };
    }

    function addCollectOrder_c(orderIds){
        return function(callBack){
            requestServer("POST","/webapp/controllers/CollectAction.php/AddCollectOrder/",JSON.stringify({"issueId":issueId,"orderIds":orderIds}),function(res){
                callBack(res);
            });
        };
    }
    
    function addOrder_c(orderName){
        return function(callBack){
            requestServer("POST","/webapp/controllers/IssueOrderAction.php/AddOrder/"+issueId+'/',JSON.stringify({"orderName":orderName}),function(res){
                callBack(res);
            });
        };
    }

    function deleteOrder_c(orderIds){
        return function(callBack){
            requestServer("POST","/webapp/controllers/IssueOrderAction.php/DeleteOrder/"+issueId+'/',JSON.stringify({"orderIds":orderIds}),function(res){
                callBack(res);
            });
        };
    }
    
    function deleteMark_c(collectIds){
        return function(callBack){
            requestServer("POST","/webapp/controllers/CollectAction.php/DeleteCollectOrder/",JSON.stringify({"ids":collectIds}),function(res){
                callBack(res);
            });
        };
    }
    
    function arrageOrderDoc_c(orderId,docId,refDocId){
        return function(callBack){
            requestServer("GET","/webapp/controllers/IssueOrderAction.php/ArrageOrderDoc/"+issueId+'/'+orderId+'/'+docId+'/'+refDocId+'/',null,function(res){
                callBack(res);
            });
        };
    }

    function getOrderDocInfo_c(orderId,startNum,limitNum){
        return function(callBack){
            requestServer("GET","/webapp/controllers/IssueOrderAction.php/GetOrderDocList/"+issueId+'/'+orderId+'/'+startNum+'/'+limitNum+'/',null,function(res){
                callBack(res);
            });
        };
    }

    function getOrderDocId_c(orderId,startNum){
        return function(callBack){
            requestServer("GET","/webapp/controllers/IssueOrderAction.php/GetOrderDocId/"+issueId+'/'+orderId+'/'+startNum+'/',null,function(res){
                callBack(res);
            });
        };
    }

    function deleteOrderDocInfo_c(orderId,docIds){
        return function(callBack){
            requestServer("POST","/webapp/controllers/IssueOrderAction.php/DeleteOrderDoc/"+issueId+'/'+orderId+'/',JSON.stringify({"docIds":docIds}),function(res){
                callBack(res);
            });
        };
    }

    function addOrderDoc_c(orderId,docId,startNum){
        return function(callBack){
            requestServer("POST","/webapp/controllers/IssueOrderAction.php/AddOrderDoc/"+issueId+'/'+orderId+'/'+startNum+'/',JSON.stringify({"docId":docId}),function(res){
                callBack(res);
            });
        };
    }

    function getIssueDocInfoByOrder_c(orderId,startNum,limitNum){
        return function(callBack){
            requestServer("GET","/webapp/controllers/IssueOrderAction.php/GetIssueDocList/"+issueId+'/'+orderId+'/'+startNum+'/'+limitNum+'/',null,function(res){
                callBack(res);
            });
        };
    }
    
    function loadDocPathView_c(){
        return function(callBack){
            requestServer("GET","/webapp/controllers/ClassAction.php/GetTopClass/doc/",null,function(resText){
                callBack(resText);
            });
        };
    }
    
    function setIssueDocPageBar(pageBarNode,countDoc,addStyleFlag){
        if(countDoc > 0){
            var pagingInteraction = PagingInteraction(pageBarNode);
            var resetDocList = function(docListData){
                viewController.getGContext("docList").getTrait("loadDocList")(docListData,addStyleFlag,false);
                pagingInteraction.setPage(parseInt(docListData["countDoc"]),1);
            };
            pagingInteraction.initPaging(countDoc,1,function(startNum,pageBarCallBack){
                GetDocInfo_C(issueId,startNum,10,0)(function(res){
                    var flag = false;
                    if(res !== false){
                        resetDocList(JSON.parse(res));
                        flag = true;
                    }else{
                        alert("获取文档信息时出现错误.");
                    }
                    pageBarCallBack(flag);
                });
            });
            pagingInteraction.event();
            return pagingInteraction;
        }else{
            return null;
        }
    }

    function callView(contextKey,docId){
        if(contextKey === "textReader"){
            var allowEdit = docView === thisViewNode.querySelector(".docs-list-view") ? true : false;
            TextReader_V(controller,issueContent,viewFrag,docId,allowEdit,orderDocReadTask.get());
        }else if(contextKey === "textEditor"){
            TextEditor_V(controller,issueContent,viewFrag,issueId,{});
        }
        controller.getGContext("tabView").getTrait("setView")(contextKey);
    }

    function loadViewContext(viewFrag,contextKey,docId){
        viewDisplay(false);
        if(viewFrag.childElementCount === 0){
            addCss("/webapp/css/"+contextKey+".css");
            LoadCompView_C(contextKey)(function(res){
                var fileData = JSON.parse(res);
                loadView(contextKey,issueContent,fileData["html"],function(){
                    callView(contextKey,docId);
                });
            });
        }else if(checkViewScript(contextKey)){
            callView(contextKey,docId);
        }
    }

    function issueInfo_v(){
        var issueDescText = issueTopView.querySelector(".issue-desc-text");
        var infoList = issueTopView.querySelector(".issue-info-list");
        var timeText = issueTopView.querySelector(".issue-display-timeText");
        var endTimeView = issueBottomView.querySelectorAll(".issue-time-view")[1];
        var writeDocTrigger = issueBottomView.querySelector(".wirte-doc-trigger");
        var tagIcons = infoList.querySelectorAll(".tag_icon");
        var topIcon = tagIcons[0];
        var subIcon = tagIcons[1];
        var topTagNode = tagIcons[0].nextSibling;
        var m_get = {
            "docCount" : function(){
                return infoList.querySelector(".doc-count-text").innerText;
            }
        };
        var m_set = {
            "desc" : function(text){
                issueDescText.innerText = text;
            },"docCount" : function(text){
                infoList.querySelector(".doc-count-text").innerText = text;
            },"time" : function(text){
                timeText.innerText = text;
            },"endTime" : function(data){
                endTimeView.innerHTML = endTimeView.previousSibling.innerHTML;
                endTimeView.firstChild.innerText = data.tip;
                endTimeView.lastChild.innerText = data.time;
            },"topTag" : function(text){
                topTagNode.firstChild.innerText = text;
            },"subTags" : function(html){
                infoList.innerHTML += html;
            }
        };
        var issue_m = Model("view",m_get,m_set);
        var loadEditor_i = function(){
            loadViewContext(textEditorFrag,editorContextKey);
        };
        var setViewData = function(){
            if(issueData.hasOwnProperty("desc") && issueData.hasOwnProperty("docCount") && issueData.hasOwnProperty("time")){
                issue_m("set")("desc",issueData.desc);
                issue_m("set")("docCount",issueData.docCount);
                issue_m("set")("time",issueData.time);
                if(issueData.hasOwnProperty("tagList")){
                    var tagListData = issueData.tagList;
                    if(tagListData.hasOwnProperty("topTag")){
                        removeClass(topIcon,"hide");
                        issue_m("set")("topTag",tagListData.topTag);
                    }
                    if(tagListData.hasOwnProperty("subTag")){
                        var subTags = tagListData.subTag;
                        removeClass(subIcon,"hide");
                        var subTagsHtml = "";
                        fetchArr(subTags,function(i){
                            subTagsHtml += "<li class=\"sub-tag\"><span>"+subTags[i]+"</span></li>";
                        });
                        issue_m("set")("subTags",subTagsHtml);
                    }
                }
                if(issueData.hasOwnProperty("endTime")){
                    issue_m("set")("endTime",{"tip":"终结于","time":issueData.endTime});
                }
            }
        };
        return {
            "cleanView" : function(){
                var emptyValue = "";
                issue_m("set")("desc",emptyValue);
                issue_m("set")("docCount",emptyValue);
                issue_m("set")("time",emptyValue);
                issue_m("set")("endTime",{"tip":emptyValue,"time":emptyValue});
                docView.innerHTML = emptyDocText;
                if(topTagNode.firstChild.innerText.length > 0){
                    var subTagNodes = infoList.querySelectorAll(".sub-tag");
                    issue_m("set")("topTag",emptyValue);
                    fetchArr(subTagNodes,function(i){
                        infoList.removeChild(subTagNodes[i]);
                    });
                    addClass(topIcon,"hide");
                    addClass(subIcon,"hide");
                }
                recentDocHtml = "";
            },"setView" : function(){
                setViewData();
            },"event" : function(){
                writeDocTrigger.addEventListener("click",loadEditor_i);
            },"removeEvent" : function(){
                writeDocTrigger.removeEventListener("click",loadEditor_i);
            },"trait" : function(){
                var thisContext = Context("issueInfo");
                thisContext.setTrait("getDocNum",function(){
                    return issue_m("get")("docCount");
                });
                thisContext.setTrait("setDocNum",function(num){
                    issue_m("set")("docCount",num);
                });
                thisContext.setTrait("docCountIncrease",function(){
                    issue_m("set")("docCount",parseInt(issue_m("get")("docCount"))+1);
                });
                thisContext.setTrait("bottomBtnView",issueBottomView.querySelector("div"));
                return thisContext;
            }
        };
    }

    function docList_v(){
        var docItem_m = Model("item",{
            "docId" : function(item){
                return item.getAttribute("data-docId");
            }
        });
        var getDocListView = function(){
            return infoView.querySelector(".docs-list-view");
        };
        var getPageBarView = function(){
            return infoView.querySelector(".paging");
        };
        var docListViewEmpty = function(){
            var thisDocView = getDocListView();
            var thisPageBar = getPageBarView();
            thisDocView.innerHTML = emptyDocText;
            if(thisPageBar !== null){
               addClass(thisPageBar,"hide"); 
            }
        };
        var addDoc_c = {
            task : new Array(),
            push : function(callBack){
                this.task.push(callBack);
            },pop : function(){
                this.task.pop();
            },call : function(addBtn){
                var thisItem = addBtn.parentNode.parentNode;
                var pageBar = getPageBarView();
                var totalNum = parseInt(pageBar.querySelector(".page-totalItem-text").innerText);
                var pageNumBar = pageBar.querySelector(".page-num");
                var focusNum = pageNumBar.querySelector(".focus");
                var pageNum = focusNum !== null ? parseInt(focusNum.innerText) : 1;
                var startNum = totalNum > pageNum*10 ? pageNum*10-1 : totalNum-1;
                this.task[this.task.length-1](thisItem,pageNum,startNum);
            }
        };
        var docList_i = function(e){
            var thisNode = null;
            if(e.target.nodeName === "DIV" && e.target.hasAttribute("data-docId")){
                thisNode = e.target;
            }else if(e.target.nodeName === "H3" && e.target.parentNode.nodeName !== "HEADER" || e.target.nodeName === "P" && e.target.querySelector("icon") === null){
                thisNode = e.target.parentNode;
            }else if(e.target.nodeName === "SPAN" && e.target.parentNode.nodeName === "P" && hasClass(e.target,"icon")){
                addDoc_c.call(e.target);
            }
            if(thisNode !== null){
                orderDocReadTask.set("startNum",parseInt(thisNode.lastChild.firstChild.innerText)-1);
                loadViewContext(textReaderFrag,readerContextKey,docItem_m("get")(thisNode,"docId"));
            }
        };
        var createDocListView = function(){
            var newView = document.createElement("div");
            addClass(newView,"docs-list-view");
            return newView;
        };
        var setDocItemHtml = function(docData,timeMap,addStyleFlag){
            var thisId = docData.id;
            var docValue = docData.value;
            var thisTitle = docValue.title;
            var thisText = docValue.text;
            var time = timeMap[docData.id];
            var timeWords = "修改时间";
            var docHtml = "<div data-docid='"+thisId+"'>";
            if(thisTitle !== "0"){
                docHtml += "<h3>"+thisTitle+"</h3>";
            }
            docHtml +="<p>"+thisText+"</p><p>";
            if(addStyleFlag){
                docHtml +="<span class=\"icon\">&#xe806</span>";
            }
            if(docValue.hasOwnProperty("countAudio")){
                docHtml +="<span class=\"audio-tip\"><i class=\"icon\">&#xf1C7;</i> +"+docValue.countAudio+"</span>";
            }
            docHtml += "<span>"+timeWords+"</span><span>"+time+"</span>";
            docHtml +="</p></div>";
            return docHtml;
        };
        var loadDocList = function(docData,addStyleFlag,addItemHtmlFlag,loadEndingProcess){
            var rmLoading = loadingDisplay(document.body,"docList-loading");
            var thisDocView = getDocListView();
            var docInfo = (function(){
                var docInfo = {};
                docInfo.ids = new Array();
                docInfo.timeMap = {};
                if(docData.hasOwnProperty("docList")){
                    var docList = docData.docList;
                    fetchArr(docList,function(i){
                        var thisElem = docList[i];
                        var docId = thisElem.docId;
                        docInfo.ids.push(docId);
                        docInfo.timeMap[docId] = thisElem.time;
                    });
                }
                return docInfo;
            })();
            var docIds = docInfo.ids;
            var timeMap = docInfo.timeMap;
            var rmLoadingStyle = function(){
                rmLoading();
                if(thisDocView.firstChild.nodeType === 1 && typeof loadEndingProcess === "function"){
                    loadEndingProcess();
                }
                removeClass(thisDocView,"hide");
            };
            if(docIds.length > 0){
                LoadDocList_C(docIds)(function(res){
                    var docListData = JSON.parse(res);
                    if(docListData.length > 0){
                        var docViewHtml = "";
                        fetchArr(docListData,function(i){
                            docViewHtml += setDocItemHtml(docListData[i],timeMap,addStyleFlag);
                        });
                        if(addItemHtmlFlag){
                            thisDocView.innerHTML = thisDocView.innerText === emptyDocText ? docViewHtml : thisDocView.innerHTML+docViewHtml;
                        }else{
                            thisDocView.innerHTML = docViewHtml;
                        }
                    }
                    rmLoadingStyle();
                });
            }else{
                docListViewEmpty();
                rmLoadingStyle();
            }
        };
        var resetAddDocList = function(item,addDocPagingInterac,countDoc,pageNum,callBack){
            var docsListView = getDocListView();
            var addBtn = item.querySelector("span[class='icon']");
            addBtn.innerHTML = "&#xe805";
            addDocPagingInterac.setPage(countDoc,pageNum);
            setTimeout(function(){
                if(countDoc > 0){
                    docsListView.removeChild(item);
                }else{
                    docsListView.innerText = "没有待添加的文档项";
                    addClass(infoView.querySelector(".paging"),"hide");
                }
            },"100");
            if(typeof callBack === "function"){
                callBack();
            }
            orderDocReadTask.set("countDoc",countDoc);
        };
        var reloadAddDocList = function(addItem,addDocPagingInterac,docId,editTime,countDoc,pageNum,callBack){
            var docIds = new Array();
            docIds.push(docId);
            LoadDocList_C(docIds)(function(res){
                var docListData = JSON.parse(res);
                if(docListData.length > 0){
                    var tmpDiv = document.createElement("DIV");
                    var timeMap = {};
                    timeMap[docId] = editTime;
                    tmpDiv.innerHTML = setDocItemHtml(docListData[0],timeMap,true);
                    addItem.parentNode.appendChild(tmpDiv.firstChild);
                    resetAddDocList(addItem,addDocPagingInterac,countDoc,pageNum,callBack);
                }
            });
        };
        var fetchDocList = function(docListView,callBack){
            if(docListView.children.length > 0){
                var docItems = docListView.children;
                fetchArr(docItems,function(i){
                    var thisItem = docItems[i];
                    callBack(thisItem);
                });
            }
        };
        return {
            "event" : function(){
                infoView.addEventListener("click",docList_i);
            },"removeEvent" : function(){
                infoView.removeEventListener("click",docList_i);
            },"trait" : function(){
                var thisContext = Context("docList");
                thisContext.setTrait("docItem_m",docItem_m);
                thisContext.setTrait("getDocListView",getDocListView);
                thisContext.setTrait("createDocListView",createDocListView);
                thisContext.setTrait("setDocItemHtml",setDocItemHtml);
                thisContext.setTrait("loadDocList",loadDocList);
                thisContext.setTrait("resetAddDocList",resetAddDocList);
                thisContext.setTrait("reloadAddDocList",reloadAddDocList);
                thisContext.setTrait("fetchDocList",fetchDocList);
                thisContext.setTrait("addDoc_c",addDoc_c);
                thisContext.setTrait("docListViewEmpty",docListViewEmpty);
                return thisContext;
            }
        };
    }

    function issueDocList_v(){
        var pagingInterac = null;
        var docListContext = viewController.getGContext("docList");
        var docItem_m = docListContext.getTrait("docItem_m");
        var setDocItemHtml = docListContext.getTrait("setDocItemHtml");
        var loadDocList = docListContext.getTrait("loadDocList");
        var fetchDocList = docListContext.getTrait("fetchDocList");
        var loadDocListData = function(docData,setTimeCallBack){
            loadDocList(docData,false,false,function(){
                pagingInterac = setIssueDocPageBar(issueDocPageBarNode,parseInt(docData.countDoc),false);
                removeClass(issueDocPageBarNode,"hide");
            });
            if(typeof setTimeCallBack === "function"){
                var minTime = docData.hasOwnProperty("minTime") ? docData["minTime"] : null;
                setTimeCallBack(minTime,formatDate(new Date()));
            }
        };
        var setDocView = function(setTimeCallBack){
            docData !== null ? (function(){
                loadDocListData(docData,setTimeCallBack);
            })(): GetDocInfo_C(issueId,0,10,1)(function(res){
                var docData = JSON.parse(res);
                loadDocListData(docData,setTimeCallBack);
            });
        };
        var loadDocListProcess = function(docData,pageBarNode,callBack){
            loadDocList(docData,false,false,function(){
                if(reloadIssueDocList){
                   reloadIssueDocList = false; 
                }
                if(docView.firstChild.nodeName === "DIV"){
                    var firstDocView = docView.firstChild;
                    recentDocHtml = "<div data-docId='"+docItem_m("get")(firstDocView,"docId")+"'>"+firstDocView.innerHTML+"</div>";
                }
                if(typeof callBack === "function"){
                    callBack();
                }
                removeClass(pageBarNode,"hide");
            });
        };
        var resetDocView = function(callBack){
            GetDocInfo_C(issueId,0,10,1)(function(res){
                var docData = JSON.parse(res);
                var countDoc = parseInt(docData.countDoc);
                loadDocListProcess(docData,issueDocPageBarNode,callBack);
                pagingInterac === null ? setIssueDocPageBar(issueDocPageBarNode,countDoc,false) : pagingInterac.setPage(countDoc,1);
            });
        };
        var resetRmDocList = function(checkBoxes,countDoc,pageNum){
            pagingInterac.setPage(countDoc,pageNum);
            if(!docChanged_f){
                docChanged_f = true;
            }
            fetchArr(checkBoxes,function(i){
                var thisCheck = checkBoxes[i];
                if(thisCheck.checked){
                    docView.removeChild(thisCheck.parentNode);
                }
            });
            viewController.getGContext("issueInfo").getTrait("setDocNum")(countDoc);
            var firstItem = docView.firstChild;
            if(firstItem !== null){
               recentDocHtml = "<div data-docId='"+docItem_m("get")(firstItem,"docId")+"'>"+firstItem.innerHTML.replace("<input type=\"checkbox\">","")+"</div>";
            }else{
               recentDocHtml = "";
               docView.innerHTML = emptyDocText;
               addClass(issueDocPageBarNode,"hide");
            }
            if(allCheck.checked){
                allCheck.checked = false;
            }
        };
        var loadPopDocInfo = function(popDocIds,timeMap,callBack){
            LoadDocList_C(popDocIds)(function(res){
                var docListData = JSON.parse(res);
                if(docListData.length > 0){
                    var frag = document.createDocumentFragment();
                    fetchArr(docListData,function(i){
                        var thisData = docListData[i];
                        var tmpDiv = document.createElement("DIV");
                        tmpDiv.innerHTML = setDocItemHtml(thisData,timeMap,false);
                        var docDiv = tmpDiv.firstChild;
                        docDiv.innerHTML = "<input type=\"checkbox\">"+docDiv.innerHTML;
                        frag.appendChild(docDiv);
                        tmpDiv = null;
                    });
                    docView.appendChild(frag);
                    callBack();
                }
            });
        };
        var deleteDocInfo = function(checkBoxes,docIds,startNum,limitNum,pageNum){
            deleteIssueDocInfo_c(docIds,startNum,limitNum)(function(res){
                if(res){
                    var data = JSON.parse(res);
                    var countDoc = parseInt(viewController.getGContext("issueInfo").getTrait("getDocNum")());
                    if(data.hasOwnProperty("docList")){
                        countDoc = parseInt(data["countDoc"]);
                        var docList = data.docList;
                        var popDocIds = new Array();
                        var timeMap = {};
                        fetchArr(docList,function(i){
                            var thisInfo = docList[i];
                            var thisId = thisInfo.docId;
                            popDocIds.push(thisId);
                            timeMap[thisId] = thisInfo["time"];
                        });
                        popDocIds.length > 0 ? loadPopDocInfo(popDocIds,timeMap,function(){
                            resetRmDocList(checkBoxes,countDoc,pageNum);
                        }) : resetRmDocList(checkBoxes,countDoc,pageNum);
                    }else{
                        resetRmDocList(checkBoxes,countDoc,pageNum);
                    }
                    tipView(true,"已从该问题移除所选文档.");
                }
            });
        };
        var allCheckBtn_i = function(){
            var allCheckFun = allCheck.checked ? function(docItem){
                var checkBox = docItem.querySelector("input");
                if(!checkBox.checked){
                    checkBox.checked = true;
                }
            } : function(docItem){
                var checkBox = docItem.querySelector("input");
                if(checkBox.checked){
                    checkBox.checked = false;
                }
            };
            fetchDocList(docView,allCheckFun);
        };
        var deleteDoc_i = function(){
            var checkBoxes = docView.querySelectorAll("input[type=\"checkbox\"]");
            var docIds = new Array();
            var totalNum = parseInt(issueDocPageBarNode.querySelector(".page-totalItem-text").innerText);
            var pageNumBar = issueDocPageBarNode.querySelector(".page-num");
            var focusNum = pageNumBar.querySelector(".focus");
            var pageNum = focusNum !== null ? parseInt(focusNum.innerText) : 1; 
            fetchArr(checkBoxes,function(i){
                var thisCheck = checkBoxes[i];
                if(thisCheck.checked){
                    docIds.push(docItem_m("get")(thisCheck.parentNode,"docId"));
                }
            });
            var countIds = docIds.length;
            var startNum = totalNum > pageNum*10 ? pageNum*10-countIds : totalNum-countIds;
            var limitNum = pageNum < totalNum ? countIds : 0;
            deleteDocInfo(checkBoxes,docIds,startNum,limitNum,pageNum);
        };
        var rmDocBtnView_i = function(e){
            if(e.target.nodeName === "A"){
                deleteDoc_i();
            }else if(e.target.nodeName === "INPUT"){
                allCheckBtn_i();
            }
        };
        var rmDocEvent = function(key){
            if(key === "add"){
                rmDocBtnView.addEventListener("click",rmDocBtnView_i);
            }else if(key === "remove"){
                rmDocBtnView.removeEventListener("click",rmDocBtnView_i);
            }
        };
        var rmDoc_i = function(){
            addClass(writeDocTrigger,"hide");
            addClass(addDocTrigger,"hide");
            addClass(rmDocTrigger,"hide");
            removeClass(rmDocBtnView,"hide");
            addClass(docView,"check-style");
            fetchDocList(docView,function(docItem){
                docItem.innerHTML = "<input type=\"checkbox\">"+docItem.innerHTML;
            });
            rmDocEvent("add");
        };
        var cancelRm_i = function(){
            if(!hasClass(rmDocBtnView,"hide")){
                addClass(rmDocBtnView,"hide");
                removeClass(rmDocTrigger,"hide");
                removeClass(addDocTrigger,"hide");
                removeClass(writeDocTrigger,"hide");
                fetchDocList(docView,function(docItem){
                    docItem.innerHTML = docItem.innerHTML.replace("<input type=\"checkbox\">","");
                });
                rmDocEvent("remove");
                if(allCheck.checked){
                    allCheck.checked = false;
                }
                removeClass(docView,"check-style");
            }
        };
        return {
            "setView" : function(setTimeCallBack){
                setDocView(setTimeCallBack);
            },"cleanView" : function(){
                cancelRm_i();
                issueDocPageBarNode.innerHTML = pageBarOriHtml;
                addClass(docView,"hide");
                addClass(issueDocPageBarNode,"hide");
                pagingInterac = null;
            },"event" : function(){
                rmDocTrigger.addEventListener("click",rmDoc_i);
                cancelRmBtn.addEventListener("click",cancelRm_i);
            },"removeEvent" : function(){
                rmDocTrigger.removeEventListener("click",rmDoc_i);
                cancelRmBtn.removeEventListener("click",cancelRm_i);
            },"trait" : function(){
                var thisContext = Context("issueDocList");
                thisContext.setTrait("resetDocView",resetDocView);
                return thisContext;
            }
        };
    }

    function addIssueDocList_v(){
        var docListContext = viewController.getGContext("docList");
        var docItem_m = docListContext.getTrait("docItem_m");
        var createDocListView = docListContext.getTrait("createDocListView");
        var loadDocList = docListContext.getTrait("loadDocList");
        var resetAddDocList = docListContext.getTrait("resetAddDocList");
        var reloadAddDocList = docListContext.getTrait("reloadAddDocList");
        var addDoc_c = docListContext.getTrait("addDoc_c");
        var addDocViewDisplay = function(flag,hideFlag){
            if(flag){
                var addDocView = infoView.querySelector(".docs-list-view");
                if(addDocView === null){
                    var newFrag = document.createDocumentFragment();
                    var addDocView = createDocListView();
                    var addPageBar = pageBarTemp.cloneNode(true);
                    addDocView.innerText = "没有待添加的文档项";
                    addClass(addPageBar,"hide");
                    newFrag.appendChild(addDocView);
                    newFrag.appendChild(addPageBar);
                    infoView.appendChild(newFrag);
                    return addPageBar;
                }else if(hasClass(addDocView,"hide")){
                    var addPageBar = infoView.querySelector(".paging");
                    removeClass(addDocView,"hide");
                    removeClass(addPageBar,"hide");
                    return addPageBar;
                }
                
            }else{
                var addDocListView = infoView.querySelector(".docs-list-view");
                var addPageBar = infoView.querySelector(".paging");
                if(addDocListView !== null){
                    if(hideFlag){
                        addClass(addDocListView,"hide");
                        addClass(addPageBar,"hide");
                    }else{
                        infoView.removeChild(addDocListView);
                        addDocListView = null;
                        if(addPageBar !== null){
                            infoView.removeChild(addPageBar);
                            addPageBar = null;
                        }
                    }
                }
            }
        };
        var getPathView = function(){
            return infoView.querySelector(".path-view");
        };
        var rmDocPathView = function(){
            var pathView = getPathView();
            if(pathView !== null){
                infoView.removeChild(pathView);
                pathView = null;
            }
        };
        var docViewDisplay = function(flag){
            if(flag && hasClass(addDocTrigger,"hide")){
                infoView.appendChild(docViewFrag);
                addClass(rmAddDocTrigger,"hide");                   
                removeClass(rmDocTrigger,"hide");
                removeClass(addDocTrigger,"hide");
                removeClass(writeDocTrigger,"hide");
            }else if(!flag && hasClass(rmAddDocTrigger,"hide")){
                docViewFrag.appendChild(docView);
                docViewFrag.appendChild(issueDocPageBarNode);
                addClass(writeDocTrigger,"hide");
                addClass(addDocTrigger,"hide");
                addClass(rmDocTrigger,"hide");
                removeClass(rmAddDocTrigger,"hide");
            }
        };
        var loadDocListProcess = function(res,pageBarNode,callBack){
            var docData = JSON.parse(res);
            var countDoc = parseInt(docData.countDoc);
            loadDocList(docData,true,false,function(){
                if(typeof callBack === "function"){
                    callBack();
                }
                removeClass(pageBarNode,"hide");
            });
            return countDoc;
        };
        var getAddClassId = function(){
            var pathView = getPathView();
            var catalogueTip = pathView.querySelector(".catalogue-tip");
            return catalogueTip.querySelector(".group-tip").getAttribute("data-id");
        };
        var addDocCallBack = function(thisItem,pageNum,startNum){
            var setFlags = function(){
                reloadIssueDocList = true;
                if(!docChanged_f){
                    docChanged_f = true;
                }
            };
            addIssueDocInfo_c(getAddClassId(),docItem_m("get")(thisItem,"docId"),startNum)(function(res){
                if(res){
                    var data = JSON.parse(res);
                    var countDoc = parseInt(data.countDoc);
                    if(data.hasOwnProperty("docInfo") && data.docInfo){
                        var docInfo = data.docInfo;
                        var docId = docInfo["docId"];
                        var editTime = docInfo["time"];
                        reloadAddDocList(thisItem,addDocPagingInterac,docId,editTime,countDoc,pageNum,function(){
                            tipView(true,"已在该问题下添加新文档.");
                        });
                        setFlags();
                    }else if(data.docInfo === null){
                        resetAddDocList(thisItem,addDocPagingInterac,countDoc,pageNum-1);
                        tipView(true,"已在该问题下添加新文档.");
                        setFlags();
                    }
                    viewController.getGContext("issueInfo").getTrait("docCountIncrease")();
                }else{
                    alert("添加文档失败");
                }
            });
        };
        var loadDocPathView = function(pathView){
            var docGroupSelectCallBack = function(clsId,countDoc){
                addClass(pathView,"contract");
                if(countDoc === 0){
                    addDocViewDisplay(true);
                    viewController.getGContext("docList").getTrait("docListViewEmpty")();
                }else{
                    getAddDocList_c(clsId,0,10)(function(res){
                        var addPageBar = addDocViewDisplay(true);
                        var countDoc = loadDocListProcess(res,addPageBar);
                        if(addDocPagingInterac !== null){
                            addDocPagingInterac.setPage(countDoc,1);
                        }else{
                            addDocPagingInterac = PagingInteraction(addPageBar);
                            addDocPagingInterac.initPaging(countDoc,1,function(startNum,pageBarCallBack){
                                getAddDocList_c(clsId,startNum,10)(function(res){
                                    var flag = false;
                                    if(res !== false){
                                        var docListData = JSON.parse(res);
                                        loadDocList(docListData,true,false);
                                        addDocPagingInterac.setPage(parseInt(docListData["countDoc"]),1);
                                        flag = true;
                                    }else{
                                        alert("获取文档列表出错.");
                                    }
                                    pageBarCallBack(flag);
                                });
                            });
                            addDocPagingInterac.event();
                        }
                    });
                }
            };
            var docPathViewFun = function(pathData){
                docViewDisplay(false);
                thisViewNode.querySelector(".section_content_item").appendChild(pathView);
                DocPath_V(pathView,pathData,issueId,docGroupSelectCallBack,function(){
                    addDocViewDisplay(false,true);
                    removeClass(pathView,"contract");
                });
            };
            loadDocPathView_c()(function(res){
                var pageData = JSON.parse(res);
                typeof DocPath_V === "undefined" ? loadScriptBySrc("/webapp/script/view/docPath.js",function(){
                    docPathViewFun(pageData);
                }) : docPathViewFun(pageData);
            });
        };
        var addDoc_i = function(){
            var newDiv = document.createElement("div");
            addCss(getViewCss("docPath"));
            newDiv.innerHTML = "<div><div class=\"path-head-view\"><span class=\"catalogue-title\"></span></div><div class=\"path-list-view\"><ul class=\"folder\"></ul></div></div>";
            addClass(newDiv,"path-view");
            var navHeight = document.getElementById('outerNav').offsetHeight;
            var toggleLen = navHeight+issueTopView.offsetHeight-6;
            var scrollEvent = function(){
                var scrollY = compatScrollY();
                scrollY-toggleLen > 0 ? addClass(newDiv,"path-scroll") : removeClass(newDiv,"path-scroll");
            };
            window.addEventListener("scroll",scrollEvent);
            loadDocPathView(newDiv);
        };
        var rmAddDoc_i = function(){
            if(!hasClass(rmAddDocTrigger,"hide")){
                rmDocPathView();
                addDocViewDisplay(false);
                docViewDisplay(true);
                if(reloadIssueDocList){
                    viewController.getGContext("issueDocList").getTrait("resetDocView")();
                }
                addDocPagingInterac = null;
            }
        };
        return {
            "setView" : function(){
                addDoc_c.push(addDocCallBack);
            },"cleanView" : function(){
                rmAddDoc_i();
            },"event" : function(){
                addDocTrigger.addEventListener("click",addDoc_i);
                rmAddDocTrigger.addEventListener("click",rmAddDoc_i);
            },"removeEvent" : function(){
                addDocTrigger.removeEventListener("click",addDoc_i);
                rmAddDocTrigger.removeEventListener("click",rmAddDoc_i);
            }
        };
    }

    function orderDoc_v(){
        var docOrderView = tagSectionView.querySelector(".doc-order-view");
        var collectTrigger = docOrderView.querySelector(".collect-trigger");
        var addTrigger = docOrderView.querySelector(".add-trigger");
        var deleteTrigger = docOrderView.querySelector(".delete-trigger");
        var orderList = docOrderView.querySelector(".order-list");
        var deleteBtnsView = docOrderView.querySelector(".delete-btns-view");
        var collectBtnsView = docOrderView.querySelector(".collect-btns-view");
        var orderEmptyHtml = orderList.innerHTML;
        var onOrderDocContexts = new Array();
        var collectCounter = 0;
        var m_get = {
            "orderId" : function(item){
                return item.getAttribute("data-orderId");
            },"orderName" : function(item){
                return item.querySelector(".order-name").innerText;
            },"orderDocsNum" : function(item){
                return item.firstChild.firstChild.innerText;
            },"time": function(item){
                return item.getAttribute("data-time");
            },"collectId" : function(item){
                return item.getAttribute("data-collectId");
            }
        };
        var m_set = {
            "orderName" : function(item,orderName){
                item.querySelector(".order-name").innerText = orderName;
            },"orderDocsNum" : function(item,orderDocsNum){
                item.firstChild.firstChild.innerText = orderDocsNum;
            },"collectId" : function(item,collectId){
                item.setAttribute("data-collectId",collectId);
            }
        };
        var m_new = function(orderId,orderName,docNum,time,collectId){
            var num = typeof docNum !== 'undefined' ? docNum : 0;
            var orderHtml = "<li data-orderId=\""+orderId+"\" data-time=\""+time+"\"";
            if(typeof collectId === "string"){
                orderHtml += " data-collectId=\""+collectId+"\"";
                if(collectId !== '0'){
                    orderHtml += " class=\"marked\"";
                }
            }
            orderHtml += "><a class=\"doc-list-trigger\"><span class=\"num\">"+num+"</span><span class=\"icon text\">&#xf0f6;</span></a><div class=\"name-view\"><a class=\"order-name\">"+orderName+"</a></div><div class=\"trigger-view\">";
            if(typeof collectId === "string" && collectId !== '0'){
                orderHtml += "<a class=\"icon\">&#xf097;</a>";
            }
            orderHtml += "<a class=\"icon edit-trigger\">&#xe832;</a><input type=\"checkbox\"></div></li>";
            return orderHtml;
        };
        var order_m = Model("item",m_get,m_set,m_new);
        var orderNamePrompt = function(callBack){
            var name = prompt("主题名称:");
            if(name !== null && trim(name).length > 0){
                callBack(name);
            }
        };
        var fetchItemChecks = function(callBack){
            var itemChecks = orderList.querySelectorAll("input");
            fetchArr(itemChecks,function(i){
                callBack(itemChecks[i]);
            });
        };
        var checkBox_i = function(checkBox){
            if(!hasClass(collectBtnsView,"hide")){
                var itemChecks = orderList.querySelectorAll("input");
                var collectNum = collectCounter;
                for(var i=0,len=itemChecks.length;i<len;i++){
                    var thisCheck = itemChecks[i];
                    if(thisCheck.checked){
                        collectNum++;
                    }
                }
                if(collectNum > 7){
                    checkBox.checked = false;
                    alert("精选数目已达最多限制7个");
                }
            }
        };
        var checkAllOrderMarked = function(){
            var markedNum = orderList.querySelectorAll(".marked").length;
            if(orderList.children.length === markedNum){
                return true;
            }
        };
        var checkOrderListEmpty = function(){
            var orderItemNum = orderList.children.length;
            return orderItemNum > 0 && orderItemNum === 1 ? orderList.firstChild.getAttribute("data-orderId") === null ? true : false : false;
        };
        var setOrderListView = function(orderData){
            var orderListHtml = "";
            if(orderData.hasOwnProperty("orderList")){
                var orderListData = orderData.orderList;
                fetchArr(orderListData,function(i){
                    var thisData = orderListData[i];
                    orderListHtml += order_m("new")(thisData["orderId"],thisData["orderName"],thisData["docNum"],thisData["time"],thisData["collectId"]);
                });
                if(orderListHtml.length > 0){
                    orderList.innerHTML = orderListHtml;
                    collectCounter = parseInt(orderData.countCollect);
                    removeClass(deleteTrigger,"hide");
                    if(orderData.hasOwnProperty("countCollect") && collectCounter < 7 && !checkAllOrderMarked()){
                        removeClass(collectTrigger,"hide");
                    }
                }
            }
        };
        var loadOrderList = function(){
            loadOrderList_c()(function(res){
                if(res){
                    var data = JSON.parse(res);
                    if(data.hasOwnProperty("orderList") && data.hasOwnProperty("countCollect")){
                        setOrderListView(data);
                    }
                }
            });
        };
        var collectTriggerDisplay = function(){
            if(collectCounter < 7 && !checkOrderListEmpty()){
                removeClass(collectTrigger,"hide");
            }
        };
        var addOrderListNewHtml = function(newItemHtml){
            if(orderList.innerHTML === orderEmptyHtml){
                orderList.innerHTML = "";
            }
            orderList.innerHTML += newItemHtml;
            removeClass(deleteTrigger,"hide");
            collectTriggerDisplay();
        };
        var addOrder_i = function(){
            orderNamePrompt(function(orderName){
                addOrder_c(orderName)(function(res){
                    if(res){
                        var data = JSON.parse(res);
                        if(data.hasOwnProperty("orderId")){
                            addOrderListNewHtml(order_m("new")(data["orderId"],orderName,0,data["time"]));
                            tipView(true,"已添加新主题.");
                        }else{
                            alert("未获取到主题的id,后续操作中断");
                        }
                    }else{
                        alert("添加新主题失败");
                    }
                });
            });
        };
        var noCheck = function(){
            fetchItemChecks(function(thisCheck){
                if(thisCheck.checked){
                    thisCheck.checked = false;
                }
            });
        };
        var cancelDelete = function(){
            if(hasClass(deleteTrigger,"hide")){
                removeClass(orderList,"on-check");
                addClass(deleteBtnsView,"hide");
                removeClass(deleteTrigger,"hide");
                removeClass(addTrigger,"hide");
                collectTriggerDisplay();
                deleteBtnsView.lastChild.checked = false;
            }
        };
        var cancelOnOrderView = function(){
            if(onOrderDocContexts.length > 0){
                var addOrderDocList_v = onOrderDocContexts.pop();
                addOrderDocList_v.removeEvent();
                addOrderDocList_v.cleanView();
                var onOrderDocList_v = onOrderDocContexts.pop();
                onOrderDocList_v.trait["cancelOrderDoc_i"]();
                onOrderDocList_v.removeEvent();
                onOrderDocList_v.cleanView();
                addOrderDocList_v = null;
                onOrderDocList_v = null;
                orderDocReadTask.pop();
            }
        };
        var updateOrderListName = function(orderId,orderName){
            if(onOrderDocContexts.length > 0){
                var onOrderDocList_v = onOrderDocContexts[0];
                var onOrderListId = onOrderDocList_v.trait["orderId"];
                if(onOrderListId === orderId){
                    onOrderDocList_v.trait["setOrderName"](orderName);
                }
            }
        };
        var cancelCollect = function(flag){
            if(hasClass(collectTrigger,"hide")){
                removeClass(orderList,"setCollect");
                removeClass(orderList,"on-check");
                addClass(collectBtnsView,"hide");
                removeClass(deleteTrigger,"hide");
                removeClass(addTrigger,"hide");
                if(collectCounter < 7 && !flag){
                    removeClass(collectTrigger,"hide");
                }
                collectBtnsView.lastChild.checked = false;
            }
        };
        var collectOrder_i = function(){
            addClass(orderList,"setCollect");
            addClass(orderList,"on-check");
            addClass(deleteTrigger,"hide");
            addClass(addTrigger,"hide");
            addClass(collectTrigger,"hide");
            removeClass(collectBtnsView,"hide");
        };
        var setCollectInfo = function(collectInfo,collectNum){
            fetchArr(collectInfo,function(i){
                var thisInfo = collectInfo[i];
                var orderItem = orderList.querySelector("li[data-orderId=\""+thisInfo.orderId+"\"]");
                order_m("set")(orderItem,"collectId",thisInfo.collectId);
                var triggerView = orderItem.querySelector(".trigger-view");
                addClass(orderItem,"marked");
                triggerView.innerHTML = "<a class=\"icon\">&#xf097;</a>"+triggerView.innerHTML;
            });
            collectCounter = parseInt(collectNum);
            if(checkAllOrderMarked() || collectCounter === 7){
                cancelCollect(true);
            }
        };
        var doCollectOrder = function(){
            var orderIds = new Array();
            fetchItemChecks(function(thisCheck){
                if(thisCheck.checked){
                    var thisItem = thisCheck.parentNode.parentNode;
                    if(!hasClass(thisItem,"marked")){
                        orderIds.push(order_m("get")(thisItem,"orderId"));
                    }
                }
            });
            if(orderIds.length > 0){
                addCollectOrder_c(orderIds)(function(res){
                    if(res){
                        var data = JSON.parse(res);
                        if(data.hasOwnProperty("collectInfo") && data.hasOwnProperty("countCollect")){
                            setCollectInfo(data.collectInfo,data.countCollect);
                            tipView(true,"已加入精选的主题.");
                        }
                    }else{
                        alert("精选主题失败");
                    }
                });
            }
        };
        var collectOrderBtns_i = function(e){
            var target = e.target;
            if(target.nodeName === "A"){
                if(hasClass(target,"cancel-collect")){
                    cancelCollect();
                    noCheck();
                }else{
                    doCollectOrder();
                }
            }else if(target.nodeName === "INPUT"){
                if(target.checked){
                    var itemChecks = orderList.querySelectorAll("input");
                    var collectNum = collectCounter;
                    for(var i=0,len=itemChecks.length;i<len;i++){
                        var thisCheck = itemChecks[i];
                        if(!hasClass(thisCheck.parentNode.parentNode,"marked")){
                            if(thisCheck.checked){
                                collectNum++;
                            }else if(collectNum+1 <= 7){
                                thisCheck.checked = true;
                                collectNum++;
                            }else{
                                target.checked = false;
                                alert("精选数目已达最多限制7个");
                                break;
                            }
                        }
                    }
                }else{
                    noCheck(); 
                }
            }
        };
        var doDeleteOrder = function(){
            var orderIds = new Array();
            var checkedItems = new Array();
            fetchItemChecks(function(thisCheck){
                if(thisCheck.checked){
                    var thisItem = thisCheck.parentNode.parentNode;
                    orderIds.push(order_m("get")(thisItem,"orderId"));
                    checkedItems.push(thisItem);
                }
            });
            if(orderIds.length > 0){
                deleteOrder_c(orderIds)(function(res){
                    if(res){
                        var onOrderListId = null,countMarkNum = 0;
                        if(onOrderDocContexts.length > 0){
                            onOrderListId = onOrderDocContexts[0].trait["orderId"];
                        }
                        fetchArr(checkedItems,function(i){
                            var thisItem = checkedItems[i];
                            var deleteOrderId = order_m("get")(thisItem,"orderId");
                            if(onOrderListId !== null && onOrderListId === deleteOrderId){
                                cancelOnOrderView();
                            }
                            if(hasClass(thisItem,"marked")){
                               countMarkNum++; 
                            }
                            orderList.removeChild(thisItem);
                        });
                        collectCounter = collectCounter-countMarkNum;
                        if(orderList.children.length === 0){
                            orderList.innerHTML = orderEmptyHtml;
                            cancelDelete();
                        }
                        tipView(true,"所选主题已删除.");
                    }else{
                        alert("删除主题失败");
                    }
                });
            }
        };
        var deleteOrder_i = function(){
            addClass(orderList,"on-check");
            removeClass(deleteBtnsView,"hide");
            addClass(deleteTrigger,"hide");
            addClass(addTrigger,"hide");
            addClass(collectTrigger,"hide");
        };
        var deleteOrderBtns_i = function(e){
            var target = e.target;
            if(target.nodeName === "A"){
                if(hasClass(target,"cancel-delete")){
                    cancelDelete();
                    noCheck();
                }else{
                    doDeleteOrder();
                }
            }else if(target.nodeName === "INPUT"){
                if(target.checked){
                    fetchItemChecks(function(thisCheck){
                        if(!thisCheck.checked){
                            thisCheck.checked = true;
                        }
                    });
                }else{
                    noCheck();
                }
            }
        };
        var removeMarkStyle = function(orderItem){
            var triggerView = orderItem.querySelector(".trigger-view");
            var markBtn = triggerView.firstChild;
            markBtn.style.marginLeft = "7px";
            markBtn.innerHTML = "&#xe829;";
            setTimeout(function(){
                triggerView.removeChild(triggerView.firstChild);
            },"100");
            removeClass(orderItem,"marked");
            removeClass(collectTrigger,"hide");
            tipView(true,"从精选中移除了所选主题项.");
        };
        var deleteMark_i = function(orderItem){
            var collectId = order_m("get")(orderItem,"collectId");
            var ids = new Array();
            if(typeof collectId === "string" && collectId !== '0'){
                ids.push(collectId);
            }
            if(ids.length > 0){
                deleteMark_c(ids)(function(res){
                    if(res){
                        collectCounter--;
                        removeMarkStyle(orderItem);
                    }else{
                        alert("移除精选主题失败.");
                    }
                });
            }
        };
        var updateOrderName_i = function(orderItem){
            orderNamePrompt(function(orderName){
                var orderId = order_m("get")(orderItem,"orderId");
                updateOrderName_c(orderId,orderName)(function(res){
                    if(res){
                        updateOrderListName(orderId,orderName);
                        order_m("set")(orderItem,"orderName",orderName);
                        tipView(true,"所选主题名称已更新.");
                    }else{
                        alert("更改主题名称失败");
                    }
                });       
            });
        };
        var getOrderBtnsHtml = function(){   
            var btnsViewHtml = "<button class=\"arrange-trigger\"><i class=\"icon\">&#xf0ec;</i><span>排序</span></button><button class=\"rm-arrange-trigger hide\"><i class=\"icon\">&#xf112;</i><span>退出排序</span></button>";
            btnsViewHtml += "<button class=\"add-doc-trigger\"><i class=\"icon\">&#xe806;</i><span>添加</span></button><button class=\"rm-add-doc-trigger hide\"><i class=\"icon\">&#xf112;</i><span>退出添加</span></button>";
            btnsViewHtml += "<button class=\"rm-doc-trigger\"><i class=\"icon\">&#xe83b;</i><span>删除</span></button><span class=\"rm-doc-btns-view hide\"><button class=\"cancel-rm-btn\"><i class=\"icon\">&#xf112;</i><span>退出删除</span></button><a class=\"icon delete-btn\">&#xe83b;</a><input type=\"checkbox\"></span>";
            return btnsViewHtml;
        };
        var getOrderView = function(orderName,docNum,time,btnsHTML){
            var newOrderView = document.createElement("div");
            newOrderView.innerHTML += "<a class=\"icon\">&#xf112;</a><span class=\"order-name-text\"><span class=\"icon\">&#xf0c5;</span>(<span>"+docNum+"</span>)<span>"+orderName+"</span></span><span><span>创建于</span><span>"+time+"</span></span><div>"+btnsHTML+"</div>";  
            addClass(newOrderView,"order-view");
            return newOrderView;
        };
        var rmOrderListSelectedStyle = function(){
            removeClass(orderList.querySelector(".onSelect"),"onSelect"); 
        };
        var orderItemSelectedStyle = function(orderNameBtn){
            rmOrderListSelectedStyle();
            addClass(orderNameBtn,"onSelect");
        };
        var cancelOnOrderDocView_i = function(){
            cancelOnOrderView();
            rmOrderListSelectedStyle();
        };
        var initOrderListView = function(orderItem){
            var thisOrderId = order_m("get")(orderItem,"orderId");
            var flag = false;
            if(onOrderDocContexts.length > 0){
                var onOrderDocList_v = onOrderDocContexts[0];
                var onOrderId =  onOrderDocList_v.trait["orderId"];
                if(thisOrderId !== onOrderId){
                    cancelOnOrderDocView_i();
                }
            }
            if(onOrderDocContexts.length === 0){
                var orderTopView = getOrderView(order_m("get")(orderItem,"orderName"),order_m("get")(orderItem,"orderDocsNum"),order_m("get")(orderItem,"time"),getOrderBtnsHtml());
                var orderDocListView = orderDocList_v(orderItem,order_m,orderTopView);
                var orderView_m = orderDocListView.trait.orderView_m;
                var addOrderDocListView = addOrderDocList_v(orderItem,order_m,orderView_m,orderTopView,orderDocListView.trait["resetOrderDocList"]);
                orderDocListView.setView();
                orderDocListView.event();
                addOrderDocListView.setView();
                addOrderDocListView.event();
                onOrderDocContexts.push(orderDocListView);
                onOrderDocContexts.push(addOrderDocListView);
                orderTopView.firstChild.addEventListener("click",function(){
                    cancelOnOrderDocView_i();
                });
                flag = true;
            }else{
                flag = false;
            }
            contentChange("contentShift")(1,0);
            return flag;
        };
        var loadOrderReadView = function(orderItem){
            var docsNum = parseInt(order_m("get")(orderItem,"orderDocsNum"));
            if(docsNum > 0){
                orderDocReadTask.pop();
                var orderId = order_m("get")(orderItem,"orderId");
                var orderName = order_m("get")(orderItem,"orderName");
                var orderReadContext = orderDocReadTask.orderRead_v(orderId,docsNum,0,orderName);
                orderDocReadTask.push(orderReadContext);
                orderReadContext.getOrderId(0,function(docId){
                    loadViewContext(textReaderFrag,readerContextKey,docId);
                });
            }else{
                alert("该主题下没有文档.");
            }
        };
        var orderItem_i = function(e){
            var thisNode = null;
            var target = e.target;
            if(target.nodeName === "A"){
                if(hasClass(target,"order-name")){
                    loadOrderReadView(target.parentNode.parentNode);
                }else if(hasClass(target,"edit-trigger")){
                    var thisItem = target.parentNode.parentNode;
                    updateOrderName_i(thisItem);
                }else if(hasClass(target,"doc-list-trigger")){
                    thisNode = target.parentNode;
                }else{
                    var item = target.parentNode.parentNode;
                    if(hasClass(item,"marked")){
                        deleteMark_i(item);
                    }
                }
            }else if(target.nodeName === "SPAN" && (hasClass(target,"num") || hasClass(target,"text"))){
                thisNode = target.parentNode.parentNode;
            }else if(target.nodeName === "INPUT"){
                checkBox_i(target);
            }
            if(thisNode !== null && initOrderListView(thisNode)){
                orderItemSelectedStyle(thisNode.querySelector(".order-name"));
            }
        };
        return {
            "setView":function(){
                loadOrderList();         
            },"cleanView":function(){
                cancelOnOrderDocView_i();
                cancelDelete();
                orderList.innerHTML = orderEmptyHtml;
            },"event":function(){
                addTrigger.addEventListener("click",addOrder_i);
                collectTrigger.addEventListener("click",collectOrder_i);
                collectBtnsView.addEventListener("click",collectOrderBtns_i);
                deleteTrigger.addEventListener("click",deleteOrder_i);
                deleteBtnsView.addEventListener("click",deleteOrderBtns_i);
                orderList.addEventListener("click",orderItem_i);
            },"removeEvent":function(){
                addTrigger.removeEventListener("click",addOrder_i);
                collectTrigger.removeEventListener("click",collectOrder_i);
                collectBtnsView.removeEventListener("click",collectOrderBtns_i);
                deleteTrigger.removeEventListener("click",deleteOrder_i);
                deleteBtnsView.removeEventListener("click",deleteOrderBtns_i);
                orderList.removeEventListener("click",orderItem_i);
            }
        };
    }

    function orderDocList_v(orderItem,order_m,orderTopView){
        var orderId = order_m("get")(orderItem,"orderId");
        var arrangeTrigger = orderTopView.querySelector(".arrange-trigger");
        var cancel_arrange_trigger = orderTopView.querySelector(".rm-arrange-trigger");
        var rm_arrange_trigger = orderTopView.querySelector(".rm-arrange-trigger");
        var rmTrigger = orderTopView.querySelector(".rm-doc-trigger");
        var rm_btns_view = orderTopView.querySelector(".rm-doc-btns-view");
        var addTrigger = orderTopView.querySelector(".add-doc-trigger");
        var cancel_rm_Btn = rm_btns_view.querySelector(".cancel-rm-btn");
        var allCheck = rm_btns_view.querySelector("input");
        var issueDocViewFrag = document.createDocumentFragment();
        var issueDocView = infoView.querySelector(".docs-list-view");
        var issueDocPageBar = infoView.querySelector(".paging");
        var issueInfoContext = viewController.getGContext("issueInfo");
        var issueBtnsView = issueInfoContext.getTrait("bottomBtnView");
        var arrangeCheck = null;
        var docListContext = viewController.getGContext("docList");
        var docItem_m = docListContext.getTrait("docItem_m");
        var getDocListView = docListContext.getTrait("getDocListView");
        var createDocListView = docListContext.getTrait("createDocListView");
        var loadDocList = docListContext.getTrait("loadDocList");
        var fetchDocList = docListContext.getTrait("fetchDocList");
        var docNumText = orderTopView.querySelector(".order-name-text").children[1];
        var m_get = {
            "docNum" : function(){
                return docNumText.innerText;
            }
        };
        var m_set = {
            "docNum" : function(text){
                docNumText.innerText = text;
            }
        };
        var orderView_m = Model("view",m_get,m_set);
        var orderViewDisplay = function(flag){
            if(flag){
                addClass(dateConditionView,"hide");
                addClass(docSearchView,"hide");
                addClass(issueBtnsView,"hide");
                issueDocViewFrag.appendChild(issueDocView);
                issueDocViewFrag.appendChild(issueDocPageBar);
                issueTopView.appendChild(orderTopView);
                var newDocList = createDocListView();
                newDocList.innerText = emptyDocText;
                infoView.appendChild(newDocList);
            }else{
                issueTopView.removeChild(orderTopView);
                var thisDocView = getDocListView();
                if(thisDocView !== null){
                    infoView.removeChild(thisDocView);
                }
                infoView.appendChild(issueDocViewFrag);
                removeClass(docSearchView,"hide");
                removeClass(dateConditionView,"hide");
                removeClass(issueBtnsView,"hide");
            }
        };
        var setDocView = function(startNum,limitNum,addHtmlFlag){
            var docsNum = parseInt(order_m("get")(orderItem,"orderDocsNum"));
            var orderName = order_m("get")(orderItem,"orderName");
            if(docsNum > 0){
                getOrderDocInfo_c(orderId,startNum,limitNum)(function(res){
                    if(res){
                        var docData = JSON.parse(res);
                        loadDocList(docData,false,addHtmlFlag,function(){
                            var docItems = getDocListView().children;
                            var countDoc = parseInt(docData.countDoc);
                            if(docsNum !== countDoc){
                                docsNum = countDoc;
                                orderView_m("set")("docNum",docsNum);
                                order_m("set")(orderItem,"orderDocsNum",docsNum);
                            }
                            fetchArr(docItems,function(i){
                                var docItem = docItems[i];
                                var lastNode = docItem.lastChild;
                                if(lastNode.querySelector(".num") === null){
                                    lastNode.innerHTML = "<span class=\"num\">"+(i+1)+"</span>"+lastNode.innerHTML;
                                }
                            });
                            orderDocReadTask.pop();
                            orderDocReadTask.push(orderDocReadTask.orderRead_v(orderId,docsNum,0,orderName));
                        });
                    }else{
                        alert("获取主题文档列表失败.");
                    }
                });
            }else{
                viewController.getGContext("docList").getTrait("docListViewEmpty")();
            }
        };
        var resetDocsOrderNum = function(thisDocView,refItem){
            var docItems = thisDocView.children;
            var countItem = docItems.length;
            var headIndex = getElementIndex(refItem)+1;
            if(headIndex < countItem){
                for(var i=headIndex;i<countItem;i++){
                    var thisItem = docItems[i];
                    var thisIndex = getElementIndex(thisItem)+1;
                    var thisNumText = thisItem.lastChild.firstChild;
                    if(parseInt(thisNumText.innerText) !== thisIndex){
                        thisNumText.innerText = thisIndex+1;
                    }
                }
            }
        };
        var resetRmDocList = function(checkBoxes,countDoc){
            var thisDocView = getDocListView();
            var refItem = checkBoxes[0].parentNode.previousSibling;
            fetchArr(checkBoxes,function(i){
                var thisCheck = checkBoxes[i];
                if(thisCheck.checked){
                    thisDocView.removeChild(thisCheck.parentNode);
                }
            });
            if(allCheck.checked){
                allCheck.checked = false;
            }
            order_m("set")(orderItem,"orderDocsNum",countDoc);
            orderView_m("set")("docNum",countDoc);
            orderDocReadTask.set("countDoc",countDoc);
            resetDocsOrderNum(thisDocView,refItem);
        };
        var deleteDocInfo = function(checkBoxes,docIds){
            deleteOrderDocInfo_c(orderId,docIds)(function(res){
                if(res){
                    var data = JSON.parse(res);
                    if(data.hasOwnProperty("countDoc")){
                        var countDoc = parseInt(data["countDoc"]);
                        resetRmDocList(checkBoxes,countDoc);
                        tipView(true,"已从该问题移除所选文档.");
                    }else{
                        alert("移除所选主题文档失败");
                    }
                }
            });
        };
        var allCheckBtn_i = function(){
            var allCheckFun = allCheck.checked ? function(docItem){
                var checkBox = docItem.querySelector("input");
                if(!checkBox.checked){
                    checkBox.checked = true;
                }
            } : function(docItem){
                var checkBox = docItem.querySelector("input");
                if(checkBox.checked){
                    checkBox.checked = false;
                }
            };
            fetchDocList(getDocListView(),allCheckFun);
        };
        var deleteDoc_i = function(){
            var checkBoxes = getDocListView().querySelectorAll("input[type=\"checkbox\"]");
            var docIds = new Array();
            fetchArr(checkBoxes,function(i){
                var thisCheck = checkBoxes[i];
                if(thisCheck.checked){
                    docIds.push(docItem_m("get")(thisCheck.parentNode,"docId"));
                }
            });
            deleteDocInfo(checkBoxes,docIds);
        };
        var rmDocBtnView_i = function(e){
            if(e.target.nodeName === "A"){
                deleteDoc_i();
            }else if(e.target.nodeName === "INPUT"){
                allCheckBtn_i();
            }
        };
        var rmDocEvent = function(key){
            if(key === "add"){
                rm_btns_view.addEventListener("click",rmDocBtnView_i);
            }else if(key === "remove"){
                rm_btns_view.removeEventListener("click",rmDocBtnView_i);
            }
        };
        var rmDoc_i = function(){
            addClass(arrangeTrigger,"hide");
            addClass(addTrigger,"hide");
            addClass(rmTrigger,"hide");
            removeClass(rm_btns_view,"hide");
            addClass(getDocListView(),"check-style");
            fetchDocList(getDocListView(),function(docItem){
                docItem.innerHTML = "<input type=\"checkbox\">"+docItem.innerHTML;
            });
            rmDocEvent("add");
        };
        var changeOrderNum = function(arrangeIndex,refIndex){
            var headIndex = 0;
            var tailIndex = 0;
            var offset = 0;
            var targetNum=0;
            if(arrangeIndex > refIndex){
                headIndex = refIndex;
                tailIndex = arrangeIndex-1;
                targetNum = refIndex;
                offset = 1;
            }else{
                headIndex = refIndex-1;
                tailIndex = refIndex-1;
                targetNum = refIndex-1;
                offset = -1;
            }
            var docItems = getDocListView().children;
            for(var i=headIndex-1;i<tailIndex;i++){
                var docItem = docItems[i];
                var numText = docItem.lastChild.firstChild;
                var thisNum = parseInt(numText.innerText);
                numText.innerText = thisNum+offset;
            }
            return targetNum;
        };
        var arrangeDocCheck_i = function(e){
            var target = e.target;
            if(target.nodeName === "INPUT" && target.checked){
                if(arrangeCheck !== null){
                    var refDocItem = target.parentNode;
                    var arrangeDocItem = arrangeCheck.parentNode;
                    var refDocId = docItem_m("get")(refDocItem,"docId");
                    var arrangeDocId = docItem_m("get")(arrangeDocItem,"docId");
                    arrageOrderDoc_c(orderId,arrangeDocId,refDocId)(function(res){
                        if(res){
                            arrangeDocItem.lastChild.firstChild.innerText = changeOrderNum(getElementIndex(arrangeDocItem)+1,getElementIndex(refDocItem)+1);
                            refDocItem.parentNode.insertBefore(arrangeDocItem,refDocItem);
                            target.checked = false;
                            arrangeCheck.checked = false;
                            arrangeCheck = null;
                            tipView(true,"已交换所选文档次序.");
                        }else{
                            alert("交换文档次序失败");
                        }
                    });
                }else{
                    arrangeCheck = target;
                }
            }
        };
        var arrangeDocEvent = function(key){
            var thisDocView = getDocListView();
            if(key === "add"){
                thisDocView.addEventListener("click",arrangeDocCheck_i);
            }else if(key === "remove"){
                thisDocView.removeEventListener("click",arrangeDocCheck_i);
            }
        };
        var arrangeDoc_i = function(){
            addClass(arrangeTrigger,"hide");
            addClass(addTrigger,"hide");
            addClass(rmTrigger,"hide");
            addClass(getDocListView(),"check-style");
            fetchDocList(getDocListView(),function(docItem){
                docItem.innerHTML = "<input type=\"checkbox\">"+docItem.innerHTML;
            });
            arrangeDocEvent("add");
            removeClass(rm_arrange_trigger,"hide");
        };
        var cancelRm_i = function(){
            if(!hasClass(rm_btns_view,"hide")){
                var thisDocView = getDocListView();
                addClass(rm_btns_view,"hide");
                removeClass(rmTrigger,"hide");
                removeClass(addTrigger,"hide");
                removeClass(arrangeTrigger,"hide");
                fetchDocList(thisDocView,function(docItem){
                    docItem.innerHTML = docItem.innerHTML.replace("<input type=\"checkbox\">","");
                });
                rmDocEvent("remove");
                if(allCheck.checked){
                    allCheck.checked = false;
                }
                removeClass(thisDocView,"check-style");
            }
        };
        var cancelArrange_i = function(){
            if(!hasClass(rm_arrange_trigger,"hide")){
                var thisDocView = getDocListView();
                addClass(rm_arrange_trigger,"hide");
                removeClass(rmTrigger,"hide");
                removeClass(addTrigger,"hide");
                removeClass(arrangeTrigger,"hide");
                fetchDocList(thisDocView,function(docItem){
                    docItem.innerHTML = docItem.innerHTML.replace("<input type=\"checkbox\">","");
                });
                arrangeDocEvent("remove");
                if(allCheck.checked){
                    allCheck.checked = false;
                }
                removeClass(thisDocView,"check-style");
            }
        };
        var cancelOrderDoc_i = function(){
            orderViewDisplay(false);
        };
        var loadMoreOrderDocInfo_i = function(){
            var body = document.body;
            if(compatScrollY() === body.scrollHeight-body.clientHeight){
                var orderDocsNum = parseInt(order_m("get")(orderItem,"orderDocsNum"));
                var itemLen = infoView.querySelector(".docs-list-view").children.length;
                if(itemLen < orderDocsNum){
                    setDocView(itemLen,10,true);
                }
            }
        };
        return {
            "setView" : function(){
                orderViewDisplay(true);
                setDocView(0,10,true);
            },"cleanView" : function(){
                cancelArrange_i();
                cancelRm_i();
            },"event" : function(){
                rmTrigger.addEventListener("click",rmDoc_i);
                cancel_rm_Btn.addEventListener("click",cancelRm_i);
                arrangeTrigger.addEventListener("click",arrangeDoc_i);
                cancel_arrange_trigger.addEventListener("click",cancelArrange_i);
                window.addEventListener("scroll",loadMoreOrderDocInfo_i);
            },"removeEvent" : function(){
                rmTrigger.removeEventListener("click",rmDoc_i);
                cancel_rm_Btn.removeEventListener("click",cancelRm_i);
                arrangeTrigger.removeEventListener("click",arrangeDoc_i);
                cancel_arrange_trigger.removeEventListener("click",cancelArrange_i);
                window.removeEventListener("scroll",loadMoreOrderDocInfo_i);
            },"trait" : {
                "cancelOrderDoc_i" : cancelOrderDoc_i,
                "orderId" : orderId,
                "setOrderName" : function(orderName){
                    orderTopView.children[1].lastChild.innerText = orderName;
                },"resetOrderDocList" : function(){
                    setDocView(0,10,false);
                },"orderView_m":orderView_m
            }
        };
    }

    function addOrderDocList_v(orderItem,order_m,orderView_m,orderTopView,resetOrderDocList){
        var orderId = order_m("get")(orderItem,"orderId");
        var arrangeTrigger = orderTopView.querySelector(".arrange-trigger");
        var rmTrigger = orderTopView.querySelector(".rm-doc-trigger");
        var addTrigger = orderTopView.querySelector(".add-doc-trigger");
        var rm_add_trigger = orderTopView.querySelector(".rm-add-doc-trigger");
        var orderDocViewFrag = document.createDocumentFragment();
        var addDocPagingInterac = null;
        var addPageBarNode = null;
        var reloadOrderDocList = false;
        var docListContext = viewController.getGContext("docList");
        var docItem_m = docListContext.getTrait("docItem_m");
        var getDocListView = docListContext.getTrait("getDocListView");
        var loadDocList = docListContext.getTrait("loadDocList");
        var resetAddDocList = docListContext.getTrait("resetAddDocList");
        var reloadAddDocList = docListContext.getTrait("reloadAddDocList");
        var addDoc_c = docListContext.getTrait("addDoc_c");
        var addDocViewDisplay = function(flag){
            if(flag && hasClass(rm_add_trigger,"hide")){
               var newFrag = document.createDocumentFragment();
               var newDocView = docView.cloneNode();
               var newPageBar = pageBarTemp.cloneNode();
               newPageBar.innerHTML = pageBarOriHtml;
               newDocView.innerHTML = "没有待归档内容";
               newFrag.appendChild(newDocView);
               newFrag.appendChild(newPageBar);
               orderDocViewFrag.appendChild(getDocListView());
               infoView.appendChild(newFrag);
               addClass(arrangeTrigger,"hide");
               addClass(addTrigger,"hide");
               addClass(rmTrigger,"hide");
               removeClass(rm_add_trigger,"hide");
               return newPageBar;
            }else if(!flag && hasClass(addTrigger,"hide")){
               var thisDocView = infoView.removeChild(infoView.querySelector(".docs-list-view"));
               var thisPageView = infoView.removeChild(infoView.querySelector(".paging"));
               thisDocView = null;
               thisPageView = null;
               infoView.appendChild(orderDocViewFrag);
               addClass(rm_add_trigger,"hide");                   
               removeClass(rmTrigger,"hide");
               removeClass(addTrigger,"hide");
               removeClass(arrangeTrigger,"hide");
            }
        };
        var loadDocListProcess = function(res,pageBarNode,callBack){
            var docData = JSON.parse(res);
            var countDoc = parseInt(docData.countDoc);
            loadDocList(docData,true,false,function(){
                if(typeof callBack === "function"){
                    callBack();
                }
                removeClass(pageBarNode,"hide");
            });
            return countDoc;
        };
        var addDocCallBack = function(thisItem,pageNum,startNum){
            var setFlag = function(){
                if(!reloadOrderDocList){
                    reloadOrderDocList = true;
                }
            };
            addOrderDoc_c(orderId,docItem_m("get")(thisItem,"docId"),startNum)(function(res){
                if(res){
                    var data = JSON.parse(res);
                    var countDoc = parseInt(data.countDoc);
                    if(data.hasOwnProperty("docInfo") && data.docInfo){
                        var docInfo = data.docInfo;
                        var docId = docInfo["docId"];
                        var editTime = docInfo["time"];
                        reloadAddDocList(thisItem,addDocPagingInterac,docId,editTime,countDoc,pageNum,function(){
                            setFlag();
                            tipView(true,"已在该主题下加入一篇文档.");
                        });
                    }else if(data.docInfo === null){
                        resetAddDocList(thisItem,addDocPagingInterac,countDoc,pageNum-1);
                        setFlag();
                    }
                    var nowDocNum = parseInt(order_m("get")(orderItem,"orderDocsNum"))+1;
                    orderView_m("set")("docNum",nowDocNum);
                    order_m("set")(orderItem,"orderDocsNum",nowDocNum);
                }else{
                    alert("添加文档失败");
                }
            });
        };
        var rmAddDoc_i = function(){
            if(!hasClass(rm_add_trigger,"hide")){
                addDocViewDisplay(false);
                if(reloadOrderDocList){
                    resetOrderDocList();
                    reloadOrderDocList = false;
                }
                addDocPagingInterac = null;
                addPageBarNode = null;
            }
        };
        var showAddOrderDocList_i = function(){
            getIssueDocInfoByOrder_c(orderId,0,10)(function(res){
                addPageBarNode = addDocViewDisplay(true);
                var countDoc = loadDocListProcess(res,addPageBarNode);
                addDocPagingInterac = PagingInteraction(addPageBarNode);
                addDocPagingInterac.initPaging(countDoc,1,function(startNum,pageBarCallBack){
                    getIssueDocInfoByOrder_c(orderId,startNum,10)(function(res){
                        var flag = false;
                        if(res !== false){
                            var docListData = JSON.parse(res);
                            loadDocList(docListData,true,false);
                            addDocPagingInterac.setPage(parseInt(docListData["countDoc"]),1);
                            flag = true;
                        }else{
                            alert("获取问题下的文档信息出错.");
                        }
                        pageBarCallBack(flag);
                    });
                });
                addDocPagingInterac.event();
            });
        };
        return {
            "setView" : function(){
                addDoc_c.push(addDocCallBack);
            },"cleanView" : function(){
                rmAddDoc_i();
                addDoc_c.pop();
            },"event" : function(){
                addTrigger.addEventListener("click",showAddOrderDocList_i);
                rm_add_trigger.addEventListener("click",rmAddDoc_i);
            },"removeEvent" : function(){
                addTrigger.removeEventListener("click",showAddOrderDocList_i);
                rm_add_trigger.removeEventListener("click",rmAddDoc_i);
            }
        };
    }

    function condition_v(){
        var selectView = dimensionView.get(".issue-condition-view");
        var selectTrigger = selectView.querySelector(".triggerBtn");
        var dateTimeList = dimensionView.get(".dateTime-display-list");
        var timeInputs = dateTimeList.querySelectorAll("input");
        var startTimeInput = timeInputs[0];
        var endTimeInput = timeInputs[1];
        var nowCondition = {};
        nowCondition.info = null;
        var compareDate = function(start,end){
            var startTime = new Date(Date.parse(start));
            var endTime = new Date(Date.parse(end));
            return startTime <= endTime;
        };
        return {
            "setView" : function(){
            },"setTime" : function(startTime,endTime){
                startTimeInput.value = startTime !== null ? startTime : endTime;
                endTimeInput.value = endTime;
            },"event" : function(){
            }
        };
    }

    function search_v(){
        var searchInput = dimensionView.get(".issue-search-input");
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
    }

    var issueView = issueInfo_v();
    var docListView = docList_v();
    viewController.setGContext(docListView.trait());
    var issueDocListView = issueDocList_v();
    var addIssueDocListView = addIssueDocList_v();
    var conditionView = condition_v();
    var searchView = search_v();
    var orderView = orderDoc_v();
    issueView.setView();
    viewController.setGContext(issueView.trait());
    issueDocListView.setView(conditionView.setTime);
    viewController.setGContext(issueDocListView.trait());
    addIssueDocListView.setView();
    orderView.setView();
    conditionView.setView();
    issueView.event();
    docListView.event();
    issueDocListView.event();
    addIssueDocListView.event();
    conditionView.event();
    searchView.event();
    orderView.event();

    var setPopInfo = function (context){
        if(docChanged_f){
            context.popInfo.issueId = issueId;
            context.popInfo.docNum = viewController.getGContext("issueInfo").getTrait("getDocNum")();
            context.popInfo.recentDocHtml = recentDocHtml;
        }
    };

    setController(function(thisContext){
        setPopInfo(thisContext);
        addIssueDocListView.removeEvent();
        issueDocListView.removeEvent();
        docListView.removeEvent();
        issueView.removeEvent();
        orderView.removeEvent();
        issueView.cleanView();
        issueDocListView.cleanView();
        addIssueDocListView.cleanView();
        orderView.cleanView();
        issueView = conditionView = searchView = null;
    },viewController.getGContext("issueDocList").getTrait("resetDocView"),setPopInfo);      
}
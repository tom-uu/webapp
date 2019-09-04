function CollectView(contentNode,pageData){
    var viewController = Controller("Collect");
    var viewContainer = contentNode.querySelector("#collect-view");
    var collectContent = viewContainer.querySelector("#collect-content-view");
    var tagSectionView = viewContainer.querySelector(".section_content_tag");
    var docPageBarNode = collectContent.querySelector(".paging");
    
    var readerContextKey = "textReader";
    var conView = {
        docListView : collectContent.querySelector(".doc-list-view"),
        pageBarView : collectContent.querySelector(".paging"),
        orderView : tagSectionView.querySelector(".order-view")
    };
    var viewFrag = {
        "collectContent":document.createDocumentFragment(),
        "docList":document.createDocumentFragment(),
        "textReader":document.createDocumentFragment(),
        "textEditor":document.createDocumentFragment()
    };

    var controller = Controller("Collect");
    var sectionTouch = SectionTouch_I(collectContent);
    sectionTouch.setView(controller);
    
    var contentChange = ContentChange_I(controller);
    var emptyItemHtml = conView.docListView.innerHTML;
    
    var viewDisplay = function(flag){
        var listView = conView.docListView;
        if(flag){
            collectContent.appendChild(viewFrag.collectContent);
            contentChange("setScroll")(listView);
        }else{
            contentChange("recordScroll")(listView);
            viewFrag.collectContent.appendChild(collectContent.children[0]);
        }
    };
    
    var showEmptyDocView = function(){
        conView.docListView.innerHTML = emptyItemHtml;
        addClass(docPageBarNode,"hide");
    };
    
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
        },orderRead_v(collectId,countDoc,startNum,orderName){
            return {
                "countDoc" : countDoc,
                "startNum" : startNum,
                "orderName" : orderName,
                "getOrderId" : function(startNum,callBack){
                    getOrderDocId_c(collectId,startNum)(function(res){
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

    var order_m = Model("item",{
        "collectId" : function(item){
            return item.getAttribute("data-collectId");
        },"orderName" : function(item){
            return item.querySelector(".order-name").innerText;
        },"orderDocsNum" : function(item){
            return item.firstChild.firstChild.innerText;
        }
    },{
        "orderName" : function(item,orderName){
            item.querySelector(".order-name").innerText = orderName;
        },"orderDocsNum" : function(item,orderDocsNum){
            item.firstChild.firstChild.innerText = orderDocsNum;
        }
    },function(collectId,orderName,docNum){
        var num = typeof docNum !== 'undefined' ? docNum : 0;
        return "<li data-collectId=\""+collectId+"\"><a class=\"doc-list-trigger\"><span class=\"num\">"+num+"</span><span class=\"icon text\">&#xf0f6;</span></a><div class=\"name-view\"><a class=\"order-name\">"+orderName+"</a></div><div class=\"trigger-view\"><input type=\"checkbox\"></div></li>";
    });

    function getOrderDocInfo_c(collectId,startNum,limitNum){
        return function(callBack){
            requestServer("GET","/webapp/controllers/CollectAction.php/GetOrderDocInfo/"+collectId+'/'+startNum+'/'+limitNum+'/',null,function(res){
                callBack(res);
            });
        };
    }
    
    function getOrderDocId_c(collectId,startNum){
        return function(callBack){
            requestServer("GET","/webapp/controllers/CollectAction.php/GetOrderDocId/"+collectId+'/'+startNum+'/',null,function(res){
                callBack(res);
            });
        };
    }
    
    function deleteOrder_c(collectIds){
        return function(callBack){
            requestServer("POST","/webapp/controllers/CollectAction.php/DeleteCollectOrder/",JSON.stringify({"ids":collectIds}),function(res){
                callBack(res);
            });
        };
    }
    
    function arrangeOrder_c(id,refId){
        return function(callBack){
            requestServer("POST","/webapp/controllers/CollectAction.php/ArrangeCollectOrder/",JSON.stringify({"id":id,"refId":refId}),function(res){
                callBack(res);
            });
        };
    }
    
    function callReadView(contextKey,docId){
        TextReader_V(controller,collectContent,viewFrag,docId,true,orderDocReadTask.get());
        controller.getGContext("tabView").getTrait("setView")(contextKey);
    }

    function loadViewContext(viewFrag,docId){
        viewDisplay(false);
        if(viewFrag.childElementCount === 0){
            addCss("/webapp/css/"+readerContextKey+".css");
            LoadCompView_C(readerContextKey)(function(res){
                var fileData = JSON.parse(res);
                loadView(readerContextKey,collectContent,fileData["html"],function(){
                    callReadView(readerContextKey,docId);
                });
            });
        }else if(checkViewScript(readerContextKey)){
            callReadView(readerContextKey,docId);
        }
    }
    
    function pageTab_v(){
        var pageTabview = viewContainer.querySelector("#collect-tab-view");
        var titleText = pageTabview.querySelector(".tab-title-text");
        var moreTrigger = pageTabview.querySelector(".tab-more-trigger");
        var moreBtnsView = pageTabview.querySelector(".tab-more-btns");
        var submitTrigger = pageTabview.querySelector(".tab-ok-trigger");
        var backView = pageTabview.querySelector(".tab-back-view");
        var backTrigger = pageTabview.querySelector(".tab-back-trigger");
        var pageTabTitleMap = {
            "docList":"文档列表",
            "textEditor":"编辑文档",
            "textReader":"浏览文档"
        };
        var setPageTitle = function(key){
            titleText.innerText = pageTabTitleMap[key];
        };
        var setTabReturnStyle = function(contextKey){
            if(contextKey !== 'docList'){
                removeClass(backView,"hide");
                contextKey === "textEditor" ? removeClass(submitTrigger,"hide") : addClass(submitTrigger,"hide");
                contextKey !== "textReader" ? addClass(moreTrigger,"hide") : removeClass(moreTrigger,"hide");
            }else{
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
                backTrigger.addEventListener("click",tabPageBack);
            }
        };
    }
    
    function docList_v(){
        var docListView = conView.docListView;
        var pageBarView = conView.pageBarView;
        var docItem_m = Model("item",{
            "docId" : function(item){
                return item.getAttribute("data-docId");
            }
        });
        var pageBarInterac = null;
        var docList_i = function(e){
            var thisNode = null;
            if(e.target.nodeName === "DIV" && e.target.hasAttribute("data-docid")){
                thisNode = e.target;
            }else if(e.target.nodeName === "H3" && e.target.parentNode.nodeName !== "HEADER" || e.target.nodeName === "P" && e.target.querySelector("icon") === null){
                thisNode = e.target.parentNode;
            }
            if(thisNode !== null){
                orderDocReadTask.set("startNum",parseInt(thisNode.lastChild.firstChild.innerText)-1);
                loadViewContext(viewFrag.textReader,docItem_m("get")(thisNode,"docId"));
            }
        };
        var setDocItemHtml = function(docData,timeMap){
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
            if(docValue.hasOwnProperty("countAudio")){
                docHtml +="<span class=\"audio-tip\"><i class=\"icon\">&#xf1C7;</i> +"+docValue.countAudio+"</span>";
            }
            docHtml += "<span>"+timeWords+"</span><span>"+time+"</span>";
            docHtml +="</p></div>";
            return docHtml;
        };
        var loadDocList = function(docData,loadEndingProcess){
            var docInfo = (function(){
                var docList = docData.docList;
                var docInfo = {};
                docInfo.ids = new Array();
                docInfo.timeMap = {};
                fetchArr(docList,function(i){
                    var thisElem = docList[i];
                    var docId = thisElem.docId;
                    docInfo.ids.push(docId);
                    docInfo.timeMap[docId] = thisElem.time;
                });
                return docInfo;
            })();
            var docIds = docInfo.ids;
            var timeMap = docInfo.timeMap;
            var rmLoadingStyle = function(){
                if(docListView.firstChild.nodeType === 1 && typeof loadEndingProcess === "function"){
                    loadEndingProcess();
                }
                removeClass(docListView,"hide");
            };
            if(docIds.length > 0){
                LoadDocList_C(docIds)(function(res){
                    var docListData = JSON.parse(res);
                    if(docListData.length > 0){
                        var docViewHtml = "";
                        fetchArr(docListData,function(i){
                            docViewHtml += setDocItemHtml(docListData[i],timeMap);
                        });
                        docListView.innerHTML = docViewHtml;
                    }
                    rmLoadingStyle();
                });
            }else{
                showEmptyDocView();
                rmLoadingStyle();
            }
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
        var getOnSelectOrderItem = function(){
            return viewController.getGContext("orderList").getTrait("getOnSelectOrderItem")();
        };
        var resetView = function(orderItem,startNum,limitNum,callBack){
            var collectId = order_m("get")(orderItem,"collectId");
            var orderName = order_m("get")(orderItem,"orderName");
            var docsNum = parseInt(order_m("get")(orderItem,"orderDocsNum"));
            if(docsNum > 0){
                var rmLoading = bodyLoading();
                getOrderDocInfo_c(collectId,startNum,limitNum)(function(res){
                    var flag = false;
                    if(res){
                        var docData = JSON.parse(res);
                        loadDocList(docData,function(){
                            var docItems = docListView.children;
                            var countDoc = parseInt(docData.countDoc);
                            if(docsNum !== countDoc){
                                docsNum = countDoc;
                                order_m("set")(orderItem,"orderDocsNum",docsNum);
                            }
                            if(countDoc > 0){
                                fetchArr(docItems,function(i){
                                    var docItem = docItems[i];
                                    var lastNode = docItem.lastChild;
                                    lastNode.innerHTML = "<span class=\"num\">"+(startNum+i+1)+"</span>"+lastNode.innerHTML;
                                });
                            }
                            orderDocReadTask.pop();
                            orderDocReadTask.push(orderDocReadTask.orderRead_v(collectId,docsNum,0,orderName));
                            pageBarInterac.setPage(docData.countDoc,1);
                            countDoc > 10 ? removeClass(pageBarView,"hide") : addClass(pageBarView,"hide");
                            rmLoading();
                        });
                        flag = true;
                    }else{
                        rmLoading();
                        alert("获取主题文档列表失败.");
                    }
                    if(typeof callBack === "function"){
                        callBack(flag);
                    }
                });
            }else{
                showEmptyDocView();
            }
        };
        var initPageBarView = function(countDoc){
            pageBarInterac = PagingInteraction(docPageBarNode);
            pageBarInterac.initPaging(countDoc,1,function(startNum,pageBarCallBack){
                resetView(getOnSelectOrderItem(),startNum,10,pageBarCallBack);
            });
            pageBarInterac.event();
            parseInt(countDoc) > 10 ? removeClass(docPageBarNode,"hide") : addClass(docPageBarNode,"hide");
        };
        var initDocList = function(pageData){
            loadDocList(pageData,function(){
                var docItems = docListView.children;
                var countDoc = parseInt(pageData["countDoc"]);
                if(countDoc > 0){
                    fetchArr(docItems,function(i){
                        var docItem = docItems[i];
                        var lastNode = docItem.lastChild;
                        lastNode.innerHTML = "<span class=\"num\">"+(i+1)+"</span>"+lastNode.innerHTML;
                    });
                }
                if(pageData.hasOwnProperty("orderList") && pageData.orderList.length > 0){
                    var topOrderInfo = pageData.orderList[0];
                    orderDocReadTask.push(orderDocReadTask.orderRead_v(topOrderInfo.collectId,countDoc,0,topOrderInfo.orderName));
                }
                removeClass(viewContainer,"hide");
                initPageBarView(countDoc);
            });
        };
        return {
            "setView" : function(pageData){
                initDocList(pageData);
            },"event" : function(){
                docListView.addEventListener("click",docList_i);
            },"removeEvent" : function(){
                docListView.removeEventListener("click",docList_i);
            },"trait" : function(){
                var thisContext = Context("docList");
                thisContext.setTrait("viewDisplay",viewDisplay);
                thisContext.setTrait("docItem_m",docItem_m);
                thisContext.setTrait("loadDocList",loadDocList);
                thisContext.setTrait("fetchDocList",fetchDocList);
                thisContext.setTrait("resetView",resetView);
                controller.pushContext(thisContext);
                return thisContext;
            }
        };
    }

    function orderList_v(){
        var docOrderView = tagSectionView.querySelector(".order-view");
        var arrangeTrigger = docOrderView.querySelector(".arrange-trigger");
        var cancelArrangeTrigger = docOrderView.querySelector(".cancel-arrange-btn");
        var deleteTrigger = docOrderView.querySelector(".delete-trigger");
        var orderList = docOrderView.querySelector(".order-list");
        var deleteBtnsView = docOrderView.querySelector(".delete-btns-view");
        var orderEmptyHtml = orderList.innerHTML;
        var arrangeCheckInfo = {"obj":null,"flag":true};
        var fetchItemChecks = function(callBack){
            var itemChecks = orderList.querySelectorAll("input");
            fetchArr(itemChecks,function(i){
                callBack(itemChecks[i]);
            });
        };
        var setOrderListView = function(orderData){
            var orderListHtml = "";
            if(orderData.length > 0){
                fetchArr(orderData,function(i){
                    var thisData = orderData[i];
                    orderListHtml += order_m("new")(thisData["collectId"],thisData["orderName"],thisData["docNum"]);
                });
                orderList.innerHTML = orderListHtml;
                removeClass(arrangeTrigger,"hide");
                removeClass(deleteTrigger,"hide");
                addClass(orderList.children[0],"onSelect");
            }
        };
        var getOnSelectOrderItem = function(){
            return orderList.querySelector(".onSelect");
        };
        var resetDocListView = function(orderItem,shiftFlag){
            var resetView = viewController.getGContext("docList").getTrait("resetView");
            resetView(orderItem,0,10);
            if(shiftFlag){
                contentChange("contentShift")(1,0);
            }
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
                removeClass(arrangeTrigger,"hide");
                deleteBtnsView.lastChild.checked = false;
            }
        };
        var showEmptyOrderList = function(){
            cancelDelete();
            addClass(deleteTrigger,"hide");
            addClass(arrangeTrigger,"hide");
            orderList.innerHTML = orderEmptyHtml;
        };
        var doDeleteOrder = function(){
            var collectIds = new Array();
            var checkedItems = new Array();
            var onSelectCollectId = order_m("get")(getOnSelectOrderItem(),"collectId");
            fetchItemChecks(function(thisCheck){
                if(thisCheck.checked){
                    var thisItem = thisCheck.parentNode.parentNode;
                    collectIds.push(order_m("get")(thisItem,"collectId"));
                    checkedItems.push(thisItem);
                }
            });
            if(collectIds.length > 0){
                deleteOrder_c(collectIds)(function(res){
                    if(res){
                        fetchArr(checkedItems,function(i){
                            orderList.removeChild(checkedItems[i]);
                        });

                        if(orderList.querySelector("li[data-collectId=\""+onSelectCollectId+"\"]") === null){
                            if(orderList.innerHTML.length === 0){
                                showEmptyOrderList();
                                showEmptyDocView();
                            }else{
                                var firstOrderItem = orderList.children[0];
                                addClass(firstOrderItem,"onSelect");
                                resetDocListView(firstOrderItem,false);
                            }
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
            addClass(arrangeTrigger,"hide");
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
        var arrangeCheckFun = function(arrangeCheckInfo,checkedBox){
            if(arrangeCheckInfo.obj !== null){
                var arrangeCheck = arrangeCheckInfo.obj;
                if(arrangeCheck !== checkedBox && arrangeCheckInfo.flag){
                    var arrangeItem = arrangeCheck.parentNode.parentNode;
                    var referItem = checkedBox.parentNode.parentNode;
                    var arrangeId = order_m("get")(arrangeItem,"collectId");
                    var referId = order_m("get")(referItem,"collectId");
                    arrangeCheckInfo.flag = false;
                    if(typeof arrangeId === "string" && typeof referId === "string"){
                        arrangeOrder_c(arrangeId,referId)(function(res){
                            if(res){
                                orderList.insertBefore(arrangeItem,referItem);
                                arrangeCheck.checked = false;
                                checkedBox.checked = false;
                                tipView(true,"主题的顺序已改变.");
                            }else{
                                alert("更改主题顺序失败.");
                            }
                            arrangeCheckInfo.obj = null;
                            arrangeCheckInfo.flag = true;
                        });
                    }
                }else if(arrangeCheck === checkedBox){
                    checkedBox.checked = false;
                    arrangeCheckInfo.obj = null;
                }
            }else{
                arrangeCheckInfo.obj = checkedBox;
            }
        };
        var arrangeOrder_i = function(){
            if(!hasClass(arrangeTrigger,"hide")){
                addClass(deleteTrigger,"hide");
                addClass(arrangeTrigger,"hide");
                addClass(orderList,"on-check");
                removeClass(cancelArrangeTrigger,"hide");
            }
        };
        var cancelArrangeOrder_i = function(){
            if(!hasClass(cancelArrangeTrigger,"hide")){
                removeClass(orderList,"on-check");
                addClass(cancelArrangeTrigger,"hide");
                removeClass(deleteTrigger,"hide");
                removeClass(arrangeTrigger,"hide");
            }
        };
        var rmOrderListSelectedStyle = function(){
            removeClass(orderList.querySelector(".onSelect"),"onSelect"); 
        };
        var orderItemSelectedStyle = function(orderItem){
            rmOrderListSelectedStyle();
            addClass(orderItem,"onSelect");
        };
        var cancelOnOrderDocView_i = function(){
            rmOrderListSelectedStyle();
        };
        var loadOrderReadView = function(orderItem){
            var docsNum = parseInt(order_m("get")(orderItem,"orderDocsNum"));
            if(docsNum > 0){
                orderDocReadTask.pop();
                var collectId = order_m("get")(orderItem,"collectId");
                var orderName = order_m("get")(orderItem,"orderName");
                var orderReadContext = orderDocReadTask.orderRead_v(collectId,docsNum,0,orderName);
                orderDocReadTask.push(orderReadContext);
                orderReadContext.getOrderId(0,function(docId){
                    loadViewContext(viewFrag.textReader,docId);
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
                }else if(hasClass(target,"doc-list-trigger")){
                    thisNode = target.parentNode;
                }
            }else if(target.nodeName === "SPAN" && (hasClass(target,"num") || hasClass(target,"text"))){
                thisNode = target.parentNode.parentNode;
            }else if(!hasClass(cancelArrangeTrigger,"hide") && target.nodeName === "INPUT"){
                arrangeCheckFun(arrangeCheckInfo,target);
            }
            if(thisNode !== null){
                resetDocListView(thisNode,true);
                orderItemSelectedStyle(thisNode);
            }
        };
        return {
            "setView":function(orderListData){
                if(orderListData){
                    setOrderListView(orderListData);
                }       
            },"cleanView":function(){
                cancelOnOrderDocView_i();
                cancelDelete();
                orderList.innerHTML = orderEmptyHtml;
            },"event":function(){
                arrangeTrigger.addEventListener("click",arrangeOrder_i);
                cancelArrangeTrigger.addEventListener("click",cancelArrangeOrder_i);
                deleteTrigger.addEventListener("click",deleteOrder_i);
                deleteBtnsView.addEventListener("click",deleteOrderBtns_i);
                orderList.addEventListener("click",orderItem_i);
            },"removeEvent":function(){
                arrangeTrigger.removeEventListener("click",arrangeOrder_i);
                cancelArrangeTrigger.removeEventListener("click",cancelArrangeOrder_i);
                deleteTrigger.removeEventListener("click",deleteOrder_i);
                deleteBtnsView.removeEventListener("click",deleteOrderBtns_i);
                orderList.removeEventListener("click",orderItem_i);
            },"trait":function(){
                var thisContext = Context("orderList");
                thisContext.setTrait("getOnSelectOrderItem",getOnSelectOrderItem);
                viewController.setGContext(thisContext);
            }
        };
    }
    
    function scrollFun(){
        var tagScrollEvent = null;
        return {
            "addEvent":function(){
                if(window.checkPlatform === "pc"){
                    tagScrollEvent = tagScroll(tagSectionView,"order-scroll");
                    tagScrollEvent.addEvent();
                }
            },"removeEvent":function(){
                if(tagScrollEvent !== null){
                    tagScrollEvent.removeEvent();
                }
            }
        };
    }
    
    var viewScroll = scrollFun();
    
    var o = new Object();
    return {
        "init":function(){
            o.docList = docList_v();
            viewController.setGContext(o.docList.trait());
            o.pageTab = pageTab_v();
            o.orderList = orderList_v();
            o.pageTab.setView();
            o.orderList.setView(pageData["orderList"]);
            o.orderList.trait();
            o.docList.setView(pageData);
            viewScroll.addEvent();
            o.pageTab.event();
            o.docList.event();
            o.orderList.event();
            sectionTouch.event();
        },"free":function(){
            viewScroll.removeEvent();
            sectionTouch.removeEvent();
            o.docList = o.pageTab = o.orderList = sectionTouch = null;
        }
    };
}
function Class_V(controller,contentNode,viewFrag,pageData,fieldName,viewCallBack,reqFolderId){
    var viewController = Controller("class");
    var contextKey = viewDisplay(true);
    var cataViewNode = contentNode.querySelector("#class-view");
    var catalogueView = cataViewNode.querySelector(".path-view");
    var commonGroupView = cataViewNode.querySelector(".common-group-view");
    var fieldInfo = (function(){
        var o = new Object();
        var newIconItem = function(iconCode){
            return function(id,name,countHtml){
                return "<li data-id=\""+id+"\"><div><div class=\"icon\">"+iconCode+"</div><div>"+name+"</div></div><div class=\"sub-count\">"+countHtml+"</div></li>";
            };
        };
        var newFolderItem = function(id,name,countHtml){
            return "<li data-id=\""+id+"\"><div><div class=\"b-icon b-icon_type_folder\"></div><div>"+name+"</div></div><div class=\"sub-count\">"+countHtml+"</div></li>";
        };
        if(fieldName === "doc"){
            o.newPathHtml = newFolderItem;
            o.newSubHtml = newIconItem("&#xf0c5;");
            o.pathName = "文件夹";
            o.subName = "文档组";
            o.tabIcon = "&#xe83e;";
            o.pathTitle = "目录<i class=\"icon\">&#xe83d;</i>";
            o.commonTitle = "常用<i class=\"icon\">&#xf0c5;</i>";
        }else{
            o.newPathHtml = newIconItem("&#xe828;");
            o.newSubHtml = newIconItem("&#xe827;");
            o.pathName = "标签组";
            o.subName = "标签";
            o.tabIcon = "&#xe828;";
            o.pathTitle = "标签组<i class=\"icon\">&#xe828;</i>";
            o.commonTitle = "常用<i class=\"icon\">&#xe827;</i>";
        }
        return o;
    })();
    
    function setController(pageCallBack){
        var thisContext = Context(contextKey);
        thisContext.setTrait("viewDisplay",viewDisplay);
        thisContext.setTrait("pageBack",function(){
            pageCallBack(thisContext);
        });
        controller.pushContext(thisContext);
    }

    function viewDisplay(flag){
        var viewKey = "class";
        var classFrag = viewFrag[viewKey];
        if(flag && classFrag.childElementCount > 0){
            contentNode.appendChild(classFrag);
        }else if(!flag){
            var subContentNodes = contentNode.children;
            while(subContentNodes.length > 0){
                classFrag.appendChild(subContentNodes[0]);
            }
        }
        return viewKey;
    }
    
    function itemModel(newFun){
        return Model("item",{
            "id" : function(item){
                return item.getAttribute("data-id");
            },"name" : function(item){
                return item.firstChild.lastChild.innerText;
            },"count" : function(item){
                return item.querySelector(".sub-count").firstChild.innerText;
            }
        },{
            "id" : function(item,id){
                item.setAttribute("id",id);
            },"name" : function(item,name){
                item.firstChild.lastChild.innerText = name;
            },"count":function(item,num){
                var subCountNode = item.querySelector(".sub-count");
                num > 0 ? subCountNode.innerHTML="<span>"+num+"</span>项" : subCountNode.firstChild.innerText="空";
            }
        },newFun);
    }
    
    function addTopClass_c(name){
        return function(callBack){
            requestServer("POST","/webapp/controllers/ClassAction.php/AddTopClass/"+fieldName+'/',JSON.stringify({"name":name}),function(res){
                callBack(res);
            });
        };
    }
    
    function deleteTopClass_c(ids){
        return function(callBack){
            requestServer("POST","/webapp/controllers/ClassAction.php/DeleteTopClass/"+fieldName+'/',JSON.stringify({"ids":ids}),function(res){
                callBack(res);
            });
        };
    }
    
    function arrangeTopClass_c(topId,referTopId){
        return function(callBack){
            requestServer("GET","/webapp/controllers/ClassAction.php/ArrangeTopClass/"+fieldName+'/'+topId+'/'+referTopId+'/',null,function(res){
                callBack(res);
            });
        };
    }
    
    function getSubClass_c(topId){
        return function(callBack){
            requestServer("GET","/webapp/controllers/ClassAction.php/GetSubClass/"+fieldName+'/'+topId+'/',null,function(res){
                callBack(res);
            });
        };
    }
    
    function addSubClass_c(topId,name){
        return function(callBack){
            requestServer("POST","/webapp/controllers/ClassAction.php/AddSubClass/"+fieldName+'/'+topId+'/',JSON.stringify({"name":name}),function(res){
                callBack(res);
            });
        };
    }
    
    function deleteSubClass_c(topId,ids){
        return function(callBack){
            requestServer("POST","/webapp/controllers/ClassAction.php/DeleteSubClass/"+fieldName+'/'+topId+'/',JSON.stringify({"ids":ids}),function(res){
                callBack(res);
            });
        };
    }
    
    function arrangeSubClass_c(subId,referSubId){
        return function(callBack){
            requestServer("GET","/webapp/controllers/ClassAction.php/ArrangeTopClass/"+fieldName+'/'+subId+'/'+referSubId+'/',null,function(res){
                callBack(res);
            });
        };
    }
    
    function renameClsName_c(classId,name){
        return function(callBack){
            requestServer("POST","/webapp/controllers/ClassAction.php/RenameClass/"+fieldName+'/',JSON.stringify({"id":classId,"name":name}),function(res){
                callBack(res);
            });
        };
    }
    
    function getAllSubCls_c(){
        return function(callBack){
            requestServer("GET","/webapp/controllers/ClassAction.php/GetAllSubClass/"+fieldName+'/',null,function(res){
                callBack(res);
            });
        };
    }
    
    function getFreqCls_c(){
        return function(callBack){
            requestServer("GET","/webapp/controllers/ClassAction.php/GetFreqClass/"+fieldName+'/',null,function(res){
                callBack(res);
            });
        };
    }
    
    function addFreqCls_c(ids){
        return function(callBack){
            requestServer("POST","/webapp/controllers/ClassAction.php/AddFreqClass/"+fieldName+'/',JSON.stringify({"ids":ids}),function(res){
                callBack(res);
            });
        };
    }
    
    function deleteFreqCls_c(ids){
        return function(callBack){
            requestServer("POST","/webapp/controllers/ClassAction.php/DeleteFreqClass/"+fieldName+'/',JSON.stringify({"ids":ids}),function(res){
                callBack(res);
            });
        };
    }
    
    function arrangeFreqCls_c(freqId,referId){
        return function(callBack){
            requestServer("GET","/webapp/controllers/ClassAction.php/ArrangeFreqClass/"+fieldName+'/'+freqId+'/'+referId+'/',null,function(res){
                callBack(res);
            });
        };
    }
    
    function fetchItems(listUl,callBack){
        var items = listUl.querySelectorAll("li");
        fetchArr(items,function(i){
            callBack(items[i]);
        });
    };
    
    function setListCheckStyle(listUl){
        fetchItems(listUl,function(item){
            var subCount = item.querySelector(".sub-count");
            subCount.innerHTML = subCount.innerHTML+"<input type=\"checkBox\">";
        });
    }
    
    function removeListCheckStyle(listUl){
        fetchItems(listUl,function(item){
            var subCount = item.querySelector(".sub-count");
            var countText = subCount.querySelector("span").innerHTML;
            var targetText = "<span>"+countText+"</span>";
            if(countText !== "空"){
                targetText = targetText+"项";
            }
            subCount.innerHTML = targetText;
        });
    }
    
    function arrangeCheckFun(arrangeCheckInfo,list,checkedBox,model,arrange_req_c,pathText,callBack){
        if(arrangeCheckInfo.obj !== null){
            var arrangeCheck = arrangeCheckInfo.obj;
            if(arrangeCheck !== checkedBox && arrangeCheckInfo.flag){
                var arrangeItem = arrangeCheck.parentNode.parentNode;
                var referItem = checkedBox.parentNode.parentNode;
                var arrangeId = model("get")(arrangeItem,"id");
                var referId = model("get")(referItem,"id");
                arrangeCheckInfo.flag = false;
                arrange_req_c(arrangeId,referId)(function(res){
                    if(res){
                        list.insertBefore(arrangeItem,referItem);
                        arrangeCheck.checked = false;
                        checkedBox.checked = false;
                        if(typeof callBack === "function"){
                           callBack();
                       }
                        tipView(true,pathText+"的顺序已改变.");
                    }else{
                        alert(pathText+"更改顺序失败.");
                    }
                    arrangeCheckInfo.obj = null;
                    arrangeCheckInfo.flag = true;
                });
            }else if(arrangeCheck === checkedBox){
                checkedBox.checked = false;
                arrangeCheckInfo.obj = null;
            }
        }else{
            arrangeCheckInfo.obj = checkedBox;
        }
    }
    
    function setTitleNum(titleView,count,titleText){
        var countText = count > 0 ? count+"项" : "空";
        titleView.setAttribute("data-count",count);
        titleView.innerHTML = titleText+"<span>"+countText+"</span>";
    }
    
    function changeTitleNum(titleView,setNumCallBack){
        return function(type,offsetLen){
            var nowCount = parseInt(titleView.getAttribute("data-count"));
            if(type === "add"){
                setNumCallBack(nowCount+offsetLen);
            }else if(type === "sub"){
                setNumCallBack(nowCount-offsetLen);
            }
        };
    }
    
    function setTipNum(tipView,count){
        tipView.setAttribute("data-count",count);
        tipView.lastChild.innerText = count > 0 ? count+"项" : "空";
    }
    
    function changeTipNum(headView,tipClassName){
        return function(type,offsetLen){
            var tipView = headView.querySelector('.'+tipClassName);
            var nowCount = parseInt(tipView.getAttribute("data-count"));
            if(type === "add"){
                setTipNum(tipView,nowCount+offsetLen);
            }else if(type === "sub"){
                setTipNum(tipView,nowCount-offsetLen);
            }
        };
    }
    
    function muiltDeleteFun(list,callBack){
        var ids = new Array();
        var items = new Array();
        fetchItems(list,function(item){
            var thisCheck = item.querySelector("input");
            if(thisCheck.checked){
                items.push(item);
                ids.push(item.getAttribute("data-id"));
            }
        });
        callBack(ids,function(deleteItem){
            var len = items.length;
            while(items.length > 0){
                deleteItem(items.pop());
            }
            return len;
        });
    }
    
    function addContextMenu(item,contextMenuHtml){
        item.innerHTML = item.innerHTML+contextMenuHtml;
        return item.lastChild;
    }
    
    function setContextMenuPosi(e,itemNode,contextMenuHtml,exitLOffset){
        var contextMenu = addContextMenu(itemNode,contextMenuHtml);
        var preX = e.clientX-38-itemNode.offsetLeft;
        var offsetX = typeof exitLOffset === "number" ? preX-exitLOffset : preX;
        var offsetY = e.clientY-141-itemNode.offsetTop;
        contextMenu.style.left = offsetX+"px";
        contextMenu.style.top = offsetY+itemNode.parentNode.scrollTop+compatScrollY()+"px";
    }
    
    function removeContextMenu(listView){
        var contextMenu = listView.querySelector(".context-menu");
        if(contextMenu !== null){
            var item = contextMenu.parentNode;
            item.innerHTML = "<div>"+item.firstChild.innerHTML+"</div>"+"<div class=\"sub-count\">"+item.querySelector(".sub-count").innerHTML+"</div>";
        }
    }
    
    function getListItemByEvent(listView){
        return function(e){
            e.stopPropagation();
            var target = e.target;
            var nodeName = target.nodeName;
            var thisNode = null;
            if(nodeName === "DIV"){
                var parentNode = target.parentNode;
                var parentNodeName = parentNode.nodeName;
                if(parentNodeName === "LI"){
                    thisNode = parentNode;
                }else if(parentNodeName === "DIV"){
                    thisNode = parentNode.parentNode;
                }else if(parentNodeName === "LI"){
                    thisNode = target;
                }
            }else if(nodeName === "LI"){
                thisNode = target;
            }
            removeContextMenu(listView);
            return thisNode;
        };
    }
    
    function contextMenuFun(getItemNode_f,callBack){
        return function(e){
            var ev = e || event;
            ev.preventDefault();
            var itemNode = getItemNode_f(e);
            if(itemNode !== null){
                callBack(ev,itemNode);
            }
        };
    }
    
    function setViewListData(model,callBack){
        return function(listData){
            var listHtml = "";
            fetchArr(listData,function(i){
                var thisData = listData[i];
                listHtml += model("new")(thisData.classId,thisData.className,thisData.countSub);
            });
            callBack(listHtml);
        };
    }
    
    function checkBoxEventFun(target,list,callBack){
        if(target.nodeName === "INPUT"){
            var items = list.querySelectorAll("li");
            var countChecked = 0;
            for(var i=0,len=items.length;i<len;i++){
                var thisCheck = items[i].querySelector("input");
                if(thisCheck.checked){
                    countChecked ++;
                }
            }
            callBack(countChecked > 1);
        }
    }
    
    function getOneFromMuiltCheck(list,callBack){
        var items = list.querySelectorAll("li");
        for(var i=0,len=items.length;i<len;i++){
            var thisItem = items[i];
            var thisCheck = thisItem.querySelector("input");
            if(thisCheck.checked){
                callBack(thisItem);
                break;
            }
        }
    }
    
    function setViewCallBack_i(item,model){
        if(typeof viewCallBack === "function"){
            var pathChanged = viewController.getGContext("pathView").getTrait("getChangedFlag")();
            reqFolderId !== null ? viewCallBack(model("get")(item,"id"),model("get")(item,"name")) : viewCallBack(model("get")(item,"id"),pathChanged);
            controller.getGContext("tabView").getTrait("tabPageBack")();
        }
    }
    
    function callTextEditor_i(docData){    
        var key = "textEditor";
        var textViewFrag = viewFrag["textEditor"];
        var classViewPop = function(){
            var popContext = controller.popContext();
            var pageBackFun = popContext.getTrait("pageBack");
            if(typeof pageBackFun === 'function'){
                pageBackFun();
            }
            popContext.getTrait("viewDisplay")(false);
        };
        var callEditorView = function(){
            TextEditor_V(controller,contentNode,viewFrag,null,docData);
            controller.getGContext("tabView").getTrait("setView")("addDoc");
        };
        classViewPop();
        if(textViewFrag.childElementCount === 0){
            addCss("/webapp/css/"+key+".css");
            LoadCompView_C(key)(function(res){
                var fileData = JSON.parse(res);
                loadView(key,contentNode,fileData["html"],function(){
                    callEditorView();
                });
            });
        }else if(checkViewScript(key)){
            callEditorView();
        }
    }
    
    function catalogue_v(){
        var pathHeadView = catalogueView.querySelector(".path-head-view");
        var pathTitle = catalogueView.querySelector(".catalogue-title");
        var pathListView = catalogueView.querySelector(".path-list-view");
        var pathListUl = pathListView.querySelector("ul");
        var addBtn = pathHeadView.querySelector(".add-trigger");
        var arrangeTrigger = pathHeadView.querySelector(".arrange-trigger");
        var cancelArrangeBtn = pathHeadView.querySelector(".cancel-arrange-btn");
        var editView = pathHeadView.querySelector(".edit-view");
        var folderListHtml = "";
        var groupViewFlag = false;
        var pathChangedFlag = false;
        var arrangeCheckInfo = {"obj":null,"flag":true};
        var catalogue_m = itemModel(function(id,name,countSub){
            var countHtml = countSub > 0 ? "<span>"+countSub+"</span>项" : "<span>空</span>";
            return !groupViewFlag ? fieldInfo.newPathHtml(id,name,countHtml) : fieldInfo.newSubHtml(id,name,countHtml);
        });
        var getPathChangedFlag = function(){
            return pathChangedFlag;
        };
        var setPathChangedFlag = function(flag){
            if(pathChangedFlag !== flag){
                pathChangedFlag = flag;
            }
        };
        var insertNewItem = function(itemHtml,bottomFlag){
            pathListUl.innerHTML = pathListUl.innerHTML+itemHtml;
            if(bottomFlag && pathListView.offsetHeight !== pathListView.scrollHeight){
                pathListView.scrollTop = pathListView.scrollHeight-pathListView.offsetHeight;
            }
        };
        var getContextMenuHtml = function(){
            var html = "<div class=\"context-menu\">";
            if(fieldName === "doc" && groupViewFlag){
                html += "<div class=\"create-doc-btn\">新建文档</div>";
            }
            html += "<div class=\"rename-btn\">重命名</div><div class=\"delete-btn\">删除</div></div>";
            return html;
        };
        var setCatalogueFolderNum = function(count){
            setTitleNum(pathTitle,count,fieldInfo.pathTitle);
        };
        var changeCatalogueFolderNum = changeTitleNum(pathTitle,setCatalogueFolderNum);
        var changeCatalogueGroupNum = changeTipNum(pathHeadView,"catalogue-tip");
        var addFolder = function(name){
            addTopClass_c(name)(function(res){
                if(res){
                    var data = JSON.parse(res);
                    if(data.hasOwnProperty("id")){
                        var itemHtml = catalogue_m("new")(data.id,name,0);
                        insertNewItem(itemHtml,true);
                        changeCatalogueFolderNum("add",1);
                        setPathChangedFlag(true);
                        tipView(true,"添加了一个新"+fieldInfo.pathName+'.');
                    }
                }else{
                    alert("添加"+fieldInfo.pathName+"失败.");
                }
            });
        };
        var addDocGroup = function(name){
            var catalogueTip = pathHeadView.querySelector(".catalogue-tip");
            var topId = catalogueTip.getAttribute("data-id");
            addSubClass_c(topId,name)(function(res){
                if(res){
                    var data = JSON.parse(res);
                    if(data.hasOwnProperty("id")){
                        var itemHtml = catalogue_m("new")(data.id,name,0);
                        insertNewItem(itemHtml,true);
                        changeCatalogueGroupNum("add",1);
                        setPathChangedFlag(true);
                        tipView(true,"添加了一个新"+fieldInfo.subName+'.');
                    }
                }else{
                    alert("添加"+fieldInfo.subName+"失败.");
                }
            });
        };
        var addItem_i = function(){
            var onFolder = !groupViewFlag;
            var tipText = onFolder ? fieldInfo.pathName+"名称:" : fieldInfo.subName+"名称:"; 
            var name = prompt(tipText);
            if(name !== null && trim(name).length > 0){
                onFolder ? addFolder(name) : addDocGroup(name);
            }
        };
        var initListData = setViewListData(catalogue_m,function(listHtml){
            insertNewItem(listHtml,false);
        });
        var showRenameBtn = function(flag){
            var renameBtn = editView.querySelector(".rename-btn");
            flag ? removeClass(renameBtn,"hide") : addClass(renameBtn,"hide");  
        };
        var showCreateDocBtn = function(flag){
            if(fieldName === "doc" && groupViewFlag){
                var createBtn = editView.querySelector(".create-doc-btn");
                flag ? removeClass(createBtn,"hide") : addClass(createBtn,"hide");  
            }
        };
        var rename_input = function(item){
            var id = catalogue_m("get")(item,"id");
            var name = catalogue_m("get")(item,"name");
            var name = trim(prompt("新名称:"));
            if(name !== null && name.length > 0){
                renameClsName_c(id,name)(function(res){
                    if(res){
                        catalogue_m("set")(item,"name",name);
                        setPathChangedFlag(true);
                        tipView(true,!groupViewFlag ? fieldInfo.pathName+"已更名." : fieldInfo.subName+"已更名.");
                    }
                });
            }
        };
        var rename_m_i = function(){
            var items = pathListUl.querySelectorAll("li");
            for(var i=0,len=items.length;i<len;i++){
                var thisItem = items[i];
                var thisCheck = thisItem.querySelector("input");
                if(thisCheck.checked){
                    rename_input(thisItem);
                    break;
                }
            }
        };
        var deleteFolder = function(ids,callBack){
            if(ids.length > 0){
                deleteTopClass_c(ids)(function(res){
                    var pathName = fieldInfo.pathName;
                    if(res){
                        var data = JSON.parse(res);
                        if(data.hasOwnProperty("countFreq") && parseInt(data.countFreq) > 0){
                            viewController.getGContext("commonView").getTrait("reloadGroupList")();
                        }
                        callBack();
                        setPathChangedFlag(true);
                        tipView(true,"已删除所选"+pathName+'.');
                    }else{
                        alert("删除"+pathName+"失败.");
                    }
                });
            }
        };
        var deleteGroup = function(ids,callBack){
            if(ids.length > 0){
                var topId = pathHeadView.querySelector(".catalogue-tip").getAttribute("data-id");
                deleteSubClass_c(topId,ids)(function(res){
                    var subName = fieldInfo.subName;
                    if(res){
                        var data = JSON.parse(res);
                        if(data.hasOwnProperty("countFreq") && parseInt(data.countFreq) > 0){
                            viewController.getGContext("commonView").getTrait("reloadGroupList")();
                        }
                        callBack();
                        setPathChangedFlag(true);
                        tipView(true,"已删除所选"+subName+'.');
                    }else{
                        alert("删除"+subName+"失败.");
                    }
                });
            }
        };
        var deleteItem = function(item){
            pathListUl.removeChild(item);
        };
        var delete_m_i = function(){
            muiltDeleteFun(pathListUl,function(ids,endProcess){
                !groupViewFlag ? deleteFolder(ids,function(){
                    changeCatalogueFolderNum("sub",endProcess(deleteItem));
                }) : deleteGroup(ids,function(){
                    changeCatalogueGroupNum("sub",endProcess(deleteItem));
                });
            });
        };
        var showEditView = function(){
            if(!hasClass(addBtn,"hide")){
                setListCheckStyle(pathListUl);
                addClass(addBtn,"hide");
                addClass(arrangeTrigger,"hide");
                showCreateDocBtn(true);
                removeClass(editView,"hide");
            }
        };
        var create_doc_i = function(item){
            callTextEditor_i({"groupId":catalogue_m("get")(item,"id")});
        };
        var create_doc_m_i = function(){
            getOneFromMuiltCheck(pathListUl,create_doc_i);
        };
        var cancelEdit_i = function(){
            if(!hasClass(editView,"hide")){
                removeListCheckStyle(pathListUl);
            }
            showRenameBtn(true);
            showCreateDocBtn(false);
            addClass(editView,"hide");
            removeClass(addBtn,"hide");
            removeClass(arrangeTrigger,"hide");
        };
        var editView_i = function(e){
            var target = e.target;
            if(target.nodeName === "A"){
                if(hasClass(target,"cancel-edit-btn")){
                    cancelEdit_i();
                }else if(hasClass(target,"create-doc-btn")){
                    create_doc_m_i();
                }else if(hasClass(target,"rename-btn")){
                    rename_m_i();
                }else{
                    delete_m_i();
                }
            }
        };
        var getItemNodeByEvent = getListItemByEvent(pathListView);
        var loadGroupList = function(folderId){
            getSubClass_c(folderId)(function(res){
                if(res){
                    var data = JSON.parse(res);
                    if(data.hasOwnProperty("subClsList")){
                        initListData(data["subClsList"]);
                    }
                }
            });
        };
        var cancelArrange_i = function(){
            if(!hasClass(cancelArrangeBtn,"hide")){
                removeListCheckStyle(pathListUl);
                addClass(cancelArrangeBtn,"hide");
                removeClass(addBtn,"hide");
                removeClass(arrangeTrigger,"hide");
            }
        };
        var pathArrangeCheckFun = function(thisCheck){
            var pathText = !groupViewFlag ? fieldInfo.pathName : fieldInfo.subName;
            var arrange_context = !groupViewFlag ? arrangeTopClass_c : arrangeSubClass_c;
            arrangeCheckFun(arrangeCheckInfo,pathListUl,thisCheck,catalogue_m,arrange_context,pathText,function(){
                setPathChangedFlag(true);
            });
        };
        var setArrangeView_i = function(){
            if(!hasClass(addBtn,"hide")){
                setListCheckStyle(pathListUl);
                addClass(addBtn,"hide");
                addClass(arrangeTrigger,"hide");
                removeClass(cancelArrangeBtn,"hide");
            }
        };
        var cancelFolderFun = function(tipDiv,folderId){
            cancelEdit_i();
            cancelArrange_i();
            pathListUl.innerHTML = folderListHtml;
            var folderItem = pathListUl.querySelector("li[data-id=\""+folderId+"\"]");
            groupViewFlag = false;
            catalogue_m("set")(folderItem,"count",parseInt(tipDiv.getAttribute("data-count")));
            folderListHtml = "";
            pathHeadView.removeChild(tipDiv);
            tipDiv = null;
            removeClass(pathTitle,"hide");
            addClass(pathListUl,"folder");
        };
        var addCancelFolderEvent = function(tipDiv,folderId){
            tipDiv.addEventListener("click",function(e){
                var target = e.target;
                if(target.nodeName === "A" && hasClass(target,"icon-btn") || target.nodeName === "SPAN" && hasClass(target,"icon-chevron-left-l")){
                    cancelFolderFun(tipDiv,folderId);
                }
            });
        };
        var enterPathFun = function(folderItem){
            if(folderItem !== null){
                var folderId = catalogue_m("get")(folderItem,"id");
                var count = catalogue_m("get")(folderItem,"count");
                var countText = count !== "空" ? count+"项" : count;
                var countNum = count !== "空" ? parseInt(count) : 0;
                var tipDiv = document.createElement("div");
                tipDiv.innerHTML = "<a class=\"icon-btn\"><span class=\"icon-chevron-left-l\"></span></a><span><i class=\"icon\">"+fieldInfo.tabIcon+"</i><span>"+catalogue_m("get")(folderItem,"name")+"</span></span><span>"+countText+"</span>";
                addClass(tipDiv,"catalogue-tip");
                addClass(pathTitle,"hide");
                removeClass(pathListUl,"folder");
                tipDiv.setAttribute("data-id",folderId);
                tipDiv.setAttribute("data-count",countNum);
                pathHeadView.insertBefore(tipDiv,pathTitle);
                folderListHtml = pathListUl.innerHTML;
                pathListUl.innerHTML = "";
                groupViewFlag = true;
                if(countNum > 0){
                    loadGroupList(folderId);
                }
                addCancelFolderEvent(tipDiv,folderId);
            }
        };
        var enterPath_i = function(e){
            if(!groupViewFlag && !hasClass(addBtn,"hide")){
                enterPathFun(getItemNodeByEvent(e));
            }
        };
        var editCheckFun = function(target){
            checkBoxEventFun(target,pathListUl,function(countFlag){
                if(countFlag){
                    showRenameBtn(false);
                    showCreateDocBtn(false);
                }else{
                    showRenameBtn(true);
                    showCreateDocBtn(true);
                }
            });
        };
        var menuFun = function(target,item){
            if(item !== null){
                if(hasClass(target,"rename-btn")){
                    rename_input(item);
                }else if(hasClass(target,"create-doc-btn")){
                    create_doc_i(item);
                }else{
                    (function(){
                        var ids = new Array();
                        ids.push(catalogue_m("get")(item,"id"));
                        !groupViewFlag ? deleteFolder(ids,function(){
                            deleteItem(item);
                            changeCatalogueFolderNum("sub",1);
                        }) : deleteGroup(ids,function(){
                            deleteItem(item);
                            changeCatalogueGroupNum("sub",1);
                        });
                    })();
                }
            }
        };
        var pathListUl_i = function(e){
            var target = e.target;
            var thisItem = null;
            var clickFun = function(){
                if(groupViewFlag && pathListUl.querySelector(".context-menu") !== null){
                    removeContextMenu(pathListUl);
                }else{
                    thisItem = getItemNodeByEvent(e);
                    if(thisItem !== null && groupViewFlag){
                        setViewCallBack_i(thisItem,catalogue_m);
                    }
                    if(!hasClass(cancelArrangeBtn,"hide") && target.nodeName === "INPUT"){
                        pathArrangeCheckFun(target);
                    }
                }
            };
            if(checkSmallWin()){
                editCheckFun(target);
                clickFun();
            }else if(target.nodeName === "DIV" && hasClass(target.parentNode,"context-menu")){
                menuFun(target,getItemNodeByEvent(e)); 
            }else{
                clickFun();
            }
        };
        return {
            "setView" : function(pageData){
                if(pageData.hasOwnProperty("topClsList")){
                    var topClsList = pageData["topClsList"];
                    var count = topClsList.length;
                    initListData(topClsList);
                    setCatalogueFolderNum(count);
                    if(typeof reqFolderId === "string"){
                        enterPathFun(pathListUl.querySelector("li[data-id=\""+reqFolderId+"\"]"));
                    }
                }
            },"cleanView" : function(){
                if(groupViewFlag){
                    var catalogueTip = pathHeadView.querySelector(".catalogue-tip");
                    var topId = catalogueTip.getAttribute("data-id");
                    cancelFolderFun(catalogueTip,topId);
                }else{
                    cancelEdit_i();
                    cancelArrange_i();
                }
                pathListUl.innerHTML = "";
            },"event" : function(){
                var timer = null;
                var longPressed = false;
                arrangeTrigger.addEventListener("click",setArrangeView_i);
                addBtn.addEventListener("click",addItem_i);
                editView.addEventListener("click",editView_i);
                cancelArrangeBtn.addEventListener("click",cancelArrange_i);
                pathListUl.addEventListener("click",pathListUl_i);
                pathListUl.addEventListener("dblclick",enterPath_i,false);
                pathListUl.addEventListener("touchend",enterPath_i,false);
		pathListUl.oncontextmenu = contextMenuFun(getItemNodeByEvent,function(ev,itemNode){
                    if(!checkSmallWin()){
                        setContextMenuPosi(ev,itemNode,getContextMenuHtml());
                    }else{
                        showEditView();
                    }
                });
                pathListUl.addEventListener("touchstart", function (e) {
                    timer = setTimeout(function () {
                         e.preventDefault();
                         showEditView();
                         longPressed = true;
                    }, 500);
                });
                pathListUl.addEventListener("touchmove", function (e) {
                     clearTimeout(timer);
                     timer = 0;
                });
                pathListUl.addEventListener("touchend", function (e) {
                    if(longPressed){
                        e.preventDefault();
                        longPressed = false;
                    }
                    clearTimeout(timer);
                    return false;
                });
            },"removeEvent" : function(){
                arrangeTrigger.removeEventListener("click",setArrangeView_i);
                addBtn.removeEventListener("click",addItem_i);
                editView.removeEventListener("click",editView_i);
                pathListUl.removeEventListener("click",pathListUl_i);
                cancelArrangeBtn.removeEventListener("click",cancelArrange_i);
                pathListUl.removeEventListener("dblclick",enterPath_i,false);
                pathListUl.removeEventListener("touchend",enterPath_i,false);
                pathListUl.oncontextmenu = null;
            },"setTrait" : function(){
                var thisContext = Context("pathView");
                thisContext.setTrait("getChangedFlag",getPathChangedFlag);
                viewController.setGContext(thisContext);
            }
        };
    }
    
    function commonGroup_v(){
        var groupHeadView = commonGroupView.querySelector(".common-group-head");
        var groupTitle = commonGroupView.querySelector(".common-group-title");
        var groupListView = commonGroupView.querySelector(".common-group-list");
        var groupListUl = groupListView.querySelector("ul");
        var addBtn = groupHeadView.querySelector(".add-trigger");
        var arrangeTrigger = groupHeadView.querySelector(".arrange-trigger");
        var cancelArrangeBtn = groupHeadView.querySelector(".cancel-arrange-btn");
        var editView = groupHeadView.querySelector(".edit-view");
        var addView = groupHeadView.querySelector(".add-view");
        var groupListHtml = "";
        var addViewInfo = {"flag":false,"count":0};
        var arrangeCheckInfo = {"obj":null,"flag":true};
        var freqChangedFlag = false;
        var group_m = itemModel(function(id,name,countSub){
            var countHtml = countSub > 0 ? "<span>"+countSub+"</span>项" : "<span>空</span>";
            return fieldInfo.newSubHtml(id,name,countHtml);
        });
        var getFreqChangedFlag = function(){
            return freqChangedFlag;
        };
        var setFreqChangedFlag = function(flag){
            if(freqChangedFlag !== flag){
                freqChangedFlag = flag;
            }
        };
        var getContextMenuHtml = function(){
            var html = "<div class=\"context-menu\">";
            if(fieldName === "doc" && !addViewInfo.flag){
                html += "<div class=\"create-doc-btn\">新建文档</div>";
            }
            html += "<div class=\"delete-btn\">删除</div></div>";
            return html;
        };
        var setGroupNum = function(count){
            setTitleNum(groupTitle,count,fieldInfo.commonTitle);
        };
        var changeGroupNum = changeTitleNum(groupTitle,setGroupNum);
        var changeAddListNum = changeTipNum(groupHeadView,"group-tip");
        var getItemNodeByEvent = getListItemByEvent(groupListView);
        var initListData = setViewListData(group_m,function(listHtml){
            groupListUl.innerHTML = groupListUl.innerHTML+listHtml;
        });
        var reloadGroupList = function(){
            getFreqCls_c()(function(res){
                if(res){
                    var data = JSON.parse(res);
                    if(data.hasOwnProperty("freqClsList")){
                        var listData = data["freqClsList"];
                        var count = listData.length;
                        groupListUl.innerHTML = "";
                        initListData(listData);
                        setGroupNum(count);
                        setFreqChangedFlag(true);
                    }
                }
            });
        };
        var deleteItem = function(item){
            groupListUl.removeChild(item);
        };
        var singleAdd_i = function(item){
            if(item !== null){
                var id = group_m("get")(item,"id");
                if(typeof id === "string"){
                    var ids = new Array();
                    ids.push(id);
                    addFreqCls_c(ids)(function(res){
                        if(res){
                            addViewInfo.count ++;
                            deleteItem(item);
                            changeAddListNum("sub",1);
                            tipView(true,"添加了1个常用"+fieldInfo.subName+'.');
                        }
                    });
                }
            }
        };
        var muiltAdd_i = function(){
            var ids = new Array();
            var items = new Array();
            fetchItems(groupListUl,function(item){
                if(item.querySelector("input").checked){
                    items.push(item);
                    ids.push(item.getAttribute("data-id"));
                }
            });
            if(ids.length > 0){
                addFreqCls_c(ids)(function(res){
                    if(res){
                        var len = items.length;
                        while(items.length > 0){
                            deleteItem(items.pop());
                        }
                        addViewInfo.count = len;
                        changeAddListNum("sub",len);
                        tipView(true,"添加了"+len+"个常用"+fieldInfo.subName+'.');
                    }
                });
            }
        };
        var cancelMuiltAdd_i = function(){
            if(!hasClass(addView,"hide")){
                removeListCheckStyle(groupListUl);
                addClass(addView,"hide");
            }
        };
        var muiltAddView = function(){
            if(hasClass(addView,"hide")){
                setListCheckStyle(groupListUl);
                removeClass(addView,"hide");
            }
        };
        var muiltAddView_i = function(e){
            var target = e.target;
            if(target.nodeName === "A"){
                hasClass(target,"cancel-add-btn") ? cancelMuiltAdd_i() : muiltAdd_i();
            }
        };
        var cancelAddListFun = function(tipDiv){
            cancelMuiltAdd_i();
            addClass(addView,"hide");
            removeClass(groupListUl,"add-list");
            groupListUl.innerHTML = groupListHtml;
            groupListHtml = "";
            groupHeadView.removeChild(tipDiv);
            tipDiv = null;
            removeClass(groupTitle,"hide");
            removeClass(addBtn,"hide");
            removeClass(arrangeTrigger,"hide");
            if(addViewInfo.count > 0){
                reloadGroupList();
            }
            addViewInfo.flag = false;
            addViewInfo.count = 0;
        };
        var cancelAddListEvent = function(tipDiv){
            tipDiv.addEventListener("click",function(e){
                var target = e.target;
                if(target.nodeName === "A" && hasClass(target,"icon-btn") || target.nodeName === "SPAN" && hasClass(target,"icon-chevron-left-l")){
                    cancelAddListFun(tipDiv);
                }
            });
        };
        var addItem_i = function(){
            var tipDiv = document.createElement("div");
            getAllSubCls_c()(function(res){
                if(res){
                    var data = JSON.parse(res);
                    if(data.hasOwnProperty("subClsList")){
                        var listData = data["subClsList"];
                        var count = listData.length;
                        var countText = count > 0 ? count+"项" : "空" ;
                        addClass(tipDiv,"group-tip");
                        addClass(groupTitle,"hide");
                        addClass(groupListUl,"add-list");
                        groupHeadView.insertBefore(tipDiv,groupTitle);
                        groupListHtml = groupListUl.innerHTML;
                        groupListUl.innerHTML = "";
                        addClass(addBtn,"hide");
                        addClass(arrangeTrigger,"hide");
                        tipDiv.innerHTML = "<a class=\"icon-btn\"><span class=\"icon-chevron-left-l\"></span></a><span>加入常用</span><span>"+countText+"</span>";
                        initListData(listData);
                        tipDiv.setAttribute("data-count",count);
                        addViewInfo.flag = true;
                    }
                }
            });
            cancelAddListEvent(tipDiv);
        };
        var deleteFreqCls = function(ids,callBack){
            if(ids.length > 0){
                deleteFreqCls_c(ids)(function(res){
                    if(res){
                        callBack();
                        setFreqChangedFlag(true);
                        tipView(true,"已删除所选常用项.");
                    }else{
                        alert("删除常用项失败.");
                    }
                });
            }
        };
        var delete_s_i = function(item){
            if(item !== null){
                var id = group_m("get")(item,"id");
                if(typeof id === "string"){
                    var ids = new Array();
                    ids.push(id);
                    deleteFreqCls(ids,function(){
                        deleteItem(item);
                        changeGroupNum("sub",1);
                    });
                }
            }
        };
        var delete_m_i = function(){
            muiltDeleteFun(groupListUl,function(ids,endProcess){
                deleteFreqCls(ids,function(){
                    changeGroupNum("sub",endProcess(deleteItem));
                }); 
            });
        };
        var create_doc_i = function(item){
            callTextEditor_i({"groupId":group_m("get")(item,"id")});
        };
        var create_doc_m_i = function(){
            getOneFromMuiltCheck(groupListUl,create_doc_i);
        };
        var showCreateDocBtn = function(flag){
            if(fieldName === "doc" && !addViewInfo.flag){
                var createBtn = editView.querySelector(".create-doc-btn");
                flag ? removeClass(createBtn,"hide") : addClass(createBtn,"hide");  
            }
        };
        var editCheckFun = function(target){
            if(!addViewInfo.flag){
                checkBoxEventFun(target,groupListUl,function(countFlag){
                    countFlag ? showCreateDocBtn(false) : showCreateDocBtn(true);
                });
            }
        };
        var cancelEdit_i = function(){
            if(!hasClass(editView,"hide")){
                removeListCheckStyle(groupListUl);
                showCreateDocBtn(true);
                addClass(editView,"hide");
                removeClass(addBtn,"hide");
                removeClass(arrangeTrigger,"hide");
            }
        };
        var editView_i = function(e){
            var target = e.target;
            if(target.nodeName === "A"){
                if(hasClass(target,"cancel-edit-btn")){
                    cancelEdit_i();
                }else if(hasClass(target,"create-doc-btn")){
                    create_doc_m_i();
                }else{
                    delete_m_i();
                }
            }
        };
        var showEditView = function(){
            if(!hasClass(addBtn,"hide")){
                setListCheckStyle(groupListUl);
                addClass(addBtn,"hide");
                addClass(arrangeTrigger,"hide");
                removeClass(editView,"hide");
            }
        };
        var setArrangeView_i = function(){
            if(!hasClass(addBtn,"hide")){
                setListCheckStyle(groupListUl);
                addClass(addBtn,"hide");
                addClass(arrangeTrigger,"hide");
                removeClass(cancelArrangeBtn,"hide");
            }
        };
        var cancelArrange_i = function(){
            if(!hasClass(cancelArrangeBtn,"hide")){
                removeListCheckStyle(groupListUl);
                addClass(cancelArrangeBtn,"hide");
                removeClass(addBtn,"hide");
                removeClass(arrangeTrigger,"hide");
            }
        };
        var menuFun = function(target,item){
            if(item !== null){
                hasClass(target,"create-doc-btn") ? create_doc_i(item) : delete_s_i(item);
            }
        };
        var groupListUl_i = function(e){
            var target = e.target;
            var thisItem = null;
            var singleAdd = function(){
                if(addViewInfo.flag){
                    singleAdd_i(getItemNodeByEvent(e));
                }
            };
            var clickFun = function(){
                if(groupListUl.querySelector(".context-menu") !== null){
                    removeContextMenu(groupListUl);
                }else{
                    thisItem = getItemNodeByEvent(e);
                    if(thisItem !== null && !addViewInfo.flag){
                        setViewCallBack_i(thisItem,group_m);
                    }
                    if(!hasClass(cancelArrangeBtn,"hide") && target.nodeName === "INPUT"){
                        arrangeCheckFun(arrangeCheckInfo,groupListUl,target,group_m,arrangeFreqCls_c,fieldInfo.subName,function(){
                            setFreqChangedFlag(true);
                        });
                    }
                }
            };
            if(checkSmallWin()){
                singleAdd();
                editCheckFun(target);
                clickFun();
            }else if(target.nodeName === "DIV" && hasClass(target.parentNode,"context-menu")){
                menuFun(target,getItemNodeByEvent(e));
            }else{
                singleAdd();
                clickFun();
            }
        };
        var contextMenu_i = contextMenuFun(getItemNodeByEvent,function(ev,itemNode){
            if(addViewInfo.flag){
                muiltAddView();
            }else if(!checkSmallWin()){
                setContextMenuPosi(ev,itemNode,getContextMenuHtml(),commonGroupView.offsetLeft);
            }else if(!hasClass(addBtn,"hide")){
                showEditView();
            }
        });
        return {
            "setView" : function(pageData){
                if(pageData.hasOwnProperty("freqClsList")){
                    var freqClsList = pageData["freqClsList"];
                    var count = freqClsList.length;
                    initListData(freqClsList);
                    setGroupNum(count);
                }
            },"cleanView" : function(){
                if(addViewInfo.flag){
                    var groupTip = groupHeadView.querySelector(".group-tip");
                    cancelAddListFun(groupTip);
                    cancelEdit_i();
                    cancelArrange_i();
                }else{
                    cancelEdit_i();
                    cancelArrange_i();
                }
                groupListUl.innerHTML = "";
            },"event" : function(){
                var timer = null;
                var longPressed = false;
                arrangeTrigger.addEventListener("click",setArrangeView_i);
                addBtn.addEventListener("click",addItem_i);
                addView.addEventListener("click",muiltAddView_i);
                editView.addEventListener("click",editView_i);
                cancelArrangeBtn.addEventListener("click",cancelArrange_i);
		groupListUl.addEventListener("contextmenu",contextMenu_i);
                groupListUl.addEventListener("click",groupListUl_i);
                groupListUl.addEventListener("touchstart", function (e) {
                    timer = setTimeout(function () {
                         e.preventDefault();
                         contextMenu_i(e);
                         longPressed = true;
                    }, 500);
                });
                groupListUl.addEventListener("touchmove", function (e) {
                     clearTimeout(timer);
                     timer = 0;
                });
                groupListUl.addEventListener("touchend", function (e) {
                    if(longPressed){
                        e.preventDefault();
                        longPressed = false;
                    }
                    clearTimeout(timer);
                    return false;
                });
            },"removeEvent" : function(){
                arrangeTrigger.removeEventListener("click",setArrangeView_i);
                addBtn.removeEventListener("click",addItem_i);
                addView.removeEventListener("click",muiltAddView_i);
                editView.removeEventListener("click",editView_i);
                cancelArrangeBtn.removeEventListener("click",cancelArrange_i);
                groupListUl.removeEventListener("contextmenu",contextMenu_i);
                groupListUl.removeEventListener("click",groupListUl_i);
            },"setTrait" : function(){
                var thisContext = Context("commonView");
                thisContext.setTrait("reloadGroupList",reloadGroupList);
                thisContext.setTrait("getChangedFlag",getFreqChangedFlag);
                viewController.setGContext(thisContext);
            }
        };
    }
    
    var setPopInfo = function(thisContext){
        var pathChanged = viewController.getGContext("pathView").getTrait("getChangedFlag")();
        var freqChanged = viewController.getGContext("commonView").getTrait("getChangedFlag")();
        if(pathChanged){
            thisContext.popInfo.pathChanged = pathChanged;
        }
        if(freqChanged){
            thisContext.popInfo.freqChanged = freqChanged;
        }
    };
    
    var catalogueView = catalogue_v();
    catalogueView.setView(pageData);
    catalogueView.setTrait();
    catalogueView.event();
    var commonView = commonGroup_v();
    commonView.setView(pageData);
    commonView.setTrait();
    commonView.event();
    
    setController(function(thisContext){
        viewController.getGContext("pathView").getTrait("getChangedFlag")();
        setPopInfo(thisContext);
        catalogueView.removeEvent();
        commonView.removeEvent();
        catalogueView.cleanView();
        commonView.cleanView();
        catalogueView = commonView = null;
    }); 
}
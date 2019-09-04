function DocPath_V(catalogueView,pageData,issueId,viewCallBack,pathBackCall){
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
        o.newPathHtml = newFolderItem;
        o.newSubHtml = newIconItem("&#xf0c5;");
        o.pathName = "文件夹";
        o.subName = "文档组";
        o.tabIcon = "&#xe83e;";
        o.pathTitle = "目录<i class=\"icon\">&#xe83d;</i>";
        return o;
    })();
    
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
    
    function getDocGroupInfo_c(topId){
        return function(callBack){
            requestServer("GET","/webapp/controllers/IssueDocAction.php/GetDocGroupInfo/"+topId+'/'+issueId+'/',null,function(res){
                callBack(res);
            });
        };
    }
    
    function setTitleNum(titleView,count,titleText){
        var countText = count > 0 ? count+"项" : "空";
        titleView.setAttribute("data-count",count);
        titleView.innerHTML = titleText+"<span>"+countText+"</span>";
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
    
    function catalogue_v(){
        var pathHeadView = catalogueView.querySelector(".path-head-view");
        var pathTitle = catalogueView.querySelector(".catalogue-title");
        var pathListView = catalogueView.querySelector(".path-list-view");
        var pathListUl = pathListView.querySelector("ul");
        var folderListHtml = "";
        var groupViewFlag = false;
        var docViewFlag = false;
        var catalogue_m = itemModel(function(id,name,countSub){
            var countHtml = countSub > 0 ? "<span>"+countSub+"</span>项" : "<span>空</span>";
            return !groupViewFlag ? fieldInfo.newPathHtml(id,name,countHtml) : fieldInfo.newSubHtml(id,name,countHtml);
        });
        var insertNewItem = function(itemHtml,bottomFlag){
            pathListUl.innerHTML = pathListUl.innerHTML+itemHtml;
            if(bottomFlag && pathListView.offsetHeight !== pathListView.scrollHeight){
                pathListView.scrollTop = pathListView.scrollHeight-pathListView.offsetHeight;
            }
        };
        var setCatalogueFolderNum = function(count){
            setTitleNum(pathTitle,count,fieldInfo.pathTitle);
        };
        var initListData = setViewListData(catalogue_m,function(listHtml){
            insertNewItem(listHtml,false);
        });
        var getItemNodeByEvent = function(e){
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
            return thisNode;
        };
        var loadGroupList = function(folderId){
            getDocGroupInfo_c(folderId)(function(res){
                if(res){
                    var data = JSON.parse(res);
                    if(data.hasOwnProperty("subClsList")){
                        initListData(data["subClsList"]);
                    }
                }
            });
        };
        var cancelFolderFun = function(tipDiv,folderId){
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
                    if(docViewFlag){
                        var catalogueTip = pathHeadView.querySelector(".catalogue-tip");
                        pathBackCall();
                        catalogueTip.removeChild(catalogueTip.lastChild);
                        removeClass(catalogueTip.lastChild,"hide");
                        docViewFlag = false;
                    }else{
                        cancelFolderFun(tipDiv,folderId);
                    }
                    
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
            if(!groupViewFlag){
                enterPathFun(getItemNodeByEvent(e));
            }
        };
        var pathListUl_i = function(e){
            var thisItem = null;
            var clickFun = function(){
                thisItem = getItemNodeByEvent(e);
                if(thisItem !== null && groupViewFlag && typeof viewCallBack === "function"){
                    var catalogueTip = pathHeadView.querySelector(".catalogue-tip");
                    var classId = catalogue_m("get")(thisItem,"id");
                    var countDoc = catalogue_m("get")(thisItem,"count");
                    countDoc = countDoc === "空" ? 0 : parseInt(countDoc.replace(/[^0-9]/ig,""));
                    docViewFlag = true;
                    addClass(catalogueTip.lastChild,"hide");
                    catalogueTip.innerHTML = catalogueTip.innerHTML+"<span class=\"group-tip\" data-id=\""+classId+"\"><i class=\"icon\">&#xf0c5;</i><span>"+catalogue_m("get")(thisItem,"name")+"</span></span>";
                    viewCallBack(classId,countDoc);
                }
            };
            if(checkSmallWin()){
                clickFun();
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
                }
            },"cleanView" : function(){
                if(groupViewFlag){
                    var catalogueTip = pathHeadView.querySelector(".catalogue-tip");
                    var topId = catalogueTip.getAttribute("data-id");
                    cancelFolderFun(catalogueTip,topId);
                }
                pathListUl.innerHTML = "";
            },"event" : function(){
                pathListUl.addEventListener("click",pathListUl_i);
                pathListUl.addEventListener("dblclick",enterPath_i,false);
                pathListUl.addEventListener("touchend",enterPath_i,false);
            },"removeEvent" : function(){
                pathListUl.removeEventListener("click",pathListUl_i);
                pathListUl.removeEventListener("dblclick",enterPath_i,false);
                pathListUl.removeEventListener("touchend",enterPath_i,false);
            }
        };
    }
    var catalogueView = catalogue_v();
    catalogueView.setView(pageData);
    catalogueView.event();
}
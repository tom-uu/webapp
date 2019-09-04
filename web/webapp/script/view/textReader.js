function TextReader_V(controller,issueContent,viewFrag,docId,allowEdit,orderReadContext){//每创造一个局部域就避免了来自上层的复杂度和变量冲突，提高了可扩展性和自由度；2019.4.27.16:17
    var contextKey = viewDisplay(true);
    var thisViewNode = document.getElementById("textReaderView");
    var view = View({"node":thisViewNode});
    var textEditorView = view.init();
    var readerDiv = textEditorView.querySelector(".text-reader");
    var readerTag = thisViewNode.querySelector(".section_content_tag");
    var tabMoreTrigger = controller.getGContext("tabView").getTrait("moreTrigger");
    var tabMoreBtnsView = controller.getGContext("tabView").getTrait("moreBtnsView");
    var revId = "";
    var thisDocId = docId;
    var docAttachmentsJson = null;
    var contentShift = controller.getGContext("sectionTouchMove").getTrait("contentShift");
    var emptyIndexText = readerTag.innerText;
    var textEditedFlag = false;
    
    function viewDisplay(flag){
        var viewKey = "textReader";
        var textReaderFrag = viewFrag[viewKey];
        if(flag && textReaderFrag.childElementCount > 0){
            issueContent.appendChild(textReaderFrag);
        }else if(!flag){
            var subContentNodes = issueContent.children;
            while(subContentNodes.length > 0){
                textReaderFrag.appendChild(subContentNodes[0]);
            }
        }
        return viewKey;
    }

    function LoadDocData_C(docId){
        return function(callBack){
            requestServer("GET",getDocDbName()+docId,null,function(res){
                callBack(res);
            });
        };
    }

    function Reader_I(){
        var toMathML = function(jax,callback) {
            var mml;
            try {
                mml = jax.root.toMathML("");
            } catch(err) {
                if (!err.restart) {
                    throw err;
                }
                return MathJax.Callback.After([toMathML,jax,callback],err.restart);
            }
            MathJax.Callback(callback)(mml);
        };
        var setFileNodeSrc = function(html){
            if(typeof docAttachmentsJson === "object"){
                var tmpDiv = document.createElement("div");
                tmpDiv.innerHTML = html;
                var fileNodes = tmpDiv.querySelectorAll(".att-file");
                fetchArr(fileNodes,function(i){
                    var thisNode = fileNodes[i];
                    thisNode.src = getDocDbName()+thisDocId+'/'+thisNode.getAttribute("data-fn");
                });
                return tmpDiv.innerHTML;
            }else{
                return false;
            }
        };
        var loadViewHtml = function(data){
            var texts=data.texts,doms=data.doms,len=doms.length,html='';
            for(var i=0;i<len-1;i++){
                html += doms[i]+texts[i];
            }
            html += doms[len-1];
            var res = setFileNodeSrc(html);
            readerDiv.innerHTML = res !== false ? res : html;
        };
        var setCatalogue = function(){
            var h2_objs = readerDiv.querySelectorAll("h2");
            var h3_objs = readerDiv.querySelectorAll("h3");
            var n = 0;
            var cataListHtml = "<ul>";
            var innerListHtml = "";
            for(var i=0,t_len=h2_objs.length;i<t_len;i++){
                var thisH2 = h2_objs[i];
                thisH2.id = "cata_h2_"+i;
                var h2_index = getElementIndex(thisH2);
                var next_h2_index = h2_index;
                if(i<t_len-1){
                    next_h2_index = getElementIndex(h2_objs[i+1]);
                }
                innerListHtml += "<li><a data-target=\"#"+thisH2.id+"\">"+thisH2.innerText+"</a><ul>";
                for(var j=n,s_len=h3_objs.length;j<s_len;j++){
                    var thisH3 = h3_objs[j];
                    var h3_index = getElementIndex(thisH3);
                    if(h3_index > h2_index && h3_index < next_h2_index || next_h2_index === h2_index){
                        thisH3.id = "cata_h3_"+j;
                        innerListHtml += "<li><a data-target=\"#"+thisH3.id+"\">"+thisH3.innerText+"</a></li>";
                        n++;
                    }
                }
                innerListHtml += "</ul></li>";
            };
            cataListHtml += innerListHtml === "" ? emptyIndexText : innerListHtml;
            cataListHtml += "</ul>";
            readerTag.innerHTML = cataListHtml;
        };
        var docDownLoad = function(fileName,text){
            var linkNode = document.createElement('a');
            linkNode.download = fileName+".docx";
            linkNode.style.display = 'none';
            var blob = new Blob([text],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8"});
            linkNode.href = window.URL.createObjectURL(blob);
            document.body.appendChild(linkNode);
            linkNode.click();
            document.body.removeChild(linkNode);
        };
        var exportDocEvent = function(){
            var name = prompt("文件名:");
            var text = readerDiv.innerText;
            name !== null && trim(name).length > 0 ? docDownLoad(name,text) : docDownLoad(rmSpecialStr(text.substring(0,10)),text);
        };
        var editDocEvent = function(){
            viewDisplay(false);
            var key = "textEditor";
            var textViewFrag = viewFrag["textEditor"];
            var callEditorView = function(docId){
                var docData = {"docId":docId,"revId":revId,"html":readerDiv.innerHTML};
                if(docAttachmentsJson !== null){
                    docData._attachments = docAttachmentsJson;
                }
                TextEditor_V(controller,issueContent,viewFrag,null,docData);
                controller.getGContext("tabView").getTrait("setView")(key);
            };
            if(textViewFrag.childElementCount === 0){
                addCss("/webapp/css/"+key+".css");
                LoadCompView_C(key)(function(res){
                    var fileData = JSON.parse(res);
                    loadView(key,issueContent,fileData["html"],function(){
                        callEditorView(thisDocId);
                    });
                });
            }else if(checkViewScript(key)){
                callEditorView(thisDocId);
            }
        };
        var cataClickEvent = function(e){
            if(e.target.nodeName === "A"){
                var targetId = e.target.getAttribute("data-target");
                var thisTarget = readerDiv.querySelector(targetId);
                contentShift(1,0);
                window.scrollTo(0,thisTarget.offsetTop+35);
            }
        };
        var loadDocData = function(endLoadingCallBack){
            LoadDocData_C(thisDocId)(function(res){
                var data = JSON.parse(res);
                if(data.hasOwnProperty("_id")){
                    revId = data._rev;
                    if(data.hasOwnProperty("_attachments")){
                        docAttachmentsJson = data._attachments;
                    }
                    loadViewHtml(data);
                    if(data.hasOwnProperty("mathFlag")){
                        typeof MathJax === "undefined" ? loadScriptBySrc("https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-AMS_CHTML-full",function(){
                            MathJax.Hub.Queue(endLoadingCallBack);
                        }) : MathJax.Hub.Queue(["Typeset",MathJax.Hub,readerDiv,endLoadingCallBack]);
                    }else{
                        endLoadingCallBack();
                    }
                    setCatalogue();
                }else if(data.hasOwnProperty("error")){
                    alert("未找到文档");
                }
            });
        };
        var tabMoreBtnsViewDisplay = function(flag){
            flag ? removeClass(tabMoreBtnsView,"hide") : addClass(tabMoreBtnsView,"hide");
        };
        var tabMore_i = function(){
            hasClass(tabMoreBtnsView,"hide") ? tabMoreBtnsViewDisplay(true) : tabMoreBtnsViewDisplay(false);
        };
        var tabMoreBtnsView_i = function(e){
            var target = e.target;
            var nodeName = target.nodeName;
            var thisBtn = null;
            if(nodeName === "I" || nodeName === "SPAN"){
                thisBtn = target.parentNode;
            }else if(nodeName === "A"){
                thisBtn = target;
            }
            if(thisBtn !== null){
                thisBtn.className === "edit-trigger" ? editDocEvent() : exportDocEvent();
                addClass(tabMoreBtnsView,"hide");
            }
        };
        var bodyClick_i = function(){
            tabMoreBtnsViewDisplay(false);
        };
        return {
            "cleanView" : function(){
                thisDocId = readerDiv.innerHTML = "";
                readerTag.innerText = emptyIndexText;
                addClass(thisViewNode,"hide");
                addClass(tabMoreBtnsView,"hide");
            },"setView" : function(){
                var rmLoading = bodyLoading();
                loadDocData(function(){
                    rmLoading();
                    removeClass(thisViewNode,"hide");
                });
            },"event" : function(){
                if(allowEdit){
                    tabMoreTrigger.addEventListener("click",tabMore_i);
                    tabMoreBtnsView.addEventListener("click",tabMoreBtnsView_i);
                    thisViewNode.addEventListener("click",bodyClick_i);
                }
                readerTag.addEventListener("click",cataClickEvent);
            },"removeEvent" : function(){
                if(allowEdit){
                    tabMoreTrigger.removeEventListener("click",tabMore_i);
                    tabMoreBtnsView.removeEventListener("click",tabMoreBtnsView_i);
                    thisViewNode.removeEventListener("click",bodyClick_i);
                }
                readerTag.removeEventListener("click",cataClickEvent);
            }
        };
    }

    function orderRead_v(textReader_v){
        var startNum = 0;
        var countDoc = 0;
        var nowNum = 0;
        var getOrderId = null;
        var orderName = "";
        var leftBtn = null;
        var rightBtn = null;
        var numInput = null;
        var tipFun = function(){
            nowNum = startNum+1;
            var numTip = "第"+nowNum+"篇";
            if(nowNum === countDoc){
                numTip = "末篇";
            }else if(nowNum === 1){
                numTip = "首篇";
            }
            tipView(true,orderName+" : "+numTip+" [共"+countDoc+"篇].");
        };
        var loadDocData = function(targetNum){
            if(getOrderId !== null){
                if(targetNum > -1 && targetNum < countDoc){
                    getOrderId(targetNum,function(docId){
                        textReader_v.cleanView();
                        thisDocId = docId;
                        textReader_v.setView();
                        startNum = targetNum;
                        tipFun();
                    });
                    contentShift(1,0);
                }else{
                    tipFun();
                }
            }
        };
        var leftBtnEvent = function(){
            loadDocData(startNum-1);
        };
        var rightBtnEvent = function(){
            loadDocData(startNum+1);
        };
        var numInputEvent = function(){
            var numStr = prompt("[第"+nowNum+"篇][共"+countDoc+"篇] 翻页到(页码):");
            if(numStr !== null){
                var num = parseInt(numStr);
                if(num > countDoc){
                    num = countDoc-1;
                }else if(num < 1){
                    num = 0;
                }else{
                    num = num-1;
                }
                loadDocData(num);
            }
        };
        var initOrderReadView = function(){
            if(orderReadContext){
                var frag = document.createDocumentFragment();
                var leftBtn = document.createElement("div");
                var rightBtn = leftBtn.cloneNode();
                var numInput = leftBtn.cloneNode();
                leftBtn.innerHTML = "<a class=\"icon-btn\"><span class=\"icon-chevron-left-l\"></span></a>";
                rightBtn.innerHTML = "<a class=\"icon-btn\"><span class=\"icon-chevron-right-l\"></span></a>";
                addClass(leftBtn,"change-page left");
                addClass(rightBtn,"change-page right");
                addClass(numInput,"change-page num-input");
                frag.appendChild(leftBtn);
                frag.appendChild(rightBtn);
                frag.appendChild(numInput);
                startNum = orderReadContext.startNum;
                nowNum = startNum+1;
                countDoc = orderReadContext.countDoc;
                orderName = orderReadContext.orderName;
                getOrderId = orderReadContext.getOrderId;
                thisViewNode.appendChild(frag);    
            }
        };
        return {
            "setView" : function(){
                initOrderReadView();
            },"cleanView" : function(){
                var changePageComps = thisViewNode.querySelectorAll(".change-page");
                fetchArr(changePageComps,function(i){
                    thisViewNode.removeChild(changePageComps[i]);
                });
            },"event" : function(){
                leftBtn = thisViewNode.querySelector(".left");
                rightBtn = thisViewNode.querySelector(".right");
                numInput = thisViewNode.querySelector(".num-input");
                if(leftBtn !== null && rightBtn !== null && numInput !== null){
                    leftBtn.addEventListener("click",leftBtnEvent);
                    rightBtn.addEventListener("click",rightBtnEvent);
                    numInput.addEventListener("click",numInputEvent);
                }
            },"removeEvent" : function(){
                if(leftBtn !== null && rightBtn !== null){
                    leftBtn.removeEventListener("click",leftBtnEvent);
                    rightBtn.removeEventListener("click",rightBtnEvent);
                    numInput.removeEventListener("click",numInputEvent);
                }
            }
        };
    }

    function setController(callBack){
        var thisContext = Context(contextKey);
        thisContext.setTrait("viewDisplay",viewDisplay);
        thisContext.setTrait("reset",{
            "textEditor":function(info){
                if(info.hasOwnProperty("html")){
                    readerDiv.innerHTML = info.html;
                    textEditedFlag = true;
                }
            }
        });
        thisContext.setTrait("pageBack",function(){
            callBack(thisContext);
        });
        controller.pushContext(thisContext);
    }

    function scrollFun(){
        var tagScrollEvent = null;
        return {
            "addEvent":function(){
                if(window.checkPlatform === "pc"){
                    tagScrollEvent = tagScroll(readerTag,"tag-scroll");
                    tagScrollEvent.addEvent();
                }
            },"removeEvent":function(){
                if(tagScrollEvent !== null){
                    tagScrollEvent.removeEvent();
                }
            }
        };
    }

    function setTabEditStyle(){
        if(allowEdit){
            removeClass(tabMoreTrigger,"hide");
        }
    }

    var textReader = Reader_I();
    var viewScroll = scrollFun();
    var orderRead = orderRead_v(textReader);
    textReader.setView();
    orderRead.setView();
    textReader.event();
    orderRead.event();
    viewScroll.addEvent();
    setController(function(thisContext){
        var nextKey = controller.topContext().getKey();
        if((nextKey === "docList" || nextKey === "issueList") && textEditedFlag){
            thisContext.popInfo.resetFlag  = true;
        }
        textReader.cleanView();
        textReader.removeEvent();
        orderRead.removeEvent();
        orderRead.cleanView();
        viewScroll.removeEvent();
        textReader = null;
        orderRead = null;
    });
    setTabEditStyle();
}
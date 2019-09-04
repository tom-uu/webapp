function TextEditor_V(controller,container,viewFrag,fieldId,docData){
    var contextKey = viewDisplay(true);
    var thisDocId = docData && docData.docId && docData.docId.length > 0 ? docData.docId : "";
    var outerContainer = container.parentNode;
    var thisViewNode = document.getElementById("textEditorView");
    var toolBox = thisViewNode.querySelector(".editor-tool-box");
    var editorBarUl = toolBox.querySelector(".edit-bar");
    var textEditor = thisViewNode.querySelector("#text-editor");
    var innerContainer = thisViewNode.children[0];
    var setFontBox = thisViewNode.querySelector(".font-box");
    var setColorBox = thisViewNode.querySelector(".color-box");
    var setHeaderBox = thisViewNode.querySelector(".header-box");
    var setLinkBox = thisViewNode.querySelector(".link-box");
    var insertImageBox = thisViewNode.querySelector(".image-box");
    var insertTextBox = thisViewNode.querySelector(".text-box");
    var insertAudioBox = thisViewNode.querySelector(".audio-box");
    var fontSetSubmit = thisViewNode.querySelector("#submitFontSetting");
    var fontSizeSelector = setFontBox.querySelector(".font-size-selector");
    var fontFaceSelector = setFontBox.querySelector(".font-face-selector");
    var setFontBtn = editorBarUl.querySelector('li[data-k="setFont"]');
    var setTextColorBtn = editorBarUl.querySelector('li[data-k="setTextColour"]');
    var setHColorBtn = editorBarUl.querySelector('li[data-k="setHighlightColour"]');
    var setHeaderBtn = editorBarUl.querySelector('li[data-k="makeHeader"]');
    var setLinkBtn = editorBarUl.querySelector('li[data-k="makeLink"]');
    var insertImageBtn = editorBarUl.querySelector('li[data-k="insertImage"]');
    var insertTextBtn = editorBarUl.querySelector('li[data-k="setHTML"]');
    var insertAudioBtn = editorBarUl.querySelector('li[data-k="insertAudio"]');
    var urlSubmit = setLinkBox.querySelector("#submitUrl");
    var imageSubmit = insertImageBox.querySelector("#submitImage");
    var textSubmit = insertTextBox.querySelector("#submitText");
    var audioSubmit = insertAudioBox.querySelector("#submitAudio");
    var fieldName = controller.field;
    var contentSubmit = controller.getGContext("tabView").getTrait("submitTrigger");
    var textEditedFlag = false;
    var textAddFlag = false;
    var newDocFlag = false;
    var createNewP = function(){
        var newp = document.createElement("p");
        addClass(newp,"paragraph");
        return newp;
    };
    var recoverToP = function(node){
        var nodeName = node.nodeName;
        if(!node.hasOwnProperty("id") && nodeName.search("H") !== -1){
            var newParagraph = createNewP();
            newParagraph.innerHTML = node.innerHTML;
            node.parentNode.replaceChild(newParagraph,node);
        }
    };
    var getTriggerKey = {
        "bold":function(editor){
            return editor.hasFormat('B') ? "removeBold" : "bold";
        },"italic":function(editor){
            return editor.hasFormat('I') ? "removeItalic" : "italic";
        },"underline":function(editor){
            return editor.hasFormat('U') ? "removeUnderline" : "underline";
        },"makeUnorderedList":function(editor){
            return editor.hasFormat('LI') ? "removeList" : "makeUnorderedList";
        },"makeOrderedList":function(editor){
            return editor.hasFormat('OL') ? "removeList" : "makeOrderedList";
        },"increaseListLevel":function(editor){
            return editor.hasFormat('LI') ? "increaseListLevel" : false;
        },"decreaseListLevel":function(editor){
            return editor.hasFormat('LI') ? "decreaseListLevel" : false;
        },"increaseQuoteLevel":function(editor){
            return editor.hasFormat('BLOCKQUOTE') ? "decreaseQuoteLevel" : "increaseQuoteLevel";
        },"setTextAlignment-left":function(){
            return {"key":"setTextAlignment","value":"left"};
        },"setTextAlignment-right":function(){
            return {"key":"setTextAlignment","value":"right"};
        },"setTextAlignment-center":function(){
            return {"key":"setTextAlignment","value":"center"};
        },"setTextAlignment-justify":function(){
            return {"key":"setTextAlignment","value":"justify"};
        },"code":function(){
            return "toggleCode";
        },"mathjax":function(editor){
            var thisNode = editor.getSelection().startContainer;
            var mathNode = null;
            var nodeName = thisNode.nodeName;
            if(nodeName === "P"){
                if(thisNode.nodeValue !== null){
                    mathNode = thisNode;
                }else{
                    editor["toggleCode"]();
                    var pre = editor.getSelection().startContainer;
                    pre.id = "mathCode";
                    var p = createNewP();
                    p.innerHTML = "<br/>";
                    pre.parentNode.insertBefore(p,pre.nextSibling);
                }
            }else if(nodeName === "#text" && thisNode.parentNode.nodeName === "P"){
                mathNode = thisNode.parentNode;
            }
            if(mathNode !== null){
                MathJax.Hub.Queue(["Typeset",MathJax.Hub,mathNode]);
            }
        },"makeLink":function(editor){
            return editor.hasFormat('A') ? "removeLink" : false;
        },"removeAllFormatting":function(editor){
            var thisNode = editor.getSelection().startContainer;
            var mjxNode = null;
            var nodeName = thisNode.nodeName;
            if(nodeName === "#text"){
                var thisParentNode = thisNode.parentNode;
                if(thisParentNode.className.search("mjx-") !== -1){
                    mjxNode = thisNode.parentNode;
                }else if(thisParentNode.nodeName === "PRE" && thisParentNode.id === "mathCode"){
                    thisParentNode.parentNode.removeChild(thisParentNode);
                }else{
                    recoverToP(thisParentNode);
                }

            }else if(thisNode.className.search("mjx-") !== -1 || nodeName === "SCRIPT"){
                mjxNode = thisNode;
            }else if((nodeName === "PRE" && thisNode.id === "mathCode") || (checkP(thisNode) && thisNode.querySelector(".MathJax_Preview") !== null)){
                thisNode.parentNode.removeChild(thisNode);
            }else{
                recoverToP(thisNode);
            }
            if(mjxNode !== null){
                var mathNode = findAncestors(mjxNode,function(thisNode){
                    return thisNode.nodeName !== "P" ? true : false;
                });
                if(hasClass(mathNode,"paragraph")){
                    mathNode.parentNode.removeChild(mathNode);
                }
            }
            editor["removeAllFormatting"]();
        },"undo":function(){
            return "undo";
        },"redo":function(){
            return "redo";
        }
    };

    var getPromptFun = {
        "setFont":function(){
            setSubBoxPosi(setFontBtn,setFontBox);
            toggleClass(setFontBox,"hide");
        },"setTextColour":function(){
            setSubBoxPosi(setTextColorBtn,setColorBox);
            colorBoxDisplay("setTextColour");
        },"setHighlightColour":function(){
            setSubBoxPosi(setHColorBtn,setColorBox);
            colorBoxDisplay("setHighlightColour");
        },"makeHeader":function(){
            setSubBoxPosi(setHeaderBtn,setHeaderBox);
            toggleClass(setHeaderBox,"hide");
        },"makeLink":function(){
            setSubBoxPosi(setLinkBtn,setLinkBox);
            toggleClass(setLinkBox,"hide");
        },"insertImage":function(){
            toggleClass(insertImageBox,"hide");
            setSubBoxPosi(insertImageBtn,insertImageBox);
        },"setHTML":function(){
            toggleClass(insertTextBox,"hide");
            setSubBoxPosi(insertTextBtn,insertTextBox);
        },"insertAudio":function(){
            toggleClass(insertAudioBox,"hide");
            setSubBoxPosi(insertAudioBtn,insertAudioBox);
        }
    };
    
    function getFileTypeName(fileType){
        var index = fileType.lastIndexOf("/");
        return fileType.substring(index+1,fileType.length);
    }
    
    function viewDisplay(flag){
        var viewKey = "textEditor";
        var textEditorFrag = viewFrag[viewKey];
        if(flag && textEditorFrag.childElementCount > 0){
            container.appendChild(textEditorFrag);
        }else if(!flag){
            var subContentNodes = container.children;
            while(subContentNodes.length > 0){
                textEditorFrag.appendChild(subContentNodes[0]);
            }
        }
        return viewKey;
    }

    function hidePromptBox(thisPromptBox){
        var promptBoxes = innerContainer.querySelectorAll(".prompt-box");
        fetchArr(promptBoxes,function(i){
            var thisBox = promptBoxes[i];
            if(thisBox !== thisPromptBox){
                addClass(thisBox,"hide");
            }
        });
    }

    function setSubBoxPosi(btn,box){
        hidePromptBox(box);
        box.removeAttribute("style");
        checkSmallWin()? box.style.bottom = "45px" : box.style.top = btn.offsetTop+3+btn.offsetHeight+8+'px';
        var refLeft = btn.offsetLeft-editorBarUl.scrollLeft+5;
        var barWidth = editorBarUl.offsetWidth;
        var boxWidth = box.offsetWidth;
        if(barWidth < refLeft+boxWidth){
            var refLeft = refLeft-boxWidth+35;
            box.style.left = refLeft < 0 ? 0 : refLeft+"px";
        }else{
            box.style.left = refLeft+"px";
        }
    }

    function colorBoxDisplay(funKey){
        if(hasClass(setColorBox,"hide")){
            removeClass(setColorBox,"hide");
        }else if(setColorBox.getAttribute("data-k") === funKey){
            addClass(setColorBox,"hide");
        }
        setColorBox.setAttribute("data-k",funKey);
    }

    function promptFun(btnNode){
        var funKey = btnNode.getAttribute("data-k");
        if(getPromptFun.hasOwnProperty(funKey)){
            getPromptFun[funKey]();
            return true;
        }else if(hasClass(btnNode,"prompt")){
            return function(){
               return prompt("Value:");
            };
        }else{
            return false;
        }
    }

    function editorFun(editorObj,funKey,callBack){
        var callFlag = typeof callBack === "function" ? true : false;
        if(getTriggerKey.hasOwnProperty(funKey)){
            var key = "",value = "",keyRes = getTriggerKey[funKey](editorObj);
            if(typeof keyRes === 'object'){
                key = keyRes.key;
                value = keyRes.value;
            }else{
                key = keyRes;
            }
            if(typeof key === "string"){
                if(key.search("remove") === -1 && key.search("decrease") === -1 && value.length === 0 && callFlag){
                    value = callBack();
                }
                editorObj[key](value);
            }else if(typeof key === "function"){
               key();
            }
        }else{
            if(callFlag){
                value = callBack();
                editorObj[funKey](value);
            }
        }
    }

    function checkP(node){
        return node !== null && node.nodeName === "P" && node.className === "paragraph" ? true : false;
    }

    function checkMathP(node){
        if(checkP(node)){
            var subScript = node.querySelector("script");
            return checkP(node) && subScript !== null && subScript.id.search("MathJax") !== -1 ? true : false;
        }else{
            return false;
        }
    }

    function cursorToNextP(node){
        var nextP = node.nextSibling;
        if(!checkP(nextP)){
            var parent = node.parentNode;
            var newP = document.createElement("p");
            addClass(newP,"paragraph");
            newP.innerHTML = "<br>";
            nextP = nextP ===  null ? parent.appendChild(newP) : parent.insertBefore(newP,nextP.nextSibling);
        }
        placeCaretAtEnd(nextP);
    }

    function placeCaretAtEnd(el){
        if(typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined"){ 
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }else if(typeof document.body.createTextRange !== "undefined"){ 
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        } 
    }

    function textEditorScrollFun(cursorScrollFun){
        if(checkSmallWin()){
            textEditor.removeAttribute("style");
            cursorScrollFun(true);
        }else{
            var bodyClientHeight = document.body.clientHeight;
            var editorHeight = textEditor.offsetHeight;
            if(bodyClientHeight-outerContainer.offsetTop-outerContainer.offsetHeight < 5){
                textEditor.style.maxHeight = editorHeight-document.body.scrollHeight+bodyClientHeight+"px";
                addClass(textEditor,"scroll");
            }else if(textEditor.scrollHeight > editorHeight){
                removeClass(textEditor,"scroll");
                textEditor.removeAttribute("style");
            }
            cursorScrollFun(false);
        }
    }

    function isURL(url) {
        var re1 = /(\w+):\/\/([^\:|\/]+)(\:\d*)?(.*\/)([^#|\?|\n]+)?(#.*)?(\?.*)?/i;
        var arr = url.match(re1);
        if (arr) {
            var domain = arr[2];
            var re2 = /^(.+\.)(com|edu|gov|int|mil|net|org|biz|info|name|museum|coop|aero|[a-z][a-z])$/;
            if (!re2.test(domain)) {
                return false;
            }
            else {
                return true;
            }
        } else {
            return false;
        }
    }

    function getKSizeStr(k_size){
        return k_size > 1024 ? (k_size/1024).toFixed(1)+"MB" : k_size.toFixed(1)+"KB";
    }

    function clearFileBox(box){
        var input = box.querySelector('input[type="file"]');
        var select = box.querySelector("select");
        var radio = box.querySelector('input[type="radio"]');
        if(select !== null){
            addClass(select.parentNode,"hide");
        }
        if(radio !== null){
            addClass(radio.parentNode,"hide");
        }
        input.value = "";
        box.children[2].innerText = "未选择文件";
    }
    
    function updateDocData_c(data,id){
        data._rev = docData.revId;
        if(docData.hasOwnProperty("_attachments")){
            data._attachments = docData._attachments;
        }
        return function(callBack){
            requestServer("PUT",getDocDbName()+id,JSON.stringify(data),function(res){
                callBack(res);
            },"application/json");
        };
    }
    
    function addDocData_c(data){
        return function(callBack){
            requestServer("POST",getDocDbName(),JSON.stringify(data),function(res){
                callBack(res);
            },"application/json");
        };
    }
    
    function getAttInfo_c(docId){
        return function(callBack){
            requestServer("GET",getDocDbName()+"_design/showList/_show/attachInfo/"+docId,null,function(res){
                callBack(res);
            });
        };
    }
    
    function addAttData_c(docInfo,attName,file,fileType){
        return function(callBack){
            requestServer("PUT",getDocDbName()+docInfo.id+'/'+attName+"?rev="+docInfo.rev,file,function(res){
                callBack(res);
            },fileType);
        };
    }
    
    function rmAttData_c(docInfo,attName){
        return function(callBack){
            requestServer("DELETE",getDocDbName()+docInfo.id+'/'+attName+"?rev="+docInfo.rev,null,function(res){
                callBack(res);
            });
        };
    }
    
    function addFieldDocInfo_c(fieldId,docId){
        return function(callBack){
            requestServer("POST","/webapp/controllers/"+fieldName+"DocAction.php/AddDocInfoByData/"+fieldId+'/',JSON.stringify({"docId":docId}),function(res){
                callBack(res);
            });
        };
    }
    
    function addDocInfo_c(docData){
        return function(callBack){
            requestServer("POST","/webapp/controllers/DocAction.php/AddDoc/",JSON.stringify(docData),function(res){
                callBack(res);
            });
        };
    }
    
    function updateEditTime_c($docId){
        return function(callBack){
            requestServer("GET","/webapp/controllers/DocAction.php/UpdateEditTime/"+$docId+'/',null,function(res){
                callBack(res);
            });
        };
    }
    
    function recoverMathText(node){
        var scripts = node.querySelectorAll('script[id*="MathJax-Element"]');
        var setTextP = function(textP,frag){
            textP.innerHTML = textP.innerHTML+"<br>";
            frag.appendChild(textP);
            textP = null;
        };
        var setTexCmdP = function(paraNode,texCmd){
            paraNode.innerText = texCmd;
            paraNode.appendChild(document.createElement("br"));
        };
        fetchArr(scripts,function(i){
            var script = scripts[i];
            var paraNode = script.parentNode;
            var texCmd = "$$"+script.innerText+"$$";
            if(paraNode.querySelectorAll("p").length > 0 || paraNode.firstChild.nodeType === 3){
                var subNodes = paraNode.childNodes;
                var frag = document.createDocumentFragment();
                var textP = null;
                fetchArr(subNodes,function(j){
                    var subNode = subNodes[j],subNodeType = subNode.nodeType; 
                    if(subNodeType === 3){
                        if(textP === null){
                            textP = createNewP();
                        }
                        textP.appendChild(subNode.cloneNode(true));
                    }
                    if(subNodeType === 1){
                        if(subNode === script){
                            var newP = createNewP();
                            setTexCmdP(newP,texCmd);
                            frag.appendChild(newP);
                        }else if((!hasClass(subNode,"MathJax_Preview") || !hasClass(subNode,"mjx-chtml")) && (subNode.querySelector(".MathJax_Preview") === null && subNode.querySelector(".mjx-chtml") === null)){
                            if(subNode.nodeName === "P"){
                                if(textP !== null){
                                    setTextP(textP,frag);
                                }
                                frag.appendChild(subNode.cloneNode(true));
                            }else if(subNode.nodeName !== "BR"){
                                textP === null ? textP = createNewP() : setTextP(textP,frag);
                                textP.appendChild(subNode.cloneNode(true));
                                frag.appendChild(textP);
                            }
                        }
                    }
                });
                paraNode.parentNode.replaceChild(frag,paraNode);
            }else{
                setTexCmdP(paraNode,texCmd);
            }
        });
        return scripts.length > 0 ? true : false;
    }
    
    function convertBase64UrlToBlob(urlData,typeJson){  
        var bytes=window.atob(urlData.split(',')[1]);//去掉url的头，并转换为byte  
        //处理异常,将ascii码小于0的转换为大于0  
        var ab = new ArrayBuffer(bytes.length);  
        var ia = new Uint8Array(ab);  
        for (var i = 0; i < bytes.length; i++) {  
            ia[i] = bytes.charCodeAt(i);  
        }
        return new Blob([ab],typeJson);  
    } 
        
    function Editor_I(){
        var view = View({"node":thisViewNode});
        var textEditorView = view.init();
        var textEditorBar = textEditorView.querySelector(".edit-bar");
        var textfrag = document.createDocumentFragment();
        var addAttTask = new Array();
        var rmAttTask = new Array();
        var editorDiv = textEditorView.querySelector(".text-editor");
        var editor = new Squire(editorDiv,{
            blockTag: 'p',
            blockAttributes: {'class':'paragraph'},
            tagAttributes: {
                ul: {'class':'UL'},
                ol: {'class':'OL'},
                li: {'class':'listItem'},
                a: {'target':'_blank'},
                pre: {
                    style:'border-radius:3px;border:1px solid #ccc;padding:7px 10px;background:#f6f6f6;font-family:menlo,consolas,monospace;font-size:90%;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;'
                },
                code: {
                    style:'border-radius:3px;border:1px solid #ccc;padding:1px 3px;background:#f6f6f6;font-family:menlo,consolas,monospace;font-size:90%;'
                }
            }
        });
        var getAttFileName = function(){
            var addTaskLen = addAttTask.length;
            var lastNum = -1;
            if(docData && docData.hasOwnProperty("_attachments") && addTaskLen === 0){
                var attInfo = docData._attachments;
                for(var attName in attInfo){
                    var thisNum = parseInt(attName.replace(/[^0-9]/ig,""));
                    if(thisNum>lastNum){
                        lastNum = thisNum;
                    }
                }
            }else{
                for(var i=0;i<addTaskLen;i++){
                    var attName = addAttTask[i].name;
                    var thisNum = parseInt(attName.replace(/[^0-9]/ig,""));
                    if(i<addTaskLen-1 && thisNum-lastNum > 1){
                        return "file_"+(lastNum+1);
                    }
                    lastNum = thisNum;
                }
            }
            return "file_"+(lastNum+1);
        };
        var editorBarEvent = function(e){
            if(e.target.nodeName === "LI" || e.target.nodeName === 'I'){
                var thisNode = e.target.nodeName === "LI" ? e.target : e.target.parentNode;
                if(thisNode !== null){
                    var key = thisNode.getAttribute("data-k");
                    if(key && editor){
                        var promptCallBack = promptFun(thisNode);
                        editorFun(editor,key,promptCallBack);
                    }
                }
            }
        };
        var fontSetSubmitEvent = function(){
            var sizeIndex = fontSizeSelector.selectedIndex;
            var faceIndex = fontFaceSelector.selectedIndex;
            editor["setFontSize"](fontSizeSelector[sizeIndex].value);
            editor["setFontFace"](fontFaceSelector[faceIndex].value);
            addClass(setFontBox,"hide");
        };
        var setColorEvent = function(e){
            var thisNode = e.target;
            if(!thisNode.hasOwnProperty("id")){
                var colorValue = thisNode.getAttribute("data-v");
                var funKey = setColorBox.getAttribute("data-k");
                editor[funKey](colorValue);
                addClass(setColorBox,"hide");
            }
        };
        var setHeaderEvent = function(e){
            e.stopPropagation();
            var thisNode = e.target;
            if(!thisNode.hasOwnProperty("id")){
                var headerValue = thisNode.getAttribute("data-v");
                var node = editor.getSelection().startContainer;
                if(headerValue === "h1"){
                    editor["makeHeader"]();
                }else{
                    thisNode = null;
                    thisNode = node.nodeName === "#text" ? node.parentNode : node;
                    if(thisNode.nodeName !== "DIV"){
                        var newH = document.createElement(headerValue);
                        if(thisNode.nodeName !== "P"){
                            var targetNode = findAncestors(thisNode,function(node){
                                return node.nodeName === "P" ? false : true; 
                            });
                            if(targetNode){
                                thisNode = targetNode;
                            }
                        }
                        newH.innerText = thisNode.innerText;
                        thisNode.parentNode.replaceChild(newH,thisNode);
                    }
                }
                addClass(setHeaderBox,"hide");
            }
        };
        var textEditorClickEvent = function(e){
            hidePromptBox(null);
            var thisNode = e.target;
            if(thisNode !== textEditor && checkMathP(thisNode)){
                cursorToNextP(thisNode);
            }
        };
        var cursorScrollFun = function(isSmallWin){
            var cursorContainer = editor.getSelection().endContainer;
            if(cursorContainer !== editorDiv.firstChild && cursorContainer === editorDiv.lastChild && cursorContainer.innerText.length === 1){
                if(isSmallWin){
                    var cursorWinTop = cursorContainer.offsetTop+cursorContainer.offsetHeight+130;
                    var winScrollTop = getScrollTop();
                    var cursorLen =  cursorWinTop - winScrollTop - document.body.clientHeight;
                    if(cursorLen > 0){
                        window.scrollTo(0,winScrollTop+cursorLen+50);
                    }
                }else if(cursorContainer.offsetTop+cursorContainer.offsetHeight > textEditor.scrollTop+textEditor.offsetHeight){
                    textEditor.scrollTop = textEditor.scrollHeight;
                }
            }
        };
        var textEditorKeyFun = function(e){
            if((window.event ? e.keyCode : e.which ? e.which : -1) === 13){
                textEditorScrollFun(cursorScrollFun);
            }else if((window.event ? e.keyCode : e.which ? e.which : -1) === 8){
                var thisContainer = editor.getSelection().endContainer;
                var mathP = null;
                if(checkMathP(thisContainer)){
                    mathP = thisContainer;
                }else if(thisContainer.nodeName === "SCRIPT" && thisContainer.id.search("MathJax") !== -1){
                    mathP = thisContainer.parentNode;
                }else if(thisContainer.nodeName === "#text"){
                    var thisParentNode = thisContainer.parentNode;
                    if(thisParentNode.className.search("mjx-") !== -1){
                        var mjxNode = thisParentNode;
                        var resNode = findAncestors(mjxNode,function(thisNode){
                            return checkMathP(thisNode); 
                        });
                        if(resNode && hasClass(resNode,"paragraph")){
                            mathP = resNode;
                        }
                    }
                }
                if(mathP !== null){
                    mathP.parentNode.removeChild(mathP);
                }
            }
        };
        var submitBtnDisplay = function(flag){
            flag ? removeClass(contentSubmit,"submit") : addClass(contentSubmit,"submit");
        };
        var textChanged_i = function(){
            submitBtnDisplay(false);
        };
        var urlSetFun = function(){
            var urlInput = setLinkBox.querySelector("input");
            var thisUrl = urlInput.value;
            if(isURL(thisUrl)){
                editor["makeLink"](thisUrl);
                addClass(setLinkBox,"hide");
                textChanged_i();
            }else{
                alert("输入的地址不合法");
            }
        };
        var imageInsertFun = function(){
            var file = insertImageBox.querySelector("input").files[0];
            if(file){
                var reader = new FileReader();
                reader.onload = function () {
                    var image = new Image();
                    image.src = reader.result;
                    image.onload = function() { 
                        var canvas = document.createElement('canvas'), 
                        context = canvas.getContext('2d'), 
                        imageWidth = image.width / 2, 
                        imageHeight = image.height / 2,
                        data = '';
                        canvas.width = imageWidth;
                        canvas.height = imageHeight;
                        context.drawImage(image, 0, 0, imageWidth, imageHeight);
                        data = canvas.toDataURL('image/jpeg');
                        var imageNode = editor["insertImage"](data);
                        var fileName = getAttFileName();
                        var fileType = "image/jpg";
                        addClass(imageNode,"att-file");
                        imageNode.setAttribute("data-fn",fileName+'.jpg');
                        addAttTask.push({"name":fileName+'.jpg',"file":convertBase64UrlToBlob(data,{type:fileType}),"type":fileType});
                    };
                    addClass(insertImageBox,"hide");
                    textChanged_i();
                };
                reader.readAsDataURL(file);
            }else{
                alert("没有选取文件");
            }
        };
        var getTextSetType = function(){
            var radios = insertTextBox.querySelectorAll('input[name="setType"]'); 
            var value = radios[0].checked === true ? radios[0].value : radios[1].value;
            return value;
        };
        var setEditorText = function(setType,text){
            var setHtml = '<p class="paragraph">'+text+'<br></p>';
            if(setType === "recover"){
                textEditor.innerHTML = setHtml;
                thisDocId = "";
            }else{
                textEditor.innerHTML = textEditor.innerHTML+setHtml;
            }
            textChanged_i();
            textEditorScrollFun(cursorScrollFun);
        };
        var textInsertFun = function(){
            var file = insertTextBox.querySelector("input").files[0];
            if(file){
                var fileType = file.type;
                var setType = getTextSetType();
                if(fileType.search("text") !== -1){
                    var reader = new FileReader();                        
                    var codeSelector = insertTextBox.querySelector("select");
                    var codeIndex = codeSelector.selectedIndex;
                    var code = codeSelector[codeIndex].value;
                    reader.readAsText(file,code);
                    reader.onload = function (event) {
                        setEditorText(setType,event.target.result);
                    };
                    addClass(insertTextBox,"hide");
                }else if(fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
                    var src = window.URL.createObjectURL(file);
                    JSZipUtils.getBinaryContent(src,function(error,content){
                        if(error){
                            throw error;
                        }
                        var zip = new JSZip(content);
                        var doc=(new Docxtemplater()).loadZip(zip);
                        var text= doc.getFullText();
                        setEditorText(setType,text);
                    });
                    addClass(insertTextBox,"hide");
                }else{
                    alert("导入文件要求txt或docx类型");
                }
            }else{
                alert("没有选取文件");
            }
        };
        var insertAudioFun = function(){
            var file = insertAudioBox.querySelector("input").files[0];
            var fileType = file.type;
            var typeStr = '.'+getFileTypeName(fileType);
            if(file){
                if(fileType.search("audio") !== -1){
                    var cursorContainer = editor.getSelection().endContainer;
                    var fileName = getAttFileName()+typeStr;
                    var audioNode = null;
                    if(editorDiv.innerText.length > 1){
                        audioNode = document.createElement("audio");
                        audioNode.src = window.URL.createObjectURL(file);
                        audioNode.setAttribute("data-fn",fileName);
                        audioNode.controls = "controls";
                        addClass(audioNode,"att-file");
                        var nextElem = cursorContainer.nextSibling;
                        var parentNode = cursorContainer.parentNode;
                        nextElem ? parentNode.insertBefore(audioNode,nextElem) : parentNode.insertBefore(audioNode,cursorContainer); 
                        addAttTask.push({"name":fileName,"file":file,"type":fileType});
                        addClass(insertAudioBox,"hide");
                    }else{
                        alert("先输入文本再插入音频.");
                    }
                    textChanged_i();
                }else{
                    alert("非有效音频文件.");
                }
            }else{
                alert("没有选取文件");
            }
        };
        var setInputFileInfo = function(box){
            var file = box.querySelector("input").files[0];
            var fileType = file.type;
            var bSize = file.size;
            var sizeStr = "";
            var type = "";
            if(fileType.search("text") !== -1){
                type = "text";
            }else if(fileType.search("document") !== -1){
                type = "docx";
            }
            if(bSize > 1024){
                var kSize = bSize/1024;
                if(type === "text" && kSize > 60 || type === "docx" && kSize > 600){
                    return false;
                }else{
                    sizeStr = getKSizeStr(kSize)+" ("+bSize+"字节)";
                }
            }else{
                sizeStr = bSize+"字节";
            }
            box.children[2].innerHTML = "名称"+" : "+file.name+"<br>"+"大小"+" : "+sizeStr;
            return true;
        };
        var textFileInputChange = function(){
            if(setInputFileInfo(insertTextBox)){
                var file = insertTextBox.querySelector("input").files[0];
                var fileType = file.type;
                var codeSelectBox = insertTextBox.children[3];
                var setTypeBox = insertTextBox.children[4];
                if(fileType.search("text") !== -1){
                    removeClass(codeSelectBox,"hide");
                }else if(fileType.search("document") !== -1){
                    addClass(codeSelectBox,"hide");
                }
                removeClass(setTypeBox,"hide");
            }else{
                alert("文本太大!要求不超过60K.");
            }
        };
        var imageFileInputChange = function(){
            setInputFileInfo(insertImageBox);
        };
        var audioFileInputChange = function(){
            setInputFileInfo(insertAudioBox);
        };
        var checkAttName = function(attName){
            var attItems = editorDiv.querySelectorAll(".att-file");
            for(var i=0,len=attItems.length;i<len;i++){
                var thisItem = attItems[i];
                var thisName = thisItem.getAttribute("data-fn");
                if(thisName === attName){
                    return true;
                }
            }
            return false;
        };
        var setRmAttTask = function(){
            var preAttachInfo = docData._attachments;
            for(var attName in preAttachInfo){
                if(!checkAttName(attName)){
                    rmAttTask.push(attName);
                }
            }
        };
        var setAddAttTask = function(){
            var endAddAttTask = new Array();
            fetchArr(addAttTask,function(i){
                var thisAttInfo = addAttTask[i];
                if(checkAttName(thisAttInfo["name"])){
                    endAddAttTask.push(thisAttInfo);
                }
            });
            addAttTask = endAddAttTask;
        };
        var rmAttDataCallBack = function(docInfo,callBack){
            var endCall = callBack;
            if(rmAttTask.length > 0){
                var attName = rmAttTask.pop();
                rmAttData_c(docInfo,attName)(function(res){
                    var endFlag = true;
                    if(res){
                        var resJson = JSON.parse(res);
                        if(resJson.hasOwnProperty("ok")){
                            docData.revId = resJson.rev;
                            rmAttDataCallBack(resJson,endCall);
                            endFlag = false;
                        }
                        if(endFlag){
                            rmAttTask.length = 0;
                            callBack();
                        }
                    }else{
                        rmAttTask.length = 0;
                    }
                });
            }else{
                callBack();
                return true;
            }
        };
        var rmAttFun = function(docInfo,callBack){
            rmAttTask.length > 0 && docData.hasOwnProperty("_attachments") ? rmAttDataCallBack(docInfo,callBack) : callBack();
        };
        var addAttDataCallBack = function(docInfo,callBack){
            var endCall = callBack;
            if(addAttTask.length > 0){
                var attInfo = addAttTask.pop();
                addAttData_c(docInfo,attInfo.name,attInfo.file,attInfo.type)(function(res){
                    var endFlag = true;
                    if(res){
                        var resJson = JSON.parse(res);
                        if(resJson.hasOwnProperty("ok")){
                            docData.revId = resJson.rev;
                            addAttDataCallBack(resJson,endCall);
                            endFlag = false;
                        }
                    }
                    if(endFlag){
                        addAttTask.length = 0;
                        callBack();
                    }
                });
            }else{
                callBack();
                return true;
            }
        };
        var addAttFun = function(docInfo,callBack){
            if(addAttTask.length > 0){
                setAddAttTask();
                addAttDataCallBack(docInfo,callBack);
            }else{
                callBack();
            }
        };
        var submitStyle = function(type){
            textfrag.removeChild(textfrag.firstElementChild);
            removeClass(contentSubmit,"submit");
            if(type === "add"){
                tipView(true,"文档已保存.");
            }else if(type === "edit"){
                tipView(true,"文档已修改.");
            }
        };
        var addInfoCallBack = function(res){
            if(res){
                textAddFlag = true;
                submitStyle("add");
                textEditor.innerHTML = "";
                newDocFlag = true;
            }else{
                textfrag.removeChild(textfrag.firstElementChild);
                alert("文档存储正常，但是文档在归档时失败");
            }
        };
        var editInfoCallBack = function(res){
            if(res){
                submitStyle("edit");
            }else{
                alert("文档存储正常，但是文档在归档时失败");
            }
        };
        var docReqCallBack = function(res,callBack){
            if(res){
                var resJson = JSON.parse(res);
                if(resJson.hasOwnProperty("ok")){
                    var resDocId = resJson.id;
                    if(thisDocId.length === 0){
                        if(typeof fieldId === "string"){
                            addAttFun(resJson,function(){
                                addFieldDocInfo_c(fieldId,resDocId)(function(addFieldRes){
                                    addInfoCallBack(addFieldRes);
                                    callBack();
                                });
                            });
                        }else if(typeof docData === "object"){
                            docData.docId = resDocId;
                            addAttFun(resJson,function(){
                                addDocInfo_c(docData)(function(addDocRes){
                                    addInfoCallBack(addDocRes);
                                    callBack();
                                });
                            });
                        }
                    }else{
                        textEditedFlag = true;
                        updateEditTime_c(resDocId)(function(updateRes){
                            editInfoCallBack(updateRes);
                            callBack();
                        });
                    }
                }else if(resJson.hasOwnProperty("error")){
                    callBack();
                    alert("文档更新失败");
                }
            }else{
                callBack();
                alert("未返回操作信息.");
            }
        };
        var setAttNodeSrc = function(textNode){
            var fileNodes = textNode.querySelectorAll(".att-file");
            if(fileNodes.length > 0){
                fetchArr(fileNodes,function(i){
                    fileNodes[i].removeAttribute("src");
                });
            }
        };
        var submitData = function(data,docId){
            var rmLoading = bodyLoading();
            var reqCallBack = function(res){
                docReqCallBack(res,rmLoading);
            };
            if(typeof docId === "string" && docId.length > 0){
                setRmAttTask();
                var preRev = docData.revId;
                rmAttFun({"id":docId,"rev":docData.revId},function(){
                    addAttFun({"id":docId,"rev":docData.revId},function(){
                        if(preRev !== docData.revId){
                            getAttInfo_c(docId)(function(res){
                                if(res){
                                    var resJson = JSON.parse(res);
                                    if(!resJson.hasOwnProperty("error")){
                                        docData._attachments = resJson;
                                        updateDocData_c(data,docId)(reqCallBack);
                                    }else{
                                        alert("删除时发生错误.");
                                    }
                                }else{
                                    delete docData._attachments;
                                    updateDocData_c(data,docId)(reqCallBack);
                                }
                            });
                        }else{
                            updateDocData_c(data,docId)(reqCallBack);
                        }
                    });
                });
            }else{
                addDocData_c(data)(reqCallBack);
            }
        };
        var submitTextContent = function(){
            if(hasClass(contentSubmit,"submit")){
                var textNode = textEditor.cloneNode(true);
                setAttNodeSrc(textNode);
                var mathFlag = recoverMathText(textNode);
                textfrag.appendChild(textNode);
                var textJson = fetchTextNodes(textNode);
                var textLen = textJson.textLen;
                var htmlStr = textNode.innerHTML;
                var thisDocData = {};
                if(textLen > 0){
                    var firstH1 = textNode.querySelector("h1");
                    if(firstH1 !== null){
                        thisDocData.title = true;
                    }
                    thisDocData.texts = textJson.text;
                    thisDocData.doms = htmlStr.split("%=");
                    thisDocData.textLen = textLen;
                    if(mathFlag){
                        thisDocData.mathFlag = true;
                    }
                    submitData(thisDocData,thisDocId);
                }else{
                    alert("添加的文档不能为空");
                }
            }
        };
        var editorKeyUpEvent = function(){
            var thisSelection = editor.getSelection().startContainer;
            var thisNode = null;
            if(thisSelection.nodeName === "#text" && thisSelection.parentNode.nodeName === "PRE"){
                thisNode = thisSelection.parentNode;
            }else if(thisSelection.nodeName === "PRE"){
                thisNode = thisSelection;
            }
            if(thisNode !== null && thisNode.id === "mathCode"){
                var mathP = thisNode.nextSibling;
                mathP.innerHTML = thisNode.innerHTML;
                MathJax.Hub.Queue(["Typeset",MathJax.Hub,mathP]);
            }
            addClass(contentSubmit,"submit");
        };
        var editorMakeHeader = function(){
            Squire.prototype.makeHeader = function() {
                return this.modifyBlocks(function(frag){
                    var output = this._doc.createDocumentFragment();
                    var block = frag;
                    block = Squire.getNextBlock(block);
                    while (block) {
                        output.appendChild(
                            this.createElement('h1',[Squire.empty(block)])
                        );
                        block = Squire.getNextBlock(block);
                    }
                    return output;
                });
            };
        };
        return {
            setView:function(){
                if(docData && docData.html && docData.html.length > 0){
                    textEditor.innerHTML = docData.html;
                }
            },event:function(){
                editorMakeHeader();
                textEditorBar.addEventListener("click",editorBarEvent);
                fontSetSubmit.addEventListener("click",fontSetSubmitEvent);
                urlSubmit.addEventListener("click",urlSetFun);
                imageSubmit.addEventListener("click",imageInsertFun);
                textSubmit.addEventListener("click",textInsertFun);
                audioSubmit.addEventListener("click",insertAudioFun);
                setColorBox.addEventListener("click",setColorEvent);
                setHeaderBox.addEventListener("click",setHeaderEvent);
                textEditor.addEventListener("click",textEditorClickEvent);
                textEditor.addEventListener("keydown",textEditorKeyFun);
                textEditor.addEventListener("keyup",editorKeyUpEvent);
                textEditor.addEventListener("cut",textChanged_i);
                textEditor.addEventListener("paste",textChanged_i);
                insertTextBox.querySelector("input").addEventListener("change",textFileInputChange);
                insertImageBox.querySelector("input").addEventListener("change",imageFileInputChange);
                insertAudioBox.querySelector("input").addEventListener("change",audioFileInputChange);
                contentSubmit.addEventListener("click",submitTextContent);
            },removeEvent:function(){
                textEditorBar.removeEventListener("click",editorBarEvent);
                fontSetSubmit.removeEventListener("click",fontSetSubmitEvent);
                urlSubmit.removeEventListener("click",urlSetFun);
                imageSubmit.removeEventListener("click",imageInsertFun);
                textSubmit.removeEventListener("click",textInsertFun);
                audioSubmit.removeEventListener("click",insertAudioFun);
                setColorBox.removeEventListener("click",setColorEvent);
                setHeaderBox.removeEventListener("click",setHeaderEvent);
                textEditor.removeEventListener("click",textEditorClickEvent);
                textEditor.removeEventListener("keydown",textEditorKeyFun);
                textEditor.removeEventListener("keyup",editorKeyUpEvent);
                textEditor.removeEventListener("cut",textChanged_i);
                textEditor.removeEventListener("paste",textChanged_i);
                insertTextBox.querySelector("input").removeEventListener("change",textFileInputChange);
                insertImageBox.querySelector("input").removeEventListener("change",imageFileInputChange);
                contentSubmit.removeEventListener("click",submitTextContent);
            },free:function(){
                hidePromptBox(null);
                clearFileBox(insertImageBox);
                clearFileBox(insertTextBox);
                this.removeEvent();
                editor.destroy();
            }
        };
    }

    function setController(callBack){
        var thisContext = Context(contextKey);
        thisContext.setTrait("pageBack",function(){
            callBack(thisContext);
        });
        thisContext.setTrait("viewDisplay",viewDisplay);
        controller.pushContext(thisContext);
    }

    function initView(){
        var editor = Editor_I();
        editor.setView();
        editor.event();
        setController(function(thisContext){
            var nextKey = controller.topContext().getKey();
            if(nextKey === "textReader" && textEditedFlag){
                thisContext.popInfo.html = textEditor.innerHTML;
            }else if(nextKey === "issueDocs" && textAddFlag){
                thisContext.popInfo.add  = true;
            }else if(nextKey === "docList" && newDocFlag){
                thisContext.popInfo.resetFlag  = true;
            }
            thisDocId = "";
            editor.free();
            editor = null;
        });
    }

    (function(){
        if(typeof Docxtemplater === "undefined"){
            loadScriptBySrc("/webapp/script/lib/docxtemplater-latest.min.js");
        }
        if(typeof JSZip === "undefined"){
            loadScriptBySrc("/webapp/script/lib/jszip.min.js");
        }
        if(typeof JSZipUtils === "undefined"){
            loadScriptBySrc("/webapp/script/lib/jszip-utils.min.js");
        }
        if(typeof MathJax === "undefined"){
            loadScriptBySrc("https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-AMS_CHTML-full");
        }
        typeof Squire === "undefined" ? loadScriptBySrc("/webapp/script/lib/squire-raw.js",function(){
            initView();
        }) : initView();
    })();
}
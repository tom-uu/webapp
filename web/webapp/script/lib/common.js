    function hasClass(obj, cls){  
        return obj && obj.className ? obj.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)')) : false; 
    }  

    function addClass(obj, cls){ 
        if (typeof obj !== 'undefined' && !this.hasClass(obj, cls)){
            obj.className = obj.className ? obj.className+' '+cls :cls;	
            return 1;    
        }else{
            return cls;
        }  
    }  
    //原来的移出类操作函数有缺陷:直接采用空格来替换匹配字符，但是这样不能避免对于最后一个类名进行操作时，随着不断地add、remove交替，空格字符会递增，在浏览器调试中会看到这一现象，首先体验不好，其次性能肯定有损耗，所以进行如下改造;2017.9.25.11:00写 
    function removeClass(obj, cls){//经过输出hasClass(obj,cls);发现输出的是一个数组形态，首项为匹配的字符串，第二项为字符串首项第三项为字符串的最后一项，第四项为匹配字符串在原字符串中的索引值;利用这几项可以进行字符串截取操作，达到把特定字符串去除的目的;(只有进行探索尝试才会发现规律，达到求证效果;2017.9.25.10:56补)2017.9.25.10:47开写---2017.9.25.10:50写完
        var checkRes = hasClass(obj,cls);
        if(checkRes){ 	
            obj.className = checkRes[2] === checkRes[0].charAt(checkRes[0].length-1) ? obj.className.slice(0,checkRes['index'])+obj.className.slice(checkRes['index']+checkRes[0].length-1) : obj.className.slice(0,checkRes['index']); //通过运算符的结合顺序，直接利用+号可能达不到倒序运算的目的，所以需要利用赋值运算符来从右到左进行倒序运算----先截取尾字符，再取前字符，最后拼接起来即为所求的字符串;由于js中的字符操作函数功能有限，所以有些算法需要自己发挥;2017.9.25.10:51写完---2017.9.25.10:54写完  	
            return 0;  
        }
        else{
            return cls;
        }  
    }  

    function toggleClass(obj,cls){ 
        return hasClass(obj,cls) ? removeClass(obj, cls) : addClass(obj, cls);  
    }

    function getStyle(node,attr){
        return node.currentStyle ? node.currentStyle[attr] : document.defaultView.getComputedStyle(node,false)[attr];
    }
    
    function trim(s){
        return typeof s === "string" ? s.replace(/(^\s*)|(\s*$)/g, "") : s;
    }
    
    function rmSpecialStr(s) {
        s = s.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
        s = s.replace(/[\@\#\$\%\^\&\*\(\)\{\}\:\"\L\<\>\?\[\]]/);
        return s;
    }
    
    function fetchTextNodes(topNode){
        if(topNode){
            var nodeStack = [],texts = [],textLen = 0;
            nodeStack.push(topNode);
            while(nodeStack.length > 0){
                var thisNode = nodeStack.pop(),nodeType = thisNode.nodeType;
                if(nodeType === 3){
                    var thisText = thisNode.nodeValue;
                    texts.push(thisText);
                    textLen = textLen + thisText.length;
                    thisNode.nodeValue = "%=";
                }else if(nodeType === 1){
                    var subNodes = thisNode.childNodes;
                    for(var len=subNodes.length-1;len>=0;len--){
                        var thisSubNode = subNodes[len],subNodeType = thisSubNode.nodeType;
                        if(subNodeType === 3 || subNodeType === 1){
                            nodeStack.push(subNodes[len]);
                        }
                    }
                }
            }
            return {"text":texts,"textLen":textLen};
        }else{
            return false;
        }
    }
    
    function switchSiblingPosition(node1,node2,switchFlag){//switchFlag == true,则把node1移动到node2之前；switchFlag == false,则把node2移动到node1之前；2017.8.11.16:22写					
        return switchFlag ? node2.parentNode.insertBefore(node1,node2) === node1 : node2.parentNode.insertBefore(node2,node1) === node2;
    }

    function checkTransitionEndName(){
        var element = document.body || document.documentElement;//参照，网络上的一篇博客介绍的检查某事件名兼容性的代码，网址：http://wnworld.com/archives/204.html；(注意这里的element的值是如何赋值的；这里是用来判断浏览器可读的transitionend的事件名，一共四种、不多，可以直接枚举遍历即可(如果涉及较多的数量那么枚举法可能就不适用了，需要另外采用合适的算法)；2017.8.12.15:45补完)2017.8.12.15:43写
    	var transEndEventNames = {
            WebkitTransition : 'webkitTransitionEnd',
            MozTransition : 'transitionend',
            OTransition : 'oTransitionEnd otransitionend',
            transition : 'transitionend'
        };
        for(var name in transEndEventNames){
        	if(typeof element.style[name] === "string"){
            	return transEndEventNames[name];
            }
        }
    }
    
    window.requestAnimFrame = (function(){return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback){window.setTimeout(callback,100);};})();//window.requestAnimationFrame的兼容性处理;2017.9.7.10:31写
    
    function getScrollTop()
    {
        var scrollTop=0;
        if(document.documentElement&&document.documentElement.scrollTop){
            scrollTop=document.documentElement.scrollTop;
        }else if(document.body){
            scrollTop=document.body.scrollTop;
        }
        return scrollTop;
    }

    function displayProperty(obj){/*网上找到的能显示对象所有属性的方法，原博客网址已经加入收藏夹中;2017.8.10.13:22*/   
        var names="";       
        for(var name in obj){       
            names+=name+": "+obj[name]+", ";  
        }  
        alert(names);  
    }
    //(源代码已被如下完全更改了)2017.8.12.23:59写//自己封装的取得兄弟元素节点(不包含文本节点和属性节点)，用法：参数obj为参照节点，参数direction为方向，其值只有两个：previous、next，分别代表向前查找和向后查找；2017.8.12.21:35写完
    function getElementSibling(referNode,direction){//参照这个网址的代码：https://www.oschina.net/code/snippet_273800_12194;取消在这之前所写的另一个方法，那个方法如上注释所描述，也是参考网上的代码，但是此代码问题很多，而且涉及到删除这个多余动作，效率不是太好，除此之外还出现很多未知的问题；2017.8.12.23:58
        if(direction === "previous")
        {
            for(var previousNode = referNode.previousSibling;previousNode;previousNode = previousNode.previousSibling){
                if(previousNode.nodeType === 1){
                    return previousNode;
                }
            }
            return null;
        }else if(direction === "next"){			
            for(var nextNode = referNode.nextSibling;nextNode;nextNode = nextNode.nextSibling){
                if(nextNode.nodeType === 1){
                    return nextNode;
                }
            }
            return null;
        }
    }
	
    function getRequest() {//js获取url参数，这里用来做signup切换控制，参考网址http://www.cnblogs.com/karila/p/5991340.html;2017.8.24.16:56写完
        var url = location.search; //获取url中"?"符后的字串  
        var theRequest = new Object();  
        if (url.indexOf("?") !== -1) {  
                var str = url.substr(1);  
            strs = str.split("&");  
            for(var i = 0; i < strs.length; i ++) {  
                theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);  
            }  
        }  
        return theRequest;  
    }
	
    //下面这个函数解决的是：有些浏览器，如，火狐会出现如onresize、onscroll等事件，执行两次的情况，有些浏览器的版本可能还会执行多次；那么，这个问题可由下面的函数解决；
    function debounce(func,minTimehold,execInStart) { 
        var timeout; 
        return function(){ 
            var obj = this, args = arguments; 
            function delayed () { 
                if (!execInStart) 
                func.apply(obj, args); 
                timeout = null; 
            }; 
            if (timeout){ 
                clearTimeout(timeout);
            }else if (execInStart){ 
                func.apply(obj, args);
            } 
            timeout = setTimeout(delayed, minTimehold || 100); 
        }; 
    }
	
    function stopDefaultEvent(e){
        e.preventDefault();
    }
    
    function compatScrollY(){
        var supportPageOffset = window.pageYOffset !== undefined;
        var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
        return supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
    }
    
    function getNumFromVarName(var_name){
        var name_length = var_name.length;
        var num = -1;
        for(var i=name_length-1;i>=0;i--){
            var this_n = Number(var_name.charAt(i));
            if(!isNaN(this_n)){
                if(num<0){
                    num=0;
                }
                num += this_n*Math.pow(10,(name_length-i-1));								
            }
            else{
                break;
            }
        }
        return num;
    }	
	
    function loadStyles(url){
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = url;
        var head = document.getElementsByTagName("head")[0];
        head.appendChild(link);
    }
	
    function getSheetObj(sheetName){
        for(var i=0;i<document.styleSheets.length;i++){
            var checkSheetName = document.styleSheets[i].href.slice(document.styleSheets[i].href.lastIndexOf("/")+1);
            if(checkSheetName === sheetName){				
                return document.styleSheets[i];
            }
            else if(i === document.styleSheets.length-1){
                return null;
            }
        }
    } 
	
    function insertRule(sheet,selectorText,cssText,position){
        if(sheet.insertRule){
            sheet.insertRule(selectorText+"{"+cssText+"}",position);
        }else if(sheet.addRule){
            sheet.addRule(selectorText,cssText,position);
        }
    }
	
    Date.prototype.Format = function (fmt) { //author: meizz 
    	var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
    	};
    	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    	for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };
    
    function getElementIndex(ele){  
        //IE is simplest and fastest  
        if(ele.sourceIndex){  
            return ele.sourceIndex - ele.parentNode.sourceIndex - 1;  
        }  
        //other browsers  
        var i=0;  
        while(ele.previousElementSibling){
            ele = ele.previousElementSibling;
            i++;  
        }
        return i;  
    }
    
    function clearObj(obj){//清空对象
    	for(var key in obj){
            delete obj[key];
    	}
    }
    
    function isArray(obj) {      
        return Object.prototype.toString.call(obj) === '[object Array]';       
    }
    
    function isEmptyObject(e) {  
        var t;  
        for (t in e)  
            return 0;  
        return 1;  
    } 
    
    function addCss(url){
        var head = document.head;
        if(head.querySelector("link[href=\""+url+ "\"]") === null){
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = url;
            head.appendChild(link);
            return true;
        }else{
            return false;
        }
    }
    
    function runScriptByText(script){//这是目前查到的所有异步执行innerHTML中js代码最通用的办法，直接利用浏览器的解析机制，避免eval执行的低效率和安全性问题；2018.9.8.15:11
        var newScript = document.createElement("script");
        var body = document.body;
        newScript.type = "text/javascript";
        if(script.innerHTML.length > 0){
            newScript.innerHTML = script.innerHTML;
        }
        if(script.hasAttribute('src')){// 存在 src 属性的话
            newScript.setAttribute('src', script.getAttribute('src'));
        } 
        body.appendChild(newScript);
        body.removeChild(newScript);
    }
    
    /*function runScriptBySrc(src,containerNode,callBack,contentType,text){
        var script = document.createElement("script");
        script.type = contentType ? contentType : "text/javascript";
        script.innerText = text ? text : "";
        //script.async = "async";
        script.src = src;
        containerNode.appendChild(script);
        if(typeof callBack === "function"){
            script.readyState ? script.onreadystatechange=function(){
                if(script.readyState==='complete' || script.readyState==='loaded'){
                    script.onreadystatechange=null;
                    containerNode.removeChild(script);
                    callBack();
                }
            } : script.onload=function(){
                containerNode.removeChild(script);
                callBack();
            };
        }
    }*/
    
    function loadScriptBySrc(src,callBack){
        var body = document.body;
        var endCall = function(){
            if(typeof callBack === "function"){
                callBack();
            }
        };
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = src;
        body.appendChild(script);
        script.readyState ? script.onreadystatechange=function(){
            if(script.readyState==='complete' || script.readyState==='loaded'){
                script.onreadystatechange=null;
                body.removeChild(script);
                endCall();
            }
        } : script.onload=function(){
            body.removeChild(script);
            endCall();
        };
    }
    
    function findAncestors(thisNode,callBack){
        if(callBack(thisNode)){
            var thisParent = thisNode.parentNode;
            while(thisParent && callBack(thisParent)){
                thisParent = thisParent.parentNode;
            }
            return thisParent;
        }else{
            return false;
        }
    }
    
    function clone(obj){  
        function subClone(){}  
        subClone.prototype = obj;  
        var o = new subClone();  
        for(var a in o){  
            if(typeof o[a] === "object") {  
                o[a] = clone(o[a]);  
            }     
        }  
        return o;  
    };  
    
    function attributeCount(obj) {
        var count = 0;
        for(var i in obj) {
            if(obj.hasOwnProperty(i)) {  // 建议加上判断,如果没有扩展对象属性可以不加
                count++;
            }
        }
        return count;
    };
    
    function fetchArr(arr,callBack){
        for(var i=0,len=arr.length;i<len;i++){
            callBack(i);
        }
    };
    
    function formatDate(date){
        var y = date.getFullYear();
        var m = date.getMonth()+1;
        m = m < 10 ? ('0'+m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0'+d) : d;
        return y+'-'+m+'-'+d;
    }
    
    function StateControll(stateInfo,actionMap){
        this.context = null;
        var state = stateInfo;
        this.actionMap = actionMap;
        var change = function(changeInfo){
            for(var name in changeInfo){
                state[name] = changeInfo[name];
            }
        };
        var read = function(readInfo){
            var matchFlag = false;
            var counter = 0;
            for(var name in readInfo){
                if(state.hasOwnProperty(name)){
                    if(readInfo[name] === state[name]){
                        matchFlag = counter === 0 ?  true : (matchFlag && true);
                    }else if(matchFlag){
                        matchFlag = false;
                        break;
                    }
                }
                counter++;
            }
            return matchFlag;
        };
        var processFun = function(info){
            if(typeof info.change !== 'undefined'){
                change(info.change);
            }
            return info.action;//由状态机 调用的动作的方法不要带有参数，以简化代码维护的工作；2018.12.27.19:26
        };
        this.getAction = function(event){
            var infoObj = null;
            for(var key in this.actionMap){
                if(event === key){
                    var thisInfo = this.actionMap[key];
                    var len = thisInfo.length;
                    if(len && len > 0){
                        for(var i=0;i<len;i++){
                            infoObj = thisInfo[i];
                            if(read(infoObj.read)){
                                return processFun(infoObj);
                            }
                        }
                    }else if(read(thisInfo.read)){
                        return processFun(thisInfo);
                    }
                }
            }
            return null;
        };
    };
    
    function arrayDeleteElement(arr,value){
        var index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index,1);
        }
    };
    
    function PagingInteraction(pageBarNode){
        var headContainer = pageBarNode.querySelector(".page-head-container");
        var tailContainer = pageBarNode.querySelector(".page-tail-container");
        var headTrigger = pageBarNode.querySelector(".page-head-trigger");
        var preTrigger = pageBarNode.querySelector(".page-pre-trigger");
        var pageNumContainer = pageBarNode.querySelector(".page-num-container");
        var nextTrigger = pageBarNode.querySelector(".page-next-trigger");
        var tailTrigger = pageBarNode.querySelector(".page-tail-trigger");
        var totalItem = pageBarNode.querySelector(".page-totalItem-text");
        var totalPage = pageBarNode.querySelector(".page-totalPage-text");
        var pageNumInput = pageBarNode.querySelector(".page-jumpTo-inputNum");
        var pageNumSubmit = pageBarNode.querySelector(".page-jumpTo-submit");
        var callFun = null;
        var dataCounter = 0;
        var pageCounter = 0;
        var switchPageByNumContext = function(trigger){
            var firstNum = parseInt(pageNumContainer.firstChild.innerText);
            var lastNum = parseInt(pageNumContainer.lastChild.innerText);
            var thisNum = parseInt(trigger.innerText);
            callFun((thisNum-1)*10,function(flag){
                if(flag){
                    if(thisNum > (lastNum+firstNum)/2){
                        if((pageCounter > lastNum) && (lastNum-firstNum) === 8){								
                            var moveBtn = pageNumContainer.appendChild(pageNumContainer.firstChild);
                            moveBtn.innerText(lastNum+1);
                        }
                    }
                    else if(thisNum < (lastNum+firstNum)/2){
                        if(firstNum > 1){
                            var moveBtn = pageNumContainer.insertBefore(pageNumContainer.lastChild,pageNumContainer.firstChild);
                            moveBtn.innerText(firstNum-1);
                        }
                    }
                    if(!hasClass(trigger,"focus")){	
                        var focusBtn = trigger.parentNode.getElementsByClassName("focus")[0];
                        removeClass(focusBtn,"focus");
                    }	
                    addClass(trigger,"focus");
                    thisNum > 1 ? removeClass(headContainer,"hide") : addClass(headContainer,"hide");
                    thisNum === pageCounter ? addClass(tailContainer,"hide") : removeClass(tailContainer,"hide");
                }
            });
        };
        return {
            "setPage" : function(dataNum,focusPageNum){
                if(dataCounter !==  dataNum){
                    var nowPageCounter = parseInt(dataNum/10);
                    var offsetPageNum = 0;
                    dataCounter =  dataNum;
                    if(dataCounter%10 > 0){
                        nowPageCounter += 1; 										
                    }
                    if(pageCounter !== nowPageCounter){
                        if((pageCounter < 9 && pageCounter < nowPageCounter) || (nowPageCounter < 9 && pageCounter > nowPageCounter)){
                            offsetPageNum = nowPageCounter-pageCounter;
                        }
                    }
                    if(offsetPageNum !== 0){
                        var pageBtn = pageNumContainer.children[0];
                        removeClass(pageBtn,"focus");
                        if(offsetPageNum > 0){
                            var pageTop = nowPageCounter < 9 ? nowPageCounter : 9;
                            var pageBtnFreg = document.createDocumentFragment();
                            for(var i=pageCounter+1;i<=pageTop;i++){							
                                var thisBtn = document.createElement("a");
                                thisBtn.innerText = i;
                                pageBtnFreg.appendChild(thisBtn);
                            }
                            pageNumContainer.appendChild(pageBtnFreg);
                        }else if(dataNum > 0){
                            var moveCounter = 0-offsetPageNum;
                            for(var i=0;i<moveCounter;i++){
                                var countPageBtn = pageNumContainer.children.length;
                                if(countPageBtn > 1){
                                    pageNumContainer.removeChild(pageNumContainer.children[countPageBtn-1]);
                                    addClass(tailContainer,"hide");
                                }
                            }
                        }else{
                            pageNumContainer.innerHTML = "";
                        }
                        pageCounter = nowPageCounter;
                        if(pageCounter < 2){
                            addClass(headContainer,"hide");
                            addClass(tailContainer,"hide");
                        }else{
                            addClass(headContainer,"hide");
                            removeClass(tailContainer,"hide");
                        }
                        totalItem.innerText = dataCounter;
                        totalPage.innerText = pageCounter;
                    }else{
                        totalItem.innerText = dataCounter;
                    }
                    if(focusPageNum && focusPageNum < pageCounter){
                        var focusNumBtn = pageNumContainer.querySelector(".focus");
                        if(focusNumBtn !== null){
                            removeClass(focusNumBtn,"focus");
                        }
                        addClass(pageNumContainer.children[focusPageNum-1],"focus");
                    }
                }
            },"initPaging" : function(dataNum,focusPageNum,callBack){
                if(dataNum > 0){
                    this.setPage(dataNum,focusPageNum);
                    callFun = callBack;
                }
            },"event" : function(){
                pageNumContainer.addEventListener("click",function(e){
                    var trigger = e.target;
                    if(trigger.nodeName === "A"){
                        switchPageByNumContext(trigger);
                    }   					
                });
                headTrigger.addEventListener("click",function(){
                    var firstNum = parseInt(pageNumContainer.firstChild.innerText);
                    if(firstNum > 1){
                        var pageNumTriggers = pageNumContainer.children;
                        fetchArrElement(pageNumTriggers,function(i){
                            var thisNum = parseInt(pageNumTriggers[i].innerText);
                            pageNumTriggers[i].innerText = thisNum-(firstNum-1);
                        });

                    }
                    switchPageByNumContext(pageNumContainer.firstChild);
                });
                preTrigger.addEventListener("click",function(){
                    var selectedPage = pageNumContainer.getElementsByClassName("focus")[0];
                    if(selectedPage !== pageNumContainer.firstChild){	
                        switchPageByNumContext(selectedPage.previousSibling);
                    }					
                });
                nextTrigger.addEventListener("click",function(){
                    var selectedPage = pageNumContainer.getElementsByClassName("focus")[0];
                    if(selectedPage !== pageNumContainer.lastChild){
                        switchPageByNumContext(selectedPage.nextSibling);
                    }					
                });
                tailTrigger.addEventListener("click",function(){
                    var lastNum = parseInt(pageNumContainer.lastChild.innerText);
                    var pageCounter = parseInt(totalPage.innerText);
                    if(lastNum < pageCounter){
                        for(var i=0;i<pageNumContainer.children.length;i++){
                            var thisNum = parseInt(pageNumContainer.children[i].innerText);
                            pageNumContainer.children[i].innerText = thisNum+(pageCounter-lastNum);
                        }						
                    }
                    switchPageByNumContext(pageNumContainer.lastChild);
                });
                pageNumSubmit.addEventListener("click",function(){
                    var inputPageNum = parseInt(pageNumInput.value);
                    if(inputPageNum){
                        if(pageCounter > 1){
                            var selectedPage = pageNumContainer.querySelector(".focus");
                            if(parseInt(selectedPage.innerText) !== inputPageNum){
                                var firstNum = parseInt(pageNumContainer.firstChild.innerText);
                                var lastNum = parseInt(pageNumContainer.lastChild.innerText);
                                var dValue = 0;
                                var selectBtn = null;
                                if(lastNum < pageCounter && inputPageNum <= pageCounter && inputPageNum > 0){
                                    if(inputPageNum+4 <= pageCounter && inputPageNum-1 >= 4){
                                        var middlePage = parseInt(pageNumContainer.children[4].innerText);
                                        dValue = inputPageNum - middlePage;
                                        selectBtn = pageNumContainer.children[4];
                                    }
                                    else if(inputPageNum+4 > pageCounter){
                                        dValue = pageCounter - lastNum;
                                        selectBtn = pageNumContainer.children[inputPageNum - firstNum - dValue];
                                    }
                                    else if(inputPageNum - 1 < 4){
                                        dValue = firstNum - 1;
                                        selectBtn = pageNumContainer.children[inputPageNum - 1];
                                    }	
                                    if(dValue !== 0){
                                        var pageNumTriggers = pageNumContainer.children;
                                        fetchArrElement(pageNumTriggers,function(i){
                                            var thisNum = parseInt(pageNumTriggers[i].innerText);
                                            pageNumTriggers[i].innerText = thisNum+dValue;
                                        });
                                    }							
                                }else if(inputPageNum <= pageCounter){
                                    selectBtn = pageNumContainer.children[inputPageNum - 1];
                                }
                                else{
                                    selectBtn = pageNumContainer.lastChild;
                                }
                                if(selectBtn !== null){
                                    switchPageByNumContext(selectBtn);
                                }						
                            }
                        }
                        pageNumInput.value = "";
                    }					
                });
            }
        };
    };
    
    /*由于不打算使用js的第三方库文件，所以希望自己动手写一份完整的ajax的功能模块，并且能够重用；2017.8.13.14:14写*/
//本代码参考的是菜鸟教程的代码，网址：http://www.runoob.com/ajax/ajax-xmlhttprequest-create.html；2017.8.13.14:15写
//创建创建 XMLHttpRequest 对象；2017.8.13.14:16写
    function ajax(ajaxParam){//参考jquery的ajax封装方法，其传递的参数是一个json对象，因此仿照其设计也这样封装；但是，对于json不是太熟，导致不知道怎样验证其某个属性是否存在，及获取属性的值；查了资料后才会操作；json中是支持用变量做key值的，所以之前认为的只有字符串可以做key的认识是有误的；为了使封装的函数的使用比较简单快捷，key采用和jquery一样的方式---直接写变量而不是字符串，这样可以做到统一标准，书写直接；2017.8.13.17;37写//参数说明：data是所要发送到服务器的数据；url是服务器文件的地址；(cache是标识是否保留缓存的数据，true代表保留，fasle代表过滤掉缓存的数据；2017.8.13.14;42写)type是请求方式--两个值get/post；callback是请求成功后的需要执行的回调函数；async是用来标识是否进行异步操作；2017.8.13.14:39写
        var xmlhttp;
        var requestType = ajaxParam.hasOwnProperty("type") ? ajaxParam.type : "GET";//	hasOwnProperty():判断传过来的JSON数据中，某个字段是否存在;参考博客：http://blog.csdn.net/qq_26420489/article/details/50149053；2017.8.13.17:34写	
        //把调用回调函数的(判断回调函数属性是否存在，存在则执行；不存在输出提示语;2017.8.13.18:23补)功能单独拿出来，可以为使用ajax回调相关的一些功能所重用；2017.8.13.18:21写
        var ajaxCallback = function(jsonParam,funPropertyName,obj){
            //增加后端返回信息获取功能；2017.8.15.22:37写//这里注意：之前获取json对象的方法类型的属性时，由于对json对象认识比较模糊，所以采用了声明变量，间接赋值并执行函数的方式，写法如这样：var callbackEun = jsonParam.funPropertyName;callbackFun();但是在浏览器里提示这样的错误：Uncaught TypeError: callbackFun is not a function；想了一阵，不得其解，最后反应过来---可能是因为获取属性的写法出错，即'.'的方式有误(jsonParam.funPropertyName),因为这里funPropertyName作为一个参数传进来后已经是字符的形式了，而不能使用'.'来引用了，可以使用[]的方式--类似数组取值的方式；所以，更换了[]下标取值的方式就获得了成功。通过这次实践，这个语法特性要予以明确；2017.8.13.18:11左右开写---2017.8.13.18:17写完
            jsonParam.hasOwnProperty(funPropertyName) ? jsonParam[funPropertyName](obj.responseText) : console.info("xmlhttp status is "+obj.status);
        };
        //  xmlhttp=new XMLHttpRequest() IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
        // new ActiveXObject("Microsoft.XMLHTTP") IE6, IE5 浏览器执行代码
        xmlhttp = window.XMLHttpRequest ? xmlhttp = new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        xmlhttp.onreadystatechange = function()
        {
            switch(xmlhttp.readyState){//readyState的四种状态要记住，每种状态代表什么含义要明确；2017.8.13.18:33写
                case 0:
                    console.info("request not init...");
                    break;
                case 1:
                    console.info("server connected...");
                    break;
                case 2:
                    console.info("request received...");
                    break;
                case 3:
                    console.info("request is executing...");
                    break;
                case 4:				
                    console.info("request done.");
                    xmlhttp.status === 200 || xmlhttp.status === 201 ? ajaxCallback(ajaxParam,"success",xmlhttp) : ajaxCallback(ajaxParam,"error",xmlhttp);
                    break;
                default:
                    console.error("unknow readyState "+ xmlhttp.readyState);	
            }
        };
        if(ajaxParam.hasOwnProperty("url")){
            var isAsync = ajaxParam.hasOwnProperty("async") ? ajaxParam.async : true;
            var url = ajaxParam.url;
            if(requestType === "GET"){
                if(ajaxParam.hasOwnProperty("cache") && !ajaxParam.cache){
                    url = url + Math.random();
                }				
            }
            xmlhttp.withCredentials = true;
            xmlhttp.open(requestType,url,isAsync);
            xmlhttp.setRequestHeader("If-Modified-Since","0");
            if(ajaxParam.hasOwnProperty("data") && ajaxParam.data){
                var sendData = ajaxParam.data;
                var contentType = ajaxParam.hasOwnProperty("contentType") ? ajaxParam.contentType : "application/x-www-form-urlencoded;charset=utf-8";//补充说明：PHP默认识别的数据类型是application/x-www.form-urlencoded标准的数据类型；因此，对型如text/xml或者soap或者application/octet-stream 和application/json格式之类的内容无法解析，如果用$_POST数组来接收就会失败！此时可以使用$GLOBALS['HTTP_RAW_POST_DATA']或file_get_contents('php://input')来获取提交的数据；参考网址：http://www.cnblogs.com/cqingt/p/5853566.html；2017.8.13.23:00写
                xmlhttp.setRequestHeader("Content-type",contentType);
                xmlhttp.send(sendData);
            }
            else{
                xmlhttp.send();
            }
        }
    }

    function requestServer(reqType,reqUrl,sendData,callBack,contentType){
        var param = {
            "type":reqType,
            "url":reqUrl,
            "data":sendData,
            "success":function(resText){
                callBack(resText);
            },
            "error":function(){
                console.error("server alert wrong");
            }
        };
        
        if(contentType && contentType.length > 0){
            param.contentType = contentType;
        }
        ajax(param);
    }

    function loadingDisplay(node,loadingCls){
        var loadingDiv = document.createElement("div");
        var className = "sk-spinner sk-spinner-pulse "+loadingCls;
        addClass(loadingDiv,className); 
        node !== document.body && node.firstChild ? node.insertBefore(loadingDiv,node.firstChild) : node.appendChild(loadingDiv);
        return function(){
            node.removeChild(loadingDiv);
        };
    }
    
    function stopTouchendPropAfterScroll(){//解决滑动与点击事件冲突的问题;2019.7.27.20:36
        var locked = false;
        window.addEventListener('touchmove', function(ev){
            locked || (locked = true, window.addEventListener('touchend', stopTouchendPropagation, true));
        }, true);
        function stopTouchendPropagation(ev){
            ev.stopPropagation();
            window.removeEventListener('touchend', stopTouchendPropagation, true);
            locked = false;
        }
    }
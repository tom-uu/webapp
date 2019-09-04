    function View(viewJson){
        var viewNode = null;
        return {
            "getNode" : function(){
                return viewNode;
            },"init" : function(){
                if(viewJson.hasOwnProperty("id")){
                    viewNode = document.getElementById(viewJson.id);
                }else if(viewJson.hasOwnProperty("node")){
                    viewNode = viewJson.node;
                }
                return viewNode;
            },"get" : function(className){
                return viewNode !== null ? viewNode.querySelector(className) : null;
            }
        };
    };

    function Model(type,getFuns,setFuns,createFuns){
        var get = null;
        var set = null;
        var create = null;
        if(typeof getFuns === "object"){
            get = getFuns;
        }
        if(typeof setFuns === "object"){
            set = setFuns;
        }
        if(typeof createFuns === "function"){
            create = createFuns;
        }
        if(type === "view"){
            return function(event){
                if(event === "get" && getFuns !== null){
                    return function(key){
                        return get[key]();
                    };
                }else if(event === "set" && setFuns !== null){
                    return function(key,data){
                        set[key](data);
                    };
                }else if(event === "new" && createFuns !== null){
                    return create;
                }
            };
        }else if(type === "item"){
            return function(event){
                if(event === "get" && getFuns !== null){
                    return function(target,key){
                        return get[key](target);
                    };
                }else if(event === "set" && setFuns !== null){
                    return function(target,key,data){
                        set[key](target,data);
                    };
                }else if(event === "new" && createFuns !== null){
                    return create;
                }
            };
        }else{
            return false;
        }
    }

    function Context(key){
        var trait = {};
        return {
            popInfo : {},
            getKey : function(){
                return key;
            },getTrait : function(key){
                return trait.hasOwnProperty(key) ? trait[key] : null;
            },setTrait : function(key,value){
                if(trait.hasOwnProperty(key)){
                    return false;
                }else{
                    trait[key] = value;
                    return true;
                }
            },reset : function(info,contextKey){
                if(trait.hasOwnProperty("reset") && trait["reset"].hasOwnProperty(contextKey)){
                    trait["reset"][contextKey](info);
                    return true;
                }else{
                    return false;
                }
            },setPopInfo : function(key,value){
                if((this.popInfo.hasOwnProperty(key) && this.popInfo[key] !== value) || !this.popInfo.hasOwnProperty(key)){
                    this.popInfo[key] = value;
                }
            }
        };
    }

    function Controller(fieldName){
        var globleContext = {};
        var contextTask = new Array();
        return {
            "field":fieldName,
            "getContextLen":function(){return contextTask.length;},
            "getGContext" : function(contextKey){
                return globleContext.hasOwnProperty(contextKey) ? globleContext[contextKey] : null;
            },"setGContext" : function(thisContext){
                var contextKey = thisContext.getKey();
                if(!globleContext.hasOwnProperty(contextKey)){
                    globleContext[contextKey] = thisContext;
                    return true;
                }else{
                    return false;
                }
            },"preContext" : function(){
                return contextTask.length > 1 ? contextTask[contextTask.length-2] : null;
            },"topContext" : function(){
                return contextTask[contextTask.length-1];
            },"pushContext" : function(thisContext){
                return contextTask.push(thisContext);
            },"popContext" : function(){
                return contextTask.pop();
            }
        };
    }

    function bodyLoading(){
        return loadingDisplay(document.body,"body-loading");
    }

    function tipView(flag,tipText){
        var tip = document.body.querySelector(".tip");
        var thisTip = null;
        if(tip !== null){
            if(flag){
                addClass(tip,"show_tip");
                thisTip = tip;
            }else{
                removeClass(tip,"show_tip");
            }
        }else if(flag){
            var newTip = document.createElement("div");
            newTip.innerHTML = "<div><span class=\"icon\" style=\"margin-right:8px;\">&#xe839</span><span></span></div>";
            addClass(newTip,"tip show_tip");
            newTip.addEventListener("click",function(e){
                if(e.target.nodeName === "DIV" || e.target.nodeName === "SPAN"){
                    removeClass(newTip,"show_tip");
                }
            });
            thisTip = newTip;
        }
        if(flag && thisTip !== null){
            thisTip.firstChild.children[1].innerHTML = tipText;
            setTimeout(function(){removeClass(thisTip,"show_tip");},"2000");
        }
        if(tip === null && thisTip !== null){
            document.body.appendChild(thisTip);
        }
    }

    function LoadCompView_C(compName){
        return function(callBack){
            var rmLoading = bodyLoading();
            requestServer("GET","/webapp/controllers/ViewAction.php/LoadView/"+compName+"/",null,function(resText){
                rmLoading();
                callBack(resText);
            });
        };
    }

    function LoadView_C(viewName,urlParamStr){
        return function(callBack){
            var rmLoading = bodyLoading();
            requestServer("GET","/webapp/controllers/"+viewName+"Action.php/LoadView"+urlParamStr,null,function(resData){
                rmLoading();
                callBack(resData);																			
            });
        };
    }
    
    function stopDefaultEvent(e){
        e.preventDefault ? e.preventDefault() : window.event.returnValue = false;
    }
    
    function touchmove(){
        document.body.addEventListener('touchmove', stopDefaultEvent,{passive: false});
    }

    function untouchmove() {
        document.body.removeEventListener('touchmove', stopDefaultEvent,{passive: false});
    }
    
    function ContentChange_I (controller){
        var context = controller.getGContext("sectionTouchMove");
        var funMap = {
            "contentShift" : context.getTrait("contentShift"),
            "recordScroll" : context.getTrait("recordScroll"),
            "setScroll" : context.getTrait("setScroll")
        };
        return function(key){
            return funMap[key];
        };
    }
    
    function SectionTouch_I(contentObj){
        var userContentTouchX = -1;
        var userContentTouchY = -1;
        var attriKey = "data-scroll";
        var recordScroll = function(content){
            content.setAttribute(attriKey,compatScrollY());
        };
        var setScroll = function(content){
             content.hasAttribute(attriKey) ? window.scrollTo(0,parseInt(content.getAttribute(attriKey))) : window.scrollTo(0,0);
        };
        var contentShift = function(moveX,moveY){
            if(checkSmallWin() && (Math.abs(moveX) > Math.abs(moveY))){
                var referBoxObj = contentObj.querySelector("div");
                var leftContent = referBoxObj.querySelector(".left_content");
                var rightContent = referBoxObj.querySelector(".right_content");
                if(leftContent !== null && rightContent !== null){
                    if(moveX > 0 && leftContent.offsetLeft < 0){
                        removeClass(rightContent,"move_right");
                        removeClass(leftContent,"move_left");
                        setScroll(leftContent);
                    }else if(moveX < 0 && leftContent.offsetLeft >= 0){	
                        recordScroll(leftContent);
                        addClass(leftContent,"move_left");
                        addClass(rightContent,"move_right");
                        setScroll(rightContent);
                    }
                }
            }
        };
        var eventCheck = function(e,callBack){
            var touchY = e.touches[0].clientY;
            if(touchY > 80){
                callBack(e.touches[0].clientX,touchY);
            }

        };
        var bodyTouchStart = function(e){
            eventCheck(e,function(touchX,touchY){
                userContentTouchX = touchX;
                userContentTouchY = touchY;
            });
        };
        var bodyTouchMove = function(e){
            if(!hasClass(contentObj,"noTouchMove")){
                var nodeName = e.target.nodeName;
                if(nodeName !== "BODY" && e.scrollWidth > e.clientWidth || nodeName === "SPAN" && e.target.className.search("mjx-") !== -1){
                    return false;
                }else{
                    eventCheck(e,function(touchX,touchY){
                        contentShift(touchX-userContentTouchX,touchY-userContentTouchY);
                    });
                }
            }
        };
        return {
            "setView" : function(controller){
                var thisContext = Context("sectionTouchMove");
                thisContext.setTrait("contentShift",contentShift);
                thisContext.setTrait("recordScroll",recordScroll);
                thisContext.setTrait("setScroll",setScroll);
                controller.setGContext(thisContext);
            },"event" : function(){
                document.body.addEventListener("touchstart",bodyTouchStart);
                document.body.addEventListener("touchmove",bodyTouchMove);
            },"removeEvent" : function(){
                document.body.removeEventListener("touchstart",bodyTouchStart);
                document.body.removeEventListener("touchmove",bodyTouchMove);
            }
        };
    }
    
    function NavCollapse_I(controller){
        var navBar = document.getElementById("navBar");
        var navToggleBtn = document.getElementById('nav_toggle');
        var listCollapseToggle = function(){   	
            if(!hasClass(navBar,"collapsing") && removeClass(navBar,"collapse") === 0){
                var listMaxHeight = navBar.offsetHeight;  	  	
                navBar.style.height = removeClass(navBar,"in") === 0 ? listMaxHeight+'px' : 0;    	  			  		 	  		  	  			 	  	  		 	  	  	  	  	
                window.requestAnimFrame(function(){  	  	  			  	  			  	  	  		 	  	  			
                        if(addClass(navBar,"collapsing") ===1){
                        navBar.offsetHeight>1 ? navBar.style.height=0 : navBar.style.height=listMaxHeight+'px';  	
                    }	  			 
                }); 	  	  		  	  			  	  	  	  	  	  	 	  	  	  	  	  	  		  	  		 	  	  
            }
        };
        var listTransEndToggle = function(){
            var referHeight = navBar.offsetHeight;//使用变量来记录下刚变换动画样式完成时的高度，以此高度为参考高度，以防止后续的操作高度变化后无法再参照有效的高度;2017.9.7.9:36写									
            if(referHeight>=1 && removeClass(navBar,"collapsing") === 0 && addClass(navBar,"collapse") === 1){
                if(referHeight>1 && addClass(navBar,"in")!==1){
                    return;
                }
                navBar.style.height='auto';																			
            }
        };
        var navToggleFun = function(){
            if(!hasClass(navBar,"collapsing")){					
               listCollapseToggle(navBar);				
            }
            controller.getGContext("navSearchView").getTrait("switchSearchElementPos")();
        };
        return {
            "setView" : function(){
                var thisContext = Context("navCollapse");
                thisContext.setTrait("navToggleFun",navToggleFun);
                controller.setGContext(thisContext);
            },"event" : function(transitionEndName){
                navToggleBtn.addEventListener("click",function(){
                    navToggleFun();							
                });
                navBar.addEventListener(transitionEndName,function(){			
                    listTransEndToggle();								
                });
            }
        };
    }

    function NavSearch_I(controller){
        var navSearchBtn = document.getElementById('searchButton');
        var navSearchInput = document.getElementById("searchInput");
        var navSearchCancelBtn = document.getElementById("searchCancelButton");
        var searchInputTransEnd = true;	
        var searchDefaultPositionChanged = false;
        var isOnSearch = false;
        var searchBottonFun = function(navMenuUl){
            if(hasClass(navSearchCancelBtn,"hide")){															
                if(!(addClass(navMenuUl,"hide") === 1 && removeClass(navSearchCancelBtn,"hide") === 0 && addClass(navSearchBtn,"on-search") === 1)){
                    alert("search toggle wrong!");
                }					
                if(searchInputTransEnd && addClass(navSearchInput,"inputMaxWidth") === 1){//以前的写法：toggleClass(navSearchInput,"inputMaxWidth") == 1 && searchInputTransEnd，这样写的话无论如何toggleClass(navSearchInput,"inputMaxWidth") == 1都要判断一次，即toggleClass(navSearchInput,"inputMaxWidth")，无论searchInputTransEnd的值为true还是false，将至少执行一次；这样的话并没有做到很好的动作屏蔽，正确的做法是当searchInputTransEnd的值为false时，toggleClass方法不能执行，所以根据与条件表达式的性质，只需调整两个表达式位置就可以了，如果第一个值为假将不再判断第二个值，直接跳出判断，按照这个思路来写条件判断才符合设计要求；2017.8.12.14:54写；		// && toggleClass(navSearchInput,"inputMaxWidth") == 1;2017.9.15.20:05;注释;
                    searchInputTransEnd = !searchInputTransEnd;		
                    if(!isOnSearch){//经过进一步划分问题域，精确化问题域边界，消减模糊化：进一步参照信号量的值做更精细化判断(之前是对onsearch没有做任何判断直接分别直接在navSearchButton.onclick和navSearchCancel.onclick的代码段里以赋值表达式控制，这样做就没有把问题域划分为更精确的单位，那么产生了各种问题，奇怪的显示问题(从根本上说，这是逻辑不严谨，逻辑分析不彻底，导致有些问题域的边界关系存在模糊，反映在代码执行上就出现功能无法完全实现的问题；2017.8.11.23:20写)；所以今后在求解问题时，要把问题域划分为最基本的单位，以减少出错的风险)，终于解决了首次点击取消按钮无反应的问题。2017.8.11.23:19写
                        isOnSearch = true;
                    }															
                }					
            }else{
                alert("search");
            }
        };
        var cancelBottonFun = function (){//为toggleClass增加了返回值，判断就能精细地多了，为问题域划分中的条件判断带了很大的遍历	；2017.8.11.23:06写				
            if(searchInputTransEnd && removeClass(navSearchInput,"inputMaxWidth") === 0){
                if(isOnSearch){
                    isOnSearch = false;
                }
                searchInputTransEnd = !searchInputTransEnd;											
            }
        };
        return {
            "setView" : function(){
                var thisContext = Context("navSearchView");
                thisContext.setTrait("switchSearchElementPos",function(){
                    var onSmallWin = checkSmallWin();
                    if(((!onSmallWin && searchDefaultPositionChanged) || (onSmallWin && !searchDefaultPositionChanged)) && switchSiblingPosition(navSearchBtn,navSearchInput,searchDefaultPositionChanged)){
                        searchDefaultPositionChanged = !searchDefaultPositionChanged;
                    }
                });
                controller.setGContext(thisContext);
            },"event" : function(transitionEndName){
                var navMenuUl = controller.getGContext("navMenuView").getTrait("navMenuUl");
                navSearchInput.addEventListener(transitionEndName,function(){												
                    if(!isOnSearch && !(addClass(navSearchCancelBtn,"hide") === 1 && removeClass(navSearchBtn,"on-search") === 0 && removeClass(navMenuUl,"hide") === 0)){			
                        alert("cancel toggle Wrong!");												 					 				
                    }
                    if(!searchInputTransEnd){
                        searchInputTransEnd = true;
                    }																									 										 
                },false);	
                navSearchBtn.addEventListener("click",function(){
                    searchBottonFun(navMenuUl);
                },false);   			
                navSearchCancelBtn.addEventListener("click",function(){
                    cancelBottonFun(navSearchInput);
                },false);
            }
        };
    }

    function NavMenu_I(controller){
        var contentNode = document.getElementById('content');
        var navViewNameNode = document.getElementById("navViewName");
        var navMenuUl = document.getElementById("navigation");
        var windowScrollContext = controller.getGContext("windowScroll");
        var navToggleFun = controller.getGContext("navCollapse").getTrait("navToggleFun");
        var navMenuMap = {
            "navCollect":{key:"collect",urlParam:"/0/10/",fun(container,pageData){
                    return CollectView(container,pageData);
                }
            },
            "navIssue":{key:"issue",urlParam:"/0/10/",fun:function(container,pageData){
                    return IssueView(container,pageData);
                }
            },
            "navDoc":{key:"doc",urlParam:"/0/10/",fun:function(container,pageData){
                    return DocView(container,pageData);
                }
            },
            "navMyInfo":{key:"myInfo"}
        };
        var setViewStyle = function(key){
            var cssPath = getViewCss(key);
            if(cssPath !== null){
                addCss(cssPath);
            }
        };
        var thisViewSet = null;
        var callView = function(navInfo,viewKey,fileData,callBack){
            var initView = function(){
                if(thisViewSet !== null){
                    thisViewSet.free();
                    thisViewSet = null;
                }
                thisViewSet = navInfo["fun"](contentNode,fileData["pageData"]);
                thisViewSet.init();
                callBack();
            };
            var pageHtml = fileData["html"];
            loadView(viewKey,contentNode,pageHtml,function(){
                initView(navInfo["fun"]);
            });
        };
        var loadViewFun = function(thisId,navToggleFun,callBack){
            if(navMenuMap.hasOwnProperty(thisId)){
                var thisNavInfo = navMenuMap[thisId];
                var viewKey = thisNavInfo.key;
                if(checkSmallWin() && typeof navToggleFun === "function"){
                    navToggleFun();
                }
                setViewStyle(viewKey);
                LoadView_C(thisId.slice(3),thisNavInfo.urlParam)(function(res){
                    if(res){
                        callView(thisNavInfo,viewKey,JSON.parse(res),callBack);
                    }
                });
            }
        };
        var setViewScrollFun = function(){
            var contentTab = contentNode.querySelector(".section-content-tab");
            windowScrollContext.getTrait("setTabNode")(contentTab);
        };
        var navMenuUl_I = function(e){
            if(e.target.nodeName === "A"){
                var menuBtn = e.target;
                var thisNode = menuBtn.parentNode;
                var checkedNavItem = navMenuUl.querySelector(".current");
                var thisId = menuBtn.id;
                if(checkedNavItem && thisNode !== checkedNavItem){
                    removeClass(checkedNavItem,"current");
                }
                if(thisId !== "navHome"){
                    addClass(thisNode,"current");
                    navViewNameNode.innerText = menuBtn.innerText;
                }else{
                    navViewNameNode.innerText = "";
                }
                loadViewFun(thisId,navToggleFun,setViewScrollFun);
            }
        };
        return {
            "setView" : function(){
                var thisContext = Context("navMenuView");
                thisContext.setTrait("navMenuUl",navMenuUl);
                controller.setGContext(thisContext);
                loadViewFun(navMenuUl.querySelector(".current").firstChild.id,null,setViewScrollFun);
            },"event" : function(){
                navMenuUl.addEventListener("click",navMenuUl_I);
            }
        };
    }

    function WindowScroll_I(controller){
        var contentTab = null;
        var contentNode = null;
        var contentScrollMarginTop = 0;
        var navObj = document.getElementById('outerNav');
        return {
            "setView" : function(){
                var thisContext = Context("windowScroll");
                thisContext.setTrait("setTabNode",function(tabNode){
                    contentTab = tabNode;
                    contentNode = contentTab.parentNode.children[1];
                    contentScrollMarginTop = contentNode.offsetTop;
                });
                controller.setGContext(thisContext);
            },"event" : function(){
                var lastScrollHeight=0;
                window.addEventListener("scroll",function(){
                    if(contentTab !== null){
                        var scrollY = compatScrollY();
                        var scrolledLength = scrollY - lastScrollHeight;
                        var tabTop = navObj.offsetHeight;
                        if(scrolledLength > 0 && tabTop <= scrollY){
                            addClass(contentTab,"scroll-top");
                            contentNode.style.marginTop = contentScrollMarginTop+"px";
                        }else if(scrolledLength < 0 && tabTop >= scrollY){
                            removeClass(contentTab,"scroll-top");
                            contentNode.removeAttribute("style");
                        }
                        lastScrollHeight = scrollY;
                    }
                });
            }
        };
    }

    function tagScroll(tagNode,scollClsName){
        var scrollEvent = function(){
            if(!checkSmallWin()){
                var scrollY = compatScrollY();
                scrollY-document.getElementById('outerNav').offsetHeight > 0 ? addClass(tagNode,scollClsName) : removeClass(tagNode,scollClsName);
            }
        };
        return {
            "addEvent":function(){
                window.addEventListener("scroll",scrollEvent);
            },"removeEvent":function(){
                window.removeEventListener("scroll",scrollEvent);
            }
        };
    }

    function NavUser_I(controller){
        var preScrollY = -1;
        var userList = document.getElementById("userList");
        var navUserImage = document.getElementById("userImage");
        var signOutTrigger = document.getElementById("signOutTrigger");
        var userNav = document.getElementById("userNav");
        var referSignObj = navUserImage.parentNode.parentNode.children[0];
        var setRightCover = function(){
            var body = document.body;
            var rightCover = body.querySelector(".right_cover");
            if(rightCover === null){
                rightCover = document.createElement("div");
                addClass(rightCover,"right_cover");
                body.appendChild(rightCover);
            }else{
                removeClass(rightCover,"hide");
            }
            addClass(body.querySelector(".section_content"),"noTouchMove");
            addClass(document.body,"noscroll");
        };
        var navUserToggleFun = function(){
            var toggleRes = toggleClass(userNav,"right_show");
            if(toggleRes === 0){
                var body = document.body;
                addClass(userList,"hide");
                removeClass(body,"noscroll");
                addClass(body.querySelector(".right_cover"),"hide");
                removeClass(body.querySelector(".section_content"),"noTouchMove");
                window.scrollTo(0,preScrollY);
                untouchmove();
            }else if(toggleRes === 1){
                touchmove();
                setRightCover();
                preScrollY = compatScrollY();
            }
        };
        return {
            "setView" : function(){
                var thisContext = Context("navUserView");
                thisContext.setTrait("navUserToggle",navUserToggleFun);
                thisContext.setTrait("userNav",userNav);
                controller.setGContext(thisContext);
            },"event" : function(transEndName){
                navUserImage.addEventListener("click",function(){
                    if(checkSmallWin()){
                        navUserToggleFun();							
                    }		
                });
                signOutTrigger.addEventListener("click",function(e){
                    requestServer("POST","/webapp/controllers/SignInAction.php/signOut/",null,function(res){					
                        res ? window.location.href="/webapp/index.php" : alert("sign out wrong!"); 						
                    });
                });
                userNav.addEventListener(transEndName,function(){
                    var body = document.body;
                    if(checkSmallWin() && this.offsetLeft < body.clientWidth){
                        var nameTip = userNav.querySelector(".uname-tip");
                        if(signInStatus() === 1){
                            removeClass(userList,"hide");
                        }
                        if(nameTip === null){
                            nameTip = document.createElement("div");
                            nameTip.innerText = getUserName();
                            addClass(nameTip,"uname-tip");
                            userNav.appendChild(nameTip);
                        }
                        hasClass(referSignObj,"hide");							
                    }
                },false);
            }
        };
    }
    
    function stopPropagation(event){
        var e = arguments.callee.caller.arguments[0] || event;
        e && e.stopPropagation ? e.stopPropagation() : window.event.cancelBubble = true;
    }
    
    function bodyDefaultEvent(flag){
        if(flag){
           document.body.removeEventListener('wheel',stopDefaultEvent); 
           document.body.removeEventListener('touchmove',stopDefaultEvent); 
        }else{
           document.body.addEventListener('wheel',stopDefaultEvent); 
           document.body.addEventListener('touchmove',stopDefaultEvent); 
        }
    }
    
    function overlay_i(opts){
        var o = new Object();
        o.defaults = {
            title: '',
            content: '',
            callBack : null
        };
        o.extend = function(dest, src) {
            for(var prop in src){
                if(src.hasOwnProperty(prop)){
                    dest[prop] = src[prop];
                }
            }
            return dest;
        };
        o.opts = o.extend(o.defaults,opts);
        o.template = function() {
            var title = "<div class='overlay-header'>" + o.opts.title + "<div id='overlay-close'>&times;</div></div>";
            var content = "<div class='overlay-content'>" + o.opts.content + "</div>";
            var footer = "<div class='overlay-footer'><button id='overlay-ok'>确定</button><button id='overlay-cancel'>取消</button></div>";
            var _overlay = document.createElement("div");
            _overlay.setAttribute("id","Overlay");
            _overlay.innerHTML = "<div class='overlay-mask'></div><div class='overlay-inner'>" + title + content + footer + "</div>";
            return _overlay;
        };
        o.bindEvents = function() {
            var _overlay = document.getElementById("Overlay");
            document.getElementById("overlay-close").addEventListener("click", function(e) {
                e.preventDefault();
                _overlay.style.display = "none";
                if(o.opts.callBack !== null){
                    o.opts.callBack = null;
                }
                bodyDefaultEvent(true);
            });
            document.getElementById("overlay-ok").addEventListener("click", function(e) {
                e.preventDefault();
                _overlay.style.display = "none";
                if(typeof o.opts.callBack === 'function'){
                    o.opts.callBack();
                    o.opts.callBack = null;
                }
                bodyDefaultEvent(true);
            });
            document.getElementById("overlay-cancel").addEventListener("click", function(e) {
                e.preventDefault();
                _overlay.style.display = "none";
                if(o.opts.callBack !== null){
                    o.opts.callBack = null;
                }
                bodyDefaultEvent(true);
            });
        };
        o.init = function(){
            var layout = o.template();
            if(document.getElementById("Overlay") === null){
                document.body.appendChild(layout);
                o.bindEvents();
            }else{
                var overlay = document.getElementById("Overlay");
                overlay.children[1].children[0].firstChild = o.opts.title;
                overlay.children[1].children[1].innerText = o.opts.content;
            }
            return (function(){
                document.getElementById("Overlay").style.display = "block";
                bodyDefaultEvent(false);
            })();					
        };
        return o;
    }

    window.onload=function(){
        var userContainer = document.getElementById("userContainer");
        var clickEvent = document.createEvent('MouseEvents');
        var mouseoutEvent = document.createEvent('MouseEvents');
        clickEvent.initEvent("click", true, true);
        clickEvent.eventType = 'message';
        mouseoutEvent.initEvent("mouseout", true, true);
        mouseoutEvent.eventType = 'message';

        var transitionEndName = checkTransitionEndName();
        var controller = Controller();
        var navSearchInterac = NavSearch_I(controller);
        var navCollapseInterac = NavCollapse_I(controller);
        var windowScrollInterac = WindowScroll_I(controller);
        var navUserInterac = NavUser_I(controller);
        navSearchInterac.setView();
        navCollapseInterac.setView();
        windowScrollInterac.setView();
        var navMenuInterac = NavMenu_I(controller);
        navMenuInterac.setView();
        navUserInterac.setView();
        navSearchInterac.event(transitionEndName);
        navCollapseInterac.event(transitionEndName);
        windowScrollInterac.event();
        navMenuInterac.event();
        navUserInterac.event(transitionEndName);

        var navUserToggleFun = controller.getGContext("navUserView").getTrait("navUserToggle");
        var userNav = controller.getGContext("navUserView").getTrait("userNav");
        
        window.onresize = function(){
            if(!checkSmallWin() && hasClass(userNav,"right_show")){
                navUserToggleFun();
            }
            controller.getGContext("navSearchView").getTrait("switchSearchElementPos")();											
        };

        window.setDialogBox = function(setDataObj){
            if(window.overlay){
                window.overlay.extend(window.overlay.opts,setDataObj);
                window.overlay.init();
            }else{					
                window.overlay = overlay_i(setDataObj);
                window.overlay.init();
            }		
        };

        if('addEventListener' in document) {
            document.addEventListener('DOMContentLoaded', function(){
                FastClick.attach(document.body);
            }, false);
        }
        window.checkPlatform = (function(){
            return navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i) ? "mobile" : "pc";
        })();
        /*function addScript(src, cb) {
            var script = document.createElement("script");  // 穿件一个script 标签
            script.src = src;  // 把script的src设置为我们请求数据的地址并传递参数 和回调函数
            document.head.appendChild(script); // 把script 插入到body里面
            setTimeout(function (ev) {
                if (cb) cb();
            }, 500);
        }
        addScript('https://www.maxmon.top/html5_iat/js/mmHelper.js'); // 天奇精灵（我放在服务器上的可以直接使用的版本）
        addScript('https://www.maxmon.top/visit?code=10086'); // 访问记录助手（这个脚本与本项目无关，混个脸熟）*/
        stopTouchendPropAfterScroll();
    };
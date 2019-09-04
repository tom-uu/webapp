<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>登陆净虑</title>
<link type="text/css" href="/webapp/css/sign.css" rel="stylesheet" />
<script type="text/javascript" src="/webapp/script/lib/common.js"></script>
<script type="text/javascript" src="/webapp/script/lib/jsencrypt.min.js"></script>
<script type="text/javascript">
    function Context(key){
        var trait = {};
        this.getKey = function(){
            return key;
        };
        this.getTrait = function(key){
           return trait.hasOwnProperty(key) ? trait[key] : null;
        };
        this.setTrait = function(key,value){
            if(trait.hasOwnProperty(key)){
                return false;
            }else{
                trait[key] = value;
                return true;
            }
        };
    }
        
    function ViewController(){
        var globleContext = {};
        this.getGContext = function(contextKey){
            return globleContext.hasOwnProperty(contextKey) ? globleContext[contextKey] : null;
        };
        this.setGContext = function(thisContext){
            var contextKey = thisContext.getKey();
            if(!globleContext.hasOwnProperty(contextKey)){
                globleContext[contextKey] = thisContext;
                return true;
            }else{
                return false;
            }
        };
    }
    
    function VertifySignContext(urlStr,data){
        this.process = function(callBack){
            requestServer("POST",urlStr,JSON.stringify(data),function(res){
                callBack(res);
            });
        };
    }
    
    function getPreSibling(referNode){
        var node = null;
        for(var previousNode = referNode.previousSibling;previousNode;previousNode = previousNode.previousSibling){
            if(previousNode.nodeType === 1){
                node = previousNode;
                break;
            }
        }
        return node;
    }
    
    function getNextSibling(referNode){
        var node = null;
        for(var nextNode = referNode.nextSibling;nextNode;nextNode = nextNode.nextSibling){
            if(nextNode.nodeType === 1){
                node = nextNode;
                break;
            }
        }
        return node;
    }
    
    function getPbKey(){
        return "<?php $publicKey = "-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrJAJNVSmDru+zjUQtQYbDL0Xv0RAvtzzroD52dzBCSyycHEO3Pwy36eVuQ/dEU/AAoFXaXTGawToy1yTFLvFPJB5FQv+CUscaz+KsJcEsJ/d8Vf3TTRrMqxng+uniiUZxOIcNFTrVg2BeMKNCczEcp7Md2o9dT2+Di+FM9uudGwIDAQAB-----END PUBLIC KEY-----";setrawcookie("pubKey",$publicKey,0,"/webapp/",null,null,true); echo $publicKey;?>";
    }
    
    (function(){
	var publicKey = getPbKey();
	var okTip = "\u2713";
	var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initEvent("click", true, true);
        clickEvent.eventType = 'message';
        var blurEvent = document.createEvent('MouseEvents');
        blurEvent.initEvent("blur", true, true);
        blurEvent.eventType = 'message';
        
        var viewController = new ViewController();
        
	function encryptFun(data){
            if(data && publicKey){//使用后台传来的公钥保存在cookie中，前台从cookie中获取；2017.8.22.22:34写
                // Create the encryption object.
                var crypt = new JSEncrypt();			  		
                crypt.setPublicKey(publicKey);
                var encryptData = crypt.encrypt(data);
                return encodeURI(encryptData).replace(/\+/g, '%2B');
            }	  
            else{
                console.error("无法加密数据,未发现数据或密钥");
                return;
            }		
	}
        
        function SignInInteraction(){
            var thisForm = document.getElementById("signIn-form");
            var signInBox = thisForm.parentNode;
            var submitBtn = document.getElementById("signIn-submit-button");
            var signup_trigger = document.getElementById('signUp-entry');
            var usernameInput = thisForm.querySelector('input[name="username"]');
            var userpwdInput = thisForm.querySelector('input[name="userpwd"]');
            var checkValue = {
                "username":function(nameValue){
                    return trim(nameValue).length > 0 ? true : "用户名不能为空";
                },"userpwd":function(pwdValue){
                    var thisValue = trim(pwdValue);
                    var checkRes = true;
                    if(thisValue.length === 0){
                        checkRes = "密码不能为空";
                    }else if(thisValue.length < 6 && thisValue.length > 20){
                        checkRes = "密码长度需在6到20间";
                    }
                    return checkRes;
                }
            };
            var submitCheck = function(addTip){
                var data = {};
                var userNameInputValue = usernameInput.value;
                var userPwdInputValue = userpwdInput.value;
                var usernamecheckRes = checkValue["username"](userNameInputValue);
                var userpwdcheckRes = checkValue["userpwd"](userPwdInputValue);
                usernamecheckRes === true ? data.username = encryptFun(userNameInputValue) : addTip(usernameInput,usernamecheckRes);
                userpwdcheckRes === true ? data.userpwd = encryptFun(userPwdInputValue) : addTip(userpwdInput,userpwdcheckRes);
                return data.hasOwnProperty("username") && data.hasOwnProperty("userpwd") ? data : null;
            };
            var checkSignInfo = function(data,addTip){
                var vertifySignContext = new VertifySignContext(thisForm.action,data);
                vertifySignContext.process(function(res){
                    var resInfo = JSON.parse(res);
                    if(resInfo.hasOwnProperty("username")){
                        var usernameRes = resInfo.username;
                        if(usernameRes !== true){
                            addTip(usernameInput,"用户名不存在");
                        }else if(resInfo.hasOwnProperty("userpwd")){
                            var userpwdRes = resInfo.userpwd;
                            if(userpwdRes !== true){
                                addTip(userpwdInput,"密码错误");
                            }else{
                                
                                window.location.href="/webapp/index.php";
                            }
                        }
                    }else if(resInfo.hasOwnProperty("docDb")){
                        alert("文档库创建失败，账户没有创建");
                    }
                });
            };
            this.setView = function(){
                var thisContext = new Context("signInView");
                thisContext.setTrait("signInBox",signInBox);
                viewController.setGContext(thisContext);
            };
            this.event = function(){
                var signUpBox = viewController.getGContext("signUpView").getTrait("signUpBox");
                var signUpFun = function(){
                    addClass(signInBox,"hide");
                    removeClass(signUpBox,"hide");
                };
                var reqObj = getRequest();
                if(reqObj.req === 'signup'){
                    signUpFun();
                }
                var inputVertifyInterac = new InputVertifyInteraction(thisForm);
                var addTip = inputVertifyInterac.addTip;
                inputVertifyInterac.event();
                submitBtn.addEventListener("click",function(){
                    var data = submitCheck(addTip);
                    if(data !== null){
                        checkSignInfo(submitCheck(addTip),addTip);
                    }
                });
                signup_trigger.addEventListener("click",function(){
                    signUpFun();
                });
            };
        };

        function SignUpInteraction(){
            var thisForm = document.getElementById("signUp-form");
            var signUpBox = thisForm.parentNode;
            var signin_trigger = document.getElementById("signIn-entry");
            var submitBtn = document.getElementById("signUp-submit-button");
            var checkValue = {
                "username":function(inputValue){
                    if(trim(inputValue.length) === 0){
                        return "用户名不能为空";
                    }else{
                        if(!isNaN(inputValue[0])){
                            return "用户名不能以数字开头";
                        }else if(!/[a-z]/i.test(inputValue)){
                            return "用户名中需包含字母";
                        }else if(inputValue.indexOf(" ") !== -1){
                            return "用户名不能包含空格";
                        }
                        return true;
                    }
                },"userpwd":function(inputValue){
                    return inputValue.length === 0 ? "密码不能为空" : (inputValue.length < 6 || inputValue.length > 20 ? "密码长度需在6到20位之间" : true);
                },"confirmpwd":function(pwdValue,confirmPwdValue){									
                    return pwdValue.length === 0 ? "" : (pwdValue === confirmPwdValue ? true : "密码不匹配");	 
                },"email":function(inputValue){
                    return inputValue.length === 0 ? "邮箱不能为空" : (inputValue.match(/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/) ? true : "邮箱格式不正确");
                }
            };
            var sendData = function(urlStr,data,callBack){
                var vertifySignContext = new VertifySignContext(urlStr,data);
                vertifySignContext.process(function(res){
                    var resInfo = JSON.parse(res);
                    if(resInfo.hasOwnProperty("username")){
                        callBack(false);
                    }else if(resInfo.hasOwnProperty("rows")){
                        if(resInfo["rows"]){
                            window.location.href="/webapp/views/signUpSuccess.html";
                        }else{
                            alert("注册失败");
                        }
                    }
                });
            };
            var submitCheck = function(addTip){
                var data = {};
                var inputs = thisForm.querySelectorAll("input");
                for(var i=0,len=inputs.length;i<len;i++){
                    var thisInput = inputs[i];
                    var thisName = thisInput.name;
                    var thisValue = trim(thisInput.value);
                    if(thisName !== "confirmpwd"){
                        var checkRes = checkValue[thisName](thisValue);
                        var tipText = checkRes === true ? okTip : checkRes;
                        if(checkRes === true){
                            data[thisName] = encryptFun(thisValue);
                        }
                        addTip(thisInput,tipText);
                    }else{
                        var pwdValue = trim(getPreSibling(thisInput.parentNode).querySelector("input").value);
                        var checkRes = checkValue["confirmpwd"](pwdValue,thisValue);
                        var tipText = checkRes === true ? okTip : checkRes;
                        addTip(thisInput,tipText);
                    }
                }
                if(Object.keys(data).length === inputs.length-1){
                    sendData(thisForm.action,data,function(usernameflag){
                        if(usernameflag === false){
                            addTip(inputs[0],"此用户名已注册");
                        }
                    });
                }
            };
            this.setView = function(){
                var thisContext = new Context("signUpView");
                thisContext.setTrait("signUpBox",signUpBox);
                viewController.setGContext(thisContext);
            };
            this.event = function(){
                var signInBox = viewController.getGContext("signInView").getTrait("signInBox");
                var inputVertifyInterac = new InputVertifyInteraction(thisForm);
                var addTip = inputVertifyInterac.addTip;
                inputVertifyInterac.event();
                submitBtn.addEventListener("click",function(){
                    submitCheck(addTip);
                });
                signin_trigger.addEventListener("click",function(){			
                    addClass(signUpBox,"hide");
                    removeClass(signInBox,"hide");
                });
            };  
        };
        
        function InputVertifyInteraction(formNode){
            this.addTip = function(thisInput,tipText){//若没有包含提示信息元素节点则创建一个元素节点，并把元素节点插入到该区域的最后一个位置；否则的话仅改变其value就可以了；2017.8.18.13:43写 		
                var tipNode = getNextSibling(thisInput);
                if(typeof tipText === "undefined"){
                    if(tipNode !== null && tipNode.innerText.length > 0){
                        addClass(tipNode,"is-visible");
                    }
                }else if(tipText !== null){
                    if(tipNode === null){
                        var tipNode = document.createElement("I");
                        tipNode.innerText = tipText;
                        addClass(tipNode,"text-tip");
                        thisInput.parentNode.appendChild(tipNode);
                    }else if(tipNode.innerText !== tipText){
                        tipNode.innerText = tipText;
                    }
                    addClass(tipNode,"is-visible");
                }else{
                    removeClass(tipNode,"is-visible");
                }
                return tipNode;
            };
            this.event = function(){
                var addTip = this.addTip;
                var inputs = formNode.querySelectorAll("input");
                var submitBtn = formNode.querySelector(".submit");
                for(var i=0,len=inputs.length;i<len;i++){
                    var thisInput = inputs[i];
                    thisInput.value = "";
                    thisInput.addEventListener("focus",function(){
                        addTip(this,null);
                        removeClass(this,"lightFont");		
                        addClass(this.parentNode,"inputFocusStyle");	
                        addClass(this.parentNode.children[0],"onfocus");
                    });
                    thisInput.addEventListener("blur",function(){
                        addClass(this,"lightFont");						
                        removeClass(this.parentNode,"inputFocusStyle");
                        removeClass(this.parentNode.children[0],"onfocus");
                    });
                    thisInput.addEventListener("keydown",function(e){
                        var keynum = window.event ? e.keyCode : e.which ? e.which : -1; //Netscape/Firefox/Opera,使用e.which获取键盘码；IE使用e.keyCode获取键盘码;2017.8.22.10:05写
                        if(keynum === 13){
                            submitBtn.dispatchEvent(clickEvent);
                        }else if(keynum === 38 || keynum === 40){
                            var changeFiled = keynum === 38 ? getPreSibling(this.parentNode) : getNextSibling(this.parentNode);
                            if(changeFiled !== null){
                                var changeFiledInput = changeFiled.querySelector("input");
                                if(changeFiledInput){
                                        changeFiledInput.focus();
                                }
                            }
                        }
                    });
                }
                formNode.addEventListener("click",function(e){
                    if(e.target.nodeName === "I" && hasClass(e.target,"text-tip")){
                        removeClass(e.target,"is-visible");
                        getPreSibling(e.target).focus();
                    }
                });
            };
        }
        
        function setCanvas(){
            var canvasScript = document.createElement("script");
            canvasScript.type = "text/javascript";
            canvasScript.src = "/webapp/script/lib/canvas-nest.min.js";
            canvasScript.setAttribute("color","153,153,153");
            canvasScript.setAttribute("opacity","0.8");
            canvasScript.setAttribute("zIndex","-2");
            canvasScript.setAttribute("radius","2");
            canvasScript.setAttribute("maxLine","2e4");
            document.documentElement.clientWidth < 756 ? canvasScript.setAttribute("count","15") : canvasScript.setAttribute("count","30");
            document.body.appendChild(canvasScript);
        }
        
        window.onload=function(){	
            var signInInterac = new SignInInteraction();
            var signUpInterac = new SignUpInteraction();
            signInInterac.setView();
            signUpInterac.setView();
            signInInterac.event();
            signUpInterac.event();
            setCanvas();
        };
    })();
</script>
</head>
<body>
<div class="signContainer">
    <h1 class="lean">净虑</h1>
    <div class="sign">				
        <div id="signBox" class="sign-oper">
            <div class="signIn">
                <form id="signIn-form" name="signIn-info" action="/webapp/controllers/SignInAction.php/signIn">
                    <div class="input-div">
                        <label class="icon-box"><span class="icon-user-m"></span></label><!-- @font-face字体，用来进行web设计很合适，不用再为icon问题烦恼了，i标签中的代码是从fontello.com的demo中直接下载的html中写的，只是照写了过来；2017.8.7.20:55写 -->
                        <input class="txt" id="signIn-username" type="text" name="username" placeholder="用户名"/><!-- 通过设置placeholder的值可以达到显示提示字符的目的；2017.8.7.14:41写 -->
                    </div>
                    <div class="input-div">
                        <label class="icon-box"><span class="icon-lock-on-m"></span></label><!-- @font-face字体，用来进行web设计很合适，不用再为icon问题烦恼了，i标签中的代码是从fontello.com的demo中直接下载的html中写的，只是照写了过来；2017.8.7.20:55写 -->
                        <input class="txt" id="signIn-password" type="password" name="userpwd" placeholder="密码"/>
                    </div>
                    <div class="sign-button-div">
                        <a id="signIn-submit-button" class="submit" href="#">登陆</a>
                    </div>		     		 
                </form>		
                <div class="sign-other">
                    <a id="forgetPassword-entry" href="#">忘记密码?</a>
                    <a id="signUp-entry" href="#">注册</a>
                </div>      	 
            </div>
            <div class="signUp hide">
                <form id="signUp-form" name="signUp-info" action="/webapp/controllers/SignUpAction.php/signUp">
                    <div class="input-div">
                        <label class="icon-box"><span class="icon-user-m"></span></label>
                        <input class="txt" id="signUp-username" type="text" name="username" placeholder="用户名"/>
                    </div>
                    <div class="input-div">
                        <label class="icon-box"><span class="icon-lock-off-m"></span></label>
                        <input class="txt" id="signUp-pwd" type="password" name="userpwd" placeholder="密码"/>
                    </div>
                    <div class="input-div">
                        <label class="icon-box"><span class="icon-lock-on-m"></span></label>
                        <input class="txt" id="signUp-confirmPwd" type="password" name="confirmpwd" placeholder="确认密码" />
                    </div>
                    <div class="input-div">
                        <label class="icon-box"><span class="icon-envelope-m"></span></label>
                        <input class="txt" id="signUp-email" type="text" name="email" placeholder="邮箱" />
                    </div>
                    <div class="sign-button-div"><a id="signUp-submit-button" class="submit" href="#">注册</a></div> 
                </form>
                <div class="sign-other">
                    <a id="agreement-entry" href="#">用户协议</a>
                    <a id="signIn-entry" href="#">登陆</a>
                </div>
            </div>			     	     
        </div>		
    </div>
</div>
</body>
</html>
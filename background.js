var cookieUrl = '';
var urltoken = '';
var urlusername = '';
var urlpassword = '';
var urltitle = '';
var urlputflag = '';
var cookieDate = [];
var tabId = '';
var reLoginname = '';
var reLoginpwd = '';
var urlcookieover = '';
var Apiurl = "http://pubdata.sjgo58.com";
var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 1;
var oneWeekAgo = (new Date()).getTime() - millisecondsPerWeek;

function onLogin(username,token,cookies){
  localStorage.setItem("flagname",username);
  localStorage.setItem("flagtoken",token);
  localStorage.setItem("flagcookies",cookies);
  reLoginname = '';
  reLoginpwd = '';
  chrome.browsingData.removeCookies({
    "since": oneWeekAgo
  }, function(e){
    let url = "https://mp.weixin.qq.com/cgi-bin/home?t=home/index&lang=zh_CN&token="+token;
    cookieDate=JSON.parse(cookies);
    for(let i=0;i<cookieDate.length;i++){
    chrome.cookies.set({
      url: url, 
      name: cookieDate[i].name,
      value: cookieDate[i].value, 
      domain:cookieDate[i].domain,
      path:cookieDate[i].path,
      storeId:cookieDate[i].storeId,
    })
  }
  chrome.tabs.create({url:url, active: true},function(){
    localStorage.setItem("flagname","");  
    localStorage.setItem("flagtoken","");
    localStorage.setItem("flagcookies","");
  })
});  
}
// //点击tab重置cookie
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {});

chrome.tabs.onActivated.addListener(function(call){
  tabId = call.tabId;
  sendMsg();
  var pushflag = true;
  var flagname = localStorage.getItem("flagname") ? localStorage.getItem("flagname") : '';
  var flagtoken = localStorage.getItem("flagtoken") ? localStorage.getItem("flagtoken") : '';
  var flagcookies = localStorage.getItem("flagcookies") ? localStorage.getItem("flagcookies") : '';
  var tabArr = JSON.parse(localStorage.getItem("tabArr")) ? JSON.parse(localStorage.getItem("tabArr")) : [];
    for(let i=0;i<tabArr.length;i++){
      if(tabId == tabArr[i].tabId){
        chrome.browsingData.removeCookies({
          "since": oneWeekAgo
        }, function(e) {
          let url = "https://mp.weixin.qq.com/cgi-bin/home?t=home/index&lang=zh_CN&token="+flagtoken;
          let resetcookie=JSON.parse(tabArr[i].flagcookies);
          for(let i=0;i<resetcookie.length;i++){
            chrome.cookies.set({
              url: url, 
              name: resetcookie[i].name,
              value: resetcookie[i].value, 
              domain:resetcookie[i].domain,
              path:resetcookie[i].path,
              storeId:resetcookie[i].storeId,
                })
              }
            })
            pushflag = false;
            return;
          }
      }
    if(pushflag && flagname!=""){
      var addtabArr = {
        "flagname":flagname,
        "tabId" : tabId,
        "flagtoken" : flagtoken,
        "flagcookies" : flagcookies,
      };
      tabArr.push(addtabArr);
      localStorage.setItem("tabArr",JSON.stringify(tabArr));
    }
})

function sendMsg(){
    reLoginname = localStorage.getItem("username");
    reLoginpwd = localStorage.getItem("password");
    if(reLoginname != ""){
        setTimeout(() => {  
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs){ 
          chrome.tabs.sendMessage(tabId, {name:reLoginname,pwd:reLoginpwd,putflag:"1"}, function(response) {
            localStorage.setItem("username","");
            localStorage.setItem("password","");
          });
        })}, 1500);
    }
}
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    cookieUrl = request.url;
    urltoken = request.token;
    urlusername = request.username;
    urlpassword = request.password;
    urltitle = request.title;
    urltitleimg = request.titleimg;
    urlputflag = request.putflag;
    urlcookieover = request.cookieover;
    if(urlcookieover == "1"){
      chrome.browsingData.removeCookies({
        "since": oneWeekAgo
      });
      let userinfo = [{
        username:localStorage.getItem("cookiename"),
        password:localStorage.getItem("cookiepwd")
      }];
      sendResponse(userinfo);
    }
    if(urltoken != ''){
      if(urlputflag=="1"){
        updateToken();
      }else{
        save();
      }
    }
});

function updateToken(){
  if(urlputflag!=""){
    chrome.cookies.getAll({url:cookieUrl},(cookie)=>{
      var myDate = new Date();
      var y = myDate.getFullYear(); 
      var mon = myDate.getMonth()+1; 
      var d = myDate.getDate();
    $.ajax({
      type:"put",
      url: Apiurl+"/api/DataCube/PutWechatAccout",
      data:JSON.stringify({
        "username" :urlusername,
        "displayName" :urltitle,
        "token":urltoken,
        "cookie":JSON.stringify(cookie),
        "lastLoginTime":myDate
      }),
      headers: {
        "content-Type":"application/json",
      },
      beforeSend: function (XMLHttpRequest) {
        XMLHttpRequest.setRequestHeader('Authorization', "Bearer "+ localStorage.getItem("accessToken"));
      },
      success:function(data){
        //alert(JSON.stringify(data))
        var tabArr = JSON.parse(localStorage.getItem("tabArr")) ? JSON.parse(localStorage.getItem("tabArr")) : [];
        for(let i=0;i<tabArr.length;i++){
          if(tabArr[i].flagname == urlusername){
            tabArr[i].flagtoken == urltoken;
            tabArr[i].flagcookies == JSON.stringify(cookie);
          }
        }
        var addtabArr = {
          "flagname":urlusername,
          "tabId" : tabId,
          "flagtoken" : urltoken,
          "flagcookies" : JSON.stringify(cookie),
        };
        tabArr.push(addtabArr);
        localStorage.setItem("tabArr",JSON.stringify(tabArr));
        dataInit();
      },
      error:function(err){
        //alert(JSON.stringify(err))
      }
    })
  })
}
}

function save(){
  if(cookieUrl !=""){
      chrome.cookies.getAll({url:cookieUrl},(cookie)=>{
        var myDate = new Date();
        var y = myDate.getFullYear(); 
        var mon = myDate.getMonth()+1; 
        var d = myDate.getDate();
        $.ajax({
          type:"post",
          url: Apiurl+"/api/DataCube/PostWechatAccout",
          data:JSON.stringify({
            "userName" :urlusername,
            "password":urlpassword,
            "displayName":urltitle,
            "token":urltoken,
            "cookie":JSON.stringify(cookie),
            "lastLoginTime":myDate
          }),
          headers: {
            "content-Type":"application/json",
          },
          beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader('Authorization', "Bearer "+ localStorage.getItem("accessToken"));
          },
          success:function(res){
            if(res.result.success){
              var tabArr = JSON.parse(localStorage.getItem("tabArr")) ? JSON.parse(localStorage.getItem("tabArr")) : [];
              var addtabArr = {
                "flagname":urlusername,
                "tabId" : tabId,
                "flagtoken" : urltoken,
                "flagcookies" : JSON.stringify(cookie),
              }
              tabArr.push(addtabArr);
              localStorage.setItem("tabArr",JSON.stringify(tabArr));
              dataInit();
            }else if(res.result.msg == "该账号已存在"){
              urlputflag = 1;
              updateToken();
            }
          },
          error:function(err){
            //alert(JSON.stringify(err))
          }
        })
      })
  }
}

function dataInit(){
  cookieUrl = '';
  urltoken = '';
  urlusername = '';
  urlpassword = '';
  urltitle = '';
  urltitleimg = '';
  urlputflag = '';
  urlcookieover = '';
}

function addUser() {
  localStorage.setItem("username","");
  localStorage.setItem("password","");
  let url = "https://mp.weixin.qq.com";
  chrome.browsingData.removeCookies({
    "since": oneWeekAgo
  }, function(e){
    chrome.tabs.create({url: url, active: true });
  });
}

function reLogin(username,password){
  //重新登录
    localStorage.setItem("username",username);
    localStorage.setItem("password",password);
    let url = "https://mp.weixin.qq.com";
    chrome.browsingData.removeCookies({
      "since": oneWeekAgo
    }, function(e){
      chrome.tabs.create({url: url, active: true });
    });
}
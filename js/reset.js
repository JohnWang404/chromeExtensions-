
function GetQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if(r != null) return unescape(r[2]);
  return null;
}

function injectPage() {
    var urltoken = GetQueryString('token');
    var username = localStorage.getItem("username") ? localStorage.getItem("username") : '';
    var password = localStorage.getItem("password") ? localStorage.getItem("password") : '';
    var putflag = localStorage.getItem("putflag") ? localStorage.getItem("putflag") : '';
    if(urltoken && username != ''){
        var title = $(".skin_pop_bd a").attr("title");
        var titleimg = '';
      if(title == undefined){
        title = $(".weui-desktop-account__info a").eq(1).text();
        titleimg = "https://mp.weixin.qq.com"+$(".weui-desktop-account__info a img").attr("src");
      }
      chrome.runtime.sendMessage({url: window.location.href,token:urltoken,username:username,password:password,title:title,titleimg:titleimg,putflag:putflag}, function(response) {        
        console.log(response);
        localStorage.setItem("username","");
        localStorage.setItem("putflag","");
    });
    }
}

function cookieout(){
  cookietimeout = setTimeout(() => {
    if($("#info").text() == '登录超时，'){
      chrome.runtime.sendMessage({cookieover:"1"}, function(response) { 
        localStorage.setItem("cookieusername",response[0].username);
        localStorage.setItem("cookiepassword",response[0].password);
        localStorage.setItem("timeover","1");
        window.location = "https://mp.weixin.qq.com/";
    });
    }
  },1000)
}

function autoLogin(){
  // 自动填充用户名密码
    var putflag = localStorage.getItem("timeover") ? localStorage.getItem("timeover") : "";
    if(putflag == 1){
      var name = localStorage.getItem("cookieusername");
      var pwd = localStorage.getItem("cookiepassword");
      $("input[name='account']").val(name);
      $("input[name='account']")[0].dispatchEvent(new Event('input'));
      $("input[name='password']").val(pwd);
      $("input[name='password']")[0].dispatchEvent(new Event('input'));
      localStorage.setItem("username",$("input[name='account']").val());
      localStorage.setItem("password",$("input[name='password']").val());
      // $(".login_btn_panel a")[0].click()
      localStorage.setItem("timeover","");
      localStorage.setItem("cookieusername","");
      localStorage.setItem("cookiepassword","");
    }
}


window.onload = function(){
  injectPage();
  cookieout();  
}
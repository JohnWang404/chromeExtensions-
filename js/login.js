function firstLogin(){
  var cookieusername = localStorage.getItem("cookieusername") ? localStorage.getItem("cookieusername") : '';
  var cookiepassword = localStorage.getItem("cookiepassword") ? localStorage.getItem("cookiepassword") : '';
  if(cookieusername!=''){
    $("input[name='account']").val(cookieusername);
    $("input[name='account']")[0].dispatchEvent(new Event('input'));
    $("input[name='password']").val(cookiepassword);
    $("input[name='password']")[0].dispatchEvent(new Event('input'));
    localStorage.setItem("username",$("input[name='account']").val());
    localStorage.setItem("password",$("input[name='password']").val());
    //$(".login_btn_panel a")[0].click()
    localStorage.setItem("cookieusername",'');
    localStorage.setItem("cookiepassword",'');
  }else{
    $(document).keyup(function(event){
      if(event.keyCode ==13){
        localStorage.setItem("username",$("input[name='account']").val());
        localStorage.setItem("password",$("input[name='password']").val());
      }
    });
    $(".btn_login").click(function(){
      localStorage.setItem("username",$("input[name='account']").val());
      localStorage.setItem("password",$("input[name='password']").val());
    })
}
}

chrome.extension.onMessage.addListener(
function(request, sender, sendResponse) {
    sendResponse("requestname");
    console.log(request.name);
    if(request.name!=''){
      autoLogin(request.name,request.pwd);
      localStorage.setItem("putflag",request.putflag);
    }
}
);

function autoLogin(name,pwd){
  //自动填充用户名密码
  $("input[name='account']").val(name);
  $("input[name='account']")[0].dispatchEvent(new Event('input'));  
  $("input[name='password']").val(pwd);
  $("input[name='password']")[0].dispatchEvent(new Event('input'));
  localStorage.setItem("username",$("input[name='account']").val());
  localStorage.setItem("password",$("input[name='password']").val());
  $(".login_btn_panel a")[0].click();
}
window.onload = function(){
  firstLogin();
}
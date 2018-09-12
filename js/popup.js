var Apiurl = "http://pubdata.sjgo58.com";
var accessToken = '';
window.onload = function(){
  login();
}
//login
function login(){
  accessToken = localStorage.getItem("accessToken") ? localStorage.getItem("accessToken") : '';
  if(accessToken != ''){
    $("#beforlogin").css("display","none");
    $("#logined").css("display","block");
    getUserinfo();
  } else {
    $("#submit").click(function(){
      setTimeout(() => {
        axios({
          method: 'post',
          url: Apiurl+"/api/TokenAuth/Authenticate",
          data: {
              userNameOrEmailAddress: $("#username").val(),
              password: $("#pwd").val()
          }
        })
        .then((response)=> {    
          if(response.data.success){
            let res = response.data.result;
            localStorage.setItem("userId",res.result.userId);        
            localStorage.setItem("accessToken",res.result.accessToken);
            $("#beforlogin").css("display","none");
            $("#logined").css("display","block");
            getUserinfo();
          }else{
            alert('用户名或密码错误');
          }
        })
    }, 300);
    })
}
}
//获取用户拥有的微信账户
function getUserinfo(){
    axios({
      method: 'get',
      url: Apiurl+"/api/DataCube/GetWechatAccout",
      headers:{
          'Authorization': "Bearer "+ localStorage.getItem("accessToken"),
      },
    })
    .then((response)=> {
      console.log(response);
      if(response.data.success){
        $("#users").empty();
        let userArr = response.data.result;
        for(let i=0;i<userArr.length;i++){
          $("#users").append("<li class='userli' timeout="+userArr[i].lastLoginTime+" username="+userArr[i].userName+" password="+userArr[i].password+" token="+userArr[i].token+" cookies="+userArr[i].cookie+"><img src='https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1533030125509&di=9a6d8288d753e5c67b591fbb8b8c0804&imgtype=0&src=http%3A%2F%2Fpic.90sjimg.com%2Fdesign%2F00%2F67%2F59%2F63%2F58e89bee922a2.png'><span class='displayName'>"+userArr[i].displayName+"</span><span class='userName'>"+userArr[i].userName+"</span></li>");
        }
        init();
      }
    }).catch((error)=>{
       alert("登录已超时，请重新登录");
       $("#beforlogin").css("display","block");
       $("#logined").css("display","none");
    })
}
// 点击事件
function init(){
  $("#users li").click(function(){
    let myDate = new Date();
    let y = myDate.getFullYear(); 
    let mon = myDate.getMonth()+1; 
    let d = myDate.getDate();
    let h = myDate.getHours();     
    let m = myDate.getMinutes();   
    let timeout = $(this).attr("timeout");
    let username = $(this).attr("username");
    let password = $(this).attr("password");
    let token = $(this).attr("token");
    let cookies = $(this).attr("cookies");
    localStorage.setItem("cookiename",username);
    localStorage.setItem("cookiepwd",password);
    timeout.substring(0,10);
    var timeout2 = timeout.replace(/-/g, "");
    timeout2 = parseInt(timeout2);
    if(token == 'null'){
      reLogin(username,password);
    }
    if(timeout2 < (y*10000+mon*100+d)){
      reLogin(username,password);
      //过期
    } else {
      onLogin(username,token,cookies);
    }
  })
  $("#footer").click(function(){
    addUser();
  })
  $("#signout").click(function(){
    localStorage.setItem("accessToken",'');
    $("#beforlogin").css("display","block");
    $("#logined").css("display","none");
  })
}
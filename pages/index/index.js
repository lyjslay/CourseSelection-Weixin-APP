
var app = getApp()

Page({
  data: {
    username:"",
    ucode:"",
    password:"",
    phonenum:"",
    identity:"",
    disable:false,
    jscode:""
  },

    
   //根据输入设置姓名，账号，密码，身份
    setName: function (e) {
      this.setData({ username: e.detail })
      app.globalData.username = this.data.username
    },
    setUid: function (e) {
      this.setData({ ucode: e.detail })
      app.globalData.ucode = this.data.ucode

    },
    setPhone: function (e) {
      this.setData({ phonenum: e.detail })
      app.globalData.phonenum = this.data.phonenum
    },
    onChange: function (e) {
      this.setData({
        identity: e.detail
      })
      app.globalData.identity = this.data.identity
    },
    

    //检查信息输入是否完整，完整返回false
    judge: function (uid, username, phonenum, identity) {
      var flag = false
      if (username == "") {
        wx.showModal({
          title: '提示',
          content: '请输入姓名',
        })
        flag = true
      }
      else if (uid == "") {
        wx.showModal({
          title: '提示',
          content: '请输入学号',
        })
        flag = true
      }
      else if (phonenum == "" || phonenum.length != 11 || phonenum[0] != 1) {
        wx.showModal({
          title: '提示',
          content: '请输入正确的手机号',
        })
        flag = true
      }
      else if (identity == "") {
        wx.showModal({
          title: '提示',
          content: '请选择身份',
        })
        flag = true
      }
      return flag
    },
  

    //注册
    handleReg: function () {
      var username = this.data.username
      var ucode = this.data.ucode
      var phonenum = this.data.phonenum
      var identity = this.data.identity
      var page = this
      if(identity=="teacher"){
        this.data.disable = true
        wx.showModal({
          title: '提示',
          content: '教师无需注册',
        })
        return 
      }

      wx.login({
        success: res =>{
          let jscode = res.code
          console.log(jscode,ucode,username)
          //验证输入是否正确
          if (page.judge(ucode, username, phonenum, identity) == false) {
            wx.showModal({
              title: '核对绑定信息',
              content: '学号:'+ucode+'\n姓名:'+username+'\n手机号:'+phonenum,
              confirmText:'确认无误',
              success: res =>{
                var register_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_reg&code='+jscode+ '&stucode='+ucode+ '&stuname='+username+'&stuphone='+phonenum
                console.log(register_url)
                if(res.confirm){           
                  wx.request({
                    url : register_url,
                    success: res =>{
                      var register = res.data.register
                      var stucode = res.data.ucode
                      var stuname = res.data.uname
                      var identity = res.data.identity
                      var errcode = res.data.errcode
                      console.log(res.data);
                      if ( register == 1 && errcode == 0){//后台返回注册成功信息，存入全局变量，直接进入选课
                        app.globalData.ucode = stucode
                        app.globalData.uname = stuname
                        app.globalData.identity = identity
                        wx.showModal({
                          title: '提示',
                          content: '注册成功，即将跳转至选课页面',
                        })
                        var tmp_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_info&stucode='+stucode
                        wx.request({
                          url: tmp_url,
                          success:res=>{
                            console.log('tmp',res)
                          }
                        })
                        wx.redirectTo({
                              url: '../user/user',
                            })
                      }
                      else{
                        wx.showModal({
                          title: '提示',
                          content: '注册失败，请检查你的姓名学号是否正确，如有其他问题，请联系管理员付老师，电话xxxxxxxx',
                        })
                      }
                    },
                    fail: e => {
                      wx.showModal({
                        title: '提示',
                        content: '链接失败，请检查网络状态',
                      })
                    }
                  })
                }
              }
            })
            //根据信息生成url并向服务器发送请
          }
        }
    })
    },



  
    


    //登录
    /*
    handleLogin: function () {
      var username = this.data.username
      var uid = this.data.uid
      var password = this.data.password
      var phonenum = this.data.phonenum
      var identity = this.data.identity
      var page = this
      console.log(username,uid,password,phonenum)
      if (page.judge(uid, username, password, phonenum, identity) == false) {
        //生成url向服务器发送请求
        let type = 'login'
        let login_url = ''
        //wx.request()
        console.log("登录成功")
        //根据服务器回复，决定是否登录并跳转页面
        wx.redirectTo({
            url: '../user/user',
        })
      }
     
       
    } */
    
  
})

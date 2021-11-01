// pages/cancel/cancel.js
var app = getApp()
Page({

  data: {
    ucode:"",
    identity:"",
    disable:false,
    jscode:"",
  },

  
   //根据输入设置账号身份
    setUid: function (e) {
      this.setData({ ucode: e.detail })
    },
    onChange: function (e) {
      this.setData({
        identity: e.detail
      })
    },


  //检查信息输入是否完整，完整返回false
  judge: function (uid, identity) {
    var flag = false
    if (uid == "") {
      wx.showModal({
        title: '提示',
        content: '请输入账号',
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


  //解除绑定
  handleCancel: function() {
    var ucode = this.data.ucode
    var identity = this.data.identity
    var page = this
    if(identity=="teacher"){
      this.data.disable = true
      wx.showModal({
        title: '提示',
        content: '教师无法注销',
      })
      return 
    }

    wx.login({
      success: res =>{
        let jscode = res.code
        console.log("cancel page :",jscode,ucode)

        if (page.judge(ucode, identity) == false) {
          wx.showModal({
            title: '核对信息',
            content: '学号:'+ucode,
            confirmText:'确认解绑',
            success: res =>{
              if(res.confirm){
                //根据信息生成url并向服务器发送请
                let register_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_unreg&code='+jscode+ '&stucode='+ucode
                wx.request({
                  url : register_url,
                  success: res =>{
                    var register = res.data.register
                    var stucode = res.data.ucode
                    var stuname = res.data.uname
                    var identity = res.data.identity
                    var errcode = res.data.errcode
                    console.log(res.data)
                    if ( register == 0 && errcode == 0){//后台返回解绑成功
                      var cancel_score_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_qrecordscore&stucode='+app.globalData.ucode+'&qtscore='+'0'
                      wx.request({
                        url: cancel_score_url,
                        success:res=>{
                          console.log("解绑后的成绩:",res)
                        }
                      })
                      wx.showModal({
                        title: '提示',
                        content: '解绑成功',
                      })
                      wx.redirectTo({
                        url: '../auth/auth',
                      })
                    }
                    else if ( register == 1 && errcode == 0){
                      wx.showModal({
                        title: '提示',
                        content: '解绑失败，请确保你的微信为注册时绑定的微信，如有其他问题，请联系管理员付老师，电话xxxxxxxx',
                      })
                    }
                    else {
                      wx.showModal({
                        title: '提示',
                        content: '微信身份认证失败，请重新授权登录，或联系管理员付老师，电话xxxxxxxx',
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
        }
      }
    })
  }



})
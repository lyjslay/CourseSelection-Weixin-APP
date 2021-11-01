// pages/auth/auth.js
var app = getApp()
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    ip_success : false,
    auth_success : false,
    openid : '',
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //查看是否授权
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          console.log("用户授权了");
        } else {
          //用户没有授权
          console.log("用户没有授权");
        }
      }
    });
  },
 
  handleAuth: function(res) {
    wx.getUserProfile({
      desc: '用于微信账号与选课账号绑定',
      success: (res)=>{//获取用户信息成功
        //再尝试GET指定内网url，验证网络状态
        let validate_url = app.globalData.url_head+'test1.jsp'
        //let validate_url = 'http://192.168.31.134:8443/weixin/test1.jsp'
        console.log(validate_url)
        let validate_method = "GET"
        wx.request({
          url : validate_url,
          method : validate_method,
          timeout: 1000,
          success: res=> {
            console.log("网络验证成功:",res)
            this.setData({
              ip_success : true
            })
            //验证网络成功，则登录获取openid
            wx.login({
              success: res =>{
                let code = res.code //这里获取的就是登陆的code，可以传送给后端来换取openid和unionid
                console.log(code)
                let openid_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_auth&code=' + code
                wx.request({
                  url : openid_url,
                  data: {},
                  timeout:1000,
                  success: res =>{//openid认证成功，存入返回信息,进入选课
                    console.log("get openid",res)
                    let register = res.data.register
                    let ucode = res.data.ucode
                    let uname = res.data.uname
                    let identity = res.data.identity
                    let errcode = res.data.errcode
                    console.log("information:"+register+' '+ucode+' '+uname+' '+identity+' '+errcode)
                    if( register == 1 && errcode == 0 ){//已注册且获取了openid
                      app.globalData.ucode = ucode
                      app.globalData.uname = uname
                      app.globalData.identity = identity
                      this.setData({
                        auth_success : true
                      });
                      wx.redirectTo({
                        url: '../user/user',
                      })
                    }
                    else if( register == 0 && errcode == 0 ){//未注册且获取了openid
                      app.globalData.ucode = ''
                      app.globalData.identity = ''
                      this.setData({
                        auth_success : false
                      })
                      wx.redirectTo({
                        url: '../index/index',
                      })
                    }
                    else{
                      wx.showModal({
                        title: '提示',
                        content: '微信身份获取失败，请联系管理员付成伟老师，电话xxxxxxxx',
                      })
                    } 
                  },
                  
                })
              }
            })
          },
          fail: error=>{
            wx.showModal({
              title: '错误',
              content: '服务器未响应，请等待一段时间再试。如长期未响应，请联系管理员付老师，电话xxxxxxxx',
            })
            console.log(error)
            this.setData({
              ip_success : false
            })
          }
        })
      },
      fail: (res)=>{
        console.log("获取用户个人信息失败: ",res);
         //用户按了拒绝按钮
        wx.showModal({
          title: '警告',
          content: '【未连接网络】或【未在下方弹出窗口点击授权】，无法进入小程序!!!',
          showCancel: false,
          confirmText: '返回',
        });
      }
    })
  },

  //前往解除绑定页面
  handleAuthCancel: function() {
    wx.getUserProfile({
      desc: '验证微信号身份',
      success: (res)=>{//获取用户信息成功
        //console.log("获取到的用户信息成功: ",JSON.stringify(res))
        //再尝试GET指定内网url，验证网络状态
        let validate_url = app.globalData.url_head+'test1.jsp'
        let validate_method = "GET"
        wx.request({
          url : validate_url,
          method : validate_method,
          timeout: 1000,
          success: res=> {
            console.log("网络验证成功")
            this.setData({
              ip_success : true
            })
            //验证网络成功，则登录获取openid
            wx.login({
              success: res =>{
                let code = res.code //这里获取的就是登陆的code，可以传送给后端来换取openid和unionid
                console.log(code)
                let openid_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_auth&code=' + code
                wx.request({
                  url : openid_url,
                  data: {},
                  headers: {
                      "content-type": "application/json",
                  },
                  success: res =>{//openid认证成功，根据信息判断是否能够进入解绑页面
                    console.log(res)
                    let register = res.data.register
                    let ucode = res.data.ucode
                    let identity = res.data.identity
                    let errcode = res.data.errcode
                    console.log("information:"+register+' '+ucode+' '+identity+' '+errcode)
                    if( register == 1 && errcode == 0 ){//已注册且获取了openid，可以进行解绑
                      this.setData({
                        auth_success : true
                      });
                      wx.redirectTo({
                        url: '../cancel/cancel',
                      })
                    }
                    else if( register == 0 && errcode == 0 ){//未注册且获取了openid
                      this.setData({
                        auth_success : false
                      })
                      wx.showModal({
                        title: '提示',
                        content: '您还未注册，无法解绑，有问题请联系管理员付老师，电话xxxxxxxx',
                      })
                    } 
                    else if(errcode == 2){
                       wx.showModal({
                        title: '提示',
                        content: '该学号已被绑定，请联系付成伟老师，电话xxxxxxxx',
                      })
                    }

                    else{
                      wx.showModal({
                        title: '提示',
                        content: '微信身份获取失败，请联系管理员付成伟老师，电话xxxxxxxx',
                      })
                    } 
                  },
                  
                })
              }
            })
          },
          fail: error=>{
            this.setData({
              ip_success : false
            })
          }
        })
      },
      fail: (res)=>{
        console.log("获取用户个人信息失败: ",res);
         //用户按了拒绝按钮
               wx.showModal({
                  title: '警告',
                  content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
                  showCancel: false,
                  confirmText: '返回授权',
                  success: function(res) {
                    // 用户没有授权成功，不需要改变 isHide 的值
                    if (res.confirm) {
                      console.log('用户点击了“返回授权”'); 
                    }
                  }
       });
      }
    })

  }
})
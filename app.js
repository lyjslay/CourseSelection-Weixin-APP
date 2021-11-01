//app.js
App({
  onLaunch: function () {
    //console.log(wx.cloud)
    wx.cloud.init()

    // if(wx.cloud){
    //   
    //   // wx.cloud.callFunction({
    //   //   name:"getOpenId"
    //   // }).then(res=>{
    //   //   this.globalData.openid = res.result.openid
    //   // })
    // }
  
    //验证是否在校园网环境下
  },
  globalData:{
    url_head : '',
    uname: "",
    ucode: "",
    phonenum: "",
    identity: "",
    sel_courseid: "",//课程类型对应的id
    sel_coursename: "",//当前选择的课程类型名字

    //已选的实验的名字和日期，每次认证登陆后都需要从后端加载一次
    //每次进入选课页面从服务器获取选课信息更新该变量，并随时在选课时更新
    //仅在选课页面使用，用于判断该课程是否已选
    //查课页面的数据直接从服务器获取，不使用该变量
    sel_explist:[],
    sel_datelist:[],


    sel_courses:[],
    courseName:"",
  }
})
var app = getApp()

Page({

  data: {
    uname:"",
    ucode:"",
    identity:"",
    course_type_list:[],
  },

  onLoad: function () {
    this.setData({
      uname : app.globalData.uname,
      ucode : app.globalData.ucode,
      identity : app.globalData.identity,
    })
    
    console.log("user page: ",this.data.uname,this.data.identity)
    //获取学生可选课程类型
    var get_course_url = app.globalData.url_head+'getdata.jsp?datatype=stu_course&stucode='+this.data.ucode
    console.log(get_course_url)
    wx.request({
      url: get_course_url,
      success: res=>{
        console.log("user page: ",typeof(res.data))
        var avail_course = res.data.stu_course
        if(avail_course != undefined){
          avail_course.pop()
          if(avail_course != []){
            this.setData({
              course_type_list:res.data.stu_course
            })
          }
        }
      }
    })
  },


  notify: function(){
    wx.showModal({
      title: '提示',
      content: '您没有该项操作权限',
    })
  },



/*
  //进入选课页面
  select: function(e){
    var page = this
    app.globalData.sel_courseid = e.currentTarget.dataset.courseid //获取选中的课程id
    app.globalData.sel_coursename = e.currentTarget.dataset.coursename //获取选中的课程name
    console.log("user page to sel:",app.globalData.sel_courseid,app.globalData.sel_coursename)
    var minecourse_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_getexpertinfo&stucode='+this.data.ucode+'&stucourse='+e.currentTarget.dataset.courseid
    console.log(minecourse_url)
    if (this.data.identity == "teacher") {
      page.notify()
    }
    else {
      //根据所选的课程类型id,获取学生已选课程
      wx.request({
        url: minecourse_url,
        success:res=>{
          var sel_detail = res.data.stu_getexpertinfo
          if(sel_detail != undefined){
            sel_detail.pop()//删除末尾的空元素
            if(sel_detail != undefined){//删除后仍不为空,说明存在已选课程
              var seldetail_len = sel_detail.length
              var selexp_tmp = app.globalData.sel_explist
              for(var i=0;i<seldetail_len;i++){
                console.log((app.globalData.sel_explist).indexOf(sel_detail[i].ename))
                if((app.globalData.sel_explist).indexOf(sel_detail[i].ename) == -1){//防止重复添加
                  selexp_tmp.push(sel_detail[i].ename)
                }
              }
              app.globalData.sel_explist = selexp_tmp
            }
          }
          console.log('已选课程列表:',app.globalData.sel_explist)
          //request获取选课列表成果，进入选课页面
          wx.navigateTo({
            url: '../selcourse/selcourse'
          })
        },
        fail:e=>{
          console.log('error:',e)
        }
      })
      
      
    }
  },
*/
  //进入选课页面
  select: function(e){
    var page = this
    app.globalData.sel_courseid = e.currentTarget.dataset.courseid //获取选中的课程id
    app.globalData.sel_coursename = e.currentTarget.dataset.coursename //获取选中的课程name
    console.log("user page to sel:",app.globalData.sel_courseid,app.globalData.sel_coursename)
    //先获取我的已选课程信息
    var minecourse_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_getexpertinfo&stucode='+this.data.ucode+'&stucourse='+e.currentTarget.dataset.courseid
    console.log(minecourse_url)
    if (this.data.identity == "teacher") {
      page.notify()
    }
    else {
      //根据所选的课程类型id,获取学生已选课程
      wx.request({
        url: minecourse_url,
        success:res=>{
          var sel_detail = res.data.stu_getexpertinfo
          if(sel_detail != undefined){//获取到当前类型课程的已选实验不为空
            sel_detail.pop()//删除末尾的空元素
            if(sel_detail != []){//删除后仍不为空,说明存在已选课程
              var seldetail_len = sel_detail.length
              var selname_tmp = []//已选课程的名字列表
              var seldate_tmp = []//已选课程的日期(周次+' '+星期)
              //for循环获取已选课程列表，并更新全局变量app.gloabldata.sel_explist
              for(var i=0;i<seldetail_len;i++){
                selname_tmp.push(sel_detail[i].ename)
                seldate_tmp.push(sel_detail[i].eweeks+' '+sel_detail[i].eweek)           
              }
              app.globalData.sel_explist = selname_tmp
              app.globalData.sel_datelist = seldate_tmp
            }
          }
          else{//获取到当前类型课程的已选实验为空
            app.globalData.sel_explist = []
            app.globalData.sel_datelist = []
          }
          console.log('已选课程列表:',app.globalData.sel_explist)
          console.log('已选日期列表:',app.globalData.sel_datelist)
          //request获取选课列表成果，进入选课页面
          wx.navigateTo({
            url: '../selcourse/selcourse'
          })
        },
        fail:e=>{
          console.log('error:',e)
        }
      })
      
      
    }
  },


  //进入查课页面
  mine: function (e) {
    var page = this
    app.globalData.sel_courseid = e.currentTarget.dataset.courseid //获取选中的课程id
    app.globalData.sel_coursename = e.currentTarget.dataset.coursename //获取选中的课程name
    console.log("user page to sel mine:",app.globalData.sel_courseid,app.globalData.sel_coursename)
   
    if (this.data.identity == "teacher") {
      page.notify()
    }
    else {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },
})

// pages/selcourse/selcourse.js
var app = getApp()
Page({

  data: {
    uname:'',
    ucode:'',
    coursetype: '',//当前课程的类型
    coursetype_id: '',//对应类型的id

    weeks_option: [],//当前类型课程可选择的周数
    week_option: [],//可选择的星期
    weeks_value: '',//初始默认选择的周数
    week_value: '',//默认星期
    sel_weeks_val: '',//当前选择的周数
    sel_week_val: '',//当前星期
    sel_date_list: [],//已经有课的日期列表

    course_detail:[],//所选时间对应的详细的课程信息列表
    sel_expname: [],//已选的课程
    have_exp:false,//当日有可选课程
    today_have_exp:false,//当日是否有已选课程
    triggered: false,

  },

  
  
  
  
  onLoad:function(){
    this.setData({
      uname: app.globalData.uname,
      ucode: app.globalData.ucode,
      coursetype: app.globalData.sel_coursename,
      coursetype_id: app.globalData.sel_courseid,
    })
    //获取课程的时间，用于设置DropdownMenu的选项
    var coursetime_url = app.globalData.url_head+'getdata.jsp?datatype=stu_courseweeks&stucode='+this.data.ucode+'&stucourse='+this.data.coursetype_id
    wx.request({
      url: coursetime_url,
      success:res=>{
        var time_list = res.data.stu_courseweeks
        var weeks_list = []
        var week_list = []
        var time_len = time_list.length
        for(var i=0;i<time_len;i++){
          weeks_list.push(time_list[i].weeks)
          week_list.push(time_list[i].week)
        }
        weeks_list = Array.from(new Set(weeks_list))
        weeks_list.pop()
        weeks_list.sort(function(a, b){return a - b})

        week_list = Array.from(new Set(week_list))
        week_list.pop()
        week_list.sort(function(a, b){return a - b})

        var weeks_len = weeks_list.length
        var week_len = week_list.length
        var weeks_tmp = []
        var week_tmp = []
        for(var j=0;j<weeks_len;j++){
          weeks_tmp.push({text:"第"+weeks_list[j]+"周",value:weeks_list[j]})
        }
        for(var k=0;k<week_len;k++){
          week_tmp.push({text:"星期"+week_list[k],value:week_list[k]})
        }
        this.setData({
          weeks_option : weeks_tmp,
          week_option : week_tmp,
          weeks_value : weeks_list[0],
          week_value: week_list[0],
          sel_weeks_val : weeks_list[0],
          sel_week_val: week_list[0],
        })
      }
    })
  },


  //获取课程详情，包括request和删除已选的课程
  /*getCourseDetail:function(){
    var course_weeks = this.data.sel_weeks_val
    var course_week = this.data.sel_week_val
    var coursedetail_url = app.globalData.url_head+'getdata.jsp?datatype=stu_cwexpertime&stucode='+this.data.ucode+'&stucourse='+this.data.coursetype_id+'&weeks='+course_weeks+'&week='+course_week
    wx.request({
      url: coursedetail_url,
      success: res=>{
        console.log("sel page:",res)
        var cwexpertime = res.data.stu_cwexpertime
        var sel_explist = app.globalData.sel_explist
        //从获取的课程列表中删除已选课程
        for(var i=0;i<cwexpertime.length;i++){
          if(sel_explist.indexOf(cwexpertime[i].expername) == -1){
            continue
          }
          else{
            cwexpertime.splice(i,1)
            i = i-1
          }
        }
        console.log(cwexpertime)
        if(cwexpertime){
          this.setData({
            course_detail:cwexpertime,
            have_exp:true
          })
        }
        else{
          this.setData({
            have_exp:false
          })
        }
      }
    })
  },*/


  //request获取课程详情，并给courese_detail添加is_sel属性
  //判断当日是否已选课程
  getCourseDetail:function(){
    //先判断当日是否已选课程
    var current_weeks = this.data.sel_weeks_val
    var current_week = this.data.sel_week_val
    var current_date = current_weeks + ' ' + current_week
    var sel_datelist = app.globalData.sel_datelist
    if(sel_datelist.indexOf(current_date) == -1){//今日没有已选课程
      var course_weeks = this.data.sel_weeks_val
      var course_week = this.data.sel_week_val
      var coursedetail_url = app.globalData.url_head+'getdata.jsp?datatype=stu_cwexpertime&stucode='+this.data.ucode+'&stucourse='+this.data.coursetype_id+'&weeks='+course_weeks+'&week='+course_week
      //获取当日课程的详细信息
      wx.request({
        url: coursedetail_url,
        success: res=>{
          var cwexpertime = res.data.stu_cwexpertime
          if(cwexpertime != undefined){
            cwexpertime.pop()//删除空元素
            if(cwexpertime != undefined){//删除后仍不为空
              var sel_explist = app.globalData.sel_explist
              var exp_len = cwexpertime.length
              //这里给获取到的课程信息添加属性is_sel，用于控制按钮状态
              for(var i=0;i<exp_len;i++){
                if(sel_explist.indexOf(cwexpertime[i].expername) == -1){//该实验不在已选列表中
                  cwexpertime[i]['is_sel'] = false
                }       
                else{
                  cwexpertime[i]['is_sel'] = true
                }
              }
              //console.log(cwexpertime)
              this.setData({
                course_detail:cwexpertime,
                have_exp:true,
                today_have_exp:false,
              })
            }
            else{//删除后为空
              this.setData({
                course_detail:[],
                have_exp:false,
                today_have_exp:false
              })
            }
          }
          else{//本来就空
            this.setData({
              course_detail:[],
              have_exp:false,
              today_have_exp:false
            })
          }
        }
      })
    }
    else{//今日已经有选过的课了
      this.setData({
        course_detail:[],
        have_exp:false,
        today_have_exp:true,
      })
    }   
  },


  //根据实验名字判断实验是否已选
  judge:function(currsel_expname){
    var is_sel = false
    var selexp_list = app.globalData.sel_explist
    if(selexp_list.indexOf(currsel_expname)==-1){//不在已选列表中
      is_sel = false
    }
    else{//已经选过同名实验
      is_sel = true
    }
    return is_sel

  },

  select: function(e){
    var currsel_info = (e.target.id).split(' ')
    var sel_expname = currsel_info[0]//当前选中的实验名字
    var sel_expid = currsel_info[1]//当前选中的实验id
    var is_sel = this.judge(sel_expname)
    if(is_sel == true){//已选
      wx.showModal({
        title: '警告',
        content: '你已经选过该课程',
      })
    }
    else{
      var selexp_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_selectexper&stucode='+app.globalData.ucode+'&stuexptid='+sel_expid
      console.log(selexp_url)
      wx.request({
        url: selexp_url,
        success:res=>{
          console.log(res)
          var reid = res.data.reid
          var info = ''
          switch(reid){
            case '1': info = '实验已选过';break;
            case '2':info = '满员了';break;
            case '3':info = '实验个数已选够';break;
            case '4':info = '时间冲突';break;
            case '100':info = '选课成功';break;
            case '101':info = '选课失败（提交失败）';break;
            case '200':info = '系统禁止';break;
          }
          wx.showModal({
            title: '提示',
            content: info +'('+reid+')',
          })
          if(res.data.reid == 100){//成功选课，实验名加入全局列表，并设置is_sel属性
            app.globalData.sel_explist.push(sel_expname)
            var detail = this.data.course_detail
            var detail_len = this.data.course_detail.length
            for(var i=0;i<detail_len;i++){
              if(detail[i].expername == sel_expname){
                detail[i].is_sel = true
                this.setData({//选课成功，设置今日不能再选课
                  course_detail:detail,
                  today_have_exp:true,
                })
                break
              }
            }
            console.log(this.data.course_detail)
          }
        },
        fail:e=>{
          wx.showModal({
            title: '警告',
            content: '请求失败，当前人数太多了，请稍后',
          })
        }
      })
    }
  },



  //选项发生变化,自动刷新对应的课程
  onWeeksChange(value) {
    this.setData({sel_weeks_val:value.detail})
    this.getCourseDetail()
  },
  
  onWeekChange(value) {
    this.setData({sel_week_val:value.detail})
    this.getCourseDetail()
  },


  //下拉刷新
  onScrollRefresh: function () {
    var page = this
    setTimeout(function(){
      page.setData({
        triggered: false,
      })
      page.getCourseDetail()
    },1000);
  },

 
})
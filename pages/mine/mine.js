// pages/mine/mine.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uname:'',
    ucode:'',
    active: 'home',//当前tarbar激活的页面
    have_exp: false,//已选列表中是否有实验
    mycourse_detail: [],//我的已选课程,在onLoad中从服务器获取,在退课时更新
    sel_number:'',//已选课程数量


    //安全教育页面使用的变量
    questions_all:'',//安全知识选择题,题干+选项组成的对象的列表
    sel_option:[],//当前选择的选项,由于是复选框故结果为一个列表
    option_once:[],//该题对应的所有选项
    question_once:'',//当前的题
    current_question_index:0,//当前题的索引
    button_info:'下一题',//按钮显示的信息
    total_score:0,//当前总分
    question_number:6,//题目总数
    safe_done:false,
    threshscore:90,

    //上传报告页面使用的变量
    fileList: [],
    upload_picker: [],
    upload_expname:'',
    file_name:'',
    file_size:'',
    file_type:'',
    file_url:'',
    file_state_info:'请选择pdf或word文档,文件大小<=5M',
    sel_file:false



  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      uname: app.globalData.uname,
      ucode: app.globalData.ucode,
    })
    //根据所选的课程类型id,获取学生已选课程
    var minecourse_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_getexpertinfo&stucode='+app.globalData.ucode+'&stucourse='+app.globalData.sel_courseid
    console.log(minecourse_url)
    wx.request({
      url: minecourse_url,
      success:res=>{
        var sel_detail = res.data.stu_getexpertinfo
        if(sel_detail != undefined){
          sel_detail.pop()//删除末尾的空元素
          if(sel_detail != []){//删除后仍不为空,说明存在已选课程
            var len = sel_detail.length
            this.setData({
              have_exp:true,
              mycourse_detail:sel_detail,
              sel_number: len,
            })
          }
          else{
            this.setData({
              have_exp:false,
              mycourse_detail:[],
              sel_number:0,
            })
          }
        }
        else{
          this.setData({
            have_exp:false,
            mycourse_detail:[],
            sel_number:0,
          })
        }
      },
      fail:e=>{
        console.log('error:',e)
      }
    })  
    
  },




  //退课按钮被按下
  quitCourse: function(e){
    var currquit_info = (e.target.id).split(' ')
    var quit_expname = currquit_info[0]//当前要退选的实验名字
    var quit_expid = currquit_info[1]//当前要退选的实验id
    var mydetail_tmp = this.data.mycourse_detail
    console.log('55555',mydetail_tmp,quit_expid,quit_expname)
    var quit_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_delexper&stucode='+app.globalData.ucode+'&stuexptid='+quit_expid
    wx.request({
      url: quit_url,
      success:res=>{
        var reid = res.data.reid
        var info = ''
        switch(reid){
          case '10':info = '课程不存在';break;
          case '100': info ='删课成功';break;
          case '101': info = '删课失败(提交失败)';break;
          case '200': info = '系统禁止';break;     
        }
        wx.showModal({
          title: '提示',
          content: quit_expname + info +'('+reid+')',
        })
        //成功删除课程，更新页面显示的信息
        if(reid == 100){
          var mydetail_tmp = this.data.mycourse_detail
          var mydetail_len = mydetail_tmp.length
          for(var i=0;i<mydetail_len;i++){
            var eid = mydetail_tmp[i].eid
            var ename = mydetail_tmp[i].ename
            if(eid != quit_expid) {//要删的课程不在列表中，这是不可能的，因此直接进else
              continue
            }
            else{
              delete mydetail_tmp[i]
              //这里还要同步删除app.globaldata中的sel_explist（已废弃！！！）
              //因为在进入选课页面前只是将不在sel_explist中的课程push进去
              //并不是将从服务器获取的内容直接覆盖更新
              //var index = app.globalData.sel_explist.indexOf(ename)
              //delete app.globalData.sel_explist[index]
            }
          }
          mydetail_tmp = mydetail_tmp.filter(res=>{return res!="undefined"})
          //app.globalData.sel_explist = app.globalData.sel_explist.filter(res=>{return res!="undefined"})
          if(mydetail_tmp == []){
            this.setData({
              mycourse_detail:[],
              have_exp:false,
              sel_number: 0,
            })
          }
          else{
            var len = mydetail_tmp.length
            //设置删除课程后详细课程的列表,刷新页面
            this.setData({
              mycourse_detail:mydetail_tmp,
              have_exp:true,
              sel_number: len,
            })
          }
        }
      }
    })
  },



  //预习按钮被按下
  preCourse:function(e){
    var preexp_info = (e.target.id).split(' ')
    var preexp_name = preexp_info[0]
    var preexp_id = preexp_info[0]
    //获取玉溪内容
    var pre_url = app.globalData.url_head + ''
    wx.showModal({
      title: '提示',
      content: '功能暂未开放',
    })


  },



  //底部标签变化时
  onChange:function(e) {
    var curr_active = e.detail
    this.setData({ active: curr_active })
    if(curr_active == 'home'){
      //该页面需要的变量已在onLoad中加载完成，无需再次加载
    }

    else if(curr_active == 'preview'){
      //该页面需要的变量已在onLoad中加载完成，无需再次加载
    }

    else if(curr_active == 'upload'){
      //从mycourse_detail中选出实验名称
      var myexp_detail = this.data.mycourse_detail
      var myexp_namelist = []
      if(myexp_detail != []){     
        var myexp_len = myexp_detail.length
        for(var i=0;i<myexp_len;i++){
          myexp_namelist.push(myexp_detail[i].ename)
        }
      }
      this.setData({upload_picker:myexp_namelist})
      console.log(this.data.upload_picker,myexp_namelist)  
    }

    else {//安全教育页面
      //先判断是否已经完成了安全测试
      var safe_done_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_getqscore&stucode=' + app.globalData.ucode
      wx.request({
        url: safe_done_url,
        success:res=>{
          var safe_score = res.data.score
          if(safe_score >= this.data.threshscore){//大于xx分视为通过考核
            this.setData({safe_done: true})
          }
          else{
            this.setData({safe_done: false})
          }
        },
        fail:e=>{
          console.log(e)
        }
      })
      
      //判断完成后再决定是否加载题
      if(this.data.safe_done == false){//未完成,加载题目
        var randnumber = this.data.question_number //题目的数量
        var safe_question_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_qbtest&randnum=' + randnumber
        wx.request({
          url: safe_question_url,
          success:res=>{
            console.log('safe:',res)
            var question_list = res.data.stu_qbtest
            if(question_list != undefined){
              //这里跟其他页面request后不一样，不用再pop()掉最后空的元素了
              //因为下边的for循环将信息重新整理，已经筛掉了空的对象
              var question_len = question_list.length
              var question_sort = []
              var q = 0//question_sort的索引
              for(var i=0;i<question_len-1;i++){//将返回的信息重新整理
                if(question_list[i].qtype == '1'){
                  question_sort.push(question_list[i])//推入题干
                  var k = i + 1//下一条一定是答案(因为至少有一个选项)
                  var answer_list = []
                  do{//qtype == '2'时循环将答案推入answer_list
                    answer_list.push(question_list[k])
                    k = k + 1
                  }while(question_list[k].qtype == '2')
                  question_sort[q]['option'] = answer_list//将答案列表设置为题干对象的一个属性
                  q = q + 1
                }
              }
              console.log('final:',question_sort)
              this.setData({
                have_question:true,
                questions_all:question_sort,
                question_once:question_sort[0],
                option_once:question_sort[0].option
              })
            }
            else{//获取到的安全题库为空
              this.setData({
                questions_all: [],
                have_question: false,
                question_once:'',
                option_once:[],
              })
            }           
          }
        }) 
      }  
    }
  },



  //下一题按钮被按下
  nextQuestion:function(e){
    //按钮被按下，锁定该题选项，判断成绩
    //console.log('1:',score_once,'2:',score,'3:',this.data.sel_option)
    var total_score = this.data.total_score //目前为止的总成绩
    var sel_option = this.data.sel_option //锁定的学生的选项
    var currrent_option = this.data.option_once //该题所有的选项
    var question_right = false
    //存储下一题的信息
    var question = ''
    var option = []
    var index = this.data.current_question_index
    if(this.data.sel_option == ''){//还未选择选项
      wx.showModal({
        title: '提示',
        content: '你还未选择',
      })
    }
    else{//有选项
      //先判断对错赋分
      console.log(sel_option)
      for(var i=0;i<currrent_option.length;i++){//遍历所有选项
        if(currrent_option[i].qanswer == '1'){//该答案是正确答案
          if(sel_option.indexOf(currrent_option[i].qoption) != -1){//且正确答案在所选列表中
            question_right = true //暂时判断为正确
            continue //该选项校验通过
          }
          else{//正确答案不再所选列表中,少选,不得分
            question_right = false
            break
          }
        }
        else{//该选项不是正确答案
          if(sel_option.indexOf(currrent_option[i].qoption) != -1){//错误答案在所选列表中,错选,不得分
            question_right = false
            break
          }
          else{
            question_right = true
            continue
          }
        }
      }
      //判断正误完毕，根据正误赋分
      if(question_right == true){
        total_score = total_score + Math.round(100/(this.data.question_number))
      }
      this.setData({total_score:total_score})
      console.log(this.data.total_score)

      //再更新下一题信息
      if(index < this.data.question_number - 2){//索引从0开始,因此应该减2才为倒数第二题的索引
        index = index + 1
        question = this.data.questions_all[index]
        option = this.data.questions_all[index].option
        this.setData({
          question_once:question,
          option_once:option,
          current_question_index:index,
          button_info:'下一题',
          sel_option:''
        })
      }
      else if(index == this.data.question_number - 2){//加载并刷新最后一题
        index = index + 1
        question = this.data.questions_all[index]
        option = this.data.questions_all[index].option
        this.setData({
          question_once:question,
          option_once:option,
          current_question_index:index,
          button_info:'提交',
          sel_option:''
        })
      }
      else{//点击了提交按钮
        var post_score_url = app.globalData.url_head + 'getdata.jsp?datatype=stu_qrecordscore&stucode='+app.globalData.ucode+'&qtscore='+this.data.total_score
        wx.request({
          url: post_score_url,
          success:res=>{
            console.log(res)
            if(this.data.total_score >= this.data.threshscore){//通过安全测试
              this.setData({
                safe_done:true,
                button_info:'下一题',
                current_question_index:0,
              })
            }
            else{//没通过
              this.setData({
                safe_done:false,
                button_info:'下一题',
                current_question_index:0,
                sel_option:[],
                total_score:0,
                option_once:[],
                question_once:'',
              })
              wx.showModal({
                title: '提示',
                content: '你未通过安全测试，请重新学习安全知识后再来答题',
                success: res=>{
                  this.setData({active:'home'})
                }
              })
            }
          },
          fail:e=>{
            console.log(e)
          }
        })
      }
    }
  },

  

  //选项发生变化时,设置得分
  onOptionChange:function(e){
    this.setData({
      sel_option:e.detail
    })
  },


  //picker所选的选项发生变化(什么也不做，等点击确认再setData)
  onPickerChange:function(e){
    console.log("picker:",e.detail)
  },
  onConfirm:function(e) {
    var value = e.detail.value
    this.setData({upload_expname:value})
  },
  onCancel:function() {
    this.setData({upload_expname:''})
  },

  
  //读取到文件时
  afterRead:function(e){
    console.log(e.detail)
    var file = e.detail.file
    var type = file.name.split('.').pop()
    console.log(file.size,type)
    if(file.size <= 5242880 && (type == 'pdf' || type == 'doc' || type == 'docx')){//文件大小小于5M
      wx.showModal({
        title: '提示',
        content: '文件选择成功，请继续上传',
      })
      this.setData({
        file_name:file.name,
        file_size:file.size,
        file_type:file.type,
        file_url:file.url,
        file_state_info:'已选择文件:'+file.name,
        sel_file:true
      })
    }
    else{//文件大于5M
      wx.showModal({
        title: '提示',
        content: '文件大小超过5M，或格式不正确，请选择小于5M的pdf或word文件',
      })
      this.setData({
        file_name:'',
        file_size:'',
        file_type:'',
        file_url:'',
        file_state_info:'请选择pdf或word文档,文件大小<=5M',
        sel_file:false,
      })

    }
  },


  doUpload:function(){
    var expname = this.data.upload_expname
    var file_name = this.data.file_name
    var file_url = this.data.file_url
    var type = file_name.split('.').pop()
    if(expname != '' && this.data.sel_file == true){//选择了实验名并且选择了文件
      //var upload_name = app.globalData.ucode+'_'+app.globalData.uname+'_'+expname+'.'+type
      var upload_name = app.globalData.ucode+ '/' + expname+'.'+type
      console.log(upload_name)
      wx.cloud.uploadFile({
        cloudPath: upload_name,
        filePath: file_url,
        success:res=>{
          console.log(res)
          wx.showModal({
            title: '成功',
            content: expname+'实验报告:'+file_name+'上传成功',
          })
        },
        fail:e=>{
          console.log(e)
          wx.showModal({
            title: '失败',
            content: '服务器未响应，上传失败，请联系管理员付老师，电话130-4430-1826',
          })
        }
      });
    }
    else if(expname == ''){
      wx.showModal({
        title: '失败',
        content: '未选择要上传的实验',
      })
    }

    else if(this.data.sel_file == false){
      wx.showModal({
        title: '失败',
        content: '未选择要上传的文件',
      })
    }


  }

})
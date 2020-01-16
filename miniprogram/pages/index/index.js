//index.js
var TOTP = require('totp.min.js')
const app = getApp()

Page({
  data: {
    list : [{_id : "1", name : "模拟数据", secret: "666666", website:"test.com", sign: "666778"}],
    openid: "",
    logged: false,
    takeSession: false,
    rotate: 0,
    length: "", // 倒计时长度
    num: 0, // 定时器刷新次数
    timer: '',     //存储计时器
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '我的主页', //导航栏 中间的标题
    },

    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20   
  },
  onLoad: function() {
    // var str = "otpauth://totp/handsome@totp.js?issuer=Totp.js&secret=GAXDC4DIG5YWYMTH";
    // this.decon(str);
    // 读取列表
    this.getList();
    // 执行定时器（时间同步到整秒再处理）
    var ms2NextSecond = 1000 - (Date.now() % 1000);
    setTimeout(this.startInterval, ms2NextSecond);
  },
  // 流程处理功能
  startInterval:function() {
    var ttl1 = Math.floor(Date.now() / 1000 % 30);
    var rotate = 360 * (30 - ttl1) / 30;
    this.setData({rotate: rotate})
    setInterval(() => {
      var ttl = Math.floor(Date.now() / 1000 % 30);
      var length = 30 - ttl;
      this.setData({length: length})
      if (ttl === 0) { this.refreshCode(this.data.list);}
    }, 1000);
  },
  // 计算当前加密值
  refreshCode : function(list) {
      list.forEach(element => {
        var key   = element.secret;
        var totp = new TOTP(key);
        var code = totp.genOTP();
        element.sign    = code;
      });
      this.setData({ list: list})
  },
  
  // 获取用户的存储列表
  getList: function(){
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('secretkeys').where({}).get({
      success: res => {
        this.refreshCode(res.data);
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  // 扫码
  scan: function() {
    var that = this;
    wx.scanCode({
      // onlyFromCamera: true,
      success (res) {
        console.log(res)
        var str = res.result;
        var obj = that.decon(str);
        if (obj) { that.addItem(obj); }
        
      }
    })
  },
  // 删除
  del : function(e) {
    var that = this;
    console.log(e)
    var index = parseInt(e.currentTarget.dataset.index)
    console.log(index)
    wx.showModal({
      title: '提示',
      content: '是否删除该项',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.delItem(index);
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  // 新增用户条目
  addItem: function(obj){
    const db = wx.cloud.database()
    db.collection('secretkeys').add({
      data: obj,
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        // 更新列表
        this.getList();
        wx.showToast({
          title: '新增记录成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

  // 删除用户条目
  delItem: function(index) {
    var item = this.data.list[index];
    var id = item._id;
    if (!id) {
      wx.showToast({
        title: '数据错误',
      })
    }
    // 删除远程数据
    const db = wx.cloud.database()
    db.collection('secretkeys').doc(id).remove({
      success: res => {
        wx.showToast({
          title: '删除成功',
        })
        this.data.list.splice(index, 1)
        this.setData({
          list: this.data.list
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '删除失败',
        })
        console.error('[数据库] [删除记录] 失败：', err)
      }
    })
  },
  // 根据正则解析相应的参数
  decon: function(str){
    // var str = "otpauth://totp/handsome@totp.js?issuer=Totp.js&secret=GAXDC4DIG5YWYMTH";
    // var str = "otpauth://totp/xxxx";
    var reg = /^otpauth:\/\/totp\/(.*)\?issuer=(.+)&secret=(\w+)/g;
    var myArray = reg.exec(str);
    console.log(myArray);
    if (!myArray) {
      wx.showToast({
        icon: 'none',
        title: '扫码错误',
      })
      return null;
    }
    return {
      name: myArray[1],
      website: myArray[2],
      secret : myArray[3],
    }
    // `otpauth://hotp/${username}?issuer=${org}&secret=${this.key}`
  }

})
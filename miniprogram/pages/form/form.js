// miniprogram/pages/form.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // obj : {
    //   name: "",
    //   website: "",
    //   secret : "",
    // }
  },

  formSubmit: function (e) {  
    console.log('form发生了submit事件，携带数据为：', e.detail.value);  
    let { name, secret,website } = e.detail.value;  
    if (!secret || !website) {  
      wx.showToast({
        icon: 'none',
        title: '必填信息不能为空',
      })
      return;  
    }  
    var obj = {
      name: name,
      website: website,
      secret : secret,
    };
    this.addItem(obj);
    // wx.navigateBack({
    //   delta: 1
    // })
    wx.redirectTo({
      url: '../index/index',
    })
  }, 

  addItem: function(obj){
    const db = wx.cloud.database()
    db.collection('secretkeys').add({
      data: obj,
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        // 更新列表
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


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
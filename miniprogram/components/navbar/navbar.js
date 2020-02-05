// pages/navbar.js
Component({
  properties: {
    /**
     * 自定义返回事件处理
     * customBackReturn="{{true}}" bind:customBackReturn="customBackReturn"
     */
    customBackReturn: {
      type: Boolean,
      value: false
    }
  },
  data: {

  },
  methods: {
    backClick() {
      if (this.data.customBackReturn) {
        this.triggerEvent("customBackReturn")
      } else {
        if (getCurrentPages().length == 1) {
          wx.switchTab({
            url: '/pages/index/index',
          })
        } else {
          wx.navigateBack({
            delta: 1
          })
        }
      }
    },
    iconClick() {
      console.log(4444);
      wx.navigateTo({
        url: '../form/form',
      })
      // wx.switchTab({
      //   url: '../form/form',
      // })
    }
  },
  attached() {
    var self = this;
    wx.getSystemInfo({
      success(res) {
        var isIos = res.system.indexOf('iOS') > -1;
        self.setData({
          statusHeight: res.statusBarHeight,
          navHeight: isIos ? 44 : 48
        })
      }
    })
  }
})

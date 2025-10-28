App({
  onLaunch: function () {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'your-cloud-env-id', // 替换为你的云环境ID
        traceUser: true
      })
    }
    
    // 获取系统信息
    wx.getSystemInfo({
      success: res => {
        this.globalData.systemInfo = res
        this.globalData.isIPhoneX = /iPhone X/.test(res.model)
      }
    })
    
    // 检查登录状态
    this.checkLoginStatus()
  },
  
  globalData: {
    userInfo: null,
    systemInfo: null,
    isIPhoneX: false
  },
  
  checkLoginStatus: function() {
    const token = wx.getStorageSync('token')
    if (token) {
      // 验证token有效性
      wx.checkSession({
        success: () => {
          this.globalData.isLoggedIn = true
        },
        fail: () => {
          wx.removeStorageSync('token')
          this.globalData.isLoggedIn = false
        }
      })
    }
  }
})
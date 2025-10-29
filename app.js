App({
  onLaunch: function () {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-4g318fw4a9d6ba0e', // 需要替换为你的云环境ID
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
    isIPhoneX: false,
    isLoggedIn: false
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
  },
  
  // 登录方法
  login: function(callback) {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用云函数登录
          wx.cloud.callFunction({
            name: 'login',
            data: {
              code: res.code
            },
            success: (res) => {
              const { userInfo, token } = res.result
              this.globalData.userInfo = userInfo
              this.globalData.isLoggedIn = true
              wx.setStorageSync('token', token)
              callback && callback(true)
            },
            fail: () => {
              callback && callback(false)
            }
          })
        }
      }
    })
  }
})
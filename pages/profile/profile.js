// pages/profile/profile.js
Page({
  data: {
    userInfo: null,
    myProducts: [],
    isLoggedIn: false
  },

  onLoad(options) {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
    if (this.data.isLoggedIn) {
      this.loadMyProducts()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const app = getApp()
    this.setData({
      isLoggedIn: app.globalData.isLoggedIn,
      userInfo: app.globalData.userInfo
    })
  },

  // 加载我的商品
  loadMyProducts() {
    wx.cloud.callFunction({
      name: 'shopmanage',
      data: {
        action: 'getMyProducts'
      }
    }).then(res => {
      this.setData({
        myProducts: res.result.data || []
      })
    })
  },

  // 登录
  onLogin() {
    const app = getApp()
    app.login((success) => {
      if (success) {
        this.setData({
          isLoggedIn: true,
          userInfo: app.globalData.userInfo
        })
        this.loadMyProducts()
      } else {
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
      }
    })
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token')
          const app = getApp()
          app.globalData.isLoggedIn = false
          app.globalData.userInfo = null
          this.setData({
            isLoggedIn: false,
            userInfo: null,
            myProducts: []
          })
        }
      }
    })
  },

  // 跳转到我的发布
  goToMyProducts() {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    // 可以跳转到专门的我的发布页面
    wx.navigateTo({
      url: '/pages/myproducts/myproducts'
    })
  },

  // 联系客服
  contactCustomerService() {
    wx.makePhoneCall({
      phoneNumber: '400-xxx-xxxx' // 替换为实际客服电话
    })
  }
})
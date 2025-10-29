// pages/publish/publish.js
Page({
  data: {
    images: [],
    categories: [
      { id: 1, name: '图书教材' },
      { id: 2, name: '数码电子' },
      { id: 3, name: '生活用品' },
      { id: 4, name: '服饰鞋包' },
      { id: 5, name: '运动健身' },
      { id: 6, name: '其他' }
    ],
    categoryIndex: 0,
    tradeMethods: [
      { name: '自提', value: 'self_pick', checked: true },
      { name: '快递', value: 'delivery', checked: false }
    ],
    formData: {
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      contact: ''
    },
    canSubmit: false,
    uploading: false
  },

  onLoad(options) {
    // 检查登录状态
    const app = getApp()
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/profile/profile'
            })
          }
        }
      })
    }
  },

  // 选择图片
  chooseImage() {
    if (this.data.images.length >= 9) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none'
      })
      return
    }

    wx.chooseMedia({
      count: 9 - this.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles
        const newImages = tempFiles.map(file => file.tempFilePath)
        const allImages = this.data.images.concat(newImages)
        
        this.setData({ images: allImages })
        this.checkSubmit()
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images
    images.splice(index, 1)
    this.setData({ images })
    this.checkSubmit()
  },

  // 分类选择变化
  onCategoryChange(e) {
    this.setData({
      categoryIndex: parseInt(e.detail.value)
    })
    this.checkSubmit()
  },

  // 交易方式变化
  onMethodChange(e) {
    const value = e.detail.value
    const methods = this.data.tradeMethods.map(method => ({
      ...method,
      checked: value.includes(method.value)
    }))
    this.setData({ tradeMethods: methods })
  },

  // 表单输入变化
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
    this.checkSubmit()
  },

  // 检查是否可以提交
  checkSubmit() {
    const { title, price, contact } = this.data.formData
    const { images } = this.data
    const canSubmit = title && price && contact && images.length > 0
    this.setData({ canSubmit })
  },

  // 表单提交
  onSubmit() {
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    if (this.data.uploading) return

    this.setData({ uploading: true })
    wx.showLoading({ title: '发布中...' })

    // 先上传图片
    this.uploadImages().then(imageUrls => {
      const { categories, categoryIndex, tradeMethods, formData } = this.data
      
      // 调用云函数发布商品
      return wx.cloud.callFunction({
        name: 'shopmanage',
        data: {
          action: 'create',
          product: {
            title: formData.title,
            description: formData.description,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
            category: categories[categoryIndex].id,
            categoryName: categories[categoryIndex].name,
            contact: formData.contact,
            tradeMethods: tradeMethods.filter(m => m.checked).map(m => m.value),
            images: imageUrls,
            status: 'active'
          }
        }
      })
    }).then(res => {
      wx.hideLoading()
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      })
      
      // 返回首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    }).catch(err => {
      console.error('发布失败:', err)
      wx.hideLoading()
      this.setData({ uploading: false })
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      })
    })
  },

  // 上传图片到云存储
  uploadImages() {
    const uploadTasks = this.data.images.map((path, index) => {
      const cloudPath = `products/${Date.now()}-${index}-${Math.random().toString(36).substr(2)}.jpg`
      return wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: path
      })
    })
    
    return Promise.all(uploadTasks).then(results => {
      return results.map(result => result.fileID)
    })
  }
})
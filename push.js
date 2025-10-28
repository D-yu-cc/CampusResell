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
    canSubmit: false
  },
  
  // 选择图片
  chooseImage: function () {
    const that = this
    wx.chooseMedia({
      count: 9 - that.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        const tempFiles = res.tempFiles
        const newImages = tempFiles.map(file => file.tempFilePath)
        const allImages = that.data.images.concat(newImages)
        
        that.setData({
          images: allImages
        })
        that.checkSubmit()
        
        // 上传图片到云存储
        that.uploadImages(newImages)
      }
    })
  },
  
  // 删除图片
  deleteImage: function (e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images
    images.splice(index, 1)
    this.setData({ images })
    this.checkSubmit()
  },
  
  // 上传图片到云存储
  uploadImages: function (imagePaths) {
    const uploadTasks = imagePaths.map(path => {
      return wx.cloud.uploadFile({
        cloudPath: `products/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`,
        filePath: path
      })
    })
    
    return Promise.all(uploadTasks)
  },
  
  // 分类选择变化
  categoryChange: function (e) {
    this.setData({
      categoryIndex: parseInt(e.detail.value)
    })
    this.checkSubmit()
  },
  
  // 交易方式变化
  methodChange: function (e) {
    const value = e.detail.value
    const methods = this.data.tradeMethods.map(method => {
      return {
        ...method,
        checked: value.includes(method.value)
      }
    })
    this.setData({ tradeMethods: methods })
  },
  
  // 表单输入变化
  onInputChange: function (e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
    this.checkSubmit()
  },
  
  // 检查是否可以提交
  checkSubmit: function () {
    const { title, price, contact } = this.data.formData
    const { images } = this.data
    const canSubmit = title && price && contact && images.length > 0
    this.setData({ canSubmit })
  },
  
  // 表单提交
  formSubmit: function (e) {
    const formData = e.detail.value
    const { images, categories, categoryIndex, tradeMethods } = this.data
    
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }
    
    // 显示加载中
    wx.showLoading({
      title: '发布中...'
    })
    
    // 调用云函数发布商品
    wx.cloud.callFunction({
      name: 'product',
      data: {
        action: 'create',
        product: {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          category: categories[categoryIndex].id,
          contact: formData.contact,
          tradeMethods: tradeMethods.filter(m => m.checked).map(m => m.value),
          images: images,
          status: 'active',
          createTime: new Date()
        }
      }
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
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      })
    })
  }
})
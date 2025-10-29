// pages/detail/detail.js
Page({
  data: {
    product: null,
    loading: true
  },

  onLoad(options) {
    const productId = options.id
    if (productId) {
      this.loadProductDetail(productId)
    }
  },

  // 加载商品详情
  loadProductDetail(productId) {
    wx.cloud.callFunction({
      name: 'shopmanage',
      data: {
        action: 'getDetail',
        productId: productId
      }
    }).then(res => {
      this.setData({
        product: res.result.data,
        loading: false
      })
    }).catch(err => {
      console.error('加载商品详情失败:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    })
  },

  // 联系卖家
  contactSeller() {
    const { product } = this.data
    if (product && product.contact) {
      wx.makePhoneCall({
        phoneNumber: product.contact
      })
    }
  },

  // 分享商品
  onShareAppMessage() {
    const { product } = this.data
    return {
      title: product ? product.title : '校园二手商品',
      path: `/pages/detail/detail?id=${product._id}`,
      imageUrl: product && product.images && product.images.length > 0 ? product.images[0] : ''
    }
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.src
    const urls = this.data.product.images
    wx.previewImage({
      current: current,
      urls: urls
    })
  }
})
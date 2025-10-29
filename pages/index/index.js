// pages/index/index.js
Page({
  data: {
    products: [],
    categories: [
      { id: 1, name: '全部', active: true },
      { id: 2, name: '图书教材', active: false },
      { id: 3, name: '数码电子', active: false },
      { id: 4, name: '生活用品', active: false },
      { id: 5, name: '服饰鞋包', active: false },
      { id: 6, name: '运动健身', active: false }
    ],
    currentCategory: 1,
    loading: false,
    hasMore: true,
    page: 1
  },

  onLoad(options) {
    this.loadProducts()
  },

  onShow() {
    // 页面显示时刷新数据
    this.setData({
      page: 1,
      products: [],
      hasMore: true
    })
    this.loadProducts()
  },

  // 加载商品列表
  loadProducts() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })

    wx.cloud.callFunction({
      name: 'shopmanage',
      data: {
        action: 'getList',
        page: this.data.page,
        pageSize: 10,
        category: this.data.currentCategory === 1 ? null : this.data.currentCategory
      }
    }).then(res => {
      const newProducts = res.result.data || []
      const products = this.data.page === 1 ? newProducts : [...this.data.products, ...newProducts]
      
      this.setData({
        products: products,
        hasMore: newProducts.length === 10,
        loading: false,
        page: this.data.page + 1
      })
    }).catch(err => {
      console.error('加载商品失败:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    })
  },

  // 分类切换
  onCategoryChange(e) {
    const categoryId = e.currentTarget.dataset.id
    const categories = this.data.categories.map(item => ({
      ...item,
      active: item.id === categoryId
    }))

    this.setData({
      categories,
      currentCategory: categoryId,
      page: 1,
      products: [],
      hasMore: true
    })

    this.loadProducts()
  },

  // 跳转到商品详情
  goToDetail(e) {
    const productId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${productId}`
    })
  },

  // 搜索功能
  onSearch(e) {
    const keyword = e.detail.value
    // 实现搜索逻辑
    console.log('搜索关键词:', keyword)
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      page: 1,
      products: [],
      hasMore: true
    })
    this.loadProducts()
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadProducts()
  }
})
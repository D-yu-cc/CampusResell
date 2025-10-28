const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const { action } = event
  
  try {
    switch (action) {
      case 'create':
        return await createProduct(event)
      case 'getList':
        return await getProductList(event)
      case 'getDetail':
        return await getProductDetail(event)
      default:
        return { success: false, message: '未知操作' }
    }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

// 创建商品
async function createProduct(event) {
  const { product } = event
  const { OPENID } = cloud.getWXContext()
  
  const productData = {
    ...product,
    _openid: OPENID,
    createTime: db.serverDate(),
    updateTime: db.serverDate()
  }
  
  const result = await db.collection('products').add({
    data: productData
  })
  
  return {
    success: true,
    data: result
  }
}

// 获取商品列表
async function getProductList(event) {
  const { page = 1, pageSize = 10, category } = event
  
  const skip = (page - 1) * pageSize
  
  let query = db.collection('products').where({
    status: 'active'
  })
  
  if (category) {
    query = query.where({
      category: category
    })
  }
  
  const result = await query
    .orderBy('createTime', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()
  
  return {
    success: true,
    data: result.data
  }
}

// 获取商品详情
async function getProductDetail(event) {
  const { productId } = event
  
  const result = await db.collection('products').doc(productId).get()
  
  return {
    success: true,
    data: result.data
  }
}
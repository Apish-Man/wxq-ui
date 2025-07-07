import request from '@/utils/request'

// 查询价格表列表
export function listPricing(query) {
  return request({
    url: '/manage/pricing/list',
    method: 'get',
    params: query
  })
}

// 查询价格表详细
export function getPricing(pricingId) {
  return request({
    url: '/manage/pricing/' + pricingId,
    method: 'get'
  })
}

// 新增价格表
export function addPricing(data) {
  return request({
    url: '/manage/pricing',
    method: 'post',
    data: data
  })
}

// 修改价格表
export function updatePricing(data) {
  return request({
    url: '/manage/pricing',
    method: 'put',
    data: data
  })
}

// 删除价格表
export function delPricing(pricingId) {
  return request({
    url: '/manage/pricing/' + pricingId,
    method: 'delete'
  })
}

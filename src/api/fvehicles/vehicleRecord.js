import request from '@/utils/request'

// 查询进出记录列表
export function listVehicleRecord(query) {
  return request({
    url: '/fvehicles/vehicleRecord/list',
    method: 'get',
    params: query
  })
}

// 查询进出记录详细
export function getVehicleRecord(recordId) {
  return request({
    url: '/fvehicles/vehicleRecord/' + recordId,
    method: 'get'
  })
}

// 新增进出记录
export function addVehicleRecord(data) {
  return request({
    url: '/fvehicles/vehicleRecord',
    method: 'post',
    data: data
  })
}

// 修改进出记录
export function updateVehicleRecord(data) {
  return request({
    url: '/fvehicles/vehicleRecord',
    method: 'put',
    data: data
  })
}

// 删除进出记录
export function delVehicleRecord(recordId) {
  return request({
    url: '/fvehicles/record/' + recordId,
    method: 'delete'
  })
}

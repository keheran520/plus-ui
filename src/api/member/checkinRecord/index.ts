import request from '@/utils/request'
import { AxiosPromise } from 'axios'
import { CheckinRecordForm, CheckinRecordQuery, CheckinRecordVO } from '@/api/member/checkinRecord/types'

/**
 * 查询会员每日签到记录列表
 */
export const listCheckinRecord = (query?: CheckinRecordQuery): AxiosPromise<CheckinRecordVO[]> => {
  return request({
    url: '/member/checkinRecord/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询会员每日签到记录详情
 */
export const getCheckinRecord = (id: string | number): AxiosPromise<CheckinRecordVO> => {
  return request({
    url: '/member/checkinRecord/' + id,
    method: 'get'
  })
}

/**
 * 新增会员每日签到记录
 */
export const addCheckinRecord = (data: CheckinRecordForm) => {
  return request({
    url: '/member/checkinRecord',
    method: 'post',
    data
  })
}

/**
 * 修改会员每日签到记录
 */
export const updateCheckinRecord = (data: CheckinRecordForm) => {
  return request({
    url: '/member/checkinRecord',
    method: 'put',
    data
  })
}

/**
 * 删除会员每日签到记录
 */
export const delCheckinRecord = (id: string | number | Array<string | number>) => {
  return request({
    url: '/member/checkinRecord/' + id,
    method: 'delete'
  })
}

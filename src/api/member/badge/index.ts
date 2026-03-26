import request from '@/utils/request'
import { AxiosPromise } from 'axios'
import { BadgeForm, BadgeQuery, BadgeVO } from '@/api/member/badge/types'

/**
 * 查询会员徽章定义列表
 */
export const listBadge = (query?: BadgeQuery): AxiosPromise<BadgeVO[]> => {
  return request({
    url: '/member/badge/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询会员徽章定义详情
 */
export const getBadge = (id: string | number): AxiosPromise<BadgeVO> => {
  return request({
    url: '/member/badge/' + id,
    method: 'get'
  })
}

/**
 * 新增会员徽章定义
 */
export const addBadge = (data: BadgeForm) => {
  return request({
    url: '/member/badge',
    method: 'post',
    data
  })
}

/**
 * 修改会员徽章定义
 */
export const updateBadge = (data: BadgeForm) => {
  return request({
    url: '/member/badge',
    method: 'put',
    data
  })
}

/**
 * 删除会员徽章定义
 */
export const delBadge = (id: string | number | Array<string | number>) => {
  return request({
    url: '/member/badge/' + id,
    method: 'delete'
  })
}

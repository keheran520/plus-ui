import request from '@/utils/request'
import { AxiosPromise } from 'axios'
import { BadgeGrantForm, BadgeGrantQuery, BadgeGrantVO } from '@/api/member/badgeGrant/types'

/**
 * 查询会员徽章发放记录列表
 */
export const listBadgeGrant = (query?: BadgeGrantQuery): AxiosPromise<BadgeGrantVO[]> => {
  return request({
    url: '/member/badgeGrant/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询会员徽章发放记录详情
 */
export const getBadgeGrant = (id: string | number): AxiosPromise<BadgeGrantVO> => {
  return request({
    url: '/member/badgeGrant/' + id,
    method: 'get'
  })
}

/**
 * 新增会员徽章发放记录
 */
export const addBadgeGrant = (data: BadgeGrantForm) => {
  return request({
    url: '/member/badgeGrant',
    method: 'post',
    data
  })
}

/**
 * 修改会员徽章发放记录
 */
export const updateBadgeGrant = (data: BadgeGrantForm) => {
  return request({
    url: '/member/badgeGrant',
    method: 'put',
    data
  })
}

/**
 * 删除会员徽章发放记录
 */
export const delBadgeGrant = (id: string | number | Array<string | number>) => {
  return request({
    url: '/member/badgeGrant/' + id,
    method: 'delete'
  })
}

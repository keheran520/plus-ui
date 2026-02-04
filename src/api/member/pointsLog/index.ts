import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PointsLogVO, PointsLogForm, PointsLogQuery } from '@/api/member/pointsLog/types';

/**
 * 查询会员积分记录列表
 * @param query
 * @returns {*}
 */

export const listPointsLog = (query?: PointsLogQuery): AxiosPromise<PointsLogVO[]> => {
  return request({
    url: '/member/pointsLog/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询会员积分记录详细
 * @param id
 */
export const getPointsLog = (id: string | number): AxiosPromise<PointsLogVO> => {
  return request({
    url: '/member/pointsLog/' + id,
    method: 'get'
  });
};

/**
 * 新增会员积分记录
 * @param data
 */
export const addPointsLog = (data: PointsLogForm) => {
  return request({
    url: '/member/pointsLog',
    method: 'post',
    data: data
  });
};

/**
 * 修改会员积分记录
 * @param data
 */
export const updatePointsLog = (data: PointsLogForm) => {
  return request({
    url: '/member/pointsLog',
    method: 'put',
    data: data
  });
};

/**
 * 删除会员积分记录
 * @param id
 */
export const delPointsLog = (id: string | number | Array<string | number>) => {
  return request({
    url: '/member/pointsLog/' + id,
    method: 'delete'
  });
};

/**
 * 查询指定会员的积分记录
 * @param memberId
 */
export const getPointsLogByMemberId = (memberId: number) => {
  return request({
    url: '/member/pointsLog/member/' + memberId,
    method: 'get'
  });
};

/**
 * 导出积分记录
 * @param query
 */
export const exportPointsLog = (query: any) => {
  return request({
    url: '/member/pointsLog/export',
    method: 'post',
    data: query
  });
};

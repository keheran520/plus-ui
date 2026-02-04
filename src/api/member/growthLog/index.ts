import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { GrowthLogVO, GrowthLogForm, GrowthLogQuery } from '@/api/member/growthLog/types';

/**
 * 查询会员成长值记录列表
 * @param query
 * @returns {*}
 */

export const listGrowthLog = (query?: GrowthLogQuery): AxiosPromise<GrowthLogVO[]> => {
  return request({
    url: '/member/growthLog/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询会员成长值记录详细
 * @param id
 */
export const getGrowthLog = (id: string | number): AxiosPromise<GrowthLogVO> => {
  return request({
    url: '/member/growthLog/' + id,
    method: 'get'
  });
};

/**
 * 新增会员成长值记录
 * @param data
 */
export const addGrowthLog = (data: GrowthLogForm) => {
  return request({
    url: '/member/growthLog',
    method: 'post',
    data: data
  });
};

/**
 * 修改会员成长值记录
 * @param data
 */
export const updateGrowthLog = (data: GrowthLogForm) => {
  return request({
    url: '/member/growthLog',
    method: 'put',
    data: data
  });
};

/**
 * 删除会员成长值记录
 * @param id
 */
export const delGrowthLog = (id: string | number | Array<string | number>) => {
  return request({
    url: '/member/growthLog/' + id,
    method: 'delete'
  });
};

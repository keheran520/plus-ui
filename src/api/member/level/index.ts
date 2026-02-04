import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LevelVO, LevelForm, LevelQuery } from '@/api/member/level/types';

/**
 * 查询会员等级列表
 * @param query
 * @returns {*}
 */

export const listLevel = (query?: LevelQuery): AxiosPromise<LevelVO[]> => {
  return request({
    url: '/member/level/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询会员等级详细
 * @param id
 */
export const getLevel = (id: string | number): AxiosPromise<LevelVO> => {
  return request({
    url: '/member/level/' + id,
    method: 'get'
  });
};

/**
 * 新增会员等级
 * @param data
 */
export const addLevel = (data: LevelForm) => {
  return request({
    url: '/member/level',
    method: 'post',
    data: data
  });
};

/**
 * 修改会员等级
 * @param data
 */
export const updateLevel = (data: LevelForm) => {
  return request({
    url: '/member/level',
    method: 'put',
    data: data
  });
};

/**
 * 删除会员等级
 * @param id
 */
export const delLevel = (id: string | number | Array<string | number>) => {
  return request({
    url: '/member/level/' + id,
    method: 'delete'
  });
};

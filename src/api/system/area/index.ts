import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AreaVO, AreaForm, AreaQuery } from '@/api/system/area/types';

/**
 * 查询地址列表
 * @param query
 * @returns {*}
 */

export const listArea = (query?: AreaQuery): AxiosPromise<AreaVO[]> => {
  return request({
    url: '/system/area/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询地址详细
 * @param areaId
 */
export const getArea = (areaId: string | number): AxiosPromise<AreaVO> => {
  return request({
    url: '/system/area/' + areaId,
    method: 'get'
  });
};

/**
 * 新增地址
 * @param data
 */
export const addArea = (data: AreaForm) => {
  return request({
    url: '/system/area',
    method: 'post',
    data: data
  });
};

/**
 * 修改地址
 * @param data
 */
export const updateArea = (data: AreaForm) => {
  return request({
    url: '/system/area',
    method: 'put',
    data: data
  });
};

/**
 * 删除地址
 * @param areaId
 */
export const delArea = (areaId: string | number | Array<string | number>) => {
  return request({
    url: '/system/area/' + areaId,
    method: 'delete'
  });
};

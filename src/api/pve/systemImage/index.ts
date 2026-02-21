import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SystemImageVO, SystemImageForm, SystemImageQuery } from '@/api/pve/systemImage/types';

/**
 * 查询系统镜像库列表
 * @param query
 * @returns {*}
 */

export const listSystemImage = (query?: SystemImageQuery): AxiosPromise<SystemImageVO[]> => {
  return request({
    url: '/pve/systemImage/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询系统镜像库详细
 * @param imageId
 */
export const getSystemImage = (imageId: string | number): AxiosPromise<SystemImageVO> => {
  return request({
    url: '/pve/systemImage/' + imageId,
    method: 'get'
  });
};

/**
 * 新增系统镜像库
 * @param data
 */
export const addSystemImage = (data: SystemImageForm) => {
  return request({
    url: '/pve/systemImage',
    method: 'post',
    data: data
  });
};

/**
 * 修改系统镜像库
 * @param data
 */
export const updateSystemImage = (data: SystemImageForm) => {
  return request({
    url: '/pve/systemImage',
    method: 'put',
    data: data
  });
};

/**
 * 删除系统镜像库
 * @param imageId
 */
export const delSystemImage = (imageId: string | number | Array<string | number>) => {
  return request({
    url: '/pve/systemImage/' + imageId,
    method: 'delete'
  });
};

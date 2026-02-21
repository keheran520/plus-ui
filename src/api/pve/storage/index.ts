import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { StorageVO, StorageForm, StorageQuery } from '@/api/pve/storage/types';

/**
 * 查询PVE存储列表
 * @param query
 * @returns {*}
 */

export const listStorage = (query?: StorageQuery): AxiosPromise<StorageVO[]> => {
  return request({
    url: '/pve/storage/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询PVE存储详细
 * @param storageId
 */
export const getStorage = (storageId: string | number): AxiosPromise<StorageVO> => {
  return request({
    url: '/pve/storage/' + storageId,
    method: 'get'
  });
};

/**
 * 新增PVE存储
 * @param data
 */
export const addStorage = (data: StorageForm) => {
  return request({
    url: '/pve/storage',
    method: 'post',
    data: data
  });
};

/**
 * 修改PVE存储
 * @param data
 */
export const updateStorage = (data: StorageForm) => {
  return request({
    url: '/pve/storage',
    method: 'put',
    data: data
  });
};

/**
 * 删除PVE存储
 * @param storageId
 */
export const delStorage = (storageId: string | number | Array<string | number>) => {
  return request({
    url: '/pve/storage/' + storageId,
    method: 'delete'
  });
};

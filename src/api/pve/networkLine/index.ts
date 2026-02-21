import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { NetworkLineVO, NetworkLineForm, NetworkLineQuery } from '@/api/pve/networkLine/types';

/**
 * 查询线路管理列表
 * @param query
 * @returns {*}
 */

export const listNetworkLine = (query?: NetworkLineQuery): AxiosPromise<NetworkLineVO[]> => {
  return request({
    url: '/pve/networkLine/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询线路管理详细
 * @param lineId
 */
export const getNetworkLine = (lineId: string | number): AxiosPromise<NetworkLineVO> => {
  return request({
    url: '/pve/networkLine/' + lineId,
    method: 'get'
  });
};

/**
 * 新增线路管理
 * @param data
 */
export const addNetworkLine = (data: NetworkLineForm) => {
  return request({
    url: '/pve/networkLine',
    method: 'post',
    data: data
  });
};

/**
 * 修改线路管理
 * @param data
 */
export const updateNetworkLine = (data: NetworkLineForm) => {
  return request({
    url: '/pve/networkLine',
    method: 'put',
    data: data
  });
};

/**
 * 删除线路管理
 * @param lineId
 */
export const delNetworkLine = (lineId: string | number | Array<string | number>) => {
  return request({
    url: '/pve/networkLine/' + lineId,
    method: 'delete'
  });
};

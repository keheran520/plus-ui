import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PrivateIpVO, PrivateIpForm, PrivateIpQuery } from '@/api/pve/privateIp/types';

/**
 * 查询私网IP列表
 * @param query
 * @returns {*}
 */

export const listPrivateIp = (query?: PrivateIpQuery): AxiosPromise<PrivateIpVO[]> => {
  return request({
    url: '/pve/privateIp/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询私网IP详细
 * @param ipId
 */
export const getPrivateIp = (ipId: string | number): AxiosPromise<PrivateIpVO> => {
  return request({
    url: '/pve/privateIp/' + ipId,
    method: 'get'
  });
};

/**
 * 新增私网IP
 * @param data
 */
export const addPrivateIp = (data: PrivateIpForm) => {
  return request({
    url: '/pve/privateIp',
    method: 'post',
    data: data
  });
};

/**
 * 修改私网IP
 * @param data
 */
export const updatePrivateIp = (data: PrivateIpForm) => {
  return request({
    url: '/pve/privateIp',
    method: 'put',
    data: data
  });
};

/**
 * 删除私网IP
 * @param ipId
 */
export const delPrivateIp = (ipId: string | number | Array<string | number>) => {
  return request({
    url: '/pve/privateIp/' + ipId,
    method: 'delete'
  });
};

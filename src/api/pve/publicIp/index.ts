import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PublicIpVO, PublicIpForm, PublicIpQuery } from '@/api/pve/publicIp/types';

/**
 * 查询公网IP列表
 * @param query
 * @returns {*}
 */

export const listPublicIp = (query?: PublicIpQuery): AxiosPromise<PublicIpVO[]> => {
  return request({
    url: '/pve/publicIp/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询公网IP详细
 * @param ipId
 */
export const getPublicIp = (ipId: string | number): AxiosPromise<PublicIpVO> => {
  return request({
    url: '/pve/publicIp/' + ipId,
    method: 'get'
  });
};

/**
 * 新增公网IP
 * @param data
 */
export const addPublicIp = (data: PublicIpForm) => {
  return request({
    url: '/pve/publicIp',
    method: 'post',
    data: data
  });
};

/**
 * 修改公网IP
 * @param data
 */
export const updatePublicIp = (data: PublicIpForm) => {
  return request({
    url: '/pve/publicIp',
    method: 'put',
    data: data
  });
};

/**
 * 删除公网IP
 * @param ipId
 */
export const delPublicIp = (ipId: string | number | Array<string | number>) => {
  return request({
    url: '/pve/publicIp/' + ipId,
    method: 'delete'
  });
};

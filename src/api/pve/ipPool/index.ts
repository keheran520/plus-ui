import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IpPoolVO, IpPoolForm, IpPoolQuery } from '@/api/pve/ipPool/types';

/**
 * 查询IP地址池列表
 * @param query
 * @returns {*}
 */

export const listIpPool = (query?: IpPoolQuery): AxiosPromise<IpPoolVO[]> => {
  return request({
    url: '/pve/ipPool/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询IP地址池详细
 * @param poolId
 */
export const getIpPool = (poolId: string | number): AxiosPromise<IpPoolVO> => {
  return request({
    url: '/pve/ipPool/' + poolId,
    method: 'get'
  });
};

/**
 * 新增IP地址池
 * @param data
 */
export const addIpPool = (data: IpPoolForm) => {
  return request({
    url: '/pve/ipPool',
    method: 'post',
    data: data
  });
};

/**
 * 修改IP地址池
 * @param data
 */
export const updateIpPool = (data: IpPoolForm) => {
  return request({
    url: '/pve/ipPool',
    method: 'put',
    data: data
  });
};

/**
 * 删除IP地址池
 * @param poolId
 */
export const delIpPool = (poolId: string | number | Array<string | number>) => {
  return request({
    url: '/pve/ipPool/' + poolId,
    method: 'delete'
  });
};

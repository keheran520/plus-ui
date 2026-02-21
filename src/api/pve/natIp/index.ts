import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { NatIpVO, NatIpForm, NatIpQuery } from '@/api/pve/natIp/types';

/**
 * 查询NAT内网IP列表
 * @param query
 * @returns {*}
 */

export const listNatIp = (query?: NatIpQuery): AxiosPromise<NatIpVO[]> => {
  return request({
    url: '/pve/natIp/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询NAT内网IP详细
 * @param natId
 */
export const getNatIp = (natId: string | number): AxiosPromise<NatIpVO> => {
  return request({
    url: '/pve/natIp/' + natId,
    method: 'get'
  });
};

/**
 * 新增NAT内网IP
 * @param data
 */
export const addNatIp = (data: NatIpForm) => {
  return request({
    url: '/pve/natIp',
    method: 'post',
    data: data
  });
};

/**
 * 修改NAT内网IP
 * @param data
 */
export const updateNatIp = (data: NatIpForm) => {
  return request({
    url: '/pve/natIp',
    method: 'put',
    data: data
  });
};

/**
 * 删除NAT内网IP
 * @param natId
 */
export const delNatIp = (natId: string | number | Array<string | number>) => {
  return request({
    url: '/pve/natIp/' + natId,
    method: 'delete'
  });
};

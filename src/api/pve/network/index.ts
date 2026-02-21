import request from '@/utils/request';
import type { PveNetworkVO, PveNetworkForm, PveNetworkQuery } from './types';
import type { AxiosPromise } from 'axios';

// 查询PVE网络列表
export function listNetwork(query: PveNetworkQuery): AxiosPromise<any> {
  return request({
    url: '/pve/network/list',
    method: 'get',
    params: query
  });
}

// 查询PVE网络详细
export function getNetwork(networkId: string | number): AxiosPromise<PveNetworkVO> {
  return request({
    url: '/pve/network/' + networkId,
    method: 'get'
  });
}

// 新增PVE网络
export function addNetwork(data: PveNetworkForm) {
  return request({
    url: '/pve/network',
    method: 'post',
    data: data
  });
}

// 修改PVE网络
export function updateNetwork(data: PveNetworkForm) {
  return request({
    url: '/pve/network',
    method: 'put',
    data: data
  });
}

// 删除PVE网络
export function delNetwork(networkId: string | number | Array<string | number>) {
  return request({
    url: '/pve/network/' + networkId,
    method: 'delete'
  });
}

// 获取网络统计概览
export function getOverview() {
  return request({
    url: '/pve/network/overview',
    method: 'get'
  });
}

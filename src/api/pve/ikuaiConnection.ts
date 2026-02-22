import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { IkuaiConnectionVO, IkuaiConnectionForm, IkuaiConnectionQuery } from './ikuaiConnection/types';

/**
 * 查询iKuai路由器连接列表
 * @param query
 * @returns {*}
 */
export const listIkuaiConnection = (query: IkuaiConnectionQuery): AxiosPromise<IkuaiConnectionVO[]> => {
  return request({
    url: '/pve/ikuaiConnection/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询iKuai路由器连接详细
 * @param connectionId
 */
export const getIkuaiConnection = (connectionId: string | number): AxiosPromise<IkuaiConnectionVO> => {
  return request({
    url: '/pve/ikuaiConnection/' + connectionId,
    method: 'get'
  });
};

/**
 * 新增iKuai路由器连接
 * @param data
 */
export const addIkuaiConnection = (data: IkuaiConnectionForm) => {
  return request({
    url: '/pve/ikuaiConnection',
    method: 'post',
    data: data
  });
};

/**
 * 修改iKuai路由器连接
 * @param data
 */
export const updateIkuaiConnection = (data: IkuaiConnectionForm) => {
  return request({
    url: '/pve/ikuaiConnection',
    method: 'put',
    data: data
  });
};

/**
 * 删除iKuai路由器连接
 * @param connectionId
 */
export const delIkuaiConnection = (connectionId: string | number | Array<string | number>) => {
  return request({
    url: '/pve/ikuaiConnection/' + connectionId,
    method: 'delete'
  });
};

/**
 * 测试iKuai连接
 * @param connectionId
 */
export const testIkuaiConnection = (connectionId: string | number) => {
  return request({
    url: '/pve/ikuaiConnection/test/' + connectionId,
    method: 'post'
  });
};

/**
 * 同步iKuai网络信息
 * @param connectionId
 */
export const syncIkuaiNetworkInfo = (connectionId: string | number) => {
  return request({
    url: '/pve/ikuaiConnection/sync/' + connectionId,
    method: 'post'
  });
};

/**
 * 获取所有可用的iKuai连接（用于下拉选择）
 */
export const getAvailableConnections = (): AxiosPromise<IkuaiConnectionVO[]> => {
  return request({
    url: '/pve/ikuaiConnection/available',
    method: 'get'
  });
};

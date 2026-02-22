import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IkuaiConnectionVO, IkuaiConnectionForm, IkuaiConnectionQuery } from '@/api/pve/ikuaiConnection/types';

/**
 * 查询iKuai路由器连接配置列表
 * @param query
 * @returns {*}
 */

export const listIkuaiConnection = (query?: IkuaiConnectionQuery): AxiosPromise<IkuaiConnectionVO[]> => {
  return request({
    url: '/pve/ikuaiConnection/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询iKuai路由器连接配置详细
 * @param connectionId
 */
export const getIkuaiConnection = (connectionId: string | number): AxiosPromise<IkuaiConnectionVO> => {
  return request({
    url: '/pve/ikuaiConnection/' + connectionId,
    method: 'get'
  });
};

/**
 * 新增iKuai路由器连接配置
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
 * 修改iKuai路由器连接配置
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
 * 删除iKuai路由器连接配置
 * @param connectionId
 */
export const delIkuaiConnection = (connectionId: string | number | Array<string | number>) => {
  return request({
    url: '/pve/ikuaiConnection/' + connectionId,
    method: 'delete'
  });
};

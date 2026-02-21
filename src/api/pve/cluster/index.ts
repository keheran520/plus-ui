import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ClusterVO, ClusterForm, ClusterQuery } from '@/api/pve/cluster/types';

/**
 * 查询PVE集群列表
 * @param query
 * @returns {*}
 */

export const listCluster = (query?: ClusterQuery): AxiosPromise<ClusterVO[]> => {
  return request({
    url: '/pve/cluster/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询PVE集群详细
 * @param clusterId
 */
export const getCluster = (clusterId: string | number): AxiosPromise<ClusterVO> => {
  return request({
    url: '/pve/cluster/' + clusterId,
    method: 'get'
  });
};

/**
 * 新增PVE集群
 * @param data
 */
export const addCluster = (data: ClusterForm) => {
  return request({
    url: '/pve/cluster',
    method: 'post',
    data: data
  });
};

/**
 * 修改PVE集群
 * @param data
 */
export const updateCluster = (data: ClusterForm) => {
  return request({
    url: '/pve/cluster',
    method: 'put',
    data: data
  });
};

/**
 * 删除PVE集群
 * @param clusterId
 */
export const delCluster = (clusterId: string | number | Array<string | number>) => {
  return request({
    url: '/pve/cluster/' + clusterId,
    method: 'delete'
  });
};

/**
 * 测试集群连接
 * @param clusterId
 */
export const testConnection = (clusterId: string | number): AxiosPromise<boolean> => {
  return request({
    url: '/pve/cluster/test/' + clusterId,
    method: 'post'
  });
};

/**
 * 获取集群状态
 * @param clusterId
 */
export const getClusterStatus = (clusterId: string | number): AxiosPromise<any> => {
  return request({
    url: '/pve/cluster/status/' + clusterId,
    method: 'get'
  });
};

/**
 * 同步集群信息
 * @param clusterId
 */
export const syncClusterInfo = (clusterId: string | number) => {
  return request({
    url: '/pve/cluster/sync/' + clusterId,
    method: 'post'
  });
};

/**
 * 获取PVE统计概览
 */
export const getOverview = (): AxiosPromise<any> => {
  return request({
    url: '/pve/cluster/overview',
    method: 'get'
  });
};

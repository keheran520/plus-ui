import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

/**
 * 仪表盘统计数据
 */
export interface DashboardStatistics {
  totalNodes: number;
  nodesTrend: number;
  totalVMs: number;
  vmsTrend: number;
  totalIkuai: number;
  ikuaiTrend: number;
  totalAlerts: number;
  alertsTrend: number;
}

/**
 * 集群健康状态
 */
export interface ClusterHealth {
  id: number;
  name: string;
  nodes: number;
  cpuUsage: number;
  memoryUsage: number;
  healthScore: number;
}

/**
 * iKuai路由器健康状态
 */
export interface IkuaiHealth {
  id: number;
  name: string;
  ip: string;
  status: string;
  onlineDevices: number;
  bandwidth: string;
  uptime: string;
}

/**
 * 节点信息
 */
export interface DashboardNode {
  id: number;
  name: string;
  status: string;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  vmCount: number;
  uptime: string;
  ip: string;
}

/**
 * 告警信息
 */
export interface DashboardAlert {
  id: number;
  level: string;
  levelText: string;
  source: string;
  message: string;
  time: string;
}

/**
 * 图表数据
 */
export interface ChartData {
  xAxisData: string[];
  seriesData: Record<string, number[]>;
}

/**
 * 获取仪表盘统计数据
 */
export const getDashboardStatistics = (): AxiosPromise<DashboardStatistics> => {
  return request({
    url: '/pve/dashboard/statistics',
    method: 'get'
  });
};

/**
 * 获取集群健康状态
 */
export const getClusterHealth = (): AxiosPromise<ClusterHealth[]> => {
  return request({
    url: '/pve/dashboard/clusterHealth',
    method: 'get'
  });
};

/**
 * 获取iKuai路由器健康状态
 */
export const getIkuaiHealth = (): AxiosPromise<IkuaiHealth[]> => {
  return request({
    url: '/pve/dashboard/ikuaiHealth',
    method: 'get'
  });
};

/**
 * 获取节点列表
 */
export const getDashboardNodes = (): AxiosPromise<DashboardNode[]> => {
  return request({
    url: '/pve/dashboard/nodes',
    method: 'get'
  });
};

/**
 * 获取告警列表
 */
export const getDashboardAlerts = (): AxiosPromise<DashboardAlert[]> => {
  return request({
    url: '/pve/dashboard/alerts',
    method: 'get'
  });
};

/**
 * 获取CPU使用趋势数据
 * @param range 时间范围：1h, 6h, 24h, 7d
 */
export const getCpuTrend = (range: string = '24h'): AxiosPromise<ChartData> => {
  return request({
    url: '/pve/dashboard/cpuTrend',
    method: 'get',
    params: { range }
  });
};

/**
 * 获取内存使用趋势数据
 * @param range 时间范围：1h, 6h, 24h, 7d
 */
export const getMemoryTrend = (range: string = '24h'): AxiosPromise<ChartData> => {
  return request({
    url: '/pve/dashboard/memoryTrend',
    method: 'get',
    params: { range }
  });
};

/**
 * 清空所有告警
 */
export const clearAllAlerts = () => {
  return request({
    url: '/pve/dashboard/alerts',
    method: 'delete'
  });
};

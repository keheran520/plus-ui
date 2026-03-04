import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { PveNodeVO, PveNodeForm, PveNodeQuery } from './types';

// 查询PVE节点列表
export function listPveNode(query: PveNodeQuery): AxiosPromise<PveNodeVO[]> {
  return request({
    url: '/pve/node/list',
    method: 'get',
    params: query
  });
}

// 别名导出,兼容简短命名
export const listNode = listPveNode;

// 查询PVE节点详细
export function getPveNode(nodeId: string | number): AxiosPromise<PveNodeVO> {
  return request({
    url: '/pve/node/' + nodeId,
    method: 'get'
  });
}

// 新增PVE节点
export function addPveNode(data: PveNodeForm) {
  return request({
    url: '/pve/node',
    method: 'post',
    data: data
  });
}

// 修改PVE节点
export function updatePveNode(data: PveNodeForm) {
  return request({
    url: '/pve/node',
    method: 'put',
    data: data
  });
}

// 删除PVE节点
export function delPveNode(nodeId: string | number | Array<string | number>) {
  return request({
    url: '/pve/node/' + nodeId,
    method: 'delete'
  });
}

// 同步节点信息
export function syncNodeInfo(nodeId: string | number) {
  return request({
    url: '/pve/node/sync/' + nodeId,
    method: 'post'
  });
}

// 获取节点状态
export function getNodeStatus(nodeId: string | number) {
  return request({
    url: '/pve/node/status/' + nodeId,
    method: 'get'
  });
}

// 同步节点全部数据(网络、存储、虚拟机、云硬盘)
export function syncAllData(nodeId: string | number) {
  return request({
    url: '/pve/node/syncAll/' + nodeId,
    method: 'post'
  });
}

// 完善节点配置
export function completeNodeConfig(nodeId: string | number, data: any) {
  return request({
    url: '/pve/node/completeConfig/' + nodeId,
    method: 'post',
    data: data
  });
}

// 获取节点可用的存储池列表
export function getNodeStorages(nodeId: string | number) {
  return request({
    url: '/pve/node/storages/' + nodeId,
    method: 'get'
  });
}

// 获取节点可用的网络接口列表
export function getNodeNetworks(nodeId: string | number) {
  return request({
    url: '/pve/node/networks/' + nodeId,
    method: 'get'
  });
}

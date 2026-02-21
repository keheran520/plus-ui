import request from '@/utils/request';
import type { PveCloudDiskVO, PveCloudDiskForm, PveCloudDiskQuery } from './types';
import type { AxiosPromise } from 'axios';

// 查询云硬盘列表
export function listCloudDisk(query: PveCloudDiskQuery): AxiosPromise<any> {
  return request({
    url: '/pve/cloudDisk/list',
    method: 'get',
    params: query
  });
}

// 查询云硬盘详细
export function getCloudDisk(diskId: string | number): AxiosPromise<PveCloudDiskVO> {
  return request({
    url: '/pve/cloudDisk/' + diskId,
    method: 'get'
  });
}

// 新增云硬盘
export function addCloudDisk(data: PveCloudDiskForm) {
  return request({
    url: '/pve/cloudDisk',
    method: 'post',
    data: data
  });
}

// 修改云硬盘
export function updateCloudDisk(data: PveCloudDiskForm) {
  return request({
    url: '/pve/cloudDisk',
    method: 'put',
    data: data
  });
}

// 删除云硬盘
export function delCloudDisk(diskId: string | number | Array<string | number>) {
  return request({
    url: '/pve/cloudDisk/' + diskId,
    method: 'delete'
  });
}

// 获取云硬盘统计概览
export function getOverview() {
  return request({
    url: '/pve/cloudDisk/overview',
    method: 'get'
  });
}

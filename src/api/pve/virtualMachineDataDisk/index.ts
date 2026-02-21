import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { VirtualMachineDataDiskVO, VirtualMachineDataDiskForm, VirtualMachineDataDiskQuery } from '@/api/pve/virtualMachineDataDisk/types';

/**
 * 查询虚拟机数据盘列表
 * @param query
 * @returns {*}
 */

export const listVirtualMachineDataDisk = (query?: VirtualMachineDataDiskQuery): AxiosPromise<VirtualMachineDataDiskVO[]> => {
  return request({
    url: '/pve/virtualMachineDataDisk/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询虚拟机数据盘详细
 * @param diskId
 */
export const getVirtualMachineDataDisk = (diskId: string | number): AxiosPromise<VirtualMachineDataDiskVO> => {
  return request({
    url: '/pve/virtualMachineDataDisk/' + diskId,
    method: 'get'
  });
};

/**
 * 新增虚拟机数据盘
 * @param data
 */
export const addVirtualMachineDataDisk = (data: VirtualMachineDataDiskForm) => {
  return request({
    url: '/pve/virtualMachineDataDisk',
    method: 'post',
    data: data
  });
};

/**
 * 修改虚拟机数据盘
 * @param data
 */
export const updateVirtualMachineDataDisk = (data: VirtualMachineDataDiskForm) => {
  return request({
    url: '/pve/virtualMachineDataDisk',
    method: 'put',
    data: data
  });
};

/**
 * 删除虚拟机数据盘
 * @param diskId
 */
export const delVirtualMachineDataDisk = (diskId: string | number | Array<string | number>) => {
  return request({
    url: '/pve/virtualMachineDataDisk/' + diskId,
    method: 'delete'
  });
};

import request from '@/utils/request';
import type { PveVirtualMachineVO, PveVirtualMachineForm, PveVirtualMachineQuery } from './types';
import type { AxiosPromise } from 'axios';

// 查询虚拟机列表
export function listVirtualMachine(query: PveVirtualMachineQuery): AxiosPromise<any> {
  return request({
    url: '/pve/virtualMachine/list',
    method: 'get',
    params: query
  });
}

// 查询虚拟机详细
export function getVirtualMachine(vmId: string | number): AxiosPromise<PveVirtualMachineVO> {
  return request({
    url: '/pve/virtualMachine/' + vmId,
    method: 'get'
  });
}

// 新增虚拟机
export function addVirtualMachine(data: PveVirtualMachineForm) {
  return request({
    url: '/pve/virtualMachine',
    method: 'post',
    data: data
  });
}

// 修改虚拟机
export function updateVirtualMachine(data: PveVirtualMachineForm) {
  return request({
    url: '/pve/virtualMachine',
    method: 'put',
    data: data
  });
}

// 删除虚拟机
export function delVirtualMachine(vmId: string | number | Array<string | number>) {
  return request({
    url: '/pve/virtualMachine/' + vmId,
    method: 'delete'
  });
}

// 获取虚拟机统计概览
export function getOverview() {
  return request({
    url: '/pve/virtualMachine/overview',
    method: 'get'
  });
}

// 启动虚拟机
export function startVirtualMachine(vmId: string | number) {
  return request({
    url: '/pve/virtualMachine/start/' + vmId,
    method: 'post'
  });
}

// 停止虚拟机
export function stopVirtualMachine(vmId: string | number) {
  return request({
    url: '/pve/virtualMachine/stop/' + vmId,
    method: 'post'
  });
}

// 重启虚拟机
export function restartVirtualMachine(vmId: string | number) {
  return request({
    url: '/pve/virtualMachine/restart/' + vmId,
    method: 'post'
  });
}

// 获取虚拟机状态
export function getVirtualMachineStatus(vmId: string | number) {
  return request({
    url: '/pve/virtualMachine/status/' + vmId,
    method: 'get'
  });
}

// 获取VNC连接信息
export function getVncInfo(vmId: string | number) {
  return request({
    url: '/pve/virtualMachine/console/' + vmId,
    method: 'get'
  });
}

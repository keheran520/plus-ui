export interface PveVirtualMachineVO {
  vmId: string | number;
  vmName: string;
  pveVmId: number;
  nodeId: number;
  nodeName: string;
  status: string;
  osType: string;
  imageId: number;
  imageName: string;
  cpuCores: number;
  memorySize: number;
  systemDiskSize: number;
  privateIpId: number;
  publicIpId: number;
  rootPassword: string;
  autoStart: string;
  creationStatus: string;
  creationProgress: number;
  creationError: string;
  taskId: string;
  remark: string;
  createTime: string;
  updateTime: string;
}

export interface PveVirtualMachineForm extends Partial<PveVirtualMachineVO> {}

export interface PveVirtualMachineQuery extends PageQuery {
  vmName?: string;
  pveVmId?: number;
  nodeId?: number;
  nodeName?: string;
  status?: string;
  osType?: string;
  imageId?: number;
  imageName?: string;
  cpuCores?: number;
  memorySize?: number;
  systemDiskSize?: number;
  privateIpId?: number;
  publicIpId?: number;
  autoStart?: string;
  creationStatus?: string;
  pageNum?: number;
  pageSize?: number;
}

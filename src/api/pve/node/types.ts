export interface PveNodeVO {
  nodeId: string | number;
  clusterId: string | number;
  clusterName?: string;
  nodeName: string;
  ipAddress: string;
  apiPort: number;
  status: string;
  nodeType: string;
  cpuCores: number;
  memorySize: number;
  storageSize: number;
  maxVmCount: number;
  memoryThreshold: number;
  systemStorageThreshold: number;
  dataStorageThreshold: number;
  templateStorage: string | number;
  systemDiskStorage: string | number;
  dataDiskStorage: string | number;
  isoStorage: string | number;
  backupStorage: string | number;
  publicBridge: string | number;
  privateBridge: string | number;
  vncHost: string;
  vncPort: number;
  vncPassword: string;
  description: string;
  sort: number;
  createTime: string;
  updateTime: string;
}

export interface PveNodeForm extends Partial<PveNodeVO> {
  nodeId?: string | number;
}

export interface PveNodeQuery extends PageQuery {
  clusterId?: string | number;
  nodeName?: string;
  ipAddress?: string;
  status?: string;
  nodeType?: string;
}

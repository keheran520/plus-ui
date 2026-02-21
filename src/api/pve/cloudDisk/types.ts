export interface PveCloudDiskVO {
  diskId: string | number;
  diskName: string;
  pveDiskId: string;
  nodeId: number;
  storageId: number;
  size: number;
  diskType: string;
  diskFormat: string;
  busType: string;
  status: string;
  vmId: number;
  deviceName: string;
  remark: string;
  createTime: string;
  updateTime: string;
}

export interface PveCloudDiskForm extends Partial<PveCloudDiskVO> {}

export interface PveCloudDiskQuery extends PageQuery {
  diskName?: string;
  pveDiskId?: string;
  nodeId?: number;
  storageId?: number;
  size?: number;
  diskType?: string;
  diskFormat?: string;
  busType?: string;
  status?: string;
  vmId?: number;
  deviceName?: string;
  pageNum?: number;
  pageSize?: number;
}

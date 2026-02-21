export interface VirtualMachineDataDiskVO {
  /**
   * 数据盘ID
   */
  diskId: string | number;

  /**
   * 虚拟机ID
   */
  vmId: string | number;

  /**
   * 磁盘序号(1-10)
   */
  diskIndex: number;

  /**
   * 磁盘大小(GB)
   */
  diskSize: number;

  /**
   * 磁盘类型(ssd/hdd)
   */
  diskType: string;

  /**
   * 存储池名称
   */
  storagePool: string;

  /**
   * PVE磁盘标识符(如: scsi1, virtio1等)
   */
  pveIdentifier: string | number;

  /**
   * 磁盘状态(creating/active/deleting/error)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;

}

export interface VirtualMachineDataDiskForm extends BaseEntity {
  /**
   * 数据盘ID
   */
  diskId?: string | number;

  /**
   * 虚拟机ID
   */
  vmId?: string | number;

  /**
   * 磁盘序号(1-10)
   */
  diskIndex?: number;

  /**
   * 磁盘大小(GB)
   */
  diskSize?: number;

  /**
   * 磁盘类型(ssd/hdd)
   */
  diskType?: string;

  /**
   * 存储池名称
   */
  storagePool?: string;

  /**
   * PVE磁盘标识符(如: scsi1, virtio1等)
   */
  pveIdentifier?: string | number;

  /**
   * 磁盘状态(creating/active/deleting/error)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface VirtualMachineDataDiskQuery extends PageQuery {

  /**
   * 虚拟机ID
   */
  vmId?: string | number;

  /**
   * 磁盘序号(1-10)
   */
  diskIndex?: number;

  /**
   * 磁盘大小(GB)
   */
  diskSize?: number;

  /**
   * 磁盘类型(ssd/hdd)
   */
  diskType?: string;

  /**
   * 存储池名称
   */
  storagePool?: string;

  /**
   * PVE磁盘标识符(如: scsi1, virtio1等)
   */
  pveIdentifier?: string | number;

  /**
   * 磁盘状态(creating/active/deleting/error)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

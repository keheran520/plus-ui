export interface StorageVO {
  /**
   * 存储ID
   */
  storageId: string | number;

  /**
   * 所属节点ID
   */
  nodeId: string | number;

  /**
   * 存储名称
   */
  storageName: string;

  /**
   * PVE存储标识
   */
  pveStorageId: string | number;

  /**
   * 存储类型(dir/lvm/lvmthin/zfspool/nfs/cifs/iscsi/rbd/glusterfs)
   */
  storageType: string;

  /**
   * 路径
   */
  path: string;

  /**
   * 服务器地址
   */
  server: string;

  /**
   * 导出路径(NFS)
   */
  export: string;

  /**
   * 共享名(CIFS)
   */
  share: string;

  /**
   * 用户名(CIFS/NFS等需要认证的存储)
   */
  username: string;

  /**
   * 密码(加密)
   */
  password: string;

  /**
   * 门户地址(iSCSI)
   */
  portal: string;

  /**
   * 目标名称(iSCSI)
   */
  target: string;

  /**
   * 池名称(Ceph RBD)
   */
  pool: string;

  /**
   * 内容类型(逗号分隔: images,iso,backup等)
   */
  contentTypes: string;

  /**
   * 是否启用(0:禁用 1:启用)
   */
  enabled: string;

  /**
   * 总容量(字节)
   */
  totalSize: number;

  /**
   * 已使用(字节)
   */
  usedSize: number;

  /**
   * 可用容量(字节)
   */
  availableSize: number;

  /**
   * 描述
   */
  description: string;

}

export interface StorageForm extends BaseEntity {
  /**
   * 存储ID
   */
  storageId?: string | number;

  /**
   * 所属节点ID
   */
  nodeId?: string | number;

  /**
   * 存储名称
   */
  storageName?: string;

  /**
   * PVE存储标识
   */
  pveStorageId?: string | number;

  /**
   * 存储类型(dir/lvm/lvmthin/zfspool/nfs/cifs/iscsi/rbd/glusterfs)
   */
  storageType?: string;

  /**
   * 路径
   */
  path?: string;

  /**
   * 服务器地址
   */
  server?: string;

  /**
   * 导出路径(NFS)
   */
  export?: string;

  /**
   * 共享名(CIFS)
   */
  share?: string;

  /**
   * 用户名(CIFS/NFS等需要认证的存储)
   */
  username?: string;

  /**
   * 密码(加密)
   */
  password?: string;

  /**
   * 门户地址(iSCSI)
   */
  portal?: string;

  /**
   * 目标名称(iSCSI)
   */
  target?: string;

  /**
   * 池名称(Ceph RBD)
   */
  pool?: string;

  /**
   * 内容类型(逗号分隔: images,iso,backup等)
   */
  contentTypes?: string;

  /**
   * 是否启用(0:禁用 1:启用)
   */
  enabled?: string;

  /**
   * 总容量(字节)
   */
  totalSize?: number;

  /**
   * 已使用(字节)
   */
  usedSize?: number;

  /**
   * 可用容量(字节)
   */
  availableSize?: number;

  /**
   * 描述
   */
  description?: string;

}

export interface StorageQuery extends PageQuery {

  /**
   * 所属节点ID
   */
  nodeId?: string | number;

  /**
   * 存储名称
   */
  storageName?: string;

  /**
   * PVE存储标识
   */
  pveStorageId?: string | number;

  /**
   * 存储类型(dir/lvm/lvmthin/zfspool/nfs/cifs/iscsi/rbd/glusterfs)
   */
  storageType?: string;

  /**
   * 路径
   */
  path?: string;

  /**
   * 服务器地址
   */
  server?: string;

  /**
   * 导出路径(NFS)
   */
  export?: string;

  /**
   * 共享名(CIFS)
   */
  share?: string;

  /**
   * 用户名(CIFS/NFS等需要认证的存储)
   */
  username?: string;

  /**
   * 密码(加密)
   */
  password?: string;

  /**
   * 门户地址(iSCSI)
   */
  portal?: string;

  /**
   * 目标名称(iSCSI)
   */
  target?: string;

  /**
   * 池名称(Ceph RBD)
   */
  pool?: string;

  /**
   * 内容类型(逗号分隔: images,iso,backup等)
   */
  contentTypes?: string;

  /**
   * 是否启用(0:禁用 1:启用)
   */
  enabled?: string;

  /**
   * 总容量(字节)
   */
  totalSize?: number;

  /**
   * 已使用(字节)
   */
  usedSize?: number;

  /**
   * 可用容量(字节)
   */
  availableSize?: number;

  /**
   * 描述
   */
  description?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

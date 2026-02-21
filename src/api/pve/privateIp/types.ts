export interface PrivateIpVO {
  /**
   * IP ID
   */
  ipId: string | number;

  /**
   * IP地址
   */
  ipAddress: string;

  /**
   * 所属地址池ID
   */
  poolId: string | number;

  /**
   * 子网掩码
   */
  subnetMask: string;

  /**
   * 网关
   */
  gateway: string;

  /**
   * MAC地址
   */
  macAddress: string;

  /**
   * 使用状态(available/used/reserved)
   */
  status: string;

  /**
   * 绑定虚拟机ID
   */
  vmId: string | number;

  /**
   * VLAN ID
   */
  vlanId: string | number;

  /**
   * 备注
   */
  remark: string;

}

export interface PrivateIpForm extends BaseEntity {
  /**
   * IP ID
   */
  ipId?: string | number;

  /**
   * IP地址
   */
  ipAddress?: string;

  /**
   * 所属地址池ID
   */
  poolId?: string | number;

  /**
   * 子网掩码
   */
  subnetMask?: string;

  /**
   * 网关
   */
  gateway?: string;

  /**
   * MAC地址
   */
  macAddress?: string;

  /**
   * 使用状态(available/used/reserved)
   */
  status?: string;

  /**
   * 绑定虚拟机ID
   */
  vmId?: string | number;

  /**
   * VLAN ID
   */
  vlanId?: string | number;

  /**
   * 备注
   */
  remark?: string;

}

export interface PrivateIpQuery extends PageQuery {

  /**
   * IP地址
   */
  ipAddress?: string;

  /**
   * 所属地址池ID
   */
  poolId?: string | number;

  /**
   * 子网掩码
   */
  subnetMask?: string;

  /**
   * 网关
   */
  gateway?: string;

  /**
   * MAC地址
   */
  macAddress?: string;

  /**
   * 使用状态(available/used/reserved)
   */
  status?: string;

  /**
   * 绑定虚拟机ID
   */
  vmId?: string | number;

  /**
   * VLAN ID
   */
  vlanId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}

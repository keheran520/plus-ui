export interface PublicIpVO {
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
   * 使用状态(available/used/reserved)
   */
  status: string;

  /**
   * 绑定虚拟机ID
   */
  vmId: string | number;

  /**
   * 线路ID
   */
  lineId: string | number;

  /**
   * 备注
   */
  remark: string;

}

export interface PublicIpForm extends BaseEntity {
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
   * 使用状态(available/used/reserved)
   */
  status?: string;

  /**
   * 绑定虚拟机ID
   */
  vmId?: string | number;

  /**
   * 线路ID
   */
  lineId?: string | number;

  /**
   * 备注
   */
  remark?: string;

}

export interface PublicIpQuery extends PageQuery {

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
   * 使用状态(available/used/reserved)
   */
  status?: string;

  /**
   * 绑定虚拟机ID
   */
  vmId?: string | number;

  /**
   * 线路ID
   */
  lineId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}

export interface IpPoolVO {
  /**
   * 地址池ID
   */
  poolId: string | number;

  /**
   * 所属节点ID
   */
  nodeId: string | number;

  /**
   * 地址池名称
   */
  poolName: string;

  /**
   * IP类型(private/public/nat)
   */
  ipType: string;

  /**
   * 是否默认地址池(0:否 1:是)
   */
  isDefault: string;

  /**
   * 起始IP
   */
  startIp: string;

  /**
   * 结束IP
   */
  endIp: string;

  /**
   * 子网掩码
   */
  subnetMask: string;

  /**
   * 网关
   */
  gateway: string;

  /**
   * DNS服务器
   */
  dnsServer: string;

  /**
   * VLAN ID
   */
  vlanId: string | number;

  /**
   * 总IP数量
   */
  totalIps: number;

  /**
   * 已用IP数量
   */
  usedIps: number;

  /**
   * 可用IP数量
   */
  availableIps: number;

  /**
   * 描述
   */
  description: string;

  /**
   * 排序
   */
  sort: number;

  /**
   * 状态(0:正常 1:停用)
   */
  status: string;

}

export interface IpPoolForm extends BaseEntity {
  /**
   * 地址池ID
   */
  poolId?: string | number;

  /**
   * 所属节点ID
   */
  nodeId?: string | number;

  /**
   * 地址池名称
   */
  poolName?: string;

  /**
   * IP类型(private/public/nat)
   */
  ipType?: string;

  /**
   * 是否默认地址池(0:否 1:是)
   */
  isDefault?: string;

  /**
   * 起始IP
   */
  startIp?: string;

  /**
   * 结束IP
   */
  endIp?: string;

  /**
   * 子网掩码
   */
  subnetMask?: string;

  /**
   * 网关
   */
  gateway?: string;

  /**
   * DNS服务器
   */
  dnsServer?: string;

  /**
   * VLAN ID
   */
  vlanId?: string | number;

  /**
   * 总IP数量
   */
  totalIps?: number;

  /**
   * 已用IP数量
   */
  usedIps?: number;

  /**
   * 描述
   */
  description?: string;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 状态(0:正常 1:停用)
   */
  status?: string;

}

export interface IpPoolQuery extends PageQuery {

  /**
   * 所属节点ID
   */
  nodeId?: string | number;

  /**
   * 地址池名称
   */
  poolName?: string;

  /**
   * IP类型(private/public/nat)
   */
  ipType?: string;

  /**
   * 是否默认地址池(0:否 1:是)
   */
  isDefault?: string;

  /**
   * 起始IP
   */
  startIp?: string;

  /**
   * 结束IP
   */
  endIp?: string;

  /**
   * 子网掩码
   */
  subnetMask?: string;

  /**
   * 网关
   */
  gateway?: string;

  /**
   * DNS服务器
   */
  dnsServer?: string;

  /**
   * VLAN ID
   */
  vlanId?: string | number;

  /**
   * 总IP数量
   */
  totalIps?: number;

  /**
   * 已用IP数量
   */
  usedIps?: number;

  /**
   * 描述
   */
  description?: string;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 状态(0:正常 1:停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

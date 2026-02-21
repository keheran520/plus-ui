export interface NatIpVO {
  /**
   * NAT ID
   */
  natId: string | number;

  /**
   * 内网IP地址
   */
  privateIp: string;

  /**
   * 公网IP地址
   */
  publicIp: string;

  /**
   * 内网端口
   */
  privatePort: number;

  /**
   * 公网端口
   */
  publicPort: number;

  /**
   * 协议类型(TCP/UDP/ALL)
   */
  protocol: string;

  /**
   * 使用状态(available/used)
   */
  status: string;

  /**
   * 绑定虚拟机ID
   */
  vmId: string | number;

  /**
   * NAT规则名称
   */
  ruleName: string;

  /**
   * 备注
   */
  remark: string;

}

export interface NatIpForm extends BaseEntity {
  /**
   * NAT ID
   */
  natId?: string | number;

  /**
   * 内网IP地址
   */
  privateIp?: string;

  /**
   * 公网IP地址
   */
  publicIp?: string;

  /**
   * 内网端口
   */
  privatePort?: number;

  /**
   * 公网端口
   */
  publicPort?: number;

  /**
   * 协议类型(TCP/UDP/ALL)
   */
  protocol?: string;

  /**
   * 使用状态(available/used)
   */
  status?: string;

  /**
   * 绑定虚拟机ID
   */
  vmId?: string | number;

  /**
   * NAT规则名称
   */
  ruleName?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface NatIpQuery extends PageQuery {

  /**
   * 内网IP地址
   */
  privateIp?: string;

  /**
   * 公网IP地址
   */
  publicIp?: string;

  /**
   * 内网端口
   */
  privatePort?: number;

  /**
   * 公网端口
   */
  publicPort?: number;

  /**
   * 协议类型(TCP/UDP/ALL)
   */
  protocol?: string;

  /**
   * 使用状态(available/used)
   */
  status?: string;

  /**
   * 绑定虚拟机ID
   */
  vmId?: string | number;

  /**
   * NAT规则名称
   */
  ruleName?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

export interface PveNetworkVO {
  networkId: string | number;
  nodeId: number;
  iface: string;
  type: string;
  active: string;
  autostart: string;
  bridgePorts: string;
  bridgeStp: string;
  bridgeFd: number;
  vlanRawDevice: string;
  vlanId: number;
  bondMode: string;
  bondPrimary: string;
  bondXmitHashPolicy: string;
  slaves: string;
  address: string;
  netmask: string;
  gateway: string;
  address6: string;
  netmask6: number;
  gateway6: string;
  mtu: number;
  comments: string;
  cidr: string;
  isDefault: string;
  sort: number;
  createTime: string;
  updateTime: string;
}

export interface PveNetworkForm extends Partial<PveNetworkVO> {}

export interface PveNetworkQuery extends PageQuery {
  nodeId?: number;
  iface?: string;
  type?: string;
  active?: string;
  autostart?: string;
  isDefault?: string;
  pageNum?: number;
  pageSize?: number;
}

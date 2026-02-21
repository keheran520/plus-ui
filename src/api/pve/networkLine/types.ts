export interface NetworkLineVO {
  /**
   * 线路ID
   */
  lineId: string | number;

  /**
   * 线路名称
   */
  lineName: string;

  /**
   * 线路类型(BGP/CN2/GIA等)
   */
  lineType: string;

  /**
   * ISP运营商
   */
  isp: string;

  /**
   * 带宽(Mbps)
   */
  bandwidth: string | number;

  /**
   * 线路状态(0:正常 1:停用)
   */
  status: string;

  /**
   * 机房位置
   */
  location: string;

  /**
   * 月租费用
   */
  monthlyFee: number;

  /**
   * 流量费用(元/GB)
   */
  trafficFee: number;

  /**
   * IP数量
   */
  ipCount: number;

  /**
   * 已用IP数量
   */
  usedIpCount: number;

  /**
   * 描述
   */
  description: string;

  /**
   * 排序
   */
  sort: number;

}

export interface NetworkLineForm extends BaseEntity {
  /**
   * 线路ID
   */
  lineId?: string | number;

  /**
   * 线路名称
   */
  lineName?: string;

  /**
   * 线路类型(BGP/CN2/GIA等)
   */
  lineType?: string;

  /**
   * ISP运营商
   */
  isp?: string;

  /**
   * 带宽(Mbps)
   */
  bandwidth?: string | number;

  /**
   * 线路状态(0:正常 1:停用)
   */
  status?: string;

  /**
   * 机房位置
   */
  location?: string;

  /**
   * 月租费用
   */
  monthlyFee?: number;

  /**
   * 流量费用(元/GB)
   */
  trafficFee?: number;

  /**
   * IP数量
   */
  ipCount?: number;

  /**
   * 已用IP数量
   */
  usedIpCount?: number;

  /**
   * 描述
   */
  description?: string;

  /**
   * 排序
   */
  sort?: number;

}

export interface NetworkLineQuery extends PageQuery {

  /**
   * 线路名称
   */
  lineName?: string;

  /**
   * 线路类型(BGP/CN2/GIA等)
   */
  lineType?: string;

  /**
   * ISP运营商
   */
  isp?: string;

  /**
   * 带宽(Mbps)
   */
  bandwidth?: string | number;

  /**
   * 线路状态(0:正常 1:停用)
   */
  status?: string;

  /**
   * 机房位置
   */
  location?: string;

  /**
   * 月租费用
   */
  monthlyFee?: number;

  /**
   * 流量费用(元/GB)
   */
  trafficFee?: number;

  /**
   * IP数量
   */
  ipCount?: number;

  /**
   * 已用IP数量
   */
  usedIpCount?: number;

  /**
   * 描述
   */
  description?: string;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}

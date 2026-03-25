export interface PointsLogVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 会员ID
   */
  memberId: string | number;

  /**
   * 变动类型（1=签到 2=消费获得 3=兑换 4=过期 5=系统调整）
   */
  changeType: string;

  /**
   * 变动积分（正数=增加，负数=减少）
   */
  changePoints: number;

  /**
   * 变动前积分
   */
  pointsBefore: number;

  /**
   * 变动后积分
   */
  pointsAfter: number;

  /**
   * 业务单号
   */
  businessNo: string;

  /**
   * 过期时间
   */
  expireTime: string;

  /**
   * 备注
   */
  remark: string;

  createTime?: string;
}

export interface PointsLogForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 会员ID
   */
  memberId?: string | number;

  /**
   * 变动类型（1=签到 2=消费获得 3=兑换 4=过期 5=系统调整）
   */
  changeType?: string;

  /**
   * 变动积分（正数=增加，负数=减少）
   */
  changePoints?: number;

  /**
   * 变动前积分
   */
  pointsBefore?: number;

  /**
   * 变动后积分
   */
  pointsAfter?: number;

  /**
   * 业务单号
   */
  businessNo?: string;

  /**
   * 过期时间
   */
  expireTime?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface PointsLogQuery extends PageQuery {

  /**
   * 会员ID
   */
  memberId?: string | number;

  /**
   * 变动类型（1=签到 2=消费获得 3=兑换 4=过期 5=系统调整）
   */
  changeType?: string;

  /**
   * 变动积分（正数=增加，负数=减少）
   */
  changePoints?: number;

  /**
   * 变动前积分
   */
  pointsBefore?: number;

  /**
   * 变动后积分
   */
  pointsAfter?: number;

  /**
   * 业务单号
   */
  businessNo?: string;

  /**
   * 过期时间
   */
  expireTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

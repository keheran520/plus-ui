export interface GrowthLogVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 会员ID
   */
  memberId: string | number;

  /**
   * 变动类型（1=消费获得 2=活动获得 3=签到获得 4=系统调整 5=过期扣除）
   */
  changeType: string;

  /**
   * 变动值（正数=增加，负数=减少）
   */
  changeValue: number;

  /**
   * 变动前成长值
   */
  growthBefore: number;

  /**
   * 变动后成长值
   */
  growthAfter: number;

  /**
   * 业务单号
   */
  businessNo: string;

  /**
   * 备注
   */
  remark: string;

}

export interface GrowthLogForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 会员ID
   */
  memberId?: string | number;

  /**
   * 变动类型（1=消费获得 2=活动获得 3=签到获得 4=系统调整 5=过期扣除）
   */
  changeType?: string;

  /**
   * 变动值（正数=增加，负数=减少）
   */
  changeValue?: number;

  /**
   * 变动前成长值
   */
  growthBefore?: number;

  /**
   * 变动后成长值
   */
  growthAfter?: number;

  /**
   * 业务单号
   */
  businessNo?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface GrowthLogQuery extends PageQuery {

  /**
   * 会员ID
   */
  memberId?: string | number;

  /**
   * 变动类型（1=消费获得 2=活动获得 3=签到获得 4=系统调整 5=过期扣除）
   */
  changeType?: string;

  /**
   * 变动值（正数=增加，负数=减少）
   */
  changeValue?: number;

  /**
   * 变动前成长值
   */
  growthBefore?: number;

  /**
   * 变动后成长值
   */
  growthAfter?: number;

  /**
   * 业务单号
   */
  businessNo?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

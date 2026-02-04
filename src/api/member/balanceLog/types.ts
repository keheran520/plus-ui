export interface BalanceLogVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 会员ID
   */
  memberId: string | number;

  /**
   * 变动类型（1=充值 2=消费 3=退款 4=系统调整）
   */
  changeType: string;

  /**
   * 变动金额（正数=增加，负数=减少）
   */
  changeAmount: number;

  /**
   * 变动前余额
   */
  balanceBefore: number;

  /**
   * 变动后余额
   */
  balanceAfter: number;

  /**
   * 业务单号（关联订单等）
   */
  businessNo: string;

  /**
   * 备注
   */
  remark: string;

}

export interface BalanceLogForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 会员ID
   */
  memberId?: string | number;

  /**
   * 变动类型（1=充值 2=消费 3=退款 4=系统调整）
   */
  changeType?: string;

  /**
   * 变动金额（正数=增加，负数=减少）
   */
  changeAmount?: number;

  /**
   * 变动前余额
   */
  balanceBefore?: number;

  /**
   * 变动后余额
   */
  balanceAfter?: number;

  /**
   * 业务单号（关联订单等）
   */
  businessNo?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface BalanceLogQuery extends PageQuery {

  /**
   * 会员ID
   */
  memberId?: string | number;

  /**
   * 变动类型（1=充值 2=消费 3=退款 4=系统调整）
   */
  changeType?: string;

  /**
   * 变动金额（正数=增加，负数=减少）
   */
  changeAmount?: number;

  /**
   * 变动前余额
   */
  balanceBefore?: number;

  /**
   * 变动后余额
   */
  balanceAfter?: number;

  /**
   * 业务单号（关联订单等）
   */
  businessNo?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

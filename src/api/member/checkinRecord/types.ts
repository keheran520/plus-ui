export interface CheckinRecordVO {
  /**
   * 主键ID
   */
  id: string | number

  /**
   * 会员ID
   */
  memberId: string | number

  /**
   * 签到日期
   */
  checkinDate: string

  /**
   * 截止当日的连续签到天数
   */
  continuousDays: number

  /**
   * 签到奖励积分
   */
  rewardPoints: number

  /**
   * 签到奖励成长值
   */
  rewardGrowth: number

  /**
   * 本次签到解锁的徽章ID
   */
  badgeId: string | number

  /**
   * 备注
   */
  remark: string
}

export interface CheckinRecordForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number

  /**
   * 会员ID
   */
  memberId?: string | number

  /**
   * 签到日期
   */
  checkinDate?: string

  /**
   * 截止当日的连续签到天数
   */
  continuousDays?: number

  /**
   * 签到奖励积分
   */
  rewardPoints?: number

  /**
   * 签到奖励成长值
   */
  rewardGrowth?: number

  /**
   * 本次签到解锁的徽章ID
   */
  badgeId?: string | number

  /**
   * 备注
   */
  remark?: string
}

export interface CheckinRecordQuery extends PageQuery {
  /**
   * 会员ID
   */
  memberId?: string | number

  /**
   * 签到日期
   */
  checkinDate?: string

  /**
   * 截止当日的连续签到天数
   */
  continuousDays?: number

  /**
   * 签到奖励积分
   */
  rewardPoints?: number

  /**
   * 签到奖励成长值
   */
  rewardGrowth?: number

  /**
   * 本次签到解锁的徽章ID
   */
  badgeId?: string | number

  /**
   * 日期范围参数
   */
  params?: Record<string, any>
}

export interface BadgeGrantVO {
  /**
   * 主键ID
   */
  id: string | number

  /**
   * 会员ID
   */
  memberId: string | number

  /**
   * 徽章ID
   */
  badgeId: string | number

  /**
   * 发放来源类型
   */
  sourceType: string

  /**
   * 发放来源业务ID
   */
  sourceId: string | number

  /**
   * 发放时间
   */
  grantTime: string

  /**
   * 备注
   */
  remark: string
}

export interface BadgeGrantForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number

  /**
   * 会员ID
   */
  memberId?: string | number

  /**
   * 徽章ID
   */
  badgeId?: string | number

  /**
   * 发放来源类型
   */
  sourceType?: string

  /**
   * 发放来源业务ID
   */
  sourceId?: string | number

  /**
   * 发放时间
   */
  grantTime?: string

  /**
   * 备注
   */
  remark?: string
}

export interface BadgeGrantQuery extends PageQuery {
  /**
   * 会员ID
   */
  memberId?: string | number

  /**
   * 徽章ID
   */
  badgeId?: string | number

  /**
   * 发放来源类型
   */
  sourceType?: string

  /**
   * 发放来源业务ID
   */
  sourceId?: string | number

  /**
   * 发放时间
   */
  grantTime?: string

  /**
   * 日期范围参数
   */
  params?: Record<string, any>
}

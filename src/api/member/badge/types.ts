export interface BadgeVO {
  id: string | number
  badgeCode: string
  badgeName: string
  ossId?: string | number
  badgeIcon: string
  badgeDesc: string
  conditionType: string
  conditionValue: number
  status: string
  sortOrder: number
  remark: string
}

export interface BadgeForm extends BaseEntity {
  id?: string | number
  badgeCode?: string
  badgeName?: string
  ossId?: string | number
  badgeIcon?: string
  badgeDesc?: string
  conditionType?: string
  conditionValue?: number
  status?: string
  sortOrder?: number
  remark?: string
}

export interface BadgeQuery extends PageQuery {
  badgeCode?: string
  badgeName?: string
  badgeIcon?: string
  badgeDesc?: string
  conditionType?: string
  conditionValue?: number
  status?: string
  sortOrder?: number
  params?: Record<string, any>
}

export interface SocialUserActionVO {
  actionId: number | string
  userId: number | string
  actionType: string
  targetType: string
  targetId: number | string
  actionValue: number
  createTime: string
  // 扩展字段
  userName?: string
  nickName?: string
  targetTitle?: string
}

export interface SocialUserActionForm extends Partial<SocialUserActionVO> {
  actionId?: number | string
}

export interface SocialUserActionQuery extends PageQuery {
  userId?: number | string
  actionType?: string
  targetType?: string
  targetId?: number | string
  beginTime?: string
  endTime?: string
}

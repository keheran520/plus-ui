export interface SocialShareVO {
  shareId: number | string
  targetType: string
  targetId: number | string
  userId: number | string
  shareType: string
  shareContent?: string
  shareToUserId?: number | string
  createTime: string
  // 扩展字段
  userName?: string
  nickName?: string
  targetTitle?: string
  shareToUserName?: string
}

export interface SocialShareForm extends Partial<SocialShareVO> {
  shareId?: number | string
}

export interface SocialShareQuery extends PageQuery {
  targetType?: string
  targetId?: number | string
  userId?: number | string
  shareType?: string
  beginTime?: string
  endTime?: string
}

export interface SocialFavoriteVO {
  favoriteId: number | string
  targetType: string
  targetId: number | string
  userId: number | string
  folderId?: number | string
  remark?: string
  createTime: string
  // 扩展字段
  userName?: string
  nickName?: string
  targetTitle?: string
  folderName?: string
}

export interface SocialFavoriteForm extends Partial<SocialFavoriteVO> {
  favoriteId?: number | string
}

export interface SocialFavoriteQuery extends PageQuery {
  targetType?: string
  targetId?: number | string
  userId?: number | string
  folderId?: number | string
  beginTime?: string
  endTime?: string
}

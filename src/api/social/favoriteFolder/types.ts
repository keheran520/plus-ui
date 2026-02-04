export interface SocialFavoriteFolderVO {
  folderId: number | string
  userId: number | string
  folderName: string
  folderDesc?: string
  isPublic: string
  coverUrl?: string
  itemCount: number
  sortOrder: number
  createTime: string
  updateTime: string
  // 扩展字段
  userName?: string
  nickName?: string
}

export interface SocialFavoriteFolderForm extends Partial<SocialFavoriteFolderVO> {
  folderId?: number | string
}

export interface SocialFavoriteFolderQuery extends PageQuery {
  userId?: number | string
  folderName?: string
  isPublic?: string
  beginTime?: string
  endTime?: string
}

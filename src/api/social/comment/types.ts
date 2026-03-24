export interface SocialCommentVO {
  /**
   * 评论ID
   */
  commentId: string | number;

  /**
   * 目标类型：image-图片, album-相册, article-文章, video-视频等
   */
  targetType: string;

  /**
   * 目标ID
   */
  targetId: string | number;

  /**
   * 评论用户ID
   */
  userId: string | number;

  /**
   * avatar
   */
  avatar: string;

  /**
   * nickName
   */
  nickName: string;

  /**
   * userName
   */
  userName: string;

  /**
   * replyToUserName
   */
  replyToUserName: string;

  /**
   * targetTitle
   */
  targetTitle: string;

  /**
   * 评论内容
   */
  content: string;

  /**
   * 父评论ID（0表示顶级评论）
   */
  parentId: string | number;

  /**
   * 根评论ID（用于楼中楼）
   */
  rootId: string | number;

  /**
   * 回复的用户ID
   */
  replyToUserId: string | number;

  /**
   * 点赞数
   */
  likeCount: number;

  /**
   * 回复数
   */
  replyCount: number;

  /**
   * 状态：0-正常, 1-已删除, 2-已屏蔽
   */
  status: string;

  /**
   * IP地址
   */
  ipAddress: string;

  /**
   * 设备类型：pc, app, xcx
   */
  deviceType: string;

  /**
   * 创建时间
   */
  createTime: Date;
}

export interface SocialCommentForm extends BaseEntity {
  /**
   * 评论ID
   */
  commentId?: string | number;

  /**
   * 目标类型：image-图片, album-相册, article-文章, video-视频等
   */
  targetType?: string;

  /**
   * 目标ID
   */
  targetId?: string | number;

  /**
   * 评论用户ID
   */
  userId?: string | number;

  /**
   * 评论内容
   */
  content?: string;

  /**
   * 父评论ID（0表示顶级评论）
   */
  parentId?: string | number;

  /**
   * 根评论ID（用于楼中楼）
   */
  rootId?: string | number;

  /**
   * 回复的用户ID
   */
  replyToUserId?: string | number;

  /**
   * 点赞数
   */
  likeCount?: number;

  /**
   * 回复数
   */
  replyCount?: number;

  /**
   * 状态：0-正常, 1-已删除, 2-已屏蔽
   */
  status?: string;

  /**
   * IP地址
   */
  ipAddress?: string;

  /**
   * 设备类型：pc, app, xcx
   */
  deviceType?: string;
}

export interface SocialCommentQuery extends PageQuery {
  /**
   * 目标类型：image-图片, album-相册, article-文章, video-视频等
   */
  targetType?: string;

  /**
   * 目标ID
   */
  targetId?: string | number;

  /**
   * 评论用户ID
   */
  userId?: string | number;

  /**
   * 评论内容
   */
  content?: string;

  /**
   * 父评论ID（0表示顶级评论）
   */
  parentId?: string | number;

  /**
   * 根评论ID（用于楼中楼）
   */
  rootId?: string | number;

  /**
   * 回复的用户ID
   */
  replyToUserId?: string | number;

  /**
   * 点赞数
   */
  likeCount?: number;

  /**
   * 回复数
   */
  replyCount?: number;

  /**
   * 状态：0-正常, 1-已删除, 2-已屏蔽
   */
  status?: string;

  /**
   * IP地址
   */
  ipAddress?: string;

  /**
   * 设备类型：pc, app, xcx
   */
  deviceType?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

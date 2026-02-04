export interface SocialLikeVO {
  /**
   * 点赞ID
   */
  likeId: string | number;

  /**
   * 目标类型：image-图片, album-相册, article-文章, video-视频, comment-评论等
   */
  targetType: string;

  /**
   * 目标ID
   */
  targetId: string | number;

  /**
   * 用户ID
   */
  userId: string | number;
}

export interface SocialLikeForm extends BaseEntity {
  /**
   * 点赞ID
   */
  likeId?: string | number;

  /**
   * 目标类型：image-图片, album-相册, article-文章, video-视频, comment-评论等
   */
  targetType?: string;

  /**
   * 目标ID
   */
  targetId?: string | number;

  /**
   * 用户ID
   */
  userId?: string | number;
}

export interface SocialLikeQuery extends PageQuery {
  /**
   * 目标类型：image-图片, album-相册, article-文章, video-视频, comment-评论等
   */
  targetType?: string;

  /**
   * 目标ID
   */
  targetId?: string | number;

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}

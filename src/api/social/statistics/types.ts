export interface SocialStatisticsVO {
  /**
   * 统计ID
   */
  statId: string | number;

  /**
   * 目标类型
   */
  targetType: string;

  /**
   * 目标ID
   */
  targetId: string | number;

  /**
   * 点赞数
   */
  likeCount: number;

  /**
   * 收藏数
   */
  favoriteCount: number;

  /**
   * 评论数
   */
  commentCount: number;

  /**
   * 转发数
   */
  shareCount: number;

  /**
   * 浏览数
   */
  viewCount: number;
}

export interface SocialStatisticsForm extends BaseEntity {
  /**
   * 统计ID
   */
  statId?: string | number;

  /**
   * 目标类型
   */
  targetType?: string;

  /**
   * 目标ID
   */
  targetId?: string | number;

  /**
   * 点赞数
   */
  likeCount?: number;

  /**
   * 收藏数
   */
  favoriteCount?: number;

  /**
   * 评论数
   */
  commentCount?: number;

  /**
   * 转发数
   */
  shareCount?: number;

  /**
   * 浏览数
   */
  viewCount?: number;
}

export interface SocialStatisticsQuery extends PageQuery {
  /**
   * 目标类型
   */
  targetType?: string;

  /**
   * 目标ID
   */
  targetId?: string | number;

  /**
   * 点赞数
   */
  likeCount?: number;

  /**
   * 收藏数
   */
  favoriteCount?: number;

  /**
   * 评论数
   */
  commentCount?: number;

  /**
   * 转发数
   */
  shareCount?: number;

  /**
   * 浏览数
   */
  viewCount?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}

export interface SocialFollowStatisticsVO {
  /**
   * 统计ID
   */
  statId: string | number;

  /**
   * 用户ID
   */
  userId: string | number;

  /**
   * 关注数（我关注的人数）
   */
  followingCount: number;

  /**
   * 粉丝数（关注我的人数）
   */
  followerCount: number;

  /**
   * 好友数（互相关注的人数）
   */
  friendCount: number;

  /**
   * 特别关注数
   */
  specialFollowingCount: number;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 更新时间
   */
  updateTime: string;

  /**
   * 用户昵称
   */
  nickName?: string;

  /**
   * 用户名
   */
  userName?: string;

  /**
   * 头像
   */
  avatar?: string;
}

export interface SocialFollowStatisticsForm extends BaseEntity {
  /**
   * 统计ID
   */
  statId?: string | number;

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 关注数
   */
  followingCount?: number;

  /**
   * 粉丝数
   */
  followerCount?: number;

  /**
   * 好友数
   */
  friendCount?: number;

  /**
   * 特别关注数
   */
  specialFollowingCount?: number;
}

export interface SocialFollowStatisticsQuery extends PageQuery {
  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 最小关注数
   */
  minFollowingCount?: number;

  /**
   * 最小粉丝数
   */
  minFollowerCount?: number;

  /**
   * 最小好友数
   */
  minFriendCount?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}

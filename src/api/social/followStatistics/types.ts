export interface SocialFollowStatisticsVO {
  /**
   * 统计 ID
   */
  statId: string | number;

  /**
   * 用户 ID
   */
  userId: string | number;

  /**
   * 关注数
   */
  followingCount: number;

  /**
   * 粉丝数
   */
  followerCount: number;

  /**
   * 好友数
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
   * 昵称
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

  /**
   * 租户 ID
   */
  tenantId?: string | number;

  /**
   * 创建人
   */
  createBy?: string;

  /**
   * 更新人
   */
  updateBy?: string;
}

export interface SocialFollowStatisticsPanelVO extends SocialFollowStatisticsVO {}

export interface SocialFollowStatisticsForm extends BaseEntity {
  /**
   * 统计 ID
   */
  statId?: string | number;

  /**
   * 用户 ID
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
   * 用户 ID
   */
  userId?: string | number;

  /**
   * 最小关注数
   */
  minFollowingCount?: number;

  /**
   * 最大关注数
   */
  maxFollowingCount?: number;

  /**
   * 最小粉丝数
   */
  minFollowerCount?: number;

  /**
   * 最大粉丝数
   */
  maxFollowerCount?: number;

  /**
   * 最小好友数
   */
  minFriendCount?: number;

  /**
   * 最大好友数
   */
  maxFriendCount?: number;

  /**
   * 日期范围参数
   */
  params?: Record<string, any>;
}

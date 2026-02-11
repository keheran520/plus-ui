export interface SocialBlockVO {
  /**
   * 黑名单ID
   */
  blockId: string | number;

  /**
   * 用户ID（屏蔽者）
   */
  userId: string | number;

  /**
   * 被屏蔽用户ID
   */
  blockedUserId: string | number;

  /**
   * 屏蔽原因
   */
  blockReason: string;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 用户昵称（屏蔽者）
   */
  nickName?: string;

  /**
   * 用户名（屏蔽者）
   */
  userName?: string;

  /**
   * 被屏蔽者昵称
   */
  blockedNickName?: string;

  /**
   * 被屏蔽者用户名
   */
  blockedUserName?: string;
}

export interface SocialBlockForm extends BaseEntity {
  /**
   * 黑名单ID
   */
  blockId?: string | number;

  /**
   * 用户ID（屏蔽者）
   */
  userId?: string | number;

  /**
   * 被屏蔽用户ID
   */
  blockedUserId?: string | number;

  /**
   * 屏蔽原因
   */
  blockReason?: string;
}

export interface SocialBlockQuery extends PageQuery {
  /**
   * 用户ID（屏蔽者）
   */
  userId?: string | number;

  /**
   * 被屏蔽用户ID
   */
  blockedUserId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}

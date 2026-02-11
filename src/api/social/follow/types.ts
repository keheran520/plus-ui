export interface SocialFollowVO {
  /**
   * 关注ID
   */
  followId: string | number;

  /**
   * 关注者ID（粉丝）
   */
  userId: string | number;

  /**
   * 被关注者ID（博主）
   */
  followedUserId: string | number;

  /**
   * 关注类型：normal-普通关注, special-特别关注, quiet-悄悄关注
   */
  followType: string;

  /**
   * 是否互相关注：0-否, 1-是（互为好友）
   */
  isMutual: string;

  /**
   * 关注来源：search-搜索, recommend-推荐, profile-主页, content-内容页
   */
  followSource: string;

  /**
   * 备注名
   */
  remark: string;

  /**
   * 分组ID
   */
  groupId: string | number;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 用户昵称（关注者）
   */
  nickName?: string;

  /**
   * 用户名（关注者）
   */
  userName?: string;

  /**
   * 被关注者昵称
   */
  followedNickName?: string;

  /**
   * 被关注者用户名
   */
  followedUserName?: string;
}

export interface SocialFollowForm extends BaseEntity {
  /**
   * 关注ID
   */
  followId?: string | number;

  /**
   * 关注者ID（粉丝）
   */
  userId?: string | number;

  /**
   * 被关注者ID（博主）
   */
  followedUserId?: string | number;

  /**
   * 关注类型
   */
  followType?: string;

  /**
   * 是否互相关注
   */
  isMutual?: string;

  /**
   * 关注来源
   */
  followSource?: string;

  /**
   * 备注名
   */
  remark?: string;

  /**
   * 分组ID
   */
  groupId?: string | number;
}

export interface SocialFollowQuery extends PageQuery {
  /**
   * 关注者ID（粉丝）
   */
  userId?: string | number;

  /**
   * 被关注者ID（博主）
   */
  followedUserId?: string | number;

  /**
   * 关注类型
   */
  followType?: string;

  /**
   * 是否互相关注
   */
  isMutual?: string;

  /**
   * 关注来源
   */
  followSource?: string;

  /**
   * 分组ID
   */
  groupId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}

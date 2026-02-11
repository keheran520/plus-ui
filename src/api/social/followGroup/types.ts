export interface SocialFollowGroupVO {
  /**
   * 分组ID
   */
  groupId: string | number;

  /**
   * 用户ID
   */
  userId: string | number;

  /**
   * 分组名称
   */
  groupName: string;

  /**
   * 分组描述
   */
  groupDesc: string;

  /**
   * 排序
   */
  sortOrder: number;

  /**
   * 成员数量
   */
  memberCount: number;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 用户昵称
   */
  nickName?: string;

  /**
   * 用户名
   */
  userName?: string;
}

export interface SocialFollowGroupForm extends BaseEntity {
  /**
   * 分组ID
   */
  groupId?: string | number;

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 分组名称
   */
  groupName?: string;

  /**
   * 分组描述
   */
  groupDesc?: string;

  /**
   * 排序
   */
  sortOrder?: number;
}

export interface SocialFollowGroupQuery extends PageQuery {
  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 分组名称
   */
  groupName?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

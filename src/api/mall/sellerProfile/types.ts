export interface SellerProfileVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 用户ID
   */
  userId: string | number;

  /**
   * 完成单量
   */
  orderFinishCount: number;

  /**
   * 被收藏量
   */
  favoriteCount: number;

  /**
   * 评分
   */
  score: number;

  /**
   * 状态 0正常 1停用
   */
  status: string;

  /**
   * 备注
   */
  remark: string;

}

export interface SellerProfileForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 完成单量
   */
  orderFinishCount?: number;

  /**
   * 被收藏量
   */
  favoriteCount?: number;

  /**
   * 评分
   */
  score?: number;

  /**
   * 状态 0正常 1停用
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface SellerProfileQuery extends PageQuery {

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 完成单量
   */
  orderFinishCount?: number;

  /**
   * 被收藏量
   */
  favoriteCount?: number;

  /**
   * 评分
   */
  score?: number;

  /**
   * 状态 0正常 1停用
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

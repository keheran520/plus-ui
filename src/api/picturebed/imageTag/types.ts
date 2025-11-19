export interface ImageTagVO {
  /**
   * 标签ID
   */
  tagId: string | number;

  /**
   * 标签名称
   */
  tagName: string;

  /**
   * 标签编码
   */
  tagCode: string;

  /**
   * 标签颜色
   */
  tagColor: string;

  /**
   * 标签图标
   */
  tagIcon: string;

  /**
   * 使用次数
   */
  useCount: number;

  /**
   * 显示顺序
   */
  sortOrder: number;

  /**
   * 状态
   */
  status: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 创建人 ID
   */
  createBy?: number;

  /**
   * 创建人名称
   */
  createByName?: string;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 更新人 ID
   */
  updateBy?: number;

  /**
   * 更新人名称
   */
  updateByName?: string;

  /**
   * 更新时间
   */
  updateTime?: string;
}

export interface ImageTagForm extends BaseEntity {
  /**
   * 标签ID
   */
  tagId?: string | number;

  /**
   * 标签名称
   */
  tagName?: string;

  /**
   * 标签编码
   */
  tagCode?: string;

  /**
   * 标签颜色
   */
  tagColor?: string;

  /**
   * 标签图标
   */
  tagIcon?: string;

  /**
   * 使用次数
   */
  useCount?: number;

  /**
   * 显示顺序
   */
  sortOrder?: number;

  /**
   * 状态
   */
  status?: string;
}

export interface ImageTagQuery extends PageQuery {
  /**
   * 标签ID
   */
  tagId?: string;

  /**
   * 标签名称
   */
  tagName?: string;

  /**
   * 标签编码
   */
  tagCode?: string;

  /**
   * 标签颜色
   */
  tagColor?: string;

  /**
   * 标签图标
   */
  tagIcon?: string;

  /**
   * 使用次数
   */
  useCount?: number;

  /**
   * 显示顺序
   */
  sortOrder?: number;

  /**
   * 状态
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

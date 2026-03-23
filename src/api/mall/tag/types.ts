export interface TagVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 标签名称
   */
  tagName: string;

  /**
   * 标签类型：service_tag=服务标签，service_region=服务区服
   */
  tagType: string;

  /**
   * 排序
   */
  sortOrder: number;

  /**
   * 状态：0正常，1停用
   */
  status: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 创建时间
   */
  createTime?: string;
}

export interface TagForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 标签名称
   */
  tagName?: string;

  /**
   * 标签类型：service_tag=服务标签，service_region=服务区服
   */
  tagType?: string;

  /**
   * 排序
   */
  sortOrder?: number;

  /**
   * 状态：0正常，1停用
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface TagQuery extends PageQuery {
  /**
   * 标签名称
   */
  tagName?: string;

  /**
   * 标签类型：service_tag=服务标签，service_region=服务区服
   */
  tagType?: string;

  /**
   * 排序
   */
  sortOrder?: number;

  /**
   * 状态：0正常，1停用
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

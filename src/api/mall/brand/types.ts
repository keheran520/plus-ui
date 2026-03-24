export interface BrandVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 品牌名称
   */
  name: string;

  /**
   * 品牌简介
   */
  description: string;

  /**
   * 品牌图OSSID
   */
  picOssId: string | number;

  /**
   * 品牌图地址
   */
  picUrl: string;

  /**
   * 排序
   */
  sortOrder: number;

  /**
   * 状态 0正常 1停用
   */
  status: string;

  /**
   * 备注
   */
  remark: string;
}

export interface BrandForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 品牌名称
   */
  name?: string;

  /**
   * 品牌简介
   */
  description?: string;

  /**
   * 品牌图OSSID
   */
  picOssId?: string[] | number[];

  /**
   * 品牌图地址
   */
  picUrl?: string;

  /**
   * 排序
   */
  sortOrder?: number;

  /**
   * 状态 0正常 1停用
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface BrandQuery extends PageQuery {
  /**
   * 品牌名称
   */
  name?: string;

  /**
   * 品牌简介
   */
  description?: string;

  /**
   * 品牌图OSSID
   */
  picOssId?: string | number;

  /**
   * 品牌图地址
   */
  picUrl?: string;

  /**
   * 排序
   */
  sortOrder?: number;

  /**
   * 状态 0正常 1停用
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

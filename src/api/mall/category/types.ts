export interface CategoryVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 父分类ID
   */
  parentId: string | number;

  /**
   * 分类名称
   */
  name: string;

  /**
   * 祖级列表(逗号分隔)
   */
  ancestors: string;

  /**
   * 分类图片OSSID
   */
  picOssId: string | number;

  /**
   * 分类图片地址
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

    /**
     * 子对象
     */
    children: CategoryVO[];
}

export interface CategoryForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 父分类ID
   */
  parentId?: string | number;

  /**
   * 分类名称
   */
  name?: string;

  /**
   * 祖级列表(逗号分隔)
   */
  ancestors?: string;

  /**
   * 分类图片OSSID
   */
  picOssId?: string | number;

  /**
   * 分类图片地址
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

export interface CategoryQuery {

  /**
   * 父分类ID
   */
  parentId?: string | number;

  /**
   * 分类名称
   */
  name?: string;

  /**
   * 祖级列表(逗号分隔)
   */
  ancestors?: string;

  /**
   * 分类图片OSSID
   */
  picOssId?: string | number;

  /**
   * 分类图片地址
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

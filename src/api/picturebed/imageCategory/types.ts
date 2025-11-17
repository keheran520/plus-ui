export interface ImageCategoryVO {
  /**
   * 分类ID
   */
  categoryId: string | number;

  /**
   * 父分类ID
   */
  parentId: string | number;

  /**
   * 祖籍列表(逗号分隔)
   */
  ancestors?: string;

  /**
   * 分类名称
   */
  categoryName: string;

  /**
   * 分类编码
   */
  categoryCode: string;

  /**
   * 分类图标
   */
  categoryIcon: string;

  /**
   * 分类封面
   */
  categoryCover: string;

  /**
   * 图片数量
   */
  imageCount: number;

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
  remark: string;

  /**
   * 关联标签ID（逗号分隔）
   */
  tagIds?: string;

  /**
   * 标签名称（逗号分隔）
   */
  tagNames?: string;

  /**
   * 标签列表
   */
  tagList?: Array<{
    tagId: number;
    tagName: string;
    tagColor?: string;
  }>;

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

  /**
   * 子对象
   */
  children: ImageCategoryVO[];
}

export interface ImageCategoryForm extends BaseEntity {
  /**
   * 分类ID
   */
  categoryId?: string | number;

  /**
   * 父分类ID
   */
  parentId?: string | number;

  /**
   * 祖籍列表(逗号分隔)
   */
  ancestors?: string;

  /**
   * 分类名称
   */
  categoryName?: string;

  /**
   * 分类编码
   */
  categoryCode?: string;

  /**
   * 分类图标
   */
  categoryIcon?: string;

  /**
   * OSSID
   */
  ossId?: string;

  /**
   * 分类封面
   */
  categoryCover?: string;

  /**
   * 图片数量
   */
  imageCount?: number;

  /**
   * 显示顺序
   */
  sortOrder?: number;

  /**
   * 状态
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 关联标签ID（逗号分隔）
   */
  tagIds?: string;
}

export interface ImageCategoryQuery {
  /**
   * 父分类ID
   */
  parentId?: string | number;

  /**
   * 分类名称
   */
  categoryName?: string;

  /**
   * 分类编码
   */
  categoryCode?: string;

  /**
   * 分类封面
   */
  categoryCover?: string;

  /**
   * 图片数量
   */
  imageCount?: number;

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

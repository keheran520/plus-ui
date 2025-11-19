export interface ImageVO {
  /**
   * 图片ID
   */
  imageId: string | number;

  /**
   * OSS文件ID(关联sys_oss表)
   */
  ossId: string | number;

  /**
   * 分类ID
   */
  categoryId: string | number;

  /**
   * 相册ID
   */
  albumId: string | number;

  /**
   * 图片名称
   */
  imageName?: string;

  /**
   * 标签(逗号分隔ID)
   */
  tags: string;

  /**
   * 图片描述
   */
  description: string;

  /**
   * 浏览次数
   */
  viewCount: number;

  /**
   * 下载次数
   */
  downloadCount: number;

  /**
   * 点赞数
   */
  likeCount?: number;

  /**
   * 是否公开(0否 1是)
   */
  isPublic: string;

  /**
   * 状态(0正常 1禁用)
   */
  status: string;

  /**
   * 排序号
   */
  sortOrder: number;

  /**
   * 备注
   */
  remark: string;

  // ========== OSS 关联信息 ==========

  /**
   * 文件名
   */
  fileName?: string;

  /**
   * 原始文件名
   */
  originalName?: string;

  /**
   * 文件后缀
   */
  fileSuffix?: string;

  /**
   * 文件URL
   */
  url?: string;

  /**
   * OSS扩展信息
   */
  ossExt?: {
    fileSize?: number;
    contentType?: string;
    uploadIp?: string;
    md5?: string;
    width?: number;
    height?: number;
  };

  /**
   * 服务商
   */
  service?: string;

  // ========== 关联信息 ==========

  /**
   * 分类名称
   */
  categoryName?: string;

  /**
   * 相册名称
   */
  albumName?: string;

  /**
   * 标签列表
   */
  tagList?: Array<{
    tagId: number | string;
    tagName: string;
    tagCode?: string;
    tagColor?: string;
    tagIcon?: string;
  }>;

  /**
   * 标签名称（逗号分隔）
   */
  tagNames?: string;

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

export interface ImageForm extends BaseEntity {
  /**
   * 图片ID
   */
  imageId?: string | number;

  /**
   * OSS文件ID(关联sys_oss表)
   */
  ossId?: string;

  /**
   * 分类ID
   */
  categoryId?: string | number;

  /**
   * 相册ID
   */
  albumId?: string | number;

  /**
   * 图片名称
   */
  imageName?: string;

  /**
   * 标签(逗号分隔ID)
   */
  tags?: string;

  /**
   * 图片描述
   */
  description?: string;

  /**
   * 浏览次数
   */
  viewCount?: number;

  /**
   * 下载次数
   */
  downloadCount?: number;

  /**
   * 点赞数
   */
  likeCount?: number;

  /**
   * 是否公开(0否 1是)
   */
  isPublic?: string;

  /**
   * 状态(0正常 1禁用)
   */
  status?: string;

  /**
   * 排序号
   */
  sortOrder?: number;

  /**
   * 备注
   */
  remark?: string;
}

export interface ImageQuery extends PageQuery {
  /**
   * 图片ID
   */
  imageId?: string;

  /**
   * OSS文件ID(关联sys_oss表)
   */
  ossId?: string | number;

  /**
   * 分类ID
   */
  categoryId?: string | number;

  /**
   * 相册ID
   */
  albumId?: string | number;

  /**
   * 标签(逗号分隔ID)
   */
  tags?: string;

  /**
   * 图片描述
   */
  description?: string;

  /**
   * 浏览次数
   */
  viewCount?: number;

  /**
   * 下载次数
   */
  downloadCount?: number;

  /**
   * 是否公开(0否 1是)
   */
  isPublic?: string;

  /**
   * 状态(0正常 1禁用)
   */
  status?: string;

  /**
   * 排序号
   */
  sortOrder?: number;

  /**
   * 关键字
   */
  keyword?: any;

  /**
   * 日期范围参数
   */
  params?: any;
}

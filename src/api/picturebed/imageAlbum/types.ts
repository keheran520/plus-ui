export interface ImageAlbumVO {
  /**
   * 相册ID
   */
  albumId: string | number;

  /**
   * 相册名称
   */
  albumName: string;

  /**
   * 相册编码
   */
  albumCode: string;

  /**
   * 相册封面URL
   */
  albumCover: string;

  /**
   * 相册描述
   */
  description: string;

  /**
   * 图片数量
   */
  imageCount: number;

  /**
   * 总大小(字节)
   */
  totalSize: number;

  /**
   * 是否公开(0否 1是)
   */
  isPublic: string;

  /**
   * 显示顺序
   */
  sortOrder: number;

  /**
   * 状态(0正常 1停用)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;

}

export interface ImageAlbumForm extends BaseEntity {
  /**
   * 相册ID
   */
  albumId?: string | number;

  /**
   * 相册名称
   */
  albumName?: string;

  /**
   * 相册编码
   */
  albumCode?: string;

  /**
   * 相册封面URL
   */
  albumCover?: string;

  /**
   * 相册描述
   */
  description?: string;

  /**
   * 图片数量
   */
  imageCount?: number;

  /**
   * 总大小(字节)
   */
  totalSize?: number;

  /**
   * 是否公开(0否 1是)
   */
  isPublic?: string;

  /**
   * 显示顺序
   */
  sortOrder?: number;

  /**
   * 状态(0正常 1停用)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface ImageAlbumQuery extends PageQuery {

  /**
   * 相册名称
   */
  albumName?: string;

  /**
   * 相册编码
   */
  albumCode?: string;

  /**
   * 相册封面URL
   */
  albumCover?: string;

  /**
   * 相册描述
   */
  description?: string;

  /**
   * 图片数量
   */
  imageCount?: number;

  /**
   * 总大小(字节)
   */
  totalSize?: number;

  /**
   * 是否公开(0否 1是)
   */
  isPublic?: string;

  /**
   * 显示顺序
   */
  sortOrder?: number;

  /**
   * 状态(0正常 1停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

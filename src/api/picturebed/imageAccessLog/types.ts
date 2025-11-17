export interface ImageAccessLogVO {
  /**
   * 日志ID
   */
  logId: string | number;

  /**
   * 图片ID
   */
  imageId: string | number;

  /**
   * 访问类型(1查看 2下载)
   */
  accessType: string;

  /**
   * 访问IP
   */
  accessIp: string;

  /**
   * 访问地点
   */
  accessLocation: string;

  /**
   * 用户代理
   */
  userAgent: string;

  /**
   * 用户ID
   */
  userId: string | number;

}

export interface ImageAccessLogForm extends BaseEntity {
  /**
   * 日志ID
   */
  logId?: string | number;

  /**
   * 图片ID
   */
  imageId?: string | number;

  /**
   * 访问类型(1查看 2下载)
   */
  accessType?: string;

  /**
   * 访问IP
   */
  accessIp?: string;

  /**
   * 访问地点
   */
  accessLocation?: string;

  /**
   * 用户代理
   */
  userAgent?: string;

  /**
   * 用户ID
   */
  userId?: string | number;

}

export interface ImageAccessLogQuery extends PageQuery {

  /**
   * 图片ID
   */
  imageId?: string | number;

  /**
   * 访问类型(1查看 2下载)
   */
  accessType?: string;

  /**
   * 访问IP
   */
  accessIp?: string;

  /**
   * 访问地点
   */
  accessLocation?: string;

  /**
   * 用户代理
   */
  userAgent?: string;

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}

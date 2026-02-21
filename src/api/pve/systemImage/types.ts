export interface SystemImageVO {
  /**
   * 镜像ID
   */
  imageId: string | number;

  /**
   * 镜像名称
   */
  imageName: string;

  /**
   * 镜像类型(iso/template)
   */
  imageType: string;

  /**
   * 操作系统类型(Linux/Windows)
   */
  osType: string;

  /**
   * 操作系统版本
   */
  osVersion: string;

  /**
   * 架构(x86_64/aarch64)
   */
  architecture: string;

  /**
   * 镜像大小(字节)
   */
  imageSize: number;

  /**
   * 文件ID(关联sys_file表)
   */
  fileId: string | number;

  /**
   * 镜像状态(0:正常 1:停用)
   */
  status: string;

  /**
   * 描述
   */
  description: string;

  /**
   * 排序
   */
  sort: number;

}

export interface SystemImageForm extends BaseEntity {
  /**
   * 镜像ID
   */
  imageId?: string | number;

  /**
   * 镜像名称
   */
  imageName?: string;

  /**
   * 镜像类型(iso/template)
   */
  imageType?: string;

  /**
   * 操作系统类型(Linux/Windows)
   */
  osType?: string;

  /**
   * 操作系统版本
   */
  osVersion?: string;

  /**
   * 架构(x86_64/aarch64)
   */
  architecture?: string;

  /**
   * 镜像大小(字节)
   */
  imageSize?: number;

  /**
   * 文件ID(关联sys_file表)
   */
  fileId?: string | number;

  /**
   * 镜像状态(0:正常 1:停用)
   */
  status?: string;

  /**
   * 描述
   */
  description?: string;

  /**
   * 排序
   */
  sort?: number;

}

export interface SystemImageQuery extends PageQuery {

  /**
   * 镜像名称
   */
  imageName?: string;

  /**
   * 镜像类型(iso/template)
   */
  imageType?: string;

  /**
   * 操作系统类型(Linux/Windows)
   */
  osType?: string;

  /**
   * 操作系统版本
   */
  osVersion?: string;

  /**
   * 架构(x86_64/aarch64)
   */
  architecture?: string;

  /**
   * 镜像大小(字节)
   */
  imageSize?: number;

  /**
   * 文件ID(关联sys_file表)
   */
  fileId?: string | number;

  /**
   * 镜像状态(0:正常 1:停用)
   */
  status?: string;

  /**
   * 描述
   */
  description?: string;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}

export interface IkuaiConnectionVO {
  /**
   * 连接ID
   */
  connectionId: string | number;

  /**
   * 连接名称
   */
  connectionName: string;

  /**
   * iKuai主机地址
   */
  ikuaiHost: string;

  /**
   * iKuai端口
   */
  ikuaiPort: number;

  /**
   * 用户名
   */
  username: string;

  /**
   * 密码（加密存储）
   */
  password: string;

  /**
   * API版本
   */
  apiVersion: string;

  /**
   * 状态（0正常 1停用）
   */
  status: string;

  /**
   * 描述
   */
  description: string;

  /**
   * 备注
   */
  remark: string;

}

export interface IkuaiConnectionForm extends BaseEntity {
  /**
   * 连接ID
   */
  connectionId?: string | number;

  /**
   * 连接名称
   */
  connectionName?: string;

  /**
   * iKuai主机地址
   */
  ikuaiHost?: string;

  /**
   * iKuai端口
   */
  ikuaiPort?: number;

  /**
   * 用户名
   */
  username?: string;

  /**
   * 密码（加密存储）
   */
  password?: string;

  /**
   * API版本
   */
  apiVersion?: string;

  /**
   * 状态（0正常 1停用）
   */
  status?: string;

  /**
   * 描述
   */
  description?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface IkuaiConnectionQuery extends PageQuery {

  /**
   * 连接名称
   */
  connectionName?: string;

  /**
   * iKuai主机地址
   */
  ikuaiHost?: string;

  /**
   * iKuai端口
   */
  ikuaiPort?: number;

  /**
   * 用户名
   */
  username?: string;

  /**
   * 密码（加密存储）
   */
  password?: string;

  /**
   * API版本
   */
  apiVersion?: string;

  /**
   * 状态（0正常 1停用）
   */
  status?: string;

  /**
   * 描述
   */
  description?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

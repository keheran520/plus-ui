export interface ClusterVO {
  /**
   * 集群ID
   */
  clusterId: string | number;

  /**
   * 集群名称
   */
  clusterName: string;

  /**
   * 集群IP地址
   */
  ipAddress: string;

  /**
   * API端口
   */
  apiPort: number;

  /**
   * API令牌ID
   */
  tokenId: string | number;

  /**
   * API令牌密钥(加密存储)
   */
  tokenSecret: string;

  /**
   * 集群状态(0:正常 1:停用)
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

export interface ClusterForm extends BaseEntity {
  /**
   * 集群ID
   */
  clusterId?: string | number;

  /**
   * 集群名称
   */
  clusterName?: string;

  /**
   * 集群IP地址
   */
  ipAddress?: string;

  /**
   * API端口
   */
  apiPort?: number;

  /**
   * API令牌ID
   */
  tokenId?: string | number;

  /**
   * API令牌密钥(加密存储)
   */
  tokenSecret?: string;

  /**
   * 集群状态(0:正常 1:停用)
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

export interface ClusterQuery extends PageQuery {

  /**
   * 集群名称
   */
  clusterName?: string;

  /**
   * API令牌ID
   */
  tokenId?: string | number;

  /**
   * API令牌密钥(加密存储)
   */
  tokenSecret?: string;

  /**
   * 集群状态(0:正常 1:停用)
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

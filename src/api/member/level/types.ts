export interface LevelVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 等级名称
   */
  levelName: string;

  /**
   * 等级编码（唯一）
   */
  levelCode: string;

  /**
   * 排序（数字越小等级越高）
   */
  levelSort: number;

  /**
   * 折扣率（如：0.95 表示 95 折）
   */
  discountRate: number;

  /**
   * 升级所需积分
   */
  upgradePoints: number;

  /**
   * 升级所需累计消费金额
   */
  upgradeAmount: number;

  /**
   * 等级权益（JSON 格式）
   */
  benefits: string;

  /**
   * 状态（0=正常 1=禁用）
   */
  status: string;

  /**
   * 备注
   */
  remark: string;

}

export interface LevelForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 等级名称
   */
  levelName?: string;

  /**
   * 等级编码（唯一）
   */
  levelCode?: string;

  /**
   * 排序（数字越小等级越高）
   */
  levelSort?: number;

  /**
   * 折扣率（如：0.95 表示 95 折）
   */
  discountRate?: number;

  /**
   * 升级所需积分
   */
  upgradePoints?: number;

  /**
   * 升级所需累计消费金额
   */
  upgradeAmount?: number;

  /**
   * 等级权益（JSON 格式）
   */
  benefits?: string;

  /**
   * 状态（0=正常 1=禁用）
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface LevelQuery extends PageQuery {

  /**
   * 等级名称
   */
  levelName?: string;

  /**
   * 等级编码（唯一）
   */
  levelCode?: string;

  /**
   * 排序（数字越小等级越高）
   */
  levelSort?: number;

  /**
   * 折扣率（百分比，100表示原价，90表示9折）
   */
  discountRate?: number;

  /**
   * 所需成长值
   */
  requiredGrowth?: number;

  /**
   * 等级权益（JSON 格式）
   */
  benefits?: string;

  /**
   * 状态（0=正常 1=禁用）
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

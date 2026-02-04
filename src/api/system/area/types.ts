export interface AreaVO {
  /**
   * 主键
   */
  areaId: string | number;

  /**
   * 父级
   */
  parentId: string | number;

  /**
   * 名称
   */
  name: string;

  /**
   * 简称
   */
  shortName: string;

  /**
   * 经度
   */
  longitude: string;

  /**
   * 纬度
   */
  latitude: string;

  /**
   * 级别
   */
  level: number;

  /**
   * 排序
   */
  sort: number;

  /**
   * 状态（0正常 1停用）
   */
  status: string;

  /**
   * 子对象
   */
  children?: AreaVO[];

  /**
   * 是否有子节点
   */
  hasChildren?: boolean;
}

export interface AreaForm extends BaseEntity {
  /**
   * 主键
   */
  areaId?: string | number;

  /**
   * 父级
   */
  parentId?: string | number;

  /**
   * 名称
   */
  name?: string;

  /**
   * 简称
   */
  shortName?: string;

  /**
   * 经度
   */
  longitude?: string;

  /**
   * 纬度
   */
  latitude?: string;

  /**
   * 级别
   */
  level?: number;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 状态（0正常 1停用）
   */
  status?: string;

}

export interface AreaQuery {

  /**
   * 父级
   */
  parentId?: string | number;

  /**
   * 名称
   */
  name?: string;

  /**
   * 简称
   */
  shortName?: string;

  /**
   * 经度
   */
  longitude?: string;

  /**
   * 纬度
   */
  latitude?: string;

  /**
   * 级别
   */
  level?: number;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 状态（0正常 1停用）
   */
  status?: string;

  /**
   * 是否返回树形结构（true=完整树形，false/undefined=懒加载）
   */
  useTree?: boolean;

  /**
   * 日期范围参数
   */
  params?: any;
}

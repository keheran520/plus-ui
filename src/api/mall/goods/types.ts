import type { BrandVO } from '@/api/mall/brand/types';
import type { CategoryVO } from '@/api/mall/category/types';

export interface GoodsVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 商品编号
   */
  goodsSn: string;

  /**
   * 服务名称
   */
  name: string;

  /**
   * 副标题/卖点
   */
  subTitle: string;

  /**
   * 分类ID
   */
  categoryId: string | number;

  /**
   * 品牌ID
   */
  brandId: string | number;

  /**
   * 轮播图OSS ID，逗号分隔
   */
  galleryOssIds: string | number;

  /**
   * 轮播图地址，逗号分隔，第一个作为主图
   */
  galleryUrls: string;

  /**
   * 关键词
   */
  keywords: string;

  /**
   * 简介
   */
  brief: string;

  /**
   * 详情
   */
  detail: string;

  /**
   * 售价
   */
  price: number;

  /**
   * 原价
   */
  originalPrice: number;

  /**
   * 单位，如次/局/小时
   */
  unitName: string;

  /**
   * 服务标签，逗号分隔
   */
  serviceTags: string;

  /**
   * 服务区服，逗号分隔
   */
  serviceRegions: string;

  /**
   * 上架状态 Y上架 N下架
   */
  saleStatus: string;

  /**
   * 审核状态 0待审 1通过 2驳回
   */
  auditStatus: string;

  /**
   * 是否推荐 0否 1是
   */
  recommendFlag: string;

  /**
   * 浏览量
   */
  viewCount: number;

  /**
   * 收藏量
   */
  favoriteCount: number;

  /**
   * 成交量
   */
  orderCount: number;

  /**
   * 评分
   */
  score: number;

  /**
   * 服务类型
   */
  serviceType: string;

  /**
   * 排序
   */
  sortOrder: number;

  /**
   * 系统状态 0正常 1停用
   */
  status: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 商品分类对象
   */
  category?: CategoryVO;

  /**
   * 商品品牌对象
   */
  brand?: BrandVO;
}

export interface GoodsForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 商品编号
   */
  goodsSn?: string;

  /**
   * 服务名称
   */
  name?: string;

  /**
   * 副标题/卖点
   */
  subTitle?: string;

  /**
   * 分类ID
   */
  categoryId?: string | number;

  /**
   * 品牌ID
   */
  brandId?: string | number;

  /**
   * 轮播图OSS ID，逗号分隔
   */
  galleryOssIds?: string[] | number[];

  /**
   * 轮播图地址，逗号分隔，第一个作为主图
   */
  galleryUrls?: string;

  /**
   * 关键词
   */
  keywords?: string;

  /**
   * 简介
   */
  brief?: string;

  /**
   * 详情
   */
  detail?: string;

  /**
   * 售价
   */
  price?: number;

  /**
   * 原价
   */
  originalPrice?: number;

  /**
   * 单位，如次/局/小时
   */
  unitName?: string;

  /**
   * 服务标签，逗号分隔
   */
  serviceTags?: string;

  /**
   * 服务区服，逗号分隔
   */
  serviceRegions?: string;

  /**
   * 上架状态 Y上架 N下架
   */
  saleStatus?: string;

  /**
   * 审核状态 0待审 1通过 2驳回
   */
  auditStatus?: string;

  /**
   * 是否推荐 0否 1是
   */
  recommendFlag?: string;

  /**
   * 浏览量
   */
  viewCount?: number;

  /**
   * 收藏量
   */
  favoriteCount?: number;

  /**
   * 成交量
   */
  orderCount?: number;

  /**
   * 评分
   */
  score?: number;

  /**
   * 服务类型
   */
  serviceType?: string;

  /**
   * 排序
   */
  sortOrder?: number;

  /**
   * 系统状态 0正常 1停用
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface GoodsQuery extends PageQuery {
  /**
   * 商品编号
   */
  goodsSn?: string;

  /**
   * 服务名称
   */
  name?: string;

  /**
   * 副标题/卖点
   */
  subTitle?: string;

  /**
   * 分类ID
   */
  categoryId?: string | number;

  /**
   * 品牌ID
   */
  brandId?: string | number;

  /**
   * 轮播图OSS ID，逗号分隔
   */
  galleryOssIds?: string | number;

  /**
   * 轮播图地址，逗号分隔，第一个作为主图
   */
  galleryUrls?: string;

  /**
   * 关键词
   */
  keywords?: string;

  /**
   * 简介
   */
  brief?: string;

  /**
   * 详情
   */
  detail?: string;

  /**
   * 售价
   */
  price?: number;

  /**
   * 原价
   */
  originalPrice?: number;

  /**
   * 单位，如次/局/小时
   */
  unitName?: string;

  /**
   * 服务标签，逗号分隔
   */
  serviceTags?: string;

  /**
   * 服务区服，逗号分隔
   */
  serviceRegions?: string;

  /**
   * 上架状态 Y上架 N下架
   */
  saleStatus?: string;

  /**
   * 审核状态 0待审 1通过 2驳回
   */
  auditStatus?: string;

  /**
   * 是否推荐 0否 1是
   */
  recommendFlag?: string;

  /**
   * 浏览量
   */
  viewCount?: number;

  /**
   * 收藏量
   */
  favoriteCount?: number;

  /**
   * 成交量
   */
  orderCount?: number;

  /**
   * 评分
   */
  score?: number;

  /**
   * 服务类型
   */
  serviceType?: string;

  /**
   * 排序
   */
  sortOrder?: number;

  /**
   * 系统状态 0正常 1停用
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

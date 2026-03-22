export interface MallGoodsVO {
  id: string | number;
  goodsSn: string;
  name: string;
  categoryId: string | number;
  brandId: string | number;
  galleryOssIds: string;
  galleryUrls: string;
  keywords: string;
  brief: string;
  isOnSale: string;
  sortOrder: number;
  picOssId: string | number;
  picUrl: string;
  shareOssId: string | number;
  shareUrl: string;
  isNew: string;
  isHot: string;
  unit: string;
  counterPrice: number;
  retailPrice: number;
  detail: string;
  status: string;
  remark: string;
}

export interface MallGoodsForm extends BaseEntity {
  id?: string | number;
  goodsSn?: string;
  name?: string;
  categoryId?: string | number;
  brandId?: string | number;
  galleryOssIds?: string;
  galleryUrls?: string;
  keywords?: string;
  brief?: string;
  isOnSale?: string;
  sortOrder?: number;
  picOssId?: string | number;
  picUrl?: string;
  shareOssId?: string | number;
  shareUrl?: string;
  isNew?: string;
  isHot?: string;
  unit?: string;
  counterPrice?: number;
  retailPrice?: number;
  detail?: string;
  status?: string;
  remark?: string;
}

export interface MallGoodsQuery extends PageQuery {
  goodsSn?: string;
  name?: string;
  categoryId?: string | number;
  brandId?: string | number;
  isOnSale?: string;
  isNew?: string;
  isHot?: string;
  status?: string;
}

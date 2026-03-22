export interface MallBrandVO {
  id: string | number;
  name: string;
  description: string;
  picOssId: string | number;
  picUrl: string;
  sortOrder: number;
  floorPrice: number;
  status: string;
  remark: string;
}

export interface MallBrandForm extends BaseEntity {
  id?: string | number;
  name?: string;
  description?: string;
  picOssId?: string | number;
  picUrl?: string;
  sortOrder?: number;
  floorPrice?: number;
  status?: string;
  remark?: string;
}

export interface MallBrandQuery extends PageQuery {
  name?: string;
  status?: string;
}

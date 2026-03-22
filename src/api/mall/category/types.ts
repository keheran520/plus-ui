export interface MallCategoryVO {
  id: string | number;
  name: string;
  keywords: string;
  description: string;
  parentId: string | number;
  level: string;
  iconOssId: string | number;
  iconUrl: string;
  picOssId: string | number;
  picUrl: string;
  status: string;
  sortOrder: number;
  remark: string;
}

export interface MallCategoryForm extends BaseEntity {
  id?: string | number;
  name?: string;
  keywords?: string;
  description?: string;
  parentId?: string | number;
  level?: string;
  iconOssId?: string | number;
  iconUrl?: string;
  picOssId?: string | number;
  picUrl?: string;
  status?: string;
  sortOrder?: number;
  remark?: string;
}

export interface MallCategoryQuery extends PageQuery {
  name?: string;
  keywords?: string;
  parentId?: string | number;
  level?: string;
  status?: string;
}

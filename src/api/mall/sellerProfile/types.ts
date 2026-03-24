import type { MemberDetailUserVO, MemberDetailVO } from '@/api/member/member/types';

export interface SellerProfileVO {
  id: string | number;
  memberId: string | number;
  userId: string | number;
  serviceStatus?: string;
  verifyStatus?: string;
  featuredFlag?: string;
  status?: string;
  sortOrder?: number;
  serviceNotice?: string;
  adminRemark?: string;
  remark?: string;
  goodsCount?: number;
  onSaleGoodsCount?: number;
  pendingOrderCount?: number;
  finishOrderCount?: number;
  refundOrderCount?: number;
  totalSalesAmount?: number;
  lastOrderTime?: string;
  createTime?: string;
  member?: MemberDetailVO;
  user?: MemberDetailUserVO;
}

export interface SellerProfileForm extends BaseEntity {
  id?: string | number;
  memberId?: string | number;
  userId?: string | number;
  memberDisplayName?: string;
  sortOrder?: number;
  serviceNotice?: string;
  adminRemark?: string;
  remark?: string;
}

export interface SellerProfileQuery extends PageQuery {
  memberId?: string | number;
  userId?: string | number;
  memberNo?: string;
  realName?: string;
  userName?: string;
  nickName?: string;
  phonenumber?: string;
  serviceStatus?: string;
  verifyStatus?: string;
  featuredFlag?: string;
  status?: string;
  params?: any;
}

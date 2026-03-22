export interface MallOrderVO {
  id: string | number;
  userId: string | number;
  orderSn: string;
  orderStatus: string;
  consignee: string;
  mobile: string;
  address: string;
  message: string;
  goodsPrice: number;
  freightPrice: number;
  couponPrice: number;
  integralPrice: number;
  grouponPrice: number;
  orderPrice: number;
  actualPrice: number;
  payId: string;
  payTime: string;
  shipSn: string;
  shipChannel: string;
  shipTime: string;
  refundAmount: number;
  refundType: string;
  refundContent: string;
  refundTime: string;
  confirmTime: string;
  comments: number;
  endTime: string;
  remark: string;
}

export interface MallOrderForm extends BaseEntity {
  id?: string | number;
  userId?: string | number;
  orderSn?: string;
  orderStatus?: string;
  consignee?: string;
  mobile?: string;
  address?: string;
  message?: string;
  goodsPrice?: number;
  freightPrice?: number;
  couponPrice?: number;
  integralPrice?: number;
  grouponPrice?: number;
  orderPrice?: number;
  actualPrice?: number;
  payId?: string;
  payTime?: string;
  shipSn?: string;
  shipChannel?: string;
  shipTime?: string;
  refundAmount?: number;
  refundType?: string;
  refundContent?: string;
  refundTime?: string;
  confirmTime?: string;
  comments?: number;
  endTime?: string;
  remark?: string;
}

export interface MallOrderQuery extends PageQuery {
  userId?: string | number;
  orderSn?: string;
  orderStatus?: string;
  consignee?: string;
  mobile?: string;
}

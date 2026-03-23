export interface OrderVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 订单号
   */
  orderSn: string;

  /**
   * 买家用户ID
   */
  buyerUserId: string | number;

  /**
   * 商品ID
   */
  goodsId: string | number;

  /**
   * 商品名称快照
   */
  goodsName: string;

  /**
   * 商品轮播图快照
   */
  goodsGalleryUrls: string;

  /**
   * 下单单价
   */
  price: number;

  /**
   * 实付金额
   */
  payAmount: number;

  /**
   * 下单区服快照
   */
  serviceRegions: string;

  /**
   * 下单标签快照
   */
  serviceTags: string;

  /**
   * 买家备注
   */
  buyerRemark: string;

  /**
   * 卖家备注
   */
  sellerRemark: string;

  /**
   * 后台备注
   */
  adminRemark: string;

  /**
   * 订单状态
   */
  orderStatus: string;

  /**
   * 退款金额
   */
  refundAmount: number;

  /**
   * 退款说明
   */
  refundRemark: string;

  /**
   * 支付时间
   */
  payTime: string;

  /**
   * 完成时间
   */
  finishTime: string;

  /**
   * 取消时间
   */
  cancelTime: string;

  /**
   * 退款时间
   */
  refundTime: string;

  /**
   * 系统状态 0正常 1停用
   */
  status: string;

  /**
   * 备注
   */
  remark: string;

}

export interface OrderForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 订单号
   */
  orderSn?: string;

  /**
   * 买家用户ID
   */
  buyerUserId?: string | number;

  /**
   * 商品ID
   */
  goodsId?: string | number;

  /**
   * 商品名称快照
   */
  goodsName?: string;

  /**
   * 商品轮播图快照
   */
  goodsGalleryUrls?: string;

  /**
   * 下单单价
   */
  price?: number;

  /**
   * 实付金额
   */
  payAmount?: number;

  /**
   * 下单区服快照
   */
  serviceRegions?: string;

  /**
   * 下单标签快照
   */
  serviceTags?: string;

  /**
   * 买家备注
   */
  buyerRemark?: string;

  /**
   * 卖家备注
   */
  sellerRemark?: string;

  /**
   * 后台备注
   */
  adminRemark?: string;

  /**
   * 订单状态
   */
  orderStatus?: string;

  /**
   * 退款金额
   */
  refundAmount?: number;

  /**
   * 退款说明
   */
  refundRemark?: string;

  /**
   * 支付时间
   */
  payTime?: string;

  /**
   * 完成时间
   */
  finishTime?: string;

  /**
   * 取消时间
   */
  cancelTime?: string;

  /**
   * 退款时间
   */
  refundTime?: string;

  /**
   * 系统状态 0正常 1停用
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface OrderQuery extends PageQuery {

  /**
   * 订单号
   */
  orderSn?: string;

  /**
   * 买家用户ID
   */
  buyerUserId?: string | number;

  /**
   * 商品ID
   */
  goodsId?: string | number;

  /**
   * 商品名称快照
   */
  goodsName?: string;

  /**
   * 商品轮播图快照
   */
  goodsGalleryUrls?: string;

  /**
   * 下单单价
   */
  price?: number;

  /**
   * 实付金额
   */
  payAmount?: number;

  /**
   * 下单区服快照
   */
  serviceRegions?: string;

  /**
   * 下单标签快照
   */
  serviceTags?: string;

  /**
   * 买家备注
   */
  buyerRemark?: string;

  /**
   * 卖家备注
   */
  sellerRemark?: string;

  /**
   * 后台备注
   */
  adminRemark?: string;

  /**
   * 订单状态
   */
  orderStatus?: string;

  /**
   * 退款金额
   */
  refundAmount?: number;

  /**
   * 退款说明
   */
  refundRemark?: string;

  /**
   * 支付时间
   */
  payTime?: string;

  /**
   * 完成时间
   */
  finishTime?: string;

  /**
   * 取消时间
   */
  cancelTime?: string;

  /**
   * 退款时间
   */
  refundTime?: string;

  /**
   * 系统状态 0正常 1停用
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

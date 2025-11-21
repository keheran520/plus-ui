export interface MessageVO {
  /**
   * 消息ID
   */
  messageId: string | number;

  /**
   * 消息类型
   */
  messageType: string;

  /**
   * 消息标题
   */
  messageTitle: string;

  /**
   * 消息内容
   */
  messageContent: string;

  /**
   * 通知范围
   */
  messageScope: string;

  /**
   * 通知用户IDs
   */
  messageUserIds: string | number;

  /**
   * 来源ID
   */
  sourceId: string | number;

  /**
   * 来源类型
   */
  sourceType: string;

  /**
   * 优先级
   */
  priority: string;

  /**
   * 已读人数
   */
  readCount: number;

  /**
   * 发送状态
   */
  sendStatus: string;

  /**
   * 发送时间
   */
  sendTime: string;

  /**
   * 发送方式
   */
  sendMethod: string;

}

export interface MessageForm extends BaseEntity {
  /**
   * 消息ID
   */
  messageId?: string | number;

  /**
   * 消息类型
   */
  messageType?: string;

  /**
   * 消息标题
   */
  messageTitle?: string;

  /**
   * 消息内容
   */
  messageContent?: string;

  /**
   * 通知范围
   */
  messageScope?: string;

  /**
   * 通知用户IDs
   */
  messageUserIds?: string | number;

  /**
   * 来源ID
   */
  sourceId?: string | number;

  /**
   * 来源类型
   */
  sourceType?: string;

  /**
   * 优先级
   */
  priority?: string;

  /**
   * 已读人数
   */
  readCount?: number;

  /**
   * 发送状态
   */
  sendStatus?: string;

  /**
   * 发送时间
   */
  sendTime?: string;

  /**
   * 发送方式
   */
  sendMethod?: string;

}

export interface MessageQuery extends PageQuery {

  /**
   * 消息类型
   */
  messageType?: string;

  /**
   * 消息标题
   */
  messageTitle?: string;

  /**
   * 消息内容
   */
  messageContent?: string;

  /**
   * 通知范围
   */
  messageScope?: string;

  /**
   * 通知用户IDs
   */
  messageUserIds?: string | number;

  /**
   * 来源ID
   */
  sourceId?: string | number;

  /**
   * 来源类型
   */
  sourceType?: string;

  /**
   * 优先级
   */
  priority?: string;

  /**
   * 已读人数
   */
  readCount?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}

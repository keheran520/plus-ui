export interface MessageLogVO {
  /**
   * 日志ID
   */
  logId: string | number;

  /**
   * 消息ID
   */
  messageId: string | number;

  /**
   * 发送方式
   */
  sendMethod: string;

  /**
   * 通知公告ID
   */
  noticeId: string | number;

  /**
   * 接收人ID
   */
  receiverId: string | number;

  /**
   * 发送状态
   */
  sendStatus: string;

  /**
   * 发送时间
   */
  sendTime: string;

  /**
   * 是否已读
   */
  isRead: string;

  /**
   * 阅读时间
   */
  readTime: string;

  /**
   * 错误信息
   */
  errorMsg: string;

}

export interface MessageLogForm extends BaseEntity {
  /**
   * 日志ID
   */
  logId?: string | number;

  /**
   * 消息ID
   */
  messageId?: string | number;

  /**
   * 发送方式
   */
  sendMethod?: string;

  /**
   * 通知公告ID
   */
  noticeId?: string | number;

  /**
   * 接收人ID
   */
  receiverId?: string | number;

  /**
   * 发送状态
   */
  sendStatus?: string;

  /**
   * 发送时间
   */
  sendTime?: string;

  /**
   * 是否已读
   */
  isRead?: string;

  /**
   * 阅读时间
   */
  readTime?: string;

  /**
   * 错误信息
   */
  errorMsg?: string;

}

export interface MessageLogQuery extends PageQuery {

  /**
   * 消息ID
   */
  messageId?: string | number;

  /**
   * 发送方式
   */
  sendMethod?: string;

  /**
   * 通知公告ID
   */
  noticeId?: string | number;

  /**
   * 接收人ID
   */
  receiverId?: string | number;

  /**
   * 发送状态
   */
  sendStatus?: string;

  /**
   * 发送时间
   */
  sendTime?: string;

  /**
   * 是否已读
   */
  isRead?: string;

  /**
   * 阅读时间
   */
  readTime?: string;

  /**
   * 错误信息
   */
  errorMsg?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

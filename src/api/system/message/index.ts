import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MessageForm, MessageQuery, MessageVO } from '@/api/system/message/types';

/**
 * 查询系统消息列表
 * @param query
 * @returns {*}
 */

export const listMessage = (query?: MessageQuery): AxiosPromise<MessageVO[]> => {
  return request({
    url: '/system/message/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询系统消息详细
 * @param messageId
 */
export const getMessage = (messageId: string | number): AxiosPromise<MessageVO> => {
  return request({
    url: '/system/message/' + messageId,
    method: 'get'
  });
};

/**
 * 新增系统消息
 * @param data
 */
export const addMessage = (data: MessageForm) => {
  return request({
    url: '/system/message',
    method: 'post',
    data: data
  });
};

/**
 * 修改系统消息
 * @param data
 */
export const updateMessage = (data: MessageForm) => {
  return request({
    url: '/system/message',
    method: 'put',
    data: data
  });
};

/**
 * 删除系统消息
 * @param messageId
 */
export const delMessage = (messageIds: string | number | Array<string | number>) => {
  return request({
    url: '/system/message/' + messageIds,
    method: 'delete'
  });
};

/**
 * 保存草稿
 * @param data
 */
export const saveDraft = (data: MessageForm) => {
  return request({
    url: '/system/message/saveDraft',
    method: 'post',
    data: data
  });
};

/**
 * 发布消息
 * @param messageId
 */
export const publishMessage = (messageId: string | number) => {
  return request({
    url: '/system/message/publish/' + messageId,
    method: 'put'
  });
};

/**
 * 批量发布消息
 * @param messageIds
 */
export const batchPublishMessage = (messageIds: Array<string | number>) => {
  return request({
    url: '/system/message/batchPublish',
    method: 'put',
    data: messageIds
  });
};

/**
 * 获取消息的日志数量
 * @param messageIds
 */
export const getMessageLogCount = (messageIds: Array<string | number>): AxiosPromise<number> => {
  // 手动构建查询字符串，确保格式为 messageIds=1&messageIds=2
  const queryString = messageIds.map((id) => `messageIds=${id}`).join('&');
  return request({
    url: `/system/message/logCount?${queryString}`,
    method: 'get'
  });
};

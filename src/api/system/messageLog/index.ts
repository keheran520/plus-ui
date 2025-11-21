import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MessageLogVO, MessageLogForm, MessageLogQuery } from '@/api/system/messageLog/types';

/**
 * 查询消息发送日志列表
 * @param query
 * @returns {*}
 */

export const listMessageLog = (query?: MessageLogQuery): AxiosPromise<MessageLogVO[]> => {
  return request({
    url: '/system/messageLog/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询消息发送日志详细
 * @param logId
 */
export const getMessageLog = (logId: string | number): AxiosPromise<MessageLogVO> => {
  return request({
    url: '/system/messageLog/' + logId,
    method: 'get'
  });
};

/**
 * 新增消息发送日志
 * @param data
 */
export const addMessageLog = (data: MessageLogForm) => {
  return request({
    url: '/system/messageLog',
    method: 'post',
    data: data
  });
};

/**
 * 修改消息发送日志
 * @param data
 */
export const updateMessageLog = (data: MessageLogForm) => {
  return request({
    url: '/system/messageLog',
    method: 'put',
    data: data
  });
};

/**
 * 删除消息发送日志
 * @param logId
 */
export const delMessageLog = (logId: string | number | Array<string | number>) => {
  return request({
    url: '/system/messageLog/' + logId,
    method: 'delete'
  });
};

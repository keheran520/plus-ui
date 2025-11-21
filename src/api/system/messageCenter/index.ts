import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 查询我的消息列表
 * @param query
 */
export const listMyMessages = (query?: any): AxiosPromise<any> => {
  return request({
    url: '/system/messageCenter/myMessages',
    method: 'get',
    params: query
  });
};

/**
 * 标记消息已读
 * @param logId
 */
export const markMessageRead = (logId: string | number) => {
  return request({
    url: `/system/messageCenter/markRead/${logId}`,
    method: 'put'
  });
};

/**
 * 全部标记已读
 */
export const markAllMessagesRead = () => {
  return request({
    url: '/system/messageCenter/markAllRead',
    method: 'put'
  });
};

/**
 * 删除我的消息
 * @param logId
 */
export const deleteMyMessage = (logId: string | number | Array<string | number>) => {
  return request({
    url: `/system/messageCenter/${logId}`,
    method: 'delete'
  });
};

/**
 * 获取消息设置
 */
export const getMessageSettings = (): AxiosPromise<any> => {
  return request({
    url: '/system/messageCenter/settings',
    method: 'get'
  });
};

/**
 * 更新消息设置
 * @param data
 */
export const updateMessageSettings = (data: any) => {
  return request({
    url: '/system/messageCenter/settings',
    method: 'put',
    data: data
  });
};

/**
 * 获取未读消息数量
 */
export const getUnreadCount = (): AxiosPromise<number> => {
  return request({
    url: '/system/messageCenter/unreadCount',
    method: 'get'
  });
};

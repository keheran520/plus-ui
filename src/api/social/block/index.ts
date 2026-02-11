import request from '@/utils/request';
import type { SocialBlockForm, SocialBlockQuery, SocialBlockVO } from './types';

// 查询黑名单列表
export const listSocialBlock = (query: SocialBlockQuery) => {
  return request({
    url: '/social/block/list',
    method: 'get',
    params: query
  });
};

// 查询黑名单详细
export const getSocialBlock = (blockId: number | string) => {
  return request<SocialBlockVO>({
    url: `/social/block/${blockId}`,
    method: 'get'
  });
};

// 新增黑名单
export const addSocialBlock = (data: SocialBlockForm) => {
  return request({
    url: '/social/block',
    method: 'post',
    data: data
  });
};

// 修改黑名单
export const updateSocialBlock = (data: SocialBlockForm) => {
  return request({
    url: '/social/block',
    method: 'put',
    data: data
  });
};

// 删除黑名单
export const delSocialBlock = (blockId: number | string | Array<number | string>) => {
  return request({
    url: `/social/block/${blockId}`,
    method: 'delete'
  });
};

// 导出黑名单
export const exportSocialBlock = (query: SocialBlockQuery) => {
  return request({
    url: '/social/block/export',
    method: 'post',
    data: query
  });
};

// 检查是否被屏蔽
export const checkBlocked = (userId: number | string, blockedUserId: number | string) => {
  return request<boolean>({
    url: '/social/block/check',
    method: 'get',
    params: { userId, blockedUserId }
  });
};

// 批量检查屏蔽状态
export const batchCheckBlocked = (userId: number | string, targetUserIds: Array<number | string>) => {
  return request({
    url: '/social/block/check/batch',
    method: 'post',
    params: { userId },
    data: targetUserIds
  });
};

// 获取统计概览
export const getBlockOverview = () => {
  return request({
    url: '/social/block/overview',
    method: 'get'
  });
};

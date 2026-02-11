import request from '@/utils/request';
import type { SocialFollowForm, SocialFollowQuery, SocialFollowVO } from './types';

// 查询关注列表
export const listSocialFollow = (query: SocialFollowQuery) => {
  return request({
    url: '/social/follow/list',
    method: 'get',
    params: query
  });
};

// 查询关注详细
export const getSocialFollow = (followId: number | string) => {
  return request<SocialFollowVO>({
    url: `/social/follow/${followId}`,
    method: 'get'
  });
};

// 新增关注
export const addSocialFollow = (data: SocialFollowForm) => {
  return request({
    url: '/social/follow',
    method: 'post',
    data: data
  });
};

// 修改关注
export const updateSocialFollow = (data: SocialFollowForm) => {
  return request({
    url: '/social/follow',
    method: 'put',
    data: data
  });
};

// 删除关注
export const delSocialFollow = (followId: number | string | Array<number | string>) => {
  return request({
    url: `/social/follow/${followId}`,
    method: 'delete'
  });
};

// 导出关注
export const exportSocialFollow = (query: SocialFollowQuery) => {
  return request({
    url: '/social/follow/export',
    method: 'post',
    data: query
  });
};

// 获取关注统计概览
export const getStatisticsOverview = () => {
  return request({
    url: '/social/follow/statistics/overview',
    method: 'get'
  });
};

// 获取用户关注统计
export const getUserStatistics = (userId: number | string) => {
  return request({
    url: `/social/follow/statistics/user/${userId}`,
    method: 'get'
  });
};

// 获取热门用户排行
export const getHotUsers = (sortBy: string, pageQuery?: any) => {
  return request({
    url: '/social/follow/statistics/hot',
    method: 'get',
    params: { 
      sortBy,
      pageNum: pageQuery?.pageNum || 1,
      pageSize: pageQuery?.pageSize || 10
    }
  });
};

// 批量检查关注状态
export const batchCheckFollowStatus = (userId: number | string, targetUserIds: Array<number | string>) => {
  return request({
    url: '/social/follow/status/batch',
    method: 'post',
    params: { userId },
    data: targetUserIds
  });
};

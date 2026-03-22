import request from '@/utils/request';
import type { SocialFollowStatisticsForm, SocialFollowStatisticsPanelVO, SocialFollowStatisticsQuery, SocialFollowStatisticsVO } from './types';

// 查询用户关注统计列表
export const listSocialFollowStatistics = (query: SocialFollowStatisticsQuery) => {
  return request({
    url: '/social/followStatistics/list',
    method: 'get',
    params: query
  });
};

export const listSocialFollowStatisticsPanel = (query: SocialFollowStatisticsQuery) => {
  return request<SocialFollowStatisticsPanelVO[]>({
    url: '/social/followStatistics/panel/list',
    method: 'get',
    params: query
  });
};

// 查询用户关注统计详细
export const getSocialFollowStatistics = (statId: number | string) => {
  return request<SocialFollowStatisticsVO>({
    url: `/social/followStatistics/${statId}`,
    method: 'get'
  });
};

export const getSocialFollowStatisticsPanel = (statId: number | string) => {
  return request<SocialFollowStatisticsPanelVO>({
    url: `/social/followStatistics/panel/${statId}`,
    method: 'get'
  });
};

// 新增用户关注统计
export const addSocialFollowStatistics = (data: SocialFollowStatisticsForm) => {
  return request({
    url: '/social/followStatistics',
    method: 'post',
    data: data
  });
};

// 修改用户关注统计
export const updateSocialFollowStatistics = (data: SocialFollowStatisticsForm) => {
  return request({
    url: '/social/followStatistics',
    method: 'put',
    data: data
  });
};

// 删除用户关注统计
export const delSocialFollowStatistics = (statId: number | string | Array<number | string>) => {
  return request({
    url: `/social/followStatistics/${statId}`,
    method: 'delete'
  });
};

// 导出用户关注统计
export const exportSocialFollowStatistics = (query: SocialFollowStatisticsQuery) => {
  return request({
    url: '/social/followStatistics/export',
    method: 'post',
    data: query
  });
};

// 刷新用户统计数据
export const refreshStatistics = (userId: number | string) => {
  return request({
    url: `/social/followStatistics/refresh/${userId}`,
    method: 'post'
  });
};

// 批量刷新统计数据
export const batchRefreshStatistics = (userIds: Array<number | string>) => {
  return request({
    url: '/social/followStatistics/refresh/batch',
    method: 'post',
    data: userIds
  });
};

// 获取统计概览
export const getStatisticsOverview = () => {
  return request({
    url: '/social/followStatistics/overview',
    method: 'get'
  });
};

// 别名导出，保持兼容性
export const getOverview = getStatisticsOverview;

// 获取热门用户排行
export const getHotUsers = (sortBy: string, pageQuery?: any) => {
  return request({
    url: '/social/followStatistics/hot',
    method: 'get',
    params: { 
      sortBy,
      pageNum: pageQuery?.pageNum || 1,
      pageSize: pageQuery?.pageSize || 10
    }
  });
};

export const getPanelHotUsers = (sortBy: string, pageQuery?: any) => {
  return request<SocialFollowStatisticsPanelVO[]>({
    url: '/social/followStatistics/panel/hot',
    method: 'get',
    params: {
      sortBy,
      pageNum: pageQuery?.pageNum || 1,
      pageSize: pageQuery?.pageSize || 10
    }
  });
};

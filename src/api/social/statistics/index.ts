import request from '@/utils/request';
import type { SocialStatisticsForm, SocialStatisticsQuery, SocialStatisticsVO } from './types';

// 查询互动统计列表
export const listSocialStatistics = (query: SocialStatisticsQuery) => {
  return request({
    url: '/social/statistics/list',
    method: 'get',
    params: query
  });
};

// 查询互动统计详细
export const getSocialStatistics = (statId: number | string) => {
  return request<SocialStatisticsVO>({
    url: `/social/statistics/${statId}`,
    method: 'get'
  });
};

// 新增互动统计
export const addSocialStatistics = (data: SocialStatisticsForm) => {
  return request({
    url: '/social/statistics',
    method: 'post',
    data: data
  });
};

// 修改互动统计
export const updateSocialStatistics = (data: SocialStatisticsForm) => {
  return request({
    url: '/social/statistics',
    method: 'put',
    data: data
  });
};

// 删除互动统计
export const delSocialStatistics = (statId: number | string | Array<number | string>) => {
  return request({
    url: `/social/statistics/${statId}`,
    method: 'delete'
  });
};

// 导出互动统计
export const exportSocialStatistics = (query: SocialStatisticsQuery) => {
  return request({
    url: '/social/statistics/export',
    method: 'post',
    data: query
  });
};

// 按目标查询统计
export const getStatisticsByTarget = (targetType: string, targetId: number | string) => {
  return request<SocialStatisticsVO>({
    url: '/social/statistics/target',
    method: 'get',
    params: { targetType, targetId }
  });
};

// 刷新统计数据
export const refreshStatistics = (targetType: string, targetId: number | string) => {
  return request({
    url: '/social/statistics/refresh',
    method: 'post',
    params: { targetType, targetId }
  });
};

// 批量刷新统计数据
export const batchRefreshStatistics = (targetType: string) => {
  return request({
    url: '/social/statistics/batchRefresh',
    method: 'post',
    params: { targetType }
  });
};

// 获取统计概览
export const getStatisticsOverview = () => {
  return request<{
    totalLikes: number;
    totalFavorites: number;
    totalComments: number;
    totalShares: number;
    totalViews: number;
    todayLikes: number;
    todayFavorites: number;
    todayComments: number;
    todayShares: number;
    todayViews: number;
  }>({
    url: '/social/statistics/overview',
    method: 'get'
  });
};

// 获取热门内容
export const getHotContent = (targetType?: string, limit?: number) => {
  return request<
    Array<{
      targetType: string;
      targetId: number;
      likeCount: number;
      favoriteCount: number;
      commentCount: number;
      shareCount: number;
      viewCount: number;
      score: number;
    }>
  >({
    url: '/social/statistics/hot',
    method: 'get',
    params: { targetType, limit }
  });
};

// 获取趋势数据
export const getTrendData = (targetType?: string, days?: number) => {
  return request<
    Array<{
      date: string;
      likeCount: number;
      favoriteCount: number;
      commentCount: number;
      shareCount: number;
    }>
  >({
    url: '/social/statistics/trend',
    method: 'get',
    params: { targetType, days }
  });
};

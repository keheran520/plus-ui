import request from '@/utils/request';
import type { SocialUserActionForm, SocialUserActionQuery, SocialUserActionVO } from './types';

// 查询用户行为列表
export const listSocialUserAction = (query: SocialUserActionQuery) => {
  return request({
    url: '/social/userAction/list',
    method: 'get',
    params: query
  });
};

// 查询用户行为详细
export const getSocialUserAction = (actionId: number | string) => {
  return request<SocialUserActionVO>({
    url: `/social/userAction/${actionId}`,
    method: 'get'
  });
};

// 新增用户行为
export const addSocialUserAction = (data: SocialUserActionForm) => {
  return request({
    url: '/social/userAction',
    method: 'post',
    data: data
  });
};

// 修改用户行为
export const updateSocialUserAction = (data: SocialUserActionForm) => {
  return request({
    url: '/social/userAction',
    method: 'put',
    data: data
  });
};

// 删除用户行为
export const delSocialUserAction = (actionId: number | string | Array<number | string>) => {
  return request({
    url: `/social/userAction/${actionId}`,
    method: 'delete'
  });
};

// 导出用户行为
export const exportSocialUserAction = (query: SocialUserActionQuery) => {
  return request({
    url: '/social/userAction/export',
    method: 'post',
    data: query
  });
};

// 获取用户行为统计概览
export const getUserActionOverview = () => {
  return request<{
    totalActions: number;
    todayActions: number;
    likeCount: number;
    favoriteCount: number;
    commentCount: number;
    todayLikes: number;
    todayFavorites: number;
    todayComments: number;
    activeUsers: number;
  }>({
    url: '/social/userAction/overview',
    method: 'get'
  });
};

// 获取指定用户的行为统计
export const getUserStatistics = (userId: number | string) => {
  return request<{
    totalActions: number;
    likeCount: number;
    unlikeCount: number;
    favoriteCount: number;
    unfavoriteCount: number;
    commentCount: number;
    deleteCommentCount: number;
    netLikes: number;
    netFavorites: number;
    netComments: number;
    activityScore: number;
    todayActions: number;
  }>({
    url: `/social/userAction/user/${userId}/statistics`,
    method: 'get'
  });
};

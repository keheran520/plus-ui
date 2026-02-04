import request from '@/utils/request';
import type { SocialLikeForm, SocialLikeQuery, SocialLikeVO } from './types';

// 查询点赞列表
export const listSocialLike = (query: SocialLikeQuery) => {
  return request({
    url: '/social/like/list',
    method: 'get',
    params: query
  });
};

// 查询点赞详细
export const getSocialLike = (likeId: number | string) => {
  return request<SocialLikeVO>({
    url: `/social/like/${likeId}`,
    method: 'get'
  });
};

// 新增点赞
export const addSocialLike = (data: SocialLikeForm) => {
  return request({
    url: '/social/like',
    method: 'post',
    data: data
  });
};

// 修改点赞
export const updateSocialLike = (data: SocialLikeForm) => {
  return request({
    url: '/social/like',
    method: 'put',
    data: data
  });
};

// 删除点赞
export const delSocialLike = (likeId: number | string | Array<number | string>) => {
  return request({
    url: `/social/like/${likeId}`,
    method: 'delete'
  });
};

// 导出点赞
export const exportSocialLike = (query: SocialLikeQuery) => {
  return request({
    url: '/social/like/export',
    method: 'post',
    data: query
  });
};

// 批量删除点赞（按目标）
export const batchDelByTarget = (targetType: string, targetId: number | string) => {
  return request({
    url: '/social/like/batchDelByTarget',
    method: 'delete',
    params: { targetType, targetId }
  });
};

// 统计点赞数
export const countLikes = (targetType: string, targetId: number | string) => {
  return request<number>({
    url: '/social/like/count',
    method: 'get',
    params: { targetType, targetId }
  });
};

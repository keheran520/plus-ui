import request from '@/utils/request';
import type { SocialCommentForm, SocialCommentQuery, SocialCommentVO } from './types';

// 查询评论列表
export const listSocialComment = (query: SocialCommentQuery) => {
  return request({
    url: '/social/comment/list',
    method: 'get',
    params: query
  });
};

// 查询评论详细
export const getSocialComment = (commentId: number | string) => {
  return request<SocialCommentVO>({
    url: `/social/comment/${commentId}`,
    method: 'get'
  });
};

// 新增评论
export const addSocialComment = (data: SocialCommentForm) => {
  return request({
    url: '/social/comment',
    method: 'post',
    data: data
  });
};

// 修改评论
export const updateSocialComment = (data: SocialCommentForm) => {
  return request({
    url: '/social/comment',
    method: 'put',
    data: data
  });
};

// 删除评论
export const delSocialComment = (commentId: number | string | Array<number | string>) => {
  return request({
    url: `/social/comment/${commentId}`,
    method: 'delete'
  });
};

// 导出评论
export const exportSocialComment = (query: SocialCommentQuery) => {
  return request({
    url: '/social/comment/export',
    method: 'post',
    data: query
  });
};

// 审核评论
export const auditComment = (commentId: number | string, status: string) => {
  return request({
    url: '/social/comment/audit',
    method: 'put',
    data: { commentId, status }
  });
};

// 批量审核评论
export const batchAuditComment = (commentIds: Array<number | string>, status: string) => {
  return request({
    url: '/social/comment/batchAudit',
    method: 'put',
    data: { commentIds, status }
  });
};

// 获取评论树
export const getCommentTree = (targetType: string, targetId: number | string) => {
  return request<SocialCommentVO[]>({
    url: '/social/comment/tree',
    method: 'get',
    params: { targetType, targetId }
  });
};

import request from '@/utils/request';
import type { SocialShareForm, SocialShareQuery, SocialShareVO } from './types';

// 查询转发列表
export const listSocialShare = (query: SocialShareQuery) => {
  return request({
    url: '/social/share/list',
    method: 'get',
    params: query
  });
};

// 查询转发详细
export const getSocialShare = (shareId: number | string) => {
  return request<SocialShareVO>({
    url: `/social/share/${shareId}`,
    method: 'get'
  });
};

// 新增转发
export const addSocialShare = (data: SocialShareForm) => {
  return request({
    url: '/social/share',
    method: 'post',
    data: data
  });
};

// 修改转发
export const updateSocialShare = (data: SocialShareForm) => {
  return request({
    url: '/social/share',
    method: 'put',
    data: data
  });
};

// 删除转发
export const delSocialShare = (shareId: number | string | Array<number | string>) => {
  return request({
    url: `/social/share/${shareId}`,
    method: 'delete'
  });
};

// 导出转发
export const exportSocialShare = (query: SocialShareQuery) => {
  return request({
    url: '/social/share/export',
    method: 'post',
    data: query
  });
};

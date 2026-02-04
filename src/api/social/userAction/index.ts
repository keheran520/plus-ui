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

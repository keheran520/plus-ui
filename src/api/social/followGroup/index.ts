import request from '@/utils/request';
import type { SocialFollowGroupForm, SocialFollowGroupQuery, SocialFollowGroupVO } from './types';

// 查询关注分组列表
export const listSocialFollowGroup = (query: SocialFollowGroupQuery) => {
  return request({
    url: '/social/followGroup/list',
    method: 'get',
    params: query
  });
};

// 查询关注分组详细
export const getSocialFollowGroup = (groupId: number | string) => {
  return request<SocialFollowGroupVO>({
    url: `/social/followGroup/${groupId}`,
    method: 'get'
  });
};

// 新增关注分组
export const addSocialFollowGroup = (data: SocialFollowGroupForm) => {
  return request({
    url: '/social/followGroup',
    method: 'post',
    data: data
  });
};

// 修改关注分组
export const updateSocialFollowGroup = (data: SocialFollowGroupForm) => {
  return request({
    url: '/social/followGroup',
    method: 'put',
    data: data
  });
};

// 删除关注分组
export const delSocialFollowGroup = (groupId: number | string | Array<number | string>) => {
  return request({
    url: `/social/followGroup/${groupId}`,
    method: 'delete'
  });
};

// 导出关注分组
export const exportSocialFollowGroup = (query: SocialFollowGroupQuery) => {
  return request({
    url: '/social/followGroup/export',
    method: 'post',
    data: query
  });
};

// 获取用户的所有分组
export const getUserGroups = (userId: number | string) => {
  return request<SocialFollowGroupVO[]>({
    url: `/social/followGroup/user/${userId}`,
    method: 'get'
  });
};

// 更新分组排序
export const updateSort = (groups: SocialFollowGroupForm[]) => {
  return request({
    url: '/social/followGroup/sort',
    method: 'put',
    data: groups
  });
};

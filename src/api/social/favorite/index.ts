import request from '@/utils/request';
import type { SocialFavoriteForm, SocialFavoriteQuery, SocialFavoriteVO } from './types';

// 查询收藏列表
export const listSocialFavorite = (query: SocialFavoriteQuery) => {
  return request({
    url: '/social/favorite/list',
    method: 'get',
    params: query
  });
};

// 查询收藏详细
export const getSocialFavorite = (favoriteId: number | string) => {
  return request<SocialFavoriteVO>({
    url: `/social/favorite/${favoriteId}`,
    method: 'get'
  });
};

// 新增收藏
export const addSocialFavorite = (data: SocialFavoriteForm) => {
  return request({
    url: '/social/favorite',
    method: 'post',
    data: data
  });
};

// 修改收藏
export const updateSocialFavorite = (data: SocialFavoriteForm) => {
  return request({
    url: '/social/favorite',
    method: 'put',
    data: data
  });
};

// 删除收藏
export const delSocialFavorite = (favoriteId: number | string | Array<number | string>) => {
  return request({
    url: `/social/favorite/${favoriteId}`,
    method: 'delete'
  });
};

// 导出收藏
export const exportSocialFavorite = (query: SocialFavoriteQuery) => {
  return request({
    url: '/social/favorite/export',
    method: 'post',
    data: query
  });
};

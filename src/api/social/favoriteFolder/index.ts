import request from '@/utils/request';
import type { SocialFavoriteFolderForm, SocialFavoriteFolderQuery, SocialFavoriteFolderVO } from './types';

// 查询收藏夹列表
export const listSocialFavoriteFolder = (query: SocialFavoriteFolderQuery) => {
  return request({
    url: '/social/favoriteFolder/list',
    method: 'get',
    params: query
  });
};

// 查询收藏夹详细
export const getSocialFavoriteFolder = (folderId: number | string) => {
  return request<SocialFavoriteFolderVO>({
    url: `/social/favoriteFolder/${folderId}`,
    method: 'get'
  });
};

// 新增收藏夹
export const addSocialFavoriteFolder = (data: SocialFavoriteFolderForm) => {
  return request({
    url: '/social/favoriteFolder',
    method: 'post',
    data: data
  });
};

// 修改收藏夹
export const updateSocialFavoriteFolder = (data: SocialFavoriteFolderForm) => {
  return request({
    url: '/social/favoriteFolder',
    method: 'put',
    data: data
  });
};

// 删除收藏夹
export const delSocialFavoriteFolder = (folderId: number | string | Array<number | string>) => {
  return request({
    url: `/social/favoriteFolder/${folderId}`,
    method: 'delete'
  });
};

// 导出收藏夹
export const exportSocialFavoriteFolder = (query: SocialFavoriteFolderQuery) => {
  return request({
    url: '/social/favoriteFolder/export',
    method: 'post',
    data: query
  });
};

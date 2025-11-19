import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ImageVO, ImageForm, ImageQuery } from '@/api/picturebed/image/types';

/**
 * 查询图片信息列表
 * @param query
 * @returns {*}
 */

export const listImage = (query?: ImageQuery): AxiosPromise<ImageVO[]> => {
  return request({
    url: '/picturebed/image/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询图片信息详细
 * @param imageId
 */
export const getImage = (imageId: string | number): AxiosPromise<ImageVO> => {
  return request({
    url: '/picturebed/image/' + imageId,
    method: 'get'
  });
};

/**
 * 新增图片信息
 * @param data
 */
export const addImage = (data: ImageForm) => {
  return request({
    url: '/picturebed/image',
    method: 'post',
    data: data
  });
};

/**
 * 修改图片信息
 * @param data
 */
export const updateImage = (data: ImageForm) => {
  return request({
    url: '/picturebed/image',
    method: 'put',
    data: data
  });
};

/**
 * 删除图片信息
 * @param imageId
 */
export const delImage = (imageId: string | number | Array<string | number>) => {
  return request({
    url: '/picturebed/image/' + imageId,
    method: 'delete'
  });
};

/**
 * 批量上传图片
 * @param formData
 */
export const batchUploadImages = (formData: FormData): AxiosPromise<ImageVO[]> => {
  return request({
    url: '/picturebed/image/batchUpload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 获取搜索建议（开放接口）
 * @param keyword 关键词
 * @param limit 返回数量限制
 */
export const getSearchSuggestions = (keyword: string, limit?: number): AxiosPromise<any[]> => {
  return request({
    url: '/open/picturebed/image/suggestions',
    method: 'get',
    params: {
      keyword,
      limit: limit || 10
    }
  });
};

/**
 * 获取热门标签（排行榜）（开放接口）
 * @param limit 返回数量限制
 */
export const getHotTags = (limit?: number): AxiosPromise<any[]> => {
  return request({
    url: '/open/picturebed/image/hotTags',
    method: 'get',
    params: {
      limit: limit || 10
    }
  });
};

/**
 * 批量更新图片所属相册
 * @param data { imageIds: string, albumId: number }
 */
export const batchUpdateAlbum = (data: { imageIds: string; albumId: number | string }) => {
  return request({
    url: '/picturebed/image/batchUpdateAlbum',
    method: 'put',
    params: data
  });
};

/**
 * 从相册中移除图片
 * @param data { imageIds: string, albumId: number }
 */
export const removeFromAlbum = (data: { imageIds: string; albumId: number | string }) => {
  return request({
    url: '/picturebed/image/removeFromAlbum',
    method: 'put',
    params: data
  });
};

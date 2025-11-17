import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ImageAlbumVO, ImageAlbumForm, ImageAlbumQuery } from '@/api/picturebed/imageAlbum/types';

/**
 * 查询图片相册列表
 * @param query
 * @returns {*}
 */

export const listImageAlbum = (query?: ImageAlbumQuery): AxiosPromise<ImageAlbumVO[]> => {
  return request({
    url: '/picturebed/imageAlbum/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询图片相册详细
 * @param albumId
 */
export const getImageAlbum = (albumId: string | number): AxiosPromise<ImageAlbumVO> => {
  return request({
    url: '/picturebed/imageAlbum/' + albumId,
    method: 'get'
  });
};

/**
 * 新增图片相册
 * @param data
 */
export const addImageAlbum = (data: ImageAlbumForm) => {
  return request({
    url: '/picturebed/imageAlbum',
    method: 'post',
    data: data
  });
};

/**
 * 修改图片相册
 * @param data
 */
export const updateImageAlbum = (data: ImageAlbumForm) => {
  return request({
    url: '/picturebed/imageAlbum',
    method: 'put',
    data: data
  });
};

/**
 * 删除图片相册
 * @param albumId
 */
export const delImageAlbum = (albumId: string | number | Array<string | number>) => {
  return request({
    url: '/picturebed/imageAlbum/' + albumId,
    method: 'delete'
  });
};

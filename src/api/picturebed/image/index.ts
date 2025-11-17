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

import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ImageTagVO, ImageTagForm, ImageTagQuery } from '@/api/picturebed/imageTag/types';

/**
 * 查询图片标签列表
 * @param query
 * @returns {*}
 */

export const listImageTag = (query?: ImageTagQuery): AxiosPromise<ImageTagVO[]> => {
  return request({
    url: '/picturebed/imageTag/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询图片标签详细
 * @param tagId
 */
export const getImageTag = (tagId: string | number): AxiosPromise<ImageTagVO> => {
  return request({
    url: '/picturebed/imageTag/' + tagId,
    method: 'get'
  });
};

/**
 * 新增图片标签
 * @param data
 */
export const addImageTag = (data: ImageTagForm) => {
  return request({
    url: '/picturebed/imageTag',
    method: 'post',
    data: data
  });
};

/**
 * 修改图片标签
 * @param data
 */
export const updateImageTag = (data: ImageTagForm) => {
  return request({
    url: '/picturebed/imageTag',
    method: 'put',
    data: data
  });
};

/**
 * 删除图片标签
 * @param tagId
 */
export const delImageTag = (tagId: string | number | Array<string | number>) => {
  return request({
    url: '/picturebed/imageTag/' + tagId,
    method: 'delete'
  });
};

/**
 * 根据分类ID查询关联的标签列表
 * @param categoryId
 */
export const listImageTagByCategory = (categoryId: string | number): AxiosPromise<ImageTagVO[]> => {
  return request({
    url: '/picturebed/imageTag/listByCategory/' + categoryId,
    method: 'get'
  });
};

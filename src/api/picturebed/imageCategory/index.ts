import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ImageCategoryVO, ImageCategoryForm, ImageCategoryQuery } from '@/api/picturebed/imageCategory/types';

/**
 * 查询图片分类列表
 * @param query
 * @returns {*}
 */

export const listImageCategory = (query?: ImageCategoryQuery): AxiosPromise<ImageCategoryVO[]> => {
  return request({
    url: '/picturebed/imageCategory/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询图片分类详细
 * @param categoryId
 */
export const getImageCategory = (categoryId: string | number): AxiosPromise<ImageCategoryVO> => {
  return request({
    url: '/picturebed/imageCategory/' + categoryId,
    method: 'get'
  });
};

/**
 * 新增图片分类
 * @param data
 */
export const addImageCategory = (data: ImageCategoryForm) => {
  return request({
    url: '/picturebed/imageCategory',
    method: 'post',
    data: data
  });
};

/**
 * 修改图片分类
 * @param data
 */
export const updateImageCategory = (data: ImageCategoryForm) => {
  return request({
    url: '/picturebed/imageCategory',
    method: 'put',
    data: data
  });
};

/**
 * 删除图片分类
 * @param categoryId
 */
export const delImageCategory = (categoryId: string | number | Array<string | number>) => {
  return request({
    url: '/picturebed/imageCategory/' + categoryId,
    method: 'delete'
  });
};

/**
 * 级联删除图片分类（包括所有子分类）
 * @param categoryId
 */
export const delImageCategoryCascade = (categoryId: string | number | Array<string | number>) => {
  return request({
    url: '/picturebed/imageCategory/cascade/' + categoryId,
    method: 'delete'
  });
};

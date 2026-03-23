import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CategoryVO, CategoryForm, CategoryQuery } from '@/api/mall/category/types';

/**
 * 查询商品分类列表
 * @param query
 * @returns {*}
 */

export const listCategory = (query?: CategoryQuery): AxiosPromise<CategoryVO[]> => {
  return request({
    url: '/mall/category/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询商品分类详细
 * @param id
 */
export const getCategory = (id: string | number): AxiosPromise<CategoryVO> => {
  return request({
    url: '/mall/category/' + id,
    method: 'get'
  });
};

/**
 * 新增商品分类
 * @param data
 */
export const addCategory = (data: CategoryForm) => {
  return request({
    url: '/mall/category',
    method: 'post',
    data: data
  });
};

/**
 * 修改商品分类
 * @param data
 */
export const updateCategory = (data: CategoryForm) => {
  return request({
    url: '/mall/category',
    method: 'put',
    data: data
  });
};

/**
 * 删除商品分类
 * @param id
 */
export const delCategory = (id: string | number | Array<string | number>) => {
  return request({
    url: '/mall/category/' + id,
    method: 'delete'
  });
};

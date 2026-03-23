import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BrandVO, BrandForm, BrandQuery } from '@/api/mall/brand/types';

/**
 * 查询品牌列表
 * @param query
 * @returns {*}
 */

export const listBrand = (query?: BrandQuery): AxiosPromise<BrandVO[]> => {
  return request({
    url: '/mall/brand/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询品牌详细
 * @param id
 */
export const getBrand = (id: string | number): AxiosPromise<BrandVO> => {
  return request({
    url: '/mall/brand/' + id,
    method: 'get'
  });
};

/**
 * 新增品牌
 * @param data
 */
export const addBrand = (data: BrandForm) => {
  return request({
    url: '/mall/brand',
    method: 'post',
    data: data
  });
};

/**
 * 修改品牌
 * @param data
 */
export const updateBrand = (data: BrandForm) => {
  return request({
    url: '/mall/brand',
    method: 'put',
    data: data
  });
};

/**
 * 删除品牌
 * @param id
 */
export const delBrand = (id: string | number | Array<string | number>) => {
  return request({
    url: '/mall/brand/' + id,
    method: 'delete'
  });
};

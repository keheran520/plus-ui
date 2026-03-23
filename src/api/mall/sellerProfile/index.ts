import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SellerProfileVO, SellerProfileForm, SellerProfileQuery } from '@/api/mall/sellerProfile/types';

/**
 * 查询服务商资料列表
 * @param query
 * @returns {*}
 */

export const listSellerProfile = (query?: SellerProfileQuery): AxiosPromise<SellerProfileVO[]> => {
  return request({
    url: '/mall/sellerProfile/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询服务商资料详细
 * @param id
 */
export const getSellerProfile = (id: string | number): AxiosPromise<SellerProfileVO> => {
  return request({
    url: '/mall/sellerProfile/' + id,
    method: 'get'
  });
};

/**
 * 新增服务商资料
 * @param data
 */
export const addSellerProfile = (data: SellerProfileForm) => {
  return request({
    url: '/mall/sellerProfile',
    method: 'post',
    data: data
  });
};

/**
 * 修改服务商资料
 * @param data
 */
export const updateSellerProfile = (data: SellerProfileForm) => {
  return request({
    url: '/mall/sellerProfile',
    method: 'put',
    data: data
  });
};

/**
 * 删除服务商资料
 * @param id
 */
export const delSellerProfile = (id: string | number | Array<string | number>) => {
  return request({
    url: '/mall/sellerProfile/' + id,
    method: 'delete'
  });
};

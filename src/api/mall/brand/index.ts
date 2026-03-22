import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MallBrandForm, MallBrandQuery, MallBrandVO } from '@/api/mall/brand/types';

export const listMallBrand = (query?: MallBrandQuery): AxiosPromise<MallBrandVO[]> => {
  return request({
    url: '/mall/brand/list',
    method: 'get',
    params: query
  });
};

export const getMallBrand = (id: string | number): AxiosPromise<MallBrandVO> => {
  return request({
    url: '/mall/brand/' + id,
    method: 'get'
  });
};

export const addMallBrand = (data: MallBrandForm) => {
  return request({
    url: '/mall/brand',
    method: 'post',
    data
  });
};

export const updateMallBrand = (data: MallBrandForm) => {
  return request({
    url: '/mall/brand',
    method: 'put',
    data
  });
};

export const delMallBrand = (id: string | number | Array<string | number>) => {
  return request({
    url: '/mall/brand/' + id,
    method: 'delete'
  });
};

import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MallCategoryForm, MallCategoryQuery, MallCategoryVO } from '@/api/mall/category/types';

export const listMallCategory = (query?: MallCategoryQuery): AxiosPromise<MallCategoryVO[]> => {
  return request({
    url: '/mall/category/list',
    method: 'get',
    params: query
  });
};

export const getMallCategory = (id: string | number): AxiosPromise<MallCategoryVO> => {
  return request({
    url: '/mall/category/' + id,
    method: 'get'
  });
};

export const addMallCategory = (data: MallCategoryForm) => {
  return request({
    url: '/mall/category',
    method: 'post',
    data
  });
};

export const updateMallCategory = (data: MallCategoryForm) => {
  return request({
    url: '/mall/category',
    method: 'put',
    data
  });
};

export const delMallCategory = (id: string | number | Array<string | number>) => {
  return request({
    url: '/mall/category/' + id,
    method: 'delete'
  });
};

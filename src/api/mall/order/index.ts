import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MallOrderForm, MallOrderQuery, MallOrderVO } from '@/api/mall/order/types';

export const listMallOrder = (query?: MallOrderQuery): AxiosPromise<MallOrderVO[]> => {
  return request({
    url: '/mall/order/list',
    method: 'get',
    params: query
  });
};

export const getMallOrder = (id: string | number): AxiosPromise<MallOrderVO> => {
  return request({
    url: '/mall/order/' + id,
    method: 'get'
  });
};

export const addMallOrder = (data: MallOrderForm) => {
  return request({
    url: '/mall/order',
    method: 'post',
    data
  });
};

export const updateMallOrder = (data: MallOrderForm) => {
  return request({
    url: '/mall/order',
    method: 'put',
    data
  });
};

export const delMallOrder = (id: string | number | Array<string | number>) => {
  return request({
    url: '/mall/order/' + id,
    method: 'delete'
  });
};

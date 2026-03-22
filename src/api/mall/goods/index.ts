import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MallGoodsForm, MallGoodsQuery, MallGoodsVO } from '@/api/mall/goods/types';

export const listMallGoods = (query?: MallGoodsQuery): AxiosPromise<MallGoodsVO[]> => {
  return request({
    url: '/mall/goods/list',
    method: 'get',
    params: query
  });
};

export const getMallGoods = (id: string | number): AxiosPromise<MallGoodsVO> => {
  return request({
    url: '/mall/goods/' + id,
    method: 'get'
  });
};

export const addMallGoods = (data: MallGoodsForm) => {
  return request({
    url: '/mall/goods',
    method: 'post',
    data
  });
};

export const updateMallGoods = (data: MallGoodsForm) => {
  return request({
    url: '/mall/goods',
    method: 'put',
    data
  });
};

export const delMallGoods = (id: string | number | Array<string | number>) => {
  return request({
    url: '/mall/goods/' + id,
    method: 'delete'
  });
};

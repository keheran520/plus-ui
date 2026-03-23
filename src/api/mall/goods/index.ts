import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { GoodsForm, GoodsQuery, GoodsVO } from '@/api/mall/goods/types';

export const listGoods = (query?: GoodsQuery): AxiosPromise<GoodsVO[]> => {
  return request({
    url: '/mall/goods/list',
    method: 'get',
    params: query
  });
};

export const getGoods = (id: string | number): AxiosPromise<GoodsVO> => {
  return request({
    url: '/mall/goods/' + id,
    method: 'get'
  });
};

export const generateGoodsSn = (): AxiosPromise<string> => {
  return request({
    url: '/mall/goods/generateGoodsSn',
    method: 'get'
  });
};

export const addGoods = (data: GoodsForm) => {
  return request({
    url: '/mall/goods',
    method: 'post',
    data
  });
};

export const updateGoods = (data: GoodsForm) => {
  return request({
    url: '/mall/goods',
    method: 'put',
    data
  });
};

export const copyGoods = (id: string | number) => {
  return request({
    url: `/mall/goods/${id}/copy`,
    method: 'post'
  });
};

export const updateGoodsSaleStatus = (id: string | number, saleStatus: string) => {
  return request({
    url: `/mall/goods/${id}/saleStatus/${saleStatus}`,
    method: 'put'
  });
};

export const updateGoodsAuditStatus = (id: string | number, auditStatus: string) => {
  return request({
    url: `/mall/goods/${id}/auditStatus/${auditStatus}`,
    method: 'put'
  });
};

export const updateGoodsRecommendFlag = (id: string | number, recommendFlag: string) => {
  return request({
    url: `/mall/goods/${id}/recommendFlag/${recommendFlag}`,
    method: 'put'
  });
};

export const delGoods = (id: string | number | Array<string | number>) => {
  return request({
    url: '/mall/goods/' + id,
    method: 'delete'
  });
};

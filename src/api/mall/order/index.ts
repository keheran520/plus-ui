import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OrderVO, OrderForm, OrderQuery } from '@/api/mall/order/types';

export const listOrder = (query?: OrderQuery): AxiosPromise<OrderVO[]> => {
  return request({
    url: '/mall/order/list',
    method: 'get',
    params: query
  });
};

export const getOrder = (id: string | number): AxiosPromise<OrderVO> => {
  return request({
    url: `/mall/order/${id}`,
    method: 'get'
  });
};

export const addOrder = (data: OrderForm) => {
  return request({
    url: '/mall/order',
    method: 'post',
    data
  });
};

export const updateOrder = (data: OrderForm) => {
  return request({
    url: '/mall/order',
    method: 'put',
    data
  });
};

export const payOrder = (id: string | number, payType = 'balance') => {
  return request({
    url: `/mall/order/${id}/pay`,
    method: 'post',
    params: { payType }
  });
};

export const deliverOrder = (id: string | number, data: OrderForm) => {
  return request({
    url: `/mall/order/${id}/deliver`,
    method: 'post',
    data
  });
};

export const confirmReceive = (id: string | number) => {
  return request({
    url: `/mall/order/${id}/receive`,
    method: 'post'
  });
};

export const applyRefund = (id: string | number, data: OrderForm) => {
  return request({
    url: `/mall/order/${id}/refund/apply`,
    method: 'post',
    data
  });
};

export const auditRefund = (id: string | number, data: OrderForm) => {
  return request({
    url: `/mall/order/${id}/refund/audit`,
    method: 'post',
    data
  });
};

export const applyComplaint = (id: string | number, data: OrderForm) => {
  return request({
    url: `/mall/order/${id}/complaint/apply`,
    method: 'post',
    data
  });
};

export const handleComplaint = (id: string | number, data: OrderForm) => {
  return request({
    url: `/mall/order/${id}/complaint/handle`,
    method: 'post',
    data
  });
};

export const autoCancelOrder = () => {
  return request({
    url: '/mall/order/autoCancel',
    method: 'post'
  });
};

export const autoReceiveOrder = () => {
  return request({
    url: '/mall/order/autoReceive',
    method: 'post'
  });
};

export const delOrder = (id: string | number | Array<string | number>) => {
  return request({
    url: `/mall/order/${id}`,
    method: 'delete'
  });
};

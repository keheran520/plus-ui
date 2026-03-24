import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SellerProfileForm, SellerProfileQuery, SellerProfileVO } from '@/api/mall/sellerProfile/types';

/**
 * 查询服务商档案列表
 */
export const listSellerProfile = (query?: SellerProfileQuery): AxiosPromise<SellerProfileVO[]> => {
  return request({
    url: '/mall/sellerProfile/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询服务商档案详情
 */
export const getSellerProfile = (id: string | number): AxiosPromise<SellerProfileVO> => {
  return request({
    url: '/mall/sellerProfile/' + id,
    method: 'get'
  });
};

/**
 * 查询已绑定服务商档案的会员 ID 列表
 */
export const getSellerLinkedMemberIds = (): AxiosPromise<number[]> => {
  return request({
    url: '/mall/sellerProfile/linkedMemberIds',
    method: 'get'
  });
};

/**
 * 新增服务商档案
 */
export const addSellerProfile = (data: SellerProfileForm) => {
  return request({
    url: '/mall/sellerProfile',
    method: 'post',
    data
  });
};

/**
 * 修改服务商档案
 */
export const updateSellerProfile = (data: SellerProfileForm) => {
  return request({
    url: '/mall/sellerProfile',
    method: 'put',
    data
  });
};

/**
 * 更新服务状态
 */
export const updateSellerServiceStatus = (id: string | number, serviceStatus: string) => {
  return request({
    url: `/mall/sellerProfile/${id}/serviceStatus/${serviceStatus}`,
    method: 'put'
  });
};

/**
 * 更新审核状态
 */
export const updateSellerVerifyStatus = (id: string | number, verifyStatus: string) => {
  return request({
    url: `/mall/sellerProfile/${id}/verifyStatus/${verifyStatus}`,
    method: 'put'
  });
};

/**
 * 更新推荐状态
 */
export const updateSellerFeaturedFlag = (id: string | number, featuredFlag: string) => {
  return request({
    url: `/mall/sellerProfile/${id}/featuredFlag/${featuredFlag}`,
    method: 'put'
  });
};

/**
 * 更新系统状态
 */
export const updateSellerSystemStatus = (id: string | number, status: string) => {
  return request({
    url: `/mall/sellerProfile/${id}/status/${status}`,
    method: 'put'
  });
};

/**
 * 删除服务商档案
 */
export const delSellerProfile = (id: string | number | Array<string | number>) => {
  return request({
    url: '/mall/sellerProfile/' + id,
    method: 'delete'
  });
};

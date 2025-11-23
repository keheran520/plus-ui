import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PhoneVerifyConfigVO, PhoneVerifyConfigForm, PhoneVerifyConfigQuery } from '@/api/system/phoneVerifyConfig/types';

/**
 * 查询号码认证配置列表
 * @param query
 * @returns {*}
 */

export const listPhoneVerifyConfig = (query?: PhoneVerifyConfigQuery): AxiosPromise<PhoneVerifyConfigVO[]> => {
  return request({
    url: '/system/phoneVerifyConfig/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询号码认证配置详细
 * @param configId
 */
export const getPhoneVerifyConfig = (configId: string | number): AxiosPromise<PhoneVerifyConfigVO> => {
  return request({
    url: '/system/phoneVerifyConfig/' + configId,
    method: 'get'
  });
};

/**
 * 新增号码认证配置
 * @param data
 */
export const addPhoneVerifyConfig = (data: PhoneVerifyConfigForm) => {
  return request({
    url: '/system/phoneVerifyConfig',
    method: 'post',
    data: data
  });
};

/**
 * 修改号码认证配置
 * @param data
 */
export const updatePhoneVerifyConfig = (data: PhoneVerifyConfigForm) => {
  return request({
    url: '/system/phoneVerifyConfig',
    method: 'put',
    data: data
  });
};

/**
 * 删除号码认证配置
 * @param configId
 */
export const delPhoneVerifyConfig = (configId: string | number | Array<string | number>) => {
  return request({
    url: '/system/phoneVerifyConfig/' + configId,
    method: 'delete'
  });
};

/**
 * 获取号码认证配置的accessKeySecret
 * @param configId
 */
export const getPhoneVerifyConfigSecret = (configId: string | number): AxiosPromise<string> => {
  return request({
    url: '/system/phoneVerifyConfig/getAccessKeySecret/' + configId,
    method: 'get'
  });
};

/**
 * 获取默认配置
 */
export const getDefaultPhoneVerifyConfig = (): AxiosPromise<PhoneVerifyConfigVO> => {
  return request({
    url: '/system/phoneVerifyConfig/getDefault',
    method: 'get'
  });
};

/**
 * 设置为默认配置
 * @param configId
 */
export const setDefaultPhoneVerifyConfig = (configId: string | number) => {
  return request({
    url: '/system/phoneVerifyConfig/setDefault/' + configId,
    method: 'put'
  });
};

import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LoginData, LoginResult, TenantInfo, VerifyCodeResult } from './types';
import { UserInfo } from '@/api/system/user/types';

// pc端固定客户端授权id
const clientId = import.meta.env.VITE_APP_CLIENT_ID;

/**
 * @param data {LoginData}
 * @returns
 */
export function login(data: LoginData): AxiosPromise<LoginResult> {
  const params = {
    ...data,
    clientId: data.clientId || clientId,
    grantType: data.grantType || 'password'
  };
  return request({
    url: '/auth/login',
    headers: {
      isToken: false,
      isEncrypt: true,
      repeatSubmit: false
    },
    method: 'post',
    data: params
  });
}

// 注册方法
export function register(data: any) {
  const params = {
    ...data,
    clientId: clientId,
    grantType: 'password'
  };
  return request({
    url: '/auth/register',
    headers: {
      isToken: false,
      isEncrypt: true,
      repeatSubmit: false
    },
    method: 'post',
    data: params
  });
}

/**
 * 注销
 */
export function logout() {
  if (import.meta.env.VITE_APP_SSE === 'true') {
    request({
      url: '/resource/sse/close',
      method: 'get'
    });
  }
  return request({
    url: '/auth/logout',
    method: 'post'
  });
}

/**
 * 获取验证码配置
 * @param tenantId 租户ID
 */
export function getCaptchaConfig(tenantId?: string): AxiosPromise<any> {
  return request({
    url: '/captchaConfig',
    headers: {
      isToken: false,
      'X-Tenant-Id': tenantId || '000000'
    },
    params: tenantId ? { tenantId } : undefined,
    method: 'get'
  });
}

/**
 * 获取注册开关配置
 * @param tenantId 租户ID
 */
export function getRegisterConfig(tenantId?: string): AxiosPromise<any> {
  return request({
    url: '/registerConfig',
    headers: {
      isToken: false,
      'X-Tenant-Id': tenantId || '000000'
    },
    params: tenantId ? { tenantId } : undefined,
    method: 'get'
  });
}

/**
 * 获取验证码
 * @param tenantId 租户ID
 */
export function getCodeImg(tenantId?: string): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/auth/code',
    headers: {
      isToken: false,
      'X-Tenant-Id': tenantId || '000000'
    },
    params: tenantId ? { tenantId } : undefined,
    method: 'get',
    timeout: 20000
  });
}

/**
 * 获取邮箱验证码
 * @param email 邮箱地址
 * @param tenantId 租户ID
 */
export function sendEmailVerifyCode(email: string, tenantId?: string): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/resource/email/code',
    headers: {
      isToken: false,
      'X-Tenant-Id': tenantId || '000000'
    },
    method: 'get',
    params: {
      email,
      ...(tenantId ? { tenantId } : {})
    },
    timeout: 20000
  });
}

/**
 * 获取号码认证验证码
 * @param phonenumber 手机号
 * @param businessType 业务类型
 * @param tenantId 租户ID
 */
export function sendPhoneVerifyCode(phonenumber: string, businessType?: string, tenantId?: string): AxiosPromise<any> {
  return request({
    url: '/resource/phoneverify/code',
    headers: {
      isToken: false,
      'X-Tenant-Id': tenantId || '000000'
    },
    method: 'get',
    params: {
      phonenumber,
      businessType: businessType || 'login',
      ...(tenantId ? { tenantId } : {})
    },
    timeout: 20000
  });
}

/**
 * 第三方登录
 */
export function callback(data: LoginData): AxiosPromise<any> {
  const LoginData = {
    ...data,
    clientId: clientId,
    grantType: 'social'
  };
  return request({
    url: '/auth/social/callback',
    method: 'post',
    data: LoginData
  });
}

// 获取用户详细信息
export function getInfo(): AxiosPromise<UserInfo> {
  return request({
    url: '/system/user/getInfo',
    method: 'get'
  });
}

// 获取租户列表
export function getTenantList(isToken: boolean): AxiosPromise<TenantInfo> {
  return request({
    url: '/auth/tenant/list',
    headers: {
      isToken: isToken
    },
    method: 'get'
  });
}

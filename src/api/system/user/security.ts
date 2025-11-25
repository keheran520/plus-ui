import request from '@/utils/request';

/**
 * 绑定安全手机
 */
export function bindPhone(data: { phonenumber: string; code: string }) {
  return request({
    url: '/system/user/security/bindPhone',
    method: 'post',
    data: data
  });
}

/**
 * 解绑安全手机
 */
export function unbindPhone(data: { code: string }) {
  return request({
    url: '/system/user/security/unbindPhone',
    method: 'post',
    data: data
  });
}

/**
 * 绑定安全邮箱
 */
export function bindEmail(data: { email: string; code: string }) {
  return request({
    url: '/system/user/security/bindEmail',
    method: 'post',
    data: data
  });
}

/**
 * 解绑安全邮箱
 */
export function unbindEmail(data: { code: string }) {
  return request({
    url: '/system/user/security/unbindEmail',
    method: 'post',
    data: data
  });
}

/**
 * 发送号码认证验证码（推荐使用）
 */
export function sendPhoneVerifyCode(phonenumber: string, businessType: string = 'bind') {
  return request({
    url: '/resource/phoneverify/code',
    method: 'get',
    params: { phonenumber, businessType }
  });
}

/**
 * 发送手机短信验证码（备用）
 */
export function sendPhoneSmsCode(phonenumber: string) {
  return request({
    url: '/resource/sms/code',
    method: 'get',
    params: { phonenumber }
  });
}

/**
 * 发送邮箱验证码
 * @param email 邮箱地址
 * @param businessType 业务类型（可选，默认为 login）
 */
export function sendEmailCode(email: string, businessType: string = 'login') {
  return request({
    url: '/resource/email/code',
    method: 'get',
    params: { email, businessType }
  });
}

import request from '@/utils/request'

/**
 * 验证码发送请求
 */
export interface VerifyCodeRequest {
  /** 手机号码 */
  phoneNumber: string
  /** 验证码长度 (默认6位) */
  codeLength?: number
  /** 有效期(分钟) (默认5分钟) */
  validMinutes?: number
  /** 业务类型 (用于区分不同场景) */
  businessType: string
  /** 模板ID (可选,不同云厂商可能需要) */
  templateId?: string
}

/**
 * 验证码发送响应
 */
export interface VerifyCodeResponse {
  /** 是否成功 */
  success: boolean
  /** 响应消息 */
  message: string
  /** 请求ID */
  requestId?: string
  /** 业务ID */
  bizId?: string
  /** 验证码 (仅测试环境返回) */
  code?: string
}

/**
 * 发送验证码
 */
export function sendVerifyCode(data: VerifyCodeRequest) {
  return request<VerifyCodeResponse>({
    url: '/phone/verify/send',
    method: 'post',
    data
  })
}

/**
 * 快速发送验证码 (简化接口)
 */
export function sendVerifyCodeQuick(phoneNumber: string, businessType: string) {
  return request<VerifyCodeResponse>({
    url: '/phone/verify/send/quick',
    method: 'post',
    params: {
      phoneNumber,
      businessType
    }
  })
}

/**
 * 校验验证码
 */
export function verifyCode(phoneNumber: string, code: string, businessType: string) {
  return request<boolean>({
    url: '/phone/verify/verify',
    method: 'post',
    params: {
      phoneNumber,
      code,
      businessType
    }
  })
}

/**
 * 获取当前使用的提供商
 */
export function getProvider() {
  return request<string>({
    url: '/phone/verify/provider',
    method: 'get'
  })
}

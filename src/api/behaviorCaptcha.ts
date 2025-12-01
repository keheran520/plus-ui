import request from '@/utils/request';

/**
 * 行为验证码API
 */

// 生成滑动验证码
export function generateSlider() {
  return request({
    url: '/behavior/captcha/slider',
    method: 'get'
  });
}

// 生成旋转验证码
export function generateRotate() {
  return request({
    url: '/behavior/captcha/rotate',
    method: 'get'
  });
}

// 生成点选验证码
export function generateClick() {
  return request({
    url: '/behavior/captcha/click',
    method: 'get'
  });
}

// 校验验证码
export function validateCaptcha(captchaId: string, track: any) {
  return request({
    url: '/behavior/captcha/validate',
    method: 'post',
    params: { captchaId },
    data: track
  });
}

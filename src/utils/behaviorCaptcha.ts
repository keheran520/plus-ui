/**
 * 行为验证码工具类
 * 基于 Tianai-Captcha 官方 SDK 封装
 */

declare global {
  interface Window {
    initTAC: (baseUrl: string, config: TACConfig, style?: TACStyle) => Promise<TACInstance>;
  }
}

/**
 * TAC 配置接口
 */
export interface TACConfig {
  /** 生成验证码接口 */
  requestCaptchaDataUrl: string;
  /** 校验接口 */
  validCaptchaUrl: string;
  /** 验证码绑定的 div */
  bindEl: string;
  /** 验证成功回调 */
  validSuccess: (res: any, c: any, tac: TACInstance) => void;
  /** 验证失败回调 */
  validFail?: (res: any, c: any, tac: TACInstance) => void;
  /** 刷新按钮回调 */
  btnRefreshFun?: (el: HTMLElement, tac: TACInstance) => void;
  /** 关闭按钮回调 */
  btnCloseFun?: (el: HTMLElement, tac: TACInstance) => void;
}

/**
 * TAC 样式配置
 */
export interface TACStyle {
  /** Logo URL */
  logoUrl?: string | null;
  /** 按钮样式 URL */
  btnUrl?: string;
  /** 背景样式 URL */
  bgUrl?: string;
  /** 滑动边框颜色 */
  moveTrackMaskBgColor?: string;
  /** 滑动边框描边颜色 */
  moveTrackMaskBorderColor?: string;
}

/**
 * TAC 实例接口
 */
export interface TACInstance {
  /** 初始化并显示验证码 */
  init: () => void;
  /** 重新加载验证码 */
  reloadCaptcha: () => void;
  /** 销毁验证码窗口 */
  destroyWindow: () => void;
}

function normalizeApiBaseUrl() {
  return (import.meta.env.VITE_APP_BASE_API || '').trim().replace(/\/+$/, '');
}

function buildCaptchaApiUrl(path: string) {
  const baseUrl = normalizeApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * 加载 TAC SDK 脚本
 */
function loadTACScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.initTAC) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '/load.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('加载 TAC 初始化脚本失败'));
    document.head.appendChild(script);
  });
}

/**
 * 显示行为验证码
 */
export async function showBehaviorCaptcha(options: {
  /** 验证成功回调 */
  onSuccess: (validToken: string) => void;
  /** 验证失败回调 */
  onFail?: () => void;
  /** 关闭回调 */
  onClose?: () => void;
}): Promise<TACInstance> {
  try {
    await loadTACScript();

    let captchaBox = document.getElementById('tac-captcha-box');
    if (!captchaBox) {
      captchaBox = document.createElement('div');
      captchaBox.id = 'tac-captcha-box';
      document.body.appendChild(captchaBox);
    }

    captchaBox.style.position = 'fixed';
    captchaBox.style.top = '0';
    captchaBox.style.left = '0';
    captchaBox.style.right = '0';
    captchaBox.style.bottom = '0';
    captchaBox.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    captchaBox.style.zIndex = '9998';
    captchaBox.style.display = 'flex';
    captchaBox.style.alignItems = 'center';
    captchaBox.style.justifyContent = 'center';

    const config: TACConfig = {
      requestCaptchaDataUrl: buildCaptchaApiUrl('/captcha/gen'),
      validCaptchaUrl: buildCaptchaApiUrl('/captcha/check'),
      bindEl: '#tac-captcha-box',
      validSuccess: (res, c, tac) => {
        tac.destroyWindow();
        cleanupBehaviorCaptcha();
        const captchaId = res?.data || c?.id || c?.currentCaptchaData?.id || '';
        options.onSuccess(captchaId);
      },
      validFail: (_res, _c, tac) => {
        tac.reloadCaptcha();
        options.onFail?.();
      },
      btnRefreshFun: (_el, tac) => {
        tac.reloadCaptcha();
      },
      btnCloseFun: (_el, tac) => {
        tac.destroyWindow();
        cleanupBehaviorCaptcha();
        options.onClose?.();
      }
    };

    const style: TACStyle = {
      logoUrl: null
    };

    const tac = await window.initTAC('/tac', config, style);
    tac.init();
    return tac;
  } catch (error) {
    console.error('初始化 TAC 失败', error);
    throw error;
  }
}

/**
 * 清理验证码容器
 */
export function cleanupBehaviorCaptcha() {
  const captchaBox = document.getElementById('tac-captcha-box');
  if (captchaBox) {
    captchaBox.remove();
  }
}

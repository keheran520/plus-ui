/**
 * 行为验证码工具类
 * 基于Tianai-Captcha官方SDK封装
 */

declare global {
  interface Window {
    initTAC: (baseUrl: string, config: TACConfig, style?: TACStyle) => Promise<TACInstance>;
  }
}

/**
 * TAC配置接口
 */
export interface TACConfig {
  /** 生成验证码接口 */
  requestCaptchaDataUrl: string;
  /** 验证接口 */
  validCaptchaUrl: string;
  /** 验证码绑定的div块 */
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
 * TAC样式配置
 */
export interface TACStyle {
  /** Logo URL */
  logoUrl?: string | null;
  /** 按钮样式URL */
  btnUrl?: string;
  /** 背景样式URL */
  bgUrl?: string;
  /** 滑动边框颜色 */
  moveTrackMaskBgColor?: string;
  /** 滑动边框边框颜色 */
  moveTrackMaskBorderColor?: string;
}

/**
 * TAC实例接口
 */
export interface TACInstance {
  /** 初始化并显示验证码 */
  init: () => void;
  /** 重新加载验证码 */
  reloadCaptcha: () => void;
  /** 销毁验证码窗口 */
  destroyWindow: () => void;
}

/**
 * 加载TAC SDK脚本
 */
function loadTACScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查是否已加载
    if (window.initTAC) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '/load.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('加载TAC初始化脚本失败'));
    document.head.appendChild(script);
  });
}

/**
 * 显示行为验证码
 * @param options 配置选项
 * @returns Promise<TACInstance>
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
    // 加载TAC SDK
    await loadTACScript();

    // 创建验证码容器
    let captchaBox = document.getElementById('tac-captcha-box');
    if (!captchaBox) {
      captchaBox = document.createElement('div');
      captchaBox.id = 'tac-captcha-box';
      document.body.appendChild(captchaBox);
    }
    
    // 设置父容器的遮罩样式
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

    // TAC配置
    const config: TACConfig = {
      // 生成接口（需要加上代理前缀）
      requestCaptchaDataUrl: '/dev-api/captcha/gen',
      // 验证接口（需要加上代理前缀）
      validCaptchaUrl: '/dev-api/captcha/check',
      // 验证码绑定的div块
      bindEl: '#tac-captcha-box',
      // 验证成功回调
      validSuccess: (res, c, tac) => {
        console.log('验证成功，后端返回的数据为', res);
        console.log('验证成功，c 参数为', c);
        // 销毁验证码服务
        tac.destroyWindow();
        // 清理验证码容器
        cleanupBehaviorCaptcha();
        // 调用成功回调，传递验证码ID
        // 从后端返回的 data 中获取验证码ID（后端已修改为返回ID）
        const captchaId = res?.data || c?.id || c?.currentCaptchaData?.id || '';
        console.log('获取到的captchaId:', captchaId);
        
        if (!captchaId) {
          console.error('❌ 验证码ID为空！');
          console.error('res 对象:', res);
          console.error('c 对象:', c);
        }
        
        options.onSuccess(captchaId);
      },
      // 验证失败回调
      validFail: (res, c, tac) => {
        console.log('验证码验证失败', res);
        // 验证失败后重新拉取验证码
        tac.reloadCaptcha();
        options.onFail?.();
      },
      // 刷新按钮回调
      btnRefreshFun: (el, tac) => {
        console.log('刷新按钮触发');
        tac.reloadCaptcha();
      },
      // 关闭按钮回调
      btnCloseFun: (el, tac) => {
        console.log('关闭按钮触发');
        tac.destroyWindow();
        // 清理验证码容器
        cleanupBehaviorCaptcha();
        options.onClose?.();
      }
    };

    // 样式配置
    const style: TACStyle = {
      logoUrl: null // 去除logo
    };

    // 初始化TAC
    const tac = await window.initTAC('/tac', config, style);
    
    // 显示验证码
    tac.init();

    return tac;
  } catch (error) {
    console.error('初始化TAC失败', error);
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

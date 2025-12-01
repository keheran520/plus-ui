<template>
  <div class="login-container">
    <!-- 背景图案层 -->
    <div class="pattern-layer"></div>

    <!-- 光晕装饰层 -->
    <div class="glow-layer">
      <div class="glow glow-1"></div>
      <div class="glow glow-2"></div>
      <div class="glow glow-3"></div>
    </div>

    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="login-wrapper">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo">
            <div class="logo-icon">
              <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
            </div>
          </div>
          <h1 class="brand-title">{{ title }}</h1>
          <p class="brand-subtitle">现代化企业级管理系统</p>
          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-icon">✨</div>
              <div class="feature-text">简洁优雅</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🚀</div>
              <div class="feature-text">高效快速</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔒</div>
              <div class="feature-text">安全可靠</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="form-section">
        <div class="mobile-header">
          <h1 class="mobile-title">{{ title }}</h1>
        </div>
        <div class="form-card">
          <div class="form-header">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">请登录您的账户</p>
            <lang-select class="lang-selector" />
          </div>
          <!-- 登录方式切换 -->
          <el-segmented v-model="loginType" :options="loginTypeOptions" class="login-type-switch" />

          <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
            <el-form-item v-if="tenantEnabled" prop="tenantId">
              <el-select v-model="loginForm.tenantId" :placeholder="proxy.$t('login.selectPlaceholder')" filterable size="large">
                <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"></el-option>
                <template #prefix>
                  <svg-icon class="el-input__icon input-icon" icon-class="company" />
                </template>
              </el-select>
            </el-form-item>

            <!-- 密码登录表单 -->
            <template v-if="loginType === 'password'">
              <el-form-item prop="username">
                <el-input v-model="loginForm.username" :placeholder="proxy.$t('login.username')" auto-complete="off" size="large" type="text">
                  <template #prefix>
                    <svg-icon class="el-input__icon input-icon" icon-class="user" />
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  :placeholder="proxy.$t('login.password')"
                  auto-complete="off"
                  size="large"
                  type="password"
                  @keyup.enter="handleLogin"
                >
                  <template #prefix>
                    <svg-icon class="el-input__icon input-icon" icon-class="password" />
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item v-if="captchaEnabled" prop="code">
                <el-input
                  v-model="loginForm.code"
                  :placeholder="proxy.$t('login.code')"
                  auto-complete="off"
                  class="flex-1"
                  size="large"
                  @keyup.enter="handleLogin"
                >
                  <template #prefix>
                    <svg-icon class="el-input__icon input-icon" icon-class="validCode" />
                  </template>
                </el-input>
                <div class="captcha-image" @click="getCode">
                  <img :src="codeUrl" alt="验证码" />
                </div>
              </el-form-item>
            </template>

            <!-- 邮箱登录表单 -->
            <template v-if="loginType === 'email'">
              <el-form-item prop="email">
                <el-input v-model="loginForm.email" placeholder="请输入邮箱" prefix-icon="Message" size="large" />
              </el-form-item>
              <el-form-item prop="emailCode">
                <el-input
                  v-model="loginForm.emailCode"
                  class="flex-1"
                  placeholder="请输入邮箱验证码"
                  prefix-icon="Message"
                  size="large"
                  @keyup.enter="handleLogin"
                />
                <el-button :disabled="emailCountdown > 0" :loading="sendEmailCodeLoading" class="code-btn" size="large" @click="sendEmailCode">
                  {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
                </el-button>
              </el-form-item>
            </template>

            <!-- 号码登录表单 -->
            <template v-if="loginType === 'phoneverify'">
              <el-form-item prop="phonenumber">
                <el-input v-model="loginForm.phonenumber" maxlength="11" placeholder="请输入手机号" prefix-icon="Iphone" size="large" />
              </el-form-item>
              <el-form-item prop="verifyCode">
                <el-input
                  v-model="loginForm.verifyCode"
                  class="flex-1"
                  placeholder="请输入验证码"
                  prefix-icon="ChatDotSquare"
                  size="large"
                  @keyup.enter="handleLogin"
                />
                <el-button :disabled="phoneCountdown > 0" :loading="sendPhoneCodeLoading" class="code-btn" size="large" @click="sendPhoneCode">
                  {{ phoneCountdown > 0 ? `${phoneCountdown}s` : '获取验证码' }}
                </el-button>
              </el-form-item>
            </template>

            <div class="form-options">
              <el-checkbox v-model="loginForm.rememberMe">{{ proxy.$t('login.rememberPassword') }}</el-checkbox>
            </div>

            <el-button :loading="loading" class="login-btn" size="large" type="primary" @click.prevent="handleLogin">
              <span v-if="!loading">{{ proxy.$t('login.login') }}</span>
              <span v-else>{{ proxy.$t('login.logging') }}</span>
            </el-button>
            <div v-if="register" class="register-link">
              还没有账户？
              <router-link :to="'/register'" class="link-text">立即注册</router-link>
            </div>
            <div class="social-login">
              <div class="divider">
                <span>或使用第三方登录</span>
              </div>
              <div class="social-buttons">
                <el-button :title="proxy.$t('login.social.wechat')" circle class="social-btn" @click="doSocialLogin('wechat')">
                  <svg-icon icon-class="wechat" />
                </el-button>
                <el-button :title="proxy.$t('login.social.github')" circle class="social-btn" @click="doSocialLogin('github')">
                  <svg-icon icon-class="github" />
                </el-button>
                <el-button :title="proxy.$t('login.social.gitee')" circle class="social-btn" @click="doSocialLogin('gitee')">
                  <svg-icon icon-class="gitee" />
                </el-button>
              </div>
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <!-- 底部 -->
    <div class="login-footer">
      <div v-if="websiteConfig.copyright" class="footer-content">
        <p>{{ websiteConfig.copyright }}</p>
        <p v-if="websiteConfig.icp">{{ websiteConfig.icp }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getCaptchaConfig, getCodeImg, getRegisterConfig, getTenantList, sendEmailVerifyCode, sendPhoneVerifyCode } from '@/api/login';
import { authBinding } from '@/api/system/social/auth';
import { useUserStore } from '@/store/modules/user';
import { useWebsiteStore } from '@/store/modules/website';
import { LoginData, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import { HttpStatus } from '@/enums/RespEnum';
import { useI18n } from 'vue-i18n';
import { showBehaviorCaptcha } from '@/utils/behaviorCaptcha';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const userStore = useUserStore();
const websiteStore = useWebsiteStore();
const router = useRouter();
const { t } = useI18n();

const sendEmailCodeLoading = ref(false);

// 获取网站配置
const websiteConfig = computed(() => websiteStore.config);
const title = computed(() => websiteStore.config.name || import.meta.env.VITE_APP_TITLE);

const loginForm = ref<LoginData>({
  tenantId: '000000',
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  code: '',
  uuid: '',
  email: '',
  emailCode: '',
  phonenumber: '',
  verifyCode: '',
  businessType: 'login'
} as LoginData);

const loginRules: ElFormRules = {
  tenantId: [{ required: true, trigger: 'blur', message: t('login.rule.tenantId.required') }],
  username: [{ required: true, trigger: 'blur', message: t('login.rule.username.required') }],
  password: [{ required: true, trigger: 'blur', message: t('login.rule.password.required') }],
  code: [{ required: true, trigger: 'change', message: t('login.rule.code.required') }],
  email: [
    { required: true, trigger: 'blur', message: '请输入邮箱地址' },
    { type: 'email', trigger: 'blur', message: '请输入正确的邮箱地址' }
  ],
  emailCode: [{ required: true, trigger: 'blur', message: '请输入邮箱验证码' }],
  phonenumber: [
    { required: true, trigger: 'blur', message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, trigger: 'blur', message: '请输入正确的手机号' }
  ],
  verifyCode: [{ required: true, trigger: 'blur', message: '请输入验证码' }]
};

const codeUrl = ref('');
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 租户开关
const tenantEnabled = ref(true);

// 注册开关
const register = ref(true);
const redirect = ref('/');
const loginRef = ref<ElFormInstance>();
// 租户列表
const tenantList = ref<TenantVO[]>([]);

// 登录方式
const loginType = ref<'password' | 'email' | 'phoneverify'>('password');
const loginTypeOptions = [
  { label: '密码登录', value: 'password' },
  { label: '邮箱登录', value: 'email' },
  { label: '号码登录', value: 'phoneverify' }
];

// 邮箱验证码倒计时
const emailCountdown = ref(0);
let emailCountdownTimer: NodeJS.Timeout | null = null;

// 号码验证码倒计时
const phoneCountdown = ref(0);
let phoneCountdownTimer: NodeJS.Timeout | null = null;
const sendPhoneCodeLoading = ref(false);

watch(
  () => router.currentRoute.value,
  (newRoute: any) => {
    redirect.value = newRoute.query && newRoute.query.redirect && decodeURIComponent(newRoute.query.redirect);
  },
  { immediate: true }
);

const handleLogin = () => {
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true;
      // 设置授权类型
      if (loginType.value === 'password') {
        loginForm.value.grantType = 'password';
      } else if (loginType.value === 'email') {
        loginForm.value.grantType = 'email';
      } else if (loginType.value === 'phoneverify') {
        loginForm.value.grantType = 'phoneverify';
      }

      // 勾选了需要记住密码设置在 localStorage 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        localStorage.setItem('tenantId', String(loginForm.value.tenantId));
        localStorage.setItem('username', String(loginForm.value.username));
        localStorage.setItem('password', String(loginForm.value.password));
        localStorage.setItem('rememberMe', String(loginForm.value.rememberMe));
      } else {
        // 否则移除
        localStorage.removeItem('tenantId');
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }
      // 调用action的登录方法
      const [err] = await to(userStore.login(loginForm.value));
      if (!err) {
        const redirectUrl = redirect.value || '/index';
        await router.push(redirectUrl);
        loading.value = false;
      } else {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value && loginType.value === 'password') {
          await getCode();
        }
      }
    } else {
      console.log('error submit!', fields);
    }
  });
};

/**
 * 获取验证码配置
 */
const getCaptchaConfigInfo = async (tenantId?: string) => {
  try {
    const res = await getCaptchaConfig(tenantId || loginForm.value.tenantId);
    if (res.code === 200 && res.data) {
      captchaEnabled.value = res.data.captchaEnabled === undefined ? true : res.data.captchaEnabled;
    }
  } catch (error) {
    console.error('获取验证码配置失败:', error);
    captchaEnabled.value = true; // 默认开启
  }
};

/**
 * 获取验证码
 */
const getCode = async () => {
  if (captchaEnabled.value) {
    const res = await getCodeImg(loginForm.value.tenantId);
    const { data } = res;
    // Kaptcha 生成的是 PNG 格式，且后端已经包含了 data:image/png;base64, 前缀
    codeUrl.value = data.img;
    loginForm.value.uuid = data.uuid;
  }
};

/**
 * 发送邮箱验证码（集成行为验证码）
 */
const sendEmailCode = async () => {
  // 先验证邮箱格式
  const emailField = loginRef.value?.fields.find((field: any) => field.prop === 'email');
  if (!emailField || !loginForm.value.email) {
    ElMessage.warning('请输入邮箱地址');
    return;
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(loginForm.value.email)) {
    ElMessage.warning('请输入正确的邮箱地址');
    return;
  }

  try {
    // 显示行为验证码
    await showBehaviorCaptcha({
      onSuccess: async (captchaId) => {
        console.log('行为验证码验证成功，captchaId:', captchaId);

        // 验证成功后发送邮箱验证码，传递captchaId
        sendEmailCodeLoading.value = true;
        try {
          const res = await sendEmailVerifyCode(loginForm.value.email, loginForm.value.tenantId, captchaId);
          if (res.code === HttpStatus.SUCCESS) {
            ElMessage.success('验证码已发送，请查收邮件');

            // 开始倒计时 60 秒
            emailCountdown.value = 60;
            emailCountdownTimer = setInterval(() => {
              emailCountdown.value--;
              if (emailCountdown.value <= 0) {
                if (emailCountdownTimer) {
                  clearInterval(emailCountdownTimer);
                  emailCountdownTimer = null;
                }
              }
            }, 1000);
          } else {
            ElMessage.error(res.msg || '发送验证码失败');
          }
        } finally {
          sendEmailCodeLoading.value = false;
        }
      },
      onFail: () => {
        ElMessage.error('行为验证失败，请重试');
      }
    });
  } catch (error: any) {
    console.error('行为验证码初始化失败:', error);
    ElMessage.error('验证码加载失败，请刷新页面重试');
  }
};

const getLoginData = () => {
  const tenantId = localStorage.getItem('tenantId');
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  const rememberMe = localStorage.getItem('rememberMe');
  loginForm.value = {
    tenantId: tenantId === null ? String(loginForm.value.tenantId) : tenantId,
    username: username === null ? String(loginForm.value.username) : username,
    password: password === null ? String(loginForm.value.password) : String(password),
    rememberMe: rememberMe === null ? false : Boolean(rememberMe)
  } as LoginData;
};

/**
 * 获取租户列表
 */
const initTenantList = async () => {
  const { data } = await getTenantList(false);
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      loginForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
};

/**
 * 第三方登录
 * @param type
 */
const doSocialLogin = (type: string) => {
  authBinding(type, loginForm.value.tenantId).then((res: any) => {
    if (res.code === HttpStatus.SUCCESS) {
      // 获取授权地址跳转
      window.location.href = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

/**
 * 加载租户相关配置
 */
const loadTenantConfig = async (tenantId?: string) => {
  const tid = tenantId || loginForm.value.tenantId;
  // 并行加载所有配置
  await Promise.all([websiteStore.fetchWebsiteConfig(tid), getCaptchaConfigInfo(tid), getRegisterConfigInfo(tid)]);
  // 如果需要验证码，重新获取
  if (captchaEnabled.value) {
    getCode();
  }
};

// 监听租户ID变化，重新加载配置
watch(
  () => loginForm.value.tenantId,
  async (newTenantId) => {
    if (newTenantId) {
      await loadTenantConfig(newTenantId);
    }
  }
);

onMounted(async () => {
  // 初始化租户列表和登录数据
  initTenantList();
  getLoginData();
  // 加载当前租户的配置
  await loadTenantConfig();
});

/**
 * 获取注册开关配置
 */
const getRegisterConfigInfo = async (tenantId?: string) => {
  try {
    const res = await getRegisterConfig(tenantId || loginForm.value.tenantId);
    if (res.code === 200 && res.data) {
      register.value = res.data.registerEnabled === undefined ? false : res.data.registerEnabled;
    }
  } catch (error) {
    console.error('获取注册开关配置失败:', error);
    register.value = false; // 默认关闭
  }
};

/**
 * 发送号码验证码（集成行为验证码）
 */
const sendPhoneCode = async () => {
  // 先验证手机号格式
  if (!loginForm.value.phonenumber) {
    ElMessage.warning('请输入手机号');
    return;
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(loginForm.value.phonenumber)) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }

  try {
    // 显示行为验证码
    await showBehaviorCaptcha({
      onSuccess: async (captchaId) => {
        console.log('行为验证码验证成功，captchaId:', captchaId);

        // 验证成功后发送号码验证码，传递captchaId
        sendPhoneCodeLoading.value = true;
        try {
          const res = await sendPhoneVerifyCode(loginForm.value.phonenumber, 'login', loginForm.value.tenantId, captchaId);
          if (res.code === HttpStatus.SUCCESS && res.data?.success) {
            ElMessage.success('验证码已发送，请注意查收短信');

            // 开始倒计时 60 秒
            phoneCountdown.value = 60;
            phoneCountdownTimer = setInterval(() => {
              phoneCountdown.value--;
              if (phoneCountdown.value <= 0) {
                if (phoneCountdownTimer) {
                  clearInterval(phoneCountdownTimer);
                  phoneCountdownTimer = null;
                }
              }
            }, 1000);
          } else {
            ElMessage.error(res.data?.message || res.msg || '发送验证码失败');
          }
        } catch (error: any) {
          ElMessage.error(error.message || '发送验证码失败');
        } finally {
          sendPhoneCodeLoading.value = false;
        }
      },
      onFail: () => {
        ElMessage.error('行为验证失败，请重试');
      }
    });
  } catch (error: any) {
    console.error('行为验证码初始化失败:', error);
    ElMessage.error('验证码加载失败，请刷新页面重试');
  }
};

onBeforeUnmount(() => {
  // 清理倒计时
  if (emailCountdownTimer) {
    clearInterval(emailCountdownTimer);
    emailCountdownTimer = null;
  }
  if (phoneCountdownTimer) {
    clearInterval(phoneCountdownTimer);
    phoneCountdownTimer = null;
  }
});
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
}

.pattern-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  opacity: 0.4;
  background-image:
    repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255, 255, 255, 0.02) 40px, rgba(255, 255, 255, 0.02) 80px),
    repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255, 255, 255, 0.02) 40px, rgba(255, 255, 255, 0.02) 80px),
    radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(99, 102, 241, 0.08) 0%, transparent 50%);
}

.glow-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;

  .glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.5;

    &.glow-1 {
      width: 700px;
      height: 700px;
      top: -250px;
      left: -150px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
    }

    &.glow-2 {
      width: 600px;
      height: 600px;
      bottom: -200px;
      right: -100px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
    }

    &.glow-3 {
      width: 500px;
      height: 500px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, transparent 70%);
    }
  }
}

.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 20s infinite ease-in-out;

    &.circle-1 {
      width: 300px;
      height: 300px;
      top: -100px;
      left: -100px;
      animation-delay: 0s;
    }

    &.circle-2 {
      width: 200px;
      height: 200px;
      bottom: -50px;
      right: 10%;
      animation-delay: 5s;
    }

    &.circle-3 {
      width: 150px;
      height: 150px;
      top: 50%;
      right: -50px;
      animation-delay: 10s;
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.login-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
  gap: 60px;
  z-index: 10;
}

.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: white;

  .brand-content {
    max-width: 500px;
    animation: fadeInLeft 0.8s ease-out;
  }

  .brand-logo {
    margin-bottom: 30px;

    .logo-icon {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

      svg {
        width: 40px;
        height: 40px;
        color: white;
      }
    }
  }

  .brand-title {
    font-size: 48px;
    font-weight: 700;
    margin: 0 0 16px 0;
    letter-spacing: -1px;
  }

  .brand-subtitle {
    font-size: 20px;
    opacity: 0.9;
    margin: 0 0 40px 0;
  }

  .brand-features {
    display: flex;
    gap: 30px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .feature-icon {
        font-size: 28px;
      }

      .feature-text {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}

.form-section {
  flex: 0 0 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mobile-header {
  display: none;
}

.form-card {
  width: 100%;
  background: white;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 40px 36px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  min-height: 700px;
}

.form-header {
  position: relative;
  margin-bottom: 28px;

  .form-title {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 6px 0;
  }

  .form-subtitle {
    font-size: 14px;
    color: #8c8c8c;
    margin: 0;
  }

  .lang-selector {
    position: absolute;
    top: 0;
    right: 0;

    :deep(.lang-select--style) {
      color: #666;
    }
  }
}

.login-type-switch {
  width: 100%;
  height: 44px;
  margin: 0 0 24px 0;

  :deep(.el-segmented__group) {
    width: 100%;

    .el-segmented__item {
      flex: 1;
      font-size: 14px;
    }
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 18px;
  }

  .captcha-image {
    margin-left: var(--spacing-xs);
    width: 110px;
    height: 40px;
    border-radius: var(--radius-md);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .code-btn {
    margin-left: var(--spacing-xs);
  }

  .form-options {
    margin: 4px 0 20px 0;
  }

  .login-btn {
    width: 100%;
    height: 44px;
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 20px;
  }

  .register-link {
    font-size: 13px;
    color: #666;

    .link-text {
      color: var(--primary-color);
    }
  }

  .social-login {
    margin-top: 24px;

    .divider {
      position: relative;
      text-align: center;
      margin-bottom: 16px;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: #e8e8e8;
      }

      span {
        position: relative;
        display: inline-block;
        padding: 0 12px;
        background: white;
        color: #999;
        font-size: 13px;
        z-index: 1;
      }
    }

    .social-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;

      .social-btn {
        width: 40px;
        height: 40px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }
      }
    }
  }
}

.login-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  z-index: 10;

  .footer-content {
    p {
      margin: 4px 0;
      line-height: 1.6;
    }
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .login-wrapper {
    gap: 40px;
    padding: 30px;
  }

  .form-section {
    flex: 0 0 400px;
  }
}

@media (max-width: 1024px) {
  .brand-section {
    display: none;
  }

  .form-section {
    flex: 1;
    max-width: 440px;
  }

  .login-wrapper {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .login-container {
    background: white;
  }

  .bg-decoration {
    display: none;
  }

  .login-wrapper {
    padding: 0;
    align-items: flex-start;
  }

  .form-section {
    flex: 1;
    width: 100%;
  }

  .mobile-header {
    display: block;
    width: 100%;
    padding: 20px;
    background: white;
    border-bottom: 1px solid #f0f0f0;

    .mobile-title {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
      text-align: center;
    }
  }

  .form-card {
    padding: 24px 20px 80px 20px;
    border-radius: 0;
    box-shadow: none;
    min-height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .form-header {
    margin-bottom: 32px;

    .form-title {
      font-size: 26px;
    }

    .form-subtitle {
      font-size: 14px;
    }
  }

  .login-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    color: #999;
    background: white;
    padding: 16px 20px;
    font-size: 12px;
    border-top: 1px solid #f0f0f0;

    .footer-content {
      p {
        margin: 2px 0;
        line-height: 1.5;
      }
    }
  }
}
</style>

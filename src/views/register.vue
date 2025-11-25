<template>
  <div class="register-container">
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

    <div class="register-wrapper">
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
          <p class="brand-subtitle">开启您的数字化管理之旅</p>
          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-icon">🎯</div>
              <div class="feature-text">快速上手</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">💼</div>
              <div class="feature-text">企业级</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🛡️</div>
              <div class="feature-text">安全保障</div>
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
            <h2 class="form-title">创建新账户</h2>
            <p class="form-subtitle">填写信息完成注册</p>
            <lang-select class="lang-selector" />
          </div>

          <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
            <el-form-item v-if="tenantEnabled" prop="tenantId">
              <el-select v-model="registerForm.tenantId" :placeholder="proxy.$t('register.selectPlaceholder')" filterable size="large">
                <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"></el-option>
                <template #prefix>
                  <svg-icon class="el-input__icon input-icon" icon-class="company" />
                </template>
              </el-select>
            </el-form-item>

            <el-form-item prop="username">
              <el-input v-model="registerForm.username" :placeholder="proxy.$t('register.username')" auto-complete="off" size="large" type="text">
                <template #prefix>
                  <svg-icon class="el-input__icon input-icon" icon-class="user" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                :placeholder="proxy.$t('register.password')"
                auto-complete="off"
                size="large"
                type="password"
                @keyup.enter="handleRegister"
              >
                <template #prefix>
                  <svg-icon class="el-input__icon input-icon" icon-class="password" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                :placeholder="proxy.$t('register.confirmPassword')"
                auto-complete="off"
                size="large"
                type="password"
                @keyup.enter="handleRegister"
              >
                <template #prefix>
                  <svg-icon class="el-input__icon input-icon" icon-class="password" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item v-if="captchaEnabled" prop="code">
              <el-input
                v-model="registerForm.code"
                :placeholder="proxy.$t('register.code')"
                auto-complete="off"
                class="flex-1"
                size="large"
                @keyup.enter="handleRegister"
              >
                <template #prefix>
                  <svg-icon class="el-input__icon input-icon" icon-class="validCode" />
                </template>
              </el-input>
              <div class="captcha-image" @click="getCode">
                <img :src="codeUrl" alt="验证码" />
              </div>
            </el-form-item>

            <el-button :loading="loading" class="register-btn" size="large" type="primary" @click.prevent="handleRegister">
              <span v-if="!loading">{{ proxy.$t('register.register') }}</span>
              <span v-else>{{ proxy.$t('register.registering') }}</span>
            </el-button>

            <div class="login-link">
              已有账户？
              <router-link :to="'/login'" class="link-text">立即登录</router-link>
            </div>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div class="register-footer">
      <div v-if="websiteConfig.copyright" class="footer-content">
        <p>{{ websiteConfig.copyright }}</p>
        <p v-if="websiteConfig.icp">{{ websiteConfig.icp }}</p>
      </div>
      <div v-else class="footer-content">
        <span>Copyright © 2018-2025 疯狂的狮子Li All Rights Reserved.</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getCodeImg, getTenantList, register } from '@/api/login';
import { useWebsiteStore } from '@/store/modules/website';
import { RegisterForm, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import { useI18n } from 'vue-i18n';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const websiteStore = useWebsiteStore();
const router = useRouter();

const { t } = useI18n();

// 获取网站配置
const websiteConfig = computed(() => websiteStore.config);
const title = computed(() => websiteStore.config.name || import.meta.env.VITE_APP_TITLE);

const registerForm = ref<RegisterForm>({
  tenantId: '',
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
  uuid: '',
  userType: 'sys_user'
});

// 租户开关
const tenantEnabled = ref(true);

const equalToPassword = (rule: any, value: string, callback: any) => {
  if (registerForm.value.password !== value) {
    callback(new Error(t('register.rule.confirmPassword.equalToPassword')));
  } else {
    callback();
  }
};

const registerRules: ElFormRules = {
  tenantId: [{ required: true, trigger: 'blur', message: t('register.rule.tenantId.required') }],
  username: [
    { required: true, trigger: 'blur', message: t('register.rule.username.required') },
    { min: 2, max: 20, message: t('register.rule.username.length', { min: 2, max: 20 }), trigger: 'blur' }
  ],
  password: [
    { required: true, trigger: 'blur', message: t('register.rule.password.required') },
    { min: 5, max: 20, message: t('register.rule.password.length', { min: 5, max: 20 }), trigger: 'blur' },
    {
      pattern: /^[^<>"'|\\]+$/,
      message: t('register.rule.password.pattern', { strings: '< > " \' \\ |' }),
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, trigger: 'blur', message: t('register.rule.confirmPassword.required') },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ],
  code: [{ required: true, trigger: 'change', message: t('register.rule.code.required') }]
};
const codeUrl = ref('');
const loading = ref(false);
const captchaEnabled = ref(true);
const registerRef = ref<ElFormInstance>();
// 租户列表
const tenantList = ref<TenantVO[]>([]);

const handleRegister = () => {
  registerRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      const [err] = await to(register(registerForm.value));
      if (!err) {
        const username = registerForm.value.username;
        await ElMessageBox.alert('<span style="color: red; ">' + t('register.registerSuccess', { username }) + '</font>', '系统提示', {
          app: undefined,
          dangerouslyUseHTMLString: true,
          type: 'success'
        });
        await router.push('/login');
      } else {
        loading.value = false;
        if (captchaEnabled.value) {
          getCode();
        }
      }
    }
  });
};

/**
 * 获取验证码
 */
const getCode = async () => {
  if (captchaEnabled.value) {
    const res = await getCodeImg();
    const { data } = res;
    // Kaptcha 生成的是 PNG 格式，且后端已经包含了 data:image/png;base64, 前缀
    codeUrl.value = data.img;
    registerForm.value.uuid = data.uuid;
  }
};

const initTenantList = async () => {
  const { data } = await getTenantList(false);
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      registerForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
};

onMounted(async () => {
  getCode();
  initTenantList();
  // 加载网站配置
  if (!websiteStore.config.name) {
    await websiteStore.fetchWebsiteConfig();
  }
});
</script>

<style lang="scss" scoped>
.register-container {
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

.register-wrapper {
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

.register-form {
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

  .register-btn {
    width: 100%;
    height: 44px;
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 20px;
  }

  .login-link {
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: #666;

    .link-text {
      color: var(--primary-color);
    }
  }
}

.register-footer {
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
  .register-wrapper {
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

  .register-wrapper {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .register-container {
    background: white;
  }

  .bg-decoration {
    display: none;
  }

  .register-wrapper {
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

  .register-footer {
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

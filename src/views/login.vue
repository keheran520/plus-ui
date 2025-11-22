<template>
  <div class="login">
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <div class="title-box">
        <h3 class="title">{{ title }}</h3>
        <lang-select />
      </div>
      <!-- 登录方式切换 -->
      <el-segmented v-model="loginType" :options="loginTypeOptions" class="login-type-switch mb-4" />

      <el-form-item v-if="tenantEnabled" prop="tenantId">
        <el-select v-model="loginForm.tenantId" :placeholder="proxy.$t('login.selectPlaceholder')" filterable style="width: 100%">
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
            size="large"
            style="width: 63%"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <svg-icon class="el-input__icon input-icon" icon-class="validCode" />
            </template>
          </el-input>
          <div class="login-code">
            <img :src="codeUrl" class="login-code-img" @click="getCode" />
          </div>
        </el-form-item>
      </template>

      <!-- 邮箱登录表单 -->
      <template v-if="loginType === 'email'">
        <el-form-item prop="email">
          <el-input v-model="loginForm.email" placeholder="请输入邮箱" prefix-icon="Message" size="large" />
        </el-form-item>
        <el-form-item prop="emailCode">
          <div class="verify-code-wrapper">
            <el-input v-model="loginForm.emailCode" placeholder="请输入邮箱验证码" prefix-icon="Message" size="large" @keyup.enter="handleLogin" />
            <el-button :disabled="emailCountdown > 0" :loading="sendEmailCodeLoading" class="code-btn" size="large" @click="sendEmailCode">
              {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </template>

      <!-- 号码登录表单 -->
      <template v-if="loginType === 'phoneverify'">
        <el-form-item prop="phonenumber">
          <el-input v-model="loginForm.phonenumber" maxlength="11" placeholder="请输入手机号" prefix-icon="Iphone" size="large" />
        </el-form-item>
        <el-form-item prop="verifyCode">
          <div class="verify-code-wrapper">
            <el-input v-model="loginForm.verifyCode" placeholder="请输入验证码" prefix-icon="ChatDotSquare" size="large" @keyup.enter="handleLogin" />
            <el-button :disabled="phoneCountdown > 0" :loading="sendPhoneCodeLoading" class="code-btn" size="large" @click="sendPhoneCode">
              {{ phoneCountdown > 0 ? `${phoneCountdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </template>

      <el-checkbox v-model="loginForm.rememberMe" style="margin: 0 0 25px 0">{{ proxy.$t('login.rememberPassword') }} </el-checkbox>
      <el-form-item style="float: right">
        <el-button :title="proxy.$t('login.social.wechat')" circle @click="doSocialLogin('wechat')">
          <svg-icon icon-class="wechat" />
        </el-button>
        <el-button :title="proxy.$t('login.social.maxkey')" circle @click="doSocialLogin('maxkey')">
          <svg-icon icon-class="maxkey" />
        </el-button>
        <el-button :title="proxy.$t('login.social.topiam')" circle @click="doSocialLogin('topiam')">
          <svg-icon icon-class="topiam" />
        </el-button>
        <el-button :title="proxy.$t('login.social.gitee')" circle @click="doSocialLogin('gitee')">
          <svg-icon icon-class="gitee" />
        </el-button>
        <el-button :title="proxy.$t('login.social.github')" circle @click="doSocialLogin('github')">
          <svg-icon icon-class="github" />
        </el-button>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button :loading="loading" size="large" style="width: 100%" type="primary" @click.prevent="handleLogin">
          <span v-if="!loading">{{ proxy.$t('login.login') }}</span>
          <span v-else>{{ proxy.$t('login.logging') }}</span>
        </el-button>
        <div v-if="register" style="float: right">
          <router-link :to="'/register'" class="link-type">{{ proxy.$t('login.switchRegisterPage') }}</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <div v-if="websiteConfig.copyright" class="footer-content">
        <p>{{ websiteConfig.copyright }}</p>
        <p v-if="websiteConfig.icp">{{ websiteConfig.icp }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getCaptchaConfig, getCodeImg, getTenantList, sendEmailVerifyCode, sendPhoneVerifyCode } from '@/api/login';
import { authBinding } from '@/api/system/social/auth';
import { useUserStore } from '@/store/modules/user';
import { useWebsiteStore } from '@/store/modules/website';
import { LoginData, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import { HttpStatus } from '@/enums/RespEnum';
import { useI18n } from 'vue-i18n';

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
const register = ref(false);
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
        const redirectUrl = redirect.value || '/';
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
const getCaptchaConfigInfo = async () => {
  try {
    const res = await getCaptchaConfig();
    if (res.code === 200 && res.data) {
      captchaEnabled.value = res.data.captchaEnabled === undefined ? true : res.data.captchaEnabled;
    }
  } catch (error) {
    console.error('获取验证码配置失败:', error);
    // 失败时默认开启验证码
    captchaEnabled.value = true;
  }
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
    loginForm.value.uuid = data.uuid;
  }
};

/**
 * 发送邮箱验证码
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

  sendEmailCodeLoading.value = true;
  try {
    // 调用发送邮箱验证码的接口
    const res = await sendEmailVerifyCode(loginForm.value.email);
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

onMounted(async () => {
  // 先获取验证码配置
  await getCaptchaConfigInfo();
  getCode();
  initTenantList();
  getLoginData();
  // 加载网站配置
  if (!websiteStore.config.name) {
    await websiteStore.fetchWebsiteConfig();
  }
});

/**
 * 发送号码验证码
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

  sendPhoneCodeLoading.value = true;
  try {
    // 调用发送号码验证码的接口
    const res = await sendPhoneVerifyCode(loginForm.value.phonenumber, 'login');
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
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url('../assets/images/login-background.jpg');
  background-size: cover;
}

.title-box {
  display: flex;

  .title {
    margin: 0px auto 30px auto;
    text-align: center;
    color: #707070;
  }

  :deep(.lang-select--style) {
    line-height: 0;
    color: #7483a3;
  }
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  z-index: 1;

  .el-input {
    height: 40px;

    input {
      height: 40px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-login-footer {
  height: auto;
  min-height: 40px;
  padding: 10px 0;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial, serif;
  font-size: 12px;
  letter-spacing: 1px;

  .footer-content {
    margin: 0;
    padding: 0;

    p {
      margin: 5px 0;
      line-height: 1.5;
    }
  }
}

.login-code-img {
  height: 40px;
  padding-left: 12px;
}

.login-type-switch {
  width: 100%;
  margin-bottom: 20px;

  :deep(.el-segmented__group) {
    width: 100%;

    .el-segmented__item {
      flex: 1;
    }
  }
}

.verify-code-wrapper {
  display: flex;
  gap: 10px;

  .el-input {
    flex: 1;
  }

  .code-btn {
    width: 120px;
    white-space: nowrap;
  }
}

.mb-4 {
  margin-bottom: 16px;
}
</style>

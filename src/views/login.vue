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
        <el-select v-model="loginForm.tenantId" filterable :placeholder="proxy.$t('login.selectPlaceholder')" style="width: 100%">
          <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"></el-option>
          <template #prefix>
            <svg-icon icon-class="company" class="el-input__icon input-icon" />
          </template>
        </el-select>
      </el-form-item>

      <!-- 密码登录表单 -->
      <template v-if="loginType === 'password'">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" :placeholder="proxy.$t('login.username')">
            <template #prefix>
              <svg-icon icon-class="user" class="el-input__icon input-icon" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            size="large"
            auto-complete="off"
            :placeholder="proxy.$t('login.password')"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <svg-icon icon-class="password" class="el-input__icon input-icon" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="captchaEnabled" prop="code">
          <el-input
            v-model="loginForm.code"
            size="large"
            auto-complete="off"
            :placeholder="proxy.$t('login.code')"
            style="width: 63%"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <svg-icon icon-class="validCode" class="el-input__icon input-icon" />
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
            <el-button :disabled="emailCountdown > 0" class="code-btn" size="large" @click="sendEmailCode" :loading="sendEmailCodeLoading">
              {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </template>

      <el-checkbox v-model="loginForm.rememberMe" style="margin: 0 0 25px 0">{{ proxy.$t('login.rememberPassword') }} </el-checkbox>
      <el-form-item style="float: right">
        <el-button circle :title="proxy.$t('login.social.wechat')" @click="doSocialLogin('wechat')">
          <svg-icon icon-class="wechat" />
        </el-button>
        <el-button circle :title="proxy.$t('login.social.maxkey')" @click="doSocialLogin('maxkey')">
          <svg-icon icon-class="maxkey" />
        </el-button>
        <el-button circle :title="proxy.$t('login.social.topiam')" @click="doSocialLogin('topiam')">
          <svg-icon icon-class="topiam" />
        </el-button>
        <el-button circle :title="proxy.$t('login.social.gitee')" @click="doSocialLogin('gitee')">
          <svg-icon icon-class="gitee" />
        </el-button>
        <el-button circle :title="proxy.$t('login.social.github')" @click="doSocialLogin('github')">
          <svg-icon icon-class="github" />
        </el-button>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button :loading="loading" size="large" type="primary" style="width: 100%" @click.prevent="handleLogin">
          <span v-if="!loading">{{ proxy.$t('login.login') }}</span>
          <span v-else>{{ proxy.$t('login.logging') }}</span>
        </el-button>
        <div v-if="register" style="float: right">
          <router-link class="link-type" :to="'/register'">{{ proxy.$t('login.switchRegisterPage') }}</router-link>
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

<script setup lang="ts">
import { getCodeImg, getTenantList, sendEmailVerifyCode } from '@/api/login';
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
  emailCode: ''
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
  emailCode: [{ required: true, trigger: 'blur', message: '请输入邮箱验证码' }]
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
const loginType = ref<'password' | 'email'>('password');
const loginTypeOptions = [
  { label: '密码登录', value: 'password' },
  { label: '邮箱登录', value: 'email' }
];

// 邮箱验证码倒计时
const emailCountdown = ref(0);
let emailCountdownTimer: NodeJS.Timeout | null = null;

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
      loginForm.value.grantType = loginType.value === 'password' ? 'password' : 'email';

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
 * 获取验证码
 */
const getCode = async () => {
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + data.img;
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
  getCode();
  initTenantList();
  getLoginData();
  // 加载网站配置
  if (!websiteStore.config.name) {
    await websiteStore.fetchWebsiteConfig();
  }
});

onBeforeUnmount(() => {
  // 清理倒计时
  if (emailCountdownTimer) {
    clearInterval(emailCountdownTimer);
    emailCountdownTimer = null;
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

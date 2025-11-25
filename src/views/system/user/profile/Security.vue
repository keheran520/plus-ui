<template>
  <el-card class="security-card" shadow="never">
    <div class="card-header">
      <span class="card-title">安全设置</span>
    </div>

    <div class="security-list">
      <div v-for="item in securityItems" :key="item.type" class="security-item">
        <div class="item-icon">
          <svg-icon :icon-class="item.icon" :size="26" />
        </div>

        <div class="item-info">
          <div class="info-top">
            <span class="info-label">{{ item.title }}</span>
            <span class="info-status">
              <el-icon v-if="item.status" class="status-icon success"><CircleCheck /></el-icon>
              <el-icon v-else class="status-icon warning"><WarningFilled /></el-icon>
              <span :class="item.status ? 'success' : 'warning'" class="status-text">
                {{ item.statusText }}
              </span>
            </span>
          </div>

          <div class="info-desc">
            <span v-if="item.value && item.value !== '-1'" class="desc-value">{{ item.value }}</span>
            {{ item.subtitle }}
          </div>
        </div>

        <div class="item-action">
          <el-button :type="item.status ? 'default' : 'primary'" @click="handleAction(item.type)">
            {{ item.buttonText }}
          </el-button>
        </div>
      </div>
    </div>
  </el-card>

  <!-- 修改密码对话框 -->
  <ResetPwd ref="resetPwdRef" @success="handleSuccess" />

  <!-- 绑定手机号对话框 -->
  <el-dialog v-model="phoneDialogVisible" title="绑定手机号" width="450px" @close="resetPhoneForm">
    <el-form ref="phoneFormRef" :model="phoneForm" :rules="phoneRules" label-width="80px">
      <el-form-item label="手机号" prop="phonenumber">
        <el-input v-model="phoneForm.phonenumber" maxlength="11" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <el-input v-model="phoneForm.code" class="flex-1" maxlength="6" placeholder="请输入验证码" />
        <el-button :disabled="phoneCooldown > 0" :loading="phoneCodeLoading" class="ml-3" @click="sendBindPhoneCode">
          {{ phoneCooldown > 0 ? `${phoneCooldown}秒后重试` : '获取验证码' }}
        </el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="phoneDialogVisible = false">取消</el-button>
      <el-button :loading="phoneLoading" type="primary" @click="submitBindPhone">确定</el-button>
    </template>
  </el-dialog>

  <!-- 解绑手机号对话框 -->
  <el-dialog v-model="unbindPhoneDialogVisible" title="解绑手机号" width="450px" @close="resetUnbindPhoneForm">
    <el-alert :closable="false" style="margin-bottom: 20px" title="解绑后将无法使用手机号登录" type="warning" />
    <el-form ref="unbindPhoneFormRef" :model="unbindPhoneForm" :rules="unbindPhoneRules" label-width="80px">
      <el-form-item label="手机号">
        <el-input :value="user.phonenumber" disabled />
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <el-input v-model="unbindPhoneForm.code" class="flex-1" maxlength="6" placeholder="请输入验证码" />
        <el-button :disabled="unbindPhoneCooldown > 0" :loading="unbindPhoneCodeLoading" class="ml-3" @click="sendUnbindPhoneVerifyCode">
          {{ unbindPhoneCooldown > 0 ? `${unbindPhoneCooldown}秒后重试` : '获取验证码' }}
        </el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="unbindPhoneDialogVisible = false">取消</el-button>
      <el-button :loading="unbindPhoneLoading" type="danger" @click="submitUnbindPhone">确定解绑</el-button>
    </template>
  </el-dialog>

  <!-- 绑定邮箱对话框 -->
  <el-dialog v-model="emailDialogVisible" title="绑定邮箱" width="450px" @close="resetEmailForm">
    <el-form ref="emailFormRef" :model="emailForm" :rules="emailRules" label-width="80px">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="emailForm.email" placeholder="请输入邮箱地址" />
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <el-input v-model="emailForm.code" class="flex-1" maxlength="6" placeholder="请输入验证码" />
        <el-button :disabled="emailCooldown > 0" :loading="emailCodeLoading" class="ml-3" @click="sendEmailVerifyCode">
          {{ emailCooldown > 0 ? `${emailCooldown}秒后重试` : '发送验证码' }}
        </el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emailDialogVisible = false">取消</el-button>
      <el-button :loading="emailLoading" type="primary" @click="submitBindEmail">确定</el-button>
    </template>
  </el-dialog>

  <!-- 解绑邮箱对话框 -->
  <el-dialog v-model="unbindEmailDialogVisible" title="解绑邮箱" width="450px" @close="resetUnbindEmailForm">
    <el-alert :closable="false" style="margin-bottom: 20px" title="解绑后将无法接收重要通知" type="warning" />
    <el-form ref="unbindEmailFormRef" :model="unbindEmailForm" :rules="unbindEmailRules" label-width="80px">
      <el-form-item label="邮箱">
        <el-input :value="user.email" disabled />
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <div class="code-input-wrapper">
          <el-input v-model="unbindEmailForm.code" maxlength="6" placeholder="请输入验证码" />
          <el-button :disabled="unbindEmailCooldown > 0" :loading="unbindEmailCodeLoading" @click="sendUnbindEmailCode">
            {{ unbindEmailCooldown > 0 ? `${unbindEmailCooldown}秒后重试` : '发送验证码' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="unbindEmailDialogVisible = false">取消</el-button>
      <el-button :loading="unbindEmailLoading" type="danger" @click="submitUnbindEmail">确定解绑</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { CircleCheck, WarningFilled } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import ResetPwd from './resetPwd.vue';
import { UserVO } from '@/api/system/user/types';
import { bindEmail, bindPhone, sendEmailCode, sendPhoneVerifyCode, unbindEmail, unbindPhone } from '@/api/system/user/security';

interface Props {
  user: Partial<UserVO>;
}

const props = defineProps<Props>();
const emit = defineEmits(['refresh']);

interface SecurityItem {
  type: string;
  title: string;
  icon: string;
  value?: string;
  subtitle: string;
  status: boolean;
  statusText: string;
  buttonText: string;
}

const resetPwdRef = ref();
const phoneFormRef = ref<FormInstance>();
const unbindPhoneFormRef = ref<FormInstance>();
const emailFormRef = ref<FormInstance>();
const unbindEmailFormRef = ref<FormInstance>();

// 手机号相关
const phoneDialogVisible = ref(false);
const unbindPhoneDialogVisible = ref(false);
const phoneLoading = ref(false);
const unbindPhoneLoading = ref(false);
const phoneCooldown = ref(0);
const unbindPhoneCooldown = ref(0);
const phoneCodeLoading = ref(false); // 发送验证码loading
const unbindPhoneCodeLoading = ref(false); // 解绑发送验证码loading
let phoneTimer: NodeJS.Timeout | null = null;
let unbindPhoneTimer: NodeJS.Timeout | null = null;

const phoneForm = reactive({
  phonenumber: '',
  code: '',
  verifyType: '' // 验证类型：phoneverify 或 sms
});

const unbindPhoneForm = reactive({
  code: '',
  verifyType: '' // 验证类型：phoneverify 或 sms
});

const phoneRules: FormRules = {
  phonenumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{4,6}$/, message: '请输入4-6位验证码', trigger: 'blur' }
  ]
};

const unbindPhoneRules: FormRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{4,6}$/, message: '请输入4-6位验证码', trigger: 'blur' }
  ]
};

// 邮箱相关
const emailDialogVisible = ref(false);
const unbindEmailDialogVisible = ref(false);
const emailLoading = ref(false);
const unbindEmailLoading = ref(false);
const emailCooldown = ref(0);
const unbindEmailCooldown = ref(0);
const emailCodeLoading = ref(false); // 发送验证码loading
const unbindEmailCodeLoading = ref(false); // 解绑发送验证码loading
let emailTimer: NodeJS.Timeout | null = null;
let unbindEmailTimer: NodeJS.Timeout | null = null;

const emailForm = reactive({
  email: '',
  code: ''
});

const unbindEmailForm = reactive({
  code: ''
});

const emailRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{4,6}$/, message: '请输入4-6位验证码', trigger: 'blur' }
  ]
};

const unbindEmailRules: FormRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{4,6}$/, message: '请输入4-6位验证码', trigger: 'blur' }
  ]
};

const securityItems = computed<SecurityItem[]>(() => [
  {
    type: 'phone',
    title: '安全手机',
    icon: 'phone',
    value: props.user.phonenumber,
    subtitle:
      props.user.phonenumber !== '-1' ? '手机号，可通过登录、身份验证、密码找回、通知接收' : '绑定后，可通过登录、身份验证、密码找回、通知接收',
    status: props.user.phonenumber !== '-1',
    statusText: props.user.phonenumber !== '-1' ? '已绑定' : '未绑定',
    buttonText: props.user.phonenumber !== '-1' ? '解绑' : '绑定'
  },
  {
    type: 'email',
    title: '安全邮箱',
    icon: 'email',
    value: props.user.email,
    subtitle: props.user.email !== '-1' ? '邮箱，可通过登录、身份验证、密码找回、通知接收' : '绑定后，可通过登录、身份验证、密码找回、通知接收',
    status: props.user.email !== '-1',
    statusText: props.user.email !== '-1' ? '已绑定' : '未绑定',
    buttonText: props.user.email !== '-1' ? '解绑' : '绑定'
  },
  {
    type: 'password',
    title: '登录密码',
    icon: 'password',
    subtitle: '为了您的账号安全，建议定期修改密码',
    status: true,
    statusText: '已设置',
    buttonText: '修改'
  }
]);

// 处理操作
const handleAction = (type: string) => {
  if (type === 'password') {
    resetPwdRef.value?.open();
  }
  // 手机号操作
  if (type === 'phone') {
    if (props.user.phonenumber && props.user.phonenumber !== '-1') {
      unbindPhoneDialogVisible.value = true;
    } else {
      phoneDialogVisible.value = true;
    }
  }
  // 邮箱操作
  if (type === 'email') {
    if (props.user.email && props.user.email !== '-1') {
      unbindEmailDialogVisible.value = true;
    } else {
      emailDialogVisible.value = true;
    }
  }
};

// 发送绑定手机号码认证验证码（默认）
const sendBindPhoneCode = async () => {
  if (!phoneForm.phonenumber) {
    ElMessage.warning('请先输入手机号');
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(phoneForm.phonenumber)) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }

  phoneCodeLoading.value = true;
  try {
    await sendPhoneVerifyCode(phoneForm.phonenumber, 'bind');
    phoneForm.verifyType = 'phoneverify'; // 设置验证类型
    ElMessage.success('验证码已发送，请完成号码认证');
    phoneCooldown.value = 60;
    phoneTimer = setInterval(() => {
      phoneCooldown.value--;
      if (phoneCooldown.value <= 0 && phoneTimer) {
        clearInterval(phoneTimer);
      }
    }, 1000);
  } catch (error) {
    console.error('发送验证码失败：', error);
  } finally {
    phoneCodeLoading.value = false;
  }
};

// 发送解绑手机号码认证验证码
const sendUnbindPhoneVerifyCode = async () => {
  if (!props.user.phonenumber) return;

  unbindPhoneCodeLoading.value = true;
  try {
    await sendPhoneVerifyCode(props.user.phonenumber, 'unbind');
    unbindPhoneForm.verifyType = 'phoneverify'; // 设置验证类型
    ElMessage.success('验证码已发送，请完成号码认证');
    unbindPhoneCooldown.value = 60;
    unbindPhoneTimer = setInterval(() => {
      unbindPhoneCooldown.value--;
      if (unbindPhoneCooldown.value <= 0 && unbindPhoneTimer) {
        clearInterval(unbindPhoneTimer);
      }
    }, 1000);
  } catch (error) {
    console.error('发送验证码失败：', error);
  } finally {
    unbindPhoneCodeLoading.value = false;
  }
};

// 提交绑定手机
const submitBindPhone = async () => {
  if (!phoneFormRef.value) return;

  await phoneFormRef.value.validate(async (valid) => {
    if (valid) {
      phoneLoading.value = true;
      try {
        await bindPhone(phoneForm);
        ElMessage.success('绑定成功');
        phoneDialogVisible.value = false;
        emit('refresh');
      } catch (error) {
        console.error('绑定失败：', error);
      } finally {
        phoneLoading.value = false;
      }
    }
  });
};

// 提交解绑手机
const submitUnbindPhone = async () => {
  if (!unbindPhoneFormRef.value) return;

  await unbindPhoneFormRef.value.validate(async (valid) => {
    if (valid) {
      unbindPhoneLoading.value = true;
      try {
        await unbindPhone(unbindPhoneForm);
        ElMessage.success('解绑成功');
        unbindPhoneDialogVisible.value = false;
        emit('refresh');
      } catch (error) {
        console.error('解绑失败：', error);
      } finally {
        unbindPhoneLoading.value = false;
      }
    }
  });
};

// 重置手机表单
const resetPhoneForm = () => {
  phoneForm.phonenumber = '';
  phoneForm.code = '';
  phoneForm.verifyType = '';
  phoneFormRef.value?.resetFields();
  if (phoneTimer) {
    clearInterval(phoneTimer);
    phoneCooldown.value = 0;
  }
};

const resetUnbindPhoneForm = () => {
  unbindPhoneForm.code = '';
  unbindPhoneForm.verifyType = '';
  unbindPhoneFormRef.value?.resetFields();
  if (unbindPhoneTimer) {
    clearInterval(unbindPhoneTimer);
    unbindPhoneCooldown.value = 0;
  }
};

// 发送邮箱验证码
const sendEmailVerifyCode = async () => {
  if (!emailForm.email) {
    ElMessage.warning('请先输入邮箱地址');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email)) {
    ElMessage.warning('请输入正确的邮箱地址');
    return;
  }

  emailCodeLoading.value = true;
  try {
    await sendEmailCode(emailForm.email, 'bind');
    ElMessage.success('验证码已发送至邮箱');
    emailCooldown.value = 60;
    emailTimer = setInterval(() => {
      emailCooldown.value--;
      if (emailCooldown.value <= 0 && emailTimer) {
        clearInterval(emailTimer);
      }
    }, 1000);
  } catch (error) {
    console.error('发送验证码失败：', error);
  } finally {
    emailCodeLoading.value = false;
  }
};

// 发送解绑邮箱验证码
const sendUnbindEmailCode = async () => {
  if (!props.user.email) return;

  unbindEmailCodeLoading.value = true;
  try {
    await sendEmailCode(props.user.email, 'unbind');
    ElMessage.success('验证码已发送至邮箱');
    unbindEmailCooldown.value = 60;
    unbindEmailTimer = setInterval(() => {
      unbindEmailCooldown.value--;
      if (unbindEmailCooldown.value <= 0 && unbindEmailTimer) {
        clearInterval(unbindEmailTimer);
      }
    }, 1000);
  } catch (error) {
    console.error('发送验证码失败：', error);
  } finally {
    unbindEmailCodeLoading.value = false;
  }
};

// 提交绑定邮箱
const submitBindEmail = async () => {
  if (!emailFormRef.value) return;

  await emailFormRef.value.validate(async (valid) => {
    if (valid) {
      emailLoading.value = true;
      try {
        await bindEmail(emailForm);
        ElMessage.success('绑定成功');
        emailDialogVisible.value = false;
        emit('refresh');
      } catch (error) {
        console.error('绑定失败：', error);
      } finally {
        emailLoading.value = false;
      }
    }
  });
};

// 提交解绑邮箱
const submitUnbindEmail = async () => {
  if (!unbindEmailFormRef.value) return;

  await unbindEmailFormRef.value.validate(async (valid) => {
    if (valid) {
      unbindEmailLoading.value = true;
      try {
        await unbindEmail(unbindEmailForm);
        ElMessage.success('解绑成功');
        unbindEmailDialogVisible.value = false;
        emit('refresh');
      } catch (error) {
        console.error('解绑失败：', error);
      } finally {
        unbindEmailLoading.value = false;
      }
    }
  });
};

// 重置邮箱表单
const resetEmailForm = () => {
  emailForm.email = '';
  emailForm.code = '';
  emailFormRef.value?.resetFields();
  if (emailTimer) {
    clearInterval(emailTimer);
    emailCooldown.value = 0;
  }
};

const resetUnbindEmailForm = () => {
  unbindEmailForm.code = '';
  unbindEmailFormRef.value?.resetFields();
  if (unbindEmailTimer) {
    clearInterval(unbindEmailTimer);
    unbindEmailCooldown.value = 0;
  }
};

// 操作成功
const handleSuccess = () => {
  emit('refresh');
};

// 组件卸载时清理定时器
onUnmounted(() => {
  if (phoneTimer) clearInterval(phoneTimer);
  if (unbindPhoneTimer) clearInterval(unbindPhoneTimer);
  if (emailTimer) clearInterval(emailTimer);
  if (unbindEmailTimer) clearInterval(unbindEmailTimer);
});
</script>

<style lang="scss" scoped>
.security-card {
  border: none;
  border-radius: var(--radius-lg);

  :deep(.el-card__body) {
    padding: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(180deg, var(--primary-light-9), #fff0);

  .card-title {
    font-size: 16px;
    color: #303133;
  }
}

.security-list {
  padding: 20px;

  .security-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:first-child {
      padding-top: 0;
    }

    .item-icon {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-lg);
      margin-right: 16px;
      flex-shrink: 0;
      background: var(--bg-hover);

      :deep(.svg-icon) {
        font-size: 20px;
        color: var(--primary-color);
      }
    }

    .item-info {
      flex: 1;

      .info-top {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        gap: var(--spacing-sm);

        .info-label {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
        }

        .info-status {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);

          .status-icon {
            font-size: 14px;

            &.success {
              color: var(--success-color);
            }

            &.warning {
              color: var(--warning-color);
            }
          }

          .status-text {
            font-size: 12px;

            &.success {
              color: var(--success-color);
            }

            &.warning {
              color: var(--warning-color);
            }
          }
        }
      }

      .info-desc {
        font-size: 13px;
        color: #909399;
        line-height: 1.6;

        .desc-value {
          color: #606266;
          font-weight: 500;
          margin-right: 4px;
        }
      }
    }

    .item-action {
      margin-left: 16px;
      flex-shrink: 0;
    }
  }
}

.code-input-wrapper {
  display: flex;
  gap: 8px;

  .el-input {
    flex: 1;
  }

  .el-button {
    flex-shrink: 0;
    min-width: 90px;
  }
}
</style>

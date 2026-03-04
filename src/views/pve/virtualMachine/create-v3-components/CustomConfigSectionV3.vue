<template>
  <div class="custom-config-section">
    <!-- 登录方式 -->
    <div class="form-section">
      <SectionTitle>登录方式</SectionTitle>

      <!-- 登录凭证 -->
      <el-form-item label="登录凭证" required>
        <el-radio-group v-model="loginCredential" class="credential-radio-group">
          <el-radio-button value="password">密码</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 登录名 -->
      <el-form-item label="登录名" style="padding-left: 13px">
        <span class="login-name-display">{{ displayLoginName }}</span>
      </el-form-item>

      <!-- 登录密码 -->
      <el-form-item label="登录密码" prop="loginPassword" required>
        <div class="password-input-wrapper">
          <el-popover v-model:visible="passwordFocused" :width="320" placement="right" trigger="focus">
            <template #reference>
              <el-input
                v-model="loginPassword"
                maxlength="30"
                placeholder="请输入登录密码"
                show-password
                size="large"
                style="width: 400px"
                type="password"
                @blur="handlePasswordBlur"
                @focus="passwordFocused = true"
              />
            </template>
            <div class="password-rules-content" @mousedown="isClickingPasswordPopover = true" @mouseup="isClickingPasswordPopover = false">
              <div :class="['password-rule-item', { valid: passwordRules.length }]">
                <el-icon><CircleCheck v-if="passwordRules.length" /><CircleClose v-else /></el-icon>
                <span>长度为 8 ~ 30 个字符</span>
              </div>
              <div :class="['password-rule-item', { valid: passwordRules.hasThreeTypes }]">
                <el-icon><CircleCheck v-if="passwordRules.hasThreeTypes" /><CircleClose v-else /></el-icon>
                <span>至少包含三项</span>
              </div>
              <div :class="['password-sub-rule', { valid: passwordRules.hasUpperCase }]">
                <el-icon><CircleCheck v-if="passwordRules.hasUpperCase" /><CircleClose v-else /></el-icon>
                <span>大写字母 A ~ Z</span>
              </div>
              <div :class="['password-sub-rule', { valid: passwordRules.hasLowerCase }]">
                <el-icon><CircleCheck v-if="passwordRules.hasLowerCase" /><CircleClose v-else /></el-icon>
                <span>小写字母 a ~ z</span>
              </div>
              <div :class="['password-sub-rule', { valid: passwordRules.hasNumber }]">
                <el-icon><CircleCheck v-if="passwordRules.hasNumber" /><CircleClose v-else /></el-icon>
                <span>数字 0 ~ 9</span>
              </div>
              <div :class="['password-sub-rule', { valid: passwordRules.hasSpecial }]">
                <el-icon><CircleCheck v-if="passwordRules.hasSpecial" /><CircleClose v-else /></el-icon>
                <span>特殊字符 ~!@#$%^&*()_+-={}[]\|:";'&lt;&gt;?,./</span>
              </div>
              <div :class="['password-rule-item', { valid: passwordRules.noInvalidChars }]">
                <el-icon><CircleCheck v-if="passwordRules.noInvalidChars" /><CircleClose v-else /></el-icon>
                <span>密码不能以"/"开头</span>
              </div>
            </div>
          </el-popover>
          <el-button size="large" @click="generatePassword">自动生成</el-button>
        </div>
      </el-form-item>

      <!-- 确认密码 -->
      <el-form-item label="确认密码" prop="confirmPassword" required>
        <el-popover v-model:visible="confirmPasswordFocused" :width="280" placement="right" trigger="focus">
          <template #reference>
            <el-input
              v-model="confirmPassword"
              maxlength="30"
              placeholder="请再次输入密码"
              show-password
              size="large"
              style="width: 400px"
              type="password"
              @blur="handleConfirmPasswordBlur"
              @focus="confirmPasswordFocused = true"
            />
          </template>
          <div
            class="password-rules-content"
            @mousedown="isClickingConfirmPasswordPopover = true"
            @mouseup="isClickingConfirmPasswordPopover = false"
          >
            <div :class="['password-rule-item', { valid: confirmPasswordRules.notEmpty }]">
              <el-icon><CircleCheck v-if="confirmPasswordRules.notEmpty" /><CircleClose v-else /></el-icon>
              <span>请输入确认密码</span>
            </div>
            <div :class="['password-rule-item', { valid: confirmPasswordRules.match }]">
              <el-icon><CircleCheck v-if="confirmPasswordRules.match" /><CircleClose v-else /></el-icon>
              <span>两次密码输入一致</span>
            </div>
          </div>
        </el-popover>
        <template #extra>
          <div class="form-item-tip">
            <el-icon color="#E6A23C"><WarningFilled /></el-icon>
            请牢记您所设置的密码，如忘记可在虚拟机管理页面重置密码。
          </div>
        </template>
      </el-form-item>
    </div>

    <!-- 实例配置 -->
    <div class="form-section">
      <SectionTitle>实例配置</SectionTitle>

      <!-- 实例名称 -->
      <el-form-item label="实例名称" prop="instanceName" required>
        <div class="password-input-wrapper">
          <el-popover v-model:visible="instanceNameFocused" :width="320" placement="right" trigger="focus">
            <template #reference>
              <el-input
                v-model="instanceName"
                maxlength="128"
                placeholder="ECS-tdbk"
                size="large"
                style="width: 400px"
                @blur="handleInstanceNameBlur"
                @focus="instanceNameFocused = true"
              />
            </template>
            <div class="password-rules-content" @mousedown="isClickingInstanceNamePopover = true" @mouseup="isClickingInstanceNamePopover = false">
              <div :class="['password-rule-item', { valid: instanceNameRules.startsWithValid }]">
                <el-icon><CircleCheck v-if="instanceNameRules.startsWithValid" /><CircleClose v-else /></el-icon>
                <span>以字母或中文开头</span>
              </div>
              <div :class="['password-rule-item', { valid: instanceNameRules.validChars }]">
                <el-icon><CircleCheck v-if="instanceNameRules.validChars" /><CircleClose v-else /></el-icon>
                <span>只能包含中文、字母、数字、下划线（_）、中划线（-）和点号（.）</span>
              </div>
              <div :class="['password-rule-item', { valid: instanceNameRules.length }]">
                <el-icon><CircleCheck v-if="instanceNameRules.length" /><CircleClose v-else /></el-icon>
                <span>长度为 1 ~ 128 个字符</span>
              </div>
            </div>
          </el-popover>
          <el-button size="large" @click="generateInstanceName">自动生成</el-button>
        </div>
        <template #extra>
          <div class="form-item-tip" style="color: #909399">购买多台，批量设置有序名称后缀起始值，可点击查看命名规则。</div>
        </template>
      </el-form-item>

      <!-- 开机自启 -->
      <el-form-item label="开机自启">
        <el-switch v-model="autoStart" active-text="启用" inactive-text="禁用" />
        <template #extra>
          <div class="form-item-tip" style="color: #909399">启用后虚拟机将在宿主机启动时自动启动</div>
        </template>
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注">
        <el-input v-model="remark" :rows="3" maxlength="200" placeholder="可选，添加备注信息" show-word-limit style="width: 600px" type="textarea" />
      </el-form-item>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { CircleCheck, CircleClose, WarningFilled } from '@element-plus/icons-vue';
import SectionTitle from '@/components/SectionTitle/index.vue';

interface Props {
  modelValue: any;
  osType: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

// 密码输入框聚焦状态
const passwordFocused = ref(false);
const confirmPasswordFocused = ref(false);
const instanceNameFocused = ref(false);

// 标记是否正在点击popover内容
const isClickingPasswordPopover = ref(false);
const isClickingConfirmPasswordPopover = ref(false);
const isClickingInstanceNamePopover = ref(false);

// 登录凭证（固定为密码）
const loginCredential = ref('password');

// 登录名（根据系统类型动态显示）
const displayLoginName = computed(() => {
  return props.osType === 'Windows' ? 'Administrator' : 'root';
});

// 密码校验规则
const passwordRules = computed(() => {
  const pwd = props.modelValue.loginPassword || '';

  return {
    // 长度检查
    length: pwd.length >= 8 && pwd.length <= 30,
    // 大写字母
    hasUpperCase: /[A-Z]/.test(pwd),
    // 小写字母
    hasLowerCase: /[a-z]/.test(pwd),
    // 数字
    hasNumber: /\d/.test(pwd),
    // 特殊字符
    hasSpecial: /[~!@#$%^&*()_+\-={}[\]\\|:";'<>?,./]/.test(pwd),
    // 至少包含三项
    hasThreeTypes:
      [/[A-Z]/.test(pwd), /[a-z]/.test(pwd), /\d/.test(pwd), /[~!@#$%^&*()_+\-={}[\]\\|:";'<>?,./]/.test(pwd)].filter(Boolean).length >= 3,
    // 不能以"/"开头
    noInvalidChars: pwd.length === 0 ? false : !pwd.startsWith('/')
  };
});

// 确认密码校验规则
const confirmPasswordRules = computed(() => {
  const pwd = props.modelValue.loginPassword || '';
  const confirmPwd = props.modelValue.confirmPassword || '';

  return {
    // 不为空
    notEmpty: confirmPwd.length > 0,
    // 与登录密码一致
    match: confirmPwd.length > 0 && confirmPwd === pwd
  };
});

// 实例名称校验规则
const instanceNameRules = computed(() => {
  const name = props.modelValue.instanceName || '';

  return {
    // 以字母或中文开头
    startsWithValid: name.length === 0 ? false : /^[a-z\u4E00-\u9FA5]/i.test(name),
    // 只能包含中文、字母、数字、下划线、中划线和点号
    validChars: name.length === 0 ? false : /^[\u4E00-\u9FA5\w.\-]+$/.test(name),
    // 长度为 1 ~ 128 个字符
    length: name.length >= 1 && name.length <= 128
  };
});

// 处理密码输入框失焦
const handlePasswordBlur = () => {
  setTimeout(() => {
    if (!isClickingPasswordPopover.value) {
      passwordFocused.value = false;
    }
  }, 200);
};

// 处理确认密码输入框失焦
const handleConfirmPasswordBlur = () => {
  setTimeout(() => {
    if (!isClickingConfirmPasswordPopover.value) {
      confirmPasswordFocused.value = false;
    }
  }, 200);
};

// 处理实例名称输入框失焦
const handleInstanceNameBlur = () => {
  setTimeout(() => {
    if (!isClickingInstanceNamePopover.value) {
      instanceNameFocused.value = false;
    }
  }, 200);
};

// 自动生成符合规则的密码
const generatePassword = () => {
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-={}[]|:;<>?,./';

  let password = '';

  // 确保至少包含三种类型
  const types = [upperCase, lowerCase, numbers, special];
  const selectedTypes = types.sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 2));

  // 从每种类型中至少选一个字符
  selectedTypes.forEach((type) => {
    password += type.charAt(Math.floor(Math.random() * type.length));
  });

  // 填充到16位
  const allChars = selectedTypes.join('');
  while (password.length < 16) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // 打乱顺序
  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  // 确保不以"/"开头
  if (password.startsWith('/')) {
    password = password.substring(1) + allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  loginPassword.value = password;
};

// 自动生成符合规则的实例名称
const generateInstanceName = () => {
  const prefixes = ['ECS'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  // 生成随机字符串（字母+数字）
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // 生成时间戳后4位
  const timestamp = Date.now().toString().slice(-4);

  // 组合：前缀-随机字符串-时间戳
  const name = `${prefix}-${randomStr}-${timestamp}`;

  instanceName.value = name;
};

// 双向绑定
const loginPassword = computed({
  get: () => props.modelValue.loginPassword,
  set: (val) => emit('update:modelValue', { ...props.modelValue, loginPassword: val })
});

const confirmPassword = computed({
  get: () => props.modelValue.confirmPassword,
  set: (val) => emit('update:modelValue', { ...props.modelValue, confirmPassword: val })
});

const instanceName = computed({
  get: () => props.modelValue.instanceName,
  set: (val) => emit('update:modelValue', { ...props.modelValue, instanceName: val })
});

const autoStart = computed({
  get: () => props.modelValue.autoStart,
  set: (val) => emit('update:modelValue', { ...props.modelValue, autoStart: val })
});

const remark = computed({
  get: () => props.modelValue.remark,
  set: (val) => emit('update:modelValue', { ...props.modelValue, remark: val })
});
</script>

<style lang="scss" scoped>
@import './common.scss';

.custom-config-section {
  .form-section {
    margin-bottom: 32px;
  }

  .credential-radio-group {
    margin-bottom: 0;
  }

  .login-name-display {
    font-size: 14px;
    color: #303133;
  }

  .password-input-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .form-item-tip {
    font-size: 12px;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

// 密码规则提示内容
.password-rules-content {
  min-width: 280px;

  .password-rule-item,
  .password-sub-rule {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;

    .el-icon {
      font-size: 16px;
      flex-shrink: 0;
      color: #c0c4cc;
    }

    &.valid {
      .el-icon {
        color: #67c23a;
      }
    }
  }

  .password-sub-rule {
    padding-left: 24px;
  }
}
</style>

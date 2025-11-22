# 号码认证组件

## 简介

提供短信验证码发送和输入的 Vue 3 组件，支持倒计时、自动校验等功能。

## 组件列表

### 1. VerifyCodeInput - 验证码输入组件

集成了输入框和发送按钮的完整验证码组件。

#### 基础用法

```vue
<template>
  <el-form :model="form">
    <el-form-item label="手机号">
      <el-input v-model="form.phoneNumber" />
    </el-form-item>

    <VerifyCodeInput
      v-model="form.code"
      :phone-number="form.phoneNumber"
      business-type="login"
    />
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VerifyCodeInput } from '@/components/PhoneVerify'

const form = ref({
  phoneNumber: '',
  code: ''
})
</script>
```

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 验证码值 (v-model) | string | - |
| phoneNumber | 手机号 | string | - |
| businessType | 业务类型 | string | - |
| label | 标签文本 | string | '验证码' |
| prop | 表单属性名 | string | 'code' |
| placeholder | 占位符 | string | '请输入验证码' |
| countdownSeconds | 倒计时秒数 | number | 60 |
| rules | 校验规则 | array | 默认规则 |

#### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 值变化时触发 | (value: string) |
| send-success | 发送成功时触发 | (response: any) |
| send-error | 发送失败时触发 | (error: any) |

#### 示例

```vue
<VerifyCodeInput
  v-model="form.code"
  :phone-number="form.phoneNumber"
  business-type="register"
  label="验证码"
  placeholder="请输入6位验证码"
  :countdown-seconds="120"
  @send-success="handleSuccess"
  @send-error="handleError"
/>
```

---

### 2. SendCodeButton - 发送验证码按钮

独立的验证码发送按钮组件，可灵活组合使用。

#### 基础用法

```vue
<template>
  <div style="display: flex; gap: 10px">
    <el-input v-model="code" placeholder="请输入验证码" />
    <SendCodeButton
      :phone-number="phoneNumber"
      business-type="login"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SendCodeButton } from '@/components/PhoneVerify'

const phoneNumber = ref('')
const code = ref('')
</script>
```

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| phoneNumber | 手机号 | string | - |
| businessType | 业务类型 | string | - |
| type | 按钮类型 | string | 'primary' |
| size | 按钮尺寸 | string | 'default' |
| countdownSeconds | 倒计时秒数 | number | 60 |
| disabled | 是否禁用 | boolean | false |
| beforeSend | 发送前的验证函数 | Function | - |

#### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| send-success | 发送成功时触发 | (response: any) |
| send-error | 发送失败时触发 | (error: any) |

#### Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| send | 手动触发发送 | - |
| reset | 重置倒计时 | - |

#### 示例

```vue
<template>
  <SendCodeButton
    ref="sendBtnRef"
    :phone-number="phoneNumber"
    business-type="reset-password"
    type="success"
    size="large"
    :countdown-seconds="120"
    :before-send="handleBeforeSend"
    @send-success="handleSuccess"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SendCodeButton } from '@/components/PhoneVerify'

const sendBtnRef = ref()
const phoneNumber = ref('')

// 发送前验证
const handleBeforeSend = async () => {
  // 自定义验证逻辑
  if (!phoneNumber.value) {
    return false
  }
  return true
}

// 手动触发发送
const manualSend = () => {
  sendBtnRef.value?.send()
}

// 重置倒计时
const resetCountdown = () => {
  sendBtnRef.value?.reset()
}
</script>
```

---

## API 接口

### sendVerifyCode

发送验证码（完整参数）

```typescript
import { sendVerifyCode } from '@/api/phone-verify'

const response = await sendVerifyCode({
  phoneNumber: '13800138000',
  businessType: 'login',
  codeLength: 6,
  validMinutes: 5,
  templateId: 'SMS_123456789'
})
```

### sendVerifyCodeQuick

快速发送验证码（简化参数）

```typescript
import { sendVerifyCodeQuick } from '@/api/phone-verify'

const response = await sendVerifyCodeQuick('13800138000', 'login')
```

### verifyCode

校验验证码

```typescript
import { verifyCode } from '@/api/phone-verify'

const isValid = await verifyCode('13800138000', '123456', 'login')
```

### getProvider

获取当前使用的提供商

```typescript
import { getProvider } from '@/api/phone-verify'

const provider = await getProvider()
```

---

## 业务类型说明

`businessType` 用于区分不同的业务场景：

| 值 | 说明 |
|----|------|
| login | 登录 |
| register | 注册 |
| reset-password | 重置密码 |
| bind-phone | 绑定手机号 |
| change-phone | 更换手机号 |
| verify-identity | 身份验证 |

---

## 完整示例

### 登录页面

```vue
<template>
  <el-form :model="loginForm" :rules="rules" ref="formRef">
    <el-form-item label="手机号" prop="phoneNumber">
      <el-input
        v-model="loginForm.phoneNumber"
        placeholder="请输入手机号"
        maxlength="11"
      />
    </el-form-item>

    <VerifyCodeInput
      v-model="loginForm.code"
      :phone-number="loginForm.phoneNumber"
      business-type="login"
      @send-success="handleSendSuccess"
    />

    <el-form-item>
      <el-button type="primary" @click="handleLogin" :loading="loading">
        登录
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { VerifyCodeInput } from '@/components/PhoneVerify'
import { verifyCode } from '@/api/phone-verify'

const formRef = ref()
const loading = ref(false)

const loginForm = ref({
  phoneNumber: '',
  code: ''
})

const rules = {
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const handleSendSuccess = (response: any) => {
  console.log('验证码发送成功:', response)
}

const handleLogin = async () => {
  await formRef.value?.validate()

  try {
    loading.value = true

    // 校验验证码
    const response = await verifyCode(
      loginForm.value.phoneNumber,
      loginForm.value.code,
      'login'
    )

    if (response.data) {
      ElMessage.success('登录成功')
      // 执行登录逻辑
    } else {
      ElMessage.error('验证码错误')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>
```

### 注册页面

```vue
<template>
  <el-form :model="registerForm" :rules="rules" ref="formRef">
    <el-form-item label="手机号" prop="phoneNumber">
      <el-input
        v-model="registerForm.phoneNumber"
        placeholder="请输入手机号"
      />
    </el-form-item>

    <el-form-item label="验证码" prop="code">
      <div style="display: flex; gap: 10px">
        <el-input
          v-model="registerForm.code"
          placeholder="请输入验证码"
          style="flex: 1"
        />
        <SendCodeButton
          :phone-number="registerForm.phoneNumber"
          business-type="register"
          :before-send="validatePhone"
        />
      </div>
    </el-form-item>

    <el-form-item label="密码" prop="password">
      <el-input
        v-model="registerForm.password"
        type="password"
        placeholder="请输入密码"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleRegister">
        注册
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { SendCodeButton } from '@/components/PhoneVerify'

const formRef = ref()

const registerForm = ref({
  phoneNumber: '',
  code: '',
  password: ''
})

const rules = {
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 发送前验证手机号
const validatePhone = async () => {
  try {
    await formRef.value?.validateField('phoneNumber')
    return true
  } catch {
    return false
  }
}

const handleRegister = async () => {
  await formRef.value?.validate()
  // 执行注册逻辑
  ElMessage.success('注册成功')
}
</script>
```

---

## 样式自定义

组件使用 Element Plus 的样式系统，可以通过 CSS 变量进行自定义：

```scss
.verify-code-input {
  // 自定义样式
  :deep(.el-input-group__append) {
    .el-button {
      min-width: 100px;
      background-color: var(--el-color-primary);
    }
  }
}
```

---

## 注意事项

1. 使用前需要在后端配置并启用号码认证服务
2. 组件依赖 Element Plus，确保已正确安装
3. 验证码默认6位数字，有效期5分钟
4. 发送按钮有60秒倒计时限制
5. 建议在生产环境关闭调试模式

---

## 常见问题

### Q: 如何自定义倒计时时长？

A: 使用 `countdownSeconds` 属性：

```vue
<VerifyCodeInput :countdown-seconds="120" />
```

### Q: 如何在发送前进行额外验证？

A: 使用 `beforeSend` 回调：

```vue
<SendCodeButton :before-send="handleBeforeSend" />

<script setup>
const handleBeforeSend = async () => {
  // 返回 false 可以阻止发送
  if (!someCondition) {
    return false
  }
  return true
}
</script>
```

### Q: 如何手动触发发送？

A: 通过 ref 调用组件方法：

```vue
<SendCodeButton ref="sendBtnRef" />

<script setup>
const sendBtnRef = ref()
sendBtnRef.value?.send()
</script>
```

---

## 更新日志

### v1.0.0 (2024-11-22)

- ✨ 初始版本
- ✅ VerifyCodeInput 组件
- ✅ SendCodeButton 组件
- ✅ 完整的 TypeScript 类型定义
- ✅ 倒计时功能
- ✅ 自动校验

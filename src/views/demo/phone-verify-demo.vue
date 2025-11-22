<template>
  <div class="phone-verify-demo">
    <el-card header="号码认证服务示例">
      <el-alert
        title="使用说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>1. 需要在后端配置文件中启用号码认证服务并配置相应的云厂商密钥</p>
        <p>2. 支持阿里云、腾讯云、华为云等多个云厂商</p>
        <p>3. 验证码默认6位数字，有效期5分钟</p>
        <p>4. 开启调试模式后，验证码会在响应中返回（仅用于测试）</p>
      </el-alert>

      <!-- 示例1: 使用集成组件 -->
      <el-divider content-position="left">示例1: 使用集成的验证码输入组件</el-divider>
      <el-form :model="form1" label-width="100px" style="max-width: 500px">
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input
            v-model="form1.phoneNumber"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </el-form-item>

        <VerifyCodeInput
          v-model="form1.code"
          :phone-number="form1.phoneNumber"
          business-type="login"
          label="验证码"
          prop="code"
          @send-success="handleSendSuccess"
          @send-error="handleSendError"
        />

        <el-form-item>
          <el-button type="primary" @click="handleVerify1">验证</el-button>
        </el-form-item>
      </el-form>

      <!-- 示例2: 使用独立按钮 -->
      <el-divider content-position="left">示例2: 使用独立的发送按钮</el-divider>
      <el-form :model="form2" label-width="100px" style="max-width: 500px">
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input
            v-model="form2.phoneNumber"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <div style="display: flex; gap: 10px">
            <el-input
              v-model="form2.code"
              placeholder="请输入验证码"
              maxlength="6"
              style="flex: 1"
            />
            <SendCodeButton
              :phone-number="form2.phoneNumber"
              business-type="register"
              type="primary"
              @send-success="handleSendSuccess"
              @send-error="handleSendError"
            />
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleVerify2">验证</el-button>
        </el-form-item>
      </el-form>

      <!-- 示例3: 自定义发送 -->
      <el-divider content-position="left">示例3: 自定义发送逻辑</el-divider>
      <el-form :model="form3" label-width="100px" style="max-width: 500px">
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input
            v-model="form3.phoneNumber"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <div style="display: flex; gap: 10px">
            <el-input
              v-model="form3.code"
              placeholder="请输入验证码"
              maxlength="6"
              style="flex: 1"
            />
            <el-button
              type="primary"
              :loading="sending"
              @click="handleCustomSend"
            >
              {{ sending ? '发送中...' : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleVerify3">验证</el-button>
        </el-form-item>
      </el-form>

      <!-- 当前提供商 -->
      <el-divider />
      <div style="text-align: center; color: #909399">
        当前使用的提供商: <el-tag>{{ provider || '未配置' }}</el-tag>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VerifyCodeInput, SendCodeButton } from '@/components/PhoneVerify'
import { sendVerifyCode, verifyCode, getProvider } from '@/api/phone-verify'

// 表单数据
const form1 = ref({
  phoneNumber: '',
  code: ''
})

const form2 = ref({
  phoneNumber: '',
  code: ''
})

const form3 = ref({
  phoneNumber: '',
  code: ''
})

const sending = ref(false)
const provider = ref('')

// 获取提供商信息
onMounted(async () => {
  try {
    const response = await getProvider()
    provider.value = response.data
  } catch (error) {
    console.error('获取提供商信息失败:', error)
  }
})

// 发送成功回调
const handleSendSuccess = (response: any) => {
  console.log('验证码发送成功:', response)
}

// 发送失败回调
const handleSendError = (error: any) => {
  console.error('验证码发送失败:', error)
}

// 验证码验证 - 示例1
const handleVerify1 = async () => {
  if (!form1.value.phoneNumber || !form1.value.code) {
    ElMessage.warning('请输入手机号和验证码')
    return
  }

  try {
    const response = await verifyCode(
      form1.value.phoneNumber,
      form1.value.code,
      'login'
    )

    if (response.data) {
      ElMessage.success('验证成功')
    } else {
      ElMessage.error('验证失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '验证失败')
  }
}

// 验证码验证 - 示例2
const handleVerify2 = async () => {
  if (!form2.value.phoneNumber || !form2.value.code) {
    ElMessage.warning('请输入手机号和验证码')
    return
  }

  try {
    const response = await verifyCode(
      form2.value.phoneNumber,
      form2.value.code,
      'register'
    )

    if (response.data) {
      ElMessage.success('验证成功')
    } else {
      ElMessage.error('验证失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '验证失败')
  }
}

// 自定义发送
const handleCustomSend = async () => {
  if (!form3.value.phoneNumber) {
    ElMessage.warning('请输入手机号')
    return
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(form3.value.phoneNumber)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  try {
    sending.value = true

    const response = await sendVerifyCode({
      phoneNumber: form3.value.phoneNumber,
      businessType: 'custom',
      codeLength: 6,
      validMinutes: 5
    })

    if (response.data.success) {
      ElMessage.success('验证码发送成功')
      if (response.data.code) {
        ElMessage.info(`验证码: ${response.data.code} (仅测试环境显示)`)
      }
    } else {
      ElMessage.error(response.data.message || '验证码发送失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '验证码发送失败')
  } finally {
    sending.value = false
  }
}

// 验证码验证 - 示例3
const handleVerify3 = async () => {
  if (!form3.value.phoneNumber || !form3.value.code) {
    ElMessage.warning('请输入手机号和验证码')
    return
  }

  try {
    const response = await verifyCode(
      form3.value.phoneNumber,
      form3.value.code,
      'custom'
    )

    if (response.data) {
      ElMessage.success('验证成功')
    } else {
      ElMessage.error('验证失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '验证失败')
  }
}
</script>

<style scoped lang="scss">
.phone-verify-demo {
  padding: 20px;

  :deep(.el-alert__description) {
    p {
      margin: 5px 0;
    }
  }
}
</style>

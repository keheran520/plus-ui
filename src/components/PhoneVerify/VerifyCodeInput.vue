<template>
  <div class="verify-code-input">
    <el-form-item :label="label" :prop="prop" :rules="rules">
      <div class="verify-input-wrapper">
        <el-input
          v-model="codeValue"
          :placeholder="placeholder"
          :maxlength="6"
          clearable
          @input="handleInput"
        >
          <template #append>
            <el-button
              :disabled="countdown > 0 || sending"
              :loading="sending"
              @click="handleSendCode"
            >
              {{ buttonText }}
            </el-button>
          </template>
        </el-input>
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { sendVerifyCodeQuick } from '@/api/phone-verify'

interface Props {
  /** 手机号 */
  phoneNumber: string
  /** 业务类型 */
  businessType: string
  /** 标签 */
  label?: string
  /** 表单属性名 */
  prop?: string
  /** 占位符 */
  placeholder?: string
  /** 倒计时秒数 */
  countdownSeconds?: number
  /** 校验规则 */
  rules?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  label: '验证码',
  prop: 'code',
  placeholder: '请输入验证码',
  countdownSeconds: 60,
  rules: () => [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '请输入6位数字验证码', trigger: 'blur' }
  ]
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'send-success': [response: any]
  'send-error': [error: any]
}>()

const codeValue = defineModel<string>({ default: '' })
const sending = ref(false)
const countdown = ref(0)
let timer: NodeJS.Timeout | null = null

const buttonText = computed(() => {
  if (sending.value) {
    return '发送中...'
  }
  if (countdown.value > 0) {
    return `${countdown.value}秒后重试`
  }
  return '获取验证码'
})

// 处理输入
const handleInput = (value: string) => {
  // 只允许输入数字
  const numericValue = value.replace(/\D/g, '')
  codeValue.value = numericValue
}

// 发送验证码
const handleSendCode = async () => {
  // 验证手机号
  if (!props.phoneNumber) {
    ElMessage.warning('请先输入手机号')
    return
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(props.phoneNumber)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  try {
    sending.value = true

    const response = await sendVerifyCodeQuick(props.phoneNumber, props.businessType)

    if (response.data.success) {
      ElMessage.success('验证码发送成功')
      startCountdown()
      emit('send-success', response.data)

      // 如果是调试模式，显示验证码
      if (response.data.code) {
        ElMessage.info(`验证码: ${response.data.code} (仅测试环境显示)`)
      }
    } else {
      ElMessage.error(response.data.message || '验证码发送失败')
      emit('send-error', response.data)
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    ElMessage.error(error.message || '验证码发送失败，请稍后重试')
    emit('send-error', error)
  } finally {
    sending.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = props.countdownSeconds
  if (timer) {
    clearInterval(timer)
  }
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer!)
      timer = null
    }
  }, 1000)
}

// 清理定时器
const cleanup = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 监听手机号变化，重置倒计时
watch(() => props.phoneNumber, () => {
  cleanup()
  countdown.value = 0
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.verify-code-input {
  .verify-input-wrapper {
    width: 100%;
  }

  :deep(.el-input-group__append) {
    padding: 0;

    .el-button {
      margin: 0;
      border-radius: 0;
      min-width: 120px;
    }
  }
}
</style>

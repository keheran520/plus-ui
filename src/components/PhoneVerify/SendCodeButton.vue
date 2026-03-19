<template>
  <el-button :disabled="countdown > 0 || sending || disabled" :loading="sending" :size="size" :type="type" @click="handleSendCode">
    {{ buttonText }}
  </el-button>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { sendVerifyCodeQuick } from '@/api/phone-verify';

interface Props {
  /** 手机号 */
  phoneNumber: string;
  /** 业务类型 */
  businessType: string;
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default';
  /** 按钮尺寸 */
  size?: 'large' | 'default' | 'small';
  /** 倒计时秒数 */
  countdownSeconds?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 发送前的验证函数 */
  beforeSend?: () => boolean | Promise<boolean>;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'default',
  countdownSeconds: 60,
  disabled: false
});

const emit = defineEmits<{
  'send-success': [response: any];
  'send-error': [error: any];
}>();

const sending = ref(false);
const countdown = ref(0);
let timer: NodeJS.Timeout | null = null;

const buttonText = computed(() => {
  if (sending.value) {
    return '发送中...';
  }
  if (countdown.value > 0) {
    return `${countdown.value}秒后重试`;
  }
  return '获取验证码';
});

// 发送验证码
const handleSendCode = async () => {
  // 执行发送前的验证
  if (props.beforeSend) {
    try {
      const canSend = await props.beforeSend();
      if (!canSend) {
        return;
      }
    } catch (error) {
      return;
    }
  }

  // 验证手机号
  if (!props.phoneNumber) {
    ElMessage.warning('请先输入手机号');
    return;
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(props.phoneNumber)) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }

  try {
    sending.value = true;

    const response = await sendVerifyCodeQuick(props.phoneNumber, props.businessType);

    if (response.data.success) {
      ElMessage.success('验证码发送成功');
      startCountdown();
      emit('send-success', response.data);

      // 如果是调试模式，显示验证码
      if (response.data.code) {
        ElMessage.info(`验证码: ${response.data.code} (仅测试环境显示)`);
      }
    } else {
      ElMessage.error(response.data.message || '验证码发送失败');
      emit('send-error', response.data);
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error);
    ElMessage.error(error.message || '验证码发送失败，请稍后重试');
    emit('send-error', error);
  } finally {
    sending.value = false;
  }
};

// 开始倒计时
const startCountdown = () => {
  countdown.value = props.countdownSeconds;
  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer!);
      timer = null;
    }
  }, 1000);
};

// 清理定时器
const cleanup = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// 监听手机号变化，重置倒计时
watch(
  () => props.phoneNumber,
  () => {
    cleanup();
    countdown.value = 0;
  }
);

// 组件卸载时清理
onUnmounted(() => {
  cleanup();
});

// 暴露方法供父组件调用
defineExpose({
  /** 手动触发发送 */
  send: handleSendCode,
  /** 重置倒计时 */
  reset: cleanup
});
</script>

<template>
  <div class="ip-segment-input">
    <div class="ip-prefix" v-if="prefix">{{ prefix }}</div>
    <div class="ip-inputs">
      <template v-for="(segment, index) in segments" :key="index">
        <input
          :ref="(el) => setInputRef(el, index)"
          v-model="segment.value"
          :maxlength="3"
          class="ip-input"
          type="text"
          @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
          @paste="handlePaste($event)"
        />
        <span v-if="index < segments.length - 1" class="ip-dot">.</span>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';

interface Props {
  modelValue: string;
  prefix?: string; // IP前缀，如 "192.168.1."
  segmentCount?: number; // 需要输入的段数，如 1 表示只输入最后一段
}

const props = withDefaults(defineProps<Props>(), {
  prefix: '',
  segmentCount: 1
});

const emit = defineEmits(['update:modelValue']);

// 输入框引用
const inputRefs = ref<(HTMLInputElement | null)[]>([]);

// 设置输入框引用
const setInputRef = (el: any, index: number) => {
  if (el) {
    inputRefs.value[index] = el as HTMLInputElement;
  }
};

// IP段数据
const segments = reactive<{ value: string }[]>(
  Array.from({ length: props.segmentCount }, () => ({ value: '' }))
);

// 初始化值
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      const parts = newVal.split('.');
      parts.forEach((part, index) => {
        if (index < segments.length) {
          segments[index].value = part;
        }
      });
    } else {
      segments.forEach((seg) => (seg.value = ''));
    }
  },
  { immediate: true }
);

// 更新值
const updateValue = () => {
  const value = segments.map((seg) => seg.value).join('.');
  emit('update:modelValue', value);
};

// 处理输入
const handleInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value;

  // 只允许数字
  value = value.replace(/[^\d]/g, '');

  // 限制范围 0-255
  if (value) {
    const num = parseInt(value, 10);
    if (num > 255) {
      value = '255';
    }
  }

  segments[index].value = value;

  // 自动跳转到下一个输入框
  if (value.length === 3 && index < segments.length - 1) {
    inputRefs.value[index + 1]?.focus();
  }

  updateValue();
};

// 处理键盘事件
const handleKeydown = (index: number, event: KeyboardEvent) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  // 按下 . 或右箭头键，跳转到下一个输入框
  if ((event.key === '.' || event.key === 'ArrowRight') && index < segments.length - 1) {
    event.preventDefault();
    inputRefs.value[index + 1]?.focus();
  }

  // 按下左箭头键，跳转到上一个输入框
  if (event.key === 'ArrowLeft' && index > 0 && input.selectionStart === 0) {
    event.preventDefault();
    inputRefs.value[index - 1]?.focus();
  }

  // 按下退格键，如果当前输入框为空，跳转到上一个输入框
  if (event.key === 'Backspace' && !value && index > 0) {
    event.preventDefault();
    inputRefs.value[index - 1]?.focus();
  }
};

// 处理粘贴
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pasteData = event.clipboardData?.getData('text') || '';
  const parts = pasteData.split('.').filter((p) => /^\d+$/.test(p));

  parts.forEach((part, index) => {
    if (index < segments.length) {
      const num = parseInt(part, 10);
      segments[index].value = num > 255 ? '255' : part;
    }
  });

  updateValue();
};

// 聚焦第一个输入框
const focus = () => {
  inputRefs.value[0]?.focus();
};

// 暴露方法
defineExpose({
  focus
});
</script>

<style lang="scss" scoped>
.ip-segment-input {
  display: inline-flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 8px;
  background: #fff;
  transition: border-color 0.2s;

  &:hover {
    border-color: #c0c4cc;
  }

  &:focus-within {
    border-color: #409eff;
  }

  .ip-prefix {
    color: #606266;
    font-size: 14px;
    padding-right: 2px;
    user-select: none;
  }

  .ip-inputs {
    display: flex;
    align-items: center;
  }

  .ip-input {
    width: 40px;
    height: 30px;
    border: none;
    outline: none;
    text-align: center;
    font-size: 14px;
    color: #606266;
    padding: 0;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  .ip-dot {
    color: #606266;
    font-size: 14px;
    user-select: none;
    padding: 0 2px;
  }
}
</style>

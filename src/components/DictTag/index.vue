<template>
  <span class="dict-tag" :class="{ 'dict-tag--wrap': wrap }" :style="wrapperStyle">
    <template v-for="item in matchedOptions" :key="`${item.value}-${item.label}`">
      <span v-if="displayMode === 'text'" :class="['dict-tag__text', item.elTagClass || item.cssClass]">
        {{ item.label }}
      </span>
      <el-tag
        v-else
        :class="['dict-tag__item', `dict-tag__item--${theme}`, item.elTagClass || item.cssClass]"
        :disable-transitions="true"
        :effect="resolvedEffect"
        :round="round"
        :size="size"
        :type="resolveTagType(item)"
      >
        {{ item.label }}
      </el-tag>
    </template>
    <template v-if="unmatchedValues.length && showValue">
      <span v-if="displayMode === 'text'" class="dict-tag__text">{{ unmatchedText }}</span>
      <el-tag
        v-else
        class="dict-tag__item dict-tag__item--fallback"
        :disable-transitions="true"
        :effect="resolvedEffect"
        :round="round"
        :size="size"
        :type="fallbackType"
      >
        {{ unmatchedText }}
      </el-tag>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type DictTagTheme = 'light' | 'dark' | 'plain' | 'text';

interface Props {
  options: Array<DictDataOption>;
  value: number | string | Array<number | string>;
  showValue?: boolean;
  separator?: string;
  round?: boolean;
  wrap?: boolean;
  gap?: number | string;
  size?: '' | 'large' | 'default' | 'small';
  theme?: DictTagTheme;
  fallbackType?: ElTagType;
}

const props = withDefaults(defineProps<Props>(), {
  showValue: true,
  separator: ',',
  round: true,
  wrap: true,
  gap: 8,
  size: 'small',
  theme: 'light',
  fallbackType: 'info'
});

const normalizedValues = computed(() => {
  if (props.value === '' || props.value === null || typeof props.value === 'undefined') {
    return [];
  }
  if (Array.isArray(props.value)) {
    return props.value.map((item) => String(item)).filter(Boolean);
  }
  return String(props.value)
    .split(props.separator)
    .map((item) => item.trim())
    .filter(Boolean);
});

const matchedOptions = computed(() =>
  normalizedValues.value
    .map((value) => props.options?.find((item) => String(item.value) === value))
    .filter((item): item is DictDataOption => !!item)
);

const unmatchedValues = computed(() =>
  normalizedValues.value.filter((value) => !props.options?.some((item) => String(item.value) === value))
);

const unmatchedText = computed(() => unmatchedValues.value.join('、'));

const wrapperStyle = computed(() => ({
  gap: typeof props.gap === 'number' ? `${props.gap}px` : props.gap
}));

const displayMode = computed(() => props.theme);

const resolvedEffect = computed(() => {
  if (props.theme === 'dark') {
    return 'dark';
  }
  if (props.theme === 'plain') {
    return 'plain';
  }
  return 'light';
});

const resolveTagType = (item: DictDataOption): ElTagType => {
  const tagType = item.elTagType;
  if (tagType === 'primary' || tagType === 'success' || tagType === 'info' || tagType === 'warning' || tagType === 'danger') {
    return tagType;
  }
  return 'info';
};
</script>

<style lang="scss" scoped>
.dict-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.dict-tag--wrap {
  flex-wrap: wrap;
}

.dict-tag__text {
  color: #475569;
  font-size: 13px;
  line-height: 1.4;
}

.dict-tag__item {
  margin: 0;
  font-weight: 500;
  border-radius: 999px;
  border-width: 1px;
}

.dict-tag__item--light {
  box-shadow: none;
}

.dict-tag__item :deep(.el-tag__content) {
  line-height: 1;
}

.dict-tag__item.el-tag--primary {
  color: #2563eb;
  border-color: #bfdbfe;
  background: #eff6ff;
}

.dict-tag__item.el-tag--success {
  color: #15803d;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.dict-tag__item.el-tag--info {
  color: #475569;
  border-color: #cbd5e1;
  background: #f8fafc;
}

.dict-tag__item.el-tag--warning {
  color: #b45309;
  border-color: #fde68a;
  background: #fffbeb;
}

.dict-tag__item.el-tag--danger {
  color: #dc2626;
  border-color: #fecaca;
  background: #fef2f2;
}

.dict-tag__item--dark.el-tag--primary {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}

.dict-tag__item--dark.el-tag--success {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
}

.dict-tag__item--dark.el-tag--info {
  background: #64748b;
  border-color: #64748b;
  color: #fff;
}

.dict-tag__item--dark.el-tag--warning {
  background: #d97706;
  border-color: #d97706;
  color: #fff;
}

.dict-tag__item--dark.el-tag--danger {
  background: #dc2626;
  border-color: #dc2626;
  color: #fff;
}

.dict-tag__item--plain.el-tag--primary {
  background: #fff;
}

.dict-tag__item--plain.el-tag--success {
  background: #fff;
}

.dict-tag__item--plain.el-tag--info {
  background: #fff;
}

.dict-tag__item--plain.el-tag--warning {
  background: #fff;
}

.dict-tag__item--plain.el-tag--danger {
  background: #fff;
}

.dict-tag__item--fallback {
  background: #f8fafc;
}
</style>

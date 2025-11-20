<template>
  <div class="setting-tabs">
    <div class="tabs-sidebar">
      <div v-for="tab in tabs" :key="tab.name" :class="['tab-item', { active: modelValue === tab.name }]" @click="handleTabClick(tab.name)">
        <el-icon class="tab-icon">
          <component :is="tab.icon" />
        </el-icon>
        <span class="tab-label">{{ tab.label }}</span>
      </div>
    </div>
    <div class="tabs-content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Tab {
  name: string;
  label: string;
  icon: any;
}

interface Props {
  modelValue: string;
  tabs: Tab[];
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const handleTabClick = (name: string) => {
  emit('update:modelValue', name);
};
</script>

<style lang="scss" scoped>
.setting-tabs {
  display: flex;
  min-height: 800px;
  background: var(--el-bg-color);
  border-radius: 8px;
}

.tabs-sidebar {
  width: 180px;
  background: var(--el-fill-color-blank);
  border-right: 1px solid var(--el-border-color-light);
  padding: 16px 0;
  flex-shrink: 0;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--el-text-color-regular);
  position: relative;

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 500;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: var(--el-color-primary);
      border-radius: 0 2px 2px 0;
    }
  }

  .tab-icon {
    font-size: 18px;
    margin-right: 12px;
  }

  .tab-label {
    font-size: 14px;
  }
}

.tabs-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>

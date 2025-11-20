<template>
  <div class="custom-tabs-wrapper">
    <el-tabs v-model="activeTab" class="custom-tabs" tab-position="left" @tab-click="handleTabClick">
      <el-tab-pane v-for="tab in tabs" :key="tab.name" :label="tab.label" :name="tab.name">
        <template #label>
          <div class="custom-tab-label">
            <el-icon class="tab-icon">
              <component :is="tab.icon" />
            </el-icon>
            <span class="tab-text">{{ tab.label }}</span>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
    <div class="custom-tabs-content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TabsPaneContext } from 'element-plus';

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
const emit = defineEmits(['update:modelValue', 'tab-click']);

const activeTab = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const handleTabClick = (pane: TabsPaneContext) => {
  emit('tab-click', pane);
};
</script>

<style lang="scss" scoped>
.custom-tabs-wrapper {
  display: flex;
  min-height: 600px;
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
}

.custom-tabs {
  width: 230px;
  flex-shrink: 0;
  background: var(--el-fill-color-blank);
  border-right: 1px solid var(--el-border-color-light);

  // 隐藏默认的tabs内容区域
  :deep(.is-left) {
    width: 100%;
    margin-right: 0;
    padding: var(--spacing-sm);
  }

  // 隐藏默认的tabs内容区域
  :deep(.el-tabs__content) {
    display: none;
  }

  // 左侧导航样式
  :deep(.el-tabs__nav-wrap) {
    width: 100%;

    &::after {
      display: none; // 隐藏底部边框
    }

    :deep(.el-tabs__nav-scroll) {
      width: 100%;
    }
  }

  :deep(.el-tabs__active-bar) {
    background: transparent;
    width: 0;
    //width: 3px;
    //background: var(--el-color-primary);
    //border-radius: 0 2px 2px 0;
  }

  :deep(.el-tabs__nav) {
    background: transparent;
  }

  :deep(.el-tabs__item) {
    padding: 12px 20px;
    height: auto;
    line-height: normal;
    color: var(--el-text-color-regular);
    transition: all 0.3s;
    border: none;
    background: transparent;
    margin: var(--spacing-xs) 0;

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }

    &.is-active {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      font-weight: 500;
    }

    .custom-tab-label {
      display: flex;
      align-items: center;
      gap: 12px;

      .tab-icon {
        font-size: 18px;
      }

      .tab-text {
        font-size: 14px;
      }
    }
  }
}

.custom-tabs-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: var(--el-bg-color);
}
</style>

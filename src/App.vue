<template>
  <el-config-provider :locale="appStore.locale" :size="appStore.size">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/modules/settings';
import { handleThemeStyle } from '@/utils/theme';
import { useAppStore } from '@/store/modules/app';
import { useWebsiteStore } from '@/store/modules/website';

const appStore = useAppStore();
const websiteStore = useWebsiteStore();

// 动态替换 favicon：有配置用配置，没有降级到 /favicon.ico
watch(
  () => websiteStore.config.favicon,
  (url) => {
    const href = url || '/favicon.ico';
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
  }
);

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme);
  });
});
</script>

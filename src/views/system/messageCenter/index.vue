<template>
  <div class="p-4">
    <el-card shadow="hover" class="message-center-card">
      <SettingTabs v-model="activeTab" :tabs="tabList">
        <!-- 我的消息 -->
        <div v-show="activeTab === 'myMessages'">
          <MyMessages />
        </div>

        <!-- 消息设置 -->
        <div v-show="activeTab === 'settings'">
          <MessageSettings />
        </div>
      </SettingTabs>
    </el-card>
  </div>
</template>

<script lang="ts" name="MessageCenter" setup>
import SettingTabs from '@/components/SettingTabs/index.vue';
import MyMessages from './myMessages/index.vue';
import MessageSettings from './settings/index.vue';
import { Bell, Setting } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

// 从URL参数中获取初始tab，默认为myMessages
const activeTab = ref(route.query.tab ? String(route.query.tab) : 'myMessages');

// 监听tab变化，更新URL
watch(activeTab, (newTab) => {
  router.push({
    query: { tab: newTab }
  });
});

// Tab列表配置
const tabList = [
  { name: 'myMessages', label: '我的消息', icon: Bell },
  { name: 'settings', label: '消息设置', icon: Setting }
];
</script>

<style lang="scss" scoped>
.message-center-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}
</style>

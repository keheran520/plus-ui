<template>
  <div class="p-4">
    <el-card class="settings-card" shadow="hover">
      <SettingTabs v-model="activeTab" :tabs="tabList">
        <!-- 网站配置 -->
        <div v-show="activeTab === 'website'">
          <Website />
        </div>

        <!-- 安全配置 -->
        <div v-show="activeTab === 'security'">
          <Security />
        </div>

        <!-- 登录配置 -->
        <div v-show="activeTab === 'login'">
          <Login />
        </div>

        <!-- 邮箱配置 -->
        <div v-show="activeTab === 'email'">
          <Email />
        </div>

        <!-- 号码认证配置 -->
        <div v-show="activeTab === 'phoneVerify'">
          <PhoneVerify />
        </div>

        <!-- 短信配置 -->
        <div v-show="activeTab === 'sms'">
          <Sms />
        </div>

        <!-- 存储配置 -->
        <div v-show="activeTab === 'storage'">
          <Storage />
        </div>

        <!-- 客户端配置 -->
        <div v-show="activeTab === 'client'">
          <Client />
        </div>
      </SettingTabs>
    </el-card>
  </div>
</template>

<script lang="ts" name="SystemSettings" setup>
import SettingTabs from '@/components/SettingTabs/index.vue';
import Website from './website/index.vue';
import Email from './email/index.vue';
import Login from './login/index.vue';
import Security from './security/index.vue';
import Sms from './sms/index.vue';
import PhoneVerify from './phoneVerify/index.vue';
import Storage from './storage/index.vue';
import Client from './client/index.vue';
import { Folder, Lock, Message, Monitor, Phone, Platform, User } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

// 从URL参数中获取初始tab，默认为website
const activeTab = ref(route.query.tab ? String(route.query.tab) : 'website');

// 监听tab变化，更新URL
watch(activeTab, (newTab) => {
  router.push({
    query: { tab: newTab }
  });
});

// Tab列表配置
const tabList = [
  { name: 'website', label: '网站配置', icon: Monitor },
  { name: 'security', label: '安全配置', icon: Lock },
  { name: 'login', label: '登录配置', icon: User },
  { name: 'email', label: '邮箱配置', icon: Message },
  { name: 'sms', label: '短信配置', icon: Phone },
  { name: 'phoneVerify', label: '认证配置', icon: Phone },
  { name: 'storage', label: '存储配置', icon: Folder },
  { name: 'client', label: '客户端配置', icon: Platform }
];
</script>

<style lang="scss" scoped>
.settings-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}
</style>

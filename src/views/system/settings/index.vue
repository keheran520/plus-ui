<template>
  <div class="p-4">
    <div class="settings-card">
      <SettingTabs v-model="activeTab" :tabs="tabList">
        <div v-show="activeTab === 'website'">
          <Website />
        </div>

        <div v-show="activeTab === 'mobile'">
          <Mobile />
        </div>

        <div v-show="activeTab === 'security'">
          <Security />
        </div>

        <div v-show="activeTab === 'login'">
          <Login />
        </div>

        <div v-show="activeTab === 'email'">
          <Email />
        </div>

        <div v-show="activeTab === 'phoneVerify'">
          <PhoneVerify />
        </div>

        <div v-show="activeTab === 'sms'">
          <Sms />
        </div>

        <div v-show="activeTab === 'storage'">
          <Storage />
        </div>

        <div v-show="activeTab === 'client'">
          <Client />
        </div>
      </SettingTabs>
    </div>
  </div>
</template>

<script lang="ts" name="SystemSettings" setup>
import SettingTabs from '@/components/SettingTabs/index.vue'
import Website from './website/index.vue'
import Mobile from './mobile/index.vue'
import Email from './email/index.vue'
import Login from './login/index.vue'
import Security from './security/index.vue'
import Sms from './sms/index.vue'
import PhoneVerify from './phoneVerify/index.vue'
import Storage from './storage/index.vue'
import Client from './client/index.vue'
import { Folder, Lock, Message, Monitor, Phone, Platform, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const activeTab = ref(route.query.tab ? String(route.query.tab) : 'website')

watch(activeTab, (newTab) => {
  router.push({
    query: { tab: newTab }
  })
})

const tabList = [
  { name: 'website', label: '网站配置', icon: Monitor },
  { name: 'mobile', label: 'C端配置', icon: Platform },
  { name: 'security', label: '安全配置', icon: Lock },
  { name: 'login', label: '登录配置', icon: User },
  { name: 'email', label: '邮箱配置', icon: Message },
  { name: 'sms', label: '短信配置', icon: Phone },
  { name: 'phoneVerify', label: '手机认证', icon: Phone },
  { name: 'storage', label: '存储配置', icon: Folder },
  { name: 'client', label: '客户端授权', icon: Platform }
]
</script>

<style lang="scss" scoped></style>

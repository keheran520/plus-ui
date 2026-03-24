<template>
  <div class="bg-white rounded-lg p-5 mb-4 shadow-sm">
    <!-- 用户头部信息 -->
    <div class="flex items-start justify-between mb-6">
      <div class="flex items-center">
        <el-avatar :size="48" :src="userStore.avatar" class="mr-3 bg-blue-100 text-blue-600 font-bold">
          {{ userStore.nickname ? userStore.nickname.charAt(0) : 'U' }}
        </el-avatar>
        <div>
          <div class="font-medium text-gray-900 text-base">{{ userStore.nickname || 'Admin' }}</div>
          <div class="text-xs text-gray-400 mt-1">ID: {{ userStore.userId || '10001' }}</div>
          <div class="flex items-center mt-2 gap-2">
            <span v-if="isContactBound(userStore.email)" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              <el-icon class="mr-1 w-3 h-3"><CircleCheck /></el-icon> {{ maskEmail(userStore.email) }}
            </span>
            <span v-if="isContactBound(userStore.phonenumber)" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              <el-icon class="mr-1 w-3 h-3"><CircleCheck /></el-icon> {{ maskPhone(userStore.phonenumber) }}
            </span>
          </div>
        </div>
      </div>
      <el-link :underline="false" class="text-xs flex items-center" type="primary" @click="goToProfile">
        账号中心
        <el-icon class="ml-0.5">
          <ArrowRight />
        </el-icon>
      </el-link>
    </div>

    <!-- 数据统计 -->
    <div v-show="false" class="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-4">
      <div class="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
        <div class="text-xs text-gray-500 mb-1">待支付订单</div>
        <div class="text-xl font-bold text-gray-900">0</div>
      </div>
      <div class="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
        <div class="text-xs text-gray-500 mb-1">待办任务</div>
        <div class="text-xl font-bold text-gray-900">4</div>
      </div>
      <div class="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
        <div class="text-xs text-gray-500 mb-1">消息通知</div>
        <div class="text-xl font-bold text-gray-900">12</div>
      </div>
    </div>
  </div>

  <!-- 访问控制 (模拟图片中的第二块) -->
  <div v-show="false" class="bg-white rounded-lg p-5 mb-4 shadow-sm">
    <h4 class="text-sm font-medium text-gray-900 mb-4">访问控制</h4>
    <div class="grid grid-cols-3 gap-4 text-center">
      <div>
        <div class="text-xs text-gray-500 mb-1">用户</div>
        <div class="text-lg font-bold text-gray-900">1</div>
      </div>
      <div>
        <div class="text-xs text-gray-500 mb-1">用户组</div>
        <div class="text-lg font-bold text-gray-900">0</div>
      </div>
      <div>
        <div class="text-xs text-gray-500 mb-1">角色</div>
        <div class="text-lg font-bold text-gray-900">11</div>
      </div>
    </div>

    <div class="mt-4 bg-blue-50 rounded p-3 flex items-start">
      <el-icon class="text-blue-500 mt-0.5 mr-2">
        <InfoFilled />
      </el-icon>
      <div class="flex-1 overflow-hidden">
        <div class="text-xs text-gray-700 font-medium mb-1">子用户登录地址</div>
        <div class="text-xs text-gray-500 truncate">https://console.volcengine.com/auth/login/user/2105173808</div>
      </div>
      <el-icon class="text-gray-400 cursor-pointer hover:text-blue-500">
        <CopyDocument />
      </el-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { ArrowRight, CircleCheck, CopyDocument, InfoFilled } from '@element-plus/icons-vue';
import { isContactBound, maskEmail, maskPhone } from '@/utils/contact';

const router = useRouter();
const userStore = useUserStore();

// 跳转到个人中心
const goToProfile = () => {
  router.push('/user/profile');
};

</script>

<style scoped>
.flex {
  display: flex;
}

.items-start {
  align-items: flex-start;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.grid {
  display: grid;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.mr-3 {
  margin-right: 0.75rem;
}

.mr-1 {
  margin-right: 0.25rem;
}

.ml-0\.5 {
  margin-left: 0.125rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-5 {
  padding: 1.25rem;
}

.pt-4 {
  padding-top: 1rem;
}

.px-1\.5 {
  padding-left: 0.375rem;
  padding-right: 0.375rem;
}

.py-0\.5 {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.font-medium {
  font-weight: 500;
}

.font-bold {
  font-weight: 700;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-900 {
  color: #111827;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-blue-600 {
  color: #2563eb;
}

.text-green-800 {
  color: #166534;
}

.bg-white {
  background-color: #ffffff;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-blue-100 {
  background-color: #dbeafe;
}

.bg-green-100 {
  background-color: #dcfce7;
}

.rounded {
  border-radius: 0.25rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.border-t {
  border-top-width: 1px;
}

.border-gray-100 {
  border-color: #f3f4f6;
}

.cursor-pointer {
  cursor: pointer;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.inline-flex {
  display: inline-flex;
}

.w-3 {
  width: 0.75rem;
}

.h-3 {
  height: 0.75rem;
}

.overflow-hidden {
  overflow: hidden;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flex-1 {
  flex: 1 1 0%;
}
</style>

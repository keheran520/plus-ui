<template>
  <el-card shadow="hover" class="mb-4 border-none">
    <template #header>
      <span class="font-bold text-base">快捷操作</span>
    </template>
    <div class="grid grid-cols-3 gap-2">
      <div v-for="(item, index) in navItems" :key="index" 
           class="flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-all duration-300 group" 
           @click="handleNav(item)">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110" 
             :style="{ backgroundColor: item.bgColor }">
          <el-icon :size="20" :color="item.color"><component :is="item.icon" /></el-icon>
        </div>
        <span class="text-xs text-gray-600 group-hover:text-gray-900">{{ item.title }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { User, Setting, Lock, Message, PieChart, Connection, DataBoard, Document } from '@element-plus/icons-vue';

const router = useRouter();

const navItems = ref([
  { title: '用户管理', icon: 'User', color: '#409EFF', bgColor: '#ecf5ff', path: '/system/user' },
  { title: '角色管理', icon: 'Lock', color: '#F56C6C', bgColor: '#fef0f0', path: '/system/role' },
  { title: '菜单管理', icon: 'Connection', color: '#67C23A', bgColor: '#f0f9eb', path: '/system/menu' },
  { title: '系统配置', icon: 'Setting', color: '#E6A23C', bgColor: '#fdf6ec', path: '/system/config' },
  { title: '通知公告', icon: 'Message', color: '#909399', bgColor: '#f4f4f5', path: '/system/notice' },
  { title: '监控中心', icon: 'PieChart', color: '#B37FEB', bgColor: '#f9f0ff', path: '/monitor/server' },
  { title: '代码生成', icon: 'DataBoard', color: '#36cfc9', bgColor: '#e6fffb', path: '/tool/gen' },
  { title: '系统日志', icon: 'Document', color: '#ff85c0', bgColor: '#fff0f6', path: '/monitor/operlog' },
]);

const handleNav = (item: any) => {
  if (item.path) {
    router.push(item.path);
  }
};
</script>
<style scoped>
.grid { display: grid; }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.gap-2 { gap: 0.5rem; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.p-3 { padding: 0.75rem; }
.mb-2 { margin-bottom: 0.5rem; }
.w-10 { width: 2.5rem; }
.h-10 { height: 2.5rem; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-gray-600 { color: #4b5563; }
.cursor-pointer { cursor: pointer; }
.hover\:bg-gray-50:hover { background-color: #f9fafb; }
.rounded-lg { border-radius: 0.5rem; }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.duration-300 { transition-duration: 300ms; }
.group:hover .group-hover\:scale-110 { transform: scale(1.1); }
.group:hover .group-hover\:text-gray-900 { color: #111827; }
.mb-4 { margin-bottom: 1rem; }
.border-none { border: none; }
.font-bold { font-weight: 700; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
</style>

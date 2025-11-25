<template>
  <el-card shadow="hover" class="mb-4 border-none">
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-bold text-base">最新动态</span>
        <el-link type="primary" :underline="false">更多</el-link>
      </div>
    </template>
    <div class="dynamic-list">
      <div v-for="(item, index) in activities" :key="index" class="flex items-start py-3 border-b border-gray-100 last:border-0">
        <el-avatar :size="32" :src="item.avatar" class="mr-3 flex-shrink-0" />
        <div class="flex-1">
          <div class="text-sm mb-1">
            <span class="font-medium text-gray-800 mr-2">{{ item.user }}</span>
            <span class="text-gray-500">{{ item.action }}</span>
            <span class="text-blue-500 ml-2 cursor-pointer hover:underline">{{ item.target }}</span>
          </div>
          <div class="text-xs text-gray-400">{{ item.time }}</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activities = ref([
  {
    user: '超级管理员',
    action: '发布了',
    target: 'RuoYi-Vue-Plus v5.5.1 版本',
    time: '5分钟前',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
  },
  {
    user: '开发人员',
    action: '更新了',
    target: '系统配置模块',
    time: '15分钟前',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/cnrhVkzwxjPwAaCfPbdc.png'
  },
  {
    user: '测试人员',
    action: '提交了',
    target: 'Bug #1024 修复验证',
    time: '1小时前',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/gaOngJwsRYRaVAuXXcmB.png'
  },
  {
    user: '产品经理',
    action: '创建了',
    target: '新功能需求文档',
    time: '2小时前',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ubnKSIfAJTxIgXOKlgyN.png'
  },
  {
    user: '超级管理员',
    action: '邀请了',
    target: '新成员 加入团队',
    time: '3小时前',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WhxKECPNujWoWEFNdnJE.png'
  },
  {
    user: '运维人员',
    action: '完成了',
    target: '服务器例行维护',
    time: '5小时前',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/jZUIxmJycoymBprLOUbT.png'
  }
]);
</script>

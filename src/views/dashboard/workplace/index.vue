<template>
  <div class="app-container workplace">
    <el-row :gutter="16">
      <!-- 左侧主体 -->
      <el-col :lg="18" :sm="24" :xs="24">
        <!-- 快捷导航 (包含最近访问和自定义入口) -->
        <QuickAccess />

        <!-- 费用信息 (模拟图片中的下方内容) -->
        <div class="bg-white rounded-lg p-6 shadow-sm h-64 flex items-center justify-center text-gray-400">费用信息模块 (开发中...)</div>
      </el-col>

      <!-- 右侧侧边栏 -->
      <el-col :lg="6" :sm="24" :xs="24">
        <!-- 用户信息卡片 & 访问控制 -->
        <UserInfoCard />
        <!-- 公告/交流群 -->
        <Announcement />
        <!-- 帮助文档 -->
        <HelpDoc />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" name="Workplace" setup>
import QuickAccess from '../components/QuickAccess.vue';
import UserInfoCard from '../components/UserInfoCard.vue';
import Announcement from '../components/Announcement.vue';
import HelpDoc from '../components/HelpDoc.vue';
</script>

<style lang="scss" scoped>
.workplace {
  padding: 16px;
  background-color: #f5f7f9;
  min-height: calc(100vh - 84px);

  .app-container {
    padding: 0;
  }
}
</style>

<template>
  <div class="app-container workplace">
    <el-row :gutter="16">
      <el-col :lg="18" :sm="24" :xs="24">
        <QuickAccess />
        <DailyCheckInCard />
      </el-col>

      <el-col :lg="6" :sm="24" :xs="24">
        <UserInfoCard />
        <Announcement />
        <HelpDoc />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" name="Workplace" setup>
import QuickAccess from '../components/QuickAccess.vue';
import DailyCheckInCard from '../components/DailyCheckInCard.vue';
import UserInfoCard from '../components/UserInfoCard.vue';
import Announcement from '../components/Announcement.vue';
import HelpDoc from '../components/HelpDoc.vue';
</script>

<style lang="scss" scoped>
.workplace {
  padding: 16px;
  min-height: calc(100vh - 84px);
  background-color: #f5f7f9;

  .app-container {
    padding: 0;
  }
}
</style>

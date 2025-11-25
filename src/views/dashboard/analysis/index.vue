<template>
  <div class="app-container analysis">
    <!-- 顶部数据总览 -->
    <DataOverview />

    <el-row :gutter="20" class="mt-4">
       <!-- 左侧地理位置 -->
       <el-col :xs="24" :lg="16" class="mb-4 lg:mb-0">
         <GeoMap />
       </el-col>
       
       <!-- 右侧终端/浏览器分布 -->
       <el-col :xs="24" :lg="8">
         <TerminalDistribution />
       </el-col>
    </el-row>
  </div>
</template>

<script setup name="Analysis" lang="ts">
import DataOverview from '../components/DataOverview.vue';
import GeoMap from '../components/GeoMap.vue';
import TerminalDistribution from '../components/TerminalDistribution.vue';
</script>

<style scoped lang="scss">
.analysis {
  padding: 20px;
  background-color: #f5f7f9;
  min-height: calc(100vh - 84px);
  
  .app-container {
      padding: 0;
  }
}
</style>

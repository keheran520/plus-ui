<template>
  <el-row :gutter="20">
    <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in cardData" :key="index" class="mb-4">
      <el-card shadow="hover" class="card-panel cursor-pointer" :body-style="{ padding: '20px' }">
        <div class="flex justify-between items-start">
          <div class="card-content">
            <div class="text-gray-500 text-sm mb-2">{{ item.title }}</div>
            <div class="text-2xl font-bold mb-2">{{ item.value }}</div>
            <div class="flex items-center text-xs">
              <span class="text-gray-500 mr-1">较上周</span>
              <span :class="item.trend === 'up' ? 'text-green-500' : 'text-red-500'">
                {{ item.rate }}% <el-icon><component :is="item.trend === 'up' ? 'CaretTop' : 'CaretBottom'" /></el-icon>
              </span>
            </div>
          </div>
          <div class="card-icon p-3 rounded-lg flex items-center justify-center" :class="item.iconBgClass" style="width: 48px; height: 48px;">
            <el-icon :size="24" :color="item.iconColor"><component :is="item.icon" /></el-icon>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { User, View, Money, Goods, CaretTop, CaretBottom } from '@element-plus/icons-vue';

const cardData = ref([
  { title: '总访问量', value: '126,560', rate: '12', trend: 'up', icon: 'View', iconColor: '#409EFF', iconBgClass: 'bg-blue-50' },
  { title: '销售额', value: '￥88,450', rate: '5', trend: 'down', icon: 'Money', iconColor: '#67C23A', iconBgClass: 'bg-green-50' },
  { title: '订单量', value: '5,210', rate: '18', trend: 'up', icon: 'Goods', iconColor: '#E6A23C', iconBgClass: 'bg-orange-50' },
  { title: '新增用户', value: '356', rate: '8', trend: 'up', icon: 'User', iconColor: '#F56C6C', iconBgClass: 'bg-red-50' },
]);
</script>

<style scoped>
.card-panel {
  transition: all 0.3s;
}
.card-panel:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.bg-blue-50 { background-color: #ecf5ff; }
.bg-green-50 { background-color: #f0f9eb; }
.bg-orange-50 { background-color: #fdf6ec; }
.bg-red-50 { background-color: #fef0f0; }
.text-green-500 { color: #67C23A; }
.text-red-500 { color: #F56C6C; }
</style>

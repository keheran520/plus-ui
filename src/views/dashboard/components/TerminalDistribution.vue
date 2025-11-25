<template>
  <div class="flex flex-col gap-4 h-full">
    <el-card shadow="hover" class="border-none flex-1">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold text-base">终端</span>
        </div>
      </template>
      <div class="flex items-center">
        <div ref="terminalChartRef" style="width: 140px; height: 140px;"></div>
        <div class="flex-1 ml-4">
           <div v-for="(item, index) in terminalData" :key="index" class="flex justify-between items-center mb-2 text-sm">
              <div class="flex items-center">
                 <span class="w-2 h-2 rounded-full mr-2" :style="{ backgroundColor: item.color }"></span>
                 <span class="text-gray-600">{{ item.name }}</span>
              </div>
              <span class="text-gray-500">{{ item.value }}%</span>
           </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="border-none flex-1">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold text-base">浏览器</span>
        </div>
      </template>
      <div class="flex items-center">
        <div ref="browserChartRef" style="width: 140px; height: 140px;"></div>
        <div class="flex-1 ml-4">
           <div v-for="(item, index) in browserData" :key="index" class="flex justify-between items-center mb-2 text-sm">
              <div class="flex items-center">
                 <span class="w-2 h-2 rounded-full mr-2" :style="{ backgroundColor: item.color }"></span>
                 <span class="text-gray-600">{{ item.name }}</span>
              </div>
              <span class="text-gray-500">{{ item.value }}%</span>
           </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { getDashboardStatistics } from '@/api/dashboard';

const terminalData = ref<any[]>([]);
const browserData = ref<any[]>([]);

// 获取终端和浏览器分布数据
const fetchData = async () => {
  try {
    const res = await getDashboardStatistics();
    if (res && res.data) {
      terminalData.value = res.data.terminalDistribution || [];
      browserData.value = res.data.browserDistribution || [];
      nextTick(() => {
        initCharts();
      });
    }
  } catch (error) {
    console.error('获取终端/浏览器数据失败：', error);
  }
};

const terminalChartRef = ref<HTMLElement | null>(null);
const browserChartRef = ref<HTMLElement | null>(null);
let terminalChart: echarts.ECharts | null = null;
let browserChart: echarts.ECharts | null = null;

const initCharts = () => {
  if (terminalChartRef.value && terminalData.value.length > 0) {
    if (terminalChart) {
      terminalChart.dispose();
    }
    terminalChart = echarts.init(terminalChartRef.value);
    terminalChart.setOption({
      series: [{
        type: 'pie',
        radius: ['60%', '85%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: terminalData.value.map(item => ({ value: item.value, name: item.name, itemStyle: { color: item.color } }))
      }]
    });
  }

  if (browserChartRef.value && browserData.value.length > 0) {
    if (browserChart) {
      browserChart.dispose();
    }
    browserChart = echarts.init(browserChartRef.value);
    browserChart.setOption({
      series: [{
        type: 'pie',
        radius: ['60%', '85%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: browserData.value.map(item => ({ value: item.value, name: item.name, itemStyle: { color: item.color } }))
      }]
    });
  }
};

const resizeCharts = () => {
  terminalChart?.resize();
  browserChart?.resize();
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  terminalChart?.dispose();
  browserChart?.dispose();
});
</script>

<style scoped>
.flex { display: flex; }
.flex-col { flex-direction: column; }
.gap-4 { gap: 1rem; }
.h-full { height: 100%; }
.flex-1 { flex: 1 1 0%; }
.border-none { border: none; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.font-bold { font-weight: 700; }
.text-base { font-size: 1rem; }
.ml-4 { margin-left: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.text-sm { font-size: 0.875rem; }
.w-2 { width: 0.5rem; }
.h-2 { height: 0.5rem; }
.rounded-full { border-radius: 9999px; }
.mr-2 { margin-right: 0.5rem; }
.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
</style>

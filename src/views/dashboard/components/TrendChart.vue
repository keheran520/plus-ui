<template>
  <el-card shadow="hover" class="mb-4">
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-bold">流量趋势</span>
        <el-radio-group v-model="timeRange" size="small">
          <el-radio-button label="week" value="week">本周</el-radio-button>
          <el-radio-button label="month" value="month">本月</el-radio-button>
          <el-radio-button label="year" value="year">全年</el-radio-button>
        </el-radio-group>
      </div>
    </template>
    <div ref="chartRef" style="height: 350px; width: 100%;"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref<HTMLElement | null>(null);
const timeRange = ref('week');
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  setOptions();
  window.addEventListener('resize', resizeChart);
};

const setOptions = () => {
  if (!chartInstance) return;
  
  const xData = timeRange.value === 'week' 
    ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
  const seriesData = timeRange.value === 'week'
    ? [120, 132, 101, 134, 90, 230, 210]
    : [820, 932, 901, 934, 1290, 1330, 1320, 1200, 1100, 1000, 900, 800];

  chartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: { lineStyle: { color: '#909399' } }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#909399' } },
      splitLine: { lineStyle: { type: 'dashed', color: '#E4E7ED' } }
    },
    series: [
      {
        name: '访问量',
        type: 'bar',
        barWidth: '40%',
        data: seriesData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#ecf5ff' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '趋势',
        type: 'line',
        data: seriesData.map(v => v * 0.8),
        smooth: true,
        itemStyle: { color: '#67C23A' }
      }
    ]
  });
};

const resizeChart = () => {
  chartInstance?.resize();
};

watch(timeRange, () => {
  setOptions();
});

onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
  chartInstance?.dispose();
});
</script>

<template>
  <el-row :gutter="20" class="mb-4">
    <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in cardData" :key="index" class="mb-4 md:mb-0">
      <el-card shadow="hover" class="border-none">
        <div class="flex flex-col h-full">
          <div class="text-gray-500 text-sm mb-2">{{ item.title }}</div>
          <div class="text-2xl font-bold mb-4">{{ item.value }}</div>
          <div class="flex items-end justify-between flex-1">
             <div class="flex items-center text-xs">
              <span class="text-gray-400 mr-1">{{ item.label }}</span>
              <span :class="item.trend === 'up' ? 'text-green-500' : 'text-red-500'">
                {{ item.rate }} <el-icon><component :is="item.trend === 'up' ? 'CaretTop' : 'CaretBottom'" /></el-icon>
              </span>
            </div>
            <div :ref="(el) => setChartRef(el, index)" style="width: 100px; height: 40px;"></div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { CaretTop, CaretBottom } from '@element-plus/icons-vue';
import { getDashboardStatistics } from '@/api/dashboard';

const cardData = ref([
  { title: '总用户数', value: '0', label: '加载中...', rate: '', trend: 'up', type: 'line', color: '#409EFF', chartData: [] },
  { title: '今日访问量', value: '0', label: '加载中...', rate: '', trend: 'up', type: 'line', color: '#67C23A', chartData: [] },
  { title: '消息通知', value: '0', label: '加载中...', rate: '', trend: 'up', type: 'bar', color: '#E6A23C', chartData: [] },
  { title: '在线用户', value: '0', label: '加载中...', rate: '', trend: 'up', type: 'pie', color: '#B37FEB', chartData: [] },
]);

// 获取统计数据
const fetchData = async () => {
  try {
    const res = await getDashboardStatistics();
    if (res && res.data) {
      const overview = res.data.dataOverview;
      cardData.value = [
        overview.totalUsers,
        overview.todayVisits,
        overview.messageCount,
        overview.onlineUsers
      ];
      // 数据加载完成后重新初始化图表
      nextTick(() => {
        initCharts();
      });
    }
  } catch (error) {
    console.error('获取统计数据失败：', error);
  }
};

const chartRefs = ref<HTMLElement[]>([]);
const chartInstances: echarts.ECharts[] = [];

const setChartRef = (el: any, index: number) => {
  if (el) {
    chartRefs.value[index] = el;
  }
};

const initCharts = () => {
  // 清除旧的图表实例
  chartInstances.forEach(chart => chart.dispose());
  chartInstances.length = 0;
  
  chartRefs.value.forEach((el, index) => {
    if (!el) return;
    const chart = echarts.init(el);
    const item = cardData.value[index];
    
    let option: any = {};
    const data = item.chartData || [];
    
    if (item.type === 'line') {
       option = {
         grid: { top: 0, bottom: 0, left: 0, right: 0 },
         xAxis: { show: false, data: data.map((_, i) => i + 1) },
         yAxis: { show: false },
         series: [{
           type: 'line',
           smooth: true,
           showSymbol: false,
           data: data,
           itemStyle: { color: item.color },
           areaStyle: {
             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
               { offset: 0, color: item.color },
               { offset: 1, color: '#fff' }
             ]),
             opacity: 0.2
           }
         }]
       };
    } else if (item.type === 'bar') {
       option = {
         grid: { top: 0, bottom: 0, left: 0, right: 0 },
         xAxis: { show: false, data: data.map((_, i) => i + 1) },
         yAxis: { show: false },
         series: [{
           type: 'bar',
           data: data,
           itemStyle: { color: item.color, borderRadius: [2, 2, 0, 0] },
           barWidth: 6
         }]
       };
    } else if (item.type === 'pie') {
        const pieData = data.length >= 2 ? data : [70, 30];
        option = {
            series: [{
                type: 'pie',
                radius: ['60%', '90%'],
                label: { show: false },
                data: [
                    { value: pieData[0], itemStyle: { color: item.color } },
                    { value: pieData[1], itemStyle: { color: '#f0f0f0' } }
                ]
            }]
        };
    }

    chart.setOption(option);
    chartInstances.push(chart);
  });
};

const resizeCharts = () => {
  chartInstances.forEach(chart => chart.resize());
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  chartInstances.forEach(chart => chart.dispose());
});
</script>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.border-none { border: none; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.justify-between { justify-content: space-between; }
.h-full { height: 100%; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.font-bold { font-weight: 700; }
.text-green-500 { color: #67C23A; }
.text-red-500 { color: #F56C6C; }
.flex-1 { flex: 1 1 0%; }
.mr-1 { margin-right: 0.25rem; }
</style>

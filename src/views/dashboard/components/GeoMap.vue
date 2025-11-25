<template>
  <el-card class="border-none h-full" shadow="hover">
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-bold text-base">地理位置</span>
        <div class="flex">
          <el-tag class="mr-2 cursor-pointer" size="small">中国</el-tag>
        </div>
      </div>
    </template>
    <el-row :gutter="20">
      <el-col :md="16" :xs="24" class="mb-4 md:mb-0">
        <div ref="mapChartRef" style="width: 100%; height: 400px"></div>
      </el-col>
      <el-col :md="8" :xs="24">
        <div class="ranking-list">
          <div v-for="(item, index) in rankData" :key="index" class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div class="flex items-center">
              <span :class="index < 3 ? 'text-blue-500' : 'text-gray-500'" class="w-6 text-center mr-2 font-bold">{{ index + 1 }}</span>
              <span class="text-sm text-gray-700">{{ item.name }}</span>
            </div>
            <span class="text-sm text-gray-500">{{ item.value }}</span>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import * as echarts from 'echarts';
import { getDashboardStatistics } from '@/api/dashboard';
import { registerChinaMap } from '@/assets/map/china';

const rankData = ref<any[]>([]);
const mapData = ref<any[]>([]);
const mapRegistered = ref(false);

const mapChartRef = ref<HTMLElement | null>(null);
let mapChart: echarts.ECharts | null = null;

// 获取地域分布数据
const fetchData = async () => {
  try {
    // 注册中国地图（只需注册一次）
    if (!mapRegistered.value) {
      mapRegistered.value = await registerChinaMap(echarts);
    }

    const res = await getDashboardStatistics();
    if (res && res.data && res.data.geoDistribution) {
      rankData.value = res.data.geoDistribution.rankData;
      mapData.value = res.data.geoDistribution.mapData;
      nextTick(() => {
        initChart();
      });
    }
  } catch (error) {
    console.error('获取地域数据失败：', error);
  }
};

const initChart = () => {
  if (!mapChartRef.value) return;

  if (mapChart) {
    mapChart.dispose();
  }
  mapChart = echarts.init(mapChartRef.value);

  // 根据地图注册状态选择渲染方式
  if (mapRegistered.value && mapData.value.length > 0) {
    // 渲染中国地图
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.seriesType === 'effectScatter') {
            return `${params.name}<br/>访问量: ${params.value[2]}`;
          }
          return params.name;
        }
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        label: { show: false },
        itemStyle: {
          areaColor: '#eef2f8',
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: { areaColor: '#d4e4f7' },
          label: { show: true, color: '#333' }
        }
      },
      series: [
        {
          name: '用户分布',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: mapData.value.map((item) => ({
            name: item.name,
            value: [item.longitude, item.latitude, item.value]
          })),
          symbolSize: function (val: any) {
            return Math.max(10, val[2] / 100);
          },
          showEffectOn: 'render',
          rippleEffect: { brushType: 'stroke' },
          label: {
            formatter: '{b}',
            position: 'right',
            show: false
          },
          itemStyle: {
            color: '#409EFF',
            shadowBlur: 10,
            shadowColor: '#409EFF'
          },
          emphasis: {
            label: { show: true }
          }
        }
      ]
    };

    try {
      mapChart.setOption(option);
    } catch (e) {
      console.warn('地图渲染失败，使用柱状图:', e);
      renderBarChart();
    }
  } else {
    // 地图未注册或无数据，渲染横向柱状图
    renderBarChart();
  }
};

// 渲染横向柱状图（兜底方案）
const renderBarChart = () => {
  if (!mapChart || rankData.value.length === 0) return;

  mapChart.setOption({
    title: {
      text: '用户地域分布',
      left: 'center',
      textStyle: { fontSize: 14, color: '#666' }
    },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: rankData.value.map((i) => i.name).reverse()
    },
    series: [
      {
        type: 'bar',
        data: rankData.value.map((i) => parseInt(i.value.replace(/,/g, ''))).reverse(),
        itemStyle: { color: '#409EFF', borderRadius: [0, 4, 4, 0] },
        barWidth: 20
      }
    ]
  });
};

const resizeChart = () => {
  mapChart?.resize();
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
  mapChart?.dispose();
});
</script>

<style scoped>
.border-none {
  border: none;
}

.h-full {
  height: 100%;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.font-bold {
  font-weight: 700;
}

.text-base {
  font-size: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.cursor-pointer {
  cursor: pointer;
}

.ranking-list {
  padding-top: 1rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.border-b {
  border-bottom-width: 1px;
}

.border-gray-100 {
  border-color: #f3f4f6;
}

.last\:border-0:last-child {
  border-width: 0;
}

.w-6 {
  width: 1.5rem;
}

.text-center {
  text-align: center;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-700 {
  color: #374151;
}

.text-sm {
  font-size: 0.875rem;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>

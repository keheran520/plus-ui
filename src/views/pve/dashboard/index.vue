<template>
  <div class="pve-dashboard">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :lg="6" :md="12" :sm="12" :xs="24">
        <div class="stat-card gradient-blue">
          <div class="stat-icon">
            <el-icon :size="40"><Monitor /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.totalNodes }}</div>
            <div class="stat-label">PVE节点总数</div>
            <div class="stat-trend">
              <span :class="['trend-value', statistics.nodesTrend >= 0 ? 'up' : 'down']">
                <el-icon><CaretTop v-if="statistics.nodesTrend >= 0" /><CaretBottom v-else /></el-icon>
                {{ Math.abs(statistics.nodesTrend) }}%
              </span>
              <span class="trend-label">较上周</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :lg="6" :md="12" :sm="12" :xs="24">
        <div class="stat-card gradient-green">
          <div class="stat-icon">
            <el-icon :size="40"><Cpu /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.totalVMs }}</div>
            <div class="stat-label">虚拟机总数</div>
            <div class="stat-trend">
              <span :class="['trend-value', statistics.vmsTrend >= 0 ? 'up' : 'down']">
                <el-icon><CaretTop v-if="statistics.vmsTrend >= 0" /><CaretBottom v-else /></el-icon>
                {{ Math.abs(statistics.vmsTrend) }}%
              </span>
              <span class="trend-label">较上周</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :lg="6" :md="12" :sm="12" :xs="24">
        <div class="stat-card gradient-orange">
          <div class="stat-icon">
            <el-icon :size="40"><Connection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.totalIkuai }}</div>
            <div class="stat-label">iKuai路由器</div>
            <div class="stat-trend">
              <span :class="['trend-value', statistics.ikuaiTrend >= 0 ? 'up' : 'down']">
                <el-icon><CaretTop v-if="statistics.ikuaiTrend >= 0" /><CaretBottom v-else /></el-icon>
                {{ Math.abs(statistics.ikuaiTrend) }}%
              </span>
              <span class="trend-label">较上周</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :lg="6" :md="12" :sm="12" :xs="24">
        <div class="stat-card gradient-purple">
          <div class="stat-icon">
            <el-icon :size="40"><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.totalAlerts }}</div>
            <div class="stat-label">告警信息</div>
            <div class="stat-trend">
              <span :class="['trend-value', statistics.alertsTrend <= 0 ? 'up' : 'down']">
                <el-icon><CaretTop v-if="statistics.alertsTrend <= 0" /><CaretBottom v-else /></el-icon>
                {{ Math.abs(statistics.alertsTrend) }}%
              </span>
              <span class="trend-label">较上周</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 健康状态监控 -->
    <el-row :gutter="20" class="health-row">
      <!-- PVE集群健康状态 -->
      <el-col :lg="12" :md="24" :xs="24">
        <el-card class="health-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Platform /></el-icon>
                PVE集群健康状态
              </span>
              <el-button link type="primary" @click="refreshClusterHealth">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>

          <div class="health-content">
            <div v-for="cluster in clusterHealth" :key="cluster.id" class="health-item">
              <div class="health-info">
                <div class="health-name">
                  <el-icon :size="20"><Server /></el-icon>
                  {{ cluster.name }}
                </div>
                <div class="health-details">
                  <span class="detail-item">节点: {{ cluster.nodes }}</span>
                  <span class="detail-item">CPU: {{ cluster.cpuUsage }}%</span>
                  <span class="detail-item">内存: {{ cluster.memoryUsage }}%</span>
                </div>
              </div>
              <div class="health-status">
                <el-progress :percentage="cluster.healthScore" :status="getHealthStatus(cluster.healthScore)" :stroke-width="12" />
                <span :class="['health-score', getHealthClass(cluster.healthScore)]"> {{ cluster.healthScore }}分 </span>
              </div>
            </div>

            <el-empty v-if="clusterHealth.length === 0" description="暂无集群数据" />
          </div>
        </el-card>
      </el-col>

      <!-- iKuai路由器状态 -->
      <el-col :lg="12" :md="24" :xs="24">
        <el-card class="health-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Connection /></el-icon>
                iKuai路由器状态
              </span>
              <el-button link type="primary" @click="refreshIkuaiHealth">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>

          <div class="health-content">
            <div v-for="ikuai in ikuaiHealth" :key="ikuai.id" class="health-item">
              <div class="health-info">
                <div class="health-name">
                  <el-icon :size="20"><Link /></el-icon>
                  {{ ikuai.name }}
                </div>
                <div class="health-details">
                  <span class="detail-item">IP: {{ ikuai.ip }}</span>
                  <span class="detail-item">在线: {{ ikuai.onlineDevices }}</span>
                  <span class="detail-item">流量: {{ ikuai.bandwidth }}</span>
                </div>
              </div>
              <div class="health-status">
                <el-tag :type="ikuai.status === 'online' ? 'success' : 'danger'" effect="dark" size="large">
                  {{ ikuai.status === 'online' ? '在线' : '离线' }}
                </el-tag>
                <span class="health-uptime">运行: {{ ikuai.uptime }}</span>
              </div>
            </div>

            <el-empty v-if="ikuaiHealth.length === 0" description="暂无路由器数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- PVE节点详细状态 -->
    <el-row :gutter="20" class="nodes-row">
      <el-col :span="24">
        <el-card class="nodes-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Monitor /></el-icon>
                PVE节点监控
              </span>
              <div class="card-actions">
                <el-radio-group v-model="nodeViewMode" size="small">
                  <el-radio-button label="grid">网格视图</el-radio-button>
                  <el-radio-button label="list">列表视图</el-radio-button>
                </el-radio-group>
                <el-button link type="primary" @click="refreshNodes">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </div>
          </template>

          <!-- 网格视图 -->
          <div v-if="nodeViewMode === 'grid'" class="nodes-grid">
            <div v-for="node in nodesList" :key="node.id" class="node-card">
              <div class="node-header">
                <div class="node-title">
                  <el-icon :size="24"><Server /></el-icon>
                  <span class="node-name">{{ node.name }}</span>
                </div>
                <el-tag :type="node.status === 'online' ? 'success' : 'danger'" effect="plain" size="small">
                  {{ node.status === 'online' ? '在线' : '离线' }}
                </el-tag>
              </div>

              <div class="node-body">
                <div class="resource-item">
                  <div class="resource-label">
                    <el-icon><Cpu /></el-icon>
                    CPU使用率
                  </div>
                  <el-progress :percentage="node.cpuUsage" :stroke-width="8" />
                </div>

                <div class="resource-item">
                  <div class="resource-label">
                    <el-icon><Memo /></el-icon>
                    内存使用率
                  </div>
                  <el-progress :percentage="node.memoryUsage" :stroke-width="8" />
                </div>

                <div class="resource-item">
                  <div class="resource-label">
                    <el-icon><Coin /></el-icon>
                    存储使用率
                  </div>
                  <el-progress :percentage="node.storageUsage" :stroke-width="8" />
                </div>
              </div>

              <div class="node-footer">
                <span class="node-info">虚拟机: {{ node.vmCount }}</span>
                <span class="node-info">运行时间: {{ node.uptime }}</span>
              </div>
            </div>

            <el-empty v-if="nodesList.length === 0" description="暂无节点数据" />
          </div>

          <!-- 列表视图 -->
          <div v-else class="nodes-list">
            <el-table :data="nodesList" border stripe>
              <el-table-column label="节点名称" prop="name" width="180">
                <template #default="{ row }">
                  <div class="node-name-cell">
                    <el-icon><Server /></el-icon>
                    <span>{{ row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="状态" prop="status" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'online' ? 'success' : 'danger'" effect="plain" size="small">
                    {{ row.status === 'online' ? '在线' : '离线' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="CPU使用率" prop="cpuUsage" width="150">
                <template #default="{ row }">
                  <el-progress :percentage="row.cpuUsage" :stroke-width="6" />
                </template>
              </el-table-column>
              <el-table-column label="内存使用率" prop="memoryUsage" width="150">
                <template #default="{ row }">
                  <el-progress :percentage="row.memoryUsage" :stroke-width="6" />
                </template>
              </el-table-column>
              <el-table-column label="存储使用率" prop="storageUsage" width="150">
                <template #default="{ row }">
                  <el-progress :percentage="row.storageUsage" :stroke-width="6" />
                </template>
              </el-table-column>
              <el-table-column label="虚拟机" prop="vmCount" width="100" />
              <el-table-column label="运行时间" prop="uptime" width="150" />
              <el-table-column label="IP地址" prop="ip" />
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 资源使用趋势图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :lg="12" :md="24" :xs="24">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><TrendCharts /></el-icon>
                CPU使用趋势
              </span>
              <el-select v-model="cpuChartRange" size="small" style="width: 120px">
                <el-option label="最近1小时" value="1h" />
                <el-option label="最近6小时" value="6h" />
                <el-option label="最近24小时" value="24h" />
                <el-option label="最近7天" value="7d" />
              </el-select>
            </div>
          </template>
          <div ref="cpuChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :lg="12" :md="24" :xs="24">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><TrendCharts /></el-icon>
                内存使用趋势
              </span>
              <el-select v-model="memoryChartRange" size="small" style="width: 120px">
                <el-option label="最近1小时" value="1h" />
                <el-option label="最近6小时" value="6h" />
                <el-option label="最近24小时" value="24h" />
                <el-option label="最近7天" value="7d" />
              </el-select>
            </div>
          </template>
          <div ref="memoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 告警信息 -->
    <el-row :gutter="20" class="alerts-row">
      <el-col :span="24">
        <el-card class="alerts-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Bell /></el-icon>
                告警信息
              </span>
              <div class="card-actions">
                <el-radio-group v-model="alertLevel" size="small">
                  <el-radio-button label="all">全部</el-radio-button>
                  <el-radio-button label="critical">严重</el-radio-button>
                  <el-radio-button label="warning">警告</el-radio-button>
                  <el-radio-button label="info">信息</el-radio-button>
                </el-radio-group>
                <el-button link type="primary" @click="clearAlerts">
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
              </div>
            </div>
          </template>

          <div class="alerts-content">
            <el-timeline>
              <el-timeline-item
                v-for="alert in filteredAlerts"
                :key="alert.id"
                :color="getAlertColor(alert.level)"
                :icon="getAlertIcon(alert.level)"
                :timestamp="alert.time"
              >
                <div class="alert-item">
                  <div class="alert-header">
                    <el-tag :type="getAlertType(alert.level)" effect="dark" size="small">
                      {{ alert.levelText }}
                    </el-tag>
                    <span class="alert-source">{{ alert.source }}</span>
                  </div>
                  <div class="alert-content">{{ alert.message }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>

            <el-empty v-if="filteredAlerts.length === 0" description="暂无告警信息" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" name="PveDashboard" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import {
  Bell,
  CaretBottom,
  CaretTop,
  Coin,
  Connection,
  Cpu,
  Delete,
  Link,
  Memo,
  Monitor,
  Platform,
  Refresh,
  TrendCharts,
  Warning
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import {
  clearAllAlerts,
  type ClusterHealth,
  type DashboardAlert,
  type DashboardNode,
  type DashboardStatistics,
  getClusterHealth,
  getCpuTrend,
  getDashboardAlerts,
  getDashboardNodes,
  getDashboardStatistics,
  getIkuaiHealth,
  getMemoryTrend,
  type IkuaiHealth
} from '@/api/pve/dashboard';

// 统计数据
const statistics = ref<DashboardStatistics>({
  totalNodes: 0,
  nodesTrend: 0,
  totalVMs: 0,
  vmsTrend: 0,
  totalIkuai: 0,
  ikuaiTrend: 0,
  totalAlerts: 0,
  alertsTrend: 0
});

// 集群健康状态
const clusterHealth = ref<ClusterHealth[]>([]);

// iKuai健康状态
const ikuaiHealth = ref<IkuaiHealth[]>([]);

// 节点列表
const nodeViewMode = ref('grid');
const nodesList = ref<DashboardNode[]>([]);

// 图表相关
const cpuChartRef = ref<HTMLElement>();
const memoryChartRef = ref<HTMLElement>();
const cpuChartRange = ref('24h');
const memoryChartRange = ref('24h');
let cpuChart: echarts.ECharts | null = null;
let memoryChart: echarts.ECharts | null = null;

// 告警信息
const alertLevel = ref('all');
const alertsList = ref<DashboardAlert[]>([]);

// 过滤后的告警
const filteredAlerts = computed(() => {
  if (alertLevel.value === 'all') {
    return alertsList.value;
  }
  return alertsList.value.filter((alert) => alert.level === alertLevel.value);
});

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getDashboardStatistics();
    statistics.value = res.data;
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
};

// 加载集群健康状态
const loadClusterHealth = async () => {
  try {
    const res = await getClusterHealth();
    clusterHealth.value = res.data;
  } catch (error) {
    console.error('加载集群健康状态失败:', error);
  }
};

// 加载iKuai健康状态
const loadIkuaiHealth = async () => {
  try {
    const res = await getIkuaiHealth();
    ikuaiHealth.value = res.data;
  } catch (error) {
    console.error('加载iKuai健康状态失败:', error);
  }
};

// 加载节点列表
const loadNodes = async () => {
  try {
    const res = await getDashboardNodes();
    nodesList.value = res.data;
  } catch (error) {
    console.error('加载节点列表失败:', error);
  }
};

// 加载告警列表
const loadAlerts = async () => {
  try {
    const res = await getDashboardAlerts();
    alertsList.value = res.data;
  } catch (error) {
    console.error('加载告警列表失败:', error);
  }
};

// 获取健康状态
const getHealthStatus = (score: number) => {
  if (score >= 90) return 'success';
  if (score >= 70) return 'warning';
  return 'exception';
};

const getHealthClass = (score: number) => {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  return 'poor';
};

// 获取告警颜色
const getAlertColor = (level: string) => {
  const colors: Record<string, string> = {
    critical: '#f56c6c',
    warning: '#e6a23c',
    info: '#409eff'
  };
  return colors[level] || '#909399';
};

// 获取告警图标
const getAlertIcon = (level: string) => {
  return level === 'critical' ? Warning : level === 'warning' ? Bell : Monitor;
};

// 获取告警类型
const getAlertType = (level: string) => {
  const types: Record<string, any> = {
    critical: 'danger',
    warning: 'warning',
    info: 'info'
  };
  return types[level] || 'info';
};

// 初始化CPU图表
const initCpuChart = async () => {
  if (!cpuChartRef.value) return;

  cpuChart = echarts.init(cpuChartRef.value);

  try {
    const res = await getCpuTrend(cpuChartRange.value);
    const chartData = res.data;

    const series = Object.entries(chartData.seriesData).map(([name, data], index) => ({
      name,
      type: 'line',
      smooth: true,
      data,
      itemStyle: {
        color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c'][index % 4]
      }
    }));

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: Object.keys(chartData.seriesData)
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData.xAxisData
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series
    };

    cpuChart.setOption(option);
  } catch (error) {
    console.error('加载CPU趋势数据失败:', error);
  }
};

// 初始化内存图表
const initMemoryChart = async () => {
  if (!memoryChartRef.value) return;

  memoryChart = echarts.init(memoryChartRef.value);

  try {
    const res = await getMemoryTrend(memoryChartRange.value);
    const chartData = res.data;

    const series = Object.entries(chartData.seriesData).map(([name, data], index) => ({
      name,
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.3 },
      data,
      itemStyle: {
        color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c'][index % 4]
      }
    }));

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: Object.keys(chartData.seriesData)
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData.xAxisData
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series
    };

    memoryChart.setOption(option);
  } catch (error) {
    console.error('加载内存趋势数据失败:', error);
  }
};

// 刷新集群健康状态
const refreshClusterHealth = async () => {
  await loadClusterHealth();
  ElMessage.success('集群健康状态已刷新');
};

// 刷新iKuai健康状态
const refreshIkuaiHealth = async () => {
  await loadIkuaiHealth();
  ElMessage.success('iKuai路由器状态已刷新');
};

// 刷新节点列表
const refreshNodes = async () => {
  await loadNodes();
  ElMessage.success('节点列表已刷新');
};

// 清空所有告警
const clearAlerts = async () => {
  try {
    await clearAllAlerts();
    alertsList.value = [];
    ElMessage.success('已清空所有告警信息');
  } catch (error) {
    ElMessage.error('清空告警失败');
  }
};

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  cpuChart?.resize();
  memoryChart?.resize();
};

// 监听图表时间范围变化
watch(cpuChartRange, () => {
  initCpuChart();
});

watch(memoryChartRange, () => {
  initMemoryChart();
});

// 初始化所有数据
const initData = async () => {
  await Promise.all([loadStatistics(), loadClusterHealth(), loadIkuaiHealth(), loadNodes(), loadAlerts()]);
};

onMounted(() => {
  initData();

  nextTick(() => {
    initCpuChart();
    initMemoryChart();
  });

  window.addEventListener('resize', handleResize);

  // 每30秒自动刷新数据
  const interval = setInterval(() => {
    initData();
  }, 30000);

  onUnmounted(() => {
    clearInterval(interval);
  });
});

onUnmounted(() => {
  cpuChart?.dispose();
  memoryChart?.dispose();
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.pve-dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);

  // 统计卡片行
  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
      }

      &.gradient-blue::before {
        background: linear-gradient(90deg, #409eff, #66b1ff);
      }

      &.gradient-green::before {
        background: linear-gradient(90deg, #67c23a, #85ce61);
      }

      &.gradient-orange::before {
        background: linear-gradient(90deg, #e6a23c, #ebb563);
      }

      &.gradient-purple::before {
        background: linear-gradient(90deg, #c471ed, #f64f59);
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      }

      .stat-icon {
        width: 70px;
        height: 70px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.2));
        color: #409eff;
      }

      &.gradient-green .stat-icon {
        background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.2));
        color: #67c23a;
      }

      &.gradient-orange .stat-icon {
        background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(230, 162, 60, 0.2));
        color: #e6a23c;
      }

      &.gradient-purple .stat-icon {
        background: linear-gradient(135deg, rgba(196, 113, 237, 0.1), rgba(196, 113, 237, 0.2));
        color: #c471ed;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #303133;
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 12px;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;

          .trend-value {
            display: flex;
            align-items: center;
            gap: 2px;
            font-weight: 600;

            &.up {
              color: #67c23a;
            }

            &.down {
              color: #f56c6c;
            }
          }

          .trend-label {
            color: #909399;
          }
        }
      }
    }
  }

  // 健康状态行
  .health-row {
    margin-bottom: 20px;

    .health-card {
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .health-content {
        .health-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          margin-bottom: 12px;
          background: #f5f7fa;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:last-child {
            margin-bottom: 0;
          }

          &:hover {
            background: #ecf5ff;
            transform: translateX(4px);
          }

          .health-info {
            flex: 1;

            .health-name {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 15px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 8px;
            }

            .health-details {
              display: flex;
              gap: 16px;
              font-size: 13px;
              color: #606266;

              .detail-item {
                display: flex;
                align-items: center;
                gap: 4px;
              }
            }
          }

          .health-status {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
            min-width: 200px;

            .health-score {
              font-size: 14px;
              font-weight: 600;

              &.excellent {
                color: #67c23a;
              }

              &.good {
                color: #e6a23c;
              }

              &.poor {
                color: #f56c6c;
              }
            }

            .health-uptime {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }

  // 节点监控行
  .nodes-row {
    margin-bottom: 20px;

    .nodes-card {
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }

      .nodes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;

        .node-card {
          background: #f5f7fa;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;

          &:hover {
            background: #ecf5ff;
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .node-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;

            .node-title {
              display: flex;
              align-items: center;
              gap: 8px;

              .node-name {
                font-size: 16px;
                font-weight: 600;
                color: #303133;
              }
            }
          }

          .node-body {
            .resource-item {
              margin-bottom: 16px;

              &:last-child {
                margin-bottom: 0;
              }

              .resource-label {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13px;
                color: #606266;
                margin-bottom: 8px;
              }
            }
          }

          .node-footer {
            display: flex;
            justify-content: space-between;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e4e7ed;

            .node-info {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }

      .nodes-list {
        .node-name-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }
  }

  // 图表行
  .charts-row {
    margin-bottom: 20px;

    .chart-card {
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .chart-container {
        height: 350px;
      }
    }
  }

  // 告警行
  .alerts-row {
    .alerts-card {
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }

      .alerts-content {
        max-height: 500px;
        overflow-y: auto;

        .alert-item {
          .alert-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;

            .alert-source {
              font-size: 13px;
              color: #606266;
              font-weight: 600;
            }
          }

          .alert-content {
            font-size: 14px;
            color: #303133;
            line-height: 1.6;
          }
        }
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .pve-dashboard {
    padding: 12px;

    .stats-row {
      .stat-card {
        flex-direction: column;
        text-align: center;

        .stat-content {
          .stat-trend {
            justify-content: center;
          }
        }
      }
    }

    .nodes-row {
      .nodes-card {
        .nodes-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}
</style>

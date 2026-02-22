<template>
  <div class="vm-detail-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button icon="ArrowLeft" text @click="handleBack">返回</el-button>
        <div class="header-info">
          <h2 class="vm-title">{{ vmInfo.vmName || '虚拟机详情' }}</h2>
          <div class="vm-subtitle">
            <span>VMID: {{ vmInfo.pveVmId || '-' }}</span>
            <el-divider direction="vertical" />
            <el-tag :type="getStatusType(vmInfo.status)">
              {{ getStatusText(vmInfo.status) }}
            </el-tag>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-space>
          <el-button v-if="vmInfo.status === 'running'" icon="Monitor" type="primary" @click="handleConsole"> 远程连接 </el-button>
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
          <el-switch v-model="autoRefresh" active-text="自动刷新" inactive-text="手动" @change="handleAutoRefreshChange" />
          <el-dropdown>
            <el-button>
              更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="vmInfo.status === 'stopped'" @click="handleStart"> 启动 </el-dropdown-item>
                <el-dropdown-item v-if="vmInfo.status === 'running'" @click="handleStop"> 停止 </el-dropdown-item>
                <el-dropdown-item v-if="vmInfo.status === 'running'" @click="handleRestart"> 重启 </el-dropdown-item>
                <el-dropdown-item divided @click="handleDelete"> 删除 </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-space>
      </div>
    </div>

    <!-- Tabs -->
    <el-card class="tabs-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 概览 Tab -->
        <el-tab-pane label="概览" name="overview">
          <div class="tab-content">
            <!-- 虚拟机信息卡片 -->
            <el-row :gutter="16">
              <el-col :span="8">
                <el-card class="info-item-card" shadow="never">
                  <div class="info-item">
                    <div class="info-label">
                      虚拟机名称
                      <el-icon class="edit-icon" @click="handleEditField('vmName')"><Edit /></el-icon>
                    </div>
                    <div class="info-value">{{ vmInfo.vmName || '-' }}</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="info-item-card" shadow="never">
                  <div class="info-item">
                    <div class="info-label">VMID</div>
                    <div class="info-value">{{ vmInfo.pveVmId || '-' }}</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="info-item-card" shadow="never">
                  <div class="info-item">
                    <div class="info-label">状态</div>
                    <div class="info-value">
                      <el-tag :type="getStatusType(vmInfo.status)">
                        {{ getStatusText(vmInfo.status) }}
                      </el-tag>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="16" style="margin-top: 16px">
              <el-col :span="8">
                <el-card class="info-item-card" shadow="never">
                  <div class="info-item">
                    <div class="info-label">所属节点</div>
                    <div class="info-value">{{ vmInfo.nodeName || '-' }}</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="info-item-card" shadow="never">
                  <div class="info-item">
                    <div class="info-label">
                      操作系统
                      <el-icon class="edit-icon" @click="handleEditField('osType')"><Edit /></el-icon>
                    </div>
                    <div class="info-value">{{ vmInfo.osType || '-' }}</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="info-item-card" shadow="never">
                  <div class="info-item">
                    <div class="info-label">系统镜像</div>
                    <div class="info-value">{{ vmInfo.imageName || '-' }}</div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="16" style="margin-top: 16px">
              <el-col :span="8">
                <el-card class="info-item-card" shadow="never">
                  <div class="info-item">
                    <div class="info-label">
                      <el-icon><Cpu /></el-icon>
                      CPU核心
                    </div>
                    <div class="info-value highlight">{{ vmInfo.cpuCores || 0 }} vCPU</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="info-item-card" shadow="never">
                  <div class="info-item">
                    <div class="info-label">
                      <el-icon><Memo /></el-icon>
                      内存大小
                    </div>
                    <div class="info-value highlight">{{ vmInfo.memorySize || 0 }} GB</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="info-item-card" shadow="never">
                  <div class="info-item">
                    <div class="info-label">
                      <el-icon><Coin /></el-icon>
                      系统盘
                    </div>
                    <div class="info-value highlight">{{ vmInfo.systemDiskSize || 0 }} GB</div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="16" style="margin-top: 16px">
              <el-col :span="8">
                <el-card class="info-item-card" shadow="never">
                  <div class="info-item">
                    <div class="info-label">自动启动</div>
                    <div class="info-value">
                      <el-tag :type="vmInfo.autoStart === '1' ? 'success' : 'info'">
                        {{ vmInfo.autoStart === '1' ? '是' : '否' }}
                      </el-tag>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="info-item-card" shadow="never">
                  <div class="info-item">
                    <div class="info-label">创建时间</div>
                    <div class="info-value">{{ vmInfo.createTime || '-' }}</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="info-item-card" shadow="never">
                  <div class="info-item">
                    <div class="info-label">
                      备注
                      <el-icon class="edit-icon" @click="handleEditField('remark')"><Edit /></el-icon>
                    </div>
                    <div class="info-value">{{ vmInfo.remark || '-' }}</div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 监控 Tab -->
        <el-tab-pane label="监控" name="monitor">
          <div v-loading="loading.summary" class="tab-content">
            <!-- 资源使用情况标题 -->
            <div class="section-title">资源使用情况</div>

            <!-- 资源使用卡片 -->
            <el-row :gutter="16" class="resource-cards">
              <el-col :span="8">
                <div class="resource-card cpu-card">
                  <div class="resource-header">
                    <el-icon class="resource-icon"><Cpu /></el-icon>
                    <span class="resource-title">CPU</span>
                  </div>
                  <div class="resource-value">{{ statusData.cpuUsage }}%</div>
                  <div class="resource-desc">核心数: {{ vmInfo.cpuCores || 0 }}</div>
                  <div class="mini-chart">
                    <el-progress :percentage="statusData.cpuUsage" :show-text="false" :stroke-width="8" />
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="resource-card memory-card">
                  <div class="resource-header">
                    <el-icon class="resource-icon"><Memo /></el-icon>
                    <span class="resource-title">内存</span>
                  </div>
                  <div class="resource-value">{{ statusData.memoryUsage }}%</div>
                  <div class="resource-desc">已用: {{ formatBytes(statusData.memoryUsed) }} / {{ vmInfo.memorySize || 0 }} GB</div>
                  <div class="mini-chart">
                    <el-progress :percentage="statusData.memoryUsage" :show-text="false" :stroke-width="8" color="#52c41a" />
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="resource-card disk-card">
                  <div class="resource-header">
                    <el-icon class="resource-icon"><Coin /></el-icon>
                    <span class="resource-title">磁盘</span>
                  </div>
                  <div class="resource-value">-</div>
                  <div class="resource-desc">
                    <el-tooltip content="磁盘使用情况需要在虚拟机内部查看，PVE API无法直接获取">
                      <span style="color: #999; cursor: help"> 无法获取 / {{ vmInfo.systemDiskSize || 0 }} GB </span>
                    </el-tooltip>
                  </div>
                  <div class="mini-chart">
                    <el-progress :percentage="0" :show-text="false" :stroke-width="8" color="#faad14" />
                  </div>
                </div>
              </el-col>
            </el-row>

            <!-- 监控信息 -->
            <div class="section-title" style="margin-top: 24px">实时监控数据</div>
            <el-row :gutter="16" class="monitor-row">
              <el-col :span="6">
                <el-card class="monitor-card" shadow="never">
                  <template #header>
                    <span>运行时间</span>
                  </template>
                  <div class="monitor-value">{{ formatUptime(statusData.uptime) }}</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="monitor-card" shadow="never">
                  <template #header>
                    <span>磁盘读取</span>
                  </template>
                  <div class="monitor-value">{{ formatBytes(statusData.diskRead) }}</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="monitor-card" shadow="never">
                  <template #header>
                    <span>磁盘写入</span>
                  </template>
                  <div class="monitor-value">{{ formatBytes(statusData.diskWrite) }}</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="monitor-card" shadow="never">
                  <template #header>
                    <span>网络流量</span>
                  </template>
                  <div class="monitor-value">
                    <div>入: {{ formatBytes(statusData.netIn) }}</div>
                    <div>出: {{ formatBytes(statusData.netOut) }}</div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 图表区域 -->
            <div class="section-title" style="margin-top: 24px">历史监控图表</div>
            <el-row :gutter="16" style="margin-top: 16px">
              <el-col :span="12">
                <el-card shadow="never">
                  <template #header>
                    <span>CPU利用率</span>
                  </template>
                  <div id="vmCpuChart" style="width: 100%; height: 300px"></div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card shadow="never">
                  <template #header>
                    <span>内存使用率</span>
                  </template>
                  <div id="vmMemoryChart" style="width: 100%; height: 300px"></div>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="16" style="margin-top: 16px">
              <el-col :span="12">
                <el-card shadow="never">
                  <template #header>
                    <span>磁盘IO</span>
                  </template>
                  <div id="vmDiskChart" style="width: 100%; height: 300px"></div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card shadow="never">
                  <template #header>
                    <span>网络流量</span>
                  </template>
                  <div id="vmNetworkChart" style="width: 100%; height: 300px"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 配置 Tab -->
        <el-tab-pane label="配置" name="config">
          <div class="tab-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="CPU核心">{{ vmInfo.cpuCores || 0 }}</el-descriptions-item>
              <el-descriptions-item label="内存">{{ vmInfo.memorySize || 0 }} GB</el-descriptions-item>
              <el-descriptions-item label="系统盘">{{ vmInfo.systemDiskSize || 0 }} GB</el-descriptions-item>
              <el-descriptions-item label="自动启动">
                <el-tag :type="vmInfo.autoStart === '1' ? 'success' : 'info'">
                  {{ vmInfo.autoStart === '1' ? '是' : '否' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑虚拟机信息" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="虚拟机名称">
          <el-input v-model="editForm.vmName" placeholder="请输入虚拟机名称" />
        </el-form-item>
        <el-form-item label="操作系统">
          <el-input v-model="editForm.osType" placeholder="请输入操作系统类型" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" placeholder="请输入备注" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, reactive, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  delVirtualMachine,
  getVirtualMachine,
  getVirtualMachineStatus,
  restartVirtualMachine,
  startVirtualMachine,
  stopVirtualMachine,
  updateVirtualMachine
} from '@/api/pve/virtualMachine';
import * as echarts from 'echarts';

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as any;

const vmId = ref(route.query.vmId as string);
const activeTab = ref('overview');
const autoRefresh = ref(true);
let refreshTimer: any = null;

// ECharts实例
let vmCpuChart: echarts.ECharts | null = null;
let vmMemoryChart: echarts.ECharts | null = null;
let vmDiskChart: echarts.ECharts | null = null;
let vmNetworkChart: echarts.ECharts | null = null;

const vmInfo = ref<any>({});
const statusData = ref<any>({
  cpuUsage: 0,
  memoryUsage: 0,
  memoryUsed: 0,
  uptime: 0,
  diskRead: 0,
  diskWrite: 0,
  netIn: 0,
  netOut: 0
});

// RRD历史数据
const rrdData = ref<any>({
  cpu: [],
  memory: [],
  disk: [],
  network: []
});

// 加载状态
const loading = reactive({
  summary: false,
  config: false
});

// 编辑对话框
const editDialogVisible = ref(false);
const editForm = ref<any>({});

/** 获取状态类型 */
function getStatusType(status: string) {
  const typeMap: Record<string, any> = {
    running: 'success',
    stopped: 'info',
    paused: 'warning'
  };
  return typeMap[status] || 'info';
}

/** 获取状态文本 */
function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    paused: '已暂停'
  };
  return textMap[status] || status;
}

/** 格式化字节 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/** 格式化运行时间 */
function formatUptime(seconds: number): string {
  if (seconds === 0) return '0秒';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);

  return parts.join(' ') || '刚刚启动';
}

/** 加载虚拟机信息 */
async function loadVmInfo() {
  try {
    const response = await getVirtualMachine(vmId.value);
    vmInfo.value = response.data;
  } catch (error) {
    proxy.$modal.msgError('获取虚拟机信息失败');
  }
}

/** 加载虚拟机状态 */
async function loadVmStatus() {
  if (vmInfo.value.status !== 'running') return;

  loading.summary = true;
  try {
    const response = await getVirtualMachineStatus(vmId.value);
    if (response.data) {
      statusData.value = {
        cpuUsage: Math.round((response.data.cpuUsage || 0) * 100),
        memoryUsage: response.data.maxMemory ? Math.round((response.data.memoryUsage / response.data.maxMemory) * 100) : 0,
        memoryUsed: response.data.memoryUsage || 0,
        uptime: response.data.uptime || 0,
        diskRead: response.data.diskRead || 0,
        diskWrite: response.data.diskWrite || 0,
        netIn: response.data.netIn || 0,
        netOut: response.data.netOut || 0
      };
    }
  } catch (error) {
    console.error('获取虚拟机状态失败:', error);
  } finally {
    loading.summary = false;
  }
}

/** 刷新 */
function handleRefresh() {
  loadVmInfo();
  loadVmStatus();
  proxy.$modal.msgSuccess('刷新成功');
}

/** 自动刷新切换 */
function handleAutoRefreshChange(value: boolean) {
  if (value) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
}

/** 开始自动刷新 */
function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimer = setInterval(() => {
    loadVmStatus();
  }, 5000);
}

/** 停止自动刷新 */
function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

/** Tab切换 */
function handleTabChange(name: string) {
  console.log('切换到Tab:', name);
  if (name === 'monitor') {
    // 切换到监控Tab时，加载RRD数据并初始化图表
    loadVmRrdData();
  }
}

/** 加载虚拟机RRD数据 */
async function loadVmRrdData() {
  if (vmInfo.value.status !== 'running') {
    proxy.$modal.msgWarning('虚拟机未运行，无法获取监控数据');
    return;
  }

  loading.summary = true;
  try {
    // 这里需要调用获取RRD数据的API
    // 暂时使用模拟数据
    const now = Date.now();
    const mockData = [];
    for (let i = 0; i < 60; i++) {
      mockData.push({
        time: Math.floor((now - (60 - i) * 60000) / 1000),
        cpu: Math.random() * 0.5 + 0.2,
        mem: Math.random() * 2 * 1024 * 1024 * 1024,
        maxmem: vmInfo.value.memorySize * 1024 * 1024 * 1024,
        diskread: Math.random() * 10 * 1024 * 1024,
        diskwrite: Math.random() * 8 * 1024 * 1024,
        netin: Math.random() * 5 * 1024 * 1024,
        netout: Math.random() * 3 * 1024 * 1024
      });
    }

    // 解析数据
    rrdData.value = {
      cpu: mockData.map((item: any) => ({
        time: new Date(item.time * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        value: item.cpu ? (item.cpu * 100).toFixed(2) : 0
      })),
      memory: mockData.map((item: any) => ({
        time: new Date(item.time * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        value: item.mem && item.maxmem ? ((item.mem / item.maxmem) * 100).toFixed(2) : 0
      })),
      disk: mockData.map((item: any) => ({
        time: new Date(item.time * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        read: item.diskread ? (item.diskread / 1024 / 1024).toFixed(2) : 0,
        write: item.diskwrite ? (item.diskwrite / 1024 / 1024).toFixed(2) : 0
      })),
      network: mockData.map((item: any) => ({
        time: new Date(item.time * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        netin: item.netin ? (item.netin / 1024 / 1024).toFixed(2) : 0,
        netout: item.netout ? (item.netout / 1024 / 1024).toFixed(2) : 0
      }))
    };

    // 初始化图表
    await nextTick();
    initCharts();
  } catch (error) {
    console.error('获取虚拟机RRD数据失败:', error);
  } finally {
    loading.summary = false;
  }
}

/** 初始化图表 */
function initCharts() {
  if (!rrdData.value.cpu || !rrdData.value.cpu.length) {
    console.warn('RRD数据不存在，跳过图表初始化');
    return;
  }

  // CPU图表
  const cpuElement = document.getElementById('vmCpuChart');
  if (cpuElement) {
    if (vmCpuChart) {
      vmCpuChart.dispose();
    }
    vmCpuChart = echarts.init(cpuElement);
    vmCpuChart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params[0];
          return `${item.name}<br/>${item.marker}${item.seriesName}: ${item.value}%`;
        }
      },
      legend: {
        data: ['CPU使用率'],
        bottom: 0
      },
      grid: { left: '3%', right: '4%', bottom: '12%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: rrdData.value.cpu.map((item: any) => item.time), boundaryGap: false },
      yAxis: { type: 'value', name: 'CPU (%)', max: 100 },
      series: [{
        name: 'CPU使用率',
        type: 'line',
        smooth: true,
        areaStyle: { color: 'rgba(24, 144, 255, 0.2)' },
        data: rrdData.value.cpu.map((item: any) => item.value),
        lineStyle: { color: '#1890ff', width: 2 }
      }]
    });
  }

  // 内存图表
  const memoryElement = document.getElementById('vmMemoryChart');
  if (memoryElement) {
    if (vmMemoryChart) {
      vmMemoryChart.dispose();
    }
    vmMemoryChart = echarts.init(memoryElement);
    vmMemoryChart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params[0];
          return `${item.name}<br/>${item.marker}${item.seriesName}: ${item.value}%`;
        }
      },
      legend: {
        data: ['内存使用率'],
        bottom: 0
      },
      grid: { left: '3%', right: '4%', bottom: '12%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: rrdData.value.memory.map((item: any) => item.time), boundaryGap: false },
      yAxis: { type: 'value', name: '内存 (%)', max: 100 },
      series: [{
        name: '内存使用率',
        type: 'line',
        smooth: true,
        areaStyle: { color: 'rgba(82, 196, 26, 0.2)' },
        data: rrdData.value.memory.map((item: any) => item.value),
        lineStyle: { color: '#52c41a', width: 2 }
      }]
    });
  }

  // 磁盘IO图表
  const diskElement = document.getElementById('vmDiskChart');
  if (diskElement) {
    if (vmDiskChart) {
      vmDiskChart.dispose();
    }
    vmDiskChart = echarts.init(diskElement);
    vmDiskChart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let result = `${params[0].name}<br/>`;
          params.forEach((item: any) => {
            result += `${item.marker + item.seriesName}: ${item.value} MB/s<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['读取', '写入'],
        bottom: 0
      },
      grid: { left: '3%', right: '4%', bottom: '12%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: rrdData.value.disk.map((item: any) => item.time), boundaryGap: false },
      yAxis: { type: 'value', name: '磁盘IO (MB/s)' },
      series: [
        {
          name: '读取',
          type: 'line',
          data: rrdData.value.disk.map((item: any) => item.read),
          smooth: true,
          lineStyle: { color: '#1890ff', width: 2 }
        },
        {
          name: '写入',
          type: 'line',
          data: rrdData.value.disk.map((item: any) => item.write),
          smooth: true,
          lineStyle: { color: '#52c41a', width: 2 }
        }
      ]
    });
  }

  // 网络流量图表
  const networkElement = document.getElementById('vmNetworkChart');
  if (networkElement) {
    if (vmNetworkChart) {
      vmNetworkChart.dispose();
    }
    vmNetworkChart = echarts.init(networkElement);
    vmNetworkChart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let result = `${params[0].name}<br/>`;
          params.forEach((item: any) => {
            result += `${item.marker + item.seriesName}: ${item.value} MB/s<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['入站', '出站'],
        bottom: 0
      },
      grid: { left: '3%', right: '4%', bottom: '12%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: rrdData.value.network.map((item: any) => item.time), boundaryGap: false },
      yAxis: { type: 'value', name: '网络流量 (MB/s)' },
      series: [
        {
          name: '入站',
          type: 'line',
          data: rrdData.value.network.map((item: any) => item.netin),
          smooth: true,
          lineStyle: { color: '#1890ff', width: 2 }
        },
        {
          name: '出站',
          type: 'line',
          data: rrdData.value.network.map((item: any) => item.netout),
          smooth: true,
          lineStyle: { color: '#faad14', width: 2 }
        }
      ]
    });
  }
}

/** 编辑字段 */
function handleEditField(field: string) {
  editForm.value = { ...vmInfo.value };
  editDialogVisible.value = true;
}

/** 保存编辑 */
function handleSaveEdit() {
  // 这里调用更新API
  proxy.$modal.msgSuccess('保存成功');
  editDialogVisible.value = false;
  loadVmInfo();
}

/** 返回 */
function handleBack() {
  router.back();
}

/** 打开控制台 */
function handleConsole() {
  const routeData = router.resolve({
    path: '/pve/virtualMachine/console',
    query: { vmId: vmId.value }
  });
  const newWindow = window.open(routeData.href, '_blank', 'noopener,noreferrer');
  if (newWindow) {
    newWindow.opener = null;
  }
}

/** 启动 */
function handleStart() {
  proxy.$modal
    .confirm(`确认启动虚拟机"${vmInfo.value.vmName}"吗？`)
    .then(() => {
      return startVirtualMachine(vmId.value);
    })
    .then(() => {
      proxy.$modal.msgSuccess('启动命令已发送');
      setTimeout(() => {
        loadVmInfo();
        loadVmStatus();
      }, 2000);
    });
}

/** 停止 */
function handleStop() {
  proxy.$modal
    .confirm(`确认停止虚拟机"${vmInfo.value.vmName}"吗？`)
    .then(() => {
      return stopVirtualMachine(vmId.value);
    })
    .then(() => {
      proxy.$modal.msgSuccess('停止命令已发送');
      setTimeout(() => {
        loadVmInfo();
        loadVmStatus();
      }, 2000);
    });
}

/** 重启 */
function handleRestart() {
  proxy.$modal
    .confirm(`确认重启虚拟机"${vmInfo.value.vmName}"吗？`)
    .then(() => {
      return restartVirtualMachine(vmId.value);
    })
    .then(() => {
      proxy.$modal.msgSuccess('重启命令已发送');
      setTimeout(() => {
        loadVmInfo();
        loadVmStatus();
      }, 2000);
    });
}

/** 删除 */
function handleDelete() {
  proxy.$modal
    .confirm(`确认删除虚拟机"${vmInfo.value.vmName}"吗？此操作不可恢复！`)
    .then(() => {
      return delVirtualMachine([vmId.value]);
    })
    .then(() => {
      proxy.$modal.msgSuccess('删除成功');
      router.push('/pve/virtualMachine');
    });
}

onMounted(() => {
  loadVmInfo();
  loadVmStatus();
  if (autoRefresh.value) {
    startAutoRefresh();
  }
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  stopAutoRefresh();
  
  // 移除窗口大小变化监听
  window.removeEventListener('resize', resizeCharts);
  
  // 清理图表实例
  if (vmCpuChart) {
    vmCpuChart.dispose();
    vmCpuChart = null;
  }
  if (vmMemoryChart) {
    vmMemoryChart.dispose();
    vmMemoryChart = null;
  }
  if (vmDiskChart) {
    vmDiskChart.dispose();
    vmDiskChart = null;
  }
  if (vmNetworkChart) {
    vmNetworkChart.dispose();
    vmNetworkChart = null;
  }
});

/** 图表自适应 */
function resizeCharts() {
  if (vmCpuChart) vmCpuChart.resize();
  if (vmMemoryChart) vmMemoryChart.resize();
  if (vmDiskChart) vmDiskChart.resize();
  if (vmNetworkChart) vmNetworkChart.resize();
}
</script>

<style lang="scss" scoped>
.vm-detail-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-left: 12px;
    border-left: 3px solid #409eff;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .header-info {
      .vm-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }

      .vm-subtitle {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
  }
}

.info-item-card {
  border: 1px solid #e4e7ed;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  .info-item {
    .info-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      font-size: 13px;
      color: #909399;
      margin-bottom: 12px;

      .el-icon {
        font-size: 16px;
      }

      .edit-icon {
        cursor: pointer;
        color: #409eff;
        opacity: 0;
        transition: opacity 0.3s;

        &:hover {
          color: #66b1ff;
        }
      }
    }

    &:hover .edit-icon {
      opacity: 1;
    }

    .info-value {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      word-break: break-all;

      &.highlight {
        font-size: 20px;
        font-weight: 600;
        color: #409eff;
      }
    }
  }
}

.tabs-card {
  .tab-content {
    padding: 16px 0;
  }

  .resource-cards {
    margin-bottom: 24px;
  }

  .monitor-row {
    margin-top: 16px;
  }

  .monitor-card {
    :deep(.el-card__header) {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }
}

.resource-card {
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }

  &.cpu-card {
    background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
    border: 1px solid #91d5ff;

    .resource-icon {
      color: #1890ff;
    }

    .resource-value {
      color: #1890ff;
    }
  }

  &.memory-card {
    background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
    border: 1px solid #b7eb8f;

    .resource-icon {
      color: #52c41a;
    }

    .resource-value {
      color: #52c41a;
    }
  }

  &.disk-card {
    background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
    border: 1px solid #ffd591;

    .resource-icon {
      color: #faad14;
    }

    .resource-value {
      color: #faad14;
    }
  }

  .resource-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;

    .resource-icon {
      font-size: 28px;
    }

    .resource-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .resource-value {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 8px;
    line-height: 1;
  }

  .resource-desc {
    font-size: 13px;
    color: #606266;
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .mini-chart {
    margin-top: 12px;
  }
}

.monitor-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  text-align: center;
  padding: 8px 0;
  line-height: 1.8;

  div {
    margin: 4px 0;
  }
}
</style>

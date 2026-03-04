<template>
  <div class="vm-container">
    <!-- 顶部统计栏 - 紧凑型 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Monitor /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalVms }}</span>
          <span class="stat-label">总数</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon running"><VideoPlay /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.runningVms }}</span>
          <span class="stat-label">运行中</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon stopped"><VideoPause /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.stoppedVms }}</span>
          <span class="stat-label">已停止</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon cpu"><Cpu /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalCpuCores }}</span>
          <span class="stat-label">CPU核心</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon memory"><Memo /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalMemory }}GB</span>
          <span class="stat-label">总内存</span>
        </div>
      </div>
    </div>

    <!-- 工具栏 - 1Panel风格 -->
    <div class="toolbar-container">
      <div class="toolbar-main">
        <!-- 左侧：状态筛选 -->
        <div class="toolbar-section">
          <el-radio-group v-model="statusFilter" @change="handleStatusFilter">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="running">运行中</el-radio-button>
            <el-radio-button label="stopped">已停止</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 中间：主要操作按钮 -->
        <div class="toolbar-section">
          <el-button v-hasPermi="['pve:virtualMachine:add']" icon="Plus" type="primary" @click="handleAdd"> 创建虚拟机 </el-button>

          <!-- VM操作按钮组 -->
          <el-button-group class="vm-actions">
            <el-tooltip content="启动虚拟机" placement="top">
              <el-button v-hasPermi="['pve:virtualMachine:control']" :disabled="!hasSelectedStopped" @click="handleBatchStart"> 启动 </el-button>
            </el-tooltip>
            <el-tooltip content="正常关闭虚拟机" placement="top">
              <el-button v-hasPermi="['pve:virtualMachine:control']" :disabled="!hasSelectedRunning" @click="handleBatchAction('shutdown')">
                关机
              </el-button>
            </el-tooltip>
            <el-tooltip content="立即停止VM" placement="top">
              <el-button v-hasPermi="['pve:virtualMachine:control']" :disabled="!hasSelectedRunning" @click="handleBatchStop"> 停止 </el-button>
            </el-tooltip>
            <el-tooltip content="关闭并重新启动VM" placement="top">
              <el-button v-hasPermi="['pve:virtualMachine:control']" :disabled="!hasSelectedRunning" @click="handleBatchRestart"> 重启 </el-button>
            </el-tooltip>
            <el-tooltip content="立即重置VM" placement="top">
              <el-button v-hasPermi="['pve:virtualMachine:control']" :disabled="!hasSelectedRunning" @click="handleBatchAction('reset')">
                重置
              </el-button>
            </el-tooltip>
            <el-tooltip content="挂起到磁盘" placement="top">
              <el-button v-hasPermi="['pve:virtualMachine:control']" :disabled="!hasSelectedRunning" @click="handleBatchAction('suspend')">
                休眠
              </el-button>
            </el-tooltip>
            <el-tooltip content="暂停VM执行" placement="top">
              <el-button v-hasPermi="['pve:virtualMachine:control']" :disabled="!hasSelectedRunning" @click="handleBatchAction('pause')">
                暂停
              </el-button>
            </el-tooltip>
            <el-tooltip content="恢复VM执行" placement="top">
              <el-button v-hasPermi="['pve:virtualMachine:control']" :disabled="!hasSelectedPaused" @click="handleBatchAction('resume')">
                恢复
              </el-button>
            </el-tooltip>
          </el-button-group>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-select v-model="queryParams.nodeId" clearable placeholder="节点" style="width: 120px" @change="handleQuery">
            <el-option v-for="node in nodeList" :key="node.nodeId" :label="node.nodeName" :value="node.nodeId" />
          </el-select>
          <el-input
            v-model="queryParams.vmName"
            class="search-input"
            clearable
            placeholder="搜索虚拟机"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 虚拟机列表 - 高密度表格 -->
    <div class="vm-table-container">
      <el-table v-loading="loading" :data="vmList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- 虚拟机信息 - 合并列 -->
        <el-table-column label="虚拟机信息" min-width="280">
          <template #default="{ row }">
            <div class="vm-info">
              <div class="vm-name-row">
                <el-icon class="vm-icon"><Monitor /></el-icon>
                <span class="vm-name clickable" @click="handleViewDetail(row)">{{ row.vmName }}</span>
              </div>
              <div class="vm-meta">
                <span class="meta-item">ID: {{ row.vmId }}</span>
                <span class="meta-divider">|</span>
                <span class="meta-item">PVE ID: {{ row.pveVmId }}</span>
                <span class="meta-divider">|</span>
                <span class="meta-item">节点: {{ row.nodeName }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 状态列 - 带操作下拉菜单 -->
        <el-table-column label="状态" width="140">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleVmAction(cmd, row)">
              <div class="status-dropdown">
                <el-tag :type="getStatusType(row.status)" class="status-tag">
                  {{ getStatusText(row.status) }}
                  <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
                </el-tag>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="row.status === 'stopped'" command="start">
                    <el-tooltip content="启动虚拟机" placement="right">
                      <span>启动</span>
                    </el-tooltip>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'running'" command="shutdown">
                    <el-tooltip content="正常关闭虚拟机" placement="right">
                      <span>关机</span>
                    </el-tooltip>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'running'" command="stop">
                    <el-tooltip content="立即停止VM" placement="right">
                      <span>停止</span>
                    </el-tooltip>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'running'" command="reboot">
                    <el-tooltip content="关闭并重新启动VM" placement="right">
                      <span>重启</span>
                    </el-tooltip>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'running'" command="reset">
                    <el-tooltip content="立即重置VM" placement="right">
                      <span>重置</span>
                    </el-tooltip>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'running'" command="suspend">
                    <el-tooltip content="挂起到磁盘" placement="right">
                      <span>休眠</span>
                    </el-tooltip>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'running'" command="pause">
                    <el-tooltip content="暂停VM执行" placement="right">
                      <span>暂停</span>
                    </el-tooltip>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'paused'" command="resume">
                    <el-tooltip content="恢复VM执行" placement="right">
                      <span>恢复</span>
                    </el-tooltip>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>

        <!-- 配置信息 - 合并列 -->
        <el-table-column label="配置" width="180">
          <template #default="{ row }">
            <div class="vm-config">
              <div class="config-row">
                <el-icon class="config-icon cpu-icon"><Cpu /></el-icon>
                <span>{{ row.cpuCores }} vCPU</span>
              </div>
              <div class="config-row">
                <el-icon class="config-icon memory-icon"><Memo /></el-icon>
                <span>{{ row.memorySize }} GB</span>
              </div>
              <div class="config-row">
                <el-icon class="config-icon disk-icon"><Coin /></el-icon>
                <span>{{ row.systemDiskSize }} GB</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 系统信息 -->
        <el-table-column label="系统" width="150">
          <template #default="{ row }">
            <div class="vm-os">
              <div>{{ row.osType || '-' }}</div>
              <div class="os-image">{{ row.imageName || '-' }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column align="center" label="创建时间" prop="createTime" width="160" />

        <!-- 操作列 - 无图标 -->
        <el-table-column align="center" fixed="right" label="操作" width="140">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button v-hasPermi="['pve:virtualMachine:console']" link type="primary" @click="handleConsole(row)"> 控制台 </el-button>
              <el-dropdown trigger="click">
                <el-button link type="primary">更多</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleUpdate(row)">编辑</el-dropdown-item>
                    <el-dropdown-item @click="handleDelete(row)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
      </div>
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" append-to-body width="800px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="虚拟机名称" prop="vmName">
              <el-input v-model="form.vmName" placeholder="请输入虚拟机名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="PVE VM ID" prop="pveVmId">
              <el-input-number v-model="form.pveVmId" :min="100" placeholder="请输入PVE VM ID" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="节点" prop="nodeId">
              <el-select v-model="form.nodeId" placeholder="请选择节点" style="width: 100%">
                <el-option v-for="node in nodeList" :key="node.nodeId" :label="node.nodeName" :value="node.nodeId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作系统类型" prop="osType">
              <el-input v-model="form.osType" placeholder="请输入操作系统类型" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="CPU核心数" prop="cpuCores">
              <el-input-number v-model="form.cpuCores" :max="64" :min="1" placeholder="请输入CPU核心数" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="内存大小(GB)" prop="memorySize">
              <el-input-number v-model="form.memorySize" :max="512" :min="1" placeholder="请输入内存大小" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="系统盘大小(GB)" prop="systemDiskSize">
              <el-input-number v-model="form.systemDiskSize" :max="2000" :min="10" placeholder="请输入系统盘大小" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="自动启动" prop="autoStart">
              <el-radio-group v-model="form.autoStart">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 虚拟机详情抽屉 -->
    <el-drawer v-model="detailDrawerVisible" :title="`虚拟机详情 - ${currentVm.vmName || ''}`" size="700px">
      <!-- 基本信息 -->
      <el-card class="mb-4" shadow="never">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag :type="currentVm.status === 'running' ? 'success' : 'info'">
              {{ currentVm.status === 'running' ? '运行中' : currentVm.status === 'stopped' ? '已停止' : '暂停' }}
            </el-tag>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="虚拟机ID">{{ currentVm.vmId }}</el-descriptions-item>
          <el-descriptions-item label="PVE VM ID">{{ currentVm.pveVmId }}</el-descriptions-item>
          <el-descriptions-item label="虚拟机名称">{{ currentVm.vmName }}</el-descriptions-item>
          <el-descriptions-item label="所属节点">{{ currentVm.nodeName }}</el-descriptions-item>
          <el-descriptions-item label="操作系统">{{ currentVm.osType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="系统镜像">{{ currentVm.imageName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="自动启动">
            <el-tag :type="currentVm.autoStart === '1' ? 'success' : 'info'">
              {{ currentVm.autoStart === '1' ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentVm.createTime }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 资源配置 -->
      <el-card class="mb-4" shadow="never">
        <template #header>
          <div class="card-header">
            <span>资源配置</span>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :span="8">
            <div class="resource-box cpu">
              <div class="resource-icon">
                <el-icon :size="32"><Cpu /></el-icon>
              </div>
              <div class="resource-number">{{ currentVm.cpuCores || 0 }}</div>
              <div class="resource-text">CPU核心</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="resource-box memory">
              <div class="resource-icon">
                <el-icon :size="32"><Memo /></el-icon>
              </div>
              <div class="resource-number">{{ currentVm.memorySize || 0 }} GB</div>
              <div class="resource-text">内存</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="resource-box disk">
              <div class="resource-icon">
                <el-icon :size="32"><Coin /></el-icon>
              </div>
              <div class="resource-number">{{ currentVm.systemDiskSize || 0 }} GB</div>
              <div class="resource-text">系统盘</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 实时监控 -->
      <el-card v-if="currentVm.status === 'running'" class="mb-4" shadow="never">
        <template #header>
          <div class="card-header">
            <span>实时监控</span>
            <el-button icon="Refresh" link size="small" type="primary" @click="loadVmStatus(currentVm.vmId)">刷新</el-button>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="monitor-item">
              <div class="monitor-label">CPU使用率</div>
              <el-progress :percentage="Math.round((currentVm.cpuUsage || 0) * 100)" :stroke-width="12" />
            </div>
          </el-col>
          <el-col :span="12">
            <div class="monitor-item">
              <div class="monitor-label">内存使用率</div>
              <el-progress
                :percentage="currentVm.maxMemory ? Math.round(((currentVm.memoryUsage || 0) / currentVm.maxMemory) * 100) : 0"
                :stroke-width="12"
                color="#f5576c"
              />
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16" class="mt-4">
          <el-col :span="12">
            <div class="monitor-item">
              <div class="monitor-label">运行时间</div>
              <div class="monitor-value">{{ formatUptime(currentVm.uptime || 0) }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="monitor-item">
              <div class="monitor-label">内存使用</div>
              <div class="monitor-value">{{ formatBytes(currentVm.memoryUsage || 0) }} / {{ formatBytes(currentVm.maxMemory || 0) }}</div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16" class="mt-4">
          <el-col :span="12">
            <div class="monitor-item">
              <div class="monitor-label">磁盘读取</div>
              <div class="monitor-value">{{ formatBytes(currentVm.diskRead || 0) }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="monitor-item">
              <div class="monitor-label">磁盘写入</div>
              <div class="monitor-value">{{ formatBytes(currentVm.diskWrite || 0) }}</div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16" class="mt-4">
          <el-col :span="12">
            <div class="monitor-item">
              <div class="monitor-label">网络入流量</div>
              <div class="monitor-value">{{ formatBytes(currentVm.netIn || 0) }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="monitor-item">
              <div class="monitor-label">网络出流量</div>
              <div class="monitor-value">{{ formatBytes(currentVm.netOut || 0) }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 网络信息 -->
      <el-card class="mb-4" shadow="never">
        <template #header>
          <div class="card-header">
            <span>网络信息</span>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="私网IP ID">{{ currentVm.privateIpId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="公网IP ID">{{ currentVm.publicIpId || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 操作按钮 -->
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>虚拟机控制</span>
          </div>
        </template>
        <el-space wrap>
          <el-button v-if="currentVm.status === 'stopped'" icon="VideoPlay" type="success" @click="handleStart(currentVm)">启动</el-button>
          <el-button v-if="currentVm.status === 'running'" icon="VideoPause" type="warning" @click="handleStop(currentVm)">停止</el-button>
          <el-button v-if="currentVm.status === 'running'" icon="RefreshRight" type="primary" @click="handleRestart(currentVm)">重启</el-button>
          <el-button icon="Monitor" type="info" @click="handleConsole(currentVm)">控制台</el-button>
        </el-space>
      </el-card>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import {
  addVirtualMachine,
  delVirtualMachine,
  getOverview,
  getVirtualMachine,
  getVirtualMachineStatus,
  listVirtualMachine,
  restartVirtualMachine,
  startVirtualMachine,
  stopVirtualMachine,
  updateVirtualMachine
} from '@/api/pve/virtualMachine';
import type { PveVirtualMachineForm, PveVirtualMachineQuery, PveVirtualMachineVO } from '@/api/pve/virtualMachine/types';
import { listNode } from '@/api/pve/node';
import { useRouter } from 'vue-router';

const { proxy } = getCurrentInstance() as any;
const router = useRouter();

const vmList = ref<PveVirtualMachineVO[]>([]);
const nodeList = ref<any[]>([]);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const detailDrawerVisible = ref(false);
const detailLoading = ref(false);
const currentVm = ref<any>({});
const statusFilter = ref('');
const selectedVms = ref<PveVirtualMachineVO[]>([]);

// 计算属性：是否有选中的已停止VM
const hasSelectedStopped = computed(() => {
  return selectedVms.value.some((vm) => vm.status === 'stopped');
});

// 计算属性：是否有选中的运行中VM
const hasSelectedRunning = computed(() => {
  return selectedVms.value.some((vm) => vm.status === 'running');
});

// 计算属性：是否有选中的暂停VM
const hasSelectedPaused = computed(() => {
  return selectedVms.value.some((vm) => vm.status === 'paused');
});

// 统计概览数据
const overview = ref({
  totalVms: 0,
  runningVms: 0,
  stoppedVms: 0,
  totalCpuCores: 0,
  totalMemory: 0
});

const queryParams = ref<PveVirtualMachineQuery>({
  pageNum: 1,
  pageSize: 10,
  vmName: undefined,
  nodeId: undefined,
  status: undefined
});
const queryRef = ref();

const form = ref<PveVirtualMachineForm>({});
const formRef = ref();

const rules = {
  vmName: [{ required: true, message: '虚拟机名称不能为空', trigger: 'blur' }],
  pveVmId: [{ required: true, message: 'PVE VM ID不能为空', trigger: 'blur' }],
  nodeId: [{ required: true, message: '节点不能为空', trigger: 'change' }],
  cpuCores: [{ required: true, message: 'CPU核心数不能为空', trigger: 'blur' }],
  memorySize: [{ required: true, message: '内存大小不能为空', trigger: 'blur' }],
  systemDiskSize: [{ required: true, message: '系统盘大小不能为空', trigger: 'blur' }]
};

/** 获取统计概览 */
function loadOverview() {
  getOverview()
    .then((response: any) => {
      overview.value = response.data || {};
    })
    .catch(() => {
      console.error('获取统计概览失败');
    });
}

/** 加载节点列表 */
function loadNodeList() {
  listNode({ pageNum: 1, pageSize: 100 })
    .then((response: any) => {
      nodeList.value = response.rows || [];
    })
    .catch(() => {
      console.error('获取节点列表失败');
    });
}

/** 查询虚拟机列表 */
function getList() {
  loading.value = true;
  listVirtualMachine(queryParams.value)
    .then((response: any) => {
      vmList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  queryRef.value?.resetFields();
  statusFilter.value = '';
  handleQuery();
}

/** 状态筛选 */
function handleStatusFilter(status: string) {
  statusFilter.value = status;
  queryParams.value.status = status || undefined;
  queryParams.value.pageNum = 1;
  getList();
}

/** 刷新列表 */
function handleRefresh() {
  loadOverview();
  getList();
  proxy.$modal.msgSuccess('刷新成功');
}

/** 多选框选中数据 */
function handleSelectionChange(selection: PveVirtualMachineVO[]) {
  ids.value = selection.map((item) => item.vmId);
  selectedVms.value = selection;
  multiple.value = !selection.length;
}

/** 批量操作 */
function handleBatchAction(action: string) {
  const actionMap: Record<string, { title: string; api: Function; successMsg: string }> = {
    shutdown: {
      title: '关机',
      api: stopVirtualMachine,
      successMsg: '关机命令已发送'
    },
    reset: {
      title: '重置',
      api: restartVirtualMachine,
      successMsg: '重置命令已发送'
    },
    suspend: {
      title: '休眠',
      api: stopVirtualMachine,
      successMsg: '休眠命令已发送'
    },
    pause: {
      title: '暂停',
      api: stopVirtualMachine,
      successMsg: '暂停命令已发送'
    },
    resume: {
      title: '恢复',
      api: startVirtualMachine,
      successMsg: '恢复命令已发送'
    }
  };

  const actionInfo = actionMap[action];
  if (!actionInfo) return;

  const vmIds = ids.value;
  const vmNames = vmList.value.filter((vm) => vmIds.includes(vm.vmId)).map((vm) => vm.vmName);

  proxy.$modal
    .confirm(`确认批量${actionInfo.title}虚拟机"${vmNames.join('、')}"吗？`)
    .then(() => {
      const promises = vmIds.map((vmId) => actionInfo.api(vmId));
      return Promise.all(promises);
    })
    .then(() => {
      proxy.$modal.msgSuccess(actionInfo.successMsg);
      setTimeout(() => {
        getList();
        loadOverview();
      }, 2000);
    })
    .catch(() => {});
}

/** 新增按钮操作 */
function handleAdd() {
  // 跳转到创建页面
  router.push('/pve/virtualMachine/create');
}

/** 修改按钮操作 */
function handleUpdate(row: PveVirtualMachineVO) {
  reset();
  const vmId = row.vmId;
  getVirtualMachine(vmId).then((response: any) => {
    form.value = response.data;
    dialogVisible.value = true;
    dialogTitle.value = '修改虚拟机';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate((valid: boolean) => {
    if (valid) {
      if (form.value.vmId) {
        updateVirtualMachine(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功');
          dialogVisible.value = false;
          getList();
          loadOverview();
        });
      } else {
        addVirtualMachine(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功');
          dialogVisible.value = false;
          getList();
          loadOverview();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row?: PveVirtualMachineVO) {
  const vmIds = row?.vmId ? [row.vmId] : ids.value;
  proxy.$modal
    .confirm('是否确认删除虚拟机编号为"' + vmIds + '"的数据项？')
    .then(() => {
      return delVirtualMachine(vmIds);
    })
    .then(() => {
      getList();
      loadOverview();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 查看详情 */
function handleViewDetail(row: PveVirtualMachineVO) {
  // 跳转到详情页面
  router.push({
    path: '/pve/virtualMachine/detail',
    query: { vmId: row.vmId }
  });
}

/** 加载虚拟机实时状态 */
function loadVmStatus(vmId: string | number) {
  detailLoading.value = true;
  getVirtualMachineStatus(vmId)
    .then((response: any) => {
      if (response.data) {
        currentVm.value = {
          ...currentVm.value,
          ...response.data
        };
      }
    })
    .catch(() => {
      console.error('获取虚拟机状态失败');
    })
    .finally(() => {
      detailLoading.value = false;
    });
}

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

/** 处理VM操作 */
function handleVmAction(command: string, row: PveVirtualMachineVO) {
  const actionMap: Record<string, { title: string; api: Function; successMsg: string }> = {
    start: {
      title: '启动虚拟机',
      api: startVirtualMachine,
      successMsg: '启动命令已发送'
    },
    stop: {
      title: '停止虚拟机',
      api: stopVirtualMachine,
      successMsg: '停止命令已发送'
    },
    shutdown: {
      title: '关机',
      api: stopVirtualMachine,
      successMsg: '关机命令已发送'
    },
    reboot: {
      title: '重启虚拟机',
      api: restartVirtualMachine,
      successMsg: '重启命令已发送'
    },
    reset: {
      title: '重置虚拟机',
      api: restartVirtualMachine,
      successMsg: '重置命令已发送'
    },
    suspend: {
      title: '休眠虚拟机',
      api: stopVirtualMachine,
      successMsg: '休眠命令已发送'
    },
    pause: {
      title: '暂停虚拟机',
      api: stopVirtualMachine,
      successMsg: '暂停命令已发送'
    },
    resume: {
      title: '恢复虚拟机',
      api: startVirtualMachine,
      successMsg: '恢复命令已发送'
    }
  };

  const action = actionMap[command];
  if (!action) return;

  proxy.$modal
    .confirm(`确认${action.title}"${row.vmName}"吗？`)
    .then(() => {
      return action.api(row.vmId);
    })
    .then(() => {
      proxy.$modal.msgSuccess(action.successMsg);
      setTimeout(() => {
        getList();
        loadOverview();
        if (detailDrawerVisible.value && currentVm.value.vmId === row.vmId) {
          loadVmStatus(row.vmId);
        }
      }, 2000);
    })
    .catch(() => {});
}

/** 启动虚拟机 */
function handleStart(row: PveVirtualMachineVO) {
  proxy.$modal
    .confirm(`确认启动虚拟机"${row.vmName}"吗？`)
    .then(() => {
      return startVirtualMachine(row.vmId);
    })
    .then(() => {
      proxy.$modal.msgSuccess('启动命令已发送');
      setTimeout(() => {
        getList();
        loadOverview();
        if (detailDrawerVisible.value && currentVm.value.vmId === row.vmId) {
          currentVm.value.status = 'running';
        }
      }, 2000);
    })
    .catch(() => {});
}

/** 停止虚拟机 */
function handleStop(row: PveVirtualMachineVO) {
  proxy.$modal
    .confirm(`确认停止虚拟机"${row.vmName}"吗？`)
    .then(() => {
      return stopVirtualMachine(row.vmId);
    })
    .then(() => {
      proxy.$modal.msgSuccess('停止命令已发送');
      setTimeout(() => {
        getList();
        loadOverview();
        if (detailDrawerVisible.value && currentVm.value.vmId === row.vmId) {
          currentVm.value.status = 'stopped';
        }
      }, 2000);
    })
    .catch(() => {});
}

/** 重启虚拟机 */
function handleRestart(row: PveVirtualMachineVO) {
  proxy.$modal
    .confirm(`确认重启虚拟机"${row.vmName}"吗？`)
    .then(() => {
      return restartVirtualMachine(row.vmId);
    })
    .then(() => {
      proxy.$modal.msgSuccess('重启命令已发送');
      setTimeout(() => {
        getList();
        loadOverview();
      }, 2000);
    })
    .catch(() => {});
}

/** 打开控制台 */
function handleConsole(row: PveVirtualMachineVO) {
  // 检查虚拟机状态
  if (row.status !== 'running') {
    proxy.$modal.msgWarning('虚拟机未运行，无法打开控制台');
    return;
  }

  // 打开新窗口显示控制台
  const routeData = router.resolve({
    path: '/pve/virtualMachine/console',
    query: { vmId: row.vmId }
  });
  window.open(routeData.href, '_blank');
}

/** 批量启动虚拟机 */
function handleBatchStart() {
  const vmIds = ids.value;
  const vmNames = vmList.value.filter((vm) => vmIds.includes(vm.vmId)).map((vm) => vm.vmName);
  proxy.$modal
    .confirm(`确认批量启动虚拟机"${vmNames.join('、')}"吗？`)
    .then(() => {
      const promises = vmIds.map((vmId) => startVirtualMachine(vmId));
      return Promise.all(promises);
    })
    .then(() => {
      proxy.$modal.msgSuccess('批量启动命令已发送');
      setTimeout(() => {
        getList();
        loadOverview();
      }, 2000);
    })
    .catch(() => {});
}

/** 批量停止虚拟机 */
function handleBatchStop() {
  const vmIds = ids.value;
  const vmNames = vmList.value.filter((vm) => vmIds.includes(vm.vmId)).map((vm) => vm.vmName);
  proxy.$modal
    .confirm(`确认批量停止虚拟机"${vmNames.join('、')}"吗？`)
    .then(() => {
      const promises = vmIds.map((vmId) => stopVirtualMachine(vmId));
      return Promise.all(promises);
    })
    .then(() => {
      proxy.$modal.msgSuccess('批量停止命令已发送');
      setTimeout(() => {
        getList();
        loadOverview();
      }, 2000);
    })
    .catch(() => {});
}

/** 批量重启虚拟机 */
function handleBatchRestart() {
  const vmIds = ids.value;
  const vmNames = vmList.value.filter((vm) => vmIds.includes(vm.vmId)).map((vm) => vm.vmName);
  proxy.$modal
    .confirm(`确认批量重启虚拟机"${vmNames.join('、')}"吗？`)
    .then(() => {
      const promises = vmIds.map((vmId) => restartVirtualMachine(vmId));
      return Promise.all(promises);
    })
    .then(() => {
      proxy.$modal.msgSuccess('批量重启命令已发送');
      setTimeout(() => {
        getList();
        loadOverview();
      }, 2000);
    })
    .catch(() => {});
}

/** 取消按钮 */
function cancel() {
  dialogVisible.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    vmId: undefined,
    vmName: undefined,
    pveVmId: undefined,
    nodeId: undefined,
    osType: undefined,
    cpuCores: 2,
    memorySize: 4,
    systemDiskSize: 50,
    autoStart: '0',
    remark: undefined
  };
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
}

/** 格式化字节数 */
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
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  if (secs > 0 && days === 0) parts.push(`${secs}秒`);

  return parts.join(' ');
}

// 初始化
loadOverview();
loadNodeList();
getList();
</script>

<style lang="scss" scoped>
.vm-container {
  padding: 16px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

// 顶部统计栏 - 1Panel风格
.stats-bar {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 16px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  .stat-item {
    display: flex;
    align-items: center;
    gap: 12px;

    .stat-icon {
      font-size: 24px;

      &.total {
        color: #409eff;
      }
      &.running {
        color: #67c23a;
      }
      &.stopped {
        color: #909399;
      }
      &.cpu {
        color: #e6a23c;
      }
      &.memory {
        color: #f56c6c;
      }
    }

    .stat-info {
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 12px;
        color: #909399;
        margin-top: 2px;
      }
    }
  }

  .stat-divider {
    width: 1px;
    height: 32px;
    background: #e4e7ed;
    margin: 0 24px;
  }
}

// 工具栏 - 1Panel风格单行布局
.toolbar-container {
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  .toolbar-main {
    display: flex;
    align-items: center;
    gap: 16px;

    .toolbar-section {
      display: flex;
      align-items: center;
      gap: 8px;

      &.toolbar-right {
        margin-left: auto;
      }

      .vm-actions {
        margin-left: 8px;
      }
    }
  }
}

// 表格容器
.vm-table-container {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  // 虚拟机信息列
  .vm-info {
    .vm-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;

      .vm-icon {
        color: #409eff;
        font-size: 16px;
      }

      .vm-name {
        font-size: 14px;
        font-weight: 500;
        color: #303133;

        &.clickable {
          color: #409eff;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            color: #66b1ff;
            text-decoration: underline;
          }
        }
      }
    }

    .vm-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #909399;

      .meta-item {
        white-space: nowrap;
      }

      .meta-divider {
        color: #dcdfe6;
      }
    }
  }

  // 状态下拉菜单
  .status-dropdown {
    cursor: pointer;

    .status-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        opacity: 0.8;
      }

      .status-icon {
        font-size: 14px;
      }

      .dropdown-icon {
        font-size: 12px;
        margin-left: 4px;
      }
    }
  }

  // 下拉菜单项内容 - 简化为tooltip
  :deep(.el-dropdown-menu__item) {
    padding: 8px 16px;

    .el-tooltip__trigger {
      display: block;
      width: 100%;
    }
  }

  // 配置信息列
  .vm-config {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .config-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #606266;

      .config-icon {
        font-size: 14px;

        &.cpu-icon {
          color: #e6a23c;
        }
        &.memory-icon {
          color: #f56c6c;
        }
        &.disk-icon {
          color: #409eff;
        }
      }
    }
  }

  // 系统信息列
  .vm-os {
    font-size: 13px;

    div:first-child {
      color: #303133;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .os-image {
      color: #909399;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // 操作按钮
  .action-buttons {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: center;
  }

  // 分页容器
  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}

// 详情抽屉样式保持不变
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #303133;
}

.detail-container {
  .resource-box {
    text-align: center;
    padding: 24px;
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.cpu {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    &.memory {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    &.disk {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .resource-icon {
      margin-bottom: 12px;
    }

    .resource-number {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .resource-text {
      font-size: 14px;
      opacity: 0.9;
    }
  }

  .monitor-item {
    margin-bottom: 16px;

    .monitor-label {
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .monitor-value {
      font-size: 16px;
      color: #303133;
      font-weight: bold;
    }
  }
}
</style>

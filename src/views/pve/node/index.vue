<template>
  <div class="node-container">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Monitor /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalNodes }}</span>
          <span class="stat-label">总节点数</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon online"><CircleCheck /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.onlineNodes }}</span>
          <span class="stat-label">在线节点</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon cpu"><Cpu /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalCpuCores }}</span>
          <span class="stat-label">总CPU核心</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon memory"><Memo /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalMemory }}</span>
          <span class="stat-label">总内存(GB)</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon storage"><Coin /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalStorage }}</span>
          <span class="stat-label">总存储(GB)</span>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar-container">
      <div class="toolbar-main">
        <!-- 左侧：状态筛选 -->
        <div class="toolbar-section">
          <el-radio-group v-model="queryParams.status" @change="handleQuery">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="0">正常</el-radio-button>
            <el-radio-button label="1">停用</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 中间：操作按钮 -->
        <div class="toolbar-section">
          <el-button v-hasPermi="['pve:node:add']" icon="Plus" type="primary" @click="handleAdd">新增节点</el-button>
          <el-button v-hasPermi="['pve:node:remove']" :disabled="multiple" icon="Delete" @click="handleDelete()">删除</el-button>
          <el-button v-hasPermi="['pve:node:export']" icon="Download" @click="handleExport">导出</el-button>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-select v-model="queryParams.clusterId" clearable placeholder="选择集群" style="width: 150px" @change="handleQuery">
            <el-option v-for="cluster in clusterList" :key="cluster.clusterId" :label="cluster.clusterName" :value="cluster.clusterId" />
          </el-select>
          <el-input
            v-model="queryParams.nodeName"
            class="search-input"
            clearable
            placeholder="搜索节点名称"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 节点列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="nodeList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- 节点信息 -->
        <el-table-column label="节点信息" min-width="250">
          <template #default="{ row }">
            <div class="node-info">
              <div class="node-name-row">
                <el-icon class="node-icon"><Monitor /></el-icon>
                <span class="node-name">{{ row.nodeName }}</span>
                <el-tag v-if="row.nodeType === 'master'" size="small" style="margin-left: 8px" type="danger">主节点</el-tag>
              </div>
              <div class="node-meta">
                <span class="meta-item">{{ row.clusterName || '-' }}</span>
                <span class="meta-divider">|</span>
                <span class="meta-item">{{ row.ipAddress }}:{{ row.apiPort || 8006 }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 资源配置 -->
        <el-table-column align="center" label="资源配置" width="200">
          <template #default="{ row }">
            <div class="resource-info">
              <div class="resource-item">
                <el-icon style="color: #409eff"><Cpu /></el-icon>
                <span class="resource-label">CPU:</span>
                <span class="resource-value">{{ row.cpuCores || 0 }} 核</span>
              </div>
              <div class="resource-item">
                <el-icon style="color: #67c23a"><Memo /></el-icon>
                <span class="resource-label">内存:</span>
                <span class="resource-value">{{ row.memorySize || 0 }} GB</span>
              </div>
              <div class="resource-item">
                <el-icon style="color: #e6a23c"><Coin /></el-icon>
                <span class="resource-label">存储:</span>
                <span class="resource-value">{{ row.storageSize || 0 }} GB</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- VM配置 -->
        <el-table-column align="center" label="VM配置" width="150">
          <template #default="{ row }">
            <div class="vm-config">
              <div class="config-item">
                <span class="config-label">最大:</span>
                <span class="config-value">{{ row.maxVmCount || 100 }}</span>
              </div>
              <div class="config-item">
                <span class="config-label">阈值:</span>
                <span class="config-value">{{ row.memoryThreshold || 80 }}%</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column align="center" label="状态" width="100">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleStatusCommand(cmd, row)">
              <div class="status-dropdown">
                <el-tag :type="row.status === '0' ? 'success' : 'info'" class="status-tag">
                  {{ row.status === '0' ? '正常' : '停用' }}
                  <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
                </el-tag>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="row.status === '1'" command="enable">启用</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === '0'" command="disable">停用</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>

        <!-- 描述 -->
        <el-table-column label="描述" min-width="180" prop="description" show-overflow-tooltip />

        <!-- 操作列 -->
        <el-table-column align="center" fixed="right" label="操作" width="120">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
              <el-button link type="primary">
                更多
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-hasPermi="['pve:node:edit']" command="sync">同步信息</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:node:edit']" command="syncAll">同步全部</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:node:query']" command="status">查看状态</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:node:edit']" command="edit" divided>修改</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:node:remove']" command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" append-to-body width="800px" @close="cancel">
      <el-form ref="nodeFormRef" :model="form" :rules="rules" label-width="140px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="所属集群" prop="clusterId">
              <el-select v-model="form.clusterId" placeholder="请选择集群" style="width: 100%">
                <el-option v-for="cluster in clusterList" :key="cluster.clusterId" :label="cluster.clusterName" :value="cluster.clusterId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="节点名称" prop="nodeName">
              <el-input v-model="form.nodeName" placeholder="请输入节点名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="IP地址" prop="ipAddress">
              <el-input v-model="form.ipAddress" placeholder="请输入IP地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="API端口" prop="apiPort">
              <el-input-number v-model="form.apiPort" :max="65535" :min="1" placeholder="请输入端口" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="节点状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio value="0">正常</el-radio>
                <el-radio value="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="节点类型" prop="nodeType">
              <el-select v-model="form.nodeType" placeholder="请选择节点类型" style="width: 100%">
                <el-option label="主节点" value="master" />
                <el-option label="从节点" value="slave" />
                <el-option label="普通节点" value="node" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="CPU核心数">
              <el-input-number v-model="form.cpuCores" :min="0" placeholder="CPU核心数" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="内存大小(GB)">
              <el-input-number v-model="form.memorySize" :min="0" placeholder="内存大小" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="存储大小(GB)">
              <el-input-number v-model="form.storageSize" :min="0" placeholder="存储大小" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="最大VM数">
              <el-input-number v-model="form.maxVmCount" :min="0" placeholder="最大VM数" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="内存阈值(%)">
              <el-input-number v-model="form.memoryThreshold" :max="100" :min="0" placeholder="内存阈值" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序">
              <el-input-number v-model="form.sort" :min="0" placeholder="排序" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="描述">
              <el-input v-model="form.description" :rows="3" placeholder="请输入描述" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 节点状态对话框 -->
    <el-dialog v-model="statusDialog.visible" title="节点状态" width="700px">
      <div v-loading="statusDialog.loading">
        <el-descriptions v-if="statusDialog.data" :column="2" border>
          <el-descriptions-item label="节点名称">{{ currentNode.nodeName }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentNode.ipAddress }}</el-descriptions-item>
          <el-descriptions-item label="CPU核心数">{{ currentNode.cpuCores || '-' }}</el-descriptions-item>
          <el-descriptions-item label="内存大小">{{ currentNode.memorySize || '-' }} GB</el-descriptions-item>
          <el-descriptions-item label="存储大小">{{ currentNode.storageSize || '-' }} GB</el-descriptions-item>
          <el-descriptions-item label="状态">
            <dict-tag :options="sys_normal_disable" :value="currentNode.status" />
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" name="PveNode" setup>
import { ElLoading, FormRules } from 'element-plus';
import { addPveNode, delPveNode, getNodeStatus, getPveNode, listPveNode, syncAllData, syncNodeInfo, updatePveNode } from '@/api/pve/node';
import { getOverview, listCluster } from '@/api/pve/cluster';
import type { PveNodeForm, PveNodeQuery, PveNodeVO } from '@/api/pve/node/types';
import type { ClusterVO } from '@/api/pve/cluster/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const nodeList = ref<PveNodeVO[]>([]);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const clusterList = ref<ClusterVO[]>([]);

// 统计概览
const overview = ref({
  totalNodes: 0,
  onlineNodes: 0,
  offlineNodes: 0,
  totalClusters: 0,
  totalCpuCores: 0,
  totalMemory: 0,
  totalStorage: 0,
  avgCpuPerNode: 0,
  avgMemoryPerNode: 0
});

const nodeFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const statusDialog = reactive({
  visible: false,
  loading: false,
  data: null as any
});

const currentNode = ref<any>({});

const initFormData: PveNodeForm = {
  nodeId: undefined,
  clusterId: undefined,
  nodeName: '',
  ipAddress: '',
  apiPort: 8006,
  status: '0',
  nodeType: 'node',
  cpuCores: undefined,
  memorySize: undefined,
  storageSize: undefined,
  maxVmCount: 100,
  memoryThreshold: 80,
  sort: 0,
  description: ''
};
const form = ref<PveNodeForm>({ ...initFormData });

const queryParams = ref<PveNodeQuery>({
  pageNum: 1,
  pageSize: 10,
  clusterId: undefined,
  nodeName: undefined,
  ipAddress: undefined,
  status: '' // 默认为空字符串，显示全部
});

const rules = reactive<FormRules>({
  clusterId: [{ required: true, message: '所属集群不能为空', trigger: 'change' }],
  nodeName: [{ required: true, message: '节点名称不能为空', trigger: 'blur' }],
  ipAddress: [
    { required: true, message: 'IP地址不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipPattern.test(value)) {
          callback(new Error('请输入正确的IP地址'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  nodeType: [{ required: true, message: '节点类型不能为空', trigger: 'change' }]
});

/** 加载统计概览 */
function loadOverview() {
  getOverview().then((res: any) => {
    overview.value = res.data || {};
  });
}

/** 加载集群列表 */
function loadClusterList() {
  listCluster({}).then((res: any) => {
    clusterList.value = res.rows || [];
  });
}

/** 查询节点列表 */
function getList() {
  loading.value = true;
  listPveNode(queryParams.value)
    .then((res: any) => {
      nodeList.value = res.rows;
      total.value = res.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 刷新 */
function handleRefresh() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    clusterId: undefined,
    nodeName: undefined,
    ipAddress: undefined,
    status: undefined
  };
  getList();
  loadOverview();
}

/** 取消按钮 */
function cancel() {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
function reset() {
  form.value = { ...initFormData };
  nodeFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: PveNodeVO[]) {
  ids.value = selection.map((item) => item.nodeId);
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  dialog.visible = true;
  dialog.title = '添加PVE节点';
}

/** 修改按钮操作 */
async function handleUpdate(row?: PveNodeVO) {
  reset();
  const nodeId = row?.nodeId || ids.value[0];
  const res = await getPveNode(nodeId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改PVE节点';
}

/** 提交按钮 */
function submitForm() {
  nodeFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.nodeId) {
        await updatePveNode(form.value);
        proxy?.$modal.msgSuccess('修改成功');
      } else {
        await addPveNode(form.value);
        proxy?.$modal.msgSuccess('新增成功');
      }
      dialog.visible = false;
      await getList();
      await loadOverview();
    }
  });
}

/** 删除按钮操作 */
async function handleDelete(row?: PveNodeVO) {
  const nodeIds = row?.nodeId || ids.value;
  await proxy?.$modal.confirm('是否确认删除PVE节点编号为"' + nodeIds + '"的数据项？');
  await delPveNode(nodeIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
  await loadOverview();
}

/** 同步节点信息 */
async function handleSync(row: PveNodeVO) {
  await proxy?.$modal.confirm(`确认同步节点"${row.nodeName}"的信息吗？`);
  await syncNodeInfo(row.nodeId);
  proxy?.$modal.msgSuccess('同步成功');
  await getList();
  await loadOverview();
}

/** 同步节点全部数据 */
async function handleSyncAll(row: PveNodeVO) {
  await proxy?.$modal.confirm(`确认同步节点"${row.nodeName}"的全部数据(网络、存储、虚拟机、云硬盘、数据盘)吗？此操作可能需要较长时间。`);
  const loading = ElLoading.service({
    lock: true,
    text: '正在同步数据,请稍候...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  try {
    const res: any = await syncAllData(row.nodeId);
    loading.close();

    // 显示同步结果
    const result = res.data;
    let message = `同步完成!\n`;
    message += `网络: ${result.networkSuccess ? '成功' : '失败'} (${result.networkCount}条)\n`;
    message += `存储: ${result.storageSuccess ? '成功' : '失败'} (${result.storageCount}条)\n`;
    message += `虚拟机: ${result.vmSuccess ? '成功' : '失败'} (${result.vmCount}条)\n`;
    message += `云硬盘: ${result.diskSuccess ? '成功' : '失败'} (${result.diskCount}条)\n`;
    message += `数据盘: ${result.dataDiskSuccess ? '成功' : '失败'} (${result.dataDiskCount}条)`;

    proxy?.$modal.msgSuccess(message);
    await getList();
    await loadOverview();
  } catch (error) {
    loading.close();
    proxy?.$modal.msgError('同步失败: ' + error);
  }
}

/** 查看节点状态 */
async function handleViewStatus(row: PveNodeVO) {
  currentNode.value = row;
  statusDialog.visible = true;
  statusDialog.loading = true;
  try {
    const res = await getNodeStatus(row.nodeId);
    statusDialog.data = res.data;
  } finally {
    statusDialog.loading = false;
  }
}

/** 状态命令处理 */
function handleStatusCommand(command: string, row: PveNodeVO) {
  const newStatus = command === 'enable' ? '0' : '1';
  const text = command === 'enable' ? '启用' : '停用';

  proxy?.$modal
    .confirm('确认要"' + text + '""' + row.nodeName + '"节点吗？')
    .then(() => {
      row.status = newStatus;
      return updatePveNode(row);
    })
    .then(() => {
      proxy?.$modal.msgSuccess(text + '成功');
      getList();
      loadOverview();
    })
    .catch(() => {
      getList();
    });
}

/** 操作命令处理 */
function handleCommand(command: string, row: PveNodeVO) {
  switch (command) {
    case 'sync':
      handleSync(row);
      break;
    case 'syncAll':
      handleSyncAll(row);
      break;
    case 'status':
      handleViewStatus(row);
      break;
    case 'edit':
      handleUpdate(row);
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
}

/** 导出按钮操作 */
function handleExport() {
  proxy?.download(
    'pve/node/export',
    {
      ...queryParams.value
    },
    `node_${new Date().getTime()}.xlsx`
  );
}

// 初始化
loadOverview();
loadClusterList();
getList();
</script>

<style lang="scss" scoped>
.node-container {
  padding: 16px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

/* 统计栏样式 */
.stats-bar {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 16px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.stat-icon {
  font-size: 32px;
  &.total {
    color: #409eff;
  }
  &.online {
    color: #67c23a;
  }
  &.cpu {
    color: #e6a23c;
  }
  &.memory {
    color: #f56c6c;
  }
  &.storage {
    color: #909399;
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e4e7ed;
  margin: 0 16px;
}

/* 工具栏样式 */
.toolbar-container {
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toolbar-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  margin-left: auto;
}

/* 表格容器 */
.table-container {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 节点信息 */
.node-info {
  .node-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .node-icon {
    font-size: 18px;
    color: #409eff;
    margin-right: 8px;
  }

  .node-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .node-meta {
    font-size: 12px;
    color: #909399;
    padding-left: 26px;
  }

  .meta-item {
    margin-right: 4px;
  }

  .meta-divider {
    margin: 0 4px;
  }
}

/* 资源信息 */
.resource-info {
  .resource-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .resource-label {
    font-size: 12px;
    color: #909399;
  }

  .resource-value {
    font-size: 13px;
    font-weight: 500;
    color: #606266;
  }
}

/* VM配置 */
.vm-config {
  .config-item {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .config-label {
    font-size: 12px;
    color: #909399;
    margin-right: 4px;
  }

  .config-value {
    font-size: 13px;
    font-weight: 500;
    color: #606266;
  }
}

/* 状态下拉 */
.status-dropdown {
  cursor: pointer;

  .status-tag {
    cursor: pointer;
    user-select: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .dropdown-icon {
    font-size: 12px;
  }
}
</style>

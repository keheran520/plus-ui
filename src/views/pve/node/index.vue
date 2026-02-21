<template>
  <div class="p-2">
    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="mb-[10px]">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon :size="32">
                <Monitor />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalNodes }}</div>
              <div class="stat-label">总节点数</div>
              <div class="stat-today">在线 {{ overview.onlineNodes }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon cpu">
              <el-icon :size="32">
                <Cpu />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalCpuCores }}</div>
              <div class="stat-label">总CPU核心数</div>
              <div class="stat-today">平均 {{ overview.avgCpuPerNode }} 核/节点</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon memory">
              <el-icon :size="32">
                <Memo />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalMemory }} GB</div>
              <div class="stat-label">总内存容量</div>
              <div class="stat-today">平均 {{ overview.avgMemoryPerNode }} GB/节点</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon storage">
              <el-icon :size="32">
                <Coin />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalStorage }} GB</div>
              <div class="stat-label">总存储容量</div>
              <div class="stat-today">集群 {{ overview.totalClusters }} 个</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="never">
          <el-form ref="queryFormRef" :inline="true" :model="queryParams" label-width="68px">
            <el-form-item label="集群" prop="clusterId">
              <el-select v-model="queryParams.clusterId" clearable placeholder="请选择集群" style="width: 200px">
                <el-option v-for="cluster in clusterList" :key="cluster.clusterId" :label="cluster.clusterName" :value="cluster.clusterId" />
              </el-select>
            </el-form-item>
            <el-form-item label="节点名称" prop="nodeName">
              <el-input v-model="queryParams.nodeName" clearable placeholder="请输入节点名称" style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="IP地址" prop="ipAddress">
              <el-input v-model="queryParams.ipAddress" clearable placeholder="请输入IP地址" style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" clearable placeholder="请选择状态" style="width: 150px">
                <el-option label="正常" value="0" />
                <el-option label="停用" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:node:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:node:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:node:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:node:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <el-table
        v-loading="loading"
        :data="nodeList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" type="selection" width="50" />
        <el-table-column align="center" label="节点ID" prop="nodeId" width="100" />
        <el-table-column align="center" label="集群名称" prop="clusterName" width="150" show-overflow-tooltip />
        <el-table-column align="center" label="节点名称" prop="nodeName" width="150" show-overflow-tooltip />
        <el-table-column align="center" label="IP地址" prop="ipAddress" width="150" />
        <el-table-column align="center" label="端口" prop="apiPort" width="80" />
        <el-table-column align="center" label="状态" width="100">
          <template #default="{ row }">
            <dict-tag :options="sys_normal_disable" :value="row.status" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="节点类型" prop="nodeType" width="100" />
        <el-table-column align="center" label="CPU(核)" prop="cpuCores" width="100">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.cpuCores || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="内存(GB)" prop="memorySize" width="100">
          <template #default="{ row }">
            <el-tag type="success">{{ row.memorySize || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="存储(GB)" prop="storageSize" width="100">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.storageSize || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="最大VM数" prop="maxVmCount" width="100" />
        <el-table-column align="center" label="描述" prop="description" show-overflow-tooltip width="200" />
        <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="280">
          <template #default="{ row }">
            <el-tooltip content="同步信息" placement="top">
              <el-button v-hasPermi="['pve:node:edit']" icon="Refresh" link type="primary" @click="handleSync(row)"></el-button>
            </el-tooltip>
            <el-tooltip content="同步全部" placement="top">
              <el-button v-hasPermi="['pve:node:edit']" icon="Download" link type="warning" @click="handleSyncAll(row)"></el-button>
            </el-tooltip>
            <el-tooltip content="查看状态" placement="top">
              <el-button v-hasPermi="['pve:node:query']" icon="View" link type="success" @click="handleViewStatus(row)"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['pve:node:edit']" icon="Edit" link type="primary" @click="handleUpdate(row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['pve:node:remove']" icon="Delete" link type="danger" @click="handleDelete(row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

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

<script lang="ts" setup name="PveNode">
import { ElLoading } from 'element-plus';
import { listPveNode, getPveNode, addPveNode, updatePveNode, delPveNode, syncNodeInfo, getNodeStatus, syncAllData } from '@/api/pve/node';
import { listCluster, getOverview } from '@/api/pve/cluster';
import type { PveNodeVO, PveNodeQuery, PveNodeForm } from '@/api/pve/node/types';
import type { ClusterVO } from '@/api/pve/cluster/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const nodeList = ref<PveNodeVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
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

const queryFormRef = ref<ElFormInstance>();
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
  status: undefined
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

/** 重置按钮操作 */
function resetQuery() {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: PveNodeVO[]) {
  ids.value = selection.map((item) => item.nodeId);
  single.value = selection.length != 1;
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
.stat-card {
  display: flex;
  align-items: center;
  padding: 10px 0;

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    color: white;

    &.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.cpu {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.memory {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.storage {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #303133;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-top: 4px;
    }

    .stat-today {
      font-size: 12px;
      color: #67c23a;
      margin-top: 4px;
    }
  }
}
</style>

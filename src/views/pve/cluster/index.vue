<template>
  <div class="cluster-container">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Monitor /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalClusters }}</span>
          <span class="stat-label">总集群数</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon online"><CircleCheck /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.onlineClusters }}</span>
          <span class="stat-label">在线集群</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon nodes"><Cpu /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalNodes }}</span>
          <span class="stat-label">总节点数</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon cpu"><Memo /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalCpuCores }}</span>
          <span class="stat-label">总CPU核心</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon memory"><Odometer /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalMemory }}</span>
          <span class="stat-label">总内存(GB)</span>
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
          <el-button v-hasPermi="['pve:cluster:add']" icon="Plus" type="primary" @click="handleAdd">新增集群</el-button>
          <el-button v-hasPermi="['pve:cluster:remove']" icon="Delete" :disabled="multiple" @click="handleDelete()">删除</el-button>
          <el-button v-hasPermi="['pve:cluster:export']" icon="Download" @click="handleExport">导出</el-button>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-input
            v-model="queryParams.clusterName"
            class="search-input"
            clearable
            placeholder="搜索集群名称"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 集群列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="clusterList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- 集群信息 -->
        <el-table-column label="集群信息" min-width="250">
          <template #default="{ row }">
            <div class="cluster-info">
              <div class="cluster-name-row">
                <el-icon class="cluster-icon"><Monitor /></el-icon>
                <span class="cluster-name">{{ row.clusterName }}</span>
              </div>
              <div class="cluster-meta">
                <span class="meta-item">ID: {{ row.clusterId }}</span>
                <span class="meta-divider">|</span>
                <span class="meta-item">{{ row.ipAddress }}:{{ row.apiPort || 8006 }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- API令牌 -->
        <el-table-column label="API令牌" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="token-info">
              <el-icon style="color: #909399; margin-right: 4px"><Key /></el-icon>
              <span>{{ row.tokenId }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 节点信息 -->
        <el-table-column label="节点信息" width="150" align="center">
          <template #default="{ row }">
            <div class="node-stats">
              <div class="node-item">
                <span class="node-label">总数:</span>
                <span class="node-value">{{ row.nodeCount || 0 }}</span>
              </div>
              <div class="node-item">
                <span class="node-label">在线:</span>
                <span class="node-value online">{{ row.onlineNodeCount || 0 }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100" align="center">
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
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
              <el-button link type="primary">
                更多
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-hasPermi="['pve:cluster:test']" command="test">测试连接</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:cluster:query']" command="status">查看状态</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:cluster:sync']" command="sync">同步信息</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:cluster:edit']" command="edit" divided>修改</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:cluster:remove']" command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </div>

    <!-- 添加或修改PVE集群对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" append-to-body width="600px">
      <el-form ref="clusterFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="集群名称" prop="clusterName">
          <el-input v-model="form.clusterName" placeholder="请输入集群名称" />
        </el-form-item>
        <el-form-item label="集群IP地址" prop="ipAddress">
          <el-input v-model="form.ipAddress" placeholder="例如: 192.168.1.100" />
        </el-form-item>
        <el-form-item label="API端口" prop="apiPort">
          <el-input-number v-model="form.apiPort" :max="65535" :min="1" controls-position="right" placeholder="默认8006" />
        </el-form-item>
        <el-form-item label="API令牌ID" prop="tokenId">
          <el-input v-model="form.tokenId" placeholder="例如: root@pam!mytoken" />
        </el-form-item>
        <el-form-item label="API令牌密钥" prop="tokenSecret">
          <el-input v-model="form.tokenSecret" placeholder="请输入API令牌密钥" show-password type="password" />
        </el-form-item>
        <el-form-item label="集群状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" :rows="3" placeholder="请输入描述" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 集群状态对话框 -->
    <el-dialog v-model="statusDialog.visible" append-to-body title="集群状态" width="800px">
      <el-descriptions v-if="statusDialog.data" :column="2" border>
        <el-descriptions-item label="集群名称">{{ statusDialog.data.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ statusDialog.data.version || '-' }}</el-descriptions-item>
        <el-descriptions-item label="节点数量">{{ statusDialog.data.nodes?.length || 0 }}</el-descriptions-item>
        <el-descriptions-item label="法定人数">{{ statusDialog.data.quorate || '-' }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="statusDialog.data?.nodes && statusDialog.data.nodes.length > 0" class="mt-4">
        <el-divider content-position="left">节点列表</el-divider>
        <el-table :data="statusDialog.data.nodes" border>
          <el-table-column label="节点名称" prop="name" />
          <el-table-column label="IP地址" prop="ip" />
          <el-table-column label="状态" prop="online">
            <template #default="scope">
              <el-tag :type="scope.row.online ? 'success' : 'danger'">
                {{ scope.row.online ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="本地节点" prop="local">
            <template #default="scope">
              <el-tag v-if="scope.row.local" type="primary">是</el-tag>
              <span v-else>否</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="statusDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" name="Cluster" setup>
import { addCluster, delCluster, getCluster, getClusterStatus, listCluster, syncClusterInfo, testConnection, updateCluster, getOverview } from '@/api/pve/cluster';
import { ClusterForm, ClusterQuery, ClusterVO } from '@/api/pve/cluster/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const clusterList = ref<ClusterVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);

// 统计概览
const overview = ref({
  totalClusters: 0,
  onlineClusters: 0,
  offlineClusters: 0,
  totalNodes: 0,
  onlineNodes: 0,
  offlineNodes: 0,
  totalCpuCores: 0,
  totalMemory: 0,
  totalStorage: 0
});

const clusterFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const statusDialog = reactive({
  visible: false,
  data: null as any
});

// IP地址验证函数
const validateIpAddress = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('集群IP地址不能为空'));
  } else {
    const ipPattern = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    if (!ipPattern.test(value)) {
      callback(new Error('请输入正确的IP地址'));
    } else {
      callback();
    }
  }
};

const initFormData: ClusterForm = {
  clusterId: undefined,
  clusterName: undefined,
  ipAddress: undefined,
  apiPort: 8006,
  tokenId: undefined,
  tokenSecret: undefined,
  status: '0',
  description: undefined,
  sort: 0
};

const data = reactive<PageData<ClusterForm, ClusterQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    clusterName: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    clusterName: [{ required: true, message: '集群名称不能为空', trigger: 'blur' }],
    ipAddress: [{ required: true, validator: validateIpAddress, trigger: 'blur' }],
    tokenId: [{ required: true, message: 'API令牌ID不能为空', trigger: 'blur' }],
    tokenSecret: [{ required: true, message: 'API令牌密钥不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询PVE集群列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCluster(queryParams.value);
  clusterList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 刷新 */
const handleRefresh = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    clusterName: undefined,
    status: undefined,
    params: {}
  };
  getList();
  loadOverview();
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  clusterFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: ClusterVO[]) => {
  ids.value = selection.map((item) => item.clusterId);
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加PVE集群';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ClusterVO) => {
  reset();
  const _clusterId = row?.clusterId || ids.value[0];
  const res = await getCluster(_clusterId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改PVE集群';
};

/** 提交按钮 */
const submitForm = () => {
  clusterFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.clusterId) {
        await updateCluster(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCluster(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
      await loadOverview();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ClusterVO) => {
  const _clusterIds = row?.clusterId || ids.value;
  await proxy?.$modal.confirm('是否确认删除PVE集群编号为"' + _clusterIds + '"的数据项？').finally(() => (loading.value = false));
  await delCluster(_clusterIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
  await loadOverview();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'pve/cluster/export',
    {
      ...queryParams.value
    },
    `cluster_${new Date().getTime()}.xlsx`
  );
};

/** 测试连接 */
const handleTestConnection = async (row: ClusterVO) => {
  try {
    loading.value = true;
    const res = await testConnection(row.clusterId);
    if (res.data) {
      proxy?.$modal.msgSuccess('连接测试成功');
    } else {
      proxy?.$modal.msgError('连接测试失败');
    }
  } catch (error) {
    proxy?.$modal.msgError('连接测试失败');
  } finally {
    loading.value = false;
  }
};

/** 查看状态 */
const handleViewStatus = async (row: ClusterVO) => {
  try {
    loading.value = true;
    const res = await getClusterStatus(row.clusterId);
    statusDialog.data = res.data;
    statusDialog.visible = true;
  } catch (error) {
    proxy?.$modal.msgError('获取集群状态失败');
  } finally {
    loading.value = false;
  }
};

/** 同步信息 */
const handleSync = async (row: ClusterVO) => {
  try {
    await proxy?.$modal.confirm('是否确认同步集群"' + row.clusterName + '"的信息？');
    loading.value = true;
    await syncClusterInfo(row.clusterId);
    proxy?.$modal.msgSuccess('同步成功');
    await getList();
    await loadOverview();
  } catch (error) {
    // 用户取消或同步失败
  } finally {
    loading.value = false;
  }
};

/** 状态命令处理 */
const handleStatusCommand = (command: string, row: ClusterVO) => {
  const newStatus = command === 'enable' ? '0' : '1';
  const text = command === 'enable' ? '启用' : '停用';

  proxy?.$modal
    .confirm('确认要"' + text + '""' + row.clusterName + '"集群吗？')
    .then(() => {
      row.status = newStatus;
      return updateCluster(row);
    })
    .then(() => {
      proxy?.$modal.msgSuccess(text + '成功');
      getList();
      loadOverview();
    })
    .catch(() => {
      getList();
    });
};

/** 操作命令处理 */
const handleCommand = (command: string, row: ClusterVO) => {
  switch (command) {
    case 'test':
      handleTestConnection(row);
      break;
    case 'status':
      handleViewStatus(row);
      break;
    case 'sync':
      handleSync(row);
      break;
    case 'edit':
      handleUpdate(row);
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
};

/** 加载统计概览 */
const loadOverview = () => {
  getOverview().then((res: any) => {
    overview.value = res.data || {};
  });
};

onMounted(() => {
  loadOverview();
  getList();
});
</script>


<style lang="scss" scoped>
.cluster-container {
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
  &.nodes {
    color: #e6a23c;
  }
  &.cpu {
    color: #f56c6c;
  }
  &.memory {
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

/* 集群信息 */
.cluster-info {
  .cluster-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .cluster-icon {
    font-size: 18px;
    color: #409eff;
    margin-right: 8px;
  }

  .cluster-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .cluster-meta {
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

/* 令牌信息 */
.token-info {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
}

/* 节点统计 */
.node-stats {
  .node-item {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .node-label {
    font-size: 12px;
    color: #909399;
    margin-right: 4px;
  }

  .node-value {
    font-size: 14px;
    font-weight: 500;
    color: #606266;

    &.online {
      color: #67c23a;
    }
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

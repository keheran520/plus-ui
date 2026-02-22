<template>
  <div class="storage-container">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Coin /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalStorage }}</span>
          <span class="stat-label">总存储数</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon online"><CircleCheck /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.onlineStorage }}</span>
          <span class="stat-label">在线存储</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon capacity"><Odometer /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ formatSize(overview.totalCapacity) }}</span>
          <span class="stat-label">总容量</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon used"><DataAnalysis /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ formatSize(overview.usedCapacity) }}</span>
          <span class="stat-label">已使用</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon usage"><TrendCharts /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.usageRate }}%</span>
          <span class="stat-label">使用率</span>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar-container">
      <div class="toolbar-main">
        <!-- 左侧：类型筛选 -->
        <div class="toolbar-section">
          <el-radio-group v-model="queryParams.storageType" @change="handleQuery">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="dir">目录</el-radio-button>
            <el-radio-button label="lvm">LVM</el-radio-button>
            <el-radio-button label="nfs">NFS</el-radio-button>
            <el-radio-button label="cifs">CIFS</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 中间：操作按钮 -->
        <div class="toolbar-section">
          <el-button v-hasPermi="['pve:storage:add']" icon="Plus" type="primary" @click="handleAdd">新增存储</el-button>
          <el-button v-hasPermi="['pve:storage:remove']" icon="Delete" :disabled="multiple" @click="handleDelete()">删除</el-button>
          <el-button v-hasPermi="['pve:storage:export']" icon="Download" @click="handleExport">导出</el-button>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-select v-model="queryParams.enabled" clearable placeholder="状态" style="width: 120px" @change="handleQuery">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
          <el-input
            v-model="queryParams.storageName"
            class="search-input"
            clearable
            placeholder="搜索存储名称"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 存储列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="storageList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- 存储信息 -->
        <el-table-column label="存储信息" min-width="250">
          <template #default="{ row }">
            <div class="storage-info">
              <div class="storage-name-row">
                <el-icon class="storage-icon"><Coin /></el-icon>
                <span class="storage-name">{{ row.storageName }}</span>
              </div>
              <div class="storage-meta">
                <span class="meta-item">ID: {{ row.pveStorageId || row.storageId }}</span>
                <span v-if="row.nodeId" class="meta-divider">|</span>
                <span v-if="row.nodeId" class="meta-item">节点: {{ row.nodeId }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 存储类型 -->
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.storageType === 'dir'" type="primary">目录</el-tag>
            <el-tag v-else-if="row.storageType === 'lvm'" type="success">LVM</el-tag>
            <el-tag v-else-if="row.storageType === 'nfs'" type="warning">NFS</el-tag>
            <el-tag v-else-if="row.storageType === 'cifs'" type="info">CIFS</el-tag>
            <el-tag v-else>{{ row.storageType }}</el-tag>
          </template>
        </el-table-column>

        <!-- 路径/服务器 -->
        <el-table-column label="路径/服务器" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div v-if="row.server" class="path-info">
              <div class="path-item">
                <el-icon style="color: #909399"><Connection /></el-icon>
                <span>{{ row.server }}</span>
              </div>
              <div v-if="row.path || row.export" class="path-item">
                <el-icon style="color: #909399"><Folder /></el-icon>
                <span>{{ row.path || row.export }}</span>
              </div>
            </div>
            <div v-else-if="row.path" class="path-info">
              <el-icon style="color: #909399"><Folder /></el-icon>
              <span>{{ row.path }}</span>
            </div>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <!-- 容量信息 -->
        <el-table-column label="容量信息" width="200" align="center">
          <template #default="{ row }">
            <div class="capacity-info">
              <div class="capacity-item">
                <span class="capacity-label">总量:</span>
                <span class="capacity-value">{{ formatSize(row.totalSize) }}</span>
              </div>
              <div class="capacity-item">
                <span class="capacity-label">已用:</span>
                <span class="capacity-value used">{{ formatSize(row.usedSize) }}</span>
              </div>
              <div class="capacity-item">
                <span class="capacity-label">可用:</span>
                <span class="capacity-value available">{{ formatSize(row.availableSize) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 内容类型 -->
        <el-table-column label="内容类型" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.contentTypes">{{ row.contentTypes }}</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleStatusCommand(cmd, row)">
              <div class="status-dropdown">
                <el-tag :type="row.enabled === '1' ? 'success' : 'info'" class="status-tag">
                  {{ row.enabled === '1' ? '启用' : '禁用' }}
                  <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
                </el-tag>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="row.enabled === '0'" command="enable">启用</el-dropdown-item>
                  <el-dropdown-item v-if="row.enabled === '1'" command="disable">禁用</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>

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
                  <el-dropdown-item v-hasPermi="['pve:storage:edit']" command="edit">修改</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:storage:remove']" command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </div>
    <!-- 添加或修改PVE存储对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="storageFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属节点ID" prop="nodeId">
          <el-input v-model="form.nodeId" placeholder="请输入所属节点ID" />
        </el-form-item>
        <el-form-item label="存储名称" prop="storageName">
          <el-input v-model="form.storageName" placeholder="请输入存储名称" />
        </el-form-item>
        <el-form-item label="PVE存储标识" prop="pveStorageId">
          <el-input v-model="form.pveStorageId" placeholder="请输入PVE存储标识" />
        </el-form-item>
        <el-form-item label="路径" prop="path">
            <el-input v-model="form.path" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="服务器地址" prop="server">
          <el-input v-model="form.server" placeholder="请输入服务器地址" />
        </el-form-item>
        <el-form-item label="导出路径(NFS)" prop="export">
            <el-input v-model="form.export" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="共享名(CIFS)" prop="share">
          <el-input v-model="form.share" placeholder="请输入共享名(CIFS)" />
        </el-form-item>
        <el-form-item label="用户名(CIFS/NFS等需要认证的存储)" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名(CIFS/NFS等需要认证的存储)" />
        </el-form-item>
        <el-form-item label="密码(加密)" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码(加密)" />
        </el-form-item>
        <el-form-item label="门户地址(iSCSI)" prop="portal">
          <el-input v-model="form.portal" placeholder="请输入门户地址(iSCSI)" />
        </el-form-item>
        <el-form-item label="目标名称(iSCSI)" prop="target">
          <el-input v-model="form.target" placeholder="请输入目标名称(iSCSI)" />
        </el-form-item>
        <el-form-item label="池名称(Ceph RBD)" prop="pool">
          <el-input v-model="form.pool" placeholder="请输入池名称(Ceph RBD)" />
        </el-form-item>
        <el-form-item label="内容类型(逗号分隔: images,iso,backup等)" prop="contentTypes">
          <el-input v-model="form.contentTypes" placeholder="请输入内容类型(逗号分隔: images,iso,backup等)" />
        </el-form-item>
        <el-form-item label="是否启用(0:禁用 1:启用)" prop="enabled">
          <el-input v-model="form.enabled" placeholder="请输入是否启用(0:禁用 1:启用)" />
        </el-form-item>
        <el-form-item label="总容量(字节)" prop="totalSize">
          <el-input v-model="form.totalSize" placeholder="请输入总容量(字节)" />
        </el-form-item>
        <el-form-item label="已使用(字节)" prop="usedSize">
          <el-input v-model="form.usedSize" placeholder="请输入已使用(字节)" />
        </el-form-item>
        <el-form-item label="可用容量(字节)" prop="availableSize">
          <el-input v-model="form.availableSize" placeholder="请输入可用容量(字节)" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Storage" lang="ts">
import { listStorage, getStorage, delStorage, addStorage, updateStorage } from '@/api/pve/storage';
import { StorageVO, StorageQuery, StorageForm } from '@/api/pve/storage/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const storageList = ref<StorageVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);

// 统计概览
const overview = ref({
  totalStorage: 0,
  onlineStorage: 0,
  totalCapacity: 0,
  usedCapacity: 0,
  availableCapacity: 0,
  usageRate: 0
});

const storageFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: StorageForm = {
  storageId: undefined,
  nodeId: undefined,
  storageName: undefined,
  pveStorageId: undefined,
  storageType: undefined,
  path: undefined,
  server: undefined,
  export: undefined,
  share: undefined,
  username: undefined,
  password: undefined,
  portal: undefined,
  target: undefined,
  pool: undefined,
  contentTypes: undefined,
  enabled: undefined,
  totalSize: undefined,
  usedSize: undefined,
  availableSize: undefined,
  description: undefined,
}
const data = reactive<PageData<StorageForm, StorageQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    nodeId: undefined,
    storageName: undefined,
    pveStorageId: undefined,
    storageType: undefined,
    path: undefined,
    server: undefined,
    export: undefined,
    share: undefined,
    username: undefined,
    password: undefined,
    portal: undefined,
    target: undefined,
    pool: undefined,
    contentTypes: undefined,
    enabled: undefined,
    totalSize: undefined,
    usedSize: undefined,
    availableSize: undefined,
    description: undefined,
    params: {
    }
  },
  rules: {
    storageId: [
      { required: true, message: "存储ID不能为空", trigger: "blur" }
    ],
    nodeId: [
      { required: true, message: "所属节点ID不能为空", trigger: "blur" }
    ],
    storageName: [
      { required: true, message: "存储名称不能为空", trigger: "blur" }
    ],
    pveStorageId: [
      { required: true, message: "PVE存储标识不能为空", trigger: "blur" }
    ],
    storageType: [
      { required: true, message: "存储类型(dir/lvm/lvmthin/zfspool/nfs/cifs/iscsi/rbd/glusterfs)不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 格式化文件大小 */
function formatSize(bytes: number | undefined): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/** 计算统计概览 */
function calculateOverview() {
  const total = storageList.value.length;
  const online = storageList.value.filter((s) => s.enabled === '1').length;
  const totalCap = storageList.value.reduce((sum, s) => sum + (s.totalSize || 0), 0);
  const usedCap = storageList.value.reduce((sum, s) => sum + (s.usedSize || 0), 0);
  
  overview.value = {
    totalStorage: total,
    onlineStorage: online,
    totalCapacity: totalCap,
    usedCapacity: usedCap,
    availableCapacity: totalCap - usedCap,
    usageRate: totalCap > 0 ? Math.round((usedCap / totalCap) * 100) : 0
  };
}

/** 查询PVE存储列表 */
const getList = async () => {
  loading.value = true;
  const res = await listStorage(queryParams.value);
  storageList.value = res.rows;
  total.value = res.total;
  calculateOverview();
  loading.value = false;
}

/** 刷新 */
const handleRefresh = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    nodeId: undefined,
    storageName: undefined,
    pveStorageId: undefined,
    storageType: '',
    enabled: undefined,
    params: {}
  };
  getList();
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  storageFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: StorageVO[]) => {
  ids.value = selection.map(item => item.storageId);
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加PVE存储";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: StorageVO) => {
  reset();
  const _storageId = row?.storageId || ids.value[0]
  const res = await getStorage(_storageId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改PVE存储";
}

/** 提交按钮 */
const submitForm = () => {
  storageFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.storageId) {
        await updateStorage(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addStorage(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: StorageVO) => {
  const _storageIds = row?.storageId || ids.value;
  await proxy?.$modal.confirm('是否确认删除PVE存储编号为"' + _storageIds + '"的数据项？').finally(() => loading.value = false);
  await delStorage(_storageIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 状态命令处理 */
const handleStatusCommand = (command: string, row: StorageVO) => {
  const newEnabled = command === 'enable' ? '1' : '0';
  const text = command === 'enable' ? '启用' : '禁用';

  proxy?.$modal
    .confirm('确认要"' + text + '""' + row.storageName + '"存储吗？')
    .then(() => {
      row.enabled = newEnabled;
      return updateStorage(row);
    })
    .then(() => {
      proxy?.$modal.msgSuccess(text + '成功');
      getList();
    })
    .catch(() => {
      getList();
    });
};

/** 操作命令处理 */
const handleCommand = (command: string, row: StorageVO) => {
  switch (command) {
    case 'edit':
      handleUpdate(row);
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('pve/storage/export', {
    ...queryParams.value
  }, `storage_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.storage-container {
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
  &.capacity {
    color: #e6a23c;
  }
  &.used {
    color: #f56c6c;
  }
  &.usage {
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

/* 存储信息 */
.storage-info {
  .storage-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .storage-icon {
    font-size: 18px;
    color: #409eff;
    margin-right: 8px;
  }

  .storage-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .storage-meta {
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

/* 路径信息 */
.path-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .path-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #606266;
  }
}

/* 容量信息 */
.capacity-info {
  .capacity-item {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .capacity-label {
    font-size: 12px;
    color: #909399;
    margin-right: 4px;
  }

  .capacity-value {
    font-size: 13px;
    font-weight: 500;
    color: #606266;

    &.used {
      color: #f56c6c;
    }

    &.available {
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

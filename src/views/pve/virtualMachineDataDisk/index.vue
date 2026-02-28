<template>
  <div class="data-disk-container">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Coin /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalDisks }}</span>
          <span class="stat-label">总数据盘</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon active"><CircleCheck /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.activeDisks }}</span>
          <span class="stat-label">活动</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon creating"><Loading /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.creatingDisks }}</span>
          <span class="stat-label">创建中</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon capacity"><Odometer /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ formatBytes(overview.totalCapacity) }}</span>
          <span class="stat-label">总容量</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon average"><DataAnalysis /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ formatBytes(overview.averageSize) }}</span>
          <span class="stat-label">平均大小</span>
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
            <el-radio-button label="active">活动</el-radio-button>
            <el-radio-button label="creating">创建中</el-radio-button>
            <el-radio-button label="deleting">删除中</el-radio-button>
            <el-radio-button label="error">错误</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 中间：操作按钮 -->
        <div class="toolbar-section">
          <el-button v-hasPermi="['pve:virtualMachineDataDisk:add']" icon="Plus" type="primary" @click="handleAdd">新增数据盘</el-button>
          <el-button v-hasPermi="['pve:virtualMachineDataDisk:remove']" icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-select v-model="queryParams.diskType" clearable placeholder="磁盘类型" style="width: 120px" @change="handleQuery">
            <el-option label="SSD" value="ssd" />
            <el-option label="HDD" value="hdd" />
          </el-select>
          <el-input
            v-model="queryParams.vmId"
            class="search-input"
            clearable
            placeholder="搜索虚拟机ID"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 数据盘列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="virtualMachineDataDiskList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- 数据盘信息 -->
        <el-table-column label="数据盘信息" min-width="200">
          <template #default="{ row }">
            <div class="disk-info">
              <div class="disk-name-row">
                <el-icon class="disk-icon"><Coin /></el-icon>
                <span class="disk-name">磁盘 {{ row.diskIndex }}</span>
              </div>
              <div class="disk-meta">
                <span class="meta-item">ID: {{ row.diskId }}</span>
                <span v-if="row.pveIdentifier" class="meta-divider">|</span>
                <span v-if="row.pveIdentifier" class="meta-item">{{ row.pveIdentifier }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 虚拟机 -->
        <el-table-column label="虚拟机" width="150">
          <template #default="{ row }">
            <div class="vm-info">
              <el-icon class="vm-icon"><Monitor /></el-icon>
              <span class="vm-id">VM {{ row.vmId }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 容量 -->
        <el-table-column label="容量" width="120" align="center">
          <template #default="{ row }">
            <span class="capacity-value">{{ formatBytes(row.diskSize) }}</span>
          </template>
        </el-table-column>

        <!-- 磁盘类型 -->
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.diskType === 'ssd'" type="success">SSD</el-tag>
            <el-tag v-else-if="row.diskType === 'hdd'" type="info">HDD</el-tag>
            <el-tag v-else type="info">{{ row.diskType }}</el-tag>
          </template>
        </el-table-column>

        <!-- 存储池 -->
        <el-table-column label="存储池" width="150">
          <template #default="{ row }">
            <span v-if="row.storagePool">{{ row.storagePool }}</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">活动</el-tag>
            <el-tag v-else-if="row.status === 'creating'" type="warning">创建中</el-tag>
            <el-tag v-else-if="row.status === 'deleting'" type="danger">删除中</el-tag>
            <el-tag v-else-if="row.status === 'error'" type="danger">错误</el-tag>
            <el-tag v-else type="info">{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <!-- 备注 -->
        <el-table-column label="备注" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.remark">{{ row.remark }}</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
              <el-button link type="primary">
                更多
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-hasPermi="['pve:virtualMachineDataDisk:edit']" command="edit">修改</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'active'" v-hasPermi="['pve:virtualMachineDataDisk:resize']" command="resize">扩容</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'active'" v-hasPermi="['pve:virtualMachineDataDisk:snapshot']" command="snapshot">快照</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:virtualMachineDataDisk:remove']" command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" append-to-body>
      <el-form ref="virtualMachineDataDiskFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="虚拟机ID" prop="vmId">
          <el-input-number v-model="form.vmId" :min="100" placeholder="请输入虚拟机ID" style="width: 100%" />
        </el-form-item>
        <el-form-item label="磁盘序号" prop="diskIndex">
          <el-input-number v-model="form.diskIndex" :min="1" :max="10" placeholder="请输入磁盘序号(1-10)" style="width: 100%" />
        </el-form-item>
        <el-form-item label="磁盘大小(GB)" prop="diskSize">
          <el-input-number v-model="form.diskSize" :min="10" :max="10000" placeholder="请输入磁盘大小" style="width: 100%" />
        </el-form-item>
        <el-form-item label="磁盘类型" prop="diskType">
          <el-select v-model="form.diskType" placeholder="请选择磁盘类型" style="width: 100%">
            <el-option label="SSD" value="ssd" />
            <el-option label="HDD" value="hdd" />
          </el-select>
        </el-form-item>
        <el-form-item label="存储池" prop="storagePool">
          <el-input v-model="form.storagePool" placeholder="请输入存储池名称" />
        </el-form-item>
        <el-form-item label="PVE标识符" prop="pveIdentifier">
          <el-input v-model="form.pveIdentifier" placeholder="如: scsi1, virtio1等" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 扩容对话框 -->
    <el-dialog v-model="resizeDialogVisible" title="扩容数据盘" width="500px" append-to-body>
      <el-form ref="resizeFormRef" :model="resizeForm" :rules="resizeRules" label-width="120px">
        <el-form-item label="当前大小">
          <el-input v-model="currentSize" disabled suffix-icon="GB" />
        </el-form-item>
        <el-form-item label="新大小(GB)" prop="newSize">
          <el-input-number v-model="resizeForm.newSize" :min="currentSize + 1" :max="10000" placeholder="请输入新大小" style="width: 100%" />
        </el-form-item>
        <el-alert title="注意：扩容操作不可逆，请谨慎操作" type="warning" :closable="false" style="margin-top: 10px" />
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resizeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitResize">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="VirtualMachineDataDisk" lang="ts">
import { listVirtualMachineDataDisk, getVirtualMachineDataDisk, delVirtualMachineDataDisk, addVirtualMachineDataDisk, updateVirtualMachineDataDisk } from '@/api/pve/virtualMachineDataDisk';
import type { VirtualMachineDataDiskVO, VirtualMachineDataDiskQuery, VirtualMachineDataDiskForm } from '@/api/pve/virtualMachineDataDisk/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const virtualMachineDataDiskList = ref<VirtualMachineDataDiskVO[]>([]);
const open = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

// 统计数据
const overview = ref({
  totalDisks: 0,
  activeDisks: 0,
  creatingDisks: 0,
  totalCapacity: 0,
  averageSize: 0
});

// 扩容对话框
const resizeDialogVisible = ref(false);
const currentSize = ref(0);
const resizeForm = ref({
  diskId: undefined,
  newSize: 0
});

const virtualMachineDataDiskFormRef = ref<ElFormInstance>();
const resizeFormRef = ref<ElFormInstance>();

const queryParams = ref<VirtualMachineDataDiskQuery>({
  pageNum: 1,
  pageSize: 10,
  vmId: undefined,
  status: '',
  diskType: undefined
});

const form = ref<VirtualMachineDataDiskForm>({});

const rules = ref({
  vmId: [{ required: true, message: '虚拟机ID不能为空', trigger: 'blur' }],
  diskIndex: [{ required: true, message: '磁盘序号不能为空', trigger: 'blur' }],
  diskSize: [{ required: true, message: '磁盘大小不能为空', trigger: 'blur' }],
  storagePool: [{ required: true, message: '存储池不能为空', trigger: 'blur' }]
});

const resizeRules = ref({
  newSize: [{ required: true, message: '新大小不能为空', trigger: 'blur' }]
});

/** 格式化字节为易读格式 */
function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/** 计算统计数据 */
function calculateOverview() {
  const total = virtualMachineDataDiskList.value.length;
  const active = virtualMachineDataDiskList.value.filter((disk) => disk.status === 'active').length;
  const creating = virtualMachineDataDiskList.value.filter((disk) => disk.status === 'creating').length;
  const totalCap = virtualMachineDataDiskList.value.reduce((sum, disk) => sum + (disk.diskSize || 0), 0);

  overview.value = {
    totalDisks: total,
    activeDisks: active,
    creatingDisks: creating,
    totalCapacity: totalCap,
    averageSize: total > 0 ? Math.round(totalCap / total) : 0
  };
}

/** 查询数据盘列表 */
function getList() {
  loading.value = true;
  listVirtualMachineDataDisk(queryParams.value).then((response: any) => {
    virtualMachineDataDiskList.value = response.rows;
    total.value = response.total;
    calculateOverview();
    loading.value = false;
  });
}

/** 刷新 */
function handleRefresh() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    vmId: undefined,
    status: '',
    diskType: undefined
  };
  getList();
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    diskId: undefined,
    vmId: undefined,
    diskIndex: undefined,
    diskSize: 100,
    diskType: 'ssd',
    storagePool: undefined,
    pveIdentifier: undefined,
    status: 'active',
    remark: undefined
  };
  virtualMachineDataDiskFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: VirtualMachineDataDiskVO[]) {
  ids.value = selection.map((item) => item.diskId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加数据盘';
}

/** 修改按钮操作 */
function handleUpdate(row: VirtualMachineDataDiskVO) {
  reset();
  const diskId = row.diskId || ids.value[0];
  getVirtualMachineDataDisk(diskId).then((response: any) => {
    form.value = response.data;
    open.value = true;
    title.value = '修改数据盘';
  });
}

/** 提交按钮 */
function submitForm() {
  virtualMachineDataDiskFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (form.value.diskId) {
        updateVirtualMachineDataDisk(form.value).then(() => {
          proxy?.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addVirtualMachineDataDisk(form.value).then(() => {
          proxy?.$modal.msgSuccess('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row?: VirtualMachineDataDiskVO) {
  const diskIds = row?.diskId || ids.value;
  proxy?.$modal
    .confirm('是否确认删除数据盘编号为"' + diskIds + '"的数据项？')
    .then(() => {
      return delVirtualMachineDataDisk(diskIds);
    })
    .then(() => {
      getList();
      proxy?.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 扩容数据盘 */
function handleResize(row: VirtualMachineDataDiskVO) {
  currentSize.value = row.diskSize;
  resizeForm.value = {
    diskId: row.diskId,
    newSize: row.diskSize + 10
  };
  resizeDialogVisible.value = true;
}

/** 提交扩容 */
function submitResize() {
  resizeFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      proxy?.$modal.msgInfo('扩容功能开发中...');
      resizeDialogVisible.value = false;
    }
  });
}

/** 创建快照 */
function handleSnapshot(row: VirtualMachineDataDiskVO) {
  proxy?.$modal.msgInfo('快照功能开发中...');
}

/** 操作命令处理 */
function handleCommand(command: string, row: VirtualMachineDataDiskVO) {
  switch (command) {
    case 'edit':
      handleUpdate(row);
      break;
    case 'resize':
      handleResize(row);
      break;
    case 'snapshot':
      handleSnapshot(row);
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
}

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.data-disk-container {
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
  &.active {
    color: #67c23a;
  }
  &.creating {
    color: #e6a23c;
  }
  &.capacity {
    color: #f56c6c;
  }
  &.average {
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

/* 数据盘信息 */
.disk-info {
  .disk-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .disk-icon {
    font-size: 18px;
    color: #409eff;
    margin-right: 8px;
  }

  .disk-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .disk-meta {
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

/* 虚拟机信息 */
.vm-info {
  display: flex;
  align-items: center;
  gap: 6px;

  .vm-icon {
    font-size: 16px;
    color: #409eff;
  }

  .vm-id {
    font-size: 13px;
    color: #606266;
  }
}

/* 容量值 */
.capacity-value {
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
}
</style>

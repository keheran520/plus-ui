<template>
  <div class="cloud-disk-container">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Coin /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalDisks }}</span>
          <span class="stat-label">总云硬盘</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon available"><CircleCheck /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.availableDisks }}</span>
          <span class="stat-label">可用</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon attached"><Link /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.attachedDisks }}</span>
          <span class="stat-label">已挂载</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon capacity"><Odometer /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalCapacity }}</span>
          <span class="stat-label">总容量(GB)</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon usage"><DataAnalysis /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.usageRate }}%</span>
          <span class="stat-label">使用率</span>
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
            <el-radio-button label="available">可用</el-radio-button>
            <el-radio-button label="attached">已挂载</el-radio-button>
            <el-radio-button label="creating">创建中</el-radio-button>
            <el-radio-button label="error">错误</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 中间：操作按钮 -->
        <div class="toolbar-section">
          <el-button v-hasPermi="['pve:cloudDisk:add']" icon="Plus" type="primary" @click="handleAdd">新增硬盘</el-button>
          <el-button v-hasPermi="['pve:cloudDisk:remove']" icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-select v-model="queryParams.diskType" clearable placeholder="硬盘类型" style="width: 120px" @change="handleQuery">
            <el-option label="系统盘" value="system" />
            <el-option label="数据盘" value="data" />
          </el-select>
          <el-input
            v-model="queryParams.diskName"
            class="search-input"
            clearable
            placeholder="搜索硬盘名称"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 硬盘列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="diskList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- 硬盘信息 -->
        <el-table-column label="硬盘信息" min-width="220">
          <template #default="{ row }">
            <div class="disk-info">
              <div class="disk-name-row">
                <el-icon class="disk-icon"><Coin /></el-icon>
                <span class="disk-name">{{ row.diskName }}</span>
              </div>
              <div class="disk-meta">
                <span class="meta-item">ID: {{ row.diskId }}</span>
                <span v-if="row.pveDiskId" class="meta-divider">|</span>
                <span v-if="row.pveDiskId" class="meta-item">PVE: {{ row.pveDiskId }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 硬盘类型 -->
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.diskType === 'system'" type="primary">系统盘</el-tag>
            <el-tag v-else-if="row.diskType === 'data'" type="success">数据盘</el-tag>
            <el-tag v-else type="info">{{ row.diskType }}</el-tag>
          </template>
        </el-table-column>

        <!-- 容量 -->
        <el-table-column label="容量" width="120" align="center">
          <template #default="{ row }">
            <span class="capacity-value">{{ row.size }} GB</span>
          </template>
        </el-table-column>

        <!-- 格式和总线 -->
        <el-table-column label="格式/总线" min-width="150">
          <template #default="{ row }">
            <div class="format-info">
              <div class="format-item">
                <span class="format-label">格式:</span>
                <span class="format-value">{{ row.diskFormat || '-' }}</span>
              </div>
              <div class="format-item">
                <span class="format-label">总线:</span>
                <span class="format-value">{{ row.busType || '-' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 设备名称 -->
        <el-table-column label="设备名称" width="120">
          <template #default="{ row }">
            <span v-if="row.deviceName">{{ row.deviceName }}</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'available'" type="success">可用</el-tag>
            <el-tag v-else-if="row.status === 'attached'" type="primary">已挂载</el-tag>
            <el-tag v-else-if="row.status === 'creating'" type="warning">创建中</el-tag>
            <el-tag v-else-if="row.status === 'deleting'" type="danger">删除中</el-tag>
            <el-tag v-else-if="row.status === 'error'" type="danger">错误</el-tag>
            <el-tag v-else type="info">{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column label="创建时间" width="160" align="center">
          <template #default="{ row }">
            <span v-if="row.createTime">{{ row.createTime }}</span>
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
                  <el-dropdown-item v-hasPermi="['pve:cloudDisk:edit']" command="edit">修改</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'available'" v-hasPermi="['pve:cloudDisk:attach']" command="attach">挂载</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'attached'" v-hasPermi="['pve:cloudDisk:detach']" command="detach">卸载</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:cloudDisk:remove']" command="delete" divided>删除</el-dropdown-item>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="硬盘名称" prop="diskName">
          <el-input v-model="form.diskName" placeholder="请输入硬盘名称" />
        </el-form-item>
        <el-form-item label="大小(GB)" prop="size">
          <el-input-number v-model="form.size" :min="10" :max="5000" placeholder="请输入大小" style="width: 100%" />
        </el-form-item>
        <el-form-item label="硬盘类型" prop="diskType">
          <el-select v-model="form.diskType" placeholder="请选择硬盘类型" style="width: 100%">
            <el-option label="系统盘" value="system" />
            <el-option label="数据盘" value="data" />
          </el-select>
        </el-form-item>
        <el-form-item label="磁盘格式" prop="diskFormat">
          <el-select v-model="form.diskFormat" placeholder="请选择磁盘格式" style="width: 100%">
            <el-option label="raw" value="raw" />
            <el-option label="qcow2" value="qcow2" />
            <el-option label="vmdk" value="vmdk" />
          </el-select>
        </el-form-item>
        <el-form-item label="总线类型" prop="busType">
          <el-select v-model="form.busType" placeholder="请选择总线类型" style="width: 100%">
            <el-option label="ide" value="ide" />
            <el-option label="sata" value="sata" />
            <el-option label="scsi" value="scsi" />
            <el-option label="virtio" value="virtio" />
          </el-select>
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
  </div>
</template>


<script setup name="CloudDisk" lang="ts">
import { listCloudDisk, getCloudDisk, addCloudDisk, updateCloudDisk, delCloudDisk, getOverview } from '@/api/pve/cloudDisk';
import type { PveCloudDiskVO, PveCloudDiskForm, PveCloudDiskQuery } from '@/api/pve/cloudDisk/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const diskList = ref<PveCloudDiskVO[]>([]);
const dialogVisible = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dialogTitle = ref('');

// 统计数据
const overview = ref({
  totalDisks: 0,
  availableDisks: 0,
  attachedDisks: 0,
  totalCapacity: 0,
  usageRate: 0
});

const formRef = ref<ElFormInstance>();

const queryParams = ref<PveCloudDiskQuery>({
  pageNum: 1,
  pageSize: 10,
  diskName: undefined,
  status: '',
  diskType: undefined
});

const form = ref<PveCloudDiskForm>({});

const rules = ref({
  diskName: [{ required: true, message: '硬盘名称不能为空', trigger: 'blur' }],
  size: [{ required: true, message: '大小不能为空', trigger: 'blur' }],
  diskType: [{ required: true, message: '硬盘类型不能为空', trigger: 'change' }],
  diskFormat: [{ required: true, message: '磁盘格式不能为空', trigger: 'change' }],
  busType: [{ required: true, message: '总线类型不能为空', trigger: 'change' }]
});

/** 获取统计概览 */
function loadOverview() {
  getOverview().then((response: any) => {
    const data = response.data || {};
    overview.value = {
      totalDisks: data.totalDisks || 0,
      availableDisks: data.availableDisks || 0,
      attachedDisks: data.attachedDisks || 0,
      totalCapacity: data.totalCapacity || 0,
      usageRate: data.totalDisks > 0 ? Math.round((data.attachedDisks / data.totalDisks) * 100) : 0
    };
  });
}

/** 查询云硬盘列表 */
function getList() {
  loading.value = true;
  listCloudDisk(queryParams.value).then((response: any) => {
    diskList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 刷新 */
function handleRefresh() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    diskName: undefined,
    status: '',
    diskType: undefined
  };
  getList();
  loadOverview();
}

/** 取消按钮 */
function cancel() {
  dialogVisible.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    diskId: undefined,
    diskName: undefined,
    size: 100,
    diskType: 'data',
    diskFormat: 'raw',
    busType: 'virtio',
    status: 'available',
    remark: undefined
  };
  formRef.value?.resetFields();
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: PveCloudDiskVO[]) {
  ids.value = selection.map((item) => item.diskId);
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  dialogVisible.value = true;
  dialogTitle.value = '添加云硬盘';
}

/** 修改按钮操作 */
function handleUpdate(row: PveCloudDiskVO) {
  reset();
  const diskId = row.diskId;
  getCloudDisk(diskId).then((response: any) => {
    form.value = response.data;
    dialogVisible.value = true;
    dialogTitle.value = '修改云硬盘';
  });
}

/** 提交按钮 */
function submitForm() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (form.value.diskId) {
        updateCloudDisk(form.value).then(() => {
          proxy?.$modal.msgSuccess('修改成功');
          dialogVisible.value = false;
          getList();
          loadOverview();
        });
      } else {
        addCloudDisk(form.value).then(() => {
          proxy?.$modal.msgSuccess('新增成功');
          dialogVisible.value = false;
          getList();
          loadOverview();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row?: PveCloudDiskVO) {
  const diskIds = row?.diskId ? [row.diskId] : ids.value;
  proxy?.$modal
    .confirm('是否确认删除云硬盘编号为"' + diskIds + '"的数据项？')
    .then(() => {
      return delCloudDisk(diskIds);
    })
    .then(() => {
      getList();
      loadOverview();
      proxy?.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 挂载硬盘 */
function handleAttach(row: PveCloudDiskVO) {
  proxy?.$modal.msgInfo('挂载功能开发中...');
}

/** 卸载硬盘 */
function handleDetach(row: PveCloudDiskVO) {
  proxy?.$modal.msgInfo('卸载功能开发中...');
}

/** 操作命令处理 */
function handleCommand(command: string, row: PveCloudDiskVO) {
  switch (command) {
    case 'edit':
      handleUpdate(row);
      break;
    case 'attach':
      handleAttach(row);
      break;
    case 'detach':
      handleDetach(row);
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
}

onMounted(() => {
  loadOverview();
  getList();
});
</script>


<style scoped lang="scss">
.cloud-disk-container {
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
    color: #667eea;
  }
  &.available {
    color: #67c23a;
  }
  &.attached {
    color: #409eff;
  }
  &.capacity {
    color: #e6a23c;
  }
  &.usage {
    color: #f56c6c;
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

/* 硬盘信息 */
.disk-info {
  .disk-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .disk-icon {
    font-size: 18px;
    color: #667eea;
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

/* 容量值 */
.capacity-value {
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
}

/* 格式信息 */
.format-info {
  .format-item {
    display: flex;
    align-items: center;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .format-label {
    font-size: 12px;
    color: #909399;
    width: 40px;
  }

  .format-value {
    font-size: 13px;
    color: #606266;
  }
}
</style>

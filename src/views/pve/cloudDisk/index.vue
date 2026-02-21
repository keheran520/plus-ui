<template>
  <div class="p-2">
    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="mb-[10px]">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon :size="32">
                <Coin />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalDisks }}</div>
              <div class="stat-label">总云硬盘数</div>
              <div class="stat-today">可用 {{ overview.availableDisks }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon available">
              <el-icon :size="32">
                <CircleCheck />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.availableDisks }}</div>
              <div class="stat-label">可用云硬盘</div>
              <div class="stat-today">未挂载</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon attached">
              <el-icon :size="32">
                <Link />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.attachedDisks }}</div>
              <div class="stat-label">已挂载</div>
              <div class="stat-today">使用中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon capacity">
              <el-icon :size="32">
                <Odometer />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalCapacity }}</div>
              <div class="stat-label">总容量</div>
              <div class="stat-today">GB</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="never">
          <el-form ref="queryRef" :inline="true" :model="queryParams">
            <el-form-item label="硬盘名称" prop="diskName">
              <el-input v-model="queryParams.diskName" clearable placeholder="请输入硬盘名称" style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" clearable placeholder="请选择状态" style="width: 150px">
                <el-option label="可用" value="available" />
                <el-option label="已挂载" value="attached" />
                <el-option label="创建中" value="creating" />
                <el-option label="删除中" value="deleting" />
                <el-option label="错误" value="error" />
              </el-select>
            </el-form-item>
            <el-form-item label="硬盘类型" prop="diskType">
              <el-select v-model="queryParams.diskType" clearable placeholder="请选择硬盘类型" style="width: 150px">
                <el-option label="系统盘" value="system" />
                <el-option label="数据盘" value="data" />
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

    <!-- 操作按钮和表格区域 -->
    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:cloudDisk:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:cloudDisk:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:cloudDisk:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="diskList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" fixed type="selection" width="50" />
        <el-table-column align="center" label="硬盘ID" prop="diskId" width="100" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="硬盘名称" prop="diskName" width="180" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="PVE硬盘标识" prop="pveDiskId" width="180" />
        <el-table-column align="center" label="大小(GB)" prop="size" width="100" />
        <el-table-column align="center" label="硬盘类型" prop="diskType" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.diskType === 'system'" type="primary">系统盘</el-tag>
            <el-tag v-else-if="row.diskType === 'data'" type="success">数据盘</el-tag>
            <el-tag v-else type="info">{{ row.diskType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="磁盘格式" prop="diskFormat" width="100" />
        <el-table-column align="center" label="总线类型" prop="busType" width="100" />
        <el-table-column align="center" label="状态" prop="status" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'available'" type="success">可用</el-tag>
            <el-tag v-else-if="row.status === 'attached'" type="primary">已挂载</el-tag>
            <el-tag v-else-if="row.status === 'creating'" type="warning">创建中</el-tag>
            <el-tag v-else-if="row.status === 'deleting'" type="danger">删除中</el-tag>
            <el-tag v-else-if="row.status === 'error'" type="danger">错误</el-tag>
            <el-tag v-else type="info">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="设备名称" prop="deviceName" width="120" />
        <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="180">
          <template #default="{ row }">
            <el-button v-hasPermi="['pve:cloudDisk:edit']" icon="Edit" link type="primary" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['pve:cloudDisk:remove']" icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" append-to-body width="700px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="硬盘名称" prop="diskName">
              <el-input v-model="form.diskName" placeholder="请输入硬盘名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="大小(GB)" prop="size">
              <el-input-number v-model="form.size" :min="10" :max="5000" placeholder="请输入大小" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="硬盘类型" prop="diskType">
              <el-select v-model="form.diskType" placeholder="请选择硬盘类型" style="width: 100%">
                <el-option label="系统盘" value="system" />
                <el-option label="数据盘" value="data" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="磁盘格式" prop="diskFormat">
              <el-select v-model="form.diskFormat" placeholder="请选择磁盘格式" style="width: 100%">
                <el-option label="raw" value="raw" />
                <el-option label="qcow2" value="qcow2" />
                <el-option label="vmdk" value="vmdk" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="总线类型" prop="busType">
              <el-select v-model="form.busType" placeholder="请选择总线类型" style="width: 100%">
                <el-option label="ide" value="ide" />
                <el-option label="sata" value="sata" />
                <el-option label="scsi" value="scsi" />
                <el-option label="virtio" value="virtio" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="可用" value="available" />
                <el-option label="已挂载" value="attached" />
                <el-option label="创建中" value="creating" />
                <el-option label="删除中" value="deleting" />
                <el-option label="错误" value="error" />
              </el-select>
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
  </div>
</template>

<script lang="ts" setup>
import { listCloudDisk, getCloudDisk, addCloudDisk, updateCloudDisk, delCloudDisk, getOverview } from '@/api/pve/cloudDisk';
import type { PveCloudDiskVO, PveCloudDiskForm, PveCloudDiskQuery } from '@/api/pve/cloudDisk/types';

const { proxy } = getCurrentInstance() as any;

const diskList = ref<PveCloudDiskVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('');

// 统计概览数据
const overview = ref({
  totalDisks: 0,
  availableDisks: 0,
  attachedDisks: 0,
  totalCapacity: 0
});

const queryParams = ref<PveCloudDiskQuery>({
  pageNum: 1,
  pageSize: 10,
  diskName: undefined,
  status: undefined,
  diskType: undefined
});
const queryRef = ref();

const form = ref<PveCloudDiskForm>({});
const formRef = ref();

const rules = {
  diskName: [{ required: true, message: '硬盘名称不能为空', trigger: 'blur' }],
  size: [{ required: true, message: '大小不能为空', trigger: 'blur' }],
  diskType: [{ required: true, message: '硬盘类型不能为空', trigger: 'change' }],
  diskFormat: [{ required: true, message: '磁盘格式不能为空', trigger: 'change' }],
  busType: [{ required: true, message: '总线类型不能为空', trigger: 'change' }]
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

/** 查询云硬盘列表 */
function getList() {
  loading.value = true;
  listCloudDisk(queryParams.value)
    .then((response: any) => {
      diskList.value = response.rows;
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
  handleQuery();
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
  proxy.$refs['formRef'].validate((valid: boolean) => {
    if (valid) {
      if (form.value.diskId) {
        updateCloudDisk(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功');
          dialogVisible.value = false;
          getList();
          loadOverview();
        });
      } else {
        addCloudDisk(form.value).then(() => {
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
function handleDelete(row?: PveCloudDiskVO) {
  const diskIds = row?.diskId ? [row.diskId] : ids.value;
  proxy.$modal
    .confirm('是否确认删除云硬盘编号为"' + diskIds + '"的数据项？')
    .then(() => {
      return delCloudDisk(diskIds);
    })
    .then(() => {
      getList();
      loadOverview();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'pve/cloudDisk/export',
    {
      ...queryParams.value
    },
    `cloudDisk_${new Date().getTime()}.xlsx`
  );
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
  formRef.value?.clearValidate();
}

// 初始化
loadOverview();
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

    &.available {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.attached {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.capacity {
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

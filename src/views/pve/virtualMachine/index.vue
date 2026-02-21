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
              <div class="stat-value">{{ overview.totalVms }}</div>
              <div class="stat-label">总虚拟机数</div>
              <div class="stat-today">运行中 {{ overview.runningVms }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon running">
              <el-icon :size="32">
                <VideoPlay />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.runningVms }}</div>
              <div class="stat-label">运行中</div>
              <div class="stat-today">已停止 {{ overview.stoppedVms }}</div>
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
              <div class="stat-today">vCPU</div>
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
              <div class="stat-value">{{ overview.totalMemory }}</div>
              <div class="stat-label">总内存</div>
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
            <el-form-item label="虚拟机名称" prop="vmName">
              <el-input v-model="queryParams.vmName" clearable placeholder="请输入虚拟机名称" style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="节点" prop="nodeId">
              <el-select v-model="queryParams.nodeId" clearable placeholder="请选择节点" style="width: 200px">
                <el-option v-for="node in nodeList" :key="node.nodeId" :label="node.nodeName" :value="node.nodeId" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" clearable placeholder="请选择状态" style="width: 150px">
                <el-option label="运行中" value="running" />
                <el-option label="已停止" value="stopped" />
                <el-option label="暂停" value="paused" />
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
            <el-button v-hasPermi="['pve:virtualMachine:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:virtualMachine:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:virtualMachine:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="vmList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" fixed type="selection" width="50" />
        <el-table-column align="center" label="虚拟机ID" prop="vmId" width="100" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="虚拟机名称" prop="vmName" width="180" />
        <el-table-column align="center" label="PVE VM ID" prop="pveVmId" width="120" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="节点" prop="nodeName" width="150" />
        <el-table-column align="center" label="状态" prop="status" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'running'" type="success">运行中</el-tag>
            <el-tag v-else-if="row.status === 'stopped'" type="info">已停止</el-tag>
            <el-tag v-else-if="row.status === 'paused'" type="warning">暂停</el-tag>
            <el-tag v-else type="info">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作系统" prop="osType" width="120" />
        <el-table-column align="center" label="CPU核心" prop="cpuCores" width="100">
          <template #default="{ row }">{{ row.cpuCores }} vCPU</template>
        </el-table-column>
        <el-table-column align="center" label="内存" prop="memorySize" width="100">
          <template #default="{ row }">{{ row.memorySize }} GB</template>
        </el-table-column>
        <el-table-column align="center" label="系统盘" prop="systemDiskSize" width="100">
          <template #default="{ row }">{{ row.systemDiskSize }} GB</template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="镜像" prop="imageName" width="150" />
        <el-table-column align="center" label="自动启动" prop="autoStart" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.autoStart === '1'" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="180">
          <template #default="{ row }">
            <el-button v-hasPermi="['pve:virtualMachine:edit']" icon="Edit" link type="primary" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['pve:virtualMachine:remove']" icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

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
              <el-input-number v-model="form.cpuCores" :min="1" :max="64" placeholder="请输入CPU核心数" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="内存大小(GB)" prop="memorySize">
              <el-input-number v-model="form.memorySize" :min="1" :max="512" placeholder="请输入内存大小" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="系统盘大小(GB)" prop="systemDiskSize">
              <el-input-number v-model="form.systemDiskSize" :min="10" :max="2000" placeholder="请输入系统盘大小" style="width: 100%" />
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
  </div>
</template>

<script lang="ts" setup>
import { listVirtualMachine, getVirtualMachine, addVirtualMachine, updateVirtualMachine, delVirtualMachine, getOverview } from '@/api/pve/virtualMachine';
import type { PveVirtualMachineVO, PveVirtualMachineForm, PveVirtualMachineQuery } from '@/api/pve/virtualMachine/types';
import { listNode } from '@/api/pve/node';

const { proxy } = getCurrentInstance() as any;

const vmList = ref<PveVirtualMachineVO[]>([]);
const nodeList = ref<any[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('');

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
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: PveVirtualMachineVO[]) {
  ids.value = selection.map((item) => item.vmId);
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  dialogVisible.value = true;
  dialogTitle.value = '添加虚拟机';
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

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'pve/virtualMachine/export',
    {
      ...queryParams.value
    },
    `virtualMachine_${new Date().getTime()}.xlsx`
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

// 初始化
loadOverview();
loadNodeList();
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

    &.running {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.cpu {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.memory {
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

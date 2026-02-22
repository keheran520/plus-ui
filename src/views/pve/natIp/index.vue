<template>
  <div class="nat-ip-container">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Share /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalRules }}</span>
          <span class="stat-label">总规则</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon active"><CircleCheck /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.activeRules }}</span>
          <span class="stat-label">已启用</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon tcp"><Connection /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.tcpRules }}</span>
          <span class="stat-label">TCP</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon udp"><Connection /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.udpRules }}</span>
          <span class="stat-label">UDP</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon vm"><Monitor /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.boundVms }}</span>
          <span class="stat-label">绑定VM</span>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar-container">
      <div class="toolbar-main">
        <!-- 左侧：协议筛选 -->
        <div class="toolbar-section">
          <el-radio-group v-model="queryParams.protocol" @change="handleQuery">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="TCP">TCP</el-radio-button>
            <el-radio-button label="UDP">UDP</el-radio-button>
            <el-radio-button label="ALL">ALL</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 中间：操作按钮 -->
        <div class="toolbar-section">
          <el-button v-hasPermi="['pve:natIp:add']" icon="Plus" type="primary" @click="handleAdd">新增规则</el-button>
          <el-button v-hasPermi="['pve:natIp:remove']" icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-select v-model="queryParams.status" clearable placeholder="状态" style="width: 120px" @change="handleQuery">
            <el-option label="可用" value="available" />
            <el-option label="已用" value="used" />
          </el-select>
          <el-input
            v-model="queryParams.ruleName"
            class="search-input"
            clearable
            placeholder="搜索规则名称"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- NAT规则列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="natIpList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- 规则名称 -->
        <el-table-column label="规则名称" min-width="180">
          <template #default="{ row }">
            <div class="rule-info">
              <div class="rule-name-row">
                <el-icon class="rule-icon"><Share /></el-icon>
                <span class="rule-name">{{ row.ruleName || '未命名规则' }}</span>
              </div>
              <div v-if="row.natId" class="rule-meta">
                <span class="meta-item">ID: {{ row.natId }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 内网IP:端口 -->
        <el-table-column label="内网IP:端口" min-width="180">
          <template #default="{ row }">
            <div class="ip-port-info">
              <div class="ip-port-row">
                <el-icon class="ip-icon"><Connection /></el-icon>
                <span class="ip-value">{{ row.privateIp }}</span>
                <span class="port-separator">:</span>
                <span class="port-value">{{ row.privatePort }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 映射箭头 -->
        <el-table-column label="" width="60" align="center">
          <template>
            <el-icon class="arrow-icon" :size="20"><Right /></el-icon>
          </template>
        </el-table-column>

        <!-- 公网IP:端口 -->
        <el-table-column label="公网IP:端口" min-width="180">
          <template #default="{ row }">
            <div class="ip-port-info">
              <div class="ip-port-row">
                <el-icon class="ip-icon public"><Link /></el-icon>
                <span class="ip-value">{{ row.publicIp }}</span>
                <span class="port-separator">:</span>
                <span class="port-value">{{ row.publicPort }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 协议 -->
        <el-table-column label="协议" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.protocol === 'TCP'" type="success">TCP</el-tag>
            <el-tag v-else-if="row.protocol === 'UDP'" type="warning">UDP</el-tag>
            <el-tag v-else type="info">ALL</el-tag>
          </template>
        </el-table-column>

        <!-- 绑定虚拟机 -->
        <el-table-column label="绑定虚拟机" width="150">
          <template #default="{ row }">
            <div v-if="row.vmId" class="vm-info">
              <el-icon class="vm-icon"><Monitor /></el-icon>
              <span class="vm-name">{{ row.vmName || row.vmId }}</span>
            </div>
            <span v-else style="color: #999">未绑定</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleStatusCommand(cmd, row)">
              <div class="status-dropdown">
                <el-tag :type="row.status === 'available' ? 'success' : 'warning'" class="status-tag">
                  {{ row.status === 'available' ? '可用' : '已用' }}
                  <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
                </el-tag>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="row.status === 'used'" command="enable">启用</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'available'" command="disable">停用</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
              <el-button link type="primary">
                更多
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-hasPermi="['pve:natIp:edit']" command="edit">修改</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:natIp:remove']" command="delete" divided>删除</el-dropdown-item>
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
      <el-form ref="natIpFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="form.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="内网IP" prop="privateIp">
          <el-input v-model="form.privateIp" placeholder="请输入内网IP地址" />
        </el-form-item>
        <el-form-item label="内网端口" prop="privatePort">
          <el-input-number v-model="form.privatePort" :min="1" :max="65535" placeholder="请输入内网端口" style="width: 100%" />
        </el-form-item>
        <el-form-item label="公网IP" prop="publicIp">
          <el-input v-model="form.publicIp" placeholder="请输入公网IP地址" />
        </el-form-item>
        <el-form-item label="公网端口" prop="publicPort">
          <el-input-number v-model="form.publicPort" :min="1" :max="65535" placeholder="请输入公网端口" style="width: 100%" />
        </el-form-item>
        <el-form-item label="协议类型" prop="protocol">
          <el-select v-model="form.protocol" placeholder="请选择协议类型" style="width: 100%">
            <el-option label="TCP" value="TCP" />
            <el-option label="UDP" value="UDP" />
            <el-option label="ALL" value="ALL" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="可用" value="available" />
            <el-option label="已用" value="used" />
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

<script setup name="NatIp" lang="ts">
import { listNatIp, getNatIp, delNatIp, addNatIp, updateNatIp } from '@/api/pve/natIp';
import type { NatIpVO, NatIpQuery, NatIpForm } from '@/api/pve/natIp/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const natIpList = ref<NatIpVO[]>([]);
const open = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

// 统计数据
const overview = ref({
  totalRules: 0,
  activeRules: 0,
  tcpRules: 0,
  udpRules: 0,
  boundVms: 0
});

const natIpFormRef = ref<ElFormInstance>();

const queryParams = ref<NatIpQuery>({
  pageNum: 1,
  pageSize: 10,
  ruleName: undefined,
  protocol: '',
  status: undefined
});

const form = ref<NatIpForm>({});

const rules = ref({
  ruleName: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }],
  privateIp: [{ required: true, message: '内网IP不能为空', trigger: 'blur' }],
  publicIp: [{ required: true, message: '公网IP不能为空', trigger: 'blur' }],
  privatePort: [{ required: true, message: '内网端口不能为空', trigger: 'blur' }],
  publicPort: [{ required: true, message: '公网端口不能为空', trigger: 'blur' }],
  protocol: [{ required: true, message: '协议类型不能为空', trigger: 'change' }]
});

/** 计算统计数据 */
function calculateOverview() {
  const total = natIpList.value.length;
  const active = natIpList.value.filter((rule) => rule.status === 'available').length;
  const tcp = natIpList.value.filter((rule) => rule.protocol === 'TCP').length;
  const udp = natIpList.value.filter((rule) => rule.protocol === 'UDP').length;
  const bound = natIpList.value.filter((rule) => rule.vmId).length;

  overview.value = {
    totalRules: total,
    activeRules: active,
    tcpRules: tcp,
    udpRules: udp,
    boundVms: bound
  };
}

/** 查询NAT规则列表 */
function getList() {
  loading.value = true;
  listNatIp(queryParams.value).then((response: any) => {
    natIpList.value = response.rows;
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
    ruleName: undefined,
    protocol: '',
    status: undefined
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
    natId: undefined,
    privateIp: undefined,
    publicIp: undefined,
    privatePort: undefined,
    publicPort: undefined,
    protocol: undefined,
    status: 'available',
    vmId: undefined,
    ruleName: undefined,
    remark: undefined
  };
  natIpFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: NatIpVO[]) {
  ids.value = selection.map((item) => item.natId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加NAT规则';
}

/** 修改按钮操作 */
function handleUpdate(row: NatIpVO) {
  reset();
  const natId = row.natId || ids.value[0];
  getNatIp(natId).then((response: any) => {
    form.value = response.data;
    open.value = true;
    title.value = '修改NAT规则';
  });
}

/** 提交按钮 */
function submitForm() {
  natIpFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (form.value.natId) {
        updateNatIp(form.value).then(() => {
          proxy?.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addNatIp(form.value).then(() => {
          proxy?.$modal.msgSuccess('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row?: NatIpVO) {
  const natIds = row?.natId || ids.value;
  proxy?.$modal
    .confirm('是否确认删除NAT规则编号为"' + natIds + '"的数据项？')
    .then(() => {
      return delNatIp(natIds);
    })
    .then(() => {
      getList();
      proxy?.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 状态命令处理 */
function handleStatusCommand(command: string, row: NatIpVO) {
  const newStatus = command === 'enable' ? 'available' : 'used';
  const text = command === 'enable' ? '启用' : '停用';

  proxy?.$modal
    .confirm('确认要"' + text + '""' + row.ruleName + '"规则吗？')
    .then(() => {
      row.status = newStatus;
      return updateNatIp(row);
    })
    .then(() => {
      proxy?.$modal.msgSuccess(text + '成功');
      getList();
    })
    .catch(() => {
      getList();
    });
}

/** 操作命令处理 */
function handleCommand(command: string, row: NatIpVO) {
  switch (command) {
    case 'edit':
      handleUpdate(row);
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
.nat-ip-container {
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
  &.tcp {
    color: #e6a23c;
  }
  &.udp {
    color: #909399;
  }
  &.vm {
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

/* 规则信息 */
.rule-info {
  .rule-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .rule-icon {
    font-size: 18px;
    color: #409eff;
    margin-right: 8px;
  }

  .rule-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .rule-meta {
    font-size: 12px;
    color: #909399;
    padding-left: 26px;
  }

  .meta-item {
    margin-right: 4px;
  }
}

/* IP端口信息 */
.ip-port-info {
  .ip-port-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ip-icon {
    font-size: 16px;
    color: #409eff;

    &.public {
      color: #67c23a;
    }
  }

  .ip-value {
    font-size: 13px;
    color: #303133;
    font-family: 'Courier New', monospace;
    font-weight: 500;
  }

  .port-separator {
    color: #909399;
  }

  .port-value {
    font-size: 13px;
    color: #409eff;
    font-weight: 600;
  }
}

/* 映射箭头 */
.arrow-icon {
  color: #909399;
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

  .vm-name {
    font-size: 13px;
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

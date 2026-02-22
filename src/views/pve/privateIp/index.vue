<template>
  <div class="private-ip-container">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Connection /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalIps }}</span>
          <span class="stat-label">总IP数</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon available"><CircleCheck /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.availableIps }}</span>
          <span class="stat-label">可用</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon used"><Monitor /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.usedIps }}</span>
          <span class="stat-label">已用</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon reserved"><Lock /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.reservedIps }}</span>
          <span class="stat-label">保留</span>
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
            <el-radio-button label="used">已用</el-radio-button>
            <el-radio-button label="reserved">保留</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 中间：操作按钮 -->
        <div class="toolbar-section">
          <el-button v-hasPermi="['pve:privateIp:add']" icon="Plus" type="primary" @click="handleAdd">新增IP</el-button>
          <el-button v-hasPermi="['pve:privateIp:remove']" icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-select v-model="queryParams.poolId" clearable placeholder="地址池" style="width: 150px" @change="handleQuery">
            <el-option v-for="pool in poolList" :key="pool.poolId" :label="pool.poolName" :value="pool.poolId" />
          </el-select>
          <el-input
            v-model="queryParams.ipAddress"
            class="search-input"
            clearable
            placeholder="搜索IP地址"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- IP列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="privateIpList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- IP地址 -->
        <el-table-column label="IP地址" min-width="180">
          <template #default="{ row }">
            <div class="ip-info">
              <div class="ip-address-row">
                <el-icon class="ip-icon"><Connection /></el-icon>
                <span class="ip-address">{{ row.ipAddress }}</span>
              </div>
              <div v-if="row.ipId" class="ip-meta">
                <span class="meta-item">ID: {{ row.ipId }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 地址池 -->
        <el-table-column label="地址池" width="150">
          <template #default="{ row }">
            <span v-if="row.poolName" class="pool-name">{{ row.poolName }}</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <!-- 网络配置 -->
        <el-table-column label="网络配置" min-width="200">
          <template #default="{ row }">
            <div class="network-config">
              <div v-if="row.subnetMask" class="config-item">
                <span class="config-label">掩码:</span>
                <span class="config-value">{{ row.subnetMask }}</span>
              </div>
              <div v-if="row.gateway" class="config-item">
                <span class="config-label">网关:</span>
                <span class="config-value">{{ row.gateway }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- MAC地址 -->
        <el-table-column label="MAC地址" width="160">
          <template #default="{ row }">
            <span v-if="row.macAddress" class="mac-address">{{ row.macAddress }}</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <!-- VLAN -->
        <el-table-column label="VLAN" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.vlanId" type="info" size="small">{{ row.vlanId }}</el-tag>
            <span v-else style="color: #999">-</span>
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
            <el-tag v-if="row.status === 'available'" type="success">可用</el-tag>
            <el-tag v-else-if="row.status === 'used'" type="warning">已用</el-tag>
            <el-tag v-else-if="row.status === 'reserved'" type="info">保留</el-tag>
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
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
              <el-button link type="primary">
                更多
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-hasPermi="['pve:privateIp:edit']" command="edit">修改</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:privateIp:remove']" command="delete" divided>删除</el-dropdown-item>
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
      <el-form ref="privateIpFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="form.ipAddress" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="所属地址池" prop="poolId">
          <el-select v-model="form.poolId" placeholder="请选择地址池" style="width: 100%">
            <el-option v-for="pool in poolList" :key="pool.poolId" :label="pool.poolName" :value="pool.poolId" />
          </el-select>
        </el-form-item>
        <el-form-item label="子网掩码" prop="subnetMask">
          <el-input v-model="form.subnetMask" placeholder="请输入子网掩码，如：255.255.255.0" />
        </el-form-item>
        <el-form-item label="网关" prop="gateway">
          <el-input v-model="form.gateway" placeholder="请输入网关" />
        </el-form-item>
        <el-form-item label="MAC地址" prop="macAddress">
          <el-input v-model="form.macAddress" placeholder="请输入MAC地址" />
        </el-form-item>
        <el-form-item label="VLAN ID" prop="vlanId">
          <el-input-number v-model="form.vlanId" :min="0" :max="4094" placeholder="请输入VLAN ID" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="可用" value="available" />
            <el-option label="已用" value="used" />
            <el-option label="保留" value="reserved" />
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

<script setup name="PrivateIp" lang="ts">
import { listPrivateIp, getPrivateIp, delPrivateIp, addPrivateIp, updatePrivateIp } from '@/api/pve/privateIp';
import type { PrivateIpVO, PrivateIpQuery, PrivateIpForm } from '@/api/pve/privateIp/types';
import { listIpPool } from '@/api/pve/ipPool';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const privateIpList = ref<PrivateIpVO[]>([]);
const poolList = ref<any[]>([]);
const open = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

// 统计数据
const overview = ref({
  totalIps: 0,
  availableIps: 0,
  usedIps: 0,
  reservedIps: 0,
  usageRate: 0
});

const privateIpFormRef = ref<ElFormInstance>();

const queryParams = ref<PrivateIpQuery>({
  pageNum: 1,
  pageSize: 10,
  ipAddress: undefined,
  poolId: undefined,
  status: ''
});

const form = ref<PrivateIpForm>({});

const rules = ref({
  ipAddress: [{ required: true, message: 'IP地址不能为空', trigger: 'blur' }],
  poolId: [{ required: true, message: '所属地址池不能为空', trigger: 'change' }]
});

/** 计算统计数据 */
function calculateOverview() {
  const total = privateIpList.value.length;
  const available = privateIpList.value.filter((ip) => ip.status === 'available').length;
  const used = privateIpList.value.filter((ip) => ip.status === 'used').length;
  const reserved = privateIpList.value.filter((ip) => ip.status === 'reserved').length;

  overview.value = {
    totalIps: total,
    availableIps: available,
    usedIps: used,
    reservedIps: reserved,
    usageRate: total > 0 ? Math.round((used / total) * 100) : 0
  };
}

/** 加载地址池列表 */
function loadPoolList() {
  listIpPool({ pageNum: 1, pageSize: 1000 }).then((response: any) => {
    poolList.value = response.rows || [];
  });
}

/** 查询私网IP列表 */
function getList() {
  loading.value = true;
  listPrivateIp(queryParams.value).then((response: any) => {
    privateIpList.value = response.rows;
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
    ipAddress: undefined,
    poolId: undefined,
    status: ''
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
    ipId: undefined,
    ipAddress: undefined,
    poolId: undefined,
    subnetMask: undefined,
    gateway: undefined,
    macAddress: undefined,
    status: 'available',
    vmId: undefined,
    vlanId: undefined,
    remark: undefined
  };
  privateIpFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: PrivateIpVO[]) {
  ids.value = selection.map((item) => item.ipId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加私网IP';
}

/** 修改按钮操作 */
function handleUpdate(row: PrivateIpVO) {
  reset();
  const ipId = row.ipId || ids.value[0];
  getPrivateIp(ipId).then((response: any) => {
    form.value = response.data;
    open.value = true;
    title.value = '修改私网IP';
  });
}

/** 提交按钮 */
function submitForm() {
  privateIpFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (form.value.ipId) {
        updatePrivateIp(form.value).then(() => {
          proxy?.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addPrivateIp(form.value).then(() => {
          proxy?.$modal.msgSuccess('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row?: PrivateIpVO) {
  const ipIds = row?.ipId || ids.value;
  proxy?.$modal
    .confirm('是否确认删除私网IP编号为"' + ipIds + '"的数据项？')
    .then(() => {
      return delPrivateIp(ipIds);
    })
    .then(() => {
      getList();
      proxy?.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 操作命令处理 */
function handleCommand(command: string, row: PrivateIpVO) {
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
  loadPoolList();
  getList();
});
</script>

<style scoped lang="scss">
.private-ip-container {
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
  &.available {
    color: #67c23a;
  }
  &.used {
    color: #e6a23c;
  }
  &.reserved {
    color: #909399;
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

/* IP信息 */
.ip-info {
  .ip-address-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .ip-icon {
    font-size: 18px;
    color: #409eff;
    margin-right: 8px;
  }

  .ip-address {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    font-family: 'Courier New', monospace;
  }

  .ip-meta {
    font-size: 12px;
    color: #909399;
    padding-left: 26px;
  }

  .meta-item {
    margin-right: 4px;
  }
}

/* 地址池名称 */
.pool-name {
  font-size: 13px;
  color: #606266;
}

/* 网络配置 */
.network-config {
  .config-item {
    display: flex;
    align-items: center;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .config-label {
    font-size: 12px;
    color: #909399;
    width: 40px;
  }

  .config-value {
    font-size: 13px;
    color: #606266;
    font-family: 'Courier New', monospace;
  }
}

/* MAC地址 */
.mac-address {
  font-size: 13px;
  color: #606266;
  font-family: 'Courier New', monospace;
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
</style>

<template>
  <div class="ip-pool-container">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Grid /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalPools }}</span>
          <span class="stat-label">总地址池</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon public"><Link /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.publicPools }}</span>
          <span class="stat-label">公网IP池</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon private"><Connection /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.privatePools }}</span>
          <span class="stat-label">私网IP池</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon nat"><Share /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.natPools }}</span>
          <span class="stat-label">NAT池</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon usage"><DataAnalysis /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalUsedIps }}/{{ overview.totalIps }}</span>
          <span class="stat-label">IP使用</span>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar-container">
      <div class="toolbar-main">
        <!-- 左侧：类型筛选 -->
        <div class="toolbar-section">
          <el-radio-group v-model="queryParams.ipType" @change="handleQuery">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="public">公网IP</el-radio-button>
            <el-radio-button label="private">私网IP</el-radio-button>
            <el-radio-button label="nat">NAT</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 中间：操作按钮 -->
        <div class="toolbar-section">
          <el-button v-hasPermi="['pve:ipPool:add']" icon="Plus" type="primary" @click="handleAdd">新增地址池</el-button>
          <el-button v-hasPermi="['pve:ipPool:remove']" icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-select v-model="queryParams.status" clearable placeholder="状态" style="width: 120px" @change="handleQuery">
            <el-option label="正常" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
          <el-input
            v-model="queryParams.poolName"
            class="search-input"
            clearable
            placeholder="搜索地址池"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 地址池列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="ipPoolList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- 地址池信息 -->
        <el-table-column label="地址池信息" min-width="250">
          <template #default="{ row }">
            <div class="pool-info">
              <div class="pool-name-row">
                <el-icon class="pool-icon"><Grid /></el-icon>
                <span class="pool-name">{{ row.poolName }}</span>
                <el-tag v-if="row.isDefault === '1'" type="success" size="small" style="margin-left: 8px">默认</el-tag>
              </div>
              <div class="pool-meta">
                <span class="meta-item">ID: {{ row.poolId }}</span>
                <span v-if="row.vlanId" class="meta-divider">|</span>
                <span v-if="row.vlanId" class="meta-item">VLAN: {{ row.vlanId }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- IP类型 -->
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.ipType === 'public'" type="success">公网IP</el-tag>
            <el-tag v-else-if="row.ipType === 'private'" type="info">私网IP</el-tag>
            <el-tag v-else type="warning">NAT</el-tag>
          </template>
        </el-table-column>

        <!-- IP范围 -->
        <el-table-column label="IP范围" min-width="240">
          <template #default="{ row }">
            <div v-if="row.startIp && row.endIp" class="ip-range">
              <div class="ip-item">
                <span class="ip-label">起始:</span>
                <span class="ip-value">{{ row.startIp }}</span>
              </div>
              <div class="ip-item">
                <span class="ip-label">结束:</span>
                <span class="ip-value">{{ row.endIp }}</span>
              </div>
            </div>
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

        <!-- IP使用情况 -->
        <el-table-column label="IP使用" width="150" align="center">
          <template #default="{ row }">
            <div class="ip-usage">
              <div class="usage-text">
                <span class="used">{{ row.usedIps || 0 }}</span>
                <span class="divider">/</span>
                <span class="total">{{ row.totalIps || 0 }}</span>
              </div>
              <el-progress
                v-if="row.totalIps > 0"
                :percentage="getUsagePercentage(row)"
                :color="getUsageColor(row)"
                :show-text="false"
                style="margin-top: 4px"
              />
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
                  <el-dropdown-item v-hasPermi="['pve:ipPool:edit']" command="edit">修改</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:ipPool:remove']" command="delete" divided>删除</el-dropdown-item>
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
      <el-form ref="ipPoolFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="地址池名称" prop="poolName">
          <el-input v-model="form.poolName" placeholder="请输入地址池名称" />
        </el-form-item>
        <el-form-item label="IP类型" prop="ipType">
          <el-select v-model="form.ipType" placeholder="请选择IP类型" style="width: 100%">
            <el-option label="公网IP" value="public" />
            <el-option label="私网IP" value="private" />
            <el-option label="NAT" value="nat" />
          </el-select>
        </el-form-item>
        <el-form-item label="起始IP" prop="startIp">
          <el-input v-model="form.startIp" placeholder="请输入起始IP" />
        </el-form-item>
        <el-form-item label="结束IP" prop="endIp">
          <el-input v-model="form.endIp" placeholder="请输入结束IP" />
        </el-form-item>
        <el-form-item label="子网掩码" prop="subnetMask">
          <el-input v-model="form.subnetMask" placeholder="请输入子网掩码，如：255.255.255.0" />
        </el-form-item>
        <el-form-item label="网关" prop="gateway">
          <el-input v-model="form.gateway" placeholder="请输入网关" />
        </el-form-item>
        <el-form-item label="DNS服务器" prop="dnsServer">
          <el-input v-model="form.dnsServer" placeholder="多个DNS用逗号分隔" />
        </el-form-item>
        <el-form-item label="VLAN ID" prop="vlanId">
          <el-input-number v-model="form.vlanId" :min="0" :max="4094" placeholder="请输入VLAN ID" style="width: 100%" />
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-radio-group v-model="form.isDefault">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
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

<script setup name="IpPool" lang="ts">
import { listIpPool, getIpPool, addIpPool, updateIpPool, delIpPool } from '@/api/pve/ipPool';
import type { IpPoolVO, IpPoolQuery, IpPoolForm } from '@/api/pve/ipPool/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const ipPoolList = ref<IpPoolVO[]>([]);
const open = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

// 统计数据
const overview = ref({
  totalPools: 0,
  publicPools: 0,
  privatePools: 0,
  natPools: 0,
  totalIps: 0,
  totalUsedIps: 0
});

const ipPoolFormRef = ref<ElFormInstance>();

const queryParams = ref<IpPoolQuery>({
  pageNum: 1,
  pageSize: 10,
  poolName: undefined,
  ipType: '',
  status: undefined
});

const form = ref<IpPoolForm>({});

const rules = ref({
  poolName: [{ required: true, message: '地址池名称不能为空', trigger: 'blur' }],
  ipType: [{ required: true, message: 'IP类型不能为空', trigger: 'change' }]
});

/** 计算IP使用率 */
function getUsagePercentage(row: IpPoolVO) {
  if (!row.totalIps || row.totalIps === 0) return 0;
  return Math.round((row.usedIps / row.totalIps) * 100);
}

/** 获取使用率颜色 */
function getUsageColor(row: IpPoolVO) {
  const percentage = getUsagePercentage(row);
  if (percentage >= 90) return '#f56c6c';
  if (percentage >= 70) return '#e6a23c';
  return '#67c23a';
}

/** 计算统计数据 */
function calculateOverview() {
  overview.value = {
    totalPools: ipPoolList.value.length,
    publicPools: ipPoolList.value.filter((p) => p.ipType === 'public').length,
    privatePools: ipPoolList.value.filter((p) => p.ipType === 'private').length,
    natPools: ipPoolList.value.filter((p) => p.ipType === 'nat').length,
    totalIps: ipPoolList.value.reduce((sum, p) => sum + (p.totalIps || 0), 0),
    totalUsedIps: ipPoolList.value.reduce((sum, p) => sum + (p.usedIps || 0), 0)
  };
}

/** 查询IP地址池列表 */
function getList() {
  loading.value = true;
  listIpPool(queryParams.value).then((response: any) => {
    ipPoolList.value = response.rows;
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
    poolName: undefined,
    ipType: '',
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
    poolId: undefined,
    poolName: undefined,
    ipType: undefined,
    isDefault: '0',
    startIp: undefined,
    endIp: undefined,
    subnetMask: undefined,
    gateway: undefined,
    dnsServer: undefined,
    vlanId: undefined,
    status: '0',
    description: undefined
  };
  ipPoolFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: IpPoolVO[]) {
  ids.value = selection.map((item) => item.poolId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加IP地址池';
}

/** 修改按钮操作 */
function handleUpdate(row: IpPoolVO) {
  reset();
  const poolId = row.poolId || ids.value[0];
  getIpPool(poolId).then((response: any) => {
    form.value = response.data;
    open.value = true;
    title.value = '修改IP地址池';
  });
}

/** 提交按钮 */
function submitForm() {
  ipPoolFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (form.value.poolId) {
        updateIpPool(form.value).then(() => {
          proxy?.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addIpPool(form.value).then(() => {
          proxy?.$modal.msgSuccess('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row?: IpPoolVO) {
  const poolIds = row?.poolId || ids.value;
  proxy?.$modal
    .confirm('是否确认删除IP地址池编号为"' + poolIds + '"的数据项？')
    .then(() => {
      return delIpPool(poolIds);
    })
    .then(() => {
      getList();
      proxy?.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 状态命令处理 */
function handleStatusCommand(command: string, row: IpPoolVO) {
  const newStatus = command === 'enable' ? '0' : '1';
  const text = command === 'enable' ? '启用' : '停用';

  proxy?.$modal
    .confirm('确认要"' + text + '""' + row.poolName + '"地址池吗？')
    .then(() => {
      row.status = newStatus;
      return updateIpPool(row);
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
function handleCommand(command: string, row: IpPoolVO) {
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
.ip-pool-container {
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
  &.public {
    color: #67c23a;
  }
  &.private {
    color: #909399;
  }
  &.nat {
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

/* 地址池信息 */
.pool-info {
  .pool-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .pool-icon {
    font-size: 18px;
    color: #409eff;
    margin-right: 8px;
  }

  .pool-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .pool-meta {
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

/* IP范围 */
.ip-range {
  .ip-item {
    display: flex;
    align-items: center;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .ip-label {
    font-size: 12px;
    color: #909399;
    width: 40px;
  }

  .ip-value {
    font-size: 13px;
    color: #606266;
    font-family: 'Courier New', monospace;
  }
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

/* IP使用情况 */
.ip-usage {
  .usage-text {
    font-size: 14px;
    margin-bottom: 4px;

    .used {
      color: #409eff;
      font-weight: 600;
    }

    .divider {
      color: #dcdfe6;
      margin: 0 4px;
    }

    .total {
      color: #909399;
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

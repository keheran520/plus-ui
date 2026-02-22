<template>
  <div class="network-line-container">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Connection /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalLines }}</span>
          <span class="stat-label">总线路</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon active"><CircleCheck /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.activeLines }}</span>
          <span class="stat-label">正常</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon bandwidth"><Odometer /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalBandwidth }}Mbps</span>
          <span class="stat-label">总带宽</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon ip"><Grid /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.usedIpCount }}/{{ overview.totalIpCount }}</span>
          <span class="stat-label">IP使用</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon cost"><Money /></el-icon>
        <div class="stat-info">
          <span class="stat-value">¥{{ overview.totalCost }}</span>
          <span class="stat-label">月租费用</span>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar-container">
      <div class="toolbar-main">
        <!-- 左侧：类型筛选 -->
        <div class="toolbar-section">
          <el-radio-group v-model="queryParams.lineType" @change="handleQuery">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="BGP">BGP</el-radio-button>
            <el-radio-button label="CN2">CN2</el-radio-button>
            <el-radio-button label="GIA">GIA</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 中间：操作按钮 -->
        <div class="toolbar-section">
          <el-button v-hasPermi="['pve:networkLine:add']" icon="Plus" type="primary" @click="handleAdd">新增线路</el-button>
          <el-button v-hasPermi="['pve:networkLine:remove']" icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-select v-model="queryParams.status" clearable placeholder="状态" style="width: 120px" @change="handleQuery">
            <el-option label="正常" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
          <el-input
            v-model="queryParams.lineName"
            class="search-input"
            clearable
            placeholder="搜索线路"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 线路列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="lineList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- 线路信息 -->
        <el-table-column label="线路信息" min-width="220">
          <template #default="{ row }">
            <div class="line-info">
              <div class="line-name-row">
                <el-icon class="line-icon"><Connection /></el-icon>
                <span class="line-name">{{ row.lineName }}</span>
              </div>
              <div class="line-meta">
                <span class="meta-item">ID: {{ row.lineId }}</span>
                <span v-if="row.location" class="meta-divider">|</span>
                <span v-if="row.location" class="meta-item">{{ row.location }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 线路类型 -->
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.lineType === 'BGP'" type="success">BGP</el-tag>
            <el-tag v-else-if="row.lineType === 'CN2'" type="warning">CN2</el-tag>
            <el-tag v-else-if="row.lineType === 'GIA'" type="danger">GIA</el-tag>
            <el-tag v-else type="info">{{ row.lineType || '其他' }}</el-tag>
          </template>
        </el-table-column>

        <!-- ISP运营商 -->
        <el-table-column label="ISP" prop="isp" width="120" align="center" />

        <!-- 带宽 -->
        <el-table-column label="带宽" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.bandwidth" class="bandwidth-value">{{ row.bandwidth }} Mbps</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <!-- IP使用情况 -->
        <el-table-column label="IP使用" width="150" align="center">
          <template #default="{ row }">
            <div class="ip-usage">
              <div class="usage-text">
                <span class="used">{{ row.usedIpCount || 0 }}</span>
                <span class="divider">/</span>
                <span class="total">{{ row.ipCount || 0 }}</span>
              </div>
              <el-progress
                v-if="row.ipCount > 0"
                :percentage="getIpUsagePercentage(row)"
                :color="getUsageColor(row)"
                :show-text="false"
                style="margin-top: 4px"
              />
            </div>
          </template>
        </el-table-column>

        <!-- 费用信息 -->
        <el-table-column label="费用" min-width="180">
          <template #default="{ row }">
            <div class="cost-info">
              <div v-if="row.monthlyFee" class="cost-item">
                <span class="cost-label">月租:</span>
                <span class="cost-value">¥{{ row.monthlyFee }}</span>
              </div>
              <div v-if="row.trafficFee" class="cost-item">
                <span class="cost-label">流量:</span>
                <span class="cost-value">¥{{ row.trafficFee }}/GB</span>
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
                  <el-dropdown-item v-hasPermi="['pve:networkLine:edit']" command="edit">修改</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:networkLine:remove']" command="delete" divided>删除</el-dropdown-item>
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
      <el-form ref="lineFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="线路名称" prop="lineName">
          <el-input v-model="form.lineName" placeholder="请输入线路名称" />
        </el-form-item>
        <el-form-item label="线路类型" prop="lineType">
          <el-select v-model="form.lineType" placeholder="请选择线路类型" style="width: 100%">
            <el-option label="BGP" value="BGP" />
            <el-option label="CN2" value="CN2" />
            <el-option label="GIA" value="GIA" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="ISP运营商" prop="isp">
          <el-input v-model="form.isp" placeholder="请输入ISP运营商" />
        </el-form-item>
        <el-form-item label="带宽(Mbps)" prop="bandwidth">
          <el-input-number v-model="form.bandwidth" :min="0" placeholder="请输入带宽" style="width: 100%" />
        </el-form-item>
        <el-form-item label="机房位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入机房位置" />
        </el-form-item>
        <el-form-item label="月租费用" prop="monthlyFee">
          <el-input-number v-model="form.monthlyFee" :min="0" :precision="2" placeholder="请输入月租费用" style="width: 100%" />
        </el-form-item>
        <el-form-item label="流量费用(元/GB)" prop="trafficFee">
          <el-input-number v-model="form.trafficFee" :min="0" :precision="2" placeholder="请输入流量费用" style="width: 100%" />
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

<script setup name="NetworkLine" lang="ts">
import { listNetworkLine, getNetworkLine, addNetworkLine, updateNetworkLine, delNetworkLine } from '@/api/pve/networkLine';
import type { NetworkLineVO, NetworkLineQuery, NetworkLineForm } from '@/api/pve/networkLine/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const lineList = ref<NetworkLineVO[]>([]);
const open = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

// 统计数据
const overview = ref({
  totalLines: 0,
  activeLines: 0,
  totalBandwidth: 0,
  totalIpCount: 0,
  usedIpCount: 0,
  totalCost: 0
});

const lineFormRef = ref<ElFormInstance>();

const queryParams = ref<NetworkLineQuery>({
  pageNum: 1,
  pageSize: 10,
  lineName: undefined,
  lineType: '',
  status: undefined
});

const form = ref<NetworkLineForm>({});

const rules = ref({
  lineName: [{ required: true, message: '线路名称不能为空', trigger: 'blur' }]
});

/** 计算IP使用率 */
function getIpUsagePercentage(row: NetworkLineVO) {
  if (!row.ipCount || row.ipCount === 0) return 0;
  return Math.round((row.usedIpCount / row.ipCount) * 100);
}

/** 获取使用率颜色 */
function getUsageColor(row: NetworkLineVO) {
  const percentage = getIpUsagePercentage(row);
  if (percentage >= 90) return '#f56c6c';
  if (percentage >= 70) return '#e6a23c';
  return '#67c23a';
}

/** 计算统计数据 */
function calculateOverview() {
  overview.value = {
    totalLines: lineList.value.length,
    activeLines: lineList.value.filter((l) => l.status === '0').length,
    totalBandwidth: lineList.value.reduce((sum, l) => sum + (Number(l.bandwidth) || 0), 0),
    totalIpCount: lineList.value.reduce((sum, l) => sum + (l.ipCount || 0), 0),
    usedIpCount: lineList.value.reduce((sum, l) => sum + (l.usedIpCount || 0), 0),
    totalCost: lineList.value.reduce((sum, l) => sum + (l.monthlyFee || 0), 0)
  };
}

/** 查询线路列表 */
function getList() {
  loading.value = true;
  listNetworkLine(queryParams.value).then((response: any) => {
    lineList.value = response.rows;
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
    lineName: undefined,
    lineType: '',
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
    lineId: undefined,
    lineName: undefined,
    lineType: undefined,
    isp: undefined,
    bandwidth: undefined,
    location: undefined,
    monthlyFee: undefined,
    trafficFee: undefined,
    status: '0',
    description: undefined
  };
  lineFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: NetworkLineVO[]) {
  ids.value = selection.map((item) => item.lineId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加线路';
}

/** 修改按钮操作 */
function handleUpdate(row: NetworkLineVO) {
  reset();
  const lineId = row.lineId || ids.value[0];
  getNetworkLine(lineId).then((response: any) => {
    form.value = response.data;
    open.value = true;
    title.value = '修改线路';
  });
}

/** 提交按钮 */
function submitForm() {
  lineFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (form.value.lineId) {
        updateNetworkLine(form.value).then(() => {
          proxy?.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addNetworkLine(form.value).then(() => {
          proxy?.$modal.msgSuccess('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row?: NetworkLineVO) {
  const lineIds = row?.lineId || ids.value;
  proxy?.$modal
    .confirm('是否确认删除线路编号为"' + lineIds + '"的数据项？')
    .then(() => {
      return delNetworkLine(lineIds);
    })
    .then(() => {
      getList();
      proxy?.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 状态命令处理 */
function handleStatusCommand(command: string, row: NetworkLineVO) {
  const newStatus = command === 'enable' ? '0' : '1';
  const text = command === 'enable' ? '启用' : '停用';

  proxy?.$modal
    .confirm('确认要"' + text + '""' + row.lineName + '"线路吗？')
    .then(() => {
      row.status = newStatus;
      return updateNetworkLine(row);
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
function handleCommand(command: string, row: NetworkLineVO) {
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
.network-line-container {
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
  &.bandwidth {
    color: #e6a23c;
  }
  &.ip {
    color: #909399;
  }
  &.cost {
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

/* 线路信息 */
.line-info {
  .line-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .line-icon {
    font-size: 18px;
    color: #409eff;
    margin-right: 8px;
  }

  .line-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .line-meta {
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

/* 带宽值 */
.bandwidth-value {
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
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

/* 费用信息 */
.cost-info {
  .cost-item {
    display: flex;
    align-items: center;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .cost-label {
    font-size: 12px;
    color: #909399;
    width: 40px;
  }

  .cost-value {
    font-size: 13px;
    color: #f56c6c;
    font-weight: 500;
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

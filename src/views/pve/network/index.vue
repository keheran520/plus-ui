<template>
  <div class="network-container">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Connection /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalNetworks }}</span>
          <span class="stat-label">总网络数</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon active"><CircleCheck /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.activeNetworks }}</span>
          <span class="stat-label">激活网络</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon bridge"><Share /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.bridgeNetworks }}</span>
          <span class="stat-label">桥接网络</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon vlan"><Grid /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.vlanNetworks || 0 }}</span>
          <span class="stat-label">VLAN网络</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon default"><Star /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.defaultNetworks }}</span>
          <span class="stat-label">默认网络</span>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar-container">
      <div class="toolbar-main">
        <!-- 左侧：类型筛选 -->
        <div class="toolbar-section">
          <el-radio-group v-model="queryParams.type" @change="handleQuery">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="bridge">桥接</el-radio-button>
            <el-radio-button label="bond">绑定</el-radio-button>
            <el-radio-button label="vlan">VLAN</el-radio-button>
            <el-radio-button label="OVS">OVS</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 中间：操作按钮 -->
        <div class="toolbar-section">
          <el-button v-hasPermi="['pve:network:add']" icon="Plus" type="primary" @click="handleAdd">新增网络</el-button>
          <el-button v-hasPermi="['pve:network:remove']" icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
          <el-button v-hasPermi="['pve:network:export']" icon="Download" @click="handleExport">导出</el-button>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-select v-model="queryParams.active" clearable placeholder="激活状态" style="width: 120px" @change="handleQuery">
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
          <el-input
            v-model="queryParams.iface"
            class="search-input"
            clearable
            placeholder="搜索接口名称"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 网络列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="networkList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- 网络信息 -->
        <el-table-column label="网络信息" min-width="220">
          <template #default="{ row }">
            <div class="network-info">
              <div class="network-name-row">
                <el-icon class="network-icon"><Connection /></el-icon>
                <span class="network-name">{{ row.iface }}</span>
                <el-tag v-if="row.isDefault === '1'" type="warning" size="small" style="margin-left: 8px">默认</el-tag>
              </div>
              <div class="network-meta">
                <span class="meta-item">ID: {{ row.networkId }}</span>
                <span v-if="row.cidr" class="meta-divider">|</span>
                <span v-if="row.cidr" class="meta-item">{{ row.cidr }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 网络类型 -->
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'bridge'" type="primary">桥接</el-tag>
            <el-tag v-else-if="row.type === 'bond'" type="success">绑定</el-tag>
            <el-tag v-else-if="row.type === 'vlan'" type="warning">VLAN</el-tag>
            <el-tag v-else type="info">{{ row.type }}</el-tag>
          </template>
        </el-table-column>

        <!-- IP配置 -->
        <el-table-column label="IP配置" min-width="200">
          <template #default="{ row }">
            <div class="ip-config">
              <div v-if="row.address" class="config-item">
                <span class="config-label">地址:</span>
                <span class="config-value">{{ row.address }}</span>
              </div>
              <div v-if="row.netmask" class="config-item">
                <span class="config-label">掩码:</span>
                <span class="config-value">{{ row.netmask }}</span>
              </div>
              <div v-if="row.gateway" class="config-item">
                <span class="config-label">网关:</span>
                <span class="config-value">{{ row.gateway }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- MTU -->
        <el-table-column label="MTU" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.mtu">{{ row.mtu }}</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="激活" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.active === '1'" type="success" size="small">是</el-tag>
            <el-tag v-else type="info" size="small">否</el-tag>
          </template>
        </el-table-column>

        <!-- 自动启动 -->
        <el-table-column label="自启" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.autostart === '1'" type="success" size="small">是</el-tag>
            <el-tag v-else type="info" size="small">否</el-tag>
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
                  <el-dropdown-item v-hasPermi="['pve:network:edit']" command="edit">修改</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:network:remove']" command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" append-to-body width="800px" @close="cancel">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="接口名称" prop="iface">
              <el-input v-model="form.iface" :disabled="!!form.networkId" placeholder="例如: vmbr0" />
              <div class="form-tip">网络接口的唯一标识符，不能与现有接口重复</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="网络类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择网络类型" style="width: 100%">
                <el-option label="Linux Bridge（桥接）" value="bridge" />
                <el-option label="Bond（绑定）" value="bond" />
                <el-option label="VLAN（虚拟局域网）" value="vlan" />
                <el-option label="OVS" value="OVS" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="激活状态" prop="active">
              <el-radio-group v-model="form.active">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="自动启动" prop="autostart">
              <el-radio-group v-model="form.autostart">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="IP地址/CIDR" prop="address">
              <el-input v-model="form.address" placeholder="例如: 192.168.1.100/24" />
              <div class="form-tip">IPv4地址和子网掩码，格式：IP/掩码位数</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="网关" prop="gateway">
              <el-input v-model="form.gateway" placeholder="例如: 192.168.1.1" />
              <div class="form-tip">默认网关地址，用于访问外部网络</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="form.address && !form.address.includes('/')" :gutter="16">
          <el-col :span="12">
            <el-form-item label="子网掩码" prop="netmask">
              <el-input v-model="form.netmask" placeholder="例如: 255.255.255.0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="IPv6地址/CIDR" prop="address6">
              <el-input v-model="form.address6" placeholder="例如: 2001:db8::1/64" />
              <div class="form-tip">IPv6地址和前缀长度</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="IPv6网关" prop="gateway6">
              <el-input v-model="form.gateway6" placeholder="例如: 2001:db8::1" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Bridge 特定配置 -->
        <template v-if="form.type === 'bridge'">
          <el-form-item label="桥接端口" prop="bridgePorts">
            <el-input v-model="form.bridgePorts" placeholder="例如: eno1" />
            <div class="form-tip">要桥接的物理网卡接口，多个接口用空格分隔</div>
          </el-form-item>
        </template>

        <!-- Bond 特定配置 -->
        <template v-if="form.type === 'bond'">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="从属接口" prop="slaves">
                <el-input v-model="form.slaves" placeholder="例如: eno1 eno2" />
                <div class="form-tip">参与绑定的物理网卡，空格分隔（必填）</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Bond模式" prop="bondMode">
                <el-select v-model="form.bondMode" placeholder="请选择Bond模式" style="width: 100%">
                  <el-option label="balance-rr（轮询，默认）" value="balance-rr" />
                  <el-option label="active-backup（主备模式）" value="active-backup" />
                  <el-option label="balance-xor（异或策略）" value="balance-xor" />
                  <el-option label="broadcast（广播策略）" value="broadcast" />
                  <el-option label="802.3ad（LACP动态聚合）" value="802.3ad" />
                  <el-option label="balance-tlb（传输负载均衡）" value="balance-tlb" />
                  <el-option label="balance-alb（自适应负载均衡）" value="balance-alb" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="['balance-xor', '802.3ad', 'balance-tlb', 'balance-alb'].includes(form.bondMode)" :gutter="16">
            <el-col :span="12">
              <el-form-item label="Hash策略" prop="bondXmitHashPolicy">
                <el-select v-model="form.bondXmitHashPolicy" placeholder="请选择Hash策略" style="width: 100%">
                  <el-option label="layer2（基于MAC地址）" value="layer2" />
                  <el-option label="layer2+3（基于MAC和IP）" value="layer2+3" />
                  <el-option label="layer3+4（基于IP和端口）" value="layer3+4" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="主接口" prop="bondPrimary">
                <el-input v-model="form.bondPrimary" placeholder="例如: eno1" />
                <div class="form-tip">主备模式下的主接口</div>
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- VLAN 特定配置 -->
        <template v-if="form.type === 'vlan'">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="VLAN ID" prop="vlanId">
                <el-input-number v-model="form.vlanId" :max="4094" :min="1" placeholder="例如: 100" style="width: 100%" />
                <div class="form-tip">VLAN标识符，范围1-4094</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="VLAN原始设备" prop="vlanRawDevice">
                <el-input v-model="form.vlanRawDevice" placeholder="例如: eno1 或 vmbr0" />
                <div class="form-tip">VLAN所基于的物理接口或Bridge接口</div>
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="MTU" prop="mtu">
              <el-input-number v-model="form.mtu" :max="65535" :min="68" placeholder="默认: 1500" style="width: 100%" />
              <div class="form-tip">最大传输单元，默认1500</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认网络" prop="isDefault">
              <el-radio-group v-model="form.isDefault">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="注释" prop="comments">
          <el-input v-model="form.comments" :rows="3" placeholder="例如：管理网络、虚拟机网络等" type="textarea" />
          <div class="form-tip">接口的描述信息，方便识别用途</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { listNetwork, getNetwork, addNetwork, updateNetwork, delNetwork, getOverview } from '@/api/pve/network';
import type { PveNetworkVO, PveNetworkForm, PveNetworkQuery } from '@/api/pve/network/types';

const { proxy } = getCurrentInstance() as any;

const networkList = ref<PveNetworkVO[]>([]);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('');

// 统计概览数据
const overview = ref({
  totalNetworks: 0,
  activeNetworks: 0,
  bridgeNetworks: 0,
  vlanNetworks: 0,
  defaultNetworks: 0
});

const queryParams = ref<PveNetworkQuery>({
  pageNum: 1,
  pageSize: 10,
  iface: undefined,
  type: '',
  active: undefined
});
const formRef = ref();

const form = ref<PveNetworkForm>({});

const rules = {
  iface: [{ required: true, message: '接口名称不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '网络类型不能为空', trigger: 'change' }],
  slaves: [{ required: true, message: 'Bond类型必须配置从属接口', trigger: 'blur' }],
  bondMode: [{ required: true, message: 'Bond类型必须选择Bond模式', trigger: 'change' }],
  vlanId: [{ required: true, message: 'VLAN类型必须配置VLAN ID', trigger: 'blur' }],
  vlanRawDevice: [{ required: true, message: 'VLAN类型必须配置原始设备', trigger: 'blur' }]
};

/** 计算统计概览 */
function calculateOverview() {
  overview.value = {
    totalNetworks: networkList.value.length,
    activeNetworks: networkList.value.filter((n) => n.active === '1').length,
    bridgeNetworks: networkList.value.filter((n) => n.type === 'bridge').length,
    vlanNetworks: networkList.value.filter((n) => n.type === 'vlan').length,
    defaultNetworks: networkList.value.filter((n) => n.isDefault === '1').length
  };
}

/** 获取统计概览 */
function loadOverview() {
  getOverview()
    .then((response: any) => {
      if (response.data) {
        overview.value = response.data;
      }
    })
    .catch(() => {
      console.error('获取统计概览失败');
    });
}

/** 查询网络列表 */
function getList() {
  loading.value = true;
  listNetwork(queryParams.value)
    .then((response: any) => {
      networkList.value = response.rows;
      total.value = response.total;
      calculateOverview();
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
}

/** 刷新 */
function handleRefresh() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    iface: undefined,
    type: '',
    active: undefined
  };
  getList();
  loadOverview();
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: PveNetworkVO[]) {
  ids.value = selection.map((item) => item.networkId);
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  dialogVisible.value = true;
  dialogTitle.value = '添加网络';
}

/** 修改按钮操作 */
function handleUpdate(row: PveNetworkVO) {
  reset();
  const networkId = row.networkId;
  getNetwork(networkId).then((response: any) => {
    form.value = response.data;
    dialogVisible.value = true;
    dialogTitle.value = '修改网络';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate((valid: boolean) => {
    if (valid) {
      // 根据类型校验必填字段
      if (form.value.type === 'bond') {
        if (!form.value.slaves || form.value.slaves.trim() === '') {
          proxy.$modal.msgError('Bond类型必须配置从属接口');
          return;
        }
        if (!form.value.bondMode || form.value.bondMode.trim() === '') {
          proxy.$modal.msgError('Bond类型必须选择Bond模式');
          return;
        }
      } else if (form.value.type === 'vlan') {
        if (!form.value.vlanId) {
          proxy.$modal.msgError('VLAN类型必须配置VLAN ID');
          return;
        }
        if (!form.value.vlanRawDevice || form.value.vlanRawDevice.trim() === '') {
          proxy.$modal.msgError('VLAN类型必须配置原始设备');
          return;
        }
      }

      if (form.value.networkId) {
        updateNetwork(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功');
          dialogVisible.value = false;
          getList();
          loadOverview();
        });
      } else {
        addNetwork(form.value).then(() => {
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
function handleDelete(row?: PveNetworkVO) {
  const networkIds = row?.networkId ? [row.networkId] : ids.value;
  proxy.$modal
    .confirm('是否确认删除网络编号为"' + networkIds + '"的数据项？')
    .then(() => {
      return delNetwork(networkIds);
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
    'pve/network/export',
    {
      ...queryParams.value
    },
    `network_${new Date().getTime()}.xlsx`
  );
}

/** 操作命令处理 */
function handleCommand(command: string, row: PveNetworkVO) {
  switch (command) {
    case 'edit':
      handleUpdate(row);
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
}

/** 取消按钮 */
function cancel() {
  dialogVisible.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    networkId: undefined,
    iface: undefined,
    type: 'bridge',
    active: '1',
    autostart: '1',
    address: undefined,
    netmask: undefined,
    gateway: undefined,
    mtu: 1500,
    cidr: undefined,
    isDefault: '0',
    comments: undefined
  };
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
}

// 初始化
loadOverview();
getList();
</script>

<style lang="scss" scoped>
.network-container {
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
  &.bridge {
    color: #e6a23c;
  }
  &.vlan {
    color: #f56c6c;
  }
  &.default {
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

/* 网络信息 */
.network-info {
  .network-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .network-icon {
    font-size: 18px;
    color: #409eff;
    margin-right: 8px;
  }

  .network-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .network-meta {
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

/* IP配置 */
.ip-config {
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

/* 表单提示 */
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}
</style>

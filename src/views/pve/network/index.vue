<template>
  <div class="p-2">
    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="mb-[10px]">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon :size="32">
                <Connection />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalNetworks }}</div>
              <div class="stat-label">总网络数</div>
              <div class="stat-today">激活 {{ overview.activeNetworks }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon active">
              <el-icon :size="32">
                <CircleCheck />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.activeNetworks }}</div>
              <div class="stat-label">激活网络</div>
              <div class="stat-today">运行中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon bridge">
              <el-icon :size="32">
                <Share />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.bridgeNetworks }}</div>
              <div class="stat-label">桥接网络</div>
              <div class="stat-today">Bridge</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon default">
              <el-icon :size="32">
                <Star />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.defaultNetworks }}</div>
              <div class="stat-label">默认网络</div>
              <div class="stat-today">Default</div>
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
            <el-form-item label="接口名称" prop="iface">
              <el-input v-model="queryParams.iface" clearable placeholder="请输入接口名称" style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="网络类型" prop="type">
              <el-select v-model="queryParams.type" clearable placeholder="请选择网络类型" style="width: 150px">
                <el-option label="桥接" value="bridge" />
                <el-option label="绑定" value="bond" />
                <el-option label="VLAN" value="vlan" />
                <el-option label="OVS" value="OVS" />
              </el-select>
            </el-form-item>
            <el-form-item label="激活状态" prop="active">
              <el-select v-model="queryParams.active" clearable placeholder="请选择激活状态" style="width: 150px">
                <el-option label="是" value="1" />
                <el-option label="否" value="0" />
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
            <el-button v-hasPermi="['pve:network:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:network:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:network:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="networkList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" fixed type="selection" width="50" />
        <el-table-column align="center" label="网络ID" prop="networkId" width="100" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="接口名称" prop="iface" width="150" />
        <el-table-column align="center" label="网络类型" prop="type" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'bridge'" type="primary">桥接</el-tag>
            <el-tag v-else-if="row.type === 'bond'" type="success">绑定</el-tag>
            <el-tag v-else-if="row.type === 'vlan'" type="warning">VLAN</el-tag>
            <el-tag v-else type="info">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="激活状态" prop="active" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.active === '1'" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="自动启动" prop="autostart" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.autostart === '1'" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="IP地址" prop="address" width="150" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="子网掩码" prop="netmask" width="150" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="网关" prop="gateway" width="150" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="CIDR" prop="cidr" width="150" />
        <el-table-column align="center" label="默认网络" prop="isDefault" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isDefault === '1'" type="warning">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="MTU" prop="mtu" width="100" />
        <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="180">
          <template #default="{ row }">
            <el-button v-hasPermi="['pve:network:edit']" icon="Edit" link type="primary" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['pve:network:remove']" icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
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
            <el-form-item label="接口名称" prop="iface">
              <el-input v-model="form.iface" placeholder="请输入接口名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="网络类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择网络类型" style="width: 100%">
                <el-option label="桥接" value="bridge" />
                <el-option label="绑定" value="bond" />
                <el-option label="VLAN" value="vlan" />
                <el-option label="OVS" value="OVS" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
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
        <el-row>
          <el-col :span="12">
            <el-form-item label="IP地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入IP地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="子网掩码" prop="netmask">
              <el-input v-model="form.netmask" placeholder="请输入子网掩码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="网关" prop="gateway">
              <el-input v-model="form.gateway" placeholder="请输入网关" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="MTU" prop="mtu">
              <el-input-number v-model="form.mtu" :min="1" :max="9000" placeholder="请输入MTU" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="CIDR" prop="cidr">
              <el-input v-model="form.cidr" placeholder="请输入CIDR" />
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
          <el-input v-model="form.comments" placeholder="请输入注释" type="textarea" />
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
import { listNetwork, getNetwork, addNetwork, updateNetwork, delNetwork, getOverview } from '@/api/pve/network';
import type { PveNetworkVO, PveNetworkForm, PveNetworkQuery } from '@/api/pve/network/types';

const { proxy } = getCurrentInstance() as any;

const networkList = ref<PveNetworkVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
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
  defaultNetworks: 0
});

const queryParams = ref<PveNetworkQuery>({
  pageNum: 1,
  pageSize: 10,
  iface: undefined,
  type: undefined,
  active: undefined
});
const queryRef = ref();

const form = ref<PveNetworkForm>({});
const formRef = ref();

const rules = {
  iface: [{ required: true, message: '接口名称不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '网络类型不能为空', trigger: 'change' }]
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

/** 查询网络列表 */
function getList() {
  loading.value = true;
  listNetwork(queryParams.value)
    .then((response: any) => {
      networkList.value = response.rows;
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

    &.active {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.bridge {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.default {
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

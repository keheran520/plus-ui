<template>
  <div class="p-2">
    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="mb-[10px]">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon :size="32"><Monitor /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalClusters }}</div>
              <div class="stat-label">总集群数</div>
              <div class="stat-today">在线 {{ overview.onlineClusters }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon nodes">
              <el-icon :size="32"><Cpu /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalNodes }}</div>
              <div class="stat-label">总节点数</div>
              <div class="stat-today">在线 {{ overview.onlineNodes }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon cpu">
              <el-icon :size="32"><Memo /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalCpuCores }}</div>
              <div class="stat-label">总CPU核心数</div>
              <div class="stat-today">内存 {{ overview.totalMemory }} GB</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon storage">
              <el-icon :size="32"><Coin /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalStorage }} GB</div>
              <div class="stat-label">总存储容量</div>
              <div class="stat-today">节点平均 {{ avgStoragePerNode }} GB</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :inline="true" :model="queryParams">
            <el-form-item label="集群名称" prop="clusterName">
              <el-input v-model="queryParams.clusterName" clearable placeholder="请输入集群名称" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="集群状态" prop="status">
              <el-select v-model="queryParams.status" clearable placeholder="请选择集群状态">
                <el-option label="正常" value="0" />
                <el-option label="停用" value="1" />
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

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:cluster:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:cluster:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:cluster:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['pve:cluster:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="clusterList" border @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column v-if="false" align="center" label="集群ID" prop="clusterId" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="集群名称" prop="clusterName" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="API令牌ID" prop="tokenId" />
        <el-table-column align="center" label="集群状态" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="描述" prop="description" />
        <el-table-column align="center" label="排序" prop="sort" width="80" />
        <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="280">
          <template #default="scope">
            <el-tooltip content="测试连接" placement="top">
              <el-button v-hasPermi="['pve:cluster:test']" icon="Connection" link type="success" @click="handleTestConnection(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="查看状态" placement="top">
              <el-button v-hasPermi="['pve:cluster:query']" icon="View" link type="info" @click="handleViewStatus(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="同步信息" placement="top">
              <el-button v-hasPermi="['pve:cluster:sync']" icon="Refresh" link type="warning" @click="handleSync(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['pve:cluster:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['pve:cluster:remove']" icon="Delete" link type="danger" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 添加或修改PVE集群对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" append-to-body width="600px">
      <el-form ref="clusterFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="集群名称" prop="clusterName">
          <el-input v-model="form.clusterName" placeholder="请输入集群名称" />
        </el-form-item>
        <el-form-item label="集群IP地址" prop="ipAddress">
          <el-input v-model="form.ipAddress" placeholder="例如: 192.168.1.100" />
        </el-form-item>
        <el-form-item label="API端口" prop="apiPort">
          <el-input-number v-model="form.apiPort" :max="65535" :min="1" controls-position="right" placeholder="默认8006" />
        </el-form-item>
        <el-form-item label="API令牌ID" prop="tokenId">
          <el-input v-model="form.tokenId" placeholder="例如: root@pam!mytoken" />
        </el-form-item>
        <el-form-item label="API令牌密钥" prop="tokenSecret">
          <el-input v-model="form.tokenSecret" placeholder="请输入API令牌密钥" show-password type="password" />
        </el-form-item>
        <el-form-item label="集群状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" :rows="3" placeholder="请输入描述" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 集群状态对话框 -->
    <el-dialog v-model="statusDialog.visible" append-to-body title="集群状态" width="800px">
      <el-descriptions v-if="statusDialog.data" :column="2" border>
        <el-descriptions-item label="集群名称">{{ statusDialog.data.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ statusDialog.data.version || '-' }}</el-descriptions-item>
        <el-descriptions-item label="节点数量">{{ statusDialog.data.nodes?.length || 0 }}</el-descriptions-item>
        <el-descriptions-item label="法定人数">{{ statusDialog.data.quorate || '-' }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="statusDialog.data?.nodes && statusDialog.data.nodes.length > 0" class="mt-4">
        <el-divider content-position="left">节点列表</el-divider>
        <el-table :data="statusDialog.data.nodes" border>
          <el-table-column label="节点名称" prop="name" />
          <el-table-column label="IP地址" prop="ip" />
          <el-table-column label="状态" prop="online">
            <template #default="scope">
              <el-tag :type="scope.row.online ? 'success' : 'danger'">
                {{ scope.row.online ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="本地节点" prop="local">
            <template #default="scope">
              <el-tag v-if="scope.row.local" type="primary">是</el-tag>
              <span v-else>否</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="statusDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" name="Cluster" setup>
import { addCluster, delCluster, getCluster, getClusterStatus, listCluster, syncClusterInfo, testConnection, updateCluster, getOverview } from '@/api/pve/cluster';
import { ClusterForm, ClusterQuery, ClusterVO } from '@/api/pve/cluster/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const clusterList = ref<ClusterVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

// 统计概览
const overview = ref({
  totalClusters: 0,
  onlineClusters: 0,
  offlineClusters: 0,
  totalNodes: 0,
  onlineNodes: 0,
  offlineNodes: 0,
  totalCpuCores: 0,
  totalMemory: 0,
  totalStorage: 0
});

// 计算属性:节点平均存储
const avgStoragePerNode = computed(() => {
  if (overview.value.totalNodes === 0) return 0;
  return Math.round(overview.value.totalStorage / overview.value.totalNodes);
});

const queryFormRef = ref<ElFormInstance>();
const clusterFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const statusDialog = reactive({
  visible: false,
  data: null as any
});

// IP地址验证函数
const validateIpAddress = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('集群IP地址不能为空'));
  } else {
    const ipPattern = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    if (!ipPattern.test(value)) {
      callback(new Error('请输入正确的IP地址'));
    } else {
      callback();
    }
  }
};

const initFormData: ClusterForm = {
  clusterId: undefined,
  clusterName: undefined,
  ipAddress: undefined,
  apiPort: 8006,
  tokenId: undefined,
  tokenSecret: undefined,
  status: '0',
  description: undefined,
  sort: 0
};

const data = reactive<PageData<ClusterForm, ClusterQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    clusterName: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    clusterName: [{ required: true, message: '集群名称不能为空', trigger: 'blur' }],
    ipAddress: [{ required: true, validator: validateIpAddress, trigger: 'blur' }],
    tokenId: [{ required: true, message: 'API令牌ID不能为空', trigger: 'blur' }],
    tokenSecret: [{ required: true, message: 'API令牌密钥不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询PVE集群列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCluster(queryParams.value);
  clusterList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  clusterFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: ClusterVO[]) => {
  ids.value = selection.map((item) => item.clusterId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加PVE集群';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ClusterVO) => {
  reset();
  const _clusterId = row?.clusterId || ids.value[0];
  const res = await getCluster(_clusterId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改PVE集群';
};

/** 提交按钮 */
const submitForm = () => {
  clusterFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.clusterId) {
        await updateCluster(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCluster(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ClusterVO) => {
  const _clusterIds = row?.clusterId || ids.value;
  await proxy?.$modal.confirm('是否确认删除PVE集群编号为"' + _clusterIds + '"的数据项？').finally(() => (loading.value = false));
  await delCluster(_clusterIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'pve/cluster/export',
    {
      ...queryParams.value
    },
    `cluster_${new Date().getTime()}.xlsx`
  );
};

/** 测试连接 */
const handleTestConnection = async (row: ClusterVO) => {
  try {
    loading.value = true;
    const res = await testConnection(row.clusterId);
    if (res.data) {
      proxy?.$modal.msgSuccess('连接测试成功');
    } else {
      proxy?.$modal.msgError('连接测试失败');
    }
  } catch (error) {
    proxy?.$modal.msgError('连接测试失败');
  } finally {
    loading.value = false;
  }
};

/** 查看状态 */
const handleViewStatus = async (row: ClusterVO) => {
  try {
    loading.value = true;
    const res = await getClusterStatus(row.clusterId);
    statusDialog.data = res.data;
    statusDialog.visible = true;
  } catch (error) {
    proxy?.$modal.msgError('获取集群状态失败');
  } finally {
    loading.value = false;
  }
};

/** 同步信息 */
const handleSync = async (row: ClusterVO) => {
  try {
    await proxy?.$modal.confirm('是否确认同步集群"' + row.clusterName + '"的信息？');
    loading.value = true;
    await syncClusterInfo(row.clusterId);
    proxy?.$modal.msgSuccess('同步成功');
    await getList();
  } catch (error) {
    // 用户取消或同步失败
  } finally {
    loading.value = false;
  }
};

/** 加载统计概览 */
const loadOverview = () => {
  getOverview().then((res: any) => {
    overview.value = res.data || {};
  });
};

onMounted(() => {
  loadOverview();
  getList();
});
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

    &.nodes {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.cpu {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.storage {
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

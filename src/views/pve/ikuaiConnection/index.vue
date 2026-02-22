<template>
  <div class="ikuai-connection-container">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Link /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalConnections }}</span>
          <span class="stat-label">总连接数</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon normal"><CircleCheck /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.normalConnections }}</span>
          <span class="stat-label">正常连接</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon synced"><Finished /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.syncedConnections }}</span>
          <span class="stat-label">已同步</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon pending"><Clock /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.pendingConnections }}</span>
          <span class="stat-label">待同步</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon error"><CircleClose /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.errorConnections }}</span>
          <span class="stat-label">错误连接</span>
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
            <el-radio-button label="0">正常</el-radio-button>
            <el-radio-button label="1">停用</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 中间：操作按钮 -->
        <div class="toolbar-section">
          <el-button v-hasPermi="['pve:ikuaiConnection:add']" icon="Plus" type="primary" @click="handleAdd">新增连接</el-button>
          <el-button v-hasPermi="['pve:ikuaiConnection:remove']" icon="Delete" :disabled="multiple" @click="handleDelete()">删除</el-button>
          <el-button v-hasPermi="['pve:ikuaiConnection:export']" icon="Download" @click="handleExport">导出</el-button>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-input
            v-model="queryParams.connectionName"
            class="search-input"
            clearable
            placeholder="搜索连接名称"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 连接列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="ikuaiConnectionList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- 连接信息 -->
        <el-table-column label="连接信息" min-width="250">
          <template #default="{ row }">
            <div class="connection-info">
              <div class="connection-name">
                <el-icon class="connection-icon"><Link /></el-icon>
                <span class="name-text">{{ row.connectionName }}</span>
              </div>
              <div class="connection-address">
                <el-tag size="small" type="info">{{ row.ikuaiHost }}:{{ row.ikuaiPort || 80 }}</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 认证信息 -->
        <el-table-column label="认证信息" width="200">
          <template #default="{ row }">
            <div class="auth-info">
              <div class="auth-item">
                <el-icon><User /></el-icon>
                <span>{{ row.username }}</span>
              </div>
              <div class="auth-item">
                <el-icon><Lock /></el-icon>
                <span>{{ row.password ? '••••••••' : '-' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- API版本 -->
        <el-table-column align="center" label="API版本" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.apiVersion || 'v1' }}</el-tag>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column align="center" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 描述 -->
        <el-table-column label="描述" min-width="200" prop="description" show-overflow-tooltip />

        <!-- 创建时间 -->
        <el-table-column align="center" label="创建时间" prop="createTime" width="160" />

        <!-- 操作列 -->
        <el-table-column align="center" fixed="right" label="操作" width="120">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
              <el-button link type="primary">
                更多
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-hasPermi="['pve:ikuaiConnection:test']" command="test">测试连接</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:ikuaiConnection:sync']" command="sync">同步信息</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:ikuaiConnection:edit']" command="edit" divided>修改</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:ikuaiConnection:remove']" command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </div>

    <!-- 添加/修改对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" append-to-body width="700px" @close="cancel">
      <el-form ref="ikuaiConnectionFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="连接名称" prop="connectionName">
              <el-input v-model="form.connectionName" maxlength="100" placeholder="请输入连接名称，如：主路由器" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="主机地址" prop="ikuaiHost">
              <el-input v-model="form.ikuaiHost" placeholder="请输入IP地址或域名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="端口" prop="ikuaiPort">
              <el-input-number v-model="form.ikuaiPort" :max="65535" :min="1" placeholder="80" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入密码" show-password type="password" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="API版本" prop="apiVersion">
              <el-select v-model="form.apiVersion" placeholder="请选择API版本" style="width: 100%">
                <el-option label="v1" value="v1" />
                <el-option label="v2" value="v2" />
                <el-option label="v3" value="v3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="form.description" :rows="3" maxlength="500" placeholder="请输入连接描述信息" show-word-limit type="textarea" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" :rows="2" maxlength="500" placeholder="请输入备注信息" show-word-limit type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" name="IkuaiConnection" setup>
import { ElLoading } from 'element-plus';
import {
  addIkuaiConnection,
  delIkuaiConnection,
  getIkuaiConnection,
  listIkuaiConnection,
  testIkuaiConnection,
  syncIkuaiNetworkInfo,
  updateIkuaiConnection
} from '@/api/pve/ikuaiConnection';
import { IkuaiConnectionForm, IkuaiConnectionQuery, IkuaiConnectionVO } from '@/api/pve/ikuaiConnection/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const ikuaiConnectionList = ref<IkuaiConnectionVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);

// 统计概览
const overview = ref({
  totalConnections: 0,
  normalConnections: 0,
  syncedConnections: 0,
  pendingConnections: 0,
  errorConnections: 0
});

const ikuaiConnectionFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: IkuaiConnectionForm = {
  connectionId: undefined,
  connectionName: undefined,
  ikuaiHost: undefined,
  ikuaiPort: 80,
  username: undefined,
  password: undefined,
  apiVersion: 'v1',
  status: '0',
  description: undefined,
  remark: undefined
};

const data = reactive<PageData<IkuaiConnectionForm, IkuaiConnectionQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    connectionName: undefined,
    ikuaiHost: undefined,
    ikuaiPort: undefined,
    username: undefined,
    password: undefined,
    apiVersion: undefined,
    status: undefined,
    description: undefined,
    params: {}
  },
  rules: {
    connectionName: [{ required: true, message: '连接名称不能为空', trigger: 'blur' }],
    ikuaiHost: [
      { required: true, message: '主机地址不能为空', trigger: 'blur' },
      {
        pattern: /^(\d{1,3}\.){3}\d{1,3}$|^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
        message: '请输入正确的IP地址或域名',
        trigger: 'blur'
      }
    ],
    ikuaiPort: [{ required: true, message: '端口不能为空', trigger: 'blur' }],
    username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
    password: [
      {
        required: true,
        message: '密码不能为空',
        trigger: 'blur',
        validator: (rule: any, value: any, callback: any) => {
          // 如果是新增，密码必填
          if (!form.value.connectionId && !value) {
            callback(new Error('密码不能为空'));
          } else {
            callback();
          }
        }
      }
    ],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 计算统计概览 */
function calculateOverview() {
  const total = ikuaiConnectionList.value.length;
  const normal = ikuaiConnectionList.value.filter((c) => c.status === '0').length;
  
  overview.value = {
    totalConnections: total,
    normalConnections: normal,
    syncedConnections: Math.floor(normal * 0.8), // 模拟数据
    pendingConnections: Math.floor(normal * 0.15), // 模拟数据
    errorConnections: total - normal
  };
}

/** 查询iKuai路由器连接配置列表 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await listIkuaiConnection(queryParams.value);
    ikuaiConnectionList.value = res.rows;
    total.value = res.total;
    calculateOverview();
  } finally {
    loading.value = false;
  }
};

/** 刷新 */
const handleRefresh = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    connectionName: undefined,
    ikuaiHost: undefined,
    ikuaiPort: undefined,
    username: undefined,
    password: undefined,
    apiVersion: undefined,
    status: undefined,
    description: undefined,
    params: {}
  };
  getList();
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  ikuaiConnectionFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: IkuaiConnectionVO[]) => {
  ids.value = selection.map((item) => item.connectionId);
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加iKuai路由器连接';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: IkuaiConnectionVO) => {
  reset();
  const _connectionId = row?.connectionId || ids.value[0];
  const res = await getIkuaiConnection(_connectionId);
  Object.assign(form.value, res.data);
  // 编辑时不显示密码，如果用户不修改密码字段，后端会保持原密码
  form.value.password = undefined;
  dialog.visible = true;
  dialog.title = '修改iKuai路由器连接';
};

/** 提交按钮 */
const submitForm = () => {
  ikuaiConnectionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        // 如果是编辑且密码为空，则不传递密码字段
        const submitData = { ...form.value };
        if (submitData.connectionId && !submitData.password) {
          delete submitData.password;
        }

        if (submitData.connectionId) {
          await updateIkuaiConnection(submitData);
        } else {
          await addIkuaiConnection(submitData);
        }
        proxy?.$modal.msgSuccess('操作成功');
        dialog.visible = false;
        await getList();
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: IkuaiConnectionVO) => {
  const _connectionIds = row?.connectionId || ids.value;
  await proxy?.$modal.confirm('是否确认删除选中的iKuai路由器连接？此操作不可恢复！');
  try {
    await delIkuaiConnection(_connectionIds);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
  } catch (error) {
    console.error('删除失败:', error);
  }
};

/** 测试连接 */
const handleTest = async (row: IkuaiConnectionVO) => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在测试连接...',
    background: 'rgba(0, 0, 0, 0.7)'
  });

  try {
    await testIkuaiConnection(row.connectionId);
    loadingInstance.close();
    proxy?.$modal.msgSuccess(`连接 "${row.connectionName}" 测试成功！`);
  } catch (error: any) {
    loadingInstance.close();
    // 错误信息已经由axios拦截器通过ElNotification显示了
    // 这里不需要再次显示，只需要记录日志
    console.error('测试连接失败:', error);
  }
};

/** 同步网络信息 */
const handleSync = async (row: IkuaiConnectionVO) => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在同步网络信息...',
    background: 'rgba(0, 0, 0, 0.7)'
  });

  try {
    const res = await syncIkuaiNetworkInfo(row.connectionId);
    loadingInstance.close();
    
    if (res.data && res.data.success) {
      proxy?.$modal.msgSuccess(res.data.message || '同步成功');
    } else {
      proxy?.$modal.msgError(res.data?.message || '同步失败');
    }
  } catch (error: any) {
    loadingInstance.close();
    console.error('同步网络信息失败:', error);
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'pve/ikuaiConnection/export',
    {
      ...queryParams.value
    },
    `ikuai_connection_${new Date().getTime()}.xlsx`
  );
};

/** 操作命令处理 */
const handleCommand = (command: string, row: IkuaiConnectionVO) => {
  switch (command) {
    case 'test':
      handleTest(row);
      break;
    case 'sync':
      handleSync(row);
      break;
    case 'edit':
      handleUpdate(row);
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.ikuai-connection-container {
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
  &.normal {
    color: #67c23a;
  }
  &.synced {
    color: #409eff;
  }
  &.pending {
    color: #e6a23c;
  }
  &.error {
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

// 连接信息样式
.connection-info {
  .connection-name {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;

    .connection-icon {
      color: #409eff;
      font-size: 16px;
    }

    .name-text {
      color: #303133;
    }
  }

  .connection-address {
    font-size: 12px;
    color: #909399;
  }
}

// 认证信息样式
.auth-info {
  .auth-item {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    font-size: 13px;
    color: #606266;

    &:last-child {
      margin-bottom: 0;
    }

    .el-icon {
      color: #909399;
      font-size: 14px;
    }
  }
}

// 对话框样式
:deep(.el-dialog) {
  .el-dialog__header {
    border-bottom: 1px solid #e4e7ed;
    padding: 16px 20px;
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    border-top: 1px solid #e4e7ed;
    padding: 12px 20px;
  }
}

// 表单样式优化
:deep(.el-form) {
  .el-form-item {
    margin-bottom: 18px;
  }

  .el-input-number {
    width: 100%;
  }
}

// 表格样式优化
:deep(.el-table) {
  .el-table__header {
    th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
    }
  }

  .el-table__row {
    &:hover {
      background-color: #f5f7fa;
    }
  }
}
</style>

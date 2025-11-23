<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="search">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" label-width="85px">
          <el-form-item label="客户端key" prop="clientKey">
            <el-input v-model="queryParams.clientKey" clearable placeholder="请输入客户端key" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="客户端秘钥" prop="clientSecret">
            <el-input v-model="queryParams.clientSecret" clearable placeholder="请输入客户端秘钥" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" clearable placeholder="状态">
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:client:add']" icon="Plus" plain type="primary" @click="handleAdd">新增 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:client:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:client:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:client:export']" icon="Download" plain type="warning" @click="handleExport"> 导出 </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="clientList" border @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column v-if="true" align="center" label="id" prop="id" />
        <el-table-column align="center" label="客户端id" prop="clientId" />
        <el-table-column align="center" label="客户端key" prop="clientKey" />
        <el-table-column align="center" label="客户端秘钥" prop="clientSecret" width="200">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center">
              <transition name="fade" mode="out-in">
                <span v-if="!scope.row._showSecret" key="hidden">**********</span>
                <span v-else key="visible" style="font-family: monospace; color: #409eff">{{ scope.row._secretValue || '加载中...' }}</span>
              </transition>
              <el-icon
                v-hasPermi="['system:client:secretQuery']"
                :class="{ 'icon-transition': true, 'is-rotating': scope.row._loading }"
                style="margin-left: 8px; cursor: pointer; font-size: 16px; color: #409eff"
                @click="toggleSecretVisibility(scope.row)"
              >
                <transition name="icon-fade" mode="out-in">
                  <View v-if="!scope.row._showSecret" key="view" />
                  <Hide v-else key="hide" />
                </transition>
              </el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="授权类型">
          <template #default="scope">
            <dict-tag :options="sys_grant_type" :value="scope.row.grantTypeList" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="设备类型">
          <template #default="scope">
            <dict-tag :options="sys_device_type" :value="scope.row.deviceType" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="Token活跃超时时间" prop="activeTimeout" />
        <el-table-column align="center" label="Token固定超时时间" prop="timeout" />
        <el-table-column key="status" align="center" label="状态">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['system:client:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['system:client:remove']" icon="Delete" link type="primary" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改客户端管理对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" append-to-body width="500px">
      <el-form ref="clientFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户端key" prop="clientKey">
          <el-input v-model="form.clientKey" :disabled="form.id != null" placeholder="请输入客户端key" />
        </el-form-item>
        <el-form-item label="客户端秘钥" prop="clientSecret">
          <el-input v-model="form.clientSecret" :type="secretInputType" placeholder="请输入客户端秘钥">
            <template #suffix>
              <el-icon v-if="form.id" style="cursor: pointer" @click="toggleFormSecretVisibility">
                <View v-if="secretInputType === 'password'" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="授权类型" prop="grantTypeList">
          <el-select v-model="form.grantTypeList" multiple placeholder="请输入授权类型">
            <el-option v-for="dict in sys_grant_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="form.deviceType" placeholder="请输入设备类型">
            <el-option v-for="dict in sys_device_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="auto" prop="activeTimeout">
          <template #label>
            <span>
              <el-tooltip content="指定时间无操作则过期（单位：秒），默认30分钟（1800秒）" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              Token活跃超时时间
            </span>
          </template>
          <el-input v-model="form.activeTimeout" placeholder="请输入Token活跃超时时间" />
        </el-form-item>
        <el-form-item label-width="auto" prop="timeout">
          <template #label>
            <span>
              <el-tooltip content="指定时间必定过期（单位：秒），默认七天（604800秒）" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              Token固定超时时间
            </span>
          </template>
          <el-input v-model="form.timeout" placeholder="请输入Token固定超时时间" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" name="Client" setup>
import { addClient, changeStatus, delClient, getClient, getClientSecret, listClient, updateClient } from '@/api/system/client';
import { ClientForm, ClientQuery, ClientVO } from '@/api/system/client/types';
import { View, Hide } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));
const { sys_grant_type } = toRefs<any>(proxy?.useDict('sys_grant_type'));
const { sys_device_type } = toRefs<any>(proxy?.useDict('sys_device_type'));

const clientList = ref<ClientVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const secretInputType = ref<'text' | 'password'>('password');

const queryFormRef = ref<ElFormInstance>();
const clientFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ClientForm = {
  id: undefined,
  clientId: undefined,
  clientKey: undefined,
  clientSecret: undefined,
  grantTypeList: undefined,
  deviceType: undefined,
  activeTimeout: undefined,
  timeout: undefined,
  status: undefined
};
const data = reactive<PageData<ClientForm, ClientQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    clientId: undefined,
    clientKey: undefined,
    clientSecret: undefined,
    grantType: undefined,
    deviceType: undefined,
    activeTimeout: undefined,
    timeout: undefined,
    status: undefined
  },
  rules: {
    id: [{ required: true, message: 'id不能为空', trigger: 'blur' }],
    clientId: [{ required: true, message: '客户端id不能为空', trigger: 'blur' }],
    clientKey: [{ required: true, message: '客户端key不能为空', trigger: 'blur' }],
    clientSecret: [{ required: true, message: '客户端秘钥不能为空', trigger: 'blur' }],
    grantTypeList: [{ required: true, message: '授权类型不能为空', trigger: 'change' }],
    deviceType: [{ required: true, message: '设备类型不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询客户端管理列表 */
const getList = async () => {
  loading.value = true;
  const res = await listClient(queryParams.value);
  clientList.value = res.rows;
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
  clientFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ClientVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加客户端管理';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ClientVO) => {
  reset();
  secretInputType.value = 'password';
  const _id = row?.id || ids.value[0];
  const res = await getClient(_id);
  Object.assign(form.value, res.data);
  // 修改时不显示clientSecret，显示占位符
  form.value.clientSecret = '**********';
  dialog.visible = true;
  dialog.title = '修改客户端管理';
};

/** 切换表格中密钥的显示状态 */
const toggleSecretVisibility = async (row: any) => {
  if (!row._showSecret) {
    // 显示密钥
    if (row._loading) return; // 防止重复点击
    row._loading = true;
    try {
      const res = await getClientSecret(row.id);
      row._secretValue = res.data;
      row._showSecret = true;
    } catch (error) {
      proxy?.$modal.msgError('获取密钥失败');
    } finally {
      row._loading = false;
    }
  } else {
    // 隐藏密钥
    row._showSecret = false;
  }
};

/** 切换表单中密钥的显示状态 */
const toggleFormSecretVisibility = async () => {
  if (!form.value.id) {
    return;
  }
  if (secretInputType.value === 'password') {
    // 显示密钥
    try {
      const res = await getClientSecret(form.value.id);
      form.value.clientSecret = res.data;
      secretInputType.value = 'text';
    } catch (error) {
      proxy?.$modal.msgError('获取密钥失败');
    }
  } else {
    // 隐藏密钥
    form.value.clientSecret = '**********';
    secretInputType.value = 'password';
  }
};

/** 提交按钮 */
const submitForm = () => {
  clientFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      // 如果是修改且clientSecret为占位符，则不提交clientSecret
      const submitData = { ...form.value };
      if (form.value.id && form.value.clientSecret === '**********') {
        delete submitData.clientSecret;
      }
      if (form.value.id) {
        await updateClient(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addClient(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess(form.value.id ? '修改成功' : '新增成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ClientVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除客户端管理编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delClient(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'system/client/export',
    {
      ...queryParams.value
    },
    `client_${new Date().getTime()}.xlsx`
  );
};

/** 状态修改  */
const handleStatusChange = async (row: ClientVO) => {
  const text = row.status === '0' ? '启用' : '停用';
  try {
    await proxy?.$modal.confirm('确认要"' + text + '"吗?');
    await changeStatus(row.clientId, row.status);
    proxy?.$modal.msgSuccess(text + '成功');
  } catch (err) {
    row.status = row.status === '0' ? '1' : '0';
  }
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
/* 文字淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* 图标淡入淡出动画 */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.2s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 图标过渡效果 */
.icon-transition {
  transition: all 0.3s ease;
}

.icon-transition:hover {
  transform: scale(1.2);
  color: #66b1ff !important;
}

/* 加载旋转动画 */
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.is-rotating {
  animation: rotating 1s linear infinite;
}
</style>

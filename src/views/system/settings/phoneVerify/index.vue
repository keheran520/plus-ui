<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="search">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" label-width="100px">
          <el-form-item label="配置名称" prop="configName">
            <el-input v-model="queryParams.configName" clearable placeholder="请输入配置名称" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="接入点" prop="endpoint">
            <el-input v-model="queryParams.endpoint" clearable placeholder="请输入接入点" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="服务商类型" prop="provider">
            <el-select v-model="queryParams.provider" clearable placeholder="请选择服务商类型">
              <el-option v-for="dict in sys_phone_verify_provider" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="调试模式" prop="debugMode">
            <el-select v-model="queryParams.debugMode" clearable placeholder="请选择调试模式">
              <el-option label="关闭" value="0" @keyup.enter="handleQuery" />
              <el-option label="开启" value="1" @keyup.enter="handleQuery" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否默认配置" prop="isDefault">
            <el-select v-model="queryParams.isDefault" clearable placeholder="请选择是否默认配置">
              <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['system:phoneVerifyConfig:add']" icon="Plus" plain type="primary" @click="handleAdd">新增 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:phoneVerifyConfig:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()"
              >修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:phoneVerifyConfig:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()"
              >删除
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="configList" border @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="center" label="配置名称" prop="configName" />
        <el-table-column align="center" label="服务商类型" prop="provider">
          <template #default="scope">
            <dict-tag :options="sys_phone_verify_provider" :value="scope.row.provider" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="AccessKey ID" prop="accessKeyId" show-overflow-tooltip />
        <el-table-column align="center" label="AccessKey Secret" prop="accessKeySecret" show-overflow-tooltip width="200">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center; max-width: 180px">
              <transition mode="out-in" name="fade">
                <span v-if="!scope.row._showSecret" key="hidden" style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
                  >**********</span
                >
                <span
                  v-else
                  key="visible"
                  style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace; color: #409eff"
                  >{{ scope.row._secretValue || '加载中...' }}</span
                >
              </transition>
              <el-icon
                v-hasPermi="['system:phoneVerifyConfig:secretQuery']"
                :class="{ 'icon-transition': true, 'is-rotating': scope.row._loading }"
                style="margin-left: 8px; cursor: pointer; font-size: 16px; color: #409eff; flex-shrink: 0"
                @click="toggleSecretVisibility(scope.row)"
              >
                <transition mode="out-in" name="icon-fade">
                  <View v-if="!scope.row._showSecret" key="view" />
                  <Hide v-else key="hide" />
                </transition>
              </el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="签名名称" prop="signName" />
        <el-table-column align="center" label="调试模式" prop="debugMode">
          <template #default="scope">
            <el-tag v-if="scope.row.debugMode === '1'" type="success">开启</el-tag>
            <el-tag v-else type="info">关闭</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="是否默认" prop="isDefault">
          <template #default="scope">
            <el-switch v-model="scope.row.isDefault" active-value="Y" inactive-value="N" @change="handleDefaultChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['system:phoneVerifyConfig:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['system:phoneVerifyConfig:remove']"
                icon="Delete"
                link
                type="primary"
                @click="handleDelete(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 添加或修改号码认证配置对话框 -->
    <el-drawer v-model="dialog.visible" :title="dialog.title" append-to-body size="600">
      <el-form ref="configFormRef" :model="form" :rules="rules" label-position="top" label-width="150px">
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="服务商类型" prop="provider">
          <el-select v-model="form.provider" placeholder="请选择服务商类型" @change="handleProviderChange">
            <el-option v-for="dict in sys_phone_verify_provider" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>

        <!-- 阿里云配置 -->
        <template v-if="form.provider === 'aliyun'">
          <el-form-item label="AccessKey ID" prop="accessKeyId">
            <el-input v-model="form.accessKeyId" placeholder="请输入AccessKey ID" />
          </el-form-item>
          <el-form-item label="AccessKey Secret" prop="accessKeySecret">
            <el-input v-model="form.accessKeySecret" :type="secretInputType" placeholder="请输入AccessKey Secret">
              <template #suffix>
                <el-icon
                  v-if="form.configId"
                  :class="{ 'icon-transition': true, 'is-rotating': secretLoading }"
                  style="cursor: pointer; color: #409eff"
                  @click="toggleFormSecretVisibility"
                >
                  <transition mode="out-in" name="icon-fade">
                    <View v-if="secretInputType === 'password'" key="view" />
                    <Hide v-else key="hide" />
                  </transition>
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="接入点" prop="endpoint">
            <el-input v-model="form.endpoint" placeholder="请输入接入点，默认：dypnsapi.aliyuncs.com" />
          </el-form-item>
          <el-form-item label="签名名称" prop="signName">
            <el-input v-model="form.signName" placeholder="请输入签名名称" />
          </el-form-item>
        </template>

        <!-- 腾讯云配置 -->
        <template v-if="form.provider === 'tencent'">
          <el-form-item label="SecretId" prop="accessKeyId">
            <el-input v-model="form.accessKeyId" placeholder="请输入SecretId" />
          </el-form-item>
          <el-form-item label="SecretKey" prop="accessKeySecret">
            <el-input v-model="form.accessKeySecret" :type="secretInputType" placeholder="请输入SecretKey">
              <template #suffix>
                <el-icon
                  v-if="form.configId"
                  :class="{ 'icon-transition': true, 'is-rotating': secretLoading }"
                  style="cursor: pointer; color: #409eff"
                  @click="toggleFormSecretVisibility"
                >
                  <transition mode="out-in" name="icon-fade">
                    <View v-if="secretInputType === 'password'" key="view" />
                    <Hide v-else key="hide" />
                  </transition>
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="SDK AppId" prop="sdkAppId">
            <el-input v-model="form.sdkAppId" placeholder="请输入SDK AppId" />
          </el-form-item>
          <el-form-item label="签名名称" prop="signName">
            <el-input v-model="form.signName" placeholder="请输入签名名称" />
          </el-form-item>
        </template>

        <!-- 华为云配置 -->
        <template v-if="form.provider === 'huawei'">
          <el-form-item label="App Key" prop="accessKeyId">
            <el-input v-model="form.accessKeyId" placeholder="请输入App Key" />
          </el-form-item>
          <el-form-item label="App Secret" prop="accessKeySecret">
            <el-input v-model="form.accessKeySecret" :type="secretInputType" placeholder="请输入App Secret">
              <template #suffix>
                <el-icon
                  v-if="form.configId"
                  :class="{ 'icon-transition': true, 'is-rotating': secretLoading }"
                  style="cursor: pointer; color: #409eff"
                  @click="toggleFormSecretVisibility"
                >
                  <transition mode="out-in" name="icon-fade">
                    <View v-if="secretInputType === 'password'" key="view" />
                    <Hide v-else key="hide" />
                  </transition>
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="通道号" prop="sender">
            <el-input v-model="form.sender" placeholder="请输入通道号" />
          </el-form-item>
          <el-form-item label="签名通道号" prop="signature">
            <el-input v-model="form.signature" placeholder="请输入签名通道号" />
          </el-form-item>
        </template>

        <el-form-item label="默认模板ID" prop="defaultTemplateId">
          <el-input v-model="form.defaultTemplateId" placeholder="请输入默认模板ID" />
        </el-form-item>
        <el-form-item label="调试模式" prop="debugMode">
          <el-radio-group v-model="form.debugMode">
            <el-radio value="0">关闭</el-radio>
            <el-radio value="1">开启</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" name="PhoneVerifyConfig" setup>
import {
  addPhoneVerifyConfig,
  delPhoneVerifyConfig,
  getPhoneVerifyConfig,
  getPhoneVerifyConfigSecret,
  listPhoneVerifyConfig,
  setDefaultPhoneVerifyConfig,
  updatePhoneVerifyConfig
} from '@/api/system/phoneVerifyConfig';
import { PhoneVerifyConfigForm, PhoneVerifyConfigQuery, PhoneVerifyConfigVO } from '@/api/system/phoneVerifyConfig/types';
import { Hide, View } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_phone_verify_provider, sys_yes_no } = toRefs<any>(proxy?.useDict('sys_phone_verify_provider', 'sys_yes_no'));

const configList = ref<PhoneVerifyConfigVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const showSearch = ref(true);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const secretInputType = ref<'text' | 'password'>('password');
const secretLoading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const configFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PhoneVerifyConfigForm = {
  configId: undefined,
  configName: undefined,
  provider: undefined,
  accessKeyId: undefined,
  accessKeySecret: undefined,
  endpoint: undefined,
  sdkAppId: undefined,
  sender: undefined,
  signature: undefined,
  signName: undefined,
  defaultTemplateId: undefined,
  debugMode: '0',
  isDefault: 'N',
  remark: undefined
};

const data = reactive<PageData<PhoneVerifyConfigForm, PhoneVerifyConfigQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configName: undefined,
    provider: undefined,
    isDefault: undefined
  },
  rules: {
    configName: [{ required: true, message: '配置名称不能为空', trigger: 'blur' }],
    provider: [{ required: true, message: '服务商类型不能为空', trigger: 'change' }],
    accessKeyId: [{ required: true, message: 'AccessKey ID不能为空', trigger: 'blur' }],
    accessKeySecret: [{ required: true, message: 'AccessKey Secret不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询号码认证配置列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPhoneVerifyConfig(queryParams.value);
  configList.value = res.rows;
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
  secretInputType.value = 'password';
  configFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PhoneVerifyConfigVO[]) => {
  ids.value = selection.map((item) => item.configId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加号码认证配置';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: PhoneVerifyConfigVO) => {
  reset();
  secretInputType.value = 'password';
  const configId = row?.configId || ids.value[0];
  const res = await getPhoneVerifyConfig(configId);
  Object.assign(form.value, res.data);
  // 修改时不显示accessKeySecret，显示占位符
  form.value.accessKeySecret = '**********';
  dialog.visible = true;
  dialog.title = '修改号码认证配置';
};

/** 服务商类型改变 */
const handleProviderChange = () => {
  // 清空特定服务商的字段
  form.value.endpoint = undefined;
  form.value.sdkAppId = undefined;
  form.value.sender = undefined;
  form.value.signature = undefined;
};

/** 切换表格中密钥的显示状态 */
const toggleSecretVisibility = async (row: any) => {
  if (!row._showSecret) {
    // 显示密钥
    if (row._loading) return; // 防止重复点击
    row._loading = true;
    try {
      const res = await getPhoneVerifyConfigSecret(row.configId);
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
  if (!form.value.configId) {
    return;
  }
  if (secretInputType.value === 'password') {
    // 显示密钥
    if (secretLoading.value) return; // 防止重复点击
    secretLoading.value = true;
    try {
      const res = await getPhoneVerifyConfigSecret(form.value.configId);
      form.value.accessKeySecret = res.data;
      secretInputType.value = 'text';
    } catch (error) {
      proxy?.$modal.msgError('获取密钥失败');
    } finally {
      secretLoading.value = false;
    }
  } else {
    // 隐藏密钥
    form.value.accessKeySecret = '**********';
    secretInputType.value = 'password';
  }
};

/** 提交按钮 */
const submitForm = () => {
  configFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      // 如果是修改且accessKeySecret为占位符，则不提交accessKeySecret
      const submitData = { ...form.value };
      if (form.value.configId && form.value.accessKeySecret === '**********') {
        delete submitData.accessKeySecret;
      }
      if (form.value.configId) {
        await updatePhoneVerifyConfig(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addPhoneVerifyConfig(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess(form.value.configId ? '修改成功' : '新增成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: PhoneVerifyConfigVO) => {
  const configIds = row?.configId || ids.value;
  await proxy?.$modal.confirm('是否确认删除号码认证配置编号为"' + configIds + '"的数据项？');
  loading.value = true;
  await delPhoneVerifyConfig(configIds).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

/** 默认配置切换 */
const handleDefaultChange = async (row: PhoneVerifyConfigVO) => {
  const text = row.isDefault === 'Y' ? '设为默认' : '取消默认';
  try {
    await proxy?.$modal.confirm('确认要"' + text + '""' + row.configName + '"配置吗?');
    await setDefaultPhoneVerifyConfig(row.configId);
    await getList();
    proxy?.$modal.msgSuccess(text + '成功');
  } catch {
    // 用户取消操作，恢复开关状态
    row.isDefault = row.isDefault === 'Y' ? 'N' : 'Y';
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

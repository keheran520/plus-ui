<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="配置名称" prop="configName">
              <el-input v-model="queryParams.configName" placeholder="请输入配置名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="服务商类型" prop="provider">
              <el-select v-model="queryParams.provider" placeholder="请选择服务商类型" clearable >
                <el-option v-for="dict in sys_phone_verify_provider" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="AccessKey ID" prop="accessKeyId">
              <el-input v-model="queryParams.accessKeyId" placeholder="请输入AccessKey ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="AccessKey Secret / SecretKey / App Secret " prop="accessKeySecret">
              <el-input v-model="queryParams.accessKeySecret" placeholder="请输入AccessKey Secret / SecretKey / App Secret " clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="接入点" prop="endpoint">
              <el-input v-model="queryParams.endpoint" placeholder="请输入接入点" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="SDK AppId" prop="sdkAppId">
              <el-input v-model="queryParams.sdkAppId" placeholder="请输入SDK AppId" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="通道号" prop="sender">
              <el-input v-model="queryParams.sender" placeholder="请输入通道号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="签名通道号" prop="signature">
              <el-input v-model="queryParams.signature" placeholder="请输入签名通道号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="签名名称" prop="signName">
              <el-input v-model="queryParams.signName" placeholder="请输入签名名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="默认模板ID" prop="defaultTemplateId">
              <el-input v-model="queryParams.defaultTemplateId" placeholder="请输入默认模板ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="调试模式(0:关闭 1:开启)" prop="debugMode">
              <el-input v-model="queryParams.debugMode" placeholder="请输入调试模式(0:关闭 1:开启)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="是否默认配置(N:否 Y:是)" prop="isDefault">
              <el-input v-model="queryParams.isDefault" placeholder="请输入是否默认配置(N:否 Y:是)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:phoneVerifyConfig:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:phoneVerifyConfig:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:phoneVerifyConfig:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:phoneVerifyConfig:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="phoneVerifyConfigList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="配置ID" align="center" prop="configId" v-if="true" />
        <el-table-column label="配置名称" align="center" prop="configName" />
        <el-table-column label="服务商类型" align="center" prop="provider">
          <template #default="scope">
            <dict-tag :options="sys_phone_verify_provider" :value="scope.row.provider"/>
          </template>
        </el-table-column>
        <el-table-column label="AccessKey ID" align="center" prop="accessKeyId" />
        <el-table-column label="AccessKey Secret / SecretKey / App Secret " align="center" prop="accessKeySecret" />
        <el-table-column label="接入点" align="center" prop="endpoint" />
        <el-table-column label="SDK AppId" align="center" prop="sdkAppId" />
        <el-table-column label="通道号" align="center" prop="sender" />
        <el-table-column label="签名通道号" align="center" prop="signature" />
        <el-table-column label="签名名称" align="center" prop="signName" />
        <el-table-column label="默认模板ID" align="center" prop="defaultTemplateId" />
        <el-table-column label="调试模式(0:关闭 1:开启)" align="center" prop="debugMode" />
        <el-table-column label="状态" align="center" prop="status" />
        <el-table-column label="是否默认配置(N:否 Y:是)" align="center" prop="isDefault" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:phoneVerifyConfig:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:phoneVerifyConfig:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改号码认证配置对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="phoneVerifyConfigFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="服务商类型" prop="provider">
          <el-select v-model="form.provider" placeholder="请选择服务商类型">
            <el-option
                v-for="dict in sys_phone_verify_provider"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="AccessKey ID" prop="accessKeyId">
          <el-input v-model="form.accessKeyId" placeholder="请输入AccessKey ID" />
        </el-form-item>
        <el-form-item label="AccessKey Secret / SecretKey / App Secret " prop="accessKeySecret">
            <el-input v-model="form.accessKeySecret" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="接入点" prop="endpoint">
          <el-input v-model="form.endpoint" placeholder="请输入接入点" />
        </el-form-item>
        <el-form-item label="SDK AppId" prop="sdkAppId">
          <el-input v-model="form.sdkAppId" placeholder="请输入SDK AppId" />
        </el-form-item>
        <el-form-item label="通道号" prop="sender">
          <el-input v-model="form.sender" placeholder="请输入通道号" />
        </el-form-item>
        <el-form-item label="签名通道号" prop="signature">
          <el-input v-model="form.signature" placeholder="请输入签名通道号" />
        </el-form-item>
        <el-form-item label="签名名称" prop="signName">
          <el-input v-model="form.signName" placeholder="请输入签名名称" />
        </el-form-item>
        <el-form-item label="默认模板ID" prop="defaultTemplateId">
          <el-input v-model="form.defaultTemplateId" placeholder="请输入默认模板ID" />
        </el-form-item>
        <el-form-item label="调试模式(0:关闭 1:开启)" prop="debugMode">
          <el-input v-model="form.debugMode" placeholder="请输入调试模式(0:关闭 1:开启)" />
        </el-form-item>
        <el-form-item label="是否默认配置(N:否 Y:是)" prop="isDefault">
          <el-input v-model="form.isDefault" placeholder="请输入是否默认配置(N:否 Y:是)" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="PhoneVerifyConfig" lang="ts">
import { listPhoneVerifyConfig, getPhoneVerifyConfig, delPhoneVerifyConfig, addPhoneVerifyConfig, updatePhoneVerifyConfig } from '@/api/system/phoneVerifyConfig';
import { PhoneVerifyConfigVO, PhoneVerifyConfigQuery, PhoneVerifyConfigForm } from '@/api/system/phoneVerifyConfig/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_phone_verify_provider } = toRefs<any>(proxy?.useDict('sys_phone_verify_provider'));

const phoneVerifyConfigList = ref<PhoneVerifyConfigVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const phoneVerifyConfigFormRef = ref<ElFormInstance>();

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
  debugMode: undefined,
  status: undefined,
  isDefault: undefined,
  remark: undefined,
}
const data = reactive<PageData<PhoneVerifyConfigForm, PhoneVerifyConfigQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
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
    debugMode: undefined,
    status: undefined,
    isDefault: undefined,
    params: {
    }
  },
  rules: {
    configId: [
      { required: true, message: "配置ID不能为空", trigger: "blur" }
    ],
    configName: [
      { required: true, message: "配置名称不能为空", trigger: "blur" }
    ],
    provider: [
      { required: true, message: "服务商类型不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询号码认证配置列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPhoneVerifyConfig(queryParams.value);
  phoneVerifyConfigList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  phoneVerifyConfigFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: PhoneVerifyConfigVO[]) => {
  ids.value = selection.map(item => item.configId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加号码认证配置";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: PhoneVerifyConfigVO) => {
  reset();
  const _configId = row?.configId || ids.value[0]
  const res = await getPhoneVerifyConfig(_configId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改号码认证配置";
}

/** 提交按钮 */
const submitForm = () => {
  phoneVerifyConfigFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.configId) {
        await updatePhoneVerifyConfig(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addPhoneVerifyConfig(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: PhoneVerifyConfigVO) => {
  const _configIds = row?.configId || ids.value;
  await proxy?.$modal.confirm('是否确认删除号码认证配置编号为"' + _configIds + '"的数据项？').finally(() => loading.value = false);
  await delPhoneVerifyConfig(_configIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/phoneVerifyConfig/export', {
    ...queryParams.value
  }, `phoneVerifyConfig_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>

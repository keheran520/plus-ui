<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :inline="true" :model="queryParams">
            <el-form-item label="参数名称" prop="configName">
              <el-input v-model="queryParams.configName" clearable placeholder="请输入参数名称" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="参数键名" prop="configKey">
              <el-input v-model="queryParams.configKey" clearable placeholder="请输入参数键名" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="配置类别" prop="configCategory">
              <el-select v-model="queryParams.configCategory" clearable placeholder="请选择配置类别">
                <el-option v-for="dict in sys_config_category" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="系统内置" prop="configType">
              <el-select v-model="queryParams.configType" clearable placeholder="系统内置">
                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间" style="width: 308px">
              <el-date-picker
                v-model="dateRange"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                end-placeholder="结束日期"
                range-separator="-"
                start-placeholder="开始日期"
                type="daterange"
                value-format="YYYY-MM-DD HH:mm:ss"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:config:add']" icon="Plus" plain type="primary" @click="handleAdd">新增 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:config:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:config:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:config:export']" icon="Download" plain type="warning" @click="handleExport"> 导出 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:config:remove']" icon="Refresh" plain type="danger" @click="handleRefreshCache">刷新缓存 </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="configList" border @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="center" label="排序" prop="sortOrder" width="80" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="参数名称" min-width="120" prop="configName" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="参数键名" min-width="150" prop="configKey" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="参数键值" min-width="120" prop="configValue" />
        <el-table-column align="center" label="配置类别" prop="configCategory" width="100">
          <template #default="scope">
            <dict-tag :options="sys_config_category" :value="scope.row.configCategory" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="值类型" prop="valueType" width="90">
          <template #default="scope">
            <dict-tag :options="sys_config_value_type" :value="scope.row.valueType" size="small" />
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="配置描述" min-width="150" prop="configDescription" />
        <el-table-column align="center" label="系统内置" prop="configType" width="90">
          <template #default="scope">
            <dict-tag :options="sys_yes_no" :value="scope.row.configType" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" width="160">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="150">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['system:config:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['system:config:remove']" icon="Delete" link type="primary" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 添加或修改参数配置对话框 -->
    <el-drawer v-model="dialog.visible" :title="dialog.title" append-to-body size="500">
      <el-form ref="configFormRef" :model="form" :rules="rules" label-position="top" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="参数名称" prop="configName">
              <el-input v-model="form.configName" placeholder="请输入参数名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参数键名" prop="configKey">
              <el-input v-model="form.configKey" placeholder="请输入参数键名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="配置类别" prop="configCategory" required>
              <el-select v-model="form.configCategory" placeholder="请选择配置类别" style="width: 100%">
                <el-option v-for="dict in sys_config_category" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="值类型" prop="valueType" required>
              <el-select v-model="form.valueType" placeholder="请选择值类型" style="width: 100%">
                <el-option v-for="dict in sys_config_value_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="参数键值" prop="configValue">
              <el-input v-model="form.configValue" placeholder="请输入参数键值" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认值" prop="defaultValue" required>
              <el-input v-model="form.defaultValue" placeholder="请输入默认值" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :max="9999" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="配置描述" prop="configDescription">
          <el-input v-model="form.configDescription" :rows="2" placeholder="请输入配置描述" type="textarea" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" :rows="2" placeholder="请输入备注" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" name="Config" setup>
import { addConfig, delConfig, getConfig, listConfig, refreshCache, updateConfig } from '@/api/system/config';
import { ConfigForm, ConfigQuery, ConfigVO } from '@/api/system/config/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_yes_no, sys_config_category, sys_config_value_type } = toRefs<any>(
  proxy?.useDict('sys_yes_no', 'sys_config_category', 'sys_config_value_type')
);

const configList = ref<ConfigVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const configFormRef = ref<ElFormInstance>();
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const initFormData: ConfigForm = {
  configId: undefined,
  configName: '',
  configKey: '',
  configValue: '',
  configCategory: 'system',
  configDescription: '',
  defaultValue: '',
  valueType: 'string',
  sortOrder: 0,
  remark: ''
};
const data = reactive<PageData<ConfigForm, ConfigQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configName: '',
    configKey: '',
    configType: '',
    configCategory: ''
  },
  rules: {
    configName: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
    configKey: [{ required: true, message: '参数键名不能为空', trigger: 'blur' }],
    configValue: [{ required: true, message: '参数键值不能为空', trigger: 'blur' }],
    configCategory: [{ required: true, message: '配置类别不能为空', trigger: 'change' }],
    defaultValue: [{ required: true, message: '默认值不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询参数列表 */
const getList = async () => {
  loading.value = true;
  const res = await listConfig(proxy?.addDateRange(queryParams.value, dateRange.value));
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
  configFormRef.value?.resetFields();
};
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
const resetQuery = () => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};
/** 多选框选中数据 */
const handleSelectionChange = (selection: ConfigVO[]) => {
  ids.value = selection.map((item) => item.configId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};
/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加参数';
};
/** 修改按钮操作 */
const handleUpdate = async (row?: ConfigVO) => {
  reset();
  const configId = row?.configId || ids.value[0];
  const res = await getConfig(configId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改参数';
};
/** 提交按钮 */
const submitForm = () => {
  configFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.configId ? await updateConfig(form.value) : await addConfig(form.value);
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};
/** 删除按钮操作 */
const handleDelete = async (row?: ConfigVO) => {
  const configIds = row?.configId || ids.value;
  await proxy?.$modal.confirm('是否确认删除参数编号为"' + configIds + '"的数据项？');
  await delConfig(configIds);
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};
/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'system/config/export',
    {
      ...queryParams.value
    },
    `config_${new Date().getTime()}.xlsx`
  );
};
/** 刷新缓存按钮操作 */
const handleRefreshCache = async () => {
  await refreshCache();
  proxy?.$modal.msgSuccess('刷新缓存成功');
};

onMounted(() => {
  getList();
});
</script>

<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="会员ID" prop="memberId">
              <el-input v-model="queryParams.memberId" placeholder="请输入会员ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="变动值" prop="changeValue">
              <el-input v-model="queryParams.changeValue" placeholder="请输入变动值" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="变动前成长值" prop="growthBefore">
              <el-input v-model="queryParams.growthBefore" placeholder="请输入变动前成长值" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="变动后成长值" prop="growthAfter">
              <el-input v-model="queryParams.growthAfter" placeholder="请输入变动后成长值" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="业务单号" prop="businessNo">
              <el-input v-model="queryParams.businessNo" placeholder="请输入业务单号" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['member:growthLog:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['member:growthLog:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['member:growthLog:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['member:growthLog:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="growthLogList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键" align="center" prop="id" v-if="true" />
        <el-table-column label="会员ID" align="center" prop="memberId" />
        <el-table-column label="变动类型" align="center" prop="changeType" />
        <el-table-column label="变动值" align="center" prop="changeValue" />
        <el-table-column label="变动前成长值" align="center" prop="growthBefore" />
        <el-table-column label="变动后成长值" align="center" prop="growthAfter" />
        <el-table-column label="业务单号" align="center" prop="businessNo" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['member:growthLog:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['member:growthLog:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改会员成长值记录对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="growthLogFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会员ID" prop="memberId">
          <el-input v-model="form.memberId" placeholder="请输入会员ID" />
        </el-form-item>
        <el-form-item label="变动值" prop="changeValue">
          <el-input v-model="form.changeValue" placeholder="请输入变动值" />
        </el-form-item>
        <el-form-item label="变动前成长值" prop="growthBefore">
          <el-input v-model="form.growthBefore" placeholder="请输入变动前成长值" />
        </el-form-item>
        <el-form-item label="变动后成长值" prop="growthAfter">
          <el-input v-model="form.growthAfter" placeholder="请输入变动后成长值" />
        </el-form-item>
        <el-form-item label="业务单号" prop="businessNo">
          <el-input v-model="form.businessNo" placeholder="请输入业务单号" />
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

<script setup name="GrowthLog" lang="ts">
import { listGrowthLog, getGrowthLog, delGrowthLog, addGrowthLog, updateGrowthLog } from '@/api/member/growthLog';
import { GrowthLogVO, GrowthLogQuery, GrowthLogForm } from '@/api/member/growthLog/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const growthLogList = ref<GrowthLogVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const growthLogFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: GrowthLogForm = {
  id: undefined,
  memberId: undefined,
  changeType: undefined,
  changeValue: undefined,
  growthBefore: undefined,
  growthAfter: undefined,
  businessNo: undefined,
  remark: undefined,
}
const data = reactive<PageData<GrowthLogForm, GrowthLogQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    memberId: undefined,
    changeType: undefined,
    changeValue: undefined,
    growthBefore: undefined,
    growthAfter: undefined,
    businessNo: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
    memberId: [
      { required: true, message: "会员ID不能为空", trigger: "blur" }
    ],
    changeType: [
      { required: true, message: "变动类型不能为空", trigger: "change" }
    ],
    changeValue: [
      { required: true, message: "变动值不能为空", trigger: "blur" }
    ],
    growthBefore: [
      { required: true, message: "变动前成长值不能为空", trigger: "blur" }
    ],
    growthAfter: [
      { required: true, message: "变动后成长值不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询会员成长值记录列表 */
const getList = async () => {
  loading.value = true;
  const res = await listGrowthLog(queryParams.value);
  growthLogList.value = res.rows;
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
  growthLogFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: GrowthLogVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加会员成长值记录";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: GrowthLogVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getGrowthLog(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改会员成长值记录";
}

/** 提交按钮 */
const submitForm = () => {
  growthLogFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateGrowthLog(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addGrowthLog(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: GrowthLogVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除会员成长值记录编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delGrowthLog(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('member/growthLog/export', {
    ...queryParams.value
  }, `growthLog_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>

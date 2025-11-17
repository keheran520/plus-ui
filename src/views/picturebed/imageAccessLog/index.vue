<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="图片ID" prop="imageId">
              <el-input v-model="queryParams.imageId" placeholder="请输入图片ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="访问IP" prop="accessIp">
              <el-input v-model="queryParams.accessIp" placeholder="请输入访问IP" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="访问地点" prop="accessLocation">
              <el-input v-model="queryParams.accessLocation" placeholder="请输入访问地点" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户代理" prop="userAgent">
              <el-input v-model="queryParams.userAgent" placeholder="请输入用户代理" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['picturebed:imageAccessLog:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['picturebed:imageAccessLog:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['picturebed:imageAccessLog:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['picturebed:imageAccessLog:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="imageAccessLogList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="日志ID" align="center" prop="logId" v-if="true" />
        <el-table-column label="图片ID" align="center" prop="imageId" />
        <el-table-column label="访问类型(1查看 2下载)" align="center" prop="accessType" />
        <el-table-column label="访问IP" align="center" prop="accessIp" />
        <el-table-column label="访问地点" align="center" prop="accessLocation" />
        <el-table-column label="用户代理" align="center" prop="userAgent" />
        <el-table-column label="用户ID" align="center" prop="userId" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['picturebed:imageAccessLog:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['picturebed:imageAccessLog:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改图片访问日志对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="imageAccessLogFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="图片ID" prop="imageId">
          <el-input v-model="form.imageId" placeholder="请输入图片ID" />
        </el-form-item>
        <el-form-item label="访问IP" prop="accessIp">
          <el-input v-model="form.accessIp" placeholder="请输入访问IP" />
        </el-form-item>
        <el-form-item label="访问地点" prop="accessLocation">
          <el-input v-model="form.accessLocation" placeholder="请输入访问地点" />
        </el-form-item>
        <el-form-item label="用户代理" prop="userAgent">
            <el-input v-model="form.userAgent" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
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

<script setup name="ImageAccessLog" lang="ts">
import { listImageAccessLog, getImageAccessLog, delImageAccessLog, addImageAccessLog, updateImageAccessLog } from '@/api/picturebed/imageAccessLog';
import { ImageAccessLogVO, ImageAccessLogQuery, ImageAccessLogForm } from '@/api/picturebed/imageAccessLog/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const imageAccessLogList = ref<ImageAccessLogVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const imageAccessLogFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ImageAccessLogForm = {
  logId: undefined,
  imageId: undefined,
  accessType: undefined,
  accessIp: undefined,
  accessLocation: undefined,
  userAgent: undefined,
  userId: undefined,
}
const data = reactive<PageData<ImageAccessLogForm, ImageAccessLogQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    imageId: undefined,
    accessType: undefined,
    accessIp: undefined,
    accessLocation: undefined,
    userAgent: undefined,
    userId: undefined,
    params: {
    }
  },
  rules: {
    logId: [
      { required: true, message: "日志ID不能为空", trigger: "blur" }
    ],
    imageId: [
      { required: true, message: "图片ID不能为空", trigger: "blur" }
    ],
    accessType: [
      { required: true, message: "访问类型(1查看 2下载)不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询图片访问日志列表 */
const getList = async () => {
  loading.value = true;
  const res = await listImageAccessLog(queryParams.value);
  imageAccessLogList.value = res.rows;
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
  imageAccessLogFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ImageAccessLogVO[]) => {
  ids.value = selection.map(item => item.logId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加图片访问日志";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ImageAccessLogVO) => {
  reset();
  const _logId = row?.logId || ids.value[0]
  const res = await getImageAccessLog(_logId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改图片访问日志";
}

/** 提交按钮 */
const submitForm = () => {
  imageAccessLogFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.logId) {
        await updateImageAccessLog(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addImageAccessLog(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ImageAccessLogVO) => {
  const _logIds = row?.logId || ids.value;
  await proxy?.$modal.confirm('是否确认删除图片访问日志编号为"' + _logIds + '"的数据项？').finally(() => loading.value = false);
  await delImageAccessLog(_logIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('picturebed/imageAccessLog/export', {
    ...queryParams.value
  }, `imageAccessLog_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>

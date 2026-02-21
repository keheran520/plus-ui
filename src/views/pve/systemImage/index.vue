<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="镜像名称" prop="imageName">
              <el-input v-model="queryParams.imageName" placeholder="请输入镜像名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="操作系统版本" prop="osVersion">
              <el-input v-model="queryParams.osVersion" placeholder="请输入操作系统版本" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="架构(x86_64/aarch64)" prop="architecture">
              <el-input v-model="queryParams.architecture" placeholder="请输入架构(x86_64/aarch64)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="镜像大小(字节)" prop="imageSize">
              <el-input v-model="queryParams.imageSize" placeholder="请输入镜像大小(字节)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="文件ID(关联sys_file表)" prop="fileId">
              <el-input v-model="queryParams.fileId" placeholder="请输入文件ID(关联sys_file表)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input v-model="queryParams.description" placeholder="请输入描述" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="排序" prop="sort">
              <el-input v-model="queryParams.sort" placeholder="请输入排序" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['pve:systemImage:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['pve:systemImage:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['pve:systemImage:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['pve:systemImage:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="systemImageList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="镜像ID" align="center" prop="imageId" v-if="true" />
        <el-table-column label="镜像名称" align="center" prop="imageName" />
        <el-table-column label="镜像类型(iso/template)" align="center" prop="imageType" />
        <el-table-column label="操作系统类型(Linux/Windows)" align="center" prop="osType" />
        <el-table-column label="操作系统版本" align="center" prop="osVersion" />
        <el-table-column label="架构(x86_64/aarch64)" align="center" prop="architecture" />
        <el-table-column label="镜像大小(字节)" align="center" prop="imageSize" />
        <el-table-column label="文件ID(关联sys_file表)" align="center" prop="fileId" />
        <el-table-column label="镜像状态(0:正常 1:停用)" align="center" prop="status" />
        <el-table-column label="描述" align="center" prop="description" />
        <el-table-column label="排序" align="center" prop="sort" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['pve:systemImage:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['pve:systemImage:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改系统镜像库对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="systemImageFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="镜像名称" prop="imageName">
          <el-input v-model="form.imageName" placeholder="请输入镜像名称" />
        </el-form-item>
        <el-form-item label="操作系统版本" prop="osVersion">
          <el-input v-model="form.osVersion" placeholder="请输入操作系统版本" />
        </el-form-item>
        <el-form-item label="架构(x86_64/aarch64)" prop="architecture">
          <el-input v-model="form.architecture" placeholder="请输入架构(x86_64/aarch64)" />
        </el-form-item>
        <el-form-item label="镜像大小(字节)" prop="imageSize">
          <el-input v-model="form.imageSize" placeholder="请输入镜像大小(字节)" />
        </el-form-item>
        <el-form-item label="文件ID(关联sys_file表)" prop="fileId">
          <el-input v-model="form.fileId" placeholder="请输入文件ID(关联sys_file表)" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" />
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

<script setup name="SystemImage" lang="ts">
import { listSystemImage, getSystemImage, delSystemImage, addSystemImage, updateSystemImage } from '@/api/pve/systemImage';
import { SystemImageVO, SystemImageQuery, SystemImageForm } from '@/api/pve/systemImage/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const systemImageList = ref<SystemImageVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const systemImageFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: SystemImageForm = {
  imageId: undefined,
  imageName: undefined,
  imageType: undefined,
  osType: undefined,
  osVersion: undefined,
  architecture: undefined,
  imageSize: undefined,
  fileId: undefined,
  status: undefined,
  description: undefined,
  sort: undefined,
}
const data = reactive<PageData<SystemImageForm, SystemImageQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    imageName: undefined,
    imageType: undefined,
    osType: undefined,
    osVersion: undefined,
    architecture: undefined,
    imageSize: undefined,
    fileId: undefined,
    status: undefined,
    description: undefined,
    sort: undefined,
    params: {
    }
  },
  rules: {
    imageId: [
      { required: true, message: "镜像ID不能为空", trigger: "blur" }
    ],
    imageName: [
      { required: true, message: "镜像名称不能为空", trigger: "blur" }
    ],
    imageType: [
      { required: true, message: "镜像类型(iso/template)不能为空", trigger: "change" }
    ],
    osType: [
      { required: true, message: "操作系统类型(Linux/Windows)不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询系统镜像库列表 */
const getList = async () => {
  loading.value = true;
  const res = await listSystemImage(queryParams.value);
  systemImageList.value = res.rows;
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
  systemImageFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: SystemImageVO[]) => {
  ids.value = selection.map(item => item.imageId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加系统镜像库";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: SystemImageVO) => {
  reset();
  const _imageId = row?.imageId || ids.value[0]
  const res = await getSystemImage(_imageId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改系统镜像库";
}

/** 提交按钮 */
const submitForm = () => {
  systemImageFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.imageId) {
        await updateSystemImage(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addSystemImage(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: SystemImageVO) => {
  const _imageIds = row?.imageId || ids.value;
  await proxy?.$modal.confirm('是否确认删除系统镜像库编号为"' + _imageIds + '"的数据项？').finally(() => loading.value = false);
  await delSystemImage(_imageIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('pve/systemImage/export', {
    ...queryParams.value
  }, `systemImage_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>

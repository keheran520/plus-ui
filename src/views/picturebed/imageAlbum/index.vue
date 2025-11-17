<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="相册名称" prop="albumName">
              <el-input v-model="queryParams.albumName" placeholder="请输入相册名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="相册编码" prop="albumCode">
              <el-input v-model="queryParams.albumCode" placeholder="请输入相册编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="相册封面URL" prop="albumCover">
              <el-input v-model="queryParams.albumCover" placeholder="请输入相册封面URL" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="相册描述" prop="description">
              <el-input v-model="queryParams.description" placeholder="请输入相册描述" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="图片数量" prop="imageCount">
              <el-input v-model="queryParams.imageCount" placeholder="请输入图片数量" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="总大小(字节)" prop="totalSize">
              <el-input v-model="queryParams.totalSize" placeholder="请输入总大小(字节)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="是否公开(0否 1是)" prop="isPublic">
              <el-input v-model="queryParams.isPublic" placeholder="请输入是否公开(0否 1是)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="显示顺序" prop="sortOrder">
              <el-input v-model="queryParams.sortOrder" placeholder="请输入显示顺序" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['picturebed:imageAlbum:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['picturebed:imageAlbum:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['picturebed:imageAlbum:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['picturebed:imageAlbum:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="imageAlbumList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="相册ID" align="center" prop="albumId" v-if="true" />
        <el-table-column label="相册名称" align="center" prop="albumName" />
        <el-table-column label="相册编码" align="center" prop="albumCode" />
        <el-table-column label="相册封面URL" align="center" prop="albumCover" />
        <el-table-column label="相册描述" align="center" prop="description" />
        <el-table-column label="图片数量" align="center" prop="imageCount" />
        <el-table-column label="总大小(字节)" align="center" prop="totalSize" />
        <el-table-column label="是否公开(0否 1是)" align="center" prop="isPublic" />
        <el-table-column label="显示顺序" align="center" prop="sortOrder" />
        <el-table-column label="状态(0正常 1停用)" align="center" prop="status" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['picturebed:imageAlbum:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['picturebed:imageAlbum:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改图片相册对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="imageAlbumFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="相册名称" prop="albumName">
          <el-input v-model="form.albumName" placeholder="请输入相册名称" />
        </el-form-item>
        <el-form-item label="相册编码" prop="albumCode">
          <el-input v-model="form.albumCode" placeholder="请输入相册编码" />
        </el-form-item>
        <el-form-item label="相册封面URL" prop="albumCover">
            <el-input v-model="form.albumCover" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="相册描述" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="图片数量" prop="imageCount">
          <el-input v-model="form.imageCount" placeholder="请输入图片数量" />
        </el-form-item>
        <el-form-item label="总大小(字节)" prop="totalSize">
          <el-input v-model="form.totalSize" placeholder="请输入总大小(字节)" />
        </el-form-item>
        <el-form-item label="是否公开(0否 1是)" prop="isPublic">
          <el-input v-model="form.isPublic" placeholder="请输入是否公开(0否 1是)" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="sortOrder">
          <el-input v-model="form.sortOrder" placeholder="请输入显示顺序" />
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

<script setup name="ImageAlbum" lang="ts">
import { listImageAlbum, getImageAlbum, delImageAlbum, addImageAlbum, updateImageAlbum } from '@/api/picturebed/imageAlbum';
import { ImageAlbumVO, ImageAlbumQuery, ImageAlbumForm } from '@/api/picturebed/imageAlbum/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const imageAlbumList = ref<ImageAlbumVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const imageAlbumFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ImageAlbumForm = {
  albumId: undefined,
  albumName: undefined,
  albumCode: undefined,
  albumCover: undefined,
  description: undefined,
  imageCount: undefined,
  totalSize: undefined,
  isPublic: undefined,
  sortOrder: undefined,
  status: undefined,
  remark: undefined,
}
const data = reactive<PageData<ImageAlbumForm, ImageAlbumQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    albumName: undefined,
    albumCode: undefined,
    albumCover: undefined,
    description: undefined,
    imageCount: undefined,
    totalSize: undefined,
    isPublic: undefined,
    sortOrder: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    albumId: [
      { required: true, message: "相册ID不能为空", trigger: "blur" }
    ],
    albumName: [
      { required: true, message: "相册名称不能为空", trigger: "blur" }
    ],
    imageCount: [
      { required: true, message: "图片数量不能为空", trigger: "blur" }
    ],
    totalSize: [
      { required: true, message: "总大小(字节)不能为空", trigger: "blur" }
    ],
    isPublic: [
      { required: true, message: "是否公开(0否 1是)不能为空", trigger: "blur" }
    ],
    sortOrder: [
      { required: true, message: "显示顺序不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态(0正常 1停用)不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询图片相册列表 */
const getList = async () => {
  loading.value = true;
  const res = await listImageAlbum(queryParams.value);
  imageAlbumList.value = res.rows;
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
  imageAlbumFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ImageAlbumVO[]) => {
  ids.value = selection.map(item => item.albumId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加图片相册";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ImageAlbumVO) => {
  reset();
  const _albumId = row?.albumId || ids.value[0]
  const res = await getImageAlbum(_albumId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改图片相册";
}

/** 提交按钮 */
const submitForm = () => {
  imageAlbumFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.albumId) {
        await updateImageAlbum(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addImageAlbum(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ImageAlbumVO) => {
  const _albumIds = row?.albumId || ids.value;
  await proxy?.$modal.confirm('是否确认删除图片相册编号为"' + _albumIds + '"的数据项？').finally(() => loading.value = false);
  await delImageAlbum(_albumIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('picturebed/imageAlbum/export', {
    ...queryParams.value
  }, `imageAlbum_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>

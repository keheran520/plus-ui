<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :inline="true" :model="queryParams">
            <el-form-item label="相册名称" prop="albumName">
              <el-input v-model="queryParams.albumName" clearable placeholder="请输入相册名称" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="相册编码" prop="albumCode">
              <el-input v-model="queryParams.albumCode" clearable placeholder="请输入相册编码" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="相册封面URL" prop="albumCover">
              <el-input v-model="queryParams.albumCover" clearable placeholder="请输入相册封面URL" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="相册描述" prop="description">
              <el-input v-model="queryParams.description" clearable placeholder="请输入相册描述" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="图片数量" prop="imageCount">
              <el-input v-model="queryParams.imageCount" clearable placeholder="请输入图片数量" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="总大小(字节)" prop="totalSize">
              <el-input v-model="queryParams.totalSize" clearable placeholder="请输入总大小(字节)" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="是否公开(0否 1是)" prop="isPublic">
              <el-input v-model="queryParams.isPublic" clearable placeholder="请输入是否公开(0否 1是)" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="显示顺序" prop="sortOrder">
              <el-input v-model="queryParams.sortOrder" clearable placeholder="请输入显示顺序" @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['picturebed:imageAlbum:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['picturebed:imageAlbum:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['picturebed:imageAlbum:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['picturebed:imageAlbum:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="imageAlbumList" border @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column v-if="true" align="center" label="相册ID" prop="albumId" />
        <el-table-column align="center" label="相册名称" prop="albumName" />
        <el-table-column align="center" label="相册编码" prop="albumCode" />
        <el-table-column align="center" label="相册封面URL" prop="albumCover" />
        <el-table-column align="center" label="相册描述" prop="description" />
        <el-table-column align="center" label="图片数量" prop="imageCount" />
        <el-table-column align="center" label="总大小(字节)" prop="totalSize" />
        <el-table-column align="center" label="是否公开(0否 1是)" prop="isPublic" />
        <el-table-column align="center" label="显示顺序" prop="sortOrder" />
        <el-table-column align="center" label="状态(0正常 1停用)" prop="status" />
        <el-table-column align="center" label="备注" prop="remark" />
        <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['picturebed:imageAlbum:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['picturebed:imageAlbum:remove']" icon="Delete" link type="primary" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改图片相册对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" append-to-body width="500px">
      <el-form ref="imageAlbumFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="相册名称" prop="albumName">
          <el-input v-model="form.albumName" placeholder="请输入相册名称" />
        </el-form-item>
        <el-form-item label="相册编码" prop="albumCode">
          <el-input v-model="form.albumCode" placeholder="请输入相册编码" />
        </el-form-item>
        <el-form-item label="相册封面URL" prop="albumCover">
          <el-input v-model="form.albumCover" placeholder="请输入内容" type="textarea" />
        </el-form-item>
        <el-form-item label="相册描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入内容" type="textarea" />
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
          <el-input v-model="form.remark" placeholder="请输入内容" type="textarea" />
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

<script lang="ts" name="ImageAlbum" setup>
import { addImageAlbum, delImageAlbum, getImageAlbum, listImageAlbum, updateImageAlbum } from '@/api/picturebed/imageAlbum';
import { ImageAlbumForm, ImageAlbumQuery, ImageAlbumVO } from '@/api/picturebed/imageAlbum/types';

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
  remark: undefined
};
const data = reactive<PageData<ImageAlbumForm, ImageAlbumQuery>>({
  form: { ...initFormData },
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
    params: {}
  },
  rules: {
    albumId: [{ required: true, message: '相册ID不能为空', trigger: 'blur' }],
    albumName: [{ required: true, message: '相册名称不能为空', trigger: 'blur' }],
    imageCount: [{ required: true, message: '图片数量不能为空', trigger: 'blur' }],
    totalSize: [{ required: true, message: '总大小(字节)不能为空', trigger: 'blur' }],
    isPublic: [{ required: true, message: '是否公开(0否 1是)不能为空', trigger: 'blur' }],
    sortOrder: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态(0正常 1停用)不能为空', trigger: 'change' }]
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
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  imageAlbumFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ImageAlbumVO[]) => {
  ids.value = selection.map((item) => item.albumId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加图片相册';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ImageAlbumVO) => {
  reset();
  const _albumId = row?.albumId || ids.value[0];
  const res = await getImageAlbum(_albumId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改图片相册';
};

/** 提交按钮 */
const submitForm = () => {
  imageAlbumFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.albumId) {
        await updateImageAlbum(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addImageAlbum(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ImageAlbumVO) => {
  const _albumIds = row?.albumId || ids.value;
  await proxy?.$modal.confirm('是否确认删除图片相册编号为"' + _albumIds + '"的数据项？').finally(() => (loading.value = false));
  await delImageAlbum(_albumIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'picturebed/imageAlbum/export',
    {
      ...queryParams.value
    },
    `imageAlbum_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

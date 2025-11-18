<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :inline="true" :model="queryParams">
            <el-form-item label="OSSID" prop="ossId">
              <el-input v-model="queryParams.ossId" clearable placeholder="请输入OSSID" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="分类ID" prop="categoryId">
              <el-input v-model="queryParams.categoryId" clearable placeholder="请输入分类ID" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="相册ID" prop="albumId">
              <el-input v-model="queryParams.albumId" clearable placeholder="请输入相册ID" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="标签(逗号分隔ID)" prop="tags">
              <el-input v-model="queryParams.tags" clearable placeholder="请输入标签(逗号分隔ID)" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="图片描述" prop="description">
              <el-input v-model="queryParams.description" clearable placeholder="请输入图片描述" @keyup.enter="handleQuery" />
            </el-form-item>
            <!--            <el-form-item label="浏览次数" prop="viewCount">-->
            <!--              <el-input v-model="queryParams.viewCount" clearable placeholder="请输入浏览次数" @keyup.enter="handleQuery" />-->
            <!--            </el-form-item>-->
            <!--            <el-form-item label="下载次数" prop="downloadCount">-->
            <!--              <el-input v-model="queryParams.downloadCount" clearable placeholder="请输入下载次数" @keyup.enter="handleQuery" />-->
            <!--            </el-form-item>-->
            <el-form-item label="是否公开" prop="isPublic">
              <el-select v-model="queryParams.isPublic" clearable placeholder="请选择是否公开" @keyup.enter="handleQuery">
                <el-option v-for="album in sys_yes_no" :key="album.value" :label="album.label" :value="album.value" />
              </el-select>
            </el-form-item>
            <!--            <el-form-item label="排序号" prop="sortOrder">-->
            <!--              <el-input v-model="queryParams.sortOrder" clearable placeholder="请输入排序号" @keyup.enter="handleQuery" />-->
            <!--            </el-form-item>-->
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
            <el-button v-hasPermi="['picturebed:image:add']" icon="Plus" plain type="primary" @click="handleAdd">新增 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['picturebed:image:add']" icon="Upload" plain type="primary" @click="uploadVisible = true">批量上传 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['picturebed:image:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()"
              >修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['picturebed:image:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()"
              >删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['picturebed:image:export']" icon="Download" plain type="warning" @click="handleExport">导出 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="imageList" border @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column v-if="false" align="center" label="图片ID" prop="imageId" />
        <el-table-column align="center" label="图片" prop="url" width="120">
          <template #default="scope">
            <ImagePreview v-if="scope.row.url" :height="80" :preview-src-list="[scope.row.url]" :src="scope.row.url" :width="80" />
            <div
              v-else
              class="flex items-center justify-center bg-gray-100 border border-gray-300 rounded"
              style="width: 80px; height: 80px; margin: 0 auto"
            >
              <span class="text-gray-400 text-sm">无图片</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="图片名称" prop="imageName" min-width="150">
          <template #default="scope">
            <div class="text-sm font-medium truncate" :title="scope.row.imageName">
              {{ scope.row.imageName || scope.row.originalName || '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="文件信息" min-width="180">
          <template #default="scope">
            <div class="text-left">
              <div class="text-xs text-gray-500">
                <span v-if="scope.row.ossExt?.fileSize">
                  {{ formatFileSize(scope.row.ossExt.fileSize) }}
                </span>
                <span v-if="scope.row.ossExt?.width && scope.row.ossExt?.height" class="ml-2">
                  {{ scope.row.ossExt.width }}x{{ scope.row.ossExt.height }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="分类" prop="categoryName" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.categoryName" size="small" type="info">
              {{ scope.row.categoryName }}
            </el-tag>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="相册" prop="albumName" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.albumName" size="small" type="success">
              {{ scope.row.albumName }}
            </el-tag>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="标签" min-width="150">
          <template #default="scope">
            <div v-if="scope.row.tagList && scope.row.tagList.length > 0" class="flex flex-wrap gap-1 justify-center">
              <el-tag v-for="tag in scope.row.tagList" :key="tag.tagId" size="small" type="info">
                {{ tag.tagName }}
              </el-tag>
            </div>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="图片描述" prop="description" />
        <el-table-column align="center" label="浏览次数" prop="viewCount" width="100" />
        <el-table-column align="center" label="下载次数" prop="downloadCount" width="100" />
        <el-table-column align="center" label="点赞数" prop="likeCount" width="100">
          <template #default="scope">
            <el-tag type="danger" size="small">
              <i class="el-icon-star-on" style="margin-right: 4px"></i>
              {{ scope.row.likeCount || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="是否公开" prop="isPublic">
          <template #default="scope">
            <dict-tag :options="sys_yes_no" :value="scope.row.isPublic" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序号" prop="sortOrder" />
        <el-table-column align="center" label="备注" prop="remark" />
        <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['picturebed:image:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['picturebed:image:remove']" icon="Delete" link type="primary" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改图片信息对话框 -->
    <el-drawer v-model="dialog.visible" :title="dialog.title" append-to-body size="700">
      <el-form ref="imageFormRef" :model="form" :rules="rules" label-position="top" label-width="100px">
        <el-form-item label="图片" prop="ossId">
          <image-upload v-model="form.ossId" :limit="1" @upload-success="handleUploadSuccess" />
        </el-form-item>

        <el-form-item label="图片名称" prop="imageName">
          <el-input v-model="form.imageName" maxlength="100" placeholder="请输入图片名称" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId">
              <el-tree-select
                v-model="form.categoryId"
                :data="categoryOptions"
                :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
                check-strictly
                clearable
                placeholder="请选择分类"
                style="width: 100%"
                @change="handleCategoryChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="相册" prop="albumId">
              <el-select v-model="form.albumId" clearable placeholder="请选择相册" style="width: 100%">
                <el-option v-for="album in albumOptions" :key="album.albumId" :label="album.albumName" :value="album.albumId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="标签" prop="tags">
          <el-select v-model="selectedTags" filterable multiple placeholder="请选择标签" style="width: 100%" @change="handleTagChange">
            <el-option v-for="tag in tagOptions" :key="tag.tagId" :label="tag.tagName" :value="tag.tagId">
              <span style="float: left">{{ tag.tagName }}</span>
              <span
                v-if="tag.tagColor"
                :style="{ backgroundColor: tag.tagColor }"
                style="float: right; width: 16px; height: 16px; border-radius: 2px; margin-top: 4px"
              ></span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="图片描述" prop="description">
          <el-input v-model="form.description" :rows="3" maxlength="500" placeholder="请输入图片描述" show-word-limit type="textarea" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="排序号" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否公开" prop="isPublic">
              <el-radio-group v-model="form.isPublic">
                <el-radio v-for="dict in sys_yes_no" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }} </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" :rows="2" maxlength="200" placeholder="请输入备注" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 批量上传组件 -->
    <BatchUpload
      v-model="uploadVisible"
      title="批量上传图片"
      @success="handleUploadSuccess"
    />
  </div>
</template>

<script lang="ts" name="Image" setup>
import { addImage, delImage, getImage, listImage, updateImage } from '@/api/picturebed/image';
import { ImageForm, ImageQuery, ImageVO } from '@/api/picturebed/image/types';
import { listImageCategory } from '@/api/picturebed/imageCategory';
import { ImageCategoryVO } from '@/api/picturebed/imageCategory/types';
import { listImageAlbum } from '@/api/picturebed/imageAlbum';
import { ImageAlbumVO } from '@/api/picturebed/imageAlbum/types';
import { listImageTag, listImageTagByCategory } from '@/api/picturebed/imageTag';
import { ImageTagVO } from '@/api/picturebed/imageTag/types';
import ImagePreview from '@/components/ImagePreview/index.vue';
import BatchUpload from '@/components/ImageUpload/BatchUpload.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable, sys_yes_no } = toRefs<any>(proxy?.useDict('sys_normal_disable', 'sys_yes_no'));

const imageList = ref<ImageVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const uploadVisible = ref(false);

// 下拉选项
const categoryOptions = ref<ImageCategoryVO[]>([]);
const albumOptions = ref<ImageAlbumVO[]>([]);
const tagOptions = ref<ImageTagVO[]>([]);
const selectedTags = ref<Array<string | number>>([]);

const queryFormRef = ref<ElFormInstance>();
const imageFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ImageForm = {
  imageId: undefined,
  ossId: undefined,
  categoryId: undefined,
  albumId: undefined,
  imageName: undefined,
  tags: undefined,
  description: undefined,
  viewCount: 0,
  downloadCount: 0,
  likeCount: 0,
  isPublic: 'Y',
  status: '0',
  sortOrder: 0,
  remark: undefined
};
const data = reactive<PageData<ImageForm, ImageQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ossId: undefined,
    categoryId: undefined,
    albumId: undefined,
    tags: undefined,
    description: undefined,
    viewCount: undefined,
    downloadCount: undefined,
    isPublic: undefined,
    status: undefined,
    sortOrder: undefined,
    params: {}
  },
  rules: {
    ossId: [{ required: true, message: '请上传图片', trigger: 'change' }],
    categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
    isPublic: [{ required: true, message: '请选择是否公开', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询图片信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listImage(queryParams.value);
  imageList.value = res.rows;
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
  selectedTags.value = [];
  imageFormRef.value?.resetFields();
};

/** 获取分类列表 */
const getCategoryList = async () => {
  const res = await listImageCategory();
  categoryOptions.value = proxy?.handleTree<ImageCategoryVO>(res.data, 'categoryId', 'parentId') || [];
};

/** 获取相册列表 */
const getAlbumList = async () => {
  const res = await listImageAlbum({ status: '0' });
  albumOptions.value = res.rows || [];
};

/** 获取标签列表 */
const getTagList = async () => {
  const res = await listImageTag({ status: '0' });
  tagOptions.value = res.rows || [];
};

/** 标签选择变化 */
const handleTagChange = (value: Array<string | number>) => {
  form.value.tags = value.join(',');
};

/** 图片上传成功回调 */
const handleUploadSuccess = (response: any) => {
  // 单张上传（image-upload组件）
  if (response && response.ossId) {
    form.value.ossId = response.ossId;
  }
  // 批量上传（BatchUpload组件）
  else if (Array.isArray(response)) {
    proxy?.$modal.msgSuccess(`成功上传 ${response.length} 张图片`);
    getList();
  }
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
const handleSelectionChange = (selection: ImageVO[]) => {
  ids.value = selection.map((item) => item.imageId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 分类变化处理 */
const handleCategoryChange = async (categoryId: number | null) => {
  // 清空已选标签
  selectedTags.value = [];
  form.value.tags = undefined;
  
  if (categoryId) {
    // 根据分类ID加载对应的标签
    try {
      const res = await listImageTagByCategory(categoryId);
      tagOptions.value = res.data || [];
    } catch (error) {
      console.error('加载分类标签失败:', error);
      tagOptions.value = [];
    }
  } else {
    // 如果没有选择分类，加载所有标签
    await getTagList();
  }
};

/** 新增按钮操作 */
const handleAdd = async () => {
  reset();
  await getCategoryList();
  await getAlbumList();
  await getTagList();
  dialog.visible = true;
  dialog.title = '添加图片信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ImageVO) => {
  reset();
  await getCategoryList();
  await getAlbumList();
  await getTagList();
  const _imageId = row?.imageId || ids.value[0];
  const res = await getImage(_imageId);
  Object.assign(form.value, res.data);
  // 处理标签回显
  if (res.data.tags) {
    selectedTags.value = res.data.tags.split(',').map((id) => Number(id));
  }
  dialog.visible = true;
  dialog.title = '修改图片信息';
};

/** 提交按钮 */
const submitForm = () => {
  imageFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.imageId) {
        await updateImage(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addImage(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ImageVO) => {
  const _imageIds = row?.imageId || ids.value;
  await proxy?.$modal.confirm('是否确认删除图片信息编号为"' + _imageIds + '"的数据项？').finally(() => (loading.value = false));
  await delImage(_imageIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'picturebed/image/export',
    {
      ...queryParams.value
    },
    `image_${new Date().getTime()}.xlsx`
  );
};

/** 格式化文件大小 */
const formatFileSize = (bytes: number) => {
  if (!bytes) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

onMounted(() => {
  getList();
  getCategoryList();
  getAlbumList();
  getTagList();
});
</script>

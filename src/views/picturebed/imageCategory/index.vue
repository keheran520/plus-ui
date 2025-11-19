<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :inline="true" :model="queryParams">
            <el-form-item label="分类ID" prop="categoryId">
              <el-input v-model="queryParams.categoryId" clearable placeholder="请输入分类ID" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="分类名称" prop="categoryName">
              <el-input v-model="queryParams.categoryName" clearable placeholder="请输入分类名称" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="分类编码" prop="categoryCode">
              <el-input v-model="queryParams.categoryCode" clearable placeholder="请输入分类编码" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" clearable placeholder="请选择状态">
                <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
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
            <el-button v-hasPermi="['picturebed:imageCategory:add']" icon="Plus" plain type="primary" @click="handleAdd()">新增 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button icon="Sort" plain type="info" @click="handleToggleExpandAll">展开/折叠</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>
      <el-table
        ref="imageCategoryTableRef"
        v-loading="loading"
        :data="imageCategoryList"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
        row-key="categoryCode"
      >
        <el-table-column align="center" label="分类名称" prop="categoryName">
          <template #default="{ row }">
            {{ row.categoryName }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="分类编码" prop="categoryCode" />
        <el-table-column align="center" label="分类图标" prop="categoryIcon">
          <template #default="scope">
            <svg-icon :icon-class="scope.row.categoryIcon" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="分类封面" prop="categoryCover">
          <template #default="scope">
            <ImagePreview
              v-if="scope.row.categoryCover"
              :height="100"
              :preview-src-list="[scope.row.categoryCover]"
              :src="scope.row.categoryCover"
              :width="100"
            />
            <div
              v-else
              class="flex items-center justify-center bg-gray-100 border border-gray-300 rounded"
              style="width: 100px; height: 100px; margin: 0 auto"
            >
              <span class="text-gray-400 text-sm">无图片</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="图片数量" prop="imageCount" />
        <el-table-column align="center" label="关联标签" prop="tagNames" width="200">
          <template #default="scope">
            <div v-if="scope.row.tagList && scope.row.tagList.length > 0" class="flex flex-wrap gap-1">
              <el-tag v-for="tag in scope.row.tagList" :key="tag.tagId" size="small" type="info">
                {{ tag.tagName }}
              </el-tag>
            </div>
            <span v-else class="text-gray-400">未关联</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="显示顺序" prop="sortOrder" />
        <el-table-column align="center" label="状态" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime">
          <template #default="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="备注" prop="remark" />
        <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['picturebed:imageCategory:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="新增" placement="top">
              <el-button v-hasPermi="['picturebed:imageCategory:add']" icon="Plus" link type="primary" @click="handleAdd(scope.row)" />
            </el-tooltip>
            <!-- 如果有子级，显示下拉菜单 -->
            <el-dropdown
              v-if="hasChildren(scope.row)"
              v-hasPermi="['picturebed:imageCategory:remove']"
              @command="(command: string) => handleDeleteCommand(command, scope.row)"
            >
              <el-button icon="Delete" link type="danger">
                删除
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="single">删除当前分类</el-dropdown-item>
                  <el-dropdown-item command="cascade">级联删除(包括子分类)</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <!-- 如果没有子级，直接显示删除按钮 -->
            <el-tooltip v-else content="删除" placement="top">
              <el-button v-hasPermi="['picturebed:imageCategory:remove']" icon="Delete" link type="danger" @click="handleDeleteSingle(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加或修改图片分类对话框 -->
    <el-drawer v-model="dialog.visible" :title="dialog.title" append-to-body size="600">
      <el-form ref="imageCategoryFormRef" :model="form" :rules="rules" label-position="top" label-width="80px">
        <el-form-item label="父分类" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="imageCategoryOptions"
            :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
            check-strictly
            placeholder="请选择父分类"
            value-key="categoryCode"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类编码" prop="categoryCode">
          <el-input v-model="form.categoryCode" placeholder="请输入分类编码" />
        </el-form-item>
        <el-form-item label="分类图标" prop="categoryIcon">
          <el-input v-model="form.categoryIcon" placeholder="请输入分类图标" />
        </el-form-item>
        <el-form-item label="分类封面" prop="ossId">
          <image-upload v-model="form.ossId" :limit="1" @upload-success="handleUploadSuccess" />
        </el-form-item>
        <el-form-item label="关联标签" prop="tagIds">
          <el-select v-model="selectedTags" filterable multiple placeholder="请选择关联标签" style="width: 100%" @change="handleTagChange">
            <el-option v-for="tag in tagOptions" :key="tag.tagId" :label="tag.tagName" :value="tag.tagId">
              <span style="float: left">{{ tag.tagName }}</span>
              <span
                v-if="tag.tagColor"
                :style="{ backgroundColor: tag.tagColor }"
                style="float: right; width: 16px; height: 16px; border-radius: 2px; margin-top: 4px"
              ></span>
            </el-option>
          </el-select>
          <div class="text-xs text-gray-500 mt-1">选择后，该分类下的图片只能使用这些标签</div>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="图片数量" prop="imageCount">
              <el-input-number v-model="form.imageCount" controls-position="right" placeholder="请输入图片数量" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" controls-position="right" placeholder="请输入显示顺序" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }} </el-radio>
          </el-radio-group>
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
    </el-drawer>
  </div>
</template>

<script lang="ts" name="ImageCategory" setup>
import {
  addImageCategory,
  delImageCategory,
  delImageCategoryCascade,
  getImageCategory,
  listImageCategory,
  updateImageCategory
} from '@/api/picturebed/imageCategory';
import { ImageCategoryForm, ImageCategoryQuery, ImageCategoryVO } from '@/api/picturebed/imageCategory/types';
import { listImageTag } from '@/api/picturebed/imageTag';
import { ImageTagVO } from '@/api/picturebed/imageTag/types';
import ImagePreview from '@/components/ImagePreview/index.vue';

type ImageCategoryOption = {
  categoryId: number;
  categoryName: string;
  children?: ImageCategoryOption[];
};

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const imageCategoryList = ref<ImageCategoryVO[]>([]);
const imageCategoryOptions = ref<ImageCategoryOption[]>([]);
const tagOptions = ref<ImageTagVO[]>([]);
const selectedTags = ref<Array<string | number>>([]);
const buttonLoading = ref(false);
const showSearch = ref(true);
const isExpandAll = ref(true);
const loading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const imageCategoryFormRef = ref<ElFormInstance>();
const imageCategoryTableRef = ref<ElTableInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ImageCategoryForm = {
  categoryId: undefined,
  parentId: 0,
  categoryName: undefined,
  categoryCode: undefined,
  categoryIcon: undefined,
  ossId: undefined,
  categoryCover: undefined,
  imageCount: 0,
  sortOrder: 0,
  status: '0',
  tagIds: undefined,
  remark: undefined
};

const data = reactive<PageData<ImageCategoryForm, ImageCategoryQuery>>({
  form: { ...initFormData },
  queryParams: {
    categoryId: undefined,
    parentId: undefined,
    categoryName: undefined,
    categoryCode: undefined,
    categoryCover: undefined,
    imageCount: undefined,
    sortOrder: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    categoryId: [{ required: true, message: '分类不能为空', trigger: 'blur' }],
    parentId: [{ required: true, message: '父分类不能为空', trigger: 'blur' }],
    categoryName: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
    imageCount: [{ required: true, message: '图片数量不能为空', trigger: 'blur' }],
    sortOrder: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询图片分类列表 */
const getList = async () => {
  loading.value = true;
  const res = await listImageCategory(queryParams.value);
  const data = proxy?.handleTree<ImageCategoryVO>(res.data, 'categoryId', 'parentId');
  if (data) {
    imageCategoryList.value = data;
    loading.value = false;
  }
};

/** 查询图片分类下拉树结构 */
const getTreeselect = async () => {
  const res = await listImageCategory();
  imageCategoryOptions.value = [];
  const data: ImageCategoryOption = { categoryId: 0, categoryName: '顶级节点', children: [] };
  data.children = proxy?.handleTree<ImageCategoryOption>(res.data, 'categoryId', 'parentId');
  imageCategoryOptions.value.push(data);
};

/** 获取标签列表 */
const getTagList = async () => {
  try {
    const res = await listImageTag({});
    tagOptions.value = res.rows || [];
  } catch (error) {
    console.error('获取标签列表失败:', error);
  }
};

/** 处理标签变化 */
const handleTagChange = (value: Array<string | number>) => {
  // 将选中的标签ID转换为逗号分隔的字符串
  form.value.tagIds = value.length > 0 ? value.join(',') : undefined;
};

// 取消按钮
const cancel = () => {
  reset();
  dialog.visible = false;
};

// 表单重置
const reset = () => {
  form.value = { ...initFormData };
  selectedTags.value = [];
  imageCategoryFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 新增按钮操作 */
const handleAdd = async (row?: ImageCategoryVO) => {
  reset();
  await getTreeselect();
  await getTagList();
  if (row != null && row.categoryId) {
    form.value.parentId = row.categoryId;
  } else {
    form.value.parentId = 0;
  }
  dialog.visible = true;
  dialog.title = '添加图片分类';
};

/** 展开/折叠操作 */
const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(imageCategoryList.value, isExpandAll.value);
};

/** 展开/折叠操作 */
const toggleExpandAll = (data: ImageCategoryVO[], status: boolean) => {
  data.forEach((item) => {
    imageCategoryTableRef.value?.toggleRowExpansion(item, status);
    if (item.children && item.children.length > 0) toggleExpandAll(item.children, status);
  });
};

/** 修改按钮操作 */
const handleUpdate = async (row: ImageCategoryVO) => {
  reset();
  await getTreeselect();
  await getTagList();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  const res = await getImageCategory(row.categoryId);
  Object.assign(form.value, res.data);
  // 处理标签回显
  if (res.data.tagIds) {
    selectedTags.value = res.data.tagIds.split(',').map((id: string) => Number(id));
  }
  dialog.visible = true;
  dialog.title = '修改图片分类';
};

/** 提交按钮 */
const submitForm = () => {
  imageCategoryFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.categoryId) {
        await updateImageCategory(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addImageCategory(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      getList();
    }
  });
};

/** 判断是否有子级 */
const hasChildren = (row: ImageCategoryVO): boolean => {
  return row.children && row.children.length > 0;
};

/** 删除命令处理 */
const handleDeleteCommand = (command: string, row: ImageCategoryVO) => {
  if (command === 'single') {
    handleDeleteSingle(row);
  } else if (command === 'cascade') {
    handleDeleteCascade(row);
  }
};

/** 删除当前分类（单个删除） */
const handleDeleteSingle = async (row: ImageCategoryVO) => {
  await proxy?.$modal.confirm('是否确认删除分类"' + row.categoryName + '"？');
  loading.value = true;
  await delImageCategory(row.categoryId).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

/** 级联删除（包括所有子分类） */
const handleDeleteCascade = async (row: ImageCategoryVO) => {
  await proxy?.$modal.confirm('确认要级联删除分类"' + row.categoryName + '"及其所有子分类吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  });
  loading.value = true;
  await delImageCategoryCascade(row.categoryId).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('级联删除成功');
};

/** 图片上传成功回调 */
const handleUploadSuccess = (response: any) => {
  // 假设上传成功后返回的数据结构为 { url: 'xxx', ossId: 'xxx' }
  if (response && response.url) {
    form.value.categoryCover = response.url;
  }
};

onMounted(() => {
  getList();
});
</script>

<template>
  <div class="mall-page">
    <el-card class="panel" shadow="never">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>商品分类</h3>
            <p>保持通用商城结构，分类支持层级，图片统一走现有图床组件。</p>
          </div>
        </div>
      </template>

      <el-form ref="queryRef" :inline="true" :model="queryParams">
        <el-form-item label="分类名称">
          <el-input v-model="queryParams.name" clearable placeholder="请输入分类名称" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="分类级别">
          <el-select v-model="queryParams.level" clearable placeholder="请选择分类级别" style="width: 180px">
            <el-option v-for="dict in mall_category_level" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" clearable placeholder="请选择状态" style="width: 160px">
            <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="panel" shadow="never">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>分类列表</h3>
            <p>按照原商城分类逻辑，支持一级分类和二级分类。</p>
          </div>
          <div class="toolbar">
            <el-button v-hasPermi="['mall:category:add']" type="primary" icon="Plus" @click="handleAdd">新增分类</el-button>
            <el-button v-hasPermi="['mall:category:remove']" :disabled="multiple" icon="Delete" @click="handleDelete()">批量删除</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="categoryList" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column label="分类名称" prop="name" min-width="160" />
        <el-table-column label="级别" width="120">
          <template #default="{ row }">
            <dict-tag :options="mall_category_level" :value="row.level" />
          </template>
        </el-table-column>
        <el-table-column label="父分类" min-width="160">
          <template #default="{ row }">{{ getParentName(row.parentId) }}</template>
        </el-table-column>
        <el-table-column label="图标" width="90">
          <template #default="{ row }">
            <ImagePreview v-if="row.iconUrl" :src="row.iconUrl" :width="40" :height="40" :preview-src-list="[row.iconUrl]" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="分类图" width="90">
          <template #default="{ row }">
            <ImagePreview v-if="row.picUrl" :src="row.picUrl" :width="40" :height="40" :preview-src-list="[row.picUrl]" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="关键字" prop="keywords" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <dict-tag :options="sys_normal_disable" :value="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sortOrder" width="90" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-hasPermi="['mall:category:edit']" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button v-hasPermi="['mall:category:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-drawer v-model="open" :title="title" size="680px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="92px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类级别" prop="level">
          <el-radio-group v-model="form.level">
            <el-radio v-for="dict in mall_category_level" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.level === 'L2'" label="父分类" prop="parentId">
          <el-select v-model="form.parentId" clearable placeholder="请选择父分类" style="width: 100%">
            <el-option v-for="item in parentOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="form.keywords" placeholder="多个关键字可用逗号分隔" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="图标">
          <image-upload v-model="form.iconOssId" :limit="1" @upload-success="(res) => handleUploadSuccess('icon', res)" />
        </el-form-item>
        <el-form-item label="分类图">
          <image-upload v-model="form.picOssId" :limit="1" @upload-success="(res) => handleUploadSuccess('pic', res)" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="open = false">取消</el-button>
          <el-button type="primary" :loading="buttonLoading" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { addMallCategory, delMallCategory, getMallCategory, listMallCategory, updateMallCategory } from '@/api/mall/category';
import type { MallCategoryForm, MallCategoryQuery, MallCategoryVO } from '@/api/mall/category/types';
import { ComponentInternalInstance } from 'vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable, mall_category_level } = toRefs<any>(proxy?.useDict('sys_normal_disable', 'mall_category_level'));

const queryRef = ref();
const formRef = ref();
const loading = ref(false);
const buttonLoading = ref(false);
const open = ref(false);
const title = ref('');
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const categoryList = ref<MallCategoryVO[]>([]);

const queryParams = ref<MallCategoryQuery>({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  level: undefined,
  status: undefined
});

const initFormData = (): MallCategoryForm => ({
  id: undefined,
  name: '',
  keywords: '',
  description: '',
  parentId: 0,
  level: 'L1',
  iconOssId: undefined,
  iconUrl: '',
  picOssId: undefined,
  picUrl: '',
  status: '0',
  sortOrder: 0,
  remark: ''
});

const form = ref<MallCategoryForm>(initFormData());
const parentOptions = computed(() => categoryList.value.filter((item) => item.level === 'L1'));

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择分类级别', trigger: 'change' }],
  parentId: [{
    validator: (_rule: any, value: string | number, callback: (error?: Error) => void) => {
      if (form.value.level === 'L2' && (!value || String(value) === '0')) {
        callback(new Error('二级分类必须选择父分类'));
        return;
      }
      callback();
    },
    trigger: 'change'
  }]
};

function getParentName(parentId?: string | number) {
  if (!parentId || String(parentId) === '0') {
    return '顶级分类';
  }
  return categoryList.value.find((item) => String(item.id) === String(parentId))?.name || '-';
}

function reset() {
  form.value = initFormData();
  formRef.value?.resetFields?.();
}

async function getList() {
  loading.value = true;
  try {
    const res = await listMallCategory(queryParams.value);
    categoryList.value = res.rows || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    level: undefined,
    status: undefined
  };
  queryRef.value?.resetFields?.();
  getList();
}

function handleSelectionChange(selection: MallCategoryVO[]) {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
}

function handleUploadSuccess(type: 'icon' | 'pic', response: any) {
  if (!response?.ossId) {
    return;
  }
  if (type === 'icon') {
    form.value.iconOssId = response.ossId;
    form.value.iconUrl = response.url;
    return;
  }
  form.value.picOssId = response.ossId;
  form.value.picUrl = response.url;
}

function handleAdd() {
  reset();
  title.value = '新增商品分类';
  open.value = true;
}

async function handleEdit(row: MallCategoryVO) {
  reset();
  const res = await getMallCategory(row.id);
  form.value = { ...initFormData(), ...res.data };
  title.value = '编辑商品分类';
  open.value = true;
}

function submitForm() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    if (form.value.level === 'L1') {
      form.value.parentId = 0;
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateMallCategory(form.value);
      } else {
        await addMallCategory(form.value);
      }
      proxy?.$modal.msgSuccess('保存成功');
      open.value = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
}

function handleDelete(row?: MallCategoryVO) {
  const targetIds = row?.id || ids.value;
  if (!targetIds || (Array.isArray(targetIds) && targetIds.length === 0)) {
    proxy?.$modal.msgWarning('请先选择要删除的数据');
    return;
  }
  proxy?.$modal.confirm('确认删除选中的分类吗？').then(() => delMallCategory(targetIds)).then(() => {
    proxy?.$modal.msgSuccess('删除成功');
    getList();
  }).catch(() => undefined);
}

onMounted(() => {
  getList();
});
</script>

<style scoped>
.mall-page { min-height: 100%; padding: 16px; background: #f6f8fc; }
.panel { margin-bottom: 16px; border: none; border-radius: 20px; }
.panel-header { display: flex; justify-content: space-between; gap: 16px; }
.panel-header h3, .panel-header p { margin: 0; }
.panel-header p { margin-top: 6px; color: #7f8da1; }
.toolbar, .drawer-footer { display: flex; gap: 10px; }
.drawer-footer { justify-content: flex-end; }
</style>

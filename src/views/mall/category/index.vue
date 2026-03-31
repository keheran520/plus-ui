<template>
  <div class="mall-category-page">
    <section v-loading="summaryLoading" class="summary-grid">
      <article class="summary-card summary-card--blue">
        <span class="summary-card__label">分类总数</span>
        <strong class="summary-card__value">{{ formatCount(summary.total) }}</strong>
        <span class="summary-card__hint">当前分类树中全部节点数量</span>
      </article>
      <article class="summary-card summary-card--green">
        <span class="summary-card__label">启用分类</span>
        <strong class="summary-card__value">{{ formatCount(summary.enabled) }}</strong>
        <span class="summary-card__hint">状态为正常的分类节点</span>
      </article>
      <article class="summary-card summary-card--amber">
        <span class="summary-card__label">一级分类</span>
        <strong class="summary-card__value">{{ formatCount(summary.levelOne) }}</strong>
        <span class="summary-card__hint">父级为顶级节点的分类</span>
      </article>
      <article class="summary-card summary-card--violet">
        <span class="summary-card__label">二级分类</span>
        <strong class="summary-card__value">{{ formatCount(summary.levelTwo) }}</strong>
        <span class="summary-card__hint">挂在一级分类下的子分类</span>
      </article>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="queryParams.name" class="field-md" clearable placeholder="请输入分类名称" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" class="field-sm" clearable placeholder="全部状态">
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="filter-actions">
            <el-button icon="Search" type="primary" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </section>
    </transition>

    <section class="list-panel">
      <header class="panel-toolbar">
        <div class="toolbar-title">
          <span class="title-text">商品分类</span>
          <span class="title-meta">{{ formatCount(summary.total) }} 条分类记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['mall:category:add']" icon="Plus" type="primary" @click="handleAdd()">新增分类</el-button>
          <el-button icon="Sort" plain type="info" @click="handleToggleExpandAll">{{ isExpandAll ? '折叠全部' : '展开全部' }}</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <div class="table-summary">
        <span>顶级节点 {{ formatCount(summary.levelOne) }}</span>
        <span>子级节点 {{ formatCount(summary.levelTwo) }}</span>
        <span>停用节点 {{ formatCount(summary.disabled) }}</span>
      </div>

      <el-table
        ref="categoryTableRef"
        v-loading="loading"
        :data="categoryList"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        class="category-table"
        row-key="id"
      >
        <el-table-column label="分类名称" min-width="120" prop="name" />
        <el-table-column label="分类信息" min-width="360">
          <template #default="{ row }">
            <div class="category-cell">
              <div class="category-cover-box">
                <el-image v-if="row.picUrl" :src="row.picUrl" class="category-cover" fit="cover" preview-teleported />
                <div v-else class="category-cover__placeholder">分类图</div>
              </div>
              <div class="category-meta">
                <div class="category-name-row">
                  <span class="category-name">{{ row.name || '未命名分类' }}</span>
                  <el-tag :type="row.status === '0' ? 'success' : 'danger'" effect="light" round>
                    {{ getStatusLabel(row.status) }}
                  </el-tag>
                </div>
                <div class="category-sub">分类ID {{ row.id || '-' }}</div>
                <div class="category-sub">父级ID {{ row.parentId || 0 }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="层级" width="120">
          <template #default="{ row }">
            <el-tag effect="plain" round>{{ Number(row.parentId || 0) === 0 ? '一级分类' : '二级分类' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" prop="sortOrder" width="100" />
        <el-table-column label="备注" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="190">
          <template #default="{ row }">
            <el-button v-hasPermi="['mall:category:edit']" link type="primary" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['mall:category:add']" link type="primary" @click="handleAdd(row)">新增下级</el-button>
            <el-button v-hasPermi="['mall:category:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-drawer v-model="drawer.visible" :close-on-click-modal="false" :title="drawer.title" size="680px">
      <el-form ref="categoryFormRef" :model="form" :rules="rules" class="drawer-form" label-position="top">
        <div class="form-grid">
          <el-form-item label="父级分类" prop="parentId">
            <el-tree-select
              v-model="form.parentId"
              :data="categoryOptions"
              :props="{ value: 'id', label: 'name', children: 'children' }"
              check-strictly
              placeholder="请选择父级分类"
              value-key="id"
            />
          </el-form-item>
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="form.name" maxlength="50" placeholder="请输入分类名称" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="form.sortOrder" :min="0" :precision="0" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <el-form-item label="分类图片">
          <image-upload v-model="form.picOssId" :limit="1" @upload-success="handleUploadSuccess" />
          <div v-if="form.picUrl" class="image-preview">
            <el-image :src="form.picUrl" class="preview-image" fit="cover" preview-teleported />
          </div>
        </el-form-item>

        <el-form-item label="分类备注">
          <el-input v-model="form.remark" :rows="4" maxlength="300" placeholder="请输入分类备注" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">保存分类</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" name="Category" setup>
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import { addCategory, delCategory, getCategory, listCategory, updateCategory } from '@/api/mall/category';
import type { CategoryForm, CategoryQuery, CategoryVO } from '@/api/mall/category/types';
import ImageUpload from '@/components/ImageUpload/index.vue';

type CategoryOption = {
  id: string | number;
  name: string;
  children?: CategoryOption[];
};

interface SummaryState {
  total: number;
  enabled: number;
  disabled: number;
  levelOne: number;
  levelTwo: number;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const categoryList = ref<CategoryVO[]>([]);
const categoryOptions = ref<CategoryOption[]>([]);
const loading = ref(false);
const summaryLoading = ref(false);
const buttonLoading = ref(false);
const showSearch = ref(true);
const isExpandAll = ref(true);

const queryFormRef = ref<ElFormInstance>();
const categoryFormRef = ref<ElFormInstance>();
const categoryTableRef = ref<ElTableInstance>();

const drawer = reactive({
  visible: false,
  title: ''
});

const initFormData: CategoryForm = {
  id: undefined,
  parentId: 0,
  name: undefined,
  ancestors: undefined,
  picOssId: undefined,
  picUrl: undefined,
  sortOrder: 0,
  status: '0',
  remark: undefined
};

const data = reactive<PageData<CategoryForm, CategoryQuery>>({
  form: { ...initFormData },
  queryParams: {
    name: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const summary = ref<SummaryState>({
  total: 0,
  enabled: 0,
  disabled: 0,
  levelOne: 0,
  levelTwo: 0
});

const flatList = computed(() => {
  const result: CategoryVO[] = [];
  const travel = (list: CategoryVO[]) => {
    list.forEach((item) => {
      result.push(item);
      if (item.children?.length) {
        travel(item.children);
      }
    });
  };
  travel(categoryList.value);
  return result;
});

const buildSummary = () => {
  const list = flatList.value;
  summary.value = {
    total: list.length,
    enabled: list.filter((item) => item.status === '0').length,
    disabled: list.filter((item) => item.status === '1').length,
    levelOne: list.filter((item) => Number(item.parentId || 0) === 0).length,
    levelTwo: list.filter((item) => Number(item.parentId || 0) !== 0).length
  };
};

const getList = async () => {
  loading.value = true;
  summaryLoading.value = true;
  try {
    const res = await listCategory(queryParams.value);
    categoryList.value = proxy?.handleTree<CategoryVO>(res.data, 'id', 'parentId') || [];
    buildSummary();
  } finally {
    loading.value = false;
    summaryLoading.value = false;
  }
};

const getTreeselect = async () => {
  const res = await listCategory();
  const root: CategoryOption = { id: 0, name: '顶级分类', children: [] };
  root.children = proxy?.handleTree<CategoryOption>(res.data, 'id', 'parentId') || [];
  categoryOptions.value = [root];
};

const reset = () => {
  Object.assign(form.value, initFormData);
  categoryFormRef.value?.clearValidate();
};

const cancel = () => {
  drawer.visible = false;
  reset();
};

const handleQuery = () => {
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleAdd = async (row?: CategoryVO) => {
  reset();
  await getTreeselect();
  form.value.parentId = row?.id || 0;
  drawer.visible = true;
  drawer.title = row?.id ? `新增 ${row.name} 的下级分类` : '新增分类';
};

const handleUpdate = async (row: CategoryVO) => {
  reset();
  await getTreeselect();
  const res = await getCategory(row.id);
  Object.assign(form.value, res.data);
  drawer.visible = true;
  drawer.title = `编辑分类 ${row.name}`;
};

const submitForm = () => {
  categoryFormRef.value?.validate(async (valid) => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateCategory(form.value);
      } else {
        await addCategory(form.value);
      }
      proxy?.$modal.msgSuccess('保存成功');
      drawer.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const handleDelete = async (row: CategoryVO) => {
  await proxy?.$modal.confirm(`是否确认删除分类“${row.name}”？`);
  await delCategory(row.id);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(categoryList.value, isExpandAll.value);
};

const toggleExpandAll = (list: CategoryVO[], status: boolean) => {
  list.forEach((item) => {
    categoryTableRef.value?.toggleRowExpansion(item, status);
    if (item.children?.length) {
      toggleExpandAll(item.children, status);
    }
  });
};

const handleUploadSuccess = (response: any) => {
  if (!response?.ossId) {
    return;
  }
  form.value.picOssId = response.ossId;
  form.value.picUrl = response.url || '';
};

const getStatusLabel = (value?: string) => {
  return sys_normal_disable.value?.find((item: any) => item.value === value)?.label || '未知状态';
};

const formatCount = (value?: number | string) => {
  return Number(value || 0).toLocaleString('zh-CN');
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.mall-category-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  min-height: calc(100vh - 84px);
  background: #f6f8fb;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  min-height: 124px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.summary-card--blue {
  background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%);
}
.summary-card--green {
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
}
.summary-card--amber {
  background: linear-gradient(180deg, #ffffff 0%, #fff7ed 100%);
}
.summary-card--violet {
  background: linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%);
}

.summary-card__label {
  color: #64748b;
  font-size: 13px;
}

.summary-card__value {
  display: block;
  margin-top: 10px;
  color: #0f172a;
  font-size: 28px;
  line-height: 1.1;
  font-weight: 700;
}

.summary-card__hint {
  display: block;
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}

.filter-panel,
.list-panel {
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.filter-panel {
  padding: 16px 18px 2px;
}
.list-panel {
  padding: 14px 16px 4px;
}
.filter-form :deep(.el-form-item) {
  margin-bottom: 14px;
}
.field-sm {
  width: 180px;
}
.field-md {
  width: 240px;
}
.filter-actions {
  margin-left: auto;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.toolbar-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-text {
  color: #0f172a;
  font-size: 16px;
  font-weight: 600;
}

.title-meta {
  color: #94a3b8;
  font-size: 13px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.table-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.table-summary span {
  padding: 6px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #64748b;
  font-size: 12px;
}

.category-table :deep(.el-table__cell) {
  padding: 14px 0;
}

.category-cell {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.category-cover-box {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
}

.category-cover,
.preview-image {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
}

.category-cover__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 8px;
  background: #eef2ff;
  color: #94a3b8;
  font-size: 12px;
}

.category-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.category-sub {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.drawer-form {
  padding-right: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.image-preview {
  margin-top: 12px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .mall-category-page {
    padding: 12px;
  }
  .summary-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
  .panel-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  .toolbar-actions {
    width: 100%;
    justify-content: flex-start;
  }
  .field-sm,
  .field-md {
    width: 100%;
  }
}
</style>

<template>
  <div class="mall-brand-page">
    <section v-loading="summaryLoading" class="summary-grid">
      <article class="summary-card summary-card--blue">
        <span class="summary-card__label">品牌总数</span>
        <strong class="summary-card__value">{{ formatCount(total) }}</strong>
        <span class="summary-card__hint">当前条件下的品牌记录数</span>
      </article>
      <article class="summary-card summary-card--green">
        <span class="summary-card__label">启用品牌</span>
        <strong class="summary-card__value">{{ formatCount(summary.enabled) }}</strong>
        <span class="summary-card__hint">状态正常且可被商品引用</span>
      </article>
      <article class="summary-card summary-card--amber">
        <span class="summary-card__label">有图品牌</span>
        <strong class="summary-card__value">{{ formatCount(summary.withImage) }}</strong>
        <span class="summary-card__hint">已上传品牌图片的记录</span>
      </article>
      <article class="summary-card summary-card--violet">
        <span class="summary-card__label">平均排序</span>
        <strong class="summary-card__value">{{ formatCount(summary.avgSort) }}</strong>
        <span class="summary-card__hint">便于快速检查排序分布</span>
      </article>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="品牌名称" prop="name">
            <el-input v-model="queryParams.name" class="field-md" clearable placeholder="请输入品牌名称" @keyup.enter="handleQuery" />
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
          <span class="title-text">品牌管理</span>
          <span class="title-meta">{{ total }} 条品牌记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['mall:brand:add']" icon="Plus" type="primary" @click="handleAdd">新增品牌</el-button>
          <el-button v-hasPermi="['mall:brand:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()">批量编辑</el-button>
          <el-button v-hasPermi="['mall:brand:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()"
            >批量删除</el-button
          >
          <el-button v-hasPermi="['mall:brand:export']" icon="Download" plain @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <div class="table-summary">
        <span>启用品牌 {{ formatCount(summary.enabled) }}</span>
        <span>有图品牌 {{ formatCount(summary.withImage) }}</span>
        <span>平均排序 {{ formatCount(summary.avgSort) }}</span>
      </div>

      <el-table v-loading="loading" :data="brandList" class="brand-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed="left" type="selection" width="48" />
        <el-table-column fixed="left" label="品牌信息" min-width="340">
          <template #default="{ row }">
            <div class="brand-cell">
              <div class="brand-cover-box">
                <el-image v-if="row.picUrl" :src="row.picUrl" class="brand-cover" fit="cover" preview-teleported />
                <div v-else class="brand-cover__placeholder">品牌图</div>
              </div>
              <div class="brand-meta">
                <div class="brand-title-row">
                  <span class="brand-title">{{ row.name || '未命名品牌' }}</span>
                  <el-tag :type="row.status === '0' ? 'success' : 'danger'" effect="light" round>{{ getStatusLabel(row.status) }}</el-tag>
                </div>
                <div class="brand-sub">品牌ID {{ row.id || '-' }}</div>
                <div class="brand-desc">{{ row.description || '暂无品牌简介' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" prop="sortOrder" width="100" />
        <el-table-column label="备注" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="170">
          <template #default="{ row }">
            <el-button v-hasPermi="['mall:brand:edit']" link type="primary" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['mall:brand:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="drawer.visible" :close-on-click-modal="false" :title="drawer.title" size="640px">
      <el-form ref="brandFormRef" :model="form" :rules="rules" class="drawer-form" label-position="top">
        <div class="form-grid">
          <el-form-item label="品牌名称" prop="name">
            <el-input v-model="form.name" maxlength="100" placeholder="请输入品牌名称" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="form.sortOrder" :min="0" :precision="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </div>

        <el-form-item label="品牌图片">
          <image-upload v-model="form.picOssId" :limit="1" @upload-success="handleUploadSuccess" />
          <div v-if="form.picUrl" class="image-preview">
            <el-image :src="form.picUrl" class="preview-image" fit="cover" preview-teleported />
          </div>
        </el-form-item>

        <el-form-item label="品牌简介">
          <el-input v-model="form.description" :rows="4" maxlength="300" placeholder="请输入品牌简介" show-word-limit type="textarea" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remark" :rows="3" maxlength="300" placeholder="请输入备注" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">保存品牌</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" name="Brand" setup>
import type { ComponentInternalInstance } from 'vue';
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import type { ElFormInstance } from 'element-plus';
import { addBrand, delBrand, getBrand, listBrand, updateBrand } from '@/api/mall/brand';
import type { BrandForm, BrandQuery, BrandVO } from '@/api/mall/brand/types';
import ImageUpload from '@/components/ImageUpload/index.vue';

interface SummaryState {
  enabled: number;
  withImage: number;
  avgSort: number;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const brandList = ref<BrandVO[]>([]);
const loading = ref(false);
const summaryLoading = ref(false);
const buttonLoading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const brandFormRef = ref<ElFormInstance>();

const drawer = reactive({
  visible: false,
  title: ''
});

const initFormData: BrandForm = {
  id: undefined,
  name: undefined,
  description: undefined,
  picOssId: undefined,
  picUrl: undefined,
  sortOrder: 0,
  status: '0',
  remark: undefined
};

const data = reactive<PageData<BrandForm, BrandQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    name: [{ required: true, message: '品牌名称不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const summary = computed<SummaryState>(() => {
  const list = brandList.value;
  const sortTotal = list.reduce((sum, item) => sum + Number(item.sortOrder || 0), 0);
  return {
    enabled: list.filter((item) => item.status === '0').length,
    withImage: list.filter((item) => !!item.picUrl).length,
    avgSort: list.length ? Math.round(sortTotal / list.length) : 0
  };
});

const getList = async () => {
  loading.value = true;
  summaryLoading.value = true;
  try {
    const res = await listBrand(queryParams.value);
    brandList.value = res.rows || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
    summaryLoading.value = false;
  }
};

const reset = () => {
  Object.assign(form.value, initFormData);
  brandFormRef.value?.clearValidate();
};

const cancel = () => {
  drawer.visible = false;
  reset();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: BrandVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  reset();
  drawer.visible = true;
  drawer.title = '新增品牌';
};

const handleUpdate = async (row?: BrandVO) => {
  reset();
  const currentId = row?.id || ids.value[0];
  const res = await getBrand(currentId);
  Object.assign(form.value, res.data);
  drawer.visible = true;
  drawer.title = `编辑品牌 ${form.value.name || ''}`;
};

const submitForm = () => {
  brandFormRef.value?.validate(async (valid) => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateBrand(form.value);
      } else {
        await addBrand(form.value);
      }
      proxy?.$modal.msgSuccess('保存成功');
      drawer.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const handleDelete = async (row?: BrandVO) => {
  const currentIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除品牌编号为“${currentIds}”的数据项？`);
  await delBrand(currentIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

const handleExport = () => {
  proxy?.download(
    'mall/brand/export',
    {
      ...queryParams.value
    },
    `brand_${new Date().getTime()}.xlsx`
  );
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
.mall-brand-page {
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

.summary-card--blue { background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%); }
.summary-card--green { background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%); }
.summary-card--amber { background: linear-gradient(180deg, #ffffff 0%, #fff7ed 100%); }
.summary-card--violet { background: linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%); }

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

.brand-table :deep(.el-table__cell) {
  padding: 14px 0;
}

.brand-cell {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.brand-cover-box {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
}

.brand-cover,
.preview-image {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
}

.brand-cover__placeholder {
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

.brand-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.brand-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.brand-sub,
.brand-desc {
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
  .mall-brand-page {
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

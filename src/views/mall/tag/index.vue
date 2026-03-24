<template>
  <div class="tag-manage-page">
    <section v-loading="loading" class="summary-grid">
      <article class="summary-card summary-card--blue">
        <span class="summary-card__label">标签总数</span>
        <strong class="summary-card__value">{{ total }}</strong>
        <span class="summary-card__hint">当前筛选条件下的标签记录总数</span>
      </article>
      <article class="summary-card summary-card--green">
        <span class="summary-card__label">服务标签</span>
        <strong class="summary-card__value">{{ summary.serviceTagCurrentPage }}</strong>
        <span class="summary-card__hint">当前页中的服务标签数量</span>
      </article>
      <article class="summary-card summary-card--amber">
        <span class="summary-card__label">服务区服</span>
        <strong class="summary-card__value">{{ summary.serviceRegionCurrentPage }}</strong>
        <span class="summary-card__hint">当前页中的服务区服数量</span>
      </article>
      <article class="summary-card summary-card--violet">
        <span class="summary-card__label">正常启用</span>
        <strong class="summary-card__value">{{ summary.enabledCount }}</strong>
        <span class="summary-card__hint">当前页中处于正常状态的标签</span>
      </article>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="标签名称" prop="tagName">
            <el-input v-model="queryParams.tagName" class="field-md" clearable placeholder="请输入标签名称" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="标签类型" prop="tagType">
            <el-select v-model="queryParams.tagType" class="field-sm" clearable placeholder="全部类型">
              <el-option v-for="item in tagTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" class="field-sm" clearable placeholder="全部状态">
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="queryParams.sortOrder" :min="0" class="field-sm" controls-position="right" />
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
          <span class="title-text">标签列表</span>
          <span class="title-meta">{{ total }} 条记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['mall:tag:add']" icon="Plus" type="primary" @click="handleAdd">新增标签</el-button>
          <el-button v-hasPermi="['mall:tag:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()">编辑</el-button>
          <el-button v-hasPermi="['mall:tag:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">删除</el-button>
          <el-button v-hasPermi="['mall:tag:export']" icon="Download" plain @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <div class="table-summary">
        <span>当前页服务标签 {{ summary.serviceTagCurrentPage }}</span>
        <span>当前页服务区服 {{ summary.serviceRegionCurrentPage }}</span>
        <span>当前页停用 {{ summary.disabledCount }}</span>
      </div>

      <el-table v-loading="loading" :data="tagList" class="tag-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed="left" type="selection" width="48" />
        <el-table-column fixed="left" label="标签信息" min-width="260">
          <template #default="{ row }">
            <div class="tag-info">
              <div :class="row.tagType === 'service_region' ? 'tag-badge--region' : 'tag-badge--service'" class="tag-badge">
                {{ row.tagType === 'service_region' ? '区服' : '标签' }}
              </div>
              <div class="tag-meta">
                <div class="tag-name-row">
                  <span class="tag-name">{{ row.tagName || '-' }}</span>
                  <el-tag :type="row.status === '0' ? 'success' : 'danger'" effect="light" round>
                    {{ getStatusLabel(row.status) }}
                  </el-tag>
                </div>
                <div class="tag-sub">类型 {{ getTagTypeLabel(row.tagType) }}</div>
                <div class="tag-sub">编号 {{ row.id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="标签类型" width="140">
          <template #default="{ row }">
            <el-tag :type="row.tagType === 'service_region' ? 'warning' : 'primary'" effect="plain" round>
              {{ getTagTypeLabel(row.tagType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" prop="sortOrder" width="100" />
        <el-table-column label="备注" min-width="220" prop="remark" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" width="170" />
        <el-table-column align="center" fixed="right" label="操作" width="160">
          <template #default="{ row }">
            <el-button v-hasPermi="['mall:tag:edit']" link type="primary" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['mall:tag:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="drawer.visible" :close-on-click-modal="false" :title="drawer.title" size="560px">
      <el-form ref="tagFormRef" :model="form" :rules="rules" class="tag-form" label-position="top">
        <div class="form-grid">
          <el-form-item label="标签名称" prop="tagName">
            <el-input v-model="form.tagName" maxlength="50" placeholder="请输入标签名称" />
          </el-form-item>
          <el-form-item label="标签类型" prop="tagType">
            <el-select v-model="form.tagType" placeholder="请选择标签类型" style="width: 100%">
              <el-option v-for="item in tagTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" :rows="4" maxlength="200" placeholder="请输入备注说明" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" name="Tag" setup>
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import { addTag, delTag, getTag, listTag, updateTag } from '@/api/mall/tag';
import type { TagForm, TagQuery, TagVO } from '@/api/mall/tag/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const tagList = ref<TagVO[]>([]);
const loading = ref(false);
const buttonLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);

const queryFormRef = ref<ElFormInstance>();
const tagFormRef = ref<ElFormInstance>();

const drawer = reactive({
  visible: false,
  title: ''
});

const tagTypeOptions = [
  { label: '服务标签', value: 'service_tag' },
  { label: '服务区服', value: 'service_region' }
];

const createDefaultForm = (): TagForm => ({
  id: undefined,
  tagName: '',
  tagType: 'service_tag',
  sortOrder: 0,
  status: '0',
  remark: ''
});

const data = reactive<PageData<TagForm, TagQuery>>({
  form: createDefaultForm(),
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tagName: undefined,
    tagType: undefined,
    sortOrder: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
    tagType: [{ required: true, message: '请选择标签类型', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const summary = computed(() => {
  const list = tagList.value;
  return {
    enabledCount: list.filter((item) => item.status === '0').length,
    disabledCount: list.filter((item) => item.status === '1').length,
    serviceTagCurrentPage: list.filter((item) => item.tagType === 'service_tag').length,
    serviceRegionCurrentPage: list.filter((item) => item.tagType === 'service_region').length
  };
});

const getTagTypeLabel = (value?: string) => tagTypeOptions.find((item) => item.value === value)?.label || '未知类型';
const getStatusLabel = (value?: string) => sys_normal_disable.value?.find((item: any) => item.value === value)?.label || '未知状态';

const getList = async () => {
  loading.value = true;
  try {
    const res = await listTag(queryParams.value);
    tagList.value = res.rows || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  Object.assign(form.value, createDefaultForm());
  tagFormRef.value?.clearValidate();
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
  queryParams.value.sortOrder = undefined;
  handleQuery();
};

const handleSelectionChange = (selection: TagVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  reset();
  drawer.visible = true;
  drawer.title = '新增标签';
};

const handleUpdate = async (row?: TagVO) => {
  reset();
  const currentId = row?.id || ids.value[0];
  const res = await getTag(currentId);
  Object.assign(form.value, createDefaultForm(), res.data || {});
  drawer.visible = true;
  drawer.title = '编辑标签';
};

const submitForm = () => {
  tagFormRef.value?.validate(async (valid) => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateTag(form.value);
      } else {
        await addTag(form.value);
      }
      proxy?.$modal.msgSuccess('保存成功');
      drawer.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const handleDelete = async (row?: TagVO) => {
  const currentIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除标签 "${row?.tagName || currentIds}"？`);
  await delTag(currentIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

const handleExport = () => {
  proxy?.download(
    'mall/tag/export',
    {
      ...queryParams.value
    },
    `tag_${Date.now()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.tag-manage-page {
  padding: 16px;
  min-height: calc(100vh - 84px);
  background: #f6f8fb;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.summary-card {
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
  font-weight: 700;
}

.summary-card__hint {
  display: block;
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
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
  margin-bottom: 14px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-actions {
  margin-left: auto;
}

.field-sm {
  width: 150px;
}

.field-md {
  width: 190px;
}

.list-panel {
  padding: 14px 16px 4px;
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
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.table-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.tag-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tag-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.tag-badge--service {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

.tag-badge--region {
  background: linear-gradient(135deg, #d97706, #f59e0b);
}

.tag-meta {
  min-width: 0;
}

.tag-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.tag-name {
  color: #0f172a;
  font-weight: 600;
}

.tag-sub {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.tag-form {
  padding-bottom: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .tag-manage-page {
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

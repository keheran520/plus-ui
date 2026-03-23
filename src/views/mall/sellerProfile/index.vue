<template>
  <div class="seller-profile-page">
    <section class="summary-grid" v-loading="summaryLoading">
      <article class="summary-card summary-card--blue">
        <span class="summary-card__label">服务商总数</span>
        <strong class="summary-card__value">{{ formatCount(summary.total) }}</strong>
        <span class="summary-card__hint">当前页服务商资料数量</span>
      </article>
      <article class="summary-card summary-card--green">
        <span class="summary-card__label">完成订单</span>
        <strong class="summary-card__value">{{ formatCount(summary.finishCount) }}</strong>
        <span class="summary-card__hint">当前筛选结果的完成订单总和</span>
      </article>
      <article class="summary-card summary-card--amber">
        <span class="summary-card__label">被收藏量</span>
        <strong class="summary-card__value">{{ formatCount(summary.favoriteCount) }}</strong>
        <span class="summary-card__hint">服务商累计被收藏数据</span>
      </article>
      <article class="summary-card summary-card--violet">
        <span class="summary-card__label">平均评分</span>
        <strong class="summary-card__value">{{ formatScore(summary.avgScore) }}</strong>
        <span class="summary-card__hint">按当前列表数据实时计算</span>
      </article>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="用户ID" prop="userId">
            <el-input v-model="queryParams.userId" class="field-sm" clearable placeholder="请输入用户ID" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" class="field-sm" clearable placeholder="全部状态">
              <el-option label="正常" value="0" />
              <el-option label="停用" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item class="filter-actions">
            <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </section>
    </transition>

    <section class="list-panel">
      <header class="panel-toolbar">
        <div class="toolbar-title">
          <span class="title-text">服务商资料</span>
          <span class="title-meta">{{ total }} 条记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['mall:sellerProfile:add']" type="primary" icon="Plus" @click="handleAdd">新增资料</el-button>
          <el-button v-hasPermi="['mall:sellerProfile:edit']" plain type="success" icon="Edit" :disabled="single" @click="handleUpdate()">批量编辑</el-button>
          <el-button v-hasPermi="['mall:sellerProfile:remove']" plain type="danger" icon="Delete" :disabled="multiple" @click="handleDelete()">批量删除</el-button>
          <el-button v-hasPermi="['mall:sellerProfile:export']" plain icon="Download" @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <div class="table-summary">
        <span>完成订单 {{ formatCount(summary.finishCount) }}</span>
        <span>被收藏量 {{ formatCount(summary.favoriteCount) }}</span>
        <span>平均评分 {{ formatScore(summary.avgScore) }}</span>
      </div>

      <el-table v-loading="loading" :data="sellerProfileList" class="seller-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" fixed="left" />
        <el-table-column label="服务商信息" min-width="240" fixed="left">
          <template #default="{ row }">
            <div class="seller-cell">
              <el-avatar class="seller-avatar">{{ String(row.userId || 'U').slice(0, 1) }}</el-avatar>
              <div class="seller-meta">
                <div class="seller-title-row">
                  <span class="seller-title">用户 {{ row.userId || '-' }}</span>
                  <el-tag :type="row.status === '0' ? 'success' : 'danger'" effect="light" round>{{ row.status === '0' ? '正常' : '停用' }}</el-tag>
                </div>
                <div class="seller-sub">资料ID {{ row.id || '-' }}</div>
                <div class="seller-sub">{{ row.remark || '暂无运营备注' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="完成订单" width="130" align="center">
          <template #default="{ row }">
            <span class="metric-chip metric-chip--blue">{{ formatCount(row.orderFinishCount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="被收藏量" width="130" align="center">
          <template #default="{ row }">
            <span class="metric-chip metric-chip--amber">{{ formatCount(row.favoriteCount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="120" align="center">
          <template #default="{ row }">
            <span class="metric-chip metric-chip--green">{{ formatScore(row.score) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-hasPermi="['mall:sellerProfile:edit']" link type="primary" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['mall:sellerProfile:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="drawer.visible" :title="drawer.title" size="640px" :close-on-click-modal="false">
      <el-form ref="sellerProfileFormRef" :model="form" :rules="rules" label-position="top" class="drawer-form">
        <div class="form-grid">
          <el-form-item label="用户ID" prop="userId">
            <el-input v-model="form.userId" placeholder="请输入用户ID" />
          </el-form-item>
          <el-form-item label="系统状态">
            <el-radio-group v-model="form.status">
              <el-radio-button label="0">正常</el-radio-button>
              <el-radio-button label="1">停用</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="完成订单量">
            <el-input-number v-model="form.orderFinishCount" :min="0" :precision="0" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="被收藏量">
            <el-input-number v-model="form.favoriteCount" :min="0" :precision="0" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="评分">
            <el-input-number v-model="form.score" :min="0" :max="5" :precision="1" :step="0.1" controls-position="right" style="width: 100%" />
          </el-form-item>
        </div>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="4" maxlength="300" show-word-limit placeholder="请输入服务商资料备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" :loading="buttonLoading" @click="submitForm">保存资料</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="SellerProfile" lang="ts">
import { getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import type { ElFormInstance } from 'element-plus';
import { addSellerProfile, delSellerProfile, getSellerProfile, listSellerProfile, updateSellerProfile } from '@/api/mall/sellerProfile';
import type { SellerProfileForm, SellerProfileQuery, SellerProfileVO } from '@/api/mall/sellerProfile/types';

interface SummaryState {
  total: number;
  finishCount: number;
  favoriteCount: number;
  avgScore: number;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const sellerProfileList = ref<SellerProfileVO[]>([]);
const loading = ref(false);
const summaryLoading = ref(false);
const buttonLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);

const queryFormRef = ref<ElFormInstance>();
const sellerProfileFormRef = ref<ElFormInstance>();

const drawer = reactive({
  visible: false,
  title: ''
});

const initFormData: SellerProfileForm = {
  id: undefined,
  userId: undefined,
  orderFinishCount: 0,
  favoriteCount: 0,
  score: 5,
  status: '0',
  remark: undefined
};

const data = reactive<PageData<SellerProfileForm, SellerProfileQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }]
  }
});

const summary = ref<SummaryState>({
  total: 0,
  finishCount: 0,
  favoriteCount: 0,
  avgScore: 0
});

const { queryParams, form, rules } = toRefs(data);

const buildSummary = () => {
  const list = sellerProfileList.value;
  summary.value = {
    total: total.value,
    finishCount: list.reduce((sum, item) => sum + Number(item.orderFinishCount || 0), 0),
    favoriteCount: list.reduce((sum, item) => sum + Number(item.favoriteCount || 0), 0),
    avgScore: list.length ? list.reduce((sum, item) => sum + Number(item.score || 0), 0) / list.length : 0
  };
};

const getList = async () => {
  loading.value = true;
  summaryLoading.value = true;
  try {
    const res = await listSellerProfile(queryParams.value);
    sellerProfileList.value = res.rows || [];
    total.value = res.total || 0;
    buildSummary();
  } finally {
    loading.value = false;
    summaryLoading.value = false;
  }
};

const reset = () => {
  Object.assign(form.value, initFormData);
  sellerProfileFormRef.value?.clearValidate();
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

const handleSelectionChange = (selection: SellerProfileVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  reset();
  drawer.visible = true;
  drawer.title = '新增服务商资料';
};

const handleUpdate = async (row?: SellerProfileVO) => {
  reset();
  const currentId = row?.id || ids.value[0];
  const res = await getSellerProfile(currentId);
  Object.assign(form.value, res.data);
  drawer.visible = true;
  drawer.title = '编辑服务商资料';
};

const submitForm = () => {
  sellerProfileFormRef.value?.validate(async valid => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateSellerProfile(form.value);
      } else {
        await addSellerProfile(form.value);
      }
      proxy?.$modal.msgSuccess('保存成功');
      drawer.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const handleDelete = async (row?: SellerProfileVO) => {
  const currentIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除服务商资料编号为“${currentIds}”的数据项？`);
  await delSellerProfile(currentIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

const handleExport = () => {
  proxy?.download(
    'mall/sellerProfile/export',
    {
      ...queryParams.value
    },
    `sellerProfile_${new Date().getTime()}.xlsx`
  );
};

const formatCount = (value?: number | string) => {
  return Number(value || 0).toLocaleString('zh-CN');
};

const formatScore = (value?: number | string) => {
  return Number(value || 0).toFixed(1);
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.seller-profile-page {
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

.seller-table :deep(.el-table__cell) {
  padding: 14px 0;
}

.seller-cell {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.seller-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #0f172a, #334155);
  color: #fff;
  font-weight: 700;
}

.seller-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.seller-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.seller-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.seller-sub {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.metric-chip--blue {
  color: #2563eb;
  background: #dbeafe;
}

.metric-chip--amber {
  color: #b45309;
  background: #fef3c7;
}

.metric-chip--green {
  color: #047857;
  background: #d1fae5;
}

.drawer-form {
  padding-right: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
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
  .seller-profile-page {
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

  .field-sm {
    width: 100%;
  }
}
</style>

<template>
  <div class="member-badge-page">
    <section v-show="showSearch" class="filter-panel">
      <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="徽章编码">
          <el-input v-model="queryParams.badgeCode" class="field-md" clearable placeholder="请输入徽章编码" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="徽章名称">
          <el-input v-model="queryParams.badgeName" class="field-md" clearable placeholder="请输入徽章名称" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="触发条件">
          <el-select v-model="queryParams.conditionType" class="field-sm" clearable placeholder="全部条件">
            <el-option v-for="item in conditionTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" class="field-sm" clearable placeholder="全部状态">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button icon="Search" type="primary" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="list-panel">
      <header class="panel-toolbar">
        <div class="toolbar-title">
          <span class="title-text">会员徽章定义</span>
          <span class="title-meta">内置 7 天、30 天连续签到和累计 100 次签到徽章不可删除</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['member:badge:add']" icon="Plus" type="primary" @click="handleAdd">新增徽章</el-button>
          <el-button v-hasPermi="['member:badge:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
            批量删除
          </el-button>
          <el-button v-hasPermi="['member:badge:export']" icon="Download" plain @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <div class="table-summary">
        <span>总数 {{ total }}</span>
        <span>启用 {{ enabledCount }}</span>
        <span>内置 {{ builtInCount }}</span>
      </div>

      <el-table v-loading="loading" :data="badgeList" class="manage-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="48" />
        <el-table-column label="徽章信息" min-width="280">
          <template #default="{ row }">
            <div class="badge-cell">
              <div class="badge-cover">
                <ImagePreview
                  v-if="getResolvedBadgeImage(row)"
                  :src="getResolvedBadgeImage(row)"
                  :preview-src-list="[getResolvedBadgeImage(row)]"
                  class="badge-icon-preview"
                  height="52px"
                  width="52px"
                />
                <div v-else class="badge-placeholder">{{ (row.badgeName || '徽').slice(0, 1) }}</div>
              </div>
              <div class="badge-meta">
                <div class="badge-name-row">
                  <span class="badge-name">{{ row.badgeName || '-' }}</span>
                  <el-tag v-if="isBuiltInBadge(row)" effect="plain" round size="small">内置</el-tag>
                  <el-tag :type="row.status === '0' ? 'success' : 'info'" effect="light" round>{{ getStatusLabel(row.status) }}</el-tag>
                </div>
                <div class="badge-sub">编码 {{ row.badgeCode || '-' }}</div>
                <div class="badge-sub">{{ row.badgeDesc || '暂无描述' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="触发规则" min-width="180">
          <template #default="{ row }">
            <div class="stack-cell">
              <span class="main-line">{{ getConditionLabel(row.conditionType) }}</span>
              <span class="sub-line">达到 {{ row.conditionValue || 0 }} 次触发</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" prop="sortOrder" width="90" />
        <el-table-column label="备注" min-width="180" prop="remark" show-overflow-tooltip />
        <el-table-column align="center" fixed="right" label="操作" width="140">
          <template #default="{ row }">
            <el-button v-hasPermi="['member:badge:edit']" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button v-hasPermi="['member:badge:remove']" :disabled="isBuiltInBadge(row)" link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="dialog.visible" :close-on-click-modal="false" :title="dialog.title" size="620px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="徽章编码" prop="badgeCode">
            <el-input v-model="form.badgeCode" :disabled="isEditMode" maxlength="50" placeholder="例如：checkin_7days" />
          </el-form-item>
          <el-form-item label="徽章名称" prop="badgeName">
            <el-input v-model="form.badgeName" :disabled="isEditMode" maxlength="50" placeholder="请输入徽章名称" />
          </el-form-item>
          <el-form-item label="触发条件" prop="conditionType">
            <el-select v-model="form.conditionType" placeholder="请选择触发条件">
              <el-option v-for="item in conditionTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="触发阈值" prop="conditionValue">
            <el-input-number v-model="form.conditionValue" :min="1" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio-button v-for="item in statusOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="1" controls-position="right" style="width: 100%" />
          </el-form-item>
        </div>
        <el-form-item label="徽章图标" prop="badgeIcon">
          <image-upload v-model="form.ossId" :limit="1" @upload-success="handleUploadSuccess" />
          <div v-if="form.badgeIcon" class="image-preview">
            <ImagePreview :src="form.badgeIcon" :preview-src-list="[form.badgeIcon]" class="preview-image" height="52px" width="52px" />
          </div>
        </el-form-item>
        <el-form-item label="徽章描述" prop="badgeDesc">
          <el-input v-model="form.badgeDesc" :rows="4" maxlength="200" placeholder="补充徽章说明，方便运营理解用途" show-word-limit type="textarea" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" :rows="3" maxlength="200" placeholder="可记录特殊说明" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="dialog.visible = false">取消</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import ImageUpload from '@/components/ImageUpload/index.vue';
import { addBadge, delBadge, getBadge, listBadge, updateBadge } from '@/api/member/badge';
import type { BadgeForm, BadgeQuery, BadgeVO } from '@/api/member/badge/types';
import { getMemberBadgeImage } from '@/utils/memberVisual';

const { proxy } = getCurrentInstance() as any;

const queryRef = ref();
const formRef = ref();

const loading = ref(false);
const buttonLoading = ref(false);
const total = ref(0);
const showSearch = ref(true);
const multiple = ref(true);
const ids = ref<Array<string | number>>([]);
const badgeList = ref<BadgeVO[]>([]);

const dialog = reactive({
  visible: false,
  title: ''
});

const conditionTypeOptions = [
  { label: '连续签到', value: 'checkin_streak' },
  { label: '累计签到', value: 'checkin_total' }
];

const statusOptions = [
  { label: '启用', value: '0' },
  { label: '停用', value: '1' }
];

const createQuery = (): BadgeQuery => ({
  pageNum: 1,
  pageSize: 10,
  badgeCode: undefined,
  badgeName: undefined,
  conditionType: undefined,
  status: undefined
});

const createForm = (): BadgeForm => ({
  id: undefined,
  badgeCode: '',
  badgeName: '',
  ossId: undefined,
  badgeIcon: '',
  badgeDesc: '',
  conditionType: 'checkin_streak',
  conditionValue: 1,
  status: '0',
  sortOrder: 1,
  remark: ''
});

const queryParams = ref<BadgeQuery>(createQuery());
const form = ref<BadgeForm>(createForm());

const rules = {
  badgeCode: [{ required: true, message: '请输入徽章编码', trigger: 'blur' }],
  badgeName: [{ required: true, message: '请输入徽章名称', trigger: 'blur' }],
  conditionType: [{ required: true, message: '请选择触发条件', trigger: 'change' }],
  conditionValue: [{ required: true, message: '请输入触发阈值', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  sortOrder: [{ required: true, message: '请输入排序值', trigger: 'blur' }]
};

const isEditMode = computed(() => Boolean(form.value.id));
const enabledCount = computed(() => badgeList.value.filter((item) => item.status === '0').length);
const builtInCount = computed(() => badgeList.value.filter((item) => isBuiltInBadge(item)).length);

function isBuiltInBadge(row?: Partial<BadgeVO>) {
  const type = row?.conditionType;
  const value = Number(row?.conditionValue || 0);
  return (type === 'checkin_streak' && [7, 30].includes(value)) || (type === 'checkin_total' && value === 100);
}

function getConditionLabel(value?: string) {
  return conditionTypeOptions.find((item) => item.value === value)?.label || '未知条件';
}

function getStatusLabel(value?: string) {
  return statusOptions.find((item) => item.value === value)?.label || '未知状态';
}

function handleUploadSuccess(response: any) {
  if (!response?.ossId) {
    return;
  }
  form.value.ossId = response.ossId;
  form.value.badgeIcon = response.url || '';
}

function getResolvedBadgeImage(row: any) {
  return getMemberBadgeImage(row);
}

async function getList() {
  loading.value = true;
  try {
    const res = await listBadge(queryParams.value);
    badgeList.value = res.rows || [];
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
  queryParams.value = createQuery();
  queryRef.value?.resetFields?.();
  getList();
}

function handleSelectionChange(selection: BadgeVO[]) {
  ids.value = selection.map((item) => item.id);
  multiple.value = selection.length === 0;
}

function resetForm() {
  form.value = createForm();
  formRef.value?.resetFields?.();
}

function handleAdd() {
  resetForm();
  dialog.title = '新增会员徽章';
  dialog.visible = true;
}

async function handleEdit(row: BadgeVO) {
  const res = await getBadge(row.id);
  form.value = { ...createForm(), ...res.data };
  dialog.title = '编辑会员徽章';
  dialog.visible = true;
}

function submitForm() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateBadge(form.value);
        proxy.$modal.msgSuccess('徽章已更新');
      } else {
        await addBadge(form.value);
        proxy.$modal.msgSuccess('徽章已创建');
      }
      dialog.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
}

function handleDelete(row?: BadgeVO) {
  const targetIds = row?.id || ids.value;
  if (!targetIds || (Array.isArray(targetIds) && targetIds.length === 0)) {
    proxy.$modal.msgWarning('请先选择要删除的徽章');
    return;
  }
  const selectedRows = row ? [row] : badgeList.value.filter((item) => ids.value.includes(item.id));
  if (selectedRows.some((item) => isBuiltInBadge(item))) {
    proxy.$modal.msgWarning('内置徽章不允许删除');
    return;
  }
  proxy.$modal
    .confirm('确认删除选中的徽章数据吗？')
    .then(() => delBadge(targetIds))
    .then(async () => {
      proxy.$modal.msgSuccess('删除成功');
      await getList();
    })
    .catch(() => undefined);
}

function handleExport() {
  proxy.download('member/badge/export', { ...queryParams.value }, `member_badge_${Date.now()}.xlsx`);
}

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.member-badge-page {
  padding: 16px;
  min-height: calc(100vh - 84px);
  background: #f6f8fb;
}

.filter-panel,
.list-panel {
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.filter-panel {
  margin-bottom: 14px;
  padding: 16px 18px 2px;
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

.badge-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge-cover {
  flex-shrink: 0;
}

.badge-placeholder {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.badge-icon-preview,
.preview-image {
  display: inline-flex;
  overflow: hidden;
  border-radius: 12px;
}

.badge-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  color: #0f172a;
  font-size: 18px;
  font-weight: 700;
}

.image-preview {
  margin-top: 12px;
}

.badge-meta,
.stack-cell {
  display: grid;
  gap: 4px;
}

.badge-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-name,
.main-line {
  color: #0f172a;
  font-weight: 600;
}

.badge-sub,
.sub-line {
  color: #94a3b8;
  font-size: 12px;
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

@media (max-width: 768px) {
  .member-badge-page {
    padding: 12px;
  }

  .panel-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

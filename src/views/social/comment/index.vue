<template>
  <div class="social-manage-page">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item :label="TEXT.targetType" prop="targetType">
            <el-select v-model="queryParams.targetType" :placeholder="TEXT.targetTypePlaceholder" class="field-md" clearable>
              <el-option v-for="item in targetTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="TEXT.targetId" prop="targetId">
            <el-input v-model="queryParams.targetId" :placeholder="TEXT.targetIdPlaceholder" class="field-sm" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="TEXT.userId" prop="userId">
            <el-input v-model="queryParams.userId" :placeholder="TEXT.userIdPlaceholder" class="field-sm" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="TEXT.status" prop="status">
            <el-select v-model="queryParams.status" :placeholder="TEXT.statusPlaceholder" class="field-sm" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="TEXT.content" prop="content">
            <el-input v-model="queryParams.content" :placeholder="TEXT.contentPlaceholder" class="field-lg" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="TEXT.createTime">
            <el-date-picker
              v-model="dateRange"
              :end-placeholder="TEXT.endDate"
              :start-placeholder="TEXT.startDate"
              class="field-date"
              range-separator="-"
              type="daterange"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item class="filter-actions">
            <el-button icon="Search" type="primary" @click="handleQuery">{{ TEXT.search }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{ TEXT.reset }}</el-button>
          </el-form-item>
        </el-form>
      </section>
    </transition>

    <section class="list-panel">
      <header class="panel-toolbar">
        <div class="toolbar-title">
          <span class="title-text">{{ TEXT.tableTitle }}</span>
          <span class="title-meta">{{ total }} {{ TEXT.records }}</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['social:comment:edit']" :disabled="multiple" icon="Check" plain type="success" @click="handleBatchAudit('0')">
            {{ TEXT.batchApprove }}
          </el-button>
          <el-button v-hasPermi="['social:comment:edit']" :disabled="multiple" icon="Hide" plain type="warning" @click="handleBatchAudit('2')">
            {{ TEXT.batchHide }}
          </el-button>
          <el-button v-hasPermi="['social:comment:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
            {{ TEXT.batchDelete }}
          </el-button>
          <el-button v-hasPermi="['social:comment:export']" icon="Download" plain @click="handleExport">
            {{ TEXT.export }}
          </el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <el-table v-loading="loading" :data="commentList" class="social-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="48" />
        <el-table-column :label="TEXT.userId" align="center" min-width="140">
          <template #default="{ row }">
            <el-link type="primary" @click="openUserDrawer(row.userId)">{{ row.userId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.target" min-width="210">
          <template #default="{ row }">
            <div class="stack-cell">
              <dict-tag :options="social_target_type" :value="row.targetType" />
              <span class="main-line">{{ row.targetTitle || `${TEXT.targetId} #${row.targetId}` }}</span>
              <span class="sub-line">ID: {{ row.targetId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.content" min-width="320" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="stack-cell">
              <span class="main-line content-line">
                <span v-if="row.replyToUserName" class="reply-prefix">@{{ row.replyToUserName }}</span>
                {{ row.content }}
              </span>
              <span class="sub-line">{{ getDeviceLabel(row.deviceType) }} / {{ row.ipAddress || TEXT.noData }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.interaction" align="center" width="138">
          <template #default="{ row }">
            <div class="metric-pair">
              <span>{{ TEXT.likes }} {{ row.likeCount ?? 0 }}</span>
              <span>{{ TEXT.replies }} {{ row.replyCount ?? 0 }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.status" align="center" width="110">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="light" round>
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.createTime" align="center" prop="createTime" width="176" />
        <el-table-column :label="TEXT.action" align="center" fixed="right" width="220">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:comment:query']" link type="primary" @click="handleView(row)">{{ TEXT.detail }}</el-button>
            <el-button v-if="row.status !== '0'" v-hasPermi="['social:comment:edit']" link type="success" @click="handleAudit(row, '0')">
              {{ TEXT.approve }}
            </el-button>
            <el-button v-if="row.status !== '2'" v-hasPermi="['social:comment:edit']" link type="warning" @click="handleAudit(row, '2')">
              {{ TEXT.hide }}
            </el-button>
            <el-button v-hasPermi="['social:comment:remove']" link type="danger" @click="handleDelete(row)">{{ TEXT.delete }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="viewDialogVisible" :title="TEXT.detailTitle" size="520px">
      <template v-if="currentComment">
        <div class="drawer-user-card">
          <el-avatar :size="52" :src="currentComment.avatar">
            {{ (currentComment.nickName || currentComment.userName || 'U').slice(0, 1) }}
          </el-avatar>
          <div>
            <div class="drawer-name">{{ currentComment.nickName || currentComment.userName || TEXT.unknownUser }}</div>
            <div class="drawer-sub">ID: {{ currentComment.userId }}</div>
          </div>
          <el-tag :type="getStatusTagType(currentComment.status)" effect="light" round>
            {{ getStatusLabel(currentComment.status) }}
          </el-tag>
        </div>

        <div class="drawer-section">
          <div class="section-label">{{ TEXT.commentContent }}</div>
          <div class="content-box">
            <span v-if="currentComment.replyToUserName" class="reply-prefix">@{{ currentComment.replyToUserName }}</span>
            {{ currentComment.content || TEXT.noData }}
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">{{ TEXT.targetType }}</span>
            <span class="detail-value">{{ getTargetTypeLabel(currentComment.targetType) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ TEXT.targetId }}</span>
            <span class="detail-value">{{ currentComment.targetId || TEXT.noData }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ TEXT.targetTitle }}</span>
            <span class="detail-value">{{ currentComment.targetTitle || TEXT.noData }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ TEXT.device }}</span>
            <span class="detail-value">{{ getDeviceLabel(currentComment.deviceType) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ TEXT.likes }}</span>
            <span class="detail-value">{{ currentComment.likeCount ?? 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ TEXT.replies }}</span>
            <span class="detail-value">{{ currentComment.replyCount ?? 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ TEXT.ipAddress }}</span>
            <span class="detail-value">{{ currentComment.ipAddress || TEXT.noData }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ TEXT.createTime }}</span>
            <span class="detail-value">{{ currentComment.createTime || TEXT.noData }}</span>
          </div>
        </div>
      </template>
    </el-drawer>

    <UserStatsDrawer v-model:visible="userDrawerVisible" :user-id="selectedUserId" />
  </div>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, ref, toRefs } from 'vue'
import type { FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { auditComment, batchAuditComment, delSocialComment, getSocialComment, listSocialComment } from '@/api/social/comment';
import type { SocialCommentQuery, SocialCommentVO } from '@/api/social/comment/types';
import UserStatsDrawer from '../components/UserStatsDrawer.vue';

const { proxy } = getCurrentInstance() as any;
const { t } = useI18n();
const { social_target_type } = toRefs<any>(proxy?.useDict('social_target_type'))

const TEXT = computed(() => ({
  tableTitle: t('socialComment.tableTitle'),
  records: t('socialComment.records'),
  targetType: t('socialComment.targetType'),
  targetTypePlaceholder: t('socialComment.targetTypePlaceholder'),
  targetId: t('socialComment.targetId'),
  targetIdPlaceholder: t('socialComment.targetIdPlaceholder'),
  userId: t('socialComment.userId'),
  userIdPlaceholder: t('socialComment.userIdPlaceholder'),
  status: t('socialComment.status'),
  statusPlaceholder: t('socialComment.statusPlaceholder'),
  content: t('socialComment.content'),
  contentPlaceholder: t('socialComment.contentPlaceholder'),
  createTime: t('socialComment.createTime'),
  startDate: t('socialComment.startDate'),
  endDate: t('socialComment.endDate'),
  search: t('socialComment.search'),
  reset: t('socialComment.reset'),
  batchApprove: t('socialComment.batchApprove'),
  batchHide: t('socialComment.batchHide'),
  batchDelete: t('socialComment.batchDelete'),
  export: t('socialComment.export'),
  user: t('socialComment.user'),
  unknownUser: t('socialComment.unknownUser'),
  target: t('socialComment.target'),
  interaction: t('socialComment.interaction'),
  likes: t('socialComment.likes'),
  replies: t('socialComment.replies'),
  action: t('socialComment.action'),
  detail: t('socialComment.detail'),
  approve: t('socialComment.approve'),
  hide: t('socialComment.hide'),
  delete: t('socialComment.delete'),
  detailTitle: t('socialComment.detailTitle'),
  commentContent: t('socialComment.commentContent'),
  targetTitle: t('socialComment.targetTitle'),
  device: t('socialComment.device'),
  ipAddress: t('socialComment.ipAddress'),
  noData: t('socialComment.noData'),
  confirmApprove: t('socialComment.confirmApprove'),
  confirmHide: t('socialComment.confirmHide'),
  confirmBatchApprove: t('socialComment.confirmBatchApprove'),
  confirmBatchHide: t('socialComment.confirmBatchHide'),
  confirmDelete: t('socialComment.confirmDelete'),
  successApprove: t('socialComment.successApprove'),
  successHide: t('socialComment.successHide'),
  successBatchApprove: t('socialComment.successBatchApprove'),
  successBatchHide: t('socialComment.successBatchHide'),
  successDelete: t('socialComment.successDelete')
}));

const queryRef = ref<FormInstance>();
const commentList = ref<SocialCommentVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[string, string]>();
const viewDialogVisible = ref(false);
const currentComment = ref<SocialCommentVO>();
const userDrawerVisible = ref(false);
const selectedUserId = ref<string | number>();

const queryParams = ref<SocialCommentQuery>({
  pageNum: 1,
  pageSize: 10,
  targetType: undefined,
  targetId: undefined,
  userId: undefined,
  status: undefined,
  content: undefined
});

const targetTypeOptions = computed(() => social_target_type.value || [])

const statusOptions = computed(() => [
  { label: t('socialComment.statusNormal'), value: '0' },
  { label: t('socialComment.statusDeleted'), value: '1' },
  { label: t('socialComment.statusHidden'), value: '2' }
]);

function getTargetTypeLabel(value?: string) {
  return targetTypeOptions.value.find((item: DictDataOption) => String(item.value) === String(value))?.label || value || TEXT.value.noData;
}

function getStatusLabel(value?: string) {
  return statusOptions.value.find((item) => item.value === value)?.label || value || TEXT.value.noData;
}

function getStatusTagType(value?: string) {
  if (value === '0') return 'success';
  if (value === '2') return 'warning';
  if (value === '1') return 'info';
  return 'info';
}

function getDeviceLabel(value?: string) {
  if (value === 'pc') return 'PC';
  if (value === 'app') return 'APP';
  if (value === 'xcx') return '小程序';
  return value || TEXT.value.noData;
}

function getList() {
  loading.value = true;
  const params = proxy.addDateRange(queryParams.value, dateRange.value);
  listSocialComment(params)
    .then((response: any) => {
      commentList.value = response.rows;
      total.value = response.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  dateRange.value = undefined;
  queryRef.value?.resetFields();
  handleQuery();
}

function handleSelectionChange(selection: SocialCommentVO[]) {
  ids.value = selection.map((item) => item.commentId);
  multiple.value = !selection.length;
}

function openUserDrawer(userId: string | number) {
  selectedUserId.value = userId;
  userDrawerVisible.value = true;
}

async function handleView(row: SocialCommentVO) {
  const res = await getSocialComment(row.commentId);
  currentComment.value = res.data;
  viewDialogVisible.value = true;
}

function handleAudit(row: SocialCommentVO, status: string) {
  const confirmText = status === '0' ? TEXT.value.confirmApprove : TEXT.value.confirmHide;
  const successText = status === '0' ? TEXT.value.successApprove : TEXT.value.successHide;
  proxy.$modal
    .confirm(confirmText)
    .then(() => auditComment(row.commentId, status))
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(successText);
    })
    .catch(() => {});
}

function handleBatchAudit(status: string) {
  const confirmText = status === '0' ? TEXT.value.confirmBatchApprove : TEXT.value.confirmBatchHide;
  const successText = status === '0' ? TEXT.value.successBatchApprove : TEXT.value.successBatchHide;
  proxy.$modal
    .confirm(confirmText)
    .then(() => batchAuditComment(ids.value, status))
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(successText);
    })
    .catch(() => {});
}

function handleDelete(row?: SocialCommentVO) {
  const commentIds = row ? [row.commentId] : ids.value;
  proxy.$modal
    .confirm(TEXT.value.confirmDelete)
    .then(() => delSocialComment(commentIds))
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(TEXT.value.successDelete);
    })
    .catch(() => {});
}

function handleExport() {
  proxy.download('social/comment/export', { ...queryParams.value }, `comment_${new Date().getTime()}.xlsx`);
}

getList();
</script>

<style lang="scss" scoped>
.social-manage-page {
  padding: 16px;
  background: #f6f8fb;
  min-height: calc(100vh - 84px);
}

.filter-panel,
.list-panel {
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 12px;
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
  width: 140px;
}

.field-md {
  width: 160px;
}

.field-lg {
  width: 220px;
}

.field-date {
  width: 240px;
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
  align-items: baseline;
  gap: 10px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #182230;
}

.title-meta {
  font-size: 12px;
  color: #7a8699;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

:deep(.social-table) {
  --el-table-border-color: #edf1f7;
  --el-table-header-bg-color: #f8fafc;
}

.stack-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.main-line {
  color: #1f2937;
  font-weight: 500;
}

.sub-line {
  color: #8892a6;
  font-size: 12px;
}

.content-line {
  line-height: 1.5;
}

.reply-prefix {
  color: #2563eb;
  margin-right: 6px;
}

.metric-pair {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #4b5563;
  font-size: 12px;
}

.drawer-user-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  margin-bottom: 18px;
  background: linear-gradient(135deg, #f8fbff 0%, #f3f7fc 100%);
  border: 1px solid #e5edf7;
  border-radius: 12px;
}

.drawer-name {
  font-size: 16px;
  font-weight: 600;
  color: #152033;
}

.drawer-sub {
  margin-top: 4px;
  color: #778399;
  font-size: 12px;
}

.drawer-section {
  margin-bottom: 18px;
}

.section-label,
.detail-label {
  font-size: 12px;
  color: #7a8699;
}

.content-box {
  margin-top: 8px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 10px;
  color: #1f2937;
  line-height: 1.7;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-item {
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
}

.detail-value {
  display: block;
  margin-top: 6px;
  color: #182230;
  line-height: 1.5;
  word-break: break-word;
}

@media (max-width: 768px) {
  .social-manage-page {
    padding: 12px;
  }

  .panel-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

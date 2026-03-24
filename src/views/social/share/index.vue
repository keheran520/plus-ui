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
          <el-form-item :label="TEXT.shareType" prop="shareType">
            <el-select v-model="queryParams.shareType" :placeholder="TEXT.shareTypePlaceholder" class="field-md" clearable>
              <el-option v-for="item in shareTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
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
          <el-button v-hasPermi="['social:share:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
            {{ TEXT.batchDelete }}
          </el-button>
          <el-button v-hasPermi="['social:share:export']" icon="Download" plain @click="handleExport">
            {{ TEXT.export }}
          </el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <el-table v-loading="loading" :data="shareList" class="social-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="48" />
        <el-table-column :label="TEXT.userId" align="center" min-width="140">
          <template #default="{ row }">
            <el-link type="primary" @click="openUserDrawer(row.userId)">{{ row.userId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.target" min-width="220">
          <template #default="{ row }">
            <div class="stack-cell">
              <div class="tag-line">
                <dict-tag :options="social_target_type" :value="row.targetType" />
              </div>
              <span class="main-line">{{ row.targetTitle || `${TEXT.targetId} #${row.targetId}` }}</span>
              <span class="sub-line">ID: {{ row.targetId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.shareType" align="center" width="130">
          <template #default="{ row }">
            <dict-tag :options="social_share_type" :value="row.shareType" />
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.shareContent" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.shareContent || TEXT.noData }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.shareTo" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.shareToUserName || TEXT.noData }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.createTime" align="center" prop="createTime" width="180" />
        <el-table-column :label="TEXT.action" align="center" fixed="right" width="110">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:share:remove']" link type="danger" @click="handleDelete(row)">{{ TEXT.delete }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <UserStatsDrawer v-model:visible="userDrawerVisible" :user-id="selectedUserId" />
  </div>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, ref, toRefs } from 'vue';
import type { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { delSocialShare, listSocialShare } from '@/api/social/share';
import type { SocialShareQuery, SocialShareVO } from '@/api/social/share/types';
import UserStatsDrawer from '../components/UserStatsDrawer.vue';

const { proxy } = getCurrentInstance() as any;
const { t } = useI18n();
const { social_target_type, social_share_type } = toRefs<any>(proxy?.useDict('social_target_type', 'social_share_type'));

const TEXT = computed(() => ({
  tableTitle: t('socialShare.tableTitle'),
  records: t('socialShare.records'),
  targetType: t('socialShare.targetType'),
  targetTypePlaceholder: t('socialShare.targetTypePlaceholder'),
  targetId: t('socialShare.targetId'),
  targetIdPlaceholder: t('socialShare.targetIdPlaceholder'),
  userId: t('socialShare.userId'),
  userIdPlaceholder: t('socialShare.userIdPlaceholder'),
  shareType: t('socialShare.shareType'),
  shareTypePlaceholder: t('socialShare.shareTypePlaceholder'),
  createTime: t('socialShare.createTime'),
  startDate: t('socialShare.startDate'),
  endDate: t('socialShare.endDate'),
  search: t('socialShare.search'),
  reset: t('socialShare.reset'),
  batchDelete: t('socialShare.batchDelete'),
  export: t('socialShare.export'),
  user: t('socialShare.user'),
  unknownUser: t('socialShare.unknownUser'),
  target: t('socialShare.target'),
  shareContent: t('socialShare.shareContent'),
  shareTo: t('socialShare.shareTo'),
  noData: t('socialShare.noData'),
  action: t('socialShare.action'),
  delete: t('socialShare.delete'),
  confirmDelete: t('socialShare.confirmDelete'),
  successDelete: t('socialShare.successDelete')
}));

const queryRef = ref<FormInstance>();
const shareList = ref<SocialShareVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[string, string]>();
const userDrawerVisible = ref(false);
const selectedUserId = ref<string | number>();

const queryParams = ref<SocialShareQuery>({
  pageNum: 1,
  pageSize: 10,
  targetType: undefined,
  targetId: undefined,
  userId: undefined,
  shareType: undefined
});

const targetTypeOptions = computed(() => social_target_type.value || []);

const shareTypeOptions = computed(() => social_share_type.value || []);

function getTargetTypeLabel(value?: string) {
  return targetTypeOptions.value.find((item: DictDataOption) => String(item.value) === String(value))?.label || value || '-';
}

function getShareTypeLabel(value?: string) {
  return shareTypeOptions.value.find((item: DictDataOption) => String(item.value) === String(value))?.label || value || '-';
}

function getList() {
  loading.value = true;
  const params = proxy.addDateRange(queryParams.value, dateRange.value);
  listSocialShare(params)
    .then((response: any) => {
      shareList.value = response.rows;
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

function handleSelectionChange(selection: SocialShareVO[]) {
  ids.value = selection.map((item) => item.shareId);
  multiple.value = !selection.length;
}

function openUserDrawer(userId: string | number) {
  selectedUserId.value = userId;
  userDrawerVisible.value = true;
}

function handleDelete(row?: SocialShareVO) {
  const shareIds = row ? [row.shareId] : ids.value;
  proxy.$modal
    .confirm(TEXT.value.confirmDelete)
    .then(() => delSocialShare(shareIds))
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(TEXT.value.successDelete);
    })
    .catch(() => {});
}

function handleExport() {
  proxy.download('social/share/export', { ...queryParams.value }, `share_${new Date().getTime()}.xlsx`);
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

.tag-line {
  display: flex;
}

.main-line {
  color: #1f2937;
  font-weight: 500;
}

.sub-line {
  color: #8892a6;
  font-size: 12px;
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
}
</style>

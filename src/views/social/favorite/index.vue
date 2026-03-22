<template>
  <div class="social-manage-page">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item :label="TEXT.targetType" prop="targetType">
            <el-select v-model="queryParams.targetType" clearable :placeholder="TEXT.targetTypePlaceholder" class="field-md">
              <el-option v-for="item in targetTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="TEXT.targetId" prop="targetId">
            <el-input v-model="queryParams.targetId" clearable :placeholder="TEXT.targetIdPlaceholder" class="field-sm" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="TEXT.userId" prop="userId">
            <el-input v-model="queryParams.userId" clearable :placeholder="TEXT.userIdPlaceholder" class="field-sm" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="TEXT.folderId" prop="folderId">
            <el-input v-model="queryParams.folderId" clearable :placeholder="TEXT.folderIdPlaceholder" class="field-sm" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="TEXT.createTime">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="-"
              :start-placeholder="TEXT.startDate"
              :end-placeholder="TEXT.endDate"
              class="field-date"
            />
          </el-form-item>
          <el-form-item class="filter-actions">
            <el-button type="primary" icon="Search" @click="handleQuery">{{ TEXT.search }}</el-button>
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
          <el-button v-hasPermi="['social:favorite:remove']" :disabled="multiple" type="danger" plain icon="Delete" @click="handleDelete()">
            {{ TEXT.batchDelete }}
          </el-button>
          <el-button v-hasPermi="['social:favorite:export']" plain icon="Download" @click="handleExport">
            {{ TEXT.export }}
          </el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <el-table v-loading="loading" :data="favoriteList" class="social-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column :label="TEXT.userId" min-width="140" align="center">
          <template #default="{ row }">
            <el-link type="primary" @click="openUserDrawer(row.userId)">{{ row.userId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.target" min-width="230">
          <template #default="{ row }">
            <div class="stack-cell">
              <div class="tag-line">
                <el-tag effect="plain" size="small" round>{{ getTargetTypeLabel(row.targetType) }}</el-tag>
              </div>
              <span class="main-line">{{ row.targetTitle || `${TEXT.targetId} #${row.targetId}` }}</span>
              <span class="sub-line">ID: {{ row.targetId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.folder" min-width="150">
          <template #default="{ row }">
            <span>{{ row.folderName || TEXT.defaultFolder }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.remark" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.remark || TEXT.noData }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.createTime" prop="createTime" width="180" align="center" />
        <el-table-column :label="TEXT.action" width="110" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:favorite:remove']" link type="danger" @click="handleDelete(row)">{{ TEXT.delete }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </section>

    <UserStatsDrawer v-model:visible="userDrawerVisible" :user-id="selectedUserId" />
  </div>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { delSocialFavorite, listSocialFavorite } from '@/api/social/favorite'
import type { SocialFavoriteQuery, SocialFavoriteVO } from '@/api/social/favorite/types'
import UserStatsDrawer from '../components/UserStatsDrawer.vue'

const { proxy } = getCurrentInstance() as any
const { t } = useI18n()

const TEXT = computed(() => ({
  tableTitle: t('socialFavorite.tableTitle'),
  records: t('socialFavorite.records'),
  targetType: t('socialFavorite.targetType'),
  targetTypePlaceholder: t('socialFavorite.targetTypePlaceholder'),
  targetId: t('socialFavorite.targetId'),
  targetIdPlaceholder: t('socialFavorite.targetIdPlaceholder'),
  userId: t('socialFavorite.userId'),
  userIdPlaceholder: t('socialFavorite.userIdPlaceholder'),
  folderId: t('socialFavorite.folderId'),
  folderIdPlaceholder: t('socialFavorite.folderIdPlaceholder'),
  createTime: t('socialFavorite.createTime'),
  startDate: t('socialFavorite.startDate'),
  endDate: t('socialFavorite.endDate'),
  search: t('socialFavorite.search'),
  reset: t('socialFavorite.reset'),
  batchDelete: t('socialFavorite.batchDelete'),
  export: t('socialFavorite.export'),
  user: t('socialFavorite.user'),
  unknownUser: t('socialFavorite.unknownUser'),
  target: t('socialFavorite.target'),
  folder: t('socialFavorite.folder'),
  defaultFolder: t('socialFavorite.defaultFolder'),
  remark: t('socialFavorite.remark'),
  noData: t('socialFavorite.noData'),
  action: t('socialFavorite.action'),
  delete: t('socialFavorite.delete'),
  confirmDelete: t('socialFavorite.confirmDelete'),
  successDelete: t('socialFavorite.successDelete')
}))

const queryRef = ref<FormInstance>()
const favoriteList = ref<SocialFavoriteVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<Array<string | number>>([])
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<[string, string]>()
const userDrawerVisible = ref(false)
const selectedUserId = ref<string | number>()

const queryParams = ref<SocialFavoriteQuery>({
  pageNum: 1,
  pageSize: 10,
  targetType: undefined,
  targetId: undefined,
  userId: undefined,
  folderId: undefined
})

const targetTypeOptions = computed(() => [
  { label: t('socialFavorite.targetImage'), value: 'image' },
  { label: t('socialFavorite.targetAlbum'), value: 'album' },
  { label: t('socialFavorite.targetArticle'), value: 'article' },
  { label: t('socialFavorite.targetVideo'), value: 'video' }
])

function getTargetTypeLabel(value?: string) {
  return targetTypeOptions.value.find((item) => item.value === value)?.label || value || '-'
}

function getList() {
  loading.value = true
  const params = proxy.addDateRange(queryParams.value, dateRange.value)
  listSocialFavorite(params)
    .then((response: any) => {
      favoriteList.value = response.rows
      total.value = response.total
    })
    .finally(() => {
      loading.value = false
    })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  dateRange.value = undefined
  queryRef.value?.resetFields()
  handleQuery()
}

function handleSelectionChange(selection: SocialFavoriteVO[]) {
  ids.value = selection.map((item) => item.favoriteId)
  multiple.value = !selection.length
}

function openUserDrawer(userId: string | number) {
  selectedUserId.value = userId
  userDrawerVisible.value = true
}

function handleDelete(row?: SocialFavoriteVO) {
  const favoriteIds = row ? [row.favoriteId] : ids.value
  proxy.$modal
    .confirm(TEXT.value.confirmDelete)
    .then(() => delSocialFavorite(favoriteIds))
    .then(() => {
      getList()
      proxy.$modal.msgSuccess(TEXT.value.successDelete)
    })
    .catch(() => {})
}

function handleExport() {
  proxy.download('social/favorite/export', { ...queryParams.value }, `favorite_${new Date().getTime()}.xlsx`)
}

getList()
</script>

<style scoped lang="scss">
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

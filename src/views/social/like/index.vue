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
          <el-button v-hasPermi="['social:like:remove']" :disabled="multiple" type="danger" plain icon="Delete" @click="handleDelete()">
            {{ TEXT.batchDelete }}
          </el-button>
          <el-button v-hasPermi="['social:like:export']" plain icon="Download" @click="handleExport">
            {{ TEXT.export }}
          </el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <el-table v-loading="loading" :data="likeList" class="social-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column :label="TEXT.userId" min-width="140" align="center">
          <template #default="{ row }">
            <el-link type="primary" @click="openUserDrawer(row.userId)">{{ row.userId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.target" min-width="240">
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
        <el-table-column :label="TEXT.likeId" prop="likeId" width="120" align="center" />
        <el-table-column :label="TEXT.createTime" prop="createTime" width="180" align="center" />
        <el-table-column :label="TEXT.action" width="110" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:like:remove']" link type="danger" @click="handleDelete(row)">{{ TEXT.delete }}</el-button>
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
import { delSocialLike, listSocialLike } from '@/api/social/like'
import type { SocialLikeQuery, SocialLikeVO } from '@/api/social/like/types'
import UserStatsDrawer from '../components/UserStatsDrawer.vue'

const { proxy } = getCurrentInstance() as any
const { t } = useI18n()

const TEXT = computed(() => ({
  tableTitle: t('socialLike.tableTitle'),
  records: t('socialLike.records'),
  targetType: t('socialLike.targetType'),
  targetTypePlaceholder: t('socialLike.targetTypePlaceholder'),
  targetId: t('socialLike.targetId'),
  targetIdPlaceholder: t('socialLike.targetIdPlaceholder'),
  userId: t('socialLike.userId'),
  userIdPlaceholder: t('socialLike.userIdPlaceholder'),
  createTime: t('socialLike.createTime'),
  startDate: t('socialLike.startDate'),
  endDate: t('socialLike.endDate'),
  search: t('socialLike.search'),
  reset: t('socialLike.reset'),
  batchDelete: t('socialLike.batchDelete'),
  export: t('socialLike.export'),
  user: t('socialLike.user'),
  unknownUser: t('socialLike.unknownUser'),
  target: t('socialLike.target'),
  likeId: t('socialLike.likeId'),
  action: t('socialLike.action'),
  delete: t('socialLike.delete'),
  confirmDelete: t('socialLike.confirmDelete'),
  successDelete: t('socialLike.successDelete')
}))

const queryRef = ref<FormInstance>()
const likeList = ref<SocialLikeVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<Array<string | number>>([])
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<[string, string]>()
const userDrawerVisible = ref(false)
const selectedUserId = ref<string | number>()

const queryParams = ref<SocialLikeQuery>({
  pageNum: 1,
  pageSize: 10,
  targetType: undefined,
  targetId: undefined,
  userId: undefined
})

const targetTypeOptions = computed(() => [
  { label: t('socialLike.targetImage'), value: 'image' },
  { label: t('socialLike.targetAlbum'), value: 'album' },
  { label: t('socialLike.targetArticle'), value: 'article' },
  { label: t('socialLike.targetVideo'), value: 'video' },
  { label: t('socialLike.targetComment'), value: 'comment' }
])

function getTargetTypeLabel(value?: string) {
  return targetTypeOptions.value.find((item) => item.value === value)?.label || value || '-'
}

function getList() {
  loading.value = true
  const params = proxy.addDateRange(queryParams.value, dateRange.value)
  listSocialLike(params)
    .then((response: any) => {
      likeList.value = response.rows
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

function handleSelectionChange(selection: SocialLikeVO[]) {
  ids.value = selection.map((item) => item.likeId)
  multiple.value = !selection.length
}

function openUserDrawer(userId: string | number) {
  selectedUserId.value = userId
  userDrawerVisible.value = true
}

function handleDelete(row?: SocialLikeVO) {
  const likeIds = row ? [row.likeId] : ids.value
  proxy.$modal
    .confirm(TEXT.value.confirmDelete)
    .then(() => delSocialLike(likeIds))
    .then(() => {
      getList()
      proxy.$modal.msgSuccess(TEXT.value.successDelete)
    })
    .catch(() => {})
}

function handleExport() {
  proxy.download('social/like/export', { ...queryParams.value }, `like_${new Date().getTime()}.xlsx`)
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

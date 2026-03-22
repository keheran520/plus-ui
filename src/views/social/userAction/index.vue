<template>
  <div class="social-manage-page">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="用户ID" prop="userId">
            <el-input v-model="queryParams.userId" clearable placeholder="请输入用户ID" class="field-sm" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="行为类型" prop="actionType">
            <el-select v-model="queryParams.actionType" clearable placeholder="请选择行为类型" class="field-sm">
              <el-option label="点赞" value="like" />
              <el-option label="收藏" value="favorite" />
              <el-option label="评论" value="comment" />
              <el-option label="转发" value="share" />
              <el-option label="浏览" value="view" />
            </el-select>
          </el-form-item>
          <el-form-item label="内容类型" prop="targetType">
            <el-select v-model="queryParams.targetType" clearable placeholder="请选择内容类型" class="field-sm">
              <el-option label="图片" value="image" />
              <el-option label="相册" value="album" />
              <el-option label="文章" value="article" />
              <el-option label="视频" value="video" />
            </el-select>
          </el-form-item>
          <el-form-item label="内容ID" prop="targetId">
            <el-input v-model="queryParams.targetId" clearable placeholder="请输入内容ID" class="field-sm" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="field-date"
            />
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
          <span class="title-text">用户行为</span>
          <span class="title-meta">{{ total }} 条记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['social:userAction:remove']" :disabled="multiple" type="danger" plain icon="Delete" @click="handleDelete()">
            批量删除
          </el-button>
          <el-button v-hasPermi="['social:userAction:export']" plain icon="Download" @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <el-table v-loading="loading" :data="actionList" class="social-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="行为ID" prop="actionId" width="110" align="center" />
        <el-table-column label="用户ID" width="120" align="center">
          <template #default="{ row }">
            <el-link type="primary" @click="showUserDetail(row.userId)">{{ row.userId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="行为类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getActionTypeType(row.actionType)" effect="light" round>{{ getActionTypeLabel(row.actionType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="内容类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" round>{{ getTargetTypeLabel(row.targetType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="内容ID" prop="targetId" width="120" align="center" />
        <el-table-column label="内容标题" prop="targetTitle" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.targetTitle || '暂无标题' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="行为值" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.actionValue > 0 ? 'success' : row.actionValue < 0 ? 'danger' : 'info'" effect="light" round>
              {{ row.actionValue > 0 ? `+${row.actionValue}` : row.actionValue }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
        <el-table-column label="操作" width="110" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:userAction:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <UserStatsDrawer v-model:visible="userDrawerVisible" :user-id="selectedUserId" />
  </div>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus'
import { delSocialUserAction, listSocialUserAction } from '@/api/social/userAction'
import type { SocialUserActionQuery, SocialUserActionVO } from '@/api/social/userAction/types'
import UserStatsDrawer from '../components/UserStatsDrawer.vue'

const { proxy } = getCurrentInstance() as any

const queryRef = ref<FormInstance>()
const actionList = ref<SocialUserActionVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<Array<string | number>>([])
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<[string, string]>()
const userDrawerVisible = ref(false)
const selectedUserId = ref<string | number>(0)

const queryParams = ref<SocialUserActionQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  actionType: undefined,
  targetType: undefined,
  targetId: undefined
})

function getActionTypeLabel(value?: string) {
  if (value === 'like') return '点赞'
  if (value === 'favorite') return '收藏'
  if (value === 'comment') return '评论'
  if (value === 'share') return '转发'
  if (value === 'view') return '浏览'
  return value || '未知'
}

function getActionTypeType(value?: string) {
  if (value === 'like') return 'danger'
  if (value === 'favorite') return 'warning'
  if (value === 'comment') return 'primary'
  if (value === 'share') return 'success'
  return 'info'
}

function getTargetTypeLabel(value?: string) {
  if (value === 'image') return '图片'
  if (value === 'album') return '相册'
  if (value === 'article') return '文章'
  if (value === 'video') return '视频'
  return value || '未知'
}

function getList() {
  loading.value = true
  const params = proxy.addDateRange(queryParams.value, dateRange.value)
  listSocialUserAction(params)
    .then((response: any) => {
      actionList.value = response.rows
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

function handleSelectionChange(selection: SocialUserActionVO[]) {
  ids.value = selection.map((item) => item.actionId)
  multiple.value = !selection.length
}

function showUserDetail(userId: string | number) {
  selectedUserId.value = userId
  userDrawerVisible.value = true
}

function handleDelete(row?: SocialUserActionVO) {
  const actionIds = row ? [row.actionId] : ids.value
  proxy.$modal
    .confirm('确认删除选中的用户行为记录吗？')
    .then(() => delSocialUserAction(actionIds))
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

function handleExport() {
  proxy.download('social/userAction/export', { ...queryParams.value }, `userAction_${new Date().getTime()}.xlsx`)
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
  width: 150px;
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
</style>

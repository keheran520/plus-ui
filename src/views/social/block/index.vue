<template>
  <div class="social-manage-page">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="屏蔽者ID" prop="userId">
            <el-input v-model="queryParams.userId" clearable placeholder="请输入屏蔽者ID" class="field-sm" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="被屏蔽者ID" prop="blockedUserId">
            <el-input v-model="queryParams.blockedUserId" clearable placeholder="请输入被屏蔽者ID" class="field-sm" @keyup.enter="handleQuery" />
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
          <span class="title-text">拉黑记录</span>
          <span class="title-meta">{{ total }} 条记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['social:block:remove']" :disabled="multiple" type="danger" plain icon="Delete" @click="handleDelete()">
            批量删除
          </el-button>
          <el-button v-hasPermi="['social:block:export']" plain icon="Download" @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <el-table v-loading="loading" :data="blockList" class="social-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="记录ID" prop="blockId" width="120" align="center" />
        <el-table-column label="屏蔽者ID" width="140" align="center">
          <template #default="{ row }">
            <el-link type="primary" @click="openUserDrawer(row.userId)">{{ row.userId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="被屏蔽者ID" width="140" align="center">
          <template #default="{ row }">
            <el-link type="primary" @click="openUserDrawer(row.blockedUserId)">{{ row.blockedUserId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="屏蔽原因" prop="blockReason" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.blockReason || '暂无' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
        <el-table-column label="操作" width="110" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:block:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
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
import { delSocialBlock, listSocialBlock } from '@/api/social/block'
import type { SocialBlockQuery, SocialBlockVO } from '@/api/social/block/types'
import UserStatsDrawer from '../components/UserStatsDrawer.vue'

const { proxy } = getCurrentInstance() as any

const queryRef = ref<FormInstance>()
const blockList = ref<SocialBlockVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<Array<string | number>>([])
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<[string, string]>()
const userDrawerVisible = ref(false)
const selectedUserId = ref<string | number>()

const queryParams = ref<SocialBlockQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  blockedUserId: undefined
})

function getList() {
  loading.value = true
  const params = proxy.addDateRange(queryParams.value, dateRange.value)
  listSocialBlock(params)
    .then((response: any) => {
      blockList.value = response.rows
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

function handleSelectionChange(selection: SocialBlockVO[]) {
  ids.value = selection.map((item) => item.blockId)
  multiple.value = !selection.length
}

function openUserDrawer(userId: string | number) {
  selectedUserId.value = userId
  userDrawerVisible.value = true
}

function handleDelete(row?: SocialBlockVO) {
  const blockIds = row ? [row.blockId] : ids.value
  proxy.$modal
    .confirm('确认删除选中的拉黑记录吗？')
    .then(() => delSocialBlock(blockIds))
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

function handleExport() {
  proxy.download('social/block/export', { ...queryParams.value }, `block_${new Date().getTime()}.xlsx`)
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

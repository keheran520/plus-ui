<template>
  <div class="social-manage-page">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="关注者ID" prop="userId">
            <el-input v-model="queryParams.userId" class="field-sm" clearable placeholder="请输入关注者ID" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="被关注者ID" prop="followedUserId">
            <el-input v-model="queryParams.followedUserId" class="field-sm" clearable placeholder="请输入被关注者ID" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="关注类型" prop="followType">
            <el-select v-model="queryParams.followType" class="field-sm" clearable placeholder="请选择关注类型">
              <el-option v-for="item in social_follow_type" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="互关状态" prop="isMutual">
            <el-select v-model="queryParams.isMutual" class="field-sm" clearable placeholder="请选择互关状态">
              <el-option label="单向" value="0" />
              <el-option label="互关" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="来源" prop="followSource">
            <el-select v-model="queryParams.followSource" class="field-sm" clearable placeholder="请选择来源">
              <el-option label="搜索" value="search" />
              <el-option label="推荐" value="recommend" />
              <el-option label="主页" value="profile" />
              <el-option label="内容页" value="content" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              class="field-date"
              end-placeholder="结束日期"
              range-separator="-"
              start-placeholder="开始日期"
              type="daterange"
              value-format="YYYY-MM-DD"
            />
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
          <span class="title-text">关注关系</span>
          <span class="title-meta">{{ total }} 条记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['social:follow:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()"
            >批量删除</el-button
          >
          <el-button v-hasPermi="['social:follow:export']" icon="Download" plain @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <el-table v-loading="loading" :data="followList" class="social-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="48" />
        <el-table-column align="center" label="关注ID" prop="followId" width="100" />
        <el-table-column align="center" label="关注者ID" width="130">
          <template #default="{ row }">
            <el-link type="primary" @click="openUserDrawer(row.userId)">{{ row.userId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" label="被关注者ID" width="130">
          <template #default="{ row }">
            <el-link type="primary" @click="openUserDrawer(row.followedUserId)">{{ row.followedUserId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" label="关注类型" width="120">
          <template #default="{ row }">
            <dict-tag :options="social_follow_type" :value="row.followType" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="互关状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.isMutual === '1' ? 'danger' : 'info'" effect="light" round>{{ row.isMutual === '1' ? '互关' : '单向' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="来源" width="110">
          <template #default="{ row }">
            <el-tag effect="plain" round>{{ getSourceLabel(row.followSource) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="180" prop="remark" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.remark || '暂无' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
        <el-table-column align="center" fixed="right" label="操作" width="110">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:follow:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <UserStatsDrawer v-model:visible="userDrawerVisible" :user-id="selectedUserId" />
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, ref, toRefs } from 'vue';
import type { FormInstance } from 'element-plus';
import { delSocialFollow, listSocialFollow } from '@/api/social/follow';
import type { SocialFollowQuery, SocialFollowVO } from '@/api/social/follow/types';
import UserStatsDrawer from '../components/UserStatsDrawer.vue';

const { proxy } = getCurrentInstance() as any;
const { social_follow_type } = toRefs<any>(proxy?.useDict('social_follow_type'));

const queryRef = ref<FormInstance>();
const followList = ref<SocialFollowVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[string, string]>();
const userDrawerVisible = ref(false);
const selectedUserId = ref<string | number>();

const queryParams = ref<SocialFollowQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  followedUserId: undefined,
  followType: undefined,
  isMutual: undefined,
  followSource: undefined
});

function getSourceLabel(value?: string) {
  if (value === 'search') return '搜索';
  if (value === 'recommend') return '推荐';
  if (value === 'profile') return '主页';
  if (value === 'content') return '内容页';
  return value || '未知';
}

function getList() {
  loading.value = true;
  const params = proxy.addDateRange(queryParams.value, dateRange.value);
  listSocialFollow(params)
    .then((response: any) => {
      followList.value = response.rows;
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

function handleSelectionChange(selection: SocialFollowVO[]) {
  ids.value = selection.map((item) => item.followId);
  multiple.value = !selection.length;
}

function openUserDrawer(userId: string | number) {
  selectedUserId.value = userId;
  userDrawerVisible.value = true;
}

function handleDelete(row?: SocialFollowVO) {
  const followIds = row ? [row.followId] : ids.value;
  proxy.$modal
    .confirm('确认删除选中的关注记录吗？')
    .then(() => delSocialFollow(followIds))
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

function handleExport() {
  proxy.download('social/follow/export', { ...queryParams.value }, `follow_${new Date().getTime()}.xlsx`);
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

@media (max-width: 768px) {
  .social-manage-page {
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
}
</style>

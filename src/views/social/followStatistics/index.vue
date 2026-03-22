<template>
  <div class="follow-page">
    <section class="summary-grid">
      <div v-for="card in summaryCards" :key="card.key" :class="`summary-card--${card.theme}`" class="summary-card">
        <div class="summary-card__head">
          <div class="summary-card__icon">
            <el-icon :size="18">
              <component :is="card.icon" />
            </el-icon>
          </div>
          <div class="summary-card__label">{{ card.label }}</div>
        </div>
        <div class="summary-card__value">{{ formatCount(card.value) }}</div>
        <div class="summary-card__hint">{{ card.hint }}</div>
      </div>
    </section>

    <section class="top-grid">
      <article class="panel">
        <header class="panel__header">
          <h2 class="panel__title">{{ TEXT.sampleChartTitle }}</h2>
          <div class="legend">
            <span><i class="legend__dot legend__dot--blue"></i>{{ TEXT.legendFollower }}</span>
            <span><i class="legend__dot legend__dot--orange"></i>{{ TEXT.legendSpecial }}</span>
            <span><i class="legend__dot legend__dot--green"></i>{{ TEXT.legendMutual }}</span>
          </div>
        </header>
        <div ref="sampleChartRef" class="chart"></div>
      </article>

      <article class="panel">
        <header class="panel__header">
          <h2 class="panel__title">{{ TEXT.rankTitle }}</h2>
          <el-radio-group v-model="hotUserSortBy" size="small" @change="loadHotUsers">
            <el-radio-button value="follower">{{ TEXT.rankFollower }}</el-radio-button>
            <el-radio-button value="following">{{ TEXT.rankFollowing }}</el-radio-button>
            <el-radio-button value="friend">{{ TEXT.rankFriend }}</el-radio-button>
          </el-radio-group>
        </header>

        <div v-loading="hotUsersLoading" class="rank-list">
          <button v-for="(item, index) in hotUsers" :key="item.statId" class="rank-item" type="button" @click="handleViewDetail(item)">
            <span class="rank-item__index">{{ index + 1 }}</span>
            <div class="rank-item__main">
              <div class="rank-item__name">{{ item.nickName || item.userName || `${TEXT.userPrefix}${item.userId}` }}</div>
              <div class="rank-item__meta">{{ `${TEXT.idPrefix}${item.userId}` }}</div>
            </div>
            <div class="rank-item__value">{{ formatCount(getRankScore(item)) }}</div>
          </button>
        </div>
      </article>
    </section>

    <section class="panel">
      <header class="panel__header panel__header--filter">
        <div class="filter-actions"></div>
      </header>

      <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
        <el-form v-show="showSearch" :model="queryParams" class="query-form" inline>
          <el-form-item :label="TEXT.userId">
            <el-input v-model="queryParams.userId" :placeholder="TEXT.userIdPlaceholder" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="TEXT.following">
            <div class="range-group">
              <el-input-number v-model="queryParams.minFollowingCount" :min="0" controls-position="right" />
              <span>-</span>
              <el-input-number v-model="queryParams.maxFollowingCount" :min="0" controls-position="right" />
            </div>
          </el-form-item>
          <el-form-item :label="TEXT.follower">
            <div class="range-group">
              <el-input-number v-model="queryParams.minFollowerCount" :min="0" controls-position="right" />
              <span>-</span>
              <el-input-number v-model="queryParams.maxFollowerCount" :min="0" controls-position="right" />
            </div>
          </el-form-item>
          <el-form-item :label="TEXT.friend">
            <div class="range-group">
              <el-input-number v-model="queryParams.minFriendCount" :min="0" controls-position="right" />
              <span>-</span>
              <el-input-number v-model="queryParams.maxFriendCount" :min="0" controls-position="right" />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button icon="Search" type="primary" @click="handleQuery">{{ TEXT.search }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{ TEXT.reset }}</el-button>
          </el-form-item>
        </el-form>
      </transition>
    </section>

    <section class="panel">
      <div class="list-toolbar">
        <div class="list-toolbar__left">
          <el-button
            v-hasPermi="['social:followStatistics:refresh']"
            :disabled="multiple"
            icon="Refresh"
            plain
            type="primary"
            @click="handleRefreshSelected"
          >
            {{ TEXT.refreshSelected }}
          </el-button>
          <el-button v-hasPermi="['social:followStatistics:export']" icon="Download" plain @click="handleExport">
            {{ TEXT.export }}
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="statisticsList"
        :header-cell-style="tableHeaderStyle"
        border
        class="data-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" type="selection" width="50" />
        <el-table-column :label="TEXT.userLabel" min-width="200">
          <template #default="{ row }">
            <div class="table-user">
              <div class="table-user__name">{{ row.nickName || row.userName || `${TEXT.userPrefix}${row.userId}` }}</div>
              <div class="table-user__meta">{{ `${TEXT.idPrefix}${row.userId}` }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="TEXT.following" min-width="110" prop="followingCount" />
        <el-table-column :label="TEXT.follower" min-width="110" prop="followerCount" />
        <el-table-column :label="TEXT.friend" min-width="110" prop="friendCount" />
        <el-table-column :label="TEXT.specialFollowing" min-width="120" prop="specialFollowingCount" />
        <el-table-column :label="TEXT.mutualRate" min-width="110">
          <template #default="{ row }">{{ formatPercent(calculateMutualRate(row)) }}</template>
        </el-table-column>
        <el-table-column :label="TEXT.updateTime" min-width="170" prop="updateTime" />
        <el-table-column :label="TEXT.action" fixed="right" width="130">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:followStatistics:refresh']" icon="Refresh" link type="primary" @click="handleRefresh(row)">
              {{ TEXT.refresh }}
            </el-button>
            <el-button v-hasPermi="['social:followStatistics:query']" link @click="handleViewDetail(row)">
              {{ TEXT.detail }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="detailDrawerVisible" :title="TEXT.detailTitle" size="520px">
      <div v-loading="detailLoading" class="detail-box">
        <div class="detail-hero">
          <div class="detail-name">{{ currentUser.nickName || currentUser.userName || `${TEXT.userPrefix}${currentUser.userId || ''}` }}</div>
          <div class="detail-id">{{ `${TEXT.idPrefix}${currentUser.userId || '-'}` }}</div>
        </div>
        <el-descriptions :column="1" border class="detail-descriptions">
          <el-descriptions-item :label="TEXT.following">{{ formatCount(currentUser.followingCount) }}</el-descriptions-item>
          <el-descriptions-item :label="TEXT.follower">{{ formatCount(currentUser.followerCount) }}</el-descriptions-item>
          <el-descriptions-item :label="TEXT.friend">{{ formatCount(currentUser.friendCount) }}</el-descriptions-item>
          <el-descriptions-item :label="TEXT.specialFollowing">{{ formatCount(currentUser.specialFollowingCount) }}</el-descriptions-item>
          <el-descriptions-item :label="TEXT.mutualRate">{{ formatPercent(calculateMutualRate(currentUser)) }}</el-descriptions-item>
          <el-descriptions-item :label="TEXT.tenantId">{{ currentUser.tenantId || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="TEXT.createTime">{{ formatDateTime(currentUser.createTime) }}</el-descriptions-item>
          <el-descriptions-item :label="TEXT.updateTime">{{ formatDateTime(currentUser.updateTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Connection, Star, User, UserFilled } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import {
  batchRefreshStatistics,
  getOverview,
  getPanelHotUsers,
  getSocialFollowStatisticsPanel,
  listSocialFollowStatisticsPanel,
  refreshStatistics
} from '@/api/social/followStatistics';
import type { SocialFollowStatisticsPanelVO, SocialFollowStatisticsQuery } from '@/api/social/followStatistics/types';

const { t } = useI18n();
const TEXT = {
  get totalUsers() {
    return t('followStatistics.totalUsers');
  },
  get totalFollowing() {
    return t('followStatistics.totalFollowing');
  },
  get totalFollower() {
    return t('followStatistics.totalFollower');
  },
  get totalFriend() {
    return t('followStatistics.totalFriend');
  },
  get summaryUsersHint() {
    return t('followStatistics.summaryUsersHint');
  },
  get summaryFollowingHint() {
    return t('followStatistics.summaryFollowingHint');
  },
  get summaryFollowerHint() {
    return t('followStatistics.summaryFollowerHint');
  },
  get summaryFriendHint() {
    return t('followStatistics.summaryFriendHint');
  },
  get sampleChartTitle() {
    return t('followStatistics.sampleChartTitle');
  },
  get legendFollower() {
    return t('followStatistics.legendFollower');
  },
  get legendSpecial() {
    return t('followStatistics.legendSpecial');
  },
  get legendMutual() {
    return t('followStatistics.legendMutual');
  },
  get rankTitle() {
    return t('followStatistics.rankTitle');
  },
  get rankFollower() {
    return t('followStatistics.rankFollower');
  },
  get rankFollowing() {
    return t('followStatistics.rankFollowing');
  },
  get rankFriend() {
    return t('followStatistics.rankFriend');
  },
  get filterTitle() {
    return t('followStatistics.filterTitle');
  },
  get refreshSelected() {
    return t('followStatistics.refreshSelected');
  },
  get export() {
    return t('followStatistics.export');
  },
  get userId() {
    return t('followStatistics.userId');
  },
  get userIdPlaceholder() {
    return t('followStatistics.userIdPlaceholder');
  },
  get following() {
    return t('followStatistics.following');
  },
  get follower() {
    return t('followStatistics.follower');
  },
  get friend() {
    return t('followStatistics.friend');
  },
  get search() {
    return t('followStatistics.search');
  },
  get reset() {
    return t('followStatistics.reset');
  },
  get tableTitle() {
    return t('followStatistics.tableTitle');
  },
  get userLabel() {
    return t('followStatistics.userLabel');
  },
  get specialFollowing() {
    return t('followStatistics.specialFollowing');
  },
  get mutualRate() {
    return t('followStatistics.mutualRate');
  },
  get updateTime() {
    return t('followStatistics.updateTime');
  },
  get action() {
    return t('followStatistics.action');
  },
  get refresh() {
    return t('followStatistics.refresh');
  },
  get detail() {
    return t('followStatistics.detail');
  },
  get detailTitle() {
    return t('followStatistics.detailTitle');
  },
  get tenantId() {
    return t('followStatistics.tenantId');
  },
  get createTime() {
    return t('followStatistics.createTime');
  },
  get userPrefix() {
    return t('followStatistics.userPrefix');
  },
  get idPrefix() {
    return t('followStatistics.idPrefix');
  }
} as const;

interface OverviewData {
  totalUsers: number;
  totalFollowing: number;
  totalFollower: number;
  totalFriend: number;
}

type SortField = 'follower' | 'following' | 'friend';

const { proxy } = getCurrentInstance() as any;
const sampleChartRef = ref<HTMLDivElement>();

const statisticsList = ref<SocialFollowStatisticsPanelVO[]>([]);
const hotUsers = ref<SocialFollowStatisticsPanelVO[]>([]);
const currentUser = ref<Partial<SocialFollowStatisticsPanelVO>>({});
const loading = ref(false);
const hotUsersLoading = ref(false);
const detailLoading = ref(false);
const detailDrawerVisible = ref(false);
const showSearch = ref(true);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const hotUserSortBy = ref<SortField>('follower');
const overview = ref<OverviewData>({
  totalUsers: 0,
  totalFollowing: 0,
  totalFollower: 0,
  totalFriend: 0
});

const queryParams = ref<SocialFollowStatisticsQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  minFollowingCount: undefined,
  maxFollowingCount: undefined,
  minFollowerCount: undefined,
  maxFollowerCount: undefined,
  minFriendCount: undefined,
  maxFriendCount: undefined
});

const multiple = computed(() => ids.value.length === 0);
const tableHeaderStyle = { background: '#f8fafc', color: '#475569' };
const summaryCards = computed(() => [
  { key: 'users', label: TEXT.totalUsers, value: overview.value.totalUsers, hint: TEXT.summaryUsersHint, theme: 'blue', icon: User },
  {
    key: 'following',
    label: TEXT.totalFollowing,
    value: overview.value.totalFollowing,
    hint: TEXT.summaryFollowingHint,
    theme: 'orange',
    icon: Star
  },
  {
    key: 'follower',
    label: TEXT.totalFollower,
    value: overview.value.totalFollower,
    hint: TEXT.summaryFollowerHint,
    theme: 'green',
    icon: UserFilled
  },
  { key: 'friend', label: TEXT.totalFriend, value: overview.value.totalFriend, hint: TEXT.summaryFriendHint, theme: 'violet', icon: Connection }
]);

let sampleChart: echarts.ECharts | null = null;

function formatCount(value?: number | string | null) {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue.toLocaleString('zh-CN') : '0';
}

function formatPercent(value?: number | string | null) {
  const numericValue = Number(value ?? 0);
  return `${Math.max(0, Math.min(100, Math.round(numericValue)))}%`;
}

function formatDateTime(value?: string | null) {
  return value || '-';
}

function calculateMutualRate(row: Partial<SocialFollowStatisticsPanelVO>) {
  const following = Number(row.followingCount || 0);
  const friend = Number(row.friendCount || 0);
  return following ? (friend / following) * 100 : 0;
}

function getRankScore(row: Partial<SocialFollowStatisticsPanelVO>) {
  if (hotUserSortBy.value === 'following') return Number(row.followingCount || 0);
  if (hotUserSortBy.value === 'friend') return Number(row.friendCount || 0);
  return Number(row.followerCount || 0);
}

function ensureChart() {
  if (!sampleChartRef.value) return null;
  sampleChart = sampleChart ?? echarts.init(sampleChartRef.value);
  return sampleChart;
}

function renderChart() {
  const chart = ensureChart();
  if (!chart) return;

  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const item = params.data.raw;
        return [
          item.nickName || item.userName || `${TEXT.userPrefix}${item.userId}`,
          `${TEXT.following}\uff1a${formatCount(item.followingCount)}`,
          `${TEXT.follower}\uff1a${formatCount(item.followerCount)}`,
          `${TEXT.friend}\uff1a${formatCount(item.friendCount)}`,
          `${TEXT.specialFollowing}\uff1a${formatCount(item.specialFollowingCount)}`,
          `${TEXT.mutualRate}\uff1a${formatPercent(calculateMutualRate(item))}`
        ].join('<br/>');
      }
    },
    grid: { left: 64, right: 28, top: 24, bottom: 52, containLabel: true },
    xAxis: {
      type: 'value',
      name: TEXT.following,
      nameGap: 28,
      nameLocation: 'middle',
      splitLine: { lineStyle: { color: '#e5e7eb' } }
    },
    yAxis: {
      type: 'value',
      name: TEXT.follower,
      nameGap: 42,
      nameLocation: 'middle',
      splitLine: { lineStyle: { color: '#eef2f7' } }
    },
    series: [
      {
        type: 'scatter',
        data: statisticsList.value.map((item) => ({
          value: [Number(item.followingCount || 0), Number(item.followerCount || 0), Math.max(Number(item.friendCount || 0), 1)],
          raw: item,
          itemStyle: {
            color: Number(item.specialFollowingCount || 0) > 0 ? '#f97316' : calculateMutualRate(item) >= 60 ? '#16a34a' : '#3b82f6'
          }
        })),
        symbolSize: (value: number[]) => Math.max(12, Math.min(34, value[2] * 1.2 + 10))
      }
    ]
  });
}

async function loadOverview() {
  const response: any = await getOverview();
  overview.value = {
    totalUsers: Number(response?.data?.totalUsers || 0),
    totalFollowing: Number(response?.data?.totalFollowing || 0),
    totalFollower: Number(response?.data?.totalFollower || 0),
    totalFriend: Number(response?.data?.totalFriend || 0)
  };
}

async function loadHotUsers() {
  hotUsersLoading.value = true;
  try {
    const response: any = await getPanelHotUsers(hotUserSortBy.value, { pageNum: 1, pageSize: 8 });
    hotUsers.value = response?.rows || [];
  } finally {
    hotUsersLoading.value = false;
  }
}

async function getList() {
  loading.value = true;
  try {
    const response: any = await listSocialFollowStatisticsPanel(queryParams.value);
    statisticsList.value = response?.rows || [];
    total.value = response?.total || 0;
    ids.value = ids.value.filter((id) => statisticsList.value.some((item) => item.userId === id));
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    userId: undefined,
    minFollowingCount: undefined,
    maxFollowingCount: undefined,
    minFollowerCount: undefined,
    maxFollowerCount: undefined,
    minFriendCount: undefined,
    maxFriendCount: undefined
  };
  getList();
}

function handleSelectionChange(selection: SocialFollowStatisticsPanelVO[]) {
  ids.value = selection.map((item) => item.userId);
}

async function handleViewDetail(row: SocialFollowStatisticsPanelVO) {
  detailDrawerVisible.value = true;
  detailLoading.value = true;
  currentUser.value = { ...row };
  try {
    const response: any = await getSocialFollowStatisticsPanel(row.statId);
    currentUser.value = response?.data || row;
  } finally {
    detailLoading.value = false;
  }
}

async function handleRefresh(row: Partial<SocialFollowStatisticsPanelVO>) {
  if (!row.userId) return;
  try {
    await proxy?.$modal?.confirm(`\u786e\u8ba4\u5237\u65b0\u7528\u6237 ${row.userId} \u7684\u7edf\u8ba1\u5417\uff1f`);
    await refreshStatistics(row.userId);
    proxy?.$modal?.msgSuccess('\u5237\u65b0\u6210\u529f');
    await Promise.all([getList(), loadHotUsers(), loadOverview()]);
  } catch {
    // cancelled
  }
}

async function handleRefreshSelected() {
  if (!ids.value.length) {
    proxy?.$modal?.msgWarning('\u8bf7\u5148\u9009\u62e9\u6570\u636e');
    return;
  }
  try {
    await proxy?.$modal?.confirm(`\u786e\u8ba4\u5237\u65b0\u9009\u4e2d\u7684 ${ids.value.length} \u4e2a\u7528\u6237\u5417\uff1f`);
    await batchRefreshStatistics(ids.value as number[]);
    proxy?.$modal?.msgSuccess('\u5237\u65b0\u6210\u529f');
    await Promise.all([getList(), loadHotUsers(), loadOverview()]);
  } catch {
    // cancelled
  }
}

function handleExport() {
  proxy?.download('social/followStatistics/export', { ...queryParams.value }, `followStatistics_${Date.now()}.xlsx`);
}

function handleResize() {
  sampleChart?.resize();
}

watch(
  statisticsList,
  async () => {
    await nextTick();
    renderChart();
  },
  { deep: true }
);

onMounted(async () => {
  await Promise.all([loadOverview(), loadHotUsers(), getList()]);
  await nextTick();
  renderChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  sampleChart?.dispose();
});
</script>

<style lang="scss" scoped>
.follow-page {
  display: grid;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
}

.summary-grid,
.top-grid {
  display: grid;
  gap: 12px;
}

.summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.top-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.panel,
.summary-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.summary-card {
  padding: 16px;
}

.summary-card--blue {
  background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%);
}
.summary-card--orange {
  background: linear-gradient(180deg, #ffffff 0%, #fff7ed 100%);
}
.summary-card--green {
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
}
.summary-card--violet {
  background: linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%);
}

.summary-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-card__icon {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #475569;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.summary-card__label {
  color: #909399;
  font-size: 13px;
}

.summary-card__value {
  margin-top: 8px;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.summary-card__hint {
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

.panel {
  padding: 16px;
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel__header--filter {
  align-items: flex-start;
}

.panel__title {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.legend,
.filter-actions,
.list-toolbar__left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.legend {
  color: #606266;
  font-size: 12px;
}

.legend__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
}

.legend__dot--blue {
  background: #3b82f6;
}
.legend__dot--orange {
  background: #f97316;
}
.legend__dot--green {
  background: #16a34a;
}

.chart {
  height: 320px;
  margin-top: 12px;
}

.rank-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.rank-item {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  text-align: left;
  cursor: pointer;
}

.rank-item__index {
  color: #409eff;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.rank-item__name,
.table-user__name,
.detail-name {
  color: #303133;
  font-weight: 600;
}

.rank-item__meta,
.table-user__meta,
.detail-id {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.rank-item__value {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.query-form {
  margin-top: 12px;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.range-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.data-table {
  margin-top: 12px;
}

.table-user {
  display: grid;
  gap: 2px;
}

.detail-box {
  display: grid;
  gap: 12px;
}

.detail-hero {
  padding: 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
}

.detail-name {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
}

.detail-id {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.72);
}

.detail-descriptions {
  :deep(.el-descriptions__label) {
    width: 120px;
    color: #606266;
    background: #f8fafc;
  }

  :deep(.el-descriptions__content) {
    color: #303133;
    font-weight: 500;
  }
}

@media (max-width: 1200px) {
  .summary-grid,
  .top-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .follow-page {
    padding: 8px;
  }

  .panel__header,
  .panel__header--filter {
    flex-direction: column;
    align-items: flex-start;
  }

  .range-group {
    width: 100%;
  }

  .rank-item {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .rank-item__value {
    grid-column: 2;
  }
}
</style>

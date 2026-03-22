<template>
  <div class="stats-page">
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
          <h2 class="panel__title">互动趋势</h2>
          <el-radio-group v-model="trendTargetType" size="small" @change="loadTrendData">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="image">图片</el-radio-button>
            <el-radio-button value="album">相册</el-radio-button>
            <el-radio-button value="article">文章</el-radio-button>
            <el-radio-button value="video">视频</el-radio-button>
          </el-radio-group>
        </header>
        <div ref="trendChartRef" class="chart"></div>
      </article>

      <article class="panel">
        <header class="panel__header">
          <h2 class="panel__title">互动结构</h2>
          <div class="legend">
            <span><i class="legend__dot legend__dot--blue"></i>点赞</span>
            <span><i class="legend__dot legend__dot--orange"></i>收藏</span>
            <span><i class="legend__dot legend__dot--green"></i>评论</span>
            <span><i class="legend__dot legend__dot--violet"></i>转发</span>
          </div>
        </header>
        <div ref="mixChartRef" class="chart chart--small"></div>
      </article>
    </section>

    <section class="top-grid">
      <article class="panel">
        <header class="panel__header">
          <h2 class="panel__title">热度内容榜</h2>
          <el-select v-model="hotTargetType" clearable placeholder="全部类型" size="small" style="width: 120px" @change="loadHotContent">
            <el-option label="全部" value="" />
            <el-option label="图片" value="image" />
            <el-option label="相册" value="album" />
            <el-option label="文章" value="article" />
            <el-option label="视频" value="video" />
          </el-select>
        </header>

        <div v-loading="hotLoading" class="rank-list">
          <button v-for="(item, index) in hotContent" :key="`${item.targetType}-${item.targetId}`" class="rank-item" type="button">
            <span class="rank-item__index">{{ index + 1 }}</span>
            <div class="rank-item__main">
              <div class="rank-item__name">{{ getTargetTypeLabel(item.targetType) }} #{{ item.targetId }}</div>
              <div class="rank-item__meta">
                点赞 {{ formatCount(item.likeCount) }} / 收藏 {{ formatCount(item.favoriteCount) }} / 评论 {{ formatCount(item.commentCount) }}
              </div>
            </div>
            <div class="rank-item__value">{{ formatCount(item.score) }}</div>
          </button>
        </div>
      </article>

      <article class="panel">
        <header class="panel__header">
          <h2 class="panel__title">筛选条件</h2>
        </header>

        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <el-form v-show="showSearch" :model="queryParams" class="query-form" inline>
            <el-form-item label="内容类型">
              <el-select v-model="queryParams.targetType" clearable placeholder="请选择内容类型">
                <el-option label="图片" value="image" />
                <el-option label="相册" value="album" />
                <el-option label="文章" value="article" />
                <el-option label="视频" value="video" />
                <el-option label="评论" value="comment" />
              </el-select>
            </el-form-item>
            <el-form-item label="内容ID">
              <el-input v-model="queryParams.targetId" clearable placeholder="请输入内容ID" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </transition>
      </article>
    </section>

    <section class="panel">
      <div class="list-toolbar">
        <div class="list-toolbar__left">
          <el-button v-hasPermi="['social:statistics:edit']" type="success" plain icon="Refresh" @click="handleBatchRefresh">批量刷新</el-button>
          <el-button v-hasPermi="['social:statistics:export']" plain icon="Download" @click="handleExport">导出</el-button>
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
        <el-table-column label="内容类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" round>{{ getTargetTypeLabel(row.targetType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="内容ID" prop="targetId" width="120" align="center" />
        <el-table-column label="标题" min-width="220">
          <template #default="{ row }">
            <div class="table-main">
              <div class="table-main__name">{{ row.targetTitle || `${getTargetTypeLabel(row.targetType)} #${row.targetId}` }}</div>
              <div class="table-main__meta">热度分 {{ formatCount(calculateScore(row)) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="点赞" prop="likeCount" width="90" align="center" />
        <el-table-column label="收藏" prop="favoriteCount" width="90" align="center" />
        <el-table-column label="评论" prop="commentCount" width="90" align="center" />
        <el-table-column label="转发" prop="shareCount" width="90" align="center" />
        <el-table-column label="浏览" prop="viewCount" width="90" align="center" />
        <el-table-column label="更新时间" prop="updateTime" width="180" align="center" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:statistics:edit']" link type="primary" @click="handleRefresh(row)">刷新</el-button>
            <el-button v-hasPermi="['social:statistics:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChatDotRound, DataAnalysis, Share, Star, StarFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { batchRefreshStatistics, delSocialStatistics, getHotContent, getStatisticsOverview, getTrendData, listSocialStatistics, refreshStatistics } from '@/api/social/statistics'
import type { SocialStatisticsQuery, SocialStatisticsVO } from '@/api/social/statistics/types'

const { proxy } = getCurrentInstance() as any

const trendChartRef = ref<HTMLDivElement>()
const mixChartRef = ref<HTMLDivElement>()

const statisticsList = ref<any[]>([])
const hotContent = ref<any[]>([])
const loading = ref(false)
const hotLoading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const ids = ref<Array<string | number>>([])
const trendTargetType = ref('')
const hotTargetType = ref('')
const overview = ref({
  totalLikes: 0,
  totalFavorites: 0,
  totalComments: 0,
  totalShares: 0,
  totalViews: 0,
  todayLikes: 0,
  todayFavorites: 0,
  todayComments: 0,
  todayShares: 0,
  todayViews: 0
})
const trendData = ref<any[]>([])

const queryParams = ref<SocialStatisticsQuery>({
  pageNum: 1,
  pageSize: 10,
  targetType: undefined,
  targetId: undefined
})

const tableHeaderStyle = { background: '#f8fafc', color: '#475569' }

const summaryCards = computed(() => [
  { key: 'likes', label: '总点赞', value: overview.value.totalLikes, hint: `今日 +${formatCount(overview.value.todayLikes)}`, theme: 'blue', icon: StarFilled },
  { key: 'favorites', label: '总收藏', value: overview.value.totalFavorites, hint: `今日 +${formatCount(overview.value.todayFavorites)}`, theme: 'orange', icon: Star },
  { key: 'comments', label: '总评论', value: overview.value.totalComments, hint: `今日 +${formatCount(overview.value.todayComments)}`, theme: 'green', icon: ChatDotRound },
  { key: 'shares', label: '总转发', value: overview.value.totalShares, hint: `今日 +${formatCount(overview.value.todayShares)}`, theme: 'violet', icon: Share },
  { key: 'views', label: '总浏览', value: overview.value.totalViews, hint: `今日 +${formatCount(overview.value.todayViews)}`, theme: 'slate', icon: DataAnalysis }
])

let trendChart: echarts.ECharts | null = null
let mixChart: echarts.ECharts | null = null

function formatCount(value?: number | string | null) {
  const numericValue = Number(value ?? 0)
  return Number.isFinite(numericValue) ? numericValue.toLocaleString('zh-CN') : '0'
}

function getTargetTypeLabel(value?: string) {
  if (value === 'image') return '图片'
  if (value === 'album') return '相册'
  if (value === 'article') return '文章'
  if (value === 'video') return '视频'
  if (value === 'comment') return '评论'
  return value || '未知'
}

function calculateScore(row: Partial<SocialStatisticsVO>) {
  return Number(row.likeCount || 0) + Number(row.favoriteCount || 0) * 2 + Number(row.commentCount || 0) * 3 + Number(row.shareCount || 0) * 4
}

function ensureTrendChart() {
  if (!trendChartRef.value) return null
  trendChart = trendChart ?? echarts.init(trendChartRef.value)
  return trendChart
}

function ensureMixChart() {
  if (!mixChartRef.value) return null
  mixChart = mixChart ?? echarts.init(mixChartRef.value)
  return mixChart
}

function renderTrendChart() {
  const chart = ensureTrendChart()
  if (!chart) return
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 18, top: 28, bottom: 28, containLabel: true },
    xAxis: {
      type: 'category',
      data: trendData.value.map((item) => item.date),
      axisLine: { lineStyle: { color: '#cbd5e1' } }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#eef2f7' } }
    },
    series: [
      { name: '点赞', type: 'line', smooth: true, data: trendData.value.map((item) => item.likeCount), itemStyle: { color: '#2563eb' }, areaStyle: { color: 'rgba(37,99,235,.08)' } },
      { name: '收藏', type: 'line', smooth: true, data: trendData.value.map((item) => item.favoriteCount), itemStyle: { color: '#f97316' } },
      { name: '评论', type: 'line', smooth: true, data: trendData.value.map((item) => item.commentCount), itemStyle: { color: '#16a34a' } },
      { name: '转发', type: 'line', smooth: true, data: trendData.value.map((item) => item.shareCount), itemStyle: { color: '#7c3aed' } }
    ]
  })
}

function renderMixChart() {
  const chart = ensureMixChart()
  if (!chart) return
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['42%', '72%'],
        center: ['50%', '44%'],
        label: { formatter: '{b}\n{d}%' },
        data: [
          { name: '点赞', value: overview.value.totalLikes, itemStyle: { color: '#2563eb' } },
          { name: '收藏', value: overview.value.totalFavorites, itemStyle: { color: '#f97316' } },
          { name: '评论', value: overview.value.totalComments, itemStyle: { color: '#16a34a' } },
          { name: '转发', value: overview.value.totalShares, itemStyle: { color: '#7c3aed' } }
        ]
      }
    ]
  })
}

async function loadOverview() {
  const response: any = await getStatisticsOverview()
  overview.value = response?.data || overview.value
}

async function loadHotContent() {
  hotLoading.value = true
  try {
    const response: any = await getHotContent(hotTargetType.value || undefined, 8)
    hotContent.value = response?.data || response || []
  } finally {
    hotLoading.value = false
  }
}

async function loadTrendData() {
  const response: any = await getTrendData(trendTargetType.value || undefined, 7)
  trendData.value = response?.data || response || []
}

async function getList() {
  loading.value = true
  try {
    const response: any = await listSocialStatistics(queryParams.value)
    statisticsList.value = response?.rows || []
    total.value = response?.total || 0
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    targetType: undefined,
    targetId: undefined
  }
  getList()
}

function handleSelectionChange(selection: SocialStatisticsVO[]) {
  ids.value = selection.map((item) => item.statId)
}

async function handleRefresh(row: SocialStatisticsVO) {
  try {
    await proxy?.$modal?.confirm('确认刷新这条统计数据吗？')
    await refreshStatistics(row.targetType, row.targetId)
    proxy?.$modal?.msgSuccess('刷新成功')
    await Promise.all([getList(), loadOverview(), loadHotContent(), loadTrendData()])
  } catch {
    //
  }
}

async function handleBatchRefresh() {
  if (!queryParams.value.targetType) {
    proxy?.$modal?.msgWarning('请先选择内容类型')
    return
  }
  try {
    await proxy?.$modal?.confirm(`确认批量刷新 ${getTargetTypeLabel(queryParams.value.targetType)} 的统计吗？`)
    await batchRefreshStatistics(queryParams.value.targetType)
    proxy?.$modal?.msgSuccess('批量刷新成功')
    await Promise.all([getList(), loadOverview(), loadHotContent(), loadTrendData()])
  } catch {
    //
  }
}

async function handleDelete(row: SocialStatisticsVO) {
  try {
    await proxy?.$modal?.confirm('确认删除这条统计数据吗？')
    await delSocialStatistics(row.statId)
    proxy?.$modal?.msgSuccess('删除成功')
    await Promise.all([getList(), loadOverview(), loadHotContent(), loadTrendData()])
  } catch {
    //
  }
}

function handleExport() {
  proxy?.download('social/statistics/export', { ...queryParams.value }, `statistics_${Date.now()}.xlsx`)
}

function handleResize() {
  trendChart?.resize()
  mixChart?.resize()
}

watch(
  [trendData, overview],
  async () => {
    await nextTick()
    renderTrendChart()
    renderMixChart()
  },
  { deep: true }
)

onMounted(async () => {
  await Promise.all([loadOverview(), loadHotContent(), loadTrendData(), getList()])
  await nextTick()
  renderTrendChart()
  renderMixChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  mixChart?.dispose()
})
</script>

<style lang="scss" scoped>
.stats-page {
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
  grid-template-columns: repeat(5, minmax(0, 1fr));
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

.summary-card--slate {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
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

.panel__header,
.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel__title {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.legend,
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
  background: #2563eb;
}

.legend__dot--orange {
  background: #f97316;
}

.legend__dot--green {
  background: #16a34a;
}

.legend__dot--violet {
  background: #7c3aed;
}

.chart {
  height: 320px;
  margin-top: 12px;
}

.chart--small {
  height: 300px;
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
}

.rank-item__index {
  color: #409eff;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.rank-item__name,
.table-main__name {
  color: #303133;
  font-weight: 600;
}

.rank-item__meta,
.table-main__meta {
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

.data-table {
  margin-top: 12px;
}

.table-main {
  display: grid;
  gap: 2px;
}

@media (max-width: 1200px) {
  .summary-grid,
  .top-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-page {
    padding: 8px;
  }

  .panel__header,
  .list-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .rank-item {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .rank-item__value {
    grid-column: 2;
  }
}
</style>

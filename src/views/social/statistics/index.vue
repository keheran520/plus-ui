<template>
  <div class="p-2">
    <!-- 统计概览卡片 - 放在搜索条件上面 -->
    <el-row :gutter="20" class="mb-[10px]">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon like">
              <el-icon :size="32">
                <StarFilled />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalLikes }}</div>
              <div class="stat-label">总点赞数</div>
              <div class="stat-today">今日 +{{ overview.todayLikes }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon favorite">
              <el-icon :size="32">
                <Star />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalFavorites }}</div>
              <div class="stat-label">总收藏数</div>
              <div class="stat-today">今日 +{{ overview.todayFavorites }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon comment">
              <el-icon :size="32">
                <ChatDotRound />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalComments }}</div>
              <div class="stat-label">总评论数</div>
              <div class="stat-today">今日 +{{ overview.todayComments }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon share">
              <el-icon :size="32">
                <Share />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalShares }}</div>
              <div class="stat-label">总转发数</div>
              <div class="stat-today">今日 +{{ overview.todayShares }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="never">
          <el-form ref="queryRef" :inline="true" :model="queryParams">
            <el-form-item label="内容类型" prop="targetType">
              <el-select v-model="queryParams.targetType" clearable placeholder="请选择内容类型" style="width: 150px">
                <el-option label="图片" value="image" />
                <el-option label="相册" value="album" />
                <el-option label="文章" value="article" />
                <el-option label="视频" value="video" />
              </el-select>
            </el-form-item>
            <el-form-item label="内容ID" prop="targetId">
              <el-input v-model="queryParams.targetId" clearable placeholder="请输入内容ID" style="width: 150px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="最小点赞" prop="minLikeCount">
              <el-input-number v-model="queryParams.minLikeCount" :min="0" controls-position="right" style="width: 150px" />
            </el-form-item>
            <el-form-item>
              <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <!-- 操作按钮和表格区域 -->
    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:statistics:edit']" icon="Refresh" plain type="success" @click="handleBatchRefresh">批量刷新 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:statistics:export']" icon="Download" plain type="warning" @click="handleExport">导出 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="statisticsList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" fixed type="selection" width="50" />
        <el-table-column align="center" label="内容类型" prop="targetType" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.targetType === 'image'" type="success">图片</el-tag>
            <el-tag v-else-if="row.targetType === 'album'" type="primary">相册</el-tag>
            <el-tag v-else-if="row.targetType === 'article'" type="warning">文章</el-tag>
            <el-tag v-else>{{ row.targetType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="内容ID" prop="targetId" width="120" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="标题" min-width="200" prop="targetTitle" />
        <el-table-column align="center" label="点赞数" prop="likeCount" sortable width="90" />
        <el-table-column align="center" label="收藏数" prop="favoriteCount" sortable width="90" />
        <el-table-column align="center" label="评论数" prop="commentCount" sortable width="90" />
        <el-table-column align="center" label="转发数" prop="shareCount" sortable width="90" />
        <el-table-column align="center" label="浏览数" prop="viewCount" sortable width="100" />
        <el-table-column align="center" label="更新时间" prop="updateTime" sortable width="180" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="150">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:statistics:edit']" icon="Refresh" link type="primary" @click="handleRefresh(row)">刷新 </el-button>
            <el-button v-hasPermi="['social:statistics:remove']" icon="Delete" link type="danger" @click="handleDelete(row)">删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { delSocialStatistics, listSocialStatistics, getStatisticsOverview, refreshStatistics, batchRefreshStatistics } from '@/api/social/statistics';
import type { StatisticsQuery, StatisticsVO } from '@/api/social/statistics/types';

const { proxy } = getCurrentInstance() as any;

const statisticsList = ref<StatisticsVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const total = ref(0);

// 统计概览数据
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
});

const queryParams = ref<StatisticsQuery>({
  pageNum: 1,
  pageSize: 10,
  targetType: undefined,
  targetId: undefined,
  likeCount: undefined
});

/** 加载统计概览 */
async function loadOverview() {
  try {
    const res = await getStatisticsOverview();
    overview.value = res.data;
  } catch (error) {
    console.error('加载统计概览失败:', error);
  }
}

/** 查询统计列表 */
function getList() {
  loading.value = true;
  listSocialStatistics(queryParams.value)
    .then((response: any) => {
      statisticsList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef');
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: StatisticsVO[]) {
  ids.value = selection.map((item) => item.statId);
}

/** 刷新单个统计 */
function handleRefresh(row: StatisticsVO) {
  proxy.$modal
    .confirm('确认刷新该统计数据吗？')
    .then(() => {
      return refreshStatistics(row.targetType, row.targetId);
    })
    .then(() => {
      getList();
      loadOverview();
      proxy.$modal.msgSuccess('刷新成功');
    })
    .catch(() => {});
}

/** 批量刷新 */
function handleBatchRefresh() {
  if (!queryParams.value.targetType) {
    proxy.$modal.msgWarning('请先选择内容类型');
    return;
  }
  proxy.$modal
    .confirm(`确认刷新所有${queryParams.value.targetType}类型的统计数据吗？`)
    .then(() => {
      return batchRefreshStatistics(queryParams.value.targetType);
    })
    .then(() => {
      getList();
      loadOverview();
      proxy.$modal.msgSuccess('批量刷新成功');
    })
    .catch(() => {});
}

/** 删除按钮操作 */
function handleDelete(row: StatisticsVO) {
  proxy.$modal
    .confirm('确认删除该统计数据吗？')
    .then(() => {
      return delSocialStatistics(row.statId);
    })
    .then(() => {
      getList();
      loadOverview();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'social/statistics/export',
    {
      ...queryParams.value
    },
    `statistics_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  loadOverview();
  getList();
});
</script>

<style lang="scss" scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;

    &.like {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.favorite {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.comment {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.share {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-top: 4px;
    }

    .stat-today {
      font-size: 12px;
      color: #67c23a;
      margin-top: 4px;
    }
  }
}
</style>

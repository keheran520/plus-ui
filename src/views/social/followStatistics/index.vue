<template>
  <div class="p-2">
    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="mb-[10px]">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon :size="32">
                <User />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalUsers }}</div>
              <div class="stat-label">总用户数</div>
              <div class="stat-today">活跃 {{ overview.activeUsers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon following">
              <el-icon :size="32">
                <Star />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.avgFollowing }}</div>
              <div class="stat-label">人均关注数</div>
              <div class="stat-today">最高 {{ overview.maxFollowing }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon follower">
              <el-icon :size="32">
                <StarFilled />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.avgFollower }}</div>
              <div class="stat-label">人均粉丝数</div>
              <div class="stat-today">最高 {{ overview.maxFollower }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon friend">
              <el-icon :size="32">
                <Connection />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.avgFriend }}</div>
              <div class="stat-label">人均好友数</div>
              <div class="stat-today">互关率 {{ overview.mutualRate }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热门用户排行 -->
    <el-row :gutter="20" class="mb-[10px]">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>热门用户排行</span>
              <el-radio-group v-model="hotUserSortBy" size="small" @change="loadHotUsers">
                <el-radio-button value="follower">粉丝最多</el-radio-button>
                <el-radio-button value="following">关注最多</el-radio-button>
                <el-radio-button value="friend">好友最多</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <el-table v-loading="hotUsersLoading" :data="hotUsers" :header-cell-style="{ background: '#f5f7fa', color: '#606266' }" border stripe>
            <el-table-column align="center" label="排名" type="index" width="80">
              <template #default="{ $index }">
                <el-tag v-if="$index === 0" effect="dark" type="danger">🥇</el-tag>
                <el-tag v-else-if="$index === 1" effect="dark" type="warning">🥈</el-tag>
                <el-tag v-else-if="$index === 2" effect="dark" type="success">🥉</el-tag>
                <span v-else>{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="用户ID" prop="userId" width="100" />
            <el-table-column :show-overflow-tooltip="true" align="center" label="用户昵称" prop="nickName" width="150">
              <template #default="{ row }">
                {{ row.nickName || row.userName || '-' }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="关注数" prop="followingCount" width="120">
              <template #default="{ row }">
                <el-tag type="primary">{{ row.followingCount || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="粉丝数" prop="followerCount" width="120">
              <template #default="{ row }">
                <el-tag type="success">{{ row.followerCount || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="好友数" prop="friendCount" width="120">
              <template #default="{ row }">
                <el-tag type="warning">{{ row.friendCount || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="互关率" width="120">
              <template #default="{ row }">
                <el-progress :percentage="calculateMutualRate(row)" :stroke-width="12" :text-inside="true" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="更新时间" prop="updateTime" width="180" />
            <el-table-column align="center" fixed="right" label="操作" width="150">
              <template #default="{ row }">
                <el-button icon="View" link type="primary" @click="handleViewDetail(row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="never">
          <el-form ref="queryRef" :inline="true" :model="queryParams">
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="queryParams.userId" clearable placeholder="请输入用户ID" style="width: 150px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="关注数范围">
              <el-input-number v-model="queryParams.minFollowing" :min="0" placeholder="最小" style="width: 120px" />
              <span style="margin: 0 8px">-</span>
              <el-input-number v-model="queryParams.maxFollowing" :min="0" placeholder="最大" style="width: 120px" />
            </el-form-item>
            <el-form-item label="粉丝数范围">
              <el-input-number v-model="queryParams.minFollower" :min="0" placeholder="最小" style="width: 120px" />
              <span style="margin: 0 8px">-</span>
              <el-input-number v-model="queryParams.maxFollower" :min="0" placeholder="最大" style="width: 120px" />
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
            <el-button v-hasPermi="['social:followStatistics:refresh']" icon="Refresh" plain type="primary" @click="handleRefreshSelected">
              刷新统计
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:followStatistics:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
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
        <el-table-column align="center" label="统计ID" prop="statisticsId" width="100" />
        <el-table-column align="center" label="用户ID" prop="userId" width="100">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewDetail(row)">{{ row.userId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="用户昵称" width="150">
          <template #default="{ row }">
            {{ row.nickName || row.userName || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="关注数" prop="followingCount" sortable width="120">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.followingCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="粉丝数" prop="followerCount" sortable width="120">
          <template #default="{ row }">
            <el-tag type="success">{{ row.followerCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="好友数" prop="friendCount" sortable width="120">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.friendCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="互关率" width="150">
          <template #default="{ row }">
            <el-progress :percentage="calculateMutualRate(row)" :stroke-width="12" :text-inside="true" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="活跃度" width="100">
          <template #default="{ row }">
            <el-rate :model-value="getActivityLevel(row)" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="更新时间" prop="updateTime" sortable width="180" />
        <el-table-column align="center" label="租户ID" prop="tenantId" width="100" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="180">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:followStatistics:refresh']" icon="Refresh" link type="primary" @click="handleRefresh(row)">
              刷新
            </el-button>
            <el-button v-hasPermi="['social:followStatistics:query']" icon="View" link type="success" @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 用户详情抽屉 -->
    <el-drawer v-model="detailDrawerVisible" :title="`用户统计详情 - ${currentUser.nickName || currentUser.userName || ''}`" size="600px">
      <div v-loading="detailLoading" class="detail-container">
        <!-- 用户基本信息 -->
        <el-card class="mb-4" shadow="never">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">{{ currentUser.userId }}</el-descriptions-item>
            <el-descriptions-item label="用户昵称">{{ currentUser.nickName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ currentUser.userName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="租户ID">{{ currentUser.tenantId || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 关注统计 -->
        <el-card class="mb-4" shadow="never">
          <template #header>
            <div class="card-header">
              <span>关注统计</span>
              <el-button icon="Refresh" size="small" type="primary" @click="handleRefresh(currentUser)">刷新统计</el-button>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="stat-box following">
                <div class="stat-icon">
                  <el-icon :size="32"><Star /></el-icon>
                </div>
                <div class="stat-number">{{ currentUser.followingCount || 0 }}</div>
                <div class="stat-text">关注数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-box follower">
                <div class="stat-icon">
                  <el-icon :size="32"><StarFilled /></el-icon>
                </div>
                <div class="stat-number">{{ currentUser.followerCount || 0 }}</div>
                <div class="stat-text">粉丝数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-box friend">
                <div class="stat-icon">
                  <el-icon :size="32"><Connection /></el-icon>
                </div>
                <div class="stat-number">{{ currentUser.friendCount || 0 }}</div>
                <div class="stat-text">好友数</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 互关分析 -->
        <el-card class="mb-4" shadow="never">
          <template #header>
            <div class="card-header">
              <span>互关分析</span>
            </div>
          </template>
          <div class="mutual-analysis">
            <div class="analysis-item">
              <div class="analysis-label">互关率</div>
              <el-progress :percentage="calculateMutualRate(currentUser)" :stroke-width="20" :text-inside="true" type="line" />
            </div>
            <div class="analysis-item">
              <div class="analysis-label">粉丝/关注比</div>
              <div class="analysis-value">
                {{ calculateFollowerRatio(currentUser) }}
              </div>
            </div>
            <div class="analysis-item">
              <div class="analysis-label">活跃度评分</div>
              <el-rate :model-value="getActivityLevel(currentUser)" disabled show-score text-color="#ff9900" />
            </div>
          </div>
        </el-card>

        <!-- 更新信息 -->
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>更新信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="创建时间">{{ currentUser.createTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ currentUser.updateTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建者">{{ currentUser.createBy || '-' }}</el-descriptions-item>
            <el-descriptions-item label="更新者">{{ currentUser.updateBy || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { batchRefreshStatistics, getHotUsers, getOverview, listSocialFollowStatistics, refreshStatistics } from '@/api/social/followStatistics';
import type { SocialFollowStatisticsQuery, SocialFollowStatisticsVO } from '@/api/social/followStatistics/types';

const { proxy } = getCurrentInstance() as any;

const statisticsList = ref<SocialFollowStatisticsVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);

// 统计概览数据
const overview = ref({
  totalUsers: 0,
  activeUsers: 0,
  avgFollowing: 0,
  avgFollower: 0,
  avgFriend: 0,
  maxFollowing: 0,
  maxFollower: 0,
  mutualRate: 0
});

// 热门用户
const hotUsers = ref<any[]>([]);
const hotUsersLoading = ref(false);
const hotUserSortBy = ref('follower');

// 用户详情抽屉
const detailDrawerVisible = ref(false);
const detailLoading = ref(false);
const currentUser = ref<any>({});

const queryParams = ref<SocialFollowStatisticsQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  minFollowing: undefined,
  maxFollowing: undefined,
  minFollower: undefined,
  maxFollower: undefined
});

/** 获取统计概览 */
function loadOverview() {
  getOverview()
    .then((response: any) => {
      overview.value = response.data || {};
    })
    .catch(() => {
      console.error('获取统计概览失败');
    });
}

/** 获取热门用户 */
function loadHotUsers() {
  hotUsersLoading.value = true;
  getHotUsers(hotUserSortBy.value, { pageNum: 1, pageSize: 10 })
    .then((response: any) => {
      hotUsers.value = response.rows || [];
      hotUsersLoading.value = false;
    })
    .catch(() => {
      hotUsersLoading.value = false;
    });
}

/** 查询统计列表 */
function getList() {
  loading.value = true;
  listSocialFollowStatistics(queryParams.value)
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
function handleSelectionChange(selection: SocialFollowStatisticsVO[]) {
  ids.value = selection.map((item) => item.userId);
  multiple.value = !selection.length;
}

/** 刷新单个用户统计 */
function handleRefresh(row: SocialFollowStatisticsVO) {
  proxy.$modal
    .confirm(`确认刷新用户 ${row.userId} 的统计数据吗？`)
    .then(() => {
      return refreshStatistics(row.userId);
    })
    .then(() => {
      getList();
      loadOverview();
      loadHotUsers();
      proxy.$modal.msgSuccess('刷新成功');
    })
    .catch(() => {});
}

/** 批量刷新统计 */
function handleRefreshSelected() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要刷新的用户');
    return;
  }

  proxy.$modal
    .confirm(`确认刷新选中的 ${ids.value.length} 个用户的统计数据吗？`)
    .then(() => {
      return batchRefreshStatistics(ids.value as number[]);
    })
    .then(() => {
      getList();
      loadOverview();
      loadHotUsers();
      proxy.$modal.msgSuccess('批量刷新成功');
    })
    .catch(() => {});
}

/** 查看详情 */
function handleViewDetail(row: any) {
  currentUser.value = { ...row };
  detailDrawerVisible.value = true;
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'social/followStatistics/export',
    {
      ...queryParams.value
    },
    `followStatistics_${new Date().getTime()}.xlsx`
  );
}

/** 计算互关率 */
function calculateMutualRate(row: any): number {
  const following = row.followingCount || 0;
  const friend = row.friendCount || 0;
  if (following === 0) return 0;
  return Math.round((friend / following) * 100);
}

/** 计算粉丝/关注比 */
function calculateFollowerRatio(row: any): string {
  const following = row.followingCount || 0;
  const follower = row.followerCount || 0;
  if (following === 0) return '∞';
  return (follower / following).toFixed(2);
}

/** 获取活跃度等级 */
function getActivityLevel(row: any): number {
  const total = (row.followingCount || 0) + (row.followerCount || 0);
  if (total >= 1000) return 5;
  if (total >= 500) return 4;
  if (total >= 100) return 3;
  if (total >= 50) return 2;
  if (total >= 10) return 1;
  return 0;
}

// 初始化
loadOverview();
loadHotUsers();
getList();
</script>

<style lang="scss" scoped>
.stat-card {
  display: flex;
  align-items: center;
  padding: 10px 0;

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    color: white;

    &.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.following {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.follower {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.friend {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #303133;
      line-height: 1.2;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #303133;
}

.detail-container {
  .stat-box {
    text-align: center;
    padding: 24px;
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.following {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    &.follower {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    &.friend {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: white;
    }

    .stat-icon {
      margin-bottom: 12px;
    }

    .stat-number {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .stat-text {
      font-size: 14px;
      opacity: 0.9;
    }
  }

  .mutual-analysis {
    .analysis-item {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .analysis-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 12px;
        font-weight: 500;
      }

      .analysis-value {
        font-size: 28px;
        font-weight: bold;
        color: #409eff;
        text-align: center;
      }
    }
  }
}
</style>

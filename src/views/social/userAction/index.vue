<template>
  <div class="p-2">
    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="mb-[10px]">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon :size="32">
                <DataAnalysis />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.totalActions }}</div>
              <div class="stat-label">总行为数</div>
              <div class="stat-today">今日 +{{ overview.todayActions }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon like">
              <el-icon :size="32">
                <StarFilled />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.likeCount }}</div>
              <div class="stat-label">点赞行为</div>
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
              <div class="stat-value">{{ overview.favoriteCount }}</div>
              <div class="stat-label">收藏行为</div>
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
              <div class="stat-value">{{ overview.commentCount }}</div>
              <div class="stat-label">评论行为</div>
              <div class="stat-today">今日 +{{ overview.todayComments }}</div>
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
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="queryParams.userId" clearable placeholder="请输入用户ID" style="width: 150px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="行为类型" prop="actionType">
              <el-select v-model="queryParams.actionType" clearable placeholder="请选择行为类型" style="width: 150px">
                <el-option label="点赞" value="like" />
                <el-option label="收藏" value="favorite" />
                <el-option label="评论" value="comment" />
                <el-option label="转发" value="share" />
                <el-option label="浏览" value="view" />
              </el-select>
            </el-form-item>
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
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="dateRange"
                end-placeholder="结束日期"
                range-separator="-"
                start-placeholder="开始日期"
                style="width: 240px"
                type="daterange"
                value-format="YYYY-MM-DD"
              />
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
            <el-button v-hasPermi="['social:userAction:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
              批量删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:userAction:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="actionList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" fixed type="selection" width="50" />
        <el-table-column align="center" label="行为ID" prop="actionId" width="100" />
        <el-table-column align="center" label="用户ID" prop="userId" width="100">
          <template #default="{ row }">
            <el-link type="primary" @click="showUserDetail(row.userId)">{{ row.userId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="用户昵称" prop="nickName" width="150">
          <template #default="{ row }">
            {{ row.nickName || row.userName || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="行为类型" prop="actionType" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.actionType === 'like'" type="danger">点赞</el-tag>
            <el-tag v-else-if="row.actionType === 'favorite'" type="warning">收藏</el-tag>
            <el-tag v-else-if="row.actionType === 'comment'" type="primary">评论</el-tag>
            <el-tag v-else-if="row.actionType === 'share'" type="success">转发</el-tag>
            <el-tag v-else-if="row.actionType === 'view'" type="info">浏览</el-tag>
            <el-tag v-else>{{ row.actionType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="内容类型" prop="targetType" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.targetType === 'image'" type="success">图片</el-tag>
            <el-tag v-else-if="row.targetType === 'album'" type="primary">相册</el-tag>
            <el-tag v-else-if="row.targetType === 'article'" type="warning">文章</el-tag>
            <el-tag v-else>{{ row.targetType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="内容ID" prop="targetId" width="120" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="内容标题" min-width="200" prop="targetTitle" />
        <el-table-column align="center" label="行为值" prop="actionValue" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.actionValue > 0" type="success" size="small">+{{ row.actionValue }}</el-tag>
            <el-tag v-else-if="row.actionValue < 0" type="danger" size="small">{{ row.actionValue }}</el-tag>
            <el-tag v-else size="small">0</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" sortable width="180" />
        <el-table-column align="center" label="租户ID" prop="tenantId" width="100" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="100">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:userAction:remove']" icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 用户详情抽屉 -->
    <el-drawer v-model="userDrawerVisible" :title="`用户 ${selectedUserId} 的行为统计`" direction="rtl" size="500px">
      <div v-loading="userStatsLoading" class="user-stats-container">
        <!-- 用户活跃度分数 -->
        <el-card class="mb-4" shadow="never">
          <template #header>
            <div class="card-header">
              <span>活跃度分数</span>
            </div>
          </template>
          <div class="activity-score">
            <div class="score-value">{{ userStats.activityScore }}</div>
            <div class="score-label">基于行为权重计算</div>
          </div>
        </el-card>

        <!-- 行为统计 -->
        <el-card class="mb-4" shadow="never">
          <template #header>
            <div class="card-header">
              <span>行为统计</span>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="12">
              <div class="stat-item">
                <div class="stat-item-label">总行为数</div>
                <div class="stat-item-value">{{ userStats.totalActions }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="stat-item">
                <div class="stat-item-label">今日行为</div>
                <div class="stat-item-value">{{ userStats.todayActions }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 点赞统计 -->
        <el-card class="mb-4" shadow="never">
          <template #header>
            <div class="card-header">
              <span>点赞统计</span>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-item-label">点赞次数</div>
                <div class="stat-item-value text-success">+{{ userStats.likeCount }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-item-label">取消点赞</div>
                <div class="stat-item-value text-danger">-{{ userStats.unlikeCount }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-item-label">净点赞数</div>
                <div class="stat-item-value text-primary">{{ userStats.netLikes }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 收藏统计 -->
        <el-card class="mb-4" shadow="never">
          <template #header>
            <div class="card-header">
              <span>收藏统计</span>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-item-label">收藏次数</div>
                <div class="stat-item-value text-success">+{{ userStats.favoriteCount }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-item-label">取消收藏</div>
                <div class="stat-item-value text-danger">-{{ userStats.unfavoriteCount }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-item-label">净收藏数</div>
                <div class="stat-item-value text-primary">{{ userStats.netFavorites }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 评论统计 -->
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>评论统计</span>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-item-label">评论次数</div>
                <div class="stat-item-value text-success">+{{ userStats.commentCount }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-item-label">删除评论</div>
                <div class="stat-item-value text-danger">-{{ userStats.deleteCommentCount }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-item-label">净评论数</div>
                <div class="stat-item-value text-primary">{{ userStats.netComments }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { delSocialUserAction, listSocialUserAction, getUserActionOverview, getUserStatistics } from '@/api/social/userAction'
import type { SocialUserActionQuery, SocialUserActionVO } from '@/api/social/userAction/types'

const { proxy } = getCurrentInstance() as any

const actionList = ref<SocialUserActionVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<Array<string | number>>([])
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<[string, string]>()

// 统计概览数据
const overview = ref({
  totalActions: 0,
  todayActions: 0,
  likeCount: 0,
  favoriteCount: 0,
  commentCount: 0,
  todayLikes: 0,
  todayFavorites: 0,
  todayComments: 0,
  activeUsers: 0
})

// 用户详情抽屉
const userDrawerVisible = ref(false)
const selectedUserId = ref<number>(0)
const userStatsLoading = ref(false)
const userStats = ref({
  totalActions: 0,
  likeCount: 0,
  unlikeCount: 0,
  favoriteCount: 0,
  unfavoriteCount: 0,
  commentCount: 0,
  deleteCommentCount: 0,
  netLikes: 0,
  netFavorites: 0,
  netComments: 0,
  activityScore: 0,
  todayActions: 0
})

const queryParams = ref<SocialUserActionQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  actionType: undefined,
  targetType: undefined,
  targetId: undefined
})

/** 获取统计概览 */
function getOverview() {
  getUserActionOverview()
    .then((response: any) => {
      overview.value = response.data
    })
    .catch(() => {
      console.error('获取统计概览失败')
    })
}

/** 查询用户行为列表 */
function getList() {
  loading.value = true
  const params = proxy.addDateRange(queryParams.value, dateRange.value)
  listSocialUserAction(params)
    .then((response: any) => {
      actionList.value = response.rows
      total.value = response.total
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = undefined
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: SocialUserActionVO[]) {
  ids.value = selection.map((item) => item.actionId)
  multiple.value = !selection.length
}

/** 删除按钮操作 */
function handleDelete(row?: SocialUserActionVO) {
  const actionIds = row ? [row.actionId] : ids.value
  proxy.$modal
    .confirm('确认删除选中的用户行为记录吗？')
    .then(() => {
      return delSocialUserAction(actionIds)
    })
    .then(() => {
      getList()
      getOverview()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'social/userAction/export',
    {
      ...queryParams.value
    },
    `userAction_${new Date().getTime()}.xlsx`
  )
}

/** 显示用户详情 */
function showUserDetail(userId: number) {
  selectedUserId.value = userId
  userDrawerVisible.value = true
  userStatsLoading.value = true
  
  getUserStatistics(userId)
    .then((response: any) => {
      userStats.value = response.data
      userStatsLoading.value = false
    })
    .catch(() => {
      userStatsLoading.value = false
      proxy.$modal.msgError('获取用户统计失败')
    })
}

// 初始化
getOverview()
getList()
</script>


<style scoped lang="scss">
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

    &.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    &.like {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    &.favorite {
      background: linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%);
      color: #f5576c;
    }

    &.comment {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      color: #667eea;
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

.user-stats-container {
  .activity-score {
    text-align: center;
    padding: 20px 0;

    .score-value {
      font-size: 48px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .score-label {
      font-size: 14px;
      color: #909399;
      margin-top: 8px;
    }
  }

  .stat-item {
    text-align: center;
    padding: 12px 0;

    .stat-item-label {
      font-size: 13px;
      color: #909399;
      margin-bottom: 8px;
    }

    .stat-item-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;

      &.text-success {
        color: #67c23a;
      }

      &.text-danger {
        color: #f56c6c;
      }

      &.text-primary {
        color: #409eff;
      }
    }
  }

  .card-header {
    font-weight: bold;
    color: #303133;
  }
}
</style>

<template>
  <div class="p-2">
    <!-- 统计卡片 -->
    <el-row :gutter="10" class="mb-[10px]">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalFollows || 0 }}</div>
              <div class="stat-label">总关注数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.todayFollows || 0 }}</div>
              <div class="stat-label">今日新增</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <el-icon :size="32"><Connection /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalMutualFollows || 0 }}</div>
              <div class="stat-label">互关总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <el-icon :size="32"><DataAnalysis /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.avgFollowingPerUser || 0 }}</div>
              <div class="stat-label">人均关注数</div>
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
            <el-form-item label="关注者ID" prop="userId">
              <el-input v-model="queryParams.userId" clearable placeholder="请输入关注者ID" style="width: 150px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="被关注者ID" prop="followedUserId">
              <el-input
                v-model="queryParams.followedUserId"
                clearable
                placeholder="请输入被关注者ID"
                style="width: 150px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="关注类型" prop="followType">
              <el-select v-model="queryParams.followType" clearable placeholder="请选择关注类型" style="width: 150px">
                <el-option label="普通关注" value="normal" />
                <el-option label="特别关注" value="special" />
                <el-option label="悄悄关注" value="quiet" />
              </el-select>
            </el-form-item>
            <el-form-item label="互关状态" prop="isMutual">
              <el-select v-model="queryParams.isMutual" clearable placeholder="请选择互关状态" style="width: 150px">
                <el-option label="单向关注" value="0" />
                <el-option label="互相关注" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="关注来源" prop="followSource">
              <el-select v-model="queryParams.followSource" clearable placeholder="请选择关注来源" style="width: 150px">
                <el-option label="搜索" value="search" />
                <el-option label="推荐" value="recommend" />
                <el-option label="主页" value="profile" />
                <el-option label="内容页" value="content" />
              </el-select>
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
            <el-button v-hasPermi="['social:follow:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
              批量删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:follow:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="followList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" fixed type="selection" width="50" />
        <el-table-column align="center" label="关注ID" prop="followId" width="100" />
        <el-table-column align="center" label="关注者" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <div class="user-id">ID: {{ row.userId }}</div>
              <div class="user-name">{{ row.nickName || row.userName || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="被关注者" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <div class="user-id">ID: {{ row.followedUserId }}</div>
              <div class="user-name">{{ row.followedNickName || row.followedUserName || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="关注类型" prop="followType" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.followType === 'normal'" type="success">普通关注</el-tag>
            <el-tag v-else-if="row.followType === 'special'" type="warning">特别关注</el-tag>
            <el-tag v-else-if="row.followType === 'quiet'" type="info">悄悄关注</el-tag>
            <el-tag v-else>{{ row.followType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="互关状态" prop="isMutual" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isMutual === '1'" effect="dark" type="danger">
              <el-icon><Connection /></el-icon>
              互关
            </el-tag>
            <el-tag v-else type="info">单向</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="关注来源" prop="followSource" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.followSource === 'search'" plain type="primary">搜索</el-tag>
            <el-tag v-else-if="row.followSource === 'recommend'" plain type="success">推荐</el-tag>
            <el-tag v-else-if="row.followSource === 'profile'" plain type="warning">主页</el-tag>
            <el-tag v-else-if="row.followSource === 'content'" plain type="info">内容页</el-tag>
            <el-tag v-else plain>{{ row.followSource || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="备注" prop="remark" width="150">
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" sortable width="180" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="180">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:follow:query']" icon="View" link type="primary" @click="handleViewUser(row)">查看详情</el-button>
            <el-button v-hasPermi="['social:follow:remove']" icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 用户详情抽屉 -->
    <el-drawer v-model="userDrawerVisible" :title="`用户详情 - ${currentUser.nickName || currentUser.userName || ''}`" size="500px">
      <div v-loading="userLoading" class="user-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户ID">{{ currentUser.userId }}</el-descriptions-item>
          <el-descriptions-item label="用户昵称">{{ currentUser.nickName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentUser.userName || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">关注统计</el-divider>
        <el-row :gutter="10">
          <el-col :span="8">
            <div class="stat-box">
              <div class="stat-number" style="color: #409eff">{{ userStats.followingCount || 0 }}</div>
              <div class="stat-text">关注数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-box">
              <div class="stat-number" style="color: #67c23a">{{ userStats.followerCount || 0 }}</div>
              <div class="stat-text">粉丝数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-box">
              <div class="stat-number" style="color: #e6a23c">{{ userStats.friendCount || 0 }}</div>
              <div class="stat-text">好友数</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { delSocialFollow, getStatisticsOverview, getUserStatistics, listSocialFollow } from '@/api/social/follow';
import type { SocialFollowQuery, SocialFollowVO } from '@/api/social/follow/types';

const { proxy } = getCurrentInstance() as any;

const followList = ref<SocialFollowVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[string, string]>();
const statistics = ref<any>({});
const userDrawerVisible = ref(false);
const userLoading = ref(false);
const currentUser = ref<any>({});
const userStats = ref<any>({});

const queryParams = ref<SocialFollowQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  followedUserId: undefined,
  followType: undefined,
  isMutual: undefined,
  followSource: undefined
});

/** 加载统计数据 */
function loadStatistics() {
  getStatisticsOverview()
    .then((response: any) => {
      statistics.value = response.data || {};
    })
    .catch(() => {});
}

/** 查询关注列表 */
function getList() {
  loading.value = true;
  const params = proxy.addDateRange(queryParams.value, dateRange.value);
  listSocialFollow(params)
    .then((response: any) => {
      followList.value = response.rows;
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
  dateRange.value = undefined;
  proxy.resetForm('queryRef');
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: SocialFollowVO[]) {
  ids.value = selection.map((item) => item.followId);
  multiple.value = !selection.length;
}

/** 查看用户详情 */
function handleViewUser(row: SocialFollowVO) {
  currentUser.value = {
    userId: row.userId,
    nickName: row.nickName,
    userName: row.userName
  };
  userDrawerVisible.value = true;
  userLoading.value = true;

  getUserStatistics(row.userId)
    .then((response: any) => {
      userStats.value = response.data || {};
      userLoading.value = false;
    })
    .catch(() => {
      userLoading.value = false;
    });
}

/** 删除按钮操作 */
function handleDelete(row?: SocialFollowVO) {
  const followIds = row ? [row.followId] : ids.value;
  proxy.$modal
    .confirm('确认删除选中的关注记录吗？')
    .then(() => {
      return delSocialFollow(followIds);
    })
    .then(() => {
      getList();
      loadStatistics();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'social/follow/export',
    {
      ...queryParams.value
    },
    `follow_${new Date().getTime()}.xlsx`
  );
}

loadStatistics();
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
    color: #fff;
    margin-right: 15px;
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-top: 5px;
    }
  }
}

.user-info {
  .user-id {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }

  .user-name {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }
}

.user-detail {
  .stat-box {
    text-align: center;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;

    .stat-number {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .stat-text {
      font-size: 14px;
      color: #909399;
    }
  }
}
</style>

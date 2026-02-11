<template>
  <div class="p-2">
    <!-- 统计卡片 -->
    <el-row :gutter="10" class="mb-[10px]">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon :size="32"><WarningFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalBlocks || 0 }}</div>
              <div class="stat-label">总屏蔽数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.todayBlocks || 0 }}</div>
              <div class="stat-label">今日新增</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.activeUsers || 0 }}</div>
              <div class="stat-label">活跃用户数</div>
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
            <el-form-item label="屏蔽者ID" prop="userId">
              <el-input v-model="queryParams.userId" clearable placeholder="请输入屏蔽者ID" style="width: 150px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="被屏蔽者ID" prop="blockedUserId">
              <el-input
                v-model="queryParams.blockedUserId"
                clearable
                placeholder="请输入被屏蔽者ID"
                style="width: 150px"
                @keyup.enter="handleQuery"
              />
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
            <el-button v-hasPermi="['social:block:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
              批量删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:block:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="blockList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" fixed type="selection" width="50" />
        <el-table-column align="center" label="黑名单ID" prop="blockId" width="120" />
        <el-table-column align="center" label="屏蔽者" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <div class="user-id">ID: {{ row.userId }}</div>
              <div class="user-name">{{ row.nickName || row.userName || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="被屏蔽者" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <div class="user-id">ID: {{ row.blockedUserId }}</div>
              <div class="user-name">{{ row.blockedNickName || row.blockedUserName || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="屏蔽原因" min-width="250" prop="blockReason">
          <template #default="{ row }">
            {{ row.blockReason || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" sortable width="180" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="100">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:block:remove']" icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { delSocialBlock, getBlockOverview, listSocialBlock } from '@/api/social/block';
import type { SocialBlockQuery, SocialBlockVO } from '@/api/social/block/types';

const { proxy } = getCurrentInstance() as any;

const blockList = ref<SocialBlockVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[string, string]>();
const statistics = ref<any>({});

const queryParams = ref<SocialBlockQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  blockedUserId: undefined
});

/** 加载统计数据 */
function loadStatistics() {
  getBlockOverview()
    .then((response: any) => {
      statistics.value = response.data || {};
    })
    .catch(() => {});
}

/** 查询黑名单列表 */
function getList() {
  loading.value = true;
  const params = proxy.addDateRange(queryParams.value, dateRange.value);
  listSocialBlock(params)
    .then((response: any) => {
      blockList.value = response.rows;
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
function handleSelectionChange(selection: SocialBlockVO[]) {
  ids.value = selection.map((item) => item.blockId);
  multiple.value = !selection.length;
}

/** 删除按钮操作 */
function handleDelete(row?: SocialBlockVO) {
  const blockIds = row ? [row.blockId] : ids.value;
  proxy.$modal
    .confirm('确认删除选中的黑名单记录吗？')
    .then(() => {
      return delSocialBlock(blockIds);
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
    'social/block/export',
    {
      ...queryParams.value
    },
    `block_${new Date().getTime()}.xlsx`
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
</style>

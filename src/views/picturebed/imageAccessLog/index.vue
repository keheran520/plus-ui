<template>
  <div class="p-2">
    <!-- 统计信息 -->
    <el-row :gutter="10" class="mb-[10px]">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon :size="32">
                <Document />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalCount || 0 }}</div>
              <div class="stat-label">总访问量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon view">
              <el-icon :size="32">
                <View />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.viewCount || 0 }}</div>
              <div class="stat-label">查看次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon download">
              <el-icon :size="32">
                <Download />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.downloadCount || 0 }}</div>
              <div class="stat-label">下载次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon today">
              <el-icon :size="32">
                <Calendar />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.todayCount || 0 }}</div>
              <div class="stat-label">今日访问</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :inline="true" :model="queryParams">
            <el-form-item label="图片ID" prop="imageId">
              <el-input v-model="queryParams.imageId" clearable placeholder="请输入图片ID" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="访问IP" prop="accessIp">
              <el-input v-model="queryParams.accessIp" clearable placeholder="请输入访问IP" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="访问地点" prop="accessLocation">
              <el-input v-model="queryParams.accessLocation" clearable placeholder="请输入访问地点" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户代理" prop="userAgent">
              <el-input v-model="queryParams.userAgent" clearable placeholder="请输入用户代理" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="queryParams.userId" clearable placeholder="请输入用户ID" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['picturebed:imageAccessLog:remove']" icon="Delete" plain type="danger" @click="handleClearAll"
              >清空日志
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['picturebed:imageAccessLog:export']" icon="Download" plain type="warning" @click="handleExport">导出 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="imageAccessLogList" border>
        <el-table-column align="center" label="日志ID" prop="logId" width="100" />
        <el-table-column align="center" label="图片ID" prop="imageId" show-overflow-tooltip width="180">
          <template #default="scope">
            <el-link class="ellipsis-link" type="primary" @click="handleViewImage(scope.row.imageId)">
              {{ scope.row.imageId }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" label="访问类型" prop="accessType" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.accessType === '1'" size="small" type="primary">查看</el-tag>
            <el-tag v-else-if="scope.row.accessType === '2'" size="small" type="success">下载</el-tag>
            <el-tag v-else size="small" type="info">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="访问IP" prop="accessIp" width="150" />
        <el-table-column align="center" label="访问地点" prop="accessLocation" show-overflow-tooltip width="200" />
        <el-table-column align="center" label="用户代理" min-width="200" prop="userAgent" show-overflow-tooltip />
        <el-table-column align="center" label="用户ID" prop="userId" show-overflow-tooltip width="180">
          <template #default="scope">
            <el-tooltip v-if="scope.row.userId" :content="String(scope.row.userId)" placement="top">
              <el-link class="ellipsis-link" type="primary" @click="handleViewUser(scope.row.userId)">
                {{ scope.row.userId }}
              </el-link>
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="访问时间" prop="createTime" width="180" />
        <el-table-column align="center" fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-tooltip content="查看详细" placement="top">
              <el-button icon="View" link type="primary" @click="handleViewDetail(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['picturebed:imageAccessLog:remove']"
                icon="Delete"
                link
                type="danger"
                @click="handleDelete(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 图片详情弹窗 -->
    <ImageDetail v-model="imageDetailVisible" :image-id="currentImageId" />

    <!-- 用户详情弹窗 -->
    <UserDetail v-model="userDetailVisible" :user-id="currentUserId" />

    <!-- 日志详情弹窗 -->
    <el-dialog v-model="logDetailVisible" title="访问日志详情" width="700px">
      <el-descriptions v-if="currentLog" :column="2" border>
        <el-descriptions-item label="日志ID">
          {{ currentLog.logId }}
        </el-descriptions-item>
        <el-descriptions-item label="图片ID">
          <el-link type="primary" @click="handleViewImage(currentLog.imageId)">
            {{ currentLog.imageId }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="访问类型">
          <el-tag v-if="currentLog.accessType === '1'" size="small" type="primary">查看</el-tag>
          <el-tag v-else-if="currentLog.accessType === '2'" size="small" type="success">下载</el-tag>
          <el-tag v-else size="small" type="info">未知</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="访问IP">
          {{ currentLog.accessIp || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :span="2" label="访问地点">
          {{ currentLog.accessLocation || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :span="2" label="用户代理">
          <div class="user-agent-text">{{ currentLog.userAgent || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">
          <el-link v-if="currentLog.userId" type="primary" @click="handleViewUser(currentLog.userId)">
            {{ currentLog.userId }}
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="访问时间">
          {{ currentLog.createTime || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script lang="ts" name="ImageAccessLog" setup>
import { clearImageAccessLog, delImageAccessLog, getAccessLogStatistics, listImageAccessLog } from '@/api/picturebed/imageAccessLog';
import { ImageAccessLogQuery, ImageAccessLogVO } from '@/api/picturebed/imageAccessLog/types';
import { Calendar, Document, Download, View } from '@element-plus/icons-vue';
import ImageDetail from '@/components/ImageDetail/index.vue';
import UserDetail from '@/components/UserDetail/index.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const imageAccessLogList = ref<ImageAccessLogVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

// 统计数据
const statistics = ref({
  totalCount: 0,
  viewCount: 0,
  downloadCount: 0,
  todayCount: 0
});

// 图片详情
const imageDetailVisible = ref(false);
const currentImageId = ref<number>();

// 用户详情
const userDetailVisible = ref(false);
const currentUserId = ref<number>();

// 日志详情
const logDetailVisible = ref(false);
const currentLog = ref<ImageAccessLogVO>();

const queryParams = ref<ImageAccessLogQuery>({
  pageNum: 1,
  pageSize: 10,
  imageId: undefined,
  accessType: undefined,
  accessIp: undefined,
  accessLocation: undefined,
  userAgent: undefined,
  userId: undefined,
  params: {}
});

/** 查询图片访问日志列表 */
const getList = async () => {
  loading.value = true;
  const res = await listImageAccessLog(queryParams.value);
  imageAccessLogList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 获取统计数据 */
const getStatistics = async () => {
  try {
    const res = await getAccessLogStatistics();
    if (res.code === 200) {
      statistics.value = res.data;
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 查看图片详情 */
const handleViewImage = (imageId: string) => {
  currentImageId.value = imageId;
  imageDetailVisible.value = true;
};

/** 查看用户详情 */
const handleViewUser = (userId: number) => {
  currentUserId.value = userId;
  userDetailVisible.value = true;
};

/** 查看日志详情 */
const handleViewDetail = (row: ImageAccessLogVO) => {
  currentLog.value = row;
  logDetailVisible.value = true;
};

/** 删除按钮操作 */
const handleDelete = async (row: ImageAccessLogVO) => {
  await proxy?.$modal.confirm('是否确认删除该访问日志？');
  loading.value = true;
  try {
    await delImageAccessLog(row.logId);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
    await getStatistics();
  } catch (error) {
    console.error('删除日志失败:', error);
  } finally {
    loading.value = false;
  }
};

/** 清空所有日志 */
const handleClearAll = async () => {
  await proxy?.$modal.confirm('是否确认清空所有访问日志？此操作不可恢复！');
  loading.value = true;
  try {
    await clearImageAccessLog();
    proxy?.$modal.msgSuccess('清空成功');
    await getList();
    await getStatistics();
  } catch (error) {
    console.error('清空日志失败:', error);
  } finally {
    loading.value = false;
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'picturebed/imageAccessLog/export',
    {
      ...queryParams.value
    },
    `imageAccessLog_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
  getStatistics();
});
</script>

<style lang="scss" scoped>
.stat-card {
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stat-content {
    display: flex;
    align-items: center;
    padding: 10px;

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 8px;
      margin-right: 16px;

      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.view {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }

      &.download {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
      }

      &.today {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
      }
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.user-agent-text {
  word-break: break-all;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

.ellipsis-link {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
</style>

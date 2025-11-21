<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :inline="true" :model="queryParams">
            <el-form-item label="消息ID" prop="messageId">
              <el-input v-model="queryParams.messageId" clearable placeholder="请输入消息ID" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="接收人ID" prop="receiverId">
              <el-input v-model="queryParams.receiverId" clearable placeholder="请输入接收人ID" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="发送方式" prop="sendMethod">
              <el-select v-model="queryParams.sendMethod" clearable placeholder="请选择发送方式">
                <el-option v-for="dict in sys_send_method" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="发送状态" prop="sendStatus">
              <el-select v-model="queryParams.sendStatus" clearable placeholder="请选择发送状态">
                <el-option v-for="dict in sys_send_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否已读" prop="isRead">
              <el-select v-model="queryParams.isRead" clearable placeholder="请选择是否已读">
                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
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
            <el-button v-hasPermi="['system:messageLog:remove']" icon="Delete" plain type="danger" @click="handleClearAll">清空日志 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:messageLog:export']" icon="Download" plain type="warning" @click="handleExport">导出 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="messageLogList" border>
        <el-table-column align="center" label="日志ID" prop="logId" width="100" />
        <el-table-column align="center" label="消息ID" prop="messageId" show-overflow-tooltip width="180">
          <template #default="scope">
            <el-link class="ellipsis-link" type="primary" @click="handleViewMessage(scope.row.messageId)">
              {{ scope.row.messageId }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" label="接收人ID" prop="receiverId" show-overflow-tooltip width="180">
          <template #default="scope">
            <el-tooltip v-if="scope.row.receiverId" :content="String(scope.row.receiverId)" placement="top">
              <el-link class="ellipsis-link" type="primary" @click="handleViewUser(scope.row.receiverId)">
                {{ scope.row.receiverId }}
              </el-link>
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="发送方式" prop="sendMethod" width="120">
          <template #default="scope">
            <dict-tag :options="sys_send_method" :value="scope.row.sendMethod" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="发送状态" prop="sendStatus" width="100">
          <template #default="scope">
            <dict-tag :options="sys_send_status" :value="scope.row.sendStatus" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="发送时间" prop="sendTime" width="180" />
        <el-table-column align="center" label="是否已读" prop="isRead" width="100">
          <template #default="scope">
            <dict-tag :options="sys_yes_no" :value="scope.row.isRead" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="阅读时间" prop="readTime" width="180" />
        <el-table-column align="center" label="错误信息" min-width="200" prop="errorMsg" show-overflow-tooltip />
        <el-table-column align="center" fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-tooltip content="查看详细" placement="top">
              <el-button icon="View" link type="primary" @click="handleViewDetail(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['system:messageLog:remove']" icon="Delete" link type="danger" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 消息详情弹窗 -->
    <MessageDetail v-model="messageDetailVisible" :message-id="currentMessageId" />

    <!-- 用户详情弹窗 -->
    <UserDetail v-model="userDetailVisible" :user-id="currentUserId" />

    <!-- 日志详情弹窗 -->
    <el-dialog v-model="logDetailVisible" title="消息发送日志详情" width="700px">
      <el-descriptions v-if="currentLog" :column="2" border>
        <el-descriptions-item label="日志ID">
          {{ currentLog.logId }}
        </el-descriptions-item>
        <el-descriptions-item label="消息ID">
          <el-link type="primary" @click="handleViewMessage(currentLog.messageId)">
            {{ currentLog.messageId }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="发送方式">
          <dict-tag :options="sys_send_method" :value="currentLog.sendMethod" />
        </el-descriptions-item>
        <el-descriptions-item label="接收人ID">
          <el-link v-if="currentLog.receiverId" type="primary" @click="handleViewUser(currentLog.receiverId)">
            {{ currentLog.receiverId }}
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="发送状态">
          <dict-tag :options="sys_send_status" :value="currentLog.sendStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">
          {{ currentLog.sendTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="是否已读">
          <dict-tag :options="sys_yes_no" :value="currentLog.isRead" />
        </el-descriptions-item>
        <el-descriptions-item label="阅读时间">
          {{ currentLog.readTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentLog.errorMsg" :span="2" label="错误信息">
          <div class="error-message-text">{{ currentLog.errorMsg }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script lang="ts" name="MessageLog" setup>
import { delMessageLog, listMessageLog } from '@/api/system/messageLog';
import { MessageLogQuery, MessageLogVO } from '@/api/system/messageLog/types';
import MessageDetail from '@/components/MessageDetail/index.vue';
import UserDetail from '@/components/UserDetail/index.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_send_status, sys_send_method, sys_yes_no } = toRefs<any>(
  proxy?.useDict('sys_send_status', 'sys_send_method', 'sys_yes_no')
);

const messageLogList = ref<MessageLogVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

// 弹窗控制
const messageDetailVisible = ref(false);
const userDetailVisible = ref(false);
const logDetailVisible = ref(false);

// 当前选中的ID
const currentMessageId = ref<number | string>();
const currentUserId = ref<number | string>();
const currentLog = ref<MessageLogVO | null>(null);

const queryParams = ref<MessageLogQuery>({
  pageNum: 1,
  pageSize: 10,
  messageId: undefined,
  sendMethod: undefined,
  receiverId: undefined,
  sendStatus: undefined,
  isRead: undefined
});

/** 查询消息发送日志列表 */
const getList = async () => {
  loading.value = true;
  const res = await listMessageLog(queryParams.value);
  messageLogList.value = res.rows;
  total.value = res.total;
  loading.value = false;
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

/** 查看消息详情 */
const handleViewMessage = (messageId: number | string) => {
  currentMessageId.value = messageId;
  messageDetailVisible.value = true;
};

/** 查看用户详情 */
const handleViewUser = (userId: number | string) => {
  currentUserId.value = userId;
  userDetailVisible.value = true;
};

/** 查看日志详情 */
const handleViewDetail = (row: MessageLogVO) => {
  currentLog.value = row;
  logDetailVisible.value = true;
};

/** 清空日志 */
const handleClearAll = async () => {
  await proxy?.$modal.confirm('确认清空所有消息发送日志吗？此操作不可恢复！');
  loading.value = true;
  try {
    // 这里需要后端提供清空接口，暂时使用删除所有
    const allIds = messageLogList.value.map((item) => item.logId);
    if (allIds.length > 0) {
      await delMessageLog(allIds);
      proxy?.$modal.msgSuccess('清空成功');
      await getList();
    } else {
      proxy?.$modal.msgWarning('暂无日志数据');
    }
  } finally {
    loading.value = false;
  }
};

/** 删除按钮操作 */
const handleDelete = async (row: MessageLogVO) => {
  await proxy?.$modal.confirm('是否确认删除日志ID为"' + row.logId + '"的数据项？');
  loading.value = true;
  try {
    await delMessageLog(row.logId);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
  } finally {
    loading.value = false;
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'system/messageLog/export',
    {
      ...queryParams.value
    },
    `messageLog_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.ellipsis-link {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.error-message-text {
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  color: #f56c6c;
}
</style>

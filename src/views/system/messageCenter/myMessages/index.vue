<template>
  <div class="my-messages">
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="queryParams" class="search-form">
      <el-form-item label="消息类型">
        <el-select v-model="queryParams.messageType" clearable placeholder="请选择消息类型" style="width: 200px">
          <el-option v-for="dict in sys_message_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="阅读状态">
        <el-select v-model="queryParams.isRead" clearable placeholder="请选择阅读状态" style="width: 200px">
          <el-option label="未读" value="N" />
          <el-option label="已读" value="Y" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb-3">
      <el-col :span="1.5">
        <el-button :disabled="!hasUnread" icon="Check" plain type="success" @click="handleMarkAllRead">全部标记已读</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete">批量删除</el-button>
      </el-col>
    </el-row>

    <!-- 消息列表 -->
    <el-table v-loading="loading" :data="messageList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="center" label="序号" type="index" width="60" />
      <el-table-column align="center" label="消息类型" prop="messageType" width="120">
        <template #default="scope">
          <dict-tag :options="sys_message_type" :value="scope.row.messageType" />
        </template>
      </el-table-column>
      <el-table-column label="消息标题" prop="messageTitle" show-overflow-tooltip>
        <template #default="scope">
          <div class="message-title-cell">
            <el-badge v-if="scope.row.isRead === 'N'" is-dot type="danger" />
            <el-link type="primary" @click="handleViewMessage(scope.row)">
              {{ scope.row.messageTitle }}
            </el-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="优先级" prop="priority" width="100">
        <template #default="scope">
          <dict-tag :options="sys_message_priority" :value="scope.row.priority" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="发送时间" prop="sendTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.sendTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="阅读状态" prop="isRead" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.isRead === 'Y'" type="success">已读</el-tag>
          <el-tag v-else type="warning">未读</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="150">
        <template #default="scope">
          <el-tooltip content="查看" placement="top">
            <el-button icon="View" link type="primary" @click="handleViewMessage(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip v-if="scope.row.isRead === 'N'" content="标记已读" placement="top">
            <el-button icon="Check" link type="success" @click="handleMarkRead(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button icon="Delete" link type="danger" @click="handleDelete(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />

    <!-- 消息详情对话框 -->
    <el-dialog v-model="messageDetailVisible" :title="currentMessage?.messageTitle" width="800px">
      <div class="message-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="消息类型">
            <dict-tag :options="sys_message_type" :value="currentMessage?.messageType" />
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <dict-tag :options="sys_message_priority" :value="currentMessage?.priority" />
          </el-descriptions-item>
          <el-descriptions-item label="发送时间">
            {{ parseTime(currentMessage?.sendTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="阅读状态">
            <el-tag v-if="currentMessage?.isRead === 'Y'" type="success">已读</el-tag>
            <el-tag v-else type="warning">未读</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <div class="message-content" v-html="currentMessage?.messageContent"></div>
      </div>
      <template #footer>
        <el-button @click="messageDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { listMyMessages, markMessageRead, markAllMessagesRead, deleteMyMessage, getUnreadCount } from '@/api/system/messageCenter';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_message_type, sys_message_priority } = toRefs<any>(proxy?.useDict('sys_message_type', 'sys_message_priority'));

const messageList = ref<any[]>([]);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const messageDetailVisible = ref(false);
const currentMessage = ref<any>(null);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  messageType: undefined,
  isRead: undefined
});

// 是否有未读消息
const hasUnread = computed(() => {
  return messageList.value.some((msg) => msg.isRead === 'N');
});

/** 查询消息列表 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await listMyMessages(queryParams.value);
    messageList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    messageType: undefined,
    isRead: undefined
  };
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: any[]) => {
  ids.value = selection.map((item) => item.logId);
  multiple.value = !selection.length;
};

/** 查看消息详情 */
const handleViewMessage = async (row: any) => {
  currentMessage.value = row;
  messageDetailVisible.value = true;

  // 如果是未读消息，标记为已读
  if (row.isRead === 'N') {
    await markMessageRead(row.logId);
    row.isRead = 'Y';
    // 刷新徽章数量
    await refreshNavbarBadge();
  }
};

/** 标记单条消息已读 */
const handleMarkRead = async (row: any) => {
  await markMessageRead(row.logId);
  proxy?.$modal.msgSuccess('标记成功');
  await getList();
  // 刷新徽章数量
  await refreshNavbarBadge();
};

/** 全部标记已读 */
const handleMarkAllRead = async () => {
  await proxy?.$modal.confirm('确认将所有未读消息标记为已读吗？');
  await markAllMessagesRead();
  proxy?.$modal.msgSuccess('标记成功');
  await getList();
  // 刷新徽章数量
  await refreshNavbarBadge();
};

/** 删除按钮操作 */
const handleDelete = async (row?: any) => {
  const _ids = row?.logId || ids.value;
  await proxy?.$modal.confirm('是否确认删除选中的消息？');
  await deleteMyMessage(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
  // 刷新徽章数量
  await refreshNavbarBadge();
};

/** 刷新Navbar徽章数量 */
const refreshNavbarBadge = async () => {
  try {
    const { data } = await getUnreadCount();
    // 触发自定义事件，通知Navbar更新
    window.dispatchEvent(new CustomEvent('update-unread-count', { detail: data }));
  } catch (error) {
    console.error('刷新徽章数量失败:', error);
  }
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.my-messages {
  .search-form {
    margin-bottom: 16px;
  }

  .message-title-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .message-detail {
    .message-content {
      padding: 16px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
      min-height: 200px;
      max-height: 500px;
      overflow-y: auto;

      :deep(img) {
        max-width: 100%;
      }
    }
  }
}
</style>

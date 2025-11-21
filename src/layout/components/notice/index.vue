<template>
  <div v-loading="state.loading" class="layout-navbars-breadcrumb-user-news">
    <div class="head-box">
      <div class="head-box-title">我的消息</div>
      <div v-if="newsList.length > 0" class="head-box-btn" @click="handleMarkAllRead">全部已读</div>
    </div>
    <div v-loading="state.loading" class="content-box">
      <template v-if="newsList.length > 0">
        <div v-for="item in newsList" :key="item.logId" class="content-box-item" @click="onNewsClick(item)">
          <div class="item-conten">
            <div class="message-title">{{ item.messageTitle }}</div>
            <div class="content-box-msg">
              <dict-tag :options="sys_message_type" :value="item.messageType" />
            </div>
            <div class="content-box-time">{{ item.sendTime }}</div>
          </div>
          <!-- 已读/未读 -->
          <span v-if="item.isRead === 'Y'" class="el-tag el-tag--success el-tag--mini read">已读</span>
          <span v-else class="el-tag el-tag--danger el-tag--mini read">未读</span>
        </div>
      </template>
      <el-empty v-else :description="'暂无消息'"></el-empty>
    </div>
    <div class="foot-box" @click="goToMessageCenter">
      <el-link :underline="false" type="primary">前往消息中心</el-link>
    </div>
  </div>
</template>

<script lang="ts" name="layoutBreadcrumbUserNews" setup>
import { useRouter } from 'vue-router';
import { listMyMessages, markAllMessagesRead, markMessageRead } from '@/api/system/messageCenter';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const { sys_message_type } = toRefs<any>(proxy?.useDict('sys_message_type'));
// 定义变量内容
const state = reactive({
  loading: false
});
const newsList = ref<any[]>([]);

/**
 * 加载消息列表（只显示前10条未读消息）
 */
const getTableData = async () => {
  state.loading = true;
  try {
    const { rows } = await listMyMessages({
      pageNum: 1,
      pageSize: 10,
      isRead: 'N' // 只显示未读消息
    });
    newsList.value = rows || [];
  } catch (error) {
    console.error('加载消息列表失败:', error);
  } finally {
    state.loading = false;
  }
};

// 点击消息，标记为已读并跳转到消息中心
const onNewsClick = async (item: any) => {
  if (item.isRead === 'N') {
    try {
      await markMessageRead(item.logId);
      // 更新本地状态
      item.isRead = 'Y';
      // 通知父组件刷新未读数量
      emitRefreshUnreadCount();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }
  // 跳转到消息中心
  router.push('/system/messageCenter');
};

// 全部标记已读
const handleMarkAllRead = async () => {
  try {
    await markAllMessagesRead();
    proxy?.$modal.msgSuccess('全部标记已读成功');
    // 刷新列表
    await getTableData();
    // 通知父组件刷新未读数量
    emitRefreshUnreadCount();
  } catch (error) {
    console.error('全部标记已读失败:', error);
  }
};

// 前往消息中心
const goToMessageCenter = () => {
  router.push('/system/messageCenter');
};

// 定义 emit
const emit = defineEmits(['refresh-unread-count']);

// 通知父组件刷新未读数量
const emitRefreshUnreadCount = () => {
  emit('refresh-unread-count');
};

// 暴露刷新方法供外部调用
defineExpose({
  getTableData
});

onMounted(() => {
  getTableData();
});
</script>

<style lang="scss" scoped>
.layout-navbars-breadcrumb-user-news {
  .head-box {
    display: flex;
    border-bottom: 1px solid var(--el-border-color-lighter);
    box-sizing: border-box;
    color: var(--el-text-color-primary);
    justify-content: space-between;
    height: 35px;
    align-items: center;

    .head-box-btn {
      color: var(--el-color-primary);
      font-size: 13px;
      cursor: pointer;
      opacity: 0.8;

      &:hover {
        opacity: 1;
      }
    }
  }

  .content-box {
    height: 300px;
    overflow: auto;
    font-size: 13px;

    .content-box-item {
      padding-top: 12px;
      display: flex;

      &:last-of-type {
        padding-bottom: 12px;
      }

      .content-box-msg {
        color: var(--el-text-color-secondary);
        margin-top: 5px;
        margin-bottom: 5px;
      }

      .content-box-time {
        color: var(--el-text-color-secondary);
      }

      .item-conten {
        width: 100%;
        display: flex;
        flex-direction: column;
        cursor: pointer;

        .message-title {
          font-weight: 500;
          margin-bottom: 4px;
        }
      }
    }
  }

  .foot-box {
    height: 35px;
    color: var(--el-color-primary);
    font-size: 13px;
    cursor: pointer;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid var(--el-border-color-lighter);

    &:hover {
      opacity: 1;
    }
  }

  :deep(.el-empty__description p) {
    font-size: 13px;
  }
}
</style>

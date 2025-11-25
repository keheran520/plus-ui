<template>
  <el-card :body-style="{ padding: 0 }" class="mb-4 border-none announcement-card" shadow="never">
    <div v-show="false" class="relative h-32 overflow-hidden cursor-pointer group">
      <img
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-400/90 flex items-center p-6">
        <div class="text-white">
          <h3 class="text-lg font-bold mb-1">RuoYi-Vue-Plus 交流群</h3>
          <p class="text-sm opacity-90 mb-2">加入我们，一起交流学习</p>
          <div class="flex gap-3">
            <img class="h-5 bg-white rounded p-0.5" src="https://gitee.com/dromara/RuoYi-Vue-Plus/widgets/widget_1.svg" />
            <img class="h-5" src="https://img.shields.io/github/stars/dromara/RuoYi-Vue-Plus?style=social" />
          </div>
        </div>
        <div class="ml-auto bg-white p-1 rounded shadow-lg hidden lg:block">
          <!-- 模拟二维码 -->
          <div class="w-16 h-16 bg-gray-100 flex items-center justify-center text-xs text-gray-400">二维码</div>
        </div>
      </div>
    </div>

    <div class="p-4">
      <div class="flex justify-between items-center mb-3">
        <span class="font-bold text-base">通知公告</span>
        <el-link v-if="noticeList.length > 0" :underline="false" class="text-xs" type="primary" @click="goToMessageCenter">
          更多
        </el-link>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading && noticeList.length === 0" class="text-center py-8 text-gray-400 text-sm">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span class="ml-2">加载中...</span>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="!loading && noticeList.length === 0" class="text-center py-8 text-gray-400 text-sm">
        暂无通知公告
      </div>
      
      <!-- 公告列表 -->
      <div v-else class="space-y-3">
        <div 
          v-for="(item, index) in noticeList" 
          :key="item.messageId" 
          class="flex items-center text-sm group cursor-pointer"
          @click="handleViewDetail(item)"
        >
          <el-tag :type="getTagType(item.messageType)" class="mr-2 flex-shrink-0" size="small">
            {{ getTagText(item.messageType) }}
          </el-tag>
          <span class="text-gray-600 truncate group-hover:text-blue-500 transition-colors flex-1">
            {{ item.messageTitle }}
          </span>
          <span class="text-xs text-gray-400 ml-2 flex-shrink-0">
            {{ formatDate(item.sendTime) }}
          </span>
        </div>
      </div>
    </div>
  </el-card>
  
  <!-- 公告详情对话框 -->
  <el-dialog 
    v-model="detailVisible" 
    :title="currentNotice?.messageTitle" 
    width="700px"
    :close-on-click-modal="false"
  >
    <div v-if="currentNotice" class="notice-detail">
      <div class="detail-meta mb-4 pb-3 border-b border-gray-200">
        <el-tag :type="getTagType(currentNotice.messageType)" size="small" class="mr-2">
          {{ getTagText(currentNotice.messageType) }}
        </el-tag>
        <span class="text-sm text-gray-500">发布时间：{{ currentNotice.sendTime }}</span>
      </div>
      <div class="detail-content" v-html="currentNotice.messageContent"></div>
    </div>
    <template #footer>
      <el-button @click="detailVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Loading } from '@element-plus/icons-vue';
import { listPublishedMessage, getPublishedMessage } from '@/api/system/message';
import { MessageVO } from '@/api/system/message/types';
import { ElMessage } from 'element-plus';

const router = useRouter();

// 公告列表
const noticeList = ref<MessageVO[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);

// 详情对话框
const detailVisible = ref(false);
const currentNotice = ref<MessageVO | null>(null);

// 获取公告列表
const getNoticeList = async () => {
  loading.value = true;
  try {
    const res = await listPublishedMessage({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    });
    if (res && res.rows) {
      noticeList.value = res.rows;
      total.value = res.total || 0;
    }
  } catch (error) {
    console.error('获取公告列表失败：', error);
    ElMessage.error('获取公告列表失败');
  } finally {
    loading.value = false;
  }
};

// 跳转到消息中心
const goToMessageCenter = () => {
  router.push('/system/messageCenter');
};

// 查看详情
const handleViewDetail = async (item: MessageVO) => {
  try {
    const res = await getPublishedMessage(item.messageId);
    if (res && res.data) {
      currentNotice.value = res.data;
      detailVisible.value = true;
    }
  } catch (error) {
    console.error('获取公告详情失败：', error);
    ElMessage.error('获取公告详情失败');
  }
};

// 获取标签类型
const getTagType = (messageType: string): '' | 'success' | 'info' | 'warning' | 'danger' => {
  const typeMap: Record<string, '' | 'success' | 'info' | 'warning' | 'danger'> = {
    'notice': '',
    'announcement': 'success',
    'warning': 'warning',
    'urgent': 'danger'
  };
  return typeMap[messageType] || 'info';
};

// 获取标签文本
const getTagText = (messageType: string): string => {
  const textMap: Record<string, string> = {
    'notice': '通知',
    'announcement': '公告',
    'warning': '警告',
    'urgent': '紧急'
  };
  return textMap[messageType] || '消息';
};

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 1小时内
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }
  
  // 24小时内
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }
  
  // 7天内
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}天前`;
  }
  
  // 显示具体日期
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}-${day}`;
};

onMounted(() => {
  getNoticeList();
});
</script>

<style scoped>
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.h-32 {
  height: 8rem;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.object-cover {
  object-fit: cover;
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-blue-600\/90 {
  --tw-gradient-from: rgb(37 99 235 / 0.9);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-blue-400\/90 {
  --tw-gradient-to: rgb(96 165 250 / 0.9);
}

.text-white {
  color: #fff;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.p-6 {
  padding: 1.5rem;
}

.p-4 {
  padding: 1rem;
}

.p-1 {
  padding: 0.25rem;
}

.p-0\.5 {
  padding: 0.125rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.ml-auto {
  margin-left: auto;
}

.mr-2 {
  margin-right: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.font-bold {
  font-weight: 700;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.opacity-90 {
  opacity: 0.9;
}

.rounded {
  border-radius: 0.25rem;
}

.shadow-lg {
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.overflow-hidden {
  overflow: hidden;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-500 {
  transition-duration: 500ms;
}

.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:text-blue-500 {
  color: #3b82f6;
}

.w-16 {
  width: 4rem;
}

.h-16 {
  height: 4rem;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-white {
  background-color: #fff;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-600 {
  color: #4b5563;
}

.space-y-3 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.hidden {
  display: none;
}

@media (min-width: 1024px) {
  .lg\:block {
    display: block;
  }
}

.mb-4 {
  margin-bottom: 1rem;
}

.border-none {
  border: none;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.cursor-pointer {
  cursor: pointer;
}

.flex-1 {
  flex: 1 1 0%;
}

.ml-2 {
  margin-left: 0.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.text-center {
  text-align: center;
}

.pb-3 {
  padding-bottom: 0.75rem;
}

.border-b {
  border-bottom-width: 1px;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.text-gray-500 {
  color: #6b7280;
}

/* 公告详情内容样式 */
.notice-detail {
  min-height: 200px;
}

.detail-content {
  line-height: 1.8;
  color: #333;
}

.detail-content :deep(p) {
  margin-bottom: 1em;
}

.detail-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1em 0;
}

.detail-content :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.detail-content :deep(a:hover) {
  text-decoration: underline;
}
</style>

<template>
  <teleport to="body">
    <div v-if="visible" class="image-viewer-container" @click.self="handleClose" @wheel="handleContainerWheel">
      <!-- 背景模糊层 -->
      <div :style="{ backgroundImage: `url(${currentImage?.url})` }" class="photo-viewer-bg"></div>

      <!-- 左上角：创建人信息 -->
      <div class="viewer-header-left">
        <el-avatar :size="24" :src="currentImage?.createByUser?.avatar" icon="UserFilled" />
        <div class="creator-info">
          <div class="creator-name">{{ currentImage?.createByUser?.nickName || '游客' }}</div>
        </div>
      </div>

      <!-- 右上角：操作按钮 -->
      <div class="viewer-header-right" :class="{ 'with-panel': showInfo }">
        <el-button v-if="isLiked" :icon="Star" circle @click="handleLike" />
        <el-button v-else-if="!isLiked" circle @click="handleLike">
          <el-icon color="#f56c6c">
            <StarFilled />
          </el-icon>
        </el-button>
        <!--        <el-button :icon="Warning" circle @click="handleReport"></el-button>-->
        <el-button :icon="InfoFilled" :loading="detailLoading" circle @click="handleToggleInfo"></el-button>
        <el-button :icon="Close" circle @click="handleClose"></el-button>
      </div>

      <!-- 主内容区域 -->
      <div class="viewer-main" :class="{ 'with-panel': showInfo }">
        <!-- 图片显示区域 -->
        <div class="image-display-area">
          <!-- 图片 -->
          <div class="image-container">
            <img :alt="currentImage?.imageName" :src="currentImage?.url" :style="imageStyle" @load="handleImageLoad" />
          </div>

          <!-- 左右切换按钮 -->
          <div v-if="hasPrev" class="nav-button nav-prev" @click="handlePrev">
            <el-icon :size="30">
              <ArrowLeft />
            </el-icon>
          </div>
          <div v-if="hasNext" class="nav-button nav-next" @click="handleNext">
            <el-icon :size="30">
              <ArrowRight />
            </el-icon>
          </div>
        </div>

        <!-- 右侧：详细信息面板 -->
        <transition name="slide-right">
          <div v-if="showInfo" class="info-panel">
            <div class="info-header">
              <h3>图片信息</h3>
              <el-button :icon="Close" text @click="showInfo = false" />
            </div>

            <div class="info-content">
              <div class="info-item">
                <label>文件名</label>
                <div class="info-value">{{ currentImage?.imageName || currentImage?.originalName }}</div>
              </div>

              <div class="info-item">
                <label>格式</label>
                <div class="info-value">{{ currentImage?.fileSuffix || 'JPG' }}</div>
              </div>

              <div class="info-item">
                <label>尺寸</label>
                <div class="info-value">{{ currentImage?.ossExt?.width }} × {{ currentImage?.ossExt?.height }} 像素</div>
              </div>

              <div class="info-item">
                <label>文件大小</label>
                <div class="info-value">{{ formatSize(currentImage?.ossExt?.fileSize) }}</div>
              </div>

              <div class="info-item">
                <label>上传时间</label>
                <div class="info-value">{{ currentImage?.createTime }}</div>
              </div>

              <div class="info-item">
                <label>分类</label>
                <div class="info-value">{{ currentImage?.categoryName || '-' }}</div>
              </div>

              <div class="info-item">
                <label>标签</label>
                <div class="info-value">
                  <el-tag v-for="tag in currentImage?.tagList" :key="tag.tagId" class="mr-1" size="small">
                    {{ tag.tagName }}
                  </el-tag>
                  <span v-if="!currentImage?.tagList || currentImage?.tagList.length === 0">-</span>
                </div>
              </div>

              <div class="info-item">
                <label>描述</label>
                <div class="info-value">{{ currentImage?.description || '-' }}</div>
              </div>
            </div>

            <!-- 上传者信息 -->
            <div class="uploader-section">
              <h4>上传者</h4>
              <div class="uploader-card">
                <el-avatar :size="50" :src="currentImage?.createByUser?.avatar">
                  {{ currentImage?.createByUser?.nickName?.charAt(0) || '游' }}
                </el-avatar>
                <div class="uploader-info">
                  <div class="uploader-name">{{ currentImage?.createByUser?.nickName || '游客' }}</div>
                  <div class="uploader-stats">
                    <span>上传于 {{ formatTime(currentImage?.createTime) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 底部：缩略图列表 -->
      <div class="thumbnail-list" @wheel.prevent="handleThumbnailWheel">
        <div class="thumbnail-wrapper">
          <div
            v-for="(image, index) in imageList"
            :key="image.imageId"
            :class="['thumbnail-item', { active: currentIndex === index }]"
            @click="handleSelectImage(index)"
          >
            <img :alt="image.imageName" :src="image.url" />
            <div class="thumbnail-indicator">{{ index + 1 }}</div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { ArrowLeft, ArrowRight, Close, InfoFilled, Star, StarFilled, Warning } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getPublicImageDetail } from '@/api/picturebed/open';

interface Props {
  modelValue: boolean;
  imageList: any[];
  initialIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  initialIndex: 0
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'like': [image: any];
  'report': [image: any];
  'download': [image: any];
}>();

// 状态
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const currentIndex = ref(props.initialIndex);
const showInfo = ref(false);
const isLiked = ref(false);
const scale = ref(1);
const rotate = ref(0);
const detailLoading = ref(false);
const imageDetail = ref<any>(null);

// 当前图片
const currentImage = computed(() => {
  // 如果已加载详情，使用详情数据，否则使用列表数据
  return imageDetail.value || props.imageList[currentIndex.value];
});

// 是否有上一张/下一张
const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < props.imageList.length - 1);

// 图片样式
const imageStyle = computed(() => ({
  transform: `scale(${scale.value}) rotate(${rotate.value}deg)`,
  transition: 'transform 0.3s ease'
}));

// 监听初始索引变化
watch(
  () => props.initialIndex,
  (val) => {
    currentIndex.value = val;
    resetImageState();
    imageDetail.value = null; // 重置详情数据
  }
);

// 监听当前索引变化，重置详情数据
watch(
  () => currentIndex.value,
  () => {
    imageDetail.value = null; // 切换图片时重置详情
  }
);

// 重置图片状态
const resetImageState = () => {
  scale.value = 1;
  rotate.value = 0;
};

// 处理图片加载
const handleImageLoad = () => {
  // 图片加载完成
};

// 加载图片详情
const loadImageDetail = async () => {
  const image = props.imageList[currentIndex.value];
  if (!image?.imageId) {
    return;
  }

  try {
    detailLoading.value = true;
    const res = await getPublicImageDetail(image.imageId);
    if (res.code === 200 && res.data) {
      imageDetail.value = res.data;
    }
  } catch (error) {
    console.error('加载图片详情失败:', error);
  } finally {
    detailLoading.value = false;
  }
};

// 切换图片
const handlePrev = () => {
  if (hasPrev.value) {
    currentIndex.value--;
    resetImageState();
    setTimeout(scrollToCurrentThumbnail, 100);
  }
};

const handleNext = () => {
  if (hasNext.value) {
    currentIndex.value++;
    resetImageState();
    setTimeout(scrollToCurrentThumbnail, 100);
  }
};

// 选择图片
const handleSelectImage = (index: number) => {
  currentIndex.value = index;
  resetImageState();
  setTimeout(scrollToCurrentThumbnail, 100);
};

// 缩放
const handleZoomIn = () => {
  scale.value = Math.min(scale.value + 0.2, 3);
};

const handleZoomOut = () => {
  scale.value = Math.max(scale.value - 0.2, 0.5);
};

const handleZoomReset = () => {
  scale.value = 1;
};

// 旋转
const handleRotateLeft = () => {
  rotate.value -= 90;
};

const handleRotateRight = () => {
  rotate.value += 90;
};

// 点赞
const handleLike = () => {
  isLiked.value = !isLiked.value;
  emit('like', currentImage.value);
  ElMessage.success(isLiked.value ? '已点赞' : '已取消点赞');
};

// 举报
const handleReport = () => {
  emit('report', currentImage.value);
  ElMessage.info('举报功能开发中');
};

// 下载
const handleDownload = () => {
  emit('download', currentImage.value);
  window.open(currentImage.value?.url, '_blank');
};

// 切换详情面板
const handleToggleInfo = async () => {
  if (!showInfo.value) {
    // 打开详情面板时，如果没有详情数据则加载
    if (!imageDetail.value) {
      await loadImageDetail();
    }
  }
  showInfo.value = !showInfo.value;
};

// 关闭
const handleClose = () => {
  visible.value = false;
  imageDetail.value = null; // 关闭时清空详情数据
};

// 格式化文件大小
const formatSize = (bytes: number | undefined) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// 格式化时间
const formatTime = (time: string | undefined) => {
  if (!time) return '-';
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;

  return time;
};

// 容器滚轮事件（区分缩略图区域）
const handleContainerWheel = (e: WheelEvent) => {
  const target = e.target as HTMLElement;
  // 如果是在缩略图区域，不处理
  if (target.closest('.thumbnail-list')) {
    return;
  }

  // 阻止默认滚动
  e.preventDefault();

  if (e.deltaY < 0) {
    // 向上滚动，放大
    handleZoomIn();
  } else {
    // 向下滚动，缩小
    handleZoomOut();
  }
};

// 缩略图滚轮横向滚动
const handleThumbnailWheel = (e: WheelEvent) => {
  const container = e.currentTarget as HTMLElement;
  container.scrollLeft += e.deltaY;
};

// 滚动到当前缩略图
const scrollToCurrentThumbnail = () => {
  const thumbnailList = document.querySelector('.thumbnail-list');
  const currentThumbnail = document.querySelector('.thumbnail-item.active');

  if (thumbnailList && currentThumbnail) {
    const listRect = thumbnailList.getBoundingClientRect();
    const thumbRect = currentThumbnail.getBoundingClientRect();
    const scrollLeft = thumbnailList.scrollLeft;

    // 计算需要滚动的距离，让当前缩略图居中
    const targetScroll = scrollLeft + thumbRect.left - listRect.left - listRect.width / 2 + thumbRect.width / 2;

    thumbnailList.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }
};

// 键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  if (!visible.value) return;

  switch (e.key) {
    case 'ArrowLeft':
      handlePrev();
      break;
    case 'ArrowRight':
      handleNext();
      break;
    case 'Escape':
      handleClose();
      break;
  }
};

// 添加键盘监听，并禁用body滚动
watch(visible, (val) => {
  if (val) {
    document.addEventListener('keydown', handleKeydown);
    // 禁用body滚动
    document.body.style.overflow = 'hidden';
    // 滚动到当前缩略图
    setTimeout(scrollToCurrentThumbnail, 100);
  } else {
    document.removeEventListener('keydown', handleKeydown);
    // 恢复body滚动
    document.body.style.overflow = '';
  }
});
</script>

<style lang="scss" scoped>
.image-viewer-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  color: #fff;
  z-index: 9999;
  overflow: hidden;
}

// 背景模糊层
.photo-viewer-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(12px);
  transform: scale(1.1);

  // 第一层：灰色半透明遮罩
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #6b728099;
    z-index: 1;
  }

  // 第二层：黑色半透明遮罩，让背景更暗
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 2;
  }
}

// 左上角：创建人信息
.viewer-header-left {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  background: var(--bg-gray-600);
  padding: 8px 10px;
  border-radius: 50px;
  backdrop-filter: blur(10px);

  .creator-info {
    .creator-name {
      font-size: 0.75rem;
    }

    &:hover {
      background: var(--bg-gray-hover);
    }
  }
}

// 右上角：操作按钮
.viewer-header-right {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.with-panel {
    right: 370px; // 面板宽度 350px + 间距 20px
  }

  .el-button {
    background: var(--bg-gray-600);
    border: none;
    color: #fff;
    backdrop-filter: blur(10px);

    &:hover {
      background: var(--bg-gray-hover);
    }
  }
}

// 主内容区域
.viewer-main {
  display: flex;
  height: calc(100vh - 120px);
  padding-top: 80px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.with-panel {
    margin-right: 350px;
  }
}

// 图片显示区域
.image-display-area {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .image-container {
    max-width: 90%;
    max-height: 90%;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      max-width: 100%;
      max-height: calc(100vh - 250px);
      object-fit: contain;
      user-select: none;
    }
  }

  // 左右切换按钮
  .nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-50%) scale(1.1);
    }

    &.nav-prev {
      left: 20px;
    }

    &.nav-next {
      right: 20px;
    }
  }
}

// 右侧信息面板
.info-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(30px) saturate(180%);
  overflow-y: auto;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
  z-index: 100;

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .info-content {
    padding: 20px;

    .info-item {
      margin-bottom: 16px;

      label {
        display: block;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 6px;
      }

      .info-value {
        font-size: 14px;
        color: #fff;
        word-break: break-all;
      }
    }
  }

  .uploader-section {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    h4 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
    }

    .uploader-card {
      display: flex;
      gap: 12px;
      align-items: center;

      .uploader-info {
        flex: 1;

        .uploader-name {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .uploader-stats {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }
}

// 底部缩略图列表
.thumbnail-list {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(30px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
  overflow-y: hidden;

  .thumbnail-wrapper {
    display: flex;
    gap: 8px;
    padding: 10px 10px;
    height: 100%;

    .thumbnail-item {
      flex-shrink: 0;
      width: 80px;
      height: 80px;
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(255, 255, 255, 0.5);
        transform: scale(1.05);
      }

      &.active {
        transform: translateY(-4px);
        border-color: white;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .thumbnail-indicator {
        position: absolute;
        top: 1px;
        left: 1px;
        transition: opacity 0.2s ease;
        background: #000000b3;
        color: #fff;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 4px;
        border-radius: var(--radius-sm);
        opacity: 0;
      }

      &:hover .thumbnail-indicator {
        opacity: 1;
      }

      &.active .thumbnail-indicator {
        opacity: 1;
      }
    }
  }
}

// 右侧抽屉滑入动画
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
}
</style>

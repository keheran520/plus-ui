<template>
  <div class="square-container">
    <!-- 顶部导航 -->
    <div class="square-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">图片广场</h1>
          <p class="page-subtitle">发现精彩瞬间</p>
        </div>
        <div class="header-right">
          <el-button :icon="HomeFilled" @click="goToHome">返回首页</el-button>
          <el-button :icon="User" type="primary" @click="goToLogin">登录</el-button>
        </div>
      </div>
    </div>

    <!-- 图片瀑布流 -->
    <div v-loading="loading" class="square-content">
      <div class="images-waterfall">
        <div v-for="(image, index) in imageList" :key="image.imageId" class="waterfall-item">
          <div :style="getImageStyle(image)" class="image-wrapper" @click="handlePreview(index)">
            <img v-if="image.url" :alt="image.imageName" :src="image.url" />

            <!-- 图片信息叠加层 -->
            <div class="image-info-overlay">
              <div class="image-info-content">
                <p :title="image.imageName || image.originalName" class="image-name">
                  {{ image.imageName || image.originalName }}
                </p>
                <p class="image-meta">
                  <span class="image-format">{{ image.fileSuffix || 'JPG' }}</span>
                  <span v-if="image.ossExt?.width && image.ossExt?.height" class="image-dimension">
                    {{ image.ossExt.width }} × {{ image.ossExt.height }}
                  </span>
                  <span class="image-size">{{ formatSize(image.ossExt?.fileSize || 0) }}</span>
                </p>
                <p class="image-author">
                  <el-icon>
                    <User />
                  </el-icon>
                  <span>{{ image?.createByName || '游客' }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多提示 -->
      <div v-if="hasMore" class="load-more-tip">
        <span v-if="loading">加载中...</span>
        <span v-else>滚动加载更多</span>
      </div>
      <div v-else-if="imageList.length > 0" class="load-more-tip">
        <span>没有更多了</span>
      </div>
      <div v-else-if="!loading" class="empty-tip">
        <el-empty description="暂无公开图片" />
      </div>
    </div>

    <!-- 图片查看器 -->
    <ImageViewer v-model="previewVisible" :image-list="imageList" :initial-index="previewIndex" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { HomeFilled, User } from '@element-plus/icons-vue';
import ImageViewer from '@/components/ImageViewer/index.vue';
import { getPublicImages } from '@/api/picturebed/open';

const router = useRouter();

// 图片列表
const imageList = ref<any[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const queryParams = ref({
  pageNum: 1,
  pageSize: 20
});

// 预览
const previewVisible = ref(false);
const previewIndex = ref(0);

// 获取公开图片列表
const getImageList = async () => {
  if (loading.value || !hasMore.value) return;

  try {
    loading.value = true;
    const res = await getPublicImages(queryParams.value);

    if (res.code === 200) {
      const newImages = res.rows || [];
      imageList.value = [...imageList.value, ...newImages];
      hasMore.value = newImages.length === queryParams.value.pageSize;
      queryParams.value.pageNum++;
    }
  } catch (error) {
    console.error('获取图片列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    getImageList();
  }
};

// 监听滚动事件
const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  const scrollHeight = document.documentElement.scrollHeight;

  // 距离底部200px时触发加载
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadMore();
  }
};

// 计算图片样式
const getImageStyle = (image: any) => {
  const width = image.ossExt?.width || 300;
  const height = image.ossExt?.height || 200;
  const aspectRatio = height / width;

  return {
    paddingTop: `${aspectRatio * 100}%`
  };
};

// 格式化文件大小
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

// 预览图片
const handlePreview = (index: number) => {
  previewIndex.value = index;
  previewVisible.value = true;
};

// 跳转到首页
const goToHome = () => {
  router.push('/picturebed/home');
};

// 跳转到登录
const goToLogin = () => {
  router.push('/login');
};

onMounted(() => {
  getImageList();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
.square-container {
  min-height: 100vh;
  background: #f5f7fa;
}

// 顶部导航
.square-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1600px;
    margin: 0 auto;
    padding: 20px 40px;

    .header-left {
      .page-title {
        margin: 0 0 4px;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      .page-subtitle {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }
}

// 内容区域
.square-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px;
}

// 瀑布流布局
.images-waterfall {
  column-count: 5;
  column-gap: 10px;

  // 响应式断点
  @media (max-width: 1600px) {
    column-count: 4;
  }

  @media (max-width: 1200px) {
    column-count: 3;
  }

  @media (max-width: 768px) {
    column-count: 2;
  }

  @media (max-width: 480px) {
    column-count: 1;
  }

  .waterfall-item {
    break-inside: avoid;
    margin-bottom: 10px;
    cursor: pointer;
    border-radius: 12px;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

      .image-wrapper .image-info-overlay {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .image-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
      background: #f5f7fa;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-info-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.6) 60%, transparent 100%);
        padding: 40px 16px 16px;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        pointer-events: none;

        .image-info-content {
          .image-name {
            margin: 0 0 8px;
            font-size: 14px;
            font-weight: 500;
            color: #ffffff;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .image-meta {
            display: flex;
            gap: 8px;
            align-items: center;
            margin: 0 0 8px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.9);

            .image-format {
              padding: 2px 6px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 3px;
              font-weight: 500;
            }

            .image-dimension,
            .image-size {
              color: rgba(255, 255, 255, 0.8);
            }
          }

          .image-author {
            display: flex;
            align-items: center;
            gap: 4px;
            margin: 0;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);

            .el-icon {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}

// 加载提示
.load-more-tip {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
  font-size: 14px;
}

.empty-tip {
  padding: 80px 20px;
}
</style>

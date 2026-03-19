<template>
  <div class="album-detail-wrapper">
    <div class="album-detail-container">
      <!-- 页头 -->
      <el-page-header class="bg-white p-5" @back="handleBack">
        <template #content>
          <span class="text-large font-600 mr-3">{{ albumInfo.albumName || '相册详情' }}</span>
        </template>
        <template #extra>
          <div class="header-actions">
            <el-button :icon="Upload" type="primary" @click="uploadVisible = true">批量上传图片</el-button>
            <el-button :icon="Plus" type="success" @click="addImageVisible = true">添加已有图片</el-button>
          </div>
        </template>
      </el-page-header>

      <!-- 相册信息卡片 -->
      <el-card class="album-info-card mb-4" shadow="never">
        <div class="album-info-content">
          <div class="album-cover-large">
            <img v-if="albumInfo.albumCover" :alt="albumInfo.albumName" :src="albumInfo.albumCover" />
            <div v-else class="cover-placeholder">
              <el-icon :size="80" color="#d0d0d0">
                <Picture />
              </el-icon>
            </div>
          </div>

          <div class="album-meta">
            <h1 class="album-title">{{ albumInfo.albumName }}</h1>
            <p v-if="albumInfo.description" class="album-description">{{ albumInfo.description }}</p>
            <p v-else class="album-description text-gray-400">暂无描述</p>

            <div class="album-stats-row">
              <div class="stat-item">
                <el-icon :size="18" color="#409eff">
                  <Picture />
                </el-icon>
                <span>{{ albumInfo.imageCount || 0 }} 张图片</span>
              </div>
              <div class="stat-item">
                <el-icon :size="18" color="#67c23a">
                  <Folder />
                </el-icon>
                <span>{{ formatSize(albumInfo.totalSize) }}</span>
              </div>
              <div class="stat-item">
                <el-icon :size="18" color="#909399">
                  <Clock />
                </el-icon>
                <span>{{ formatDate(albumInfo.createTime) }}</span>
              </div>
            </div>

            <div class="album-tags">
              <el-tag v-if="albumInfo.isPublic === 'Y'" type="success">
                <el-icon class="mr-1">
                  <Unlock />
                </el-icon>
                公开
              </el-tag>
              <el-tag v-else type="info">
                <el-icon class="mr-1">
                  <Lock />
                </el-icon>
                私密
              </el-tag>
              <el-tag v-if="albumInfo.status === '0'" type="success">正常</el-tag>
              <el-tag v-else type="danger">已停用</el-tag>
            </div>
          </div>
        </div>
      </el-card>
      <!-- 主内容区域：图片网格 -->
      <el-card class="album-info-card mb-4" shadow="never">
        <!-- 图片网格 -->
        <div class="images-section">
          <div class="section-header">
            <h2 class="section-title">相册图片</h2>
            <div class="section-actions">
              <el-input
                v-model="searchKeyword"
                clearable
                placeholder="搜索图片..."
                style="width: 200px"
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
              <el-button-group>
                <el-button :icon="Grid" :type="viewMode === 'grid' ? 'primary' : ''" @click="viewMode = 'grid'" />
                <el-button :icon="List" :type="viewMode === 'list' ? 'primary' : ''" @click="viewMode = 'list'" />
              </el-button-group>
            </div>
          </div>

          <!-- 图片网格视图（瀑布流） -->
          <div v-if="viewMode === 'grid'">
            <WaterfallLayout
              v-loading="loading"
              :border-radius="5"
              :column-count="4"
              :column-gap="5"
              :items="imageList"
              :padding="0"
              :row-gap="5"
              :scale-ratio="1.05"
              :show-load-more="false"
              hover-effect="scale"
              @item-click="handlePreviewImage"
            >
              <template #overlay="{ item }">
                <div class="image-overlay-content">
                  <p :title="item.imageName || item.originalName" class="image-name">
                    {{ item.imageName || item.originalName }}
                  </p>
                  <p class="image-meta">
                    <span class="image-format">{{ item.fileSuffix || 'JPG' }}</span>
                    <span v-if="item.ossExt?.width && item.ossExt?.height" class="image-dimension">
                      {{ item.ossExt.width }} × {{ item.ossExt.height }}
                    </span>
                    <span class="image-size">{{ formatSize(item.ossExt?.fileSize || 0) }}</span>
                  </p>
                  <p v-if="item.createByUser" class="image-author">
                    <el-icon><User /></el-icon>
                    <span>{{ item.createByUser.nickName }}</span>
                  </p>
                </div>
              </template>
            </WaterfallLayout>
          </div>

          <!-- 图片列表视图 -->
          <div v-else v-loading="loading" class="images-list">
            <el-table :data="imageList" stripe>
              <el-table-column align="center" label="预览" width="200">
                <template #default="{ row }">
                  <ImagePreview v-if="row.url" :height="100" :preview-src-list="[row.url]" :src="row.url" :width="100" />
                  <div
                    v-else
                    class="flex items-center justify-center bg-gray-100 border border-gray-300 rounded"
                    style="width: 100px; height: 100px; margin: 0 auto"
                  >
                    <span class="text-gray-400 text-sm">无图片</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="图片名称" prop="imageName" />
              <el-table-column label="大小">
                <template #default="{ row }">{{ formatSize(row.ossExt?.fileSize || 0) }}</template>
              </el-table-column>
              <el-table-column label="上传时间">
                <template #default="{ row }">{{ row.createTime }}</template>
              </el-table-column>
              <el-table-column fixed="right" label="操作" width="300">
                <template #default="{ row }">
                  <el-button :icon="View" link type="primary" @click="handlePreview(row)">预览</el-button>
                  <el-button :icon="Download" link type="success" @click="handleDownload(row)">下载</el-button>
                  <el-button :icon="Delete" link type="danger" @click="handleRemoveImage(row)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 空状态 -->
          <el-empty v-if="!loading && imageList.length === 0" description="暂无图片">
            <el-button :icon="Upload" type="primary" @click="uploadVisible = true">上传图片</el-button>
          </el-empty>

          <!-- 分页（仅列表视图显示） -->
          <pagination
            v-if="viewMode === 'list'"
            v-show="total > 0"
            v-model:limit="listParams.pageSize"
            v-model:page="listParams.pageNum"
            :total="total"
            @pagination="getImageList"
          />

          <!-- 加载更多提示（网格视图） -->
          <div v-if="viewMode === 'grid' && hasMore" class="load-more-tip">
            <span v-if="loading">加载中...</span>
            <span v-else>向下滚动加载更多</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图片查看器 -->
    <ImageViewer
      v-model="previewVisible"
      :image-list="imageList"
      :initial-index="previewIndex"
      @download="handleDownload"
      @like="handleLikeImage"
      @report="handleReportImage"
    />

    <!-- 批量上传组件 -->
    <BatchUpload v-model="uploadVisible" :album-id="albumInfo.albumId" title="批量上传图片到相册" @success="handleUploadSuccess" />

    <!-- 添加已有图片弹窗 -->
    <AddImageToAlbum v-if="albumInfo.albumId" v-model="addImageVisible" :album-id="albumInfo.albumId" @success="handleAddImageSuccess" />
  </div>
</template>

<script lang="ts" name="AlbumDetail" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Clock, Delete, Download, Folder, Grid, List, Lock, Picture, Plus, Search, Unlock, Upload, User, View } from '@element-plus/icons-vue';
import { getAlbumImages, getImageAlbum } from '@/api/picturebed/imageAlbum';
import { removeFromAlbum } from '@/api/picturebed/image';
import type { ImageAlbumVO } from '@/api/picturebed/imageAlbum/types';
import BatchUpload from '@/components/ImageUpload/BatchUpload.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import ImageViewer from '@/components/ImageViewer/index.vue';
import AddImageToAlbum from './components/AddImageToAlbum.vue';
import WaterfallLayout from '@/components/WaterfallLayout/index.vue';

const route = useRoute();
const router = useRouter();

// 状态
const loading = ref(false);
const albumInfo = ref<ImageAlbumVO>({} as ImageAlbumVO);
const imageList = ref<any[]>([]);
const total = ref(0);
const searchKeyword = ref('');
const viewMode = ref<'grid' | 'list'>('grid');
const previewVisible = ref(false);
const previewIndex = ref(0); // 预览图片的索引
const currentImage = ref<any>({});
const uploadVisible = ref(false);
const addImageVisible = ref(false);
const hasMore = ref(true); // 是否还有更多数据
const isLoadingMore = ref(false); // 是否正在加载更多

// 网格视图查询参数（无限滚动）
const gridParams = ref({
  pageNum: 1,
  pageSize: 20,
  albumId: route.params.id
});

// 列表视图查询参数（分页器）
const listParams = ref({
  pageNum: 1,
  pageSize: 20,
  albumId: route.params.id
});

// 当前使用的查询参数（根据视图模式动态切换）
const queryParams = computed(() => {
  return viewMode.value === 'grid' ? gridParams.value : listParams.value;
});

// 获取相册详情
const getAlbumDetail = async () => {
  const res = await getImageAlbum(route.params.id as string);
  albumInfo.value = res.data;
};

// 获取图片列表
const getImageList = async () => {
  // 检查 albumId 是否存在
  const albumId = route.params.id as string;
  if (!albumId || albumId === 'undefined') {
    console.warn('albumId is undefined, skipping getImageList');
    return;
  }
  
  loading.value = true;
  try {
    const params = viewMode.value === 'grid' ? gridParams.value : listParams.value;
    const res = await getAlbumImages(albumId, params);
    imageList.value = res.rows || [];
    total.value = res.total || 0;

    // 更新是否还有更多数据（用于网格视图）
    const totalPages = Math.ceil(total.value / params.pageSize);
    hasMore.value = params.pageNum < totalPages;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  if (viewMode.value === 'grid') {
    gridParams.value.pageNum = 1;
  } else {
    listParams.value.pageNum = 1;
  }
  getImageList();
};

// 返回
const handleBack = () => {
  router.back();
};

// 添加图片成功处理
const handleAddImageSuccess = () => {
  // 刷新相册详情和图片列表
  getAlbumDetail();
  getImageList();
};

// 上传成功处理
const handleUploadSuccess = (data: any) => {
  ElMessage({ message: `成功上传 ${data.length} 张图片`, type: 'success', plain: true });
  // 刷新图片列表
  getAlbumDetail();
  getImageList();
};

// 预览图片（用于列表视图和时间轴）
const handlePreview = (image: any) => {
  const index = imageList.value.findIndex((img) => img.imageId === image.imageId);
  previewIndex.value = index >= 0 ? index : 0;
  previewVisible.value = true;
};

// 预览图片（用于瀑布流视图）
const handlePreviewImage = (item: any, index: number) => {
  // 在imageList中找到这个图片的正确索引
  const actualIndex = imageList.value.findIndex((img) => img.imageId === item.imageId);
  previewIndex.value = actualIndex >= 0 ? actualIndex : index;
  previewVisible.value = true;
};

// 点赞图片
const handleLikeImage = (image: any) => {
  // TODO: 调用点赞API
  console.log('点赞图片:', image);
};

// 举报图片
const handleReportImage = (image: any) => {
  // TODO: 调用举报API
  console.log('举报图片:', image);
};

// 下载图片
const handleDownload = (image: any) => {
  window.open(image.imageUrl, '_blank');
};

// 从相册移除图片
const handleRemoveImage = (image: any) => {
  ElMessageBox.confirm(`确定要从相册中移除图片“${image.imageName}”吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await removeFromAlbum({
          imageIds: String(image.imageId),
          albumId: route.params.id as string
        });
        ElMessage({ message: '移除成功', type: 'success', plain: true });
        // 刷新相册详情和图片列表
        getAlbumDetail();
        getImageList();
      } catch (error) {
        ElMessage({ message: '移除失败', type: 'error', plain: true });
      }
    })
    .catch(() => {});
};

// 格式化文件大小
const formatSize = (bytes: number | undefined) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// 格式化日期
const formatDate = (date: string | Date | undefined) => {
  if (!date) return '-';
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;

  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

// 加载更多数据（网格视图无限滚动）
const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value || viewMode.value !== 'grid') return;

  // 检查 albumId 是否存在
  const albumId = route.params.id as string;
  if (!albumId || albumId === 'undefined') {
    console.warn('albumId is undefined, skipping loadMore');
    return;
  }

  isLoadingMore.value = true;
  gridParams.value.pageNum++;

  try {
    // 调用API加载下一页
    const res = await getAlbumImages(albumId, gridParams.value);
    const newImages = res.rows || [];

    if (newImages.length > 0) {
      // 追加新图片到列表
      imageList.value.push(...newImages);
    }

    // 更新总数
    total.value = res.total || 0;

    // 检查是否还有更多数据
    const totalPages = Math.ceil(total.value / gridParams.value.pageSize);
    hasMore.value = gridParams.value.pageNum < totalPages;
  } catch (error) {
    ElMessage({ message: '加载更多失败', type: 'error', plain: true });
    gridParams.value.pageNum--; // 回退页码
  } finally {
    isLoadingMore.value = false;
  }
};

// 监听滚动事件
const handleScroll = () => {
  if (viewMode.value !== 'grid') return;

  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  const scrollHeight = document.documentElement.scrollHeight;

  // 距离底部200px时触发加载
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadMore();
  }
};

// 监听视图模式切换
watch(viewMode, (newMode, oldMode) => {
  // 检查 albumId 是否存在，避免在离开页面后触发
  const albumId = route.params.id as string;
  if (!albumId || albumId === 'undefined') {
    return;
  }
  
  if (newMode !== oldMode) {
    // 切换视图时重置当前视图的分页参数
    if (newMode === 'grid') {
      gridParams.value.pageNum = 1;
    } else {
      listParams.value.pageNum = 1;
    }
    // 重新加载数据
    imageList.value = [];
    getImageList();
  }
});

onMounted(() => {
  // 只在 albumId 存在时才加载数据
  const albumId = route.params.id as string;
  if (albumId && albumId !== 'undefined') {
    getAlbumDetail();
    getImageList();
  }

  // 添加滚动监听
  window.addEventListener('scroll', handleScroll);
});

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
.album-detail-container {
}

// 页头操作按钮
.header-actions {
  display: flex;
  gap: 12px;
}

// 相册信息卡片
.album-info-card {
  border-radius: 8px;
  margin: var(--spacing-md);

  .album-info-content {
    display: flex;
    gap: 24px;

    .album-cover-large {
      width: 200px;
      height: 200px;
      border-radius: 8px;
      overflow: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .album-meta {
      flex: 1;

      .album-title {
        margin: 0 0 12px 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      .album-description {
        margin: 0 0 16px 0;
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
      }

      .album-stats-row {
        display: flex;
        gap: 24px;
        margin-bottom: 16px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #606266;
        }
      }

      .album-tags {
        display: flex;
        gap: 8px;
      }
    }
  }
}

// 主内容区域
.detail-main {
  display: block;
}

// 左侧图片区域
.images-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .section-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  // 图片列表
  .images-list {
    :deep(.el-table) {
      border-radius: 8px;
    }
  }

  // 自定义瀑布流遮罩层样式
  :deep(.image-overlay-content) {
    .image-name {
      margin: 0 0 8px;
      font-size: 14px;
      font-weight: 500;
      color: #ffffff !important;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .image-meta {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      margin: 0 0 8px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.9) !important;

      .image-format {
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        font-weight: 500;
        color: #ffffff !important;
      }

      .image-dimension,
      .image-size {
        color: rgba(255, 255, 255, 0.8) !important;
      }
    }

    .image-author {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7) !important;

      .el-icon {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7) !important;
      }

      span {
        color: rgba(255, 255, 255, 0.7) !important;
      }
    }
  }

  // 加载更多提示
  .load-more-tip {
    text-align: center;
    padding: 20px;
    color: #909399;
    font-size: 14px;
  }
}

// 右侧时间轴
.timeline-section {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  overflow-x: hidden;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }

  // 响应式：小屏幕时调整高度
  @media (max-width: 1200px) {
    max-height: 600px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 4px;

    .section-title {
      display: flex;
      align-items: center;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .timeline-content {
    padding-right: 4px;

    :deep(.el-timeline-item__wrapper) {
      padding-left: 24px;
    }

    :deep(.el-timeline-item__timestamp) {
      font-size: 13px;
      font-weight: 500;
      color: #606266;
    }

    .timeline-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid #e4e7ed;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
        transform: translateX(4px);
      }

      :deep(.el-card__body) {
        padding: 16px;
      }
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }
    }

    .timeline-images {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 12px;

      .timeline-image {
        width: 100%;
        padding-top: 100%;
        position: relative;
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        background: #f5f7fa;

        &:hover {
          transform: scale(1.08);
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

          .image-overlay {
            opacity: 1;
          }
        }

        img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          color: white;
        }
      }

      .timeline-more {
        width: 100%;
        padding-top: 100%;
        position: relative;
        border-radius: 6px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        > * {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
        }

        .el-icon {
          top: 35%;
        }

        span {
          top: 65%;
          font-size: 14px;
          font-weight: 600;
        }
      }
    }

    .timeline-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;

      .el-text {
        display: flex;
        align-items: center;
      }

      .el-link {
        display: flex;
        align-items: center;
        font-weight: 500;
      }
    }
  }
}

// 分页
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>

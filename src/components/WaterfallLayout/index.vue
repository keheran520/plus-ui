<template>
  <div v-loading="loading" class="waterfall-container" :style="containerStyle">
    <div class="waterfall-content" :style="waterfallStyle">
      <div
        v-for="(item, index) in items"
        :key="getItemKey(item, index)"
        class="waterfall-item"
        :class="itemClass"
        :style="itemStyle"
        @click="handleItemClick(item, index)"
      >
        <div :style="getImageWrapperStyle(item)" class="image-wrapper">
          <img
            v-if="getImageUrl(item)"
            :src="getImageUrl(item)"
            :alt="getImageName(item)"
            :loading="lazyLoad ? 'lazy' : 'eager'"
          />
          <div v-else class="image-placeholder">
            <el-icon :size="40">
              <Picture />
            </el-icon>
          </div>

          <!-- 悬停遮罩层 -->
          <div v-if="showOverlay" class="image-overlay" :style="overlayStyle" data-overlay="true">
            <slot name="overlay" :item="item" :index="index">
              <div class="default-overlay-content">
                <p v-if="getImageName(item)" class="image-name" :title="getImageName(item)">
                  {{ getImageName(item) }}
                </p>
                <p v-if="showMeta" class="image-meta">
                  <span v-if="getImageFormat(item)" class="image-format">{{ getImageFormat(item) }}</span>
                  <span v-if="getImageDimension(item)" class="image-dimension">{{ getImageDimension(item) }}</span>
                  <span v-if="getImageSize(item)" class="image-size">{{ getImageSize(item) }}</span>
                </p>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多提示 -->
    <div v-if="showLoadMore" class="load-more-tip">
      <slot name="loadMore">
        <span v-if="loading">{{ loadingText }}</span>
        <span v-else-if="hasMore">{{ loadMoreText }}</span>
        <span v-else-if="items.length > 0">{{ noMoreText }}</span>
      </slot>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && items.length === 0" class="empty-state">
      <slot name="empty">
        <el-empty :description="emptyText" />
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Picture } from '@element-plus/icons-vue';

interface WaterfallProps {
  // 数据源
  items: any[];
  // 列数
  columnCount?: number;
  // 列间距
  columnGap?: number;
  // 行间距（item底部间距）
  rowGap?: number;
  // 容器内边距
  padding?: number;
  // 圆角大小
  borderRadius?: number;
  // 阴影
  boxShadow?: string;
  // 悬停阴影
  hoverShadow?: string;
  // 悬停效果：'scale' | 'translateY' | 'none'
  hoverEffect?: 'scale' | 'translateY' | 'none';
  // 缩放比例（当hoverEffect为scale时）
  scaleRatio?: number;
  // 是否显示遮罩层
  showOverlay?: boolean;
  // 是否显示元数据
  showMeta?: boolean;
  // 是否懒加载
  lazyLoad?: boolean;
  // 加载状态
  loading?: boolean;
  // 是否还有更多
  hasMore?: boolean;
  // 是否显示加载更多提示
  showLoadMore?: boolean;
  // 文本配置
  loadingText?: string;
  loadMoreText?: string;
  noMoreText?: string;
  emptyText?: string;
  // 字段映射
  imageUrlField?: string;
  imageNameField?: string;
  keyField?: string;
  // 响应式断点
  responsive?: {
    [key: number]: number; // { 屏幕宽度: 列数 }
  };
}

const props = withDefaults(defineProps<WaterfallProps>(), {
  items: () => [],
  columnCount: 5,
  columnGap: 10,
  rowGap: 10,
  padding: 10,
  borderRadius: 8,
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  hoverShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  hoverEffect: 'scale',
  scaleRatio: 1.05,
  showOverlay: true,
  showMeta: true,
  lazyLoad: true,
  loading: false,
  hasMore: true,
  showLoadMore: true,
  loadingText: '加载中...',
  loadMoreText: '滚动加载更多',
  noMoreText: '没有更多了',
  emptyText: '暂无数据',
  imageUrlField: 'url',
  imageNameField: 'imageName',
  keyField: 'imageId',
  responsive: () => ({
    1600: 4,
    1200: 3,
    768: 2,
    480: 1
  })
});

const emit = defineEmits<{
  itemClick: [item: any, index: number];
}>();

// 容器样式
const containerStyle = computed(() => ({
  padding: `${props.padding}px`
}));

// 瀑布流样式
const waterfallStyle = computed(() => ({
  columnCount: props.columnCount,
  columnGap: `${props.columnGap}px`
}));

// 单项class
const itemClass = computed(() => {
  return {
    'hover-scale': props.hoverEffect === 'scale',
    'hover-translateY': props.hoverEffect === 'translateY'
  };
});

// 单项样式
const itemStyle = computed(() => ({
  marginBottom: `${props.rowGap}px`,
  borderRadius: `${props.borderRadius}px`,
  boxShadow: props.boxShadow,
  '--hover-shadow': props.hoverShadow,
  '--scale-ratio': props.scaleRatio
}));

// 遮罩层样式
const overlayStyle = computed(() => ({
  borderRadius: `${props.borderRadius}px`
}));

// 获取图片URL
const getImageUrl = (item: any) => {
  return item[props.imageUrlField];
};

// 获取图片名称
const getImageName = (item: any) => {
  return item[props.imageNameField] || item.originalName || '';
};

// 获取图片格式
const getImageFormat = (item: any) => {
  return item.fileSuffix || item.format || '';
};

// 获取图片尺寸
const getImageDimension = (item: any) => {
  const width = item.ossExt?.width || item.width;
  const height = item.ossExt?.height || item.height;
  return width && height ? `${width} × ${height}` : '';
};

// 获取图片大小
const getImageSize = (item: any) => {
  const bytes = item.ossExt?.fileSize || item.fileSize || 0;
  if (bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

// 获取项的key
const getItemKey = (item: any, index: number) => {
  return item[props.keyField] || index;
};

// 获取图片包装器样式（根据宽高比）
const getImageWrapperStyle = (item: any) => {
  const width = item.ossExt?.width || item.width || 300;
  const height = item.ossExt?.height || item.height || 200;
  const aspectRatio = height / width;

  return {
    paddingTop: `${aspectRatio * 100}%`
  };
};

// 点击项
const handleItemClick = (item: any, index: number) => {
  emit('itemClick', item, index);
};
</script>

<style lang="scss" scoped>
.waterfall-container {
  min-height: 200px;
}

.waterfall-content {
  // column-count 和 column-gap 通过内联样式设置

  .waterfall-item {
    break-inside: avoid;
    cursor: pointer;
    overflow: hidden;
    background: white;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: var(--hover-shadow);

      .image-wrapper .image-overlay {
        opacity: 1;
        transform: translateY(0);
      }
    }

    // 缩放效果
    &.hover-scale:hover {
      .image-wrapper img {
        transform: scale(var(--scale-ratio));
      }
    }

    // 向上移动效果
    &.hover-translateY:hover {
      transform: translateY(-3px);
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
        transition: transform 0.3s ease;
      }

      .image-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #d0d0d0;
      }

      .image-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.6) 60%, transparent 100%);
        padding: 40px 16px 16px;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        pointer-events: none;
        color: #ffffff;

        // 通用样式（适用于默认和自定义内容）
        :deep(.image-name),
        .image-name {
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 500;
          color: #ffffff !important;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        :deep(.image-meta),
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

        :deep(.image-author),
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
    }
  }
}

.load-more-tip {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
  font-size: 14px;
}

.empty-state {
  padding: 80px 20px;
}

// 响应式（通过媒体查询）
@media (max-width: 1600px) {
  .waterfall-content {
    column-count: 4;
  }
}

@media (max-width: 1200px) {
  .waterfall-content {
    column-count: 3;
  }
}

@media (max-width: 768px) {
  .waterfall-content {
    column-count: 2;
  }
}

@media (max-width: 480px) {
  .waterfall-content {
    column-count: 1;
  }
}
</style>

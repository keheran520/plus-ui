<template>
  <div class="square-container">
    <!-- 顶部导航 -->
    <div class="square-header">
      <div class="header-content">
        <div class="header-left" @click="goToHome">
          <h1 class="page-title">图片广场</h1>
        </div>
        <div class="header-center">
          <!-- 搜索框 -->
          <el-autocomplete
            v-model="searchKeyword"
            :fetch-suggestions="querySearchAsync"
            class="search-input"
            clearable
            placeholder="搜索图片名称、分类、标签..."
            @clear="handleClearSearch"
            @select="handleSearchSelect"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon class="el-input__icon">
                <Search />
              </el-icon>
            </template>
            <template #suffix>
              <el-button :icon="Search" link type="primary" @click="handleSearch">搜索</el-button>
            </template>
            <template #default="{ item }">
              <!-- 空状态 -->
              <div v-if="item.type === 'empty'" class="flex items-center justify-center text-gray-400 py-2">
                <el-icon>
                  <InfoFilled />
                </el-icon>
                <span class="ml-2">{{ item.value }}</span>
              </div>
              <!-- 错误状态 -->
              <div v-else-if="item.type === 'error'" class="flex items-center justify-center text-red-400 py-2">
                <el-icon>
                  <CircleCloseFilled />
                </el-icon>
                <span class="ml-2">{{ item.value }}</span>
              </div>
              <!-- 正常建议 -->
              <div v-else class="flex items-center justify-between w-full">
                <div class="flex items-center flex-1 min-w-0">
                  <!-- 热门标签图标 -->
                  <el-icon v-if="item.isHot" class="text-red-500 mr-1 flex-shrink-0">
                    <Promotion />
                  </el-icon>
                  <span class="text-sm truncate" v-html="highlightKeyword(item.isHot ? item.displayValue : item.value, searchKeyword)"></span>
                </div>
                <el-tag v-if="item.type === 'name'" class="ml-2 flex-shrink-0" size="small" type="primary">图片名称 </el-tag>
                <el-tag v-else-if="item.type === 'category'" class="ml-2 flex-shrink-0" size="small" type="warning"> 分类 </el-tag>
                <el-tag v-else-if="item.type === 'tag'" class="ml-2 flex-shrink-0" size="small" type="danger">
                  {{ item.isHot ? '热门标签' : '标签' }}
                </el-tag>
                <el-tag v-else class="ml-2 flex-shrink-0" size="small" type="success">描述</el-tag>
              </div>
            </template>
          </el-autocomplete>
        </div>
        <div class="header-right">
          <el-button :icon="HomeFilled" @click="goToHome">返回首页</el-button>
          <el-button :icon="User" type="primary" @click="goToLogin">登录</el-button>
        </div>
      </div>
    </div>

    <!-- 图片瀑布流 -->
    <WaterfallLayout
      :border-radius="5"
      :column-count="5"
      :column-gap="5"
      :has-more="hasMore"
      :items="imageList"
      :loading="loading"
      :padding="5"
      :row-gap="5"
      :scale-ratio="1.05"
      hover-effect="scale"
      @item-click="handlePreview"
    >
      <!-- 自定义遮罩层内容 -->
      <template #overlay="{ item }">
        <div class="custom-overlay-content">
          <p :title="item.imageName || item.originalName" class="image-name">
            {{ item.imageName || item.originalName }}
          </p>
          <p class="image-meta">
            <span class="image-format">{{ item.fileSuffix || 'JPG' }}</span>
            <span v-if="item.ossExt?.width && item.ossExt?.height" class="image-dimension"> {{ item.ossExt.width }} × {{ item.ossExt.height }} </span>
            <span class="image-size">{{ formatSize(item.ossExt?.fileSize || 0) }}</span>
          </p>
          <p class="image-author">
            <el-icon>
              <User />
            </el-icon>
            <span>{{ item?.createByUser?.nickName || '游客' }}</span>
          </p>
        </div>
      </template>
    </WaterfallLayout>

    <!-- 图片查看器 -->
    <ImageViewer v-model="previewVisible" :image-list="imageList" :initial-index="previewIndex" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { CircleCloseFilled, HomeFilled, InfoFilled, Promotion, Search, User } from '@element-plus/icons-vue';
import ImageViewer from '@/components/ImageViewer/index.vue';
import WaterfallLayout from '@/components/WaterfallLayout/index.vue';
import { getPublicImages } from '@/api/picturebed/open';
import { getHotTags, getSearchSuggestions } from '@/api/picturebed/image';

const router = useRouter();

// 搜索关键字
const searchKeyword = ref('');

// 图片列表
const imageList = ref<any[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const queryParams = ref({
  pageNum: 1,
  pageSize: 20,
  keyword: undefined as string | undefined
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

// 预览图片
const handlePreview = (item: any, index: number) => {
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

/** 搜索建议 - 异步查询（调用后端接口） */
const querySearchAsync = async (queryString: string, cb: (suggestions: any[]) => void) => {
  try {
    // 如果没有输入，显示热门标签
    if (!queryString || queryString.trim() === '') {
      const hotRes = await getHotTags(10);
      if (hotRes.code === 200 && hotRes.data && hotRes.data.length > 0) {
        // 添加热门标签标识
        const hotTags = hotRes.data.map((item: any) => ({
          ...item,
          isHot: true,
          displayValue: `${item.value} (${item.count})`
        }));
        cb(hotTags);
      } else {
        cb([]);
      }
      return;
    }

    // 有输入时，调用搜索建议接口
    const res = await getSearchSuggestions(queryString, 10);
    if (res.code === 200 && res.data && res.data.length > 0) {
      cb(res.data);
    } else {
      // 没有搜索结果，返回空状态提示
      cb([
        {
          value: '暂无相关搜索建议',
          type: 'empty',
          disabled: true
        }
      ]);
    }
  } catch (error) {
    console.error('搜索建议失败:', error);
    cb([
      {
        value: '搜索建议加载失败',
        type: 'error',
        disabled: true
      }
    ]);
  }
};

/** 选择搜索建议 */
const handleSearchSelect = (item: any) => {
  if (item.disabled) return;
  searchKeyword.value = item.value;
  handleSearch();
};

/** 执行搜索 */
const handleSearch = () => {
  // 重置列表
  imageList.value = [];
  queryParams.value.pageNum = 1;
  queryParams.value.keyword = searchKeyword.value || undefined;
  hasMore.value = true;

  // 重新加载
  getImageList();
};

/** 清空搜索 */
const handleClearSearch = () => {
  searchKeyword.value = '';
  handleSearch();
};

/** 高亮关键字 */
const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword || !text) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<span style="color: #409eff; font-weight: bold;">$1</span>');
};

// 格式化文件大小
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
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
    margin: 0 auto;
    padding: 14px 40px;
    gap: 20px;

    .header-left {
      flex-shrink: 0;
      cursor: pointer;

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

    .header-center {
      flex: 1;
      max-width: 600px;

      .search-input {
        width: 100%;

        :deep(.el-input__wrapper) {
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }
  }
}

// 自定义遮罩层样式
.custom-overlay-content {
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
</style>

<template>
  <el-dialog v-model="visible" title="图片详情" width="800px" @close="handleClose">
    <div v-loading="loading" class="image-detail-container">
      <el-empty v-if="!imageData" description="图片不存在" />
      <div v-else class="detail-content">
        <!-- 图片预览 -->
        <div class="image-preview">
          <ImagePreview v-if="imageData.url" :height="200" :preview-src-list="[imageData.url]" :src="imageData.url" :width="200" />
          <div
            v-else
            class="flex items-center justify-center bg-gray-100 border border-gray-300 rounded"
            style="width: 200px; height: 200px; margin: 0 auto"
          >
            <span class="text-gray-400 text-sm">无图片</span>
          </div>
          <!--          <el-image-->
          <!--            :src="imageData.url"-->
          <!--            :preview-src-list="[imageData.url]"-->
          <!--            fit="contain"-->
          <!--            style="width: 100%; max-height: 400px"-->
          <!--          >-->
          <!--            <template #error>-->
          <!--              <div class="image-error">-->
          <!--                <el-icon><Picture /></el-icon>-->
          <!--                <span>图片加载失败</span>-->
          <!--              </div>-->
          <!--            </template>-->
          <!--          </el-image>-->
        </div>

        <!-- 图片信息 -->
        <div class="image-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="图片ID">
              <span class="truncate-text">{{ imageData.imageId }}</span>
            </el-descriptions-item>

            <el-descriptions-item label="图片名称">
              <span class="truncate-text">
                {{ imageData.imageName || imageData.originalName || '-' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="文件大小">
              {{ formatFileSize(imageData.ossExt?.fileSize) }}
            </el-descriptions-item>
            <el-descriptions-item label="图片尺寸">
              <span v-if="imageData.ossExt?.width && imageData.ossExt?.height"> {{ imageData.ossExt.width }} × {{ imageData.ossExt.height }} </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="分类">
              <el-tag v-if="imageData.categoryName" size="small" type="info">
                {{ imageData.categoryName }}
              </el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="相册">
              <el-tag v-if="imageData.albumName" size="small" type="success">
                {{ imageData.albumName }}
              </el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <div v-if="imageData.tagList && imageData.tagList.length > 0" class="tags-container">
                <el-tag v-for="tag in imageData.tagList" :key="tag.tagId" size="small" type="info" class="mr-1">
                  {{ tag.tagName }}
                </el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">
              {{ imageData.description || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="浏览次数">
              {{ imageData.viewCount || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="下载次数">
              {{ imageData.downloadCount || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="点赞数">
              {{ imageData.likeCount || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="是否公开">
              <el-tag :type="imageData.isPublic === 'Y' ? 'success' : 'danger'" size="small">
                {{ imageData.isPublic === 'Y' ? '公开' : '私密' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="上传时间" :span="2">
              {{ imageData.createTime || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Picture } from '@element-plus/icons-vue';
import { getImage } from '@/api/picturebed/image';
import ImagePreview from '@/components/ImagePreview/index.vue';

interface Props {
  modelValue: boolean;
  imageId?: number | string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const visible = ref(false);
const loading = ref(false);
const imageData = ref<any>(null);

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val && props.imageId) {
      loadImageDetail();
    }
  }
);

// 监听 visible 变化
watch(visible, (val) => {
  emit('update:modelValue', val);
});

// 加载图片详情
const loadImageDetail = async () => {
  if (!props.imageId) return;

  loading.value = true;
  try {
    const res = await getImage(props.imageId);
    if (res.code === 200) {
      imageData.value = res.data;
    }
  } catch (error) {
    console.error('加载图片详情失败:', error);
  } finally {
    loading.value = false;
  }
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (!bytes) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

// 关闭对话框
const handleClose = () => {
  imageData.value = null;
};
</script>

<style scoped lang="scss">
.image-detail-container {
  min-height: 200px;

  .detail-content {
    .image-preview {
      border-radius: 4px;
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
      padding: 20px;
      background: #f5f7fa;

      .image-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #909399;

        .el-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
      }
    }

    .image-info {
      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }
  }
}
</style>

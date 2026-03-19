<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="dialogTitle" top="5vh" width="1000px" @close="handleClose">
    <div class="batch-upload-container">
      <!-- 上传区域 -->
      <div class="upload-section">
        <el-upload
          ref="uploadRef"
          v-model:file-list="fileList"
          :accept="props.accept"
          :auto-upload="false"
          :limit="props.maxCount"
          :multiple="true"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
          :on-remove="handleRemove"
          :show-file-list="false"
          class="upload-demo"
          drag
        >
          <el-icon class="el-icon--upload">
            <upload-filled />
          </el-icon>
          <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              支持 {{ props.accept }} 格式，单次最多上传 {{ props.maxCount }} 张图片，单张图片不超过 {{ props.maxSize }}MB
            </div>
          </template>
        </el-upload>
      </div>

      <!-- 全局设置 -->
      <div class="global-settings">
        <el-divider content-position="left">
          <el-icon>
            <Setting />
          </el-icon>
          全局设置
        </el-divider>

        <el-form :model="globalSettings" label-width="90px" size="default">
          <el-row :gutter="20">
            <!-- 相册选择（仅在非相册模式且非游客模式下显示） -->
            <el-col v-if="!albumId && !guestMode" :span="8">
              <el-form-item label="所属相册">
                <el-select v-model="globalSettings.albumId" clearable filterable placeholder="请选择相册" style="width: 100%">
                  <el-option v-for="album in albumList" :key="album.albumId" :label="album.albumName" :value="album.albumId" />
                </el-select>
              </el-form-item>
            </el-col>

            <!-- 分类选择 -->
            <el-col :span="albumId ? 8 : 8">
              <el-form-item label="图片分类">
                <el-tree-select
                  v-model="globalSettings.categoryId"
                  :data="categoryList"
                  :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
                  check-strictly
                  clearable
                  placeholder="请选择分类"
                  style="width: 100%"
                  @change="handleCategoryChange"
                />
              </el-form-item>
            </el-col>

            <!-- 标签选择 -->
            <el-col :span="albumId ? 8 : 8">
              <el-form-item label="图片标签">
                <el-select
                  v-model="globalSettings.tagIds"
                  clearable
                  collapse-tags
                  collapse-tags-tooltip
                  filterable
                  multiple
                  placeholder="请选择标签"
                  style="width: 100%"
                >
                  <el-option v-for="tag in tagList" :key="tag.tagId" :label="tag.tagName" :value="tag.tagId" />
                </el-select>
              </el-form-item>
            </el-col>

            <!-- 是否公开（游客模式下隐藏） -->
            <el-col v-if="!guestMode" :span="albumId ? 8 : 8">
              <el-form-item label="是否公开">
                <el-radio-group v-model="globalSettings.isPublic">
                  <el-radio label="Y">公开</el-radio>
                  <el-radio label="N">私密</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 应用到所有图片按钮 -->
          <el-form-item style="margin-bottom: 0">
            <el-button :icon="Check" type="primary" @click="applyGlobalSettings"> 应用全局设置到所有图片</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 图片列表 -->
      <div v-if="imageItems.length > 0" class="image-list-section">
        <el-divider content-position="left">
          <el-icon>
            <Picture />
          </el-icon>
          图片列表（{{ imageItems.length }}）
        </el-divider>

        <div class="image-items">
          <div v-for="(item, index) in imageItems" :key="index" :class="`status-${item.uploadStatus}`" class="image-item">
            <!-- 图片预览 -->
            <div class="image-preview">
              <el-image :preview-src-list="[item.preview]" :src="item.preview" fit="cover" style="width: 100%; height: 100%">
                <template #error>
                  <div class="image-error">
                    <el-icon>
                      <Picture />
                    </el-icon>
                    <span>加载失败</span>
                  </div>
                </template>
              </el-image>
              <div class="image-mask">
                <el-icon class="preview-icon" @click="handlePreview(item)">
                  <ZoomIn />
                </el-icon>
                <el-icon v-if="item.uploadStatus !== 'uploading'" class="delete-icon" @click="handleDeleteItem(index)">
                  <Delete />
                </el-icon>
              </div>
              <div class="image-size">{{ formatSize(item.file.size) }}</div>

              <!-- 上传状态指示 -->
              <div v-if="item.uploadStatus" :class="item.uploadStatus" class="upload-status-badge">
                <span v-if="item.uploadStatus === 'uploading'">上传中...</span>
                <span v-else-if="item.uploadStatus === 'success'">✓ 完成</span>
                <span v-else-if="item.uploadStatus === 'failed'">✕ 失败</span>
              </div>
            </div>

            <!-- 图片设置 -->
            <div class="image-settings">
              <!-- 上传成功：显示URL和复制按钮 -->
              <div v-if="item.uploadStatus === 'success'" class="success-info">
                <div class="success-title">
                  <el-icon style="color: #67c23a; margin-right: 8px">
                    <Check />
                  </el-icon>
                  <span>{{ item.imageName }}</span>
                </div>
                <div class="success-meta">
                  <span v-if="item.uploadResult?.width && item.uploadResult?.height">
                    {{ item.uploadResult.width }} × {{ item.uploadResult.height }}
                  </span>
                  <span v-if="item.uploadResult?.ossExt?.fileSize">
                    {{ formatSize(item.uploadResult.ossExt.fileSize) }}
                  </span>
                </div>
                <div class="success-url">
                  <el-input :model-value="item.uploadResult?.url || ''" readonly size="small">
                    <template #append>
                      <el-button :icon="CopyDocument" @click="copyLink(item.uploadResult?.url)">复制</el-button>
                    </template>
                  </el-input>
                </div>
              </div>

              <!-- 上传中或失败：显示表单 -->
              <el-form v-else label-position="top" size="small">
                <!-- 图片名称（必填） -->
                <el-form-item label="图片名称" required>
                  <el-input
                    v-model="item.imageName"
                    :disabled="item.uploadStatus === 'uploading'"
                    :placeholder="`图片 ${index + 1}`"
                    clearable
                    maxlength="100"
                    show-word-limit
                  >
                    <template #suffix>
                      <span class="text-xs text-gray-400">{{ index + 1 }}/{{ imageItems.length }}</span>
                    </template>
                  </el-input>
                </el-form-item>

                <!-- 图片描述 -->
                <el-form-item label="图片描述">
                  <el-input
                    v-model="item.description"
                    :disabled="item.uploadStatus === 'uploading'"
                    :rows="2"
                    maxlength="200"
                    placeholder="请输入图片描述（可选）"
                    show-word-limit
                    type="textarea"
                  />
                </el-form-item>

                <!-- 上传进度条 -->
                <div v-if="item.uploadStatus === 'uploading'" class="upload-progress">
                  <el-progress :percentage="item.uploadProgress || 0" :show-text="true" />
                </div>

                <!-- 上传错误信息 -->
                <div v-if="item.uploadStatus === 'failed'" class="upload-error">
                  <el-alert :closable="false" :title="item.uploadError || '上传失败'" type="error" />
                </div>

                <!-- 快速操作 -->
                <div class="quick-actions">
                  <el-button v-if="item.uploadStatus !== 'uploading'" link size="small" type="primary" @click="copyGlobalSettings(index)">
                    <el-icon>
                      <CopyDocument />
                    </el-icon>
                    应用全局设置
                  </el-button>
                  <el-button v-if="item.uploadStatus === 'failed'" link size="small" type="danger" @click="retryUpload(index)">
                    <el-icon>
                      <Refresh />
                    </el-icon>
                    重试
                  </el-button>
                </div>
              </el-form>
            </div>
          </div>
        </div>
      </div>

      <!-- 上传成功结果 -->
      <div v-if="uploadResults.length > 0" class="upload-results-section">
        <el-divider content-position="left">
          <el-icon>
            <Check />
          </el-icon>
          上传成功（{{ uploadResults.length }}）
        </el-divider>

        <div class="results-list">
          <div v-for="(result, index) in uploadResults" :key="index" class="result-item">
            <!-- 图片预览 -->
            <div class="result-image">
              <ImagePreview v-if="result.url" :height="100" :preview-src-list="[result.url]" :src="result.url" :width="100" />
              <div
                v-else
                class="flex items-center justify-center bg-gray-100 border border-gray-300 rounded"
                style="width: 100px; height: 100px; margin: 0 auto"
              >
                <span class="text-gray-400 text-sm">无图片</span>
              </div>
            </div>

            <!-- 图片信息 -->
            <div class="result-info">
              <div class="result-name">{{ result.imageName }}</div>
              <div class="result-meta">
                <span>{{ formatSize(result.ossExt.fileSize || 0) }}</span>
                <span v-if="result.width && result.height">{{ result.width }} × {{ result.height }}</span>
              </div>

              <!-- 链接复制 -->
              <div class="result-links">
                <el-input v-model="result.url" readonly size="small">
                  <template #append>
                    <el-button :icon="CopyDocument" @click="copyLink(result.url)">复制</el-button>
                  </template>
                </el-input>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-else-if="imageItems.length === 0" description="请先上传图片" />
    </div>

    <!-- 底部操作栏 -->
    <template #footer>
      <div class="dialog-footer">
        <div class="footer-info">
          <el-tag v-if="imageItems.length > 0" type="info"> 已选择 {{ imageItems.length }} 张图片</el-tag>
        </div>
        <div class="footer-actions">
          <el-button @click="handleClose">取消</el-button>
          <el-button :disabled="imageItems.length === 0" :loading="uploading" type="primary" @click="handleUpload">
            <el-icon v-if="!uploading">
              <Upload />
            </el-icon>
            {{ uploading ? '上传中...' : '开始上传' }}
          </el-button>
        </div>
      </div>
    </template>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="60%">
      <el-image :src="previewImage" fit="contain" style="width: 100%">
        <template #error>
          <div class="preview-error">
            <el-icon>
              <Picture />
            </el-icon>
            <span>图片加载失败</span>
          </div>
        </template>
      </el-image>
    </el-dialog>
  </el-dialog>
</template>

<script lang="ts" setup>
import { type ComponentInternalInstance, computed, getCurrentInstance, ref, watch } from 'vue';
import { ElMessage, ElMessageBox, type UploadFile, type UploadInstance, type UploadUserFile } from 'element-plus';
import { Check, CopyDocument, Delete, Picture, Refresh, Setting, Upload, UploadFilled, ZoomIn } from '@element-plus/icons-vue';
import service from '@/utils/request';
import { getPublicCategories, getPublicTags } from '@/api/picturebed/open';
import { listImageAlbum } from '@/api/picturebed/imageAlbum';
import { listImageCategory } from '@/api/picturebed/imageCategory';
import { listImageTag, listImageTagByCategory } from '@/api/picturebed/imageTag';
import ImagePreview from '@/components/ImagePreview/index.vue';

// Props
interface Props {
  modelValue: boolean;
  albumId?: number | string; // 相册ID，如果传入则为相册内上传模式
  title?: string;
  guestMode?: boolean; // 游客模式，true时隐藏相册选择
  // 新增配置项
  maxCount?: number; // 最大上传数量
  maxSize?: number; // 单个文件最大大小（MB）
  accept?: string; // 接受的文件类型
  concurrent?: number; // 并发上传数量
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  albumId: undefined,
  title: '',
  guestMode: false,
  maxCount: 20,
  maxSize: 10,
  accept: 'image/*',
  concurrent: 2
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [data: any];
}>();

// 获取组件实例
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const dialogTitle = computed(() => {
  if (props.title) return props.title;
  return props.albumId ? '批量上传图片到相册' : '批量上传图片';
});

// 上传相关
const uploadRef = ref<UploadInstance>();
const fileList = ref<UploadUserFile[]>([]);
const uploading = ref(false);
const uploadResults = ref<any[]>([]); // 上传成功结果

// 图片项数据结构
interface ImageItem {
  file: File;
  preview: string;
  imageName: string;
  description: string;
  albumId?: number | string;
  categoryId?: number | string;
  tagIds: (number | string)[];
  isPublic: string;
  // 上传状态
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'failed';
  uploadProgress?: number; // 0-100
  uploadError?: string;
  uploadResult?: any;
}

const imageItems = ref<ImageItem[]>([]);

// 上传队列配置
const CONCURRENT_UPLOADS = computed(() => props.concurrent); // 使用props配置
const uploadQueue = ref<number[]>([]); // 待上传的图片索引队列
const activeUploads = ref<Set<number>>(new Set()); // 正在上传的图片索引

// 全局设置
const globalSettings = ref({
  albumId: props.albumId || undefined,
  categoryId: undefined as number | string | undefined,
  tagIds: [] as (number | string)[],
  isPublic: 'Y'
});

// 下拉选项数据
const albumList = ref<any[]>([]);
const categoryList = ref<any[]>([]);
const tagList = ref<any[]>([]);

// 预览
const previewVisible = ref(false);
const previewImage = ref('');

// 监听相册ID变化
watch(
  () => props.albumId,
  (newVal) => {
    if (newVal) {
      globalSettings.value.albumId = newVal;
    }
  },
  { immediate: true }
);

// 文件变化处理
const handleFileChange = (file: UploadFile) => {
  if (!file.raw) return;

  // 验证文件类型
  const isImage = file.raw.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return;
  }

  // 验证文件大小
  const isLtMaxSize = file.raw.size / 1024 / 1024 < props.maxSize;
  if (!isLtMaxSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB！`);
    return;
  }

  // 创建预览URL
  const preview = URL.createObjectURL(file.raw);

  // 生成默认名称（去除扩展名）
  const defaultName = file.name.replace(/\.[^/.]+$/, '');

  // 添加到图片项列表
  imageItems.value.push({
    file: file.raw,
    preview,
    imageName: defaultName,
    description: '',
    albumId: globalSettings.value.albumId,
    categoryId: globalSettings.value.categoryId,
    tagIds: [...globalSettings.value.tagIds],
    isPublic: globalSettings.value.isPublic
  });
};

// 文件移除处理
const handleRemove = (file: UploadFile) => {
  const index = imageItems.value.findIndex((item) => item.file.name === file.name);
  if (index > -1) {
    // 释放预览URL
    URL.revokeObjectURL(imageItems.value[index].preview);
    imageItems.value.splice(index, 1);
  }
};

// 超出文件数量限制
const handleExceed = () => {
  ElMessage.warning(`单次最多上传 ${props.maxCount} 张图片`);
};

// 删除图片项
const handleDeleteItem = (index: number) => {
  ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 释放预览URL
      URL.revokeObjectURL(imageItems.value[index].preview);
      // 从fileList中移除
      fileList.value.splice(index, 1);
      // 从imageItems中移除
      imageItems.value.splice(index, 1);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

// 应用全局设置到所有图片
const applyGlobalSettings = () => {
  imageItems.value.forEach((item) => {
    item.albumId = globalSettings.value.albumId;
    item.categoryId = globalSettings.value.categoryId;
    item.tagIds = [...globalSettings.value.tagIds];
    item.isPublic = globalSettings.value.isPublic;
  });
  ElMessage.success('已应用全局设置到所有图片');
};

// 复制全局设置到单张图片
const copyGlobalSettings = (index: number) => {
  imageItems.value[index].albumId = globalSettings.value.albumId;
  imageItems.value[index].categoryId = globalSettings.value.categoryId;
  imageItems.value[index].tagIds = [...globalSettings.value.tagIds];
  imageItems.value[index].isPublic = globalSettings.value.isPublic;
  ElMessage.success('已应用全局设置');
};

// 预览图片
const handlePreview = (item: ImageItem) => {
  previewImage.value = item.preview;
  previewVisible.value = true;
};

/**
 * 上传单个图片
 */
const uploadSingleImage = async (index: number) => {
  const item = imageItems.value[index];
  if (!item) return;

  item.uploadStatus = 'uploading';
  item.uploadProgress = 0;
  item.uploadError = undefined;

  try {
    const formData = new FormData();
    formData.append('files', item.file);
    formData.append('imageNames', item.imageName);
    formData.append('descriptions', item.description || '');

    let url: string;

    if (props.guestMode) {
      formData.append('categoryIds', String(item.categoryId || ''));
      formData.append('tagIdsList', item.tagIds.join(','));
      url = '/open/picturebed/image/guest/upload';
    } else {
      formData.append('albumIds', String(item.albumId || ''));
      formData.append('categoryIds', String(item.categoryId || ''));
      formData.append('tagIdsList', item.tagIds.join(','));
      formData.append('isPublics', item.isPublic);
      url = '/picturebed/image/batchUpload';
    }

    // 使用 service 实例上传，自动处理 baseURL 和认证
    const response = await service.post(url, formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          item.uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        }
      }
    });

    // service 已经处理了响应，直接获取数据
    item.uploadResult = response?.data?.[0];
    item.uploadStatus = 'success';
    item.uploadProgress = 100;
  } catch (error: any) {
    item.uploadStatus = 'failed';

    // 详细的错误处理
    let errorMsg = '上传失败';
    if (error.response) {
      // 服务器返回了错误响应
      errorMsg = error.response.data?.msg || `HTTP ${error.response.status}`;
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMsg = '网络错误，请检查连接';
    } else if (error.message) {
      // 其他错误
      errorMsg = error.message;
    } else {
      errorMsg = '上传失败';
    }

    item.uploadError = errorMsg;
    console.error(`图片 ${index} 上传失败:`, error);
  }
};

/**
 * 处理上传队列
 */
const processUploadQueue = async () => {
  while (uploadQueue.value.length > 0 && activeUploads.value.size < CONCURRENT_UPLOADS.value) {
    const index = uploadQueue.value.shift();
    if (index !== undefined) {
      activeUploads.value.add(index);

      try {
        await uploadSingleImage(index);
      } finally {
        activeUploads.value.delete(index);
        // 继续处理队列
        await processUploadQueue();
      }
    }
  }
};

/**
 * 重试上传失败的图片
 */
const retryUpload = async (index: number) => {
  const item = imageItems.value[index];
  if (!item) return;

  uploadQueue.value.push(index);
  await processUploadQueue();
};

// 开始上传
const handleUpload = async () => {
  // 验证必填项
  const invalidItems = imageItems.value.filter((item) => !item.imageName.trim());
  if (invalidItems.length > 0) {
    ElMessage.error('请为所有图片填写名称');
    return;
  }

  // 如果不是相册模式且不是游客模式，检查是否选择了相册
  if (!props.albumId && !props.guestMode) {
    const noAlbumItems = imageItems.value.filter((item) => !item.albumId);
    if (noAlbumItems.length > 0) {
      const result = await ElMessageBox.confirm(`有 ${noAlbumItems.length} 张图片未选择相册，是否继续上传？`, '提示', {
        confirmButtonText: '继续上传',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => false);

      if (!result) return;
    }
  }

  uploading.value = true;

  try {
    // 初始化所有图片的上传状态
    imageItems.value.forEach((item, index) => {
      item.uploadStatus = 'pending';
      item.uploadProgress = 0;
      item.uploadError = undefined;
      uploadQueue.value.push(index);
    });

    // 开始处理上传队列
    await processUploadQueue();

    // 等待所有上传完成
    while (activeUploads.value.size > 0 || uploadQueue.value.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 统计上传结果
    const successItems = imageItems.value.filter((item) => item.uploadStatus === 'success');
    const failedItems = imageItems.value.filter((item) => item.uploadStatus === 'failed');

    if (successItems.length > 0) {
      ElMessage.success(`成功上传 ${successItems.length} 张图片`);
      uploadResults.value = successItems.map((item) => item.uploadResult).filter(Boolean);
    }

    if (failedItems.length > 0) {
      ElMessage.warning(`有 ${failedItems.length} 张图片上传失败，可点击重试`);
    }

    // 如果全部成功，清空图片列表
    if (failedItems.length === 0) {
      imageItems.value.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
      imageItems.value = [];
      fileList.value = [];

      globalSettings.value = {
        albumId: props.albumId || undefined,
        categoryId: undefined,
        tagIds: [],
        isPublic: 'Y'
      };

      emit('success', uploadResults.value);
    }
  } catch (error) {
    console.error('Upload error:', error);
    ElMessage.error('上传过程出错');
  } finally {
    uploading.value = false;
    uploadQueue.value = [];
    activeUploads.value.clear();
  }
};

// 关闭对话框
const handleClose = () => {
  // 清理预览URL
  imageItems.value.forEach((item) => {
    URL.revokeObjectURL(item.preview);
  });

  // 重置数据
  fileList.value = [];
  imageItems.value = [];
  uploadResults.value = [];
  globalSettings.value = {
    albumId: props.albumId || undefined,
    categoryId: undefined,
    tagIds: [],
    isPublic: 'Y'
  };

  visible.value = false;
};

// 格式化文件大小
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// 复制链接
const copyLink = (url: string) => {
  navigator.clipboard
    .writeText(url)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板');
    })
    .catch(() => {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        ElMessage.success('链接已复制到剪贴板');
      } catch (err) {
        ElMessage.error('复制失败，请手动复制');
      }
      document.body.removeChild(textarea);
    });
};

// 加载下拉选项数据
const loadOptions = async () => {
  try {
    if (props.guestMode) {
      // 游客模式：使用开放接口
      // 加载分类列表
      const categoryRes: any = await getPublicCategories();
      categoryList.value = proxy?.handleTree(categoryRes.data, 'categoryId', 'parentId') || [];

      // 标签列表初始为空，根据选择的分类动态加载
      tagList.value = [];
    } else {
      // 普通模式：使用需要登录的接口
      // 加载相册列表
      const albumRes: any = await listImageAlbum({ status: '0' });
      albumList.value = albumRes.rows || [];

      // 加载分类列表（树形结构）
      const categoryRes: any = await listImageCategory();
      categoryList.value = proxy?.handleTree(categoryRes.data, 'categoryId', 'parentId') || [];

      // 标签列表初始为空，根据选择的分类动态加载
      tagList.value = [];
    }
  } catch (error) {
    console.error('Load options error:', error);
    ElMessage.error('加载选项失败');
  }
};

// 分类变化处理
const handleCategoryChange = async (categoryId: number | string | undefined) => {
  // 清空已选标签
  globalSettings.value.tagIds = [];

  try {
    if (props.guestMode) {
      // 游客模式：使用开放接口
      const res: any = await getPublicTags(categoryId as number);
      tagList.value = res.data || [];
    } else {
      // 普通模式：使用需要登录的接口
      if (categoryId) {
        // 根据分类ID加载对应的标签
        const res: any = await listImageTagByCategory(categoryId);
        tagList.value = res.data || [];
      } else {
        // 如果没有选择分类，加载所有标签
        const tagRes: any = await listImageTag({ status: '0' });
        tagList.value = tagRes.data || [];
      }
    }
  } catch (error) {
    console.error('加载标签失败:', error);
    tagList.value = [];
  }
};

// 监听对话框打开
watch(visible, (val) => {
  if (val) {
    loadOptions();
  }
});
</script>

<style lang="scss" scoped>
.batch-upload-container {
  max-height: 70vh;
  overflow-y: auto;
  padding: 4px;
}

// 上传区域
.upload-section {
  margin-bottom: 20px;

  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    background: #fafafa;
    transition: all 0.3s ease;

    &:hover {
      border-color: #409eff;
      background: #f0f7ff;
    }
  }

  :deep(.el-icon--upload) {
    font-size: 48px;
    color: #409eff;
    margin-bottom: 12px;
  }

  :deep(.el-upload__text) {
    font-size: 14px;
    color: #606266;

    em {
      color: #409eff;
      font-style: normal;
    }
  }

  :deep(.el-upload__tip) {
    margin-top: 12px;
    font-size: 12px;
    color: #909399;
    text-align: center;
  }
}

// 全局设置
.global-settings {
  margin-bottom: 24px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;

  .el-divider {
    margin: 0 0 20px 0;

    :deep(.el-divider__text) {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #303133;
    }
  }
}

// 图片列表
.image-list-section {
  .el-divider {
    margin: 0 0 20px 0;

    :deep(.el-divider__text) {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.image-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
  }

  .image-preview {
    position: relative;
    width: 100px;
    height: 100px;
    flex-shrink: 0;
    border-radius: 6px;
    overflow: hidden;
    background: #f5f7fa;
    border: 1px solid #e4e7ed;

    :deep(.el-image) {
      width: 100%;
      height: 100%;
      display: block;
    }

    .image-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: #f5f7fa;
      color: #909399;
      font-size: 12px;

      .el-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }
    }

    .image-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.2s ease;

      .el-icon {
        font-size: 18px;
        color: white;
        cursor: pointer;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.15);
        }
      }
    }

    &:hover .image-mask {
      opacity: 1;
    }

    .image-size {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 4px;
      background: rgba(0, 0, 0, 0.75);
      color: white;
      font-size: 11px;
      text-align: center;
    }
  }

  .image-settings {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    .el-form {
      flex: 1;
    }

    .el-form-item {
      margin-bottom: 14px;

      &:last-child {
        margin-bottom: 0;
      }

      :deep(.el-form-item__label) {
        font-size: 13px;
        font-weight: 500;
        color: #606266;
        padding-bottom: 6px;
      }
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #f0f0f0;
    }
  }
}

// 预览错误样式
.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
  font-size: 14px;

  .el-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }
}

// 上传结果区域
.upload-results-section {
  margin-top: 24px;

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 400px;
    overflow-y: auto;

    .result-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: var(--el-fill-color-light);
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: var(--el-fill-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .result-image {
        width: 100px;
        height: 100px;
        flex-shrink: 0;
        border-radius: 6px;
        overflow: hidden;
        background: var(--el-fill-color-darker);

        .image-error {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--el-text-color-placeholder);
        }
      }

      .result-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .result-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .result-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--el-text-color-secondary);

          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }

        .result-links {
          .el-input {
            font-size: 12px;

            :deep(.el-input__wrapper) {
              background: var(--el-bg-color);
            }
          }
        }
      }
    }
  }
}

// 底部操作栏
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .footer-info {
    display: flex;
    gap: 8px;
  }

  .footer-actions {
    display: flex;
    gap: 12px;
  }
}

// 滚动条样式
.batch-upload-container::-webkit-scrollbar {
  width: 6px;
}

.batch-upload-container::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;

  &:hover {
    background: #c0c4cc;
  }
}

// 上传状态样式
.image-item {
  &.status-uploading {
    background: #f0f7ff;
    border-color: #409eff;
  }

  &.status-success {
    background: #f0f9ff;
    border-color: #67c23a;

    .image-preview {
      border-color: #67c23a;
    }
  }

  &.status-failed {
    background: #fef0f0;
    border-color: #f56c6c;

    .image-preview {
      border-color: #f56c6c;
    }
  }
}

// 上传状态徽章
.upload-status-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: rgba(0, 0, 0, 0.6);

  &.uploading {
    background: #409eff;
    animation: pulse 1.5s ease-in-out infinite;
  }

  &.success {
    background: #67c23a;
  }

  &.failed {
    background: #f56c6c;
  }
}

// 上传进度条
.upload-progress {
  margin: 12px 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;

  :deep(.el-progress) {
    margin: 0;
  }
}

// 上传错误信息
.upload-error {
  margin: 12px 0;

  :deep(.el-alert) {
    padding: 8px 12px;
    font-size: 12px;
  }
}

// 成功信息样式
.success-info {
  padding: 16px;
  background: #f0f9ff;
  border-radius: 6px;
  border-left: 4px solid #67c23a;

  .success-title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .success-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #909399;
    margin-bottom: 12px;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .success-url {
    :deep(.el-input__wrapper) {
      background: white;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
    }
  }
}

// 脉冲动画
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>

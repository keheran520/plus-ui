<template>
  <el-dialog
    v-model="visible"
    title="添加已有图片到相册"
    width="80%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="add-image-container">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="图片名称">
          <el-input v-model="queryParams.imageName" placeholder="请输入图片名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="queryParams.categoryId" placeholder="请选择分类" clearable>
            <el-option label="全部" :value="null" />
            <!-- TODO: 加载分类列表 -->
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 已选择提示 -->
      <el-alert
        v-if="selectedImages.length > 0"
        :title="`已选择 ${selectedImages.length} 张图片`"
        type="info"
        show-icon
        :closable="false"
        class="mb-3"
      >
        <template #default>
          <el-button type="primary" size="small" @click="handleClearSelection">清空选择</el-button>
        </template>
      </el-alert>

      <!-- 图片列表 -->
      <el-table
        v-loading="loading"
        :data="imageList"
        style="width: 100%"
        max-height="500"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" :selectable="checkSelectable" />
        <el-table-column label="图片" width="120">
          <template #default="{ row }">
            <ImagePreview v-if="row.url" :height="80" :preview-src-list="[row.url]" :src="row.url" :width="80" />
            <div
              v-else
              class="flex items-center justify-center bg-gray-100 border border-gray-300 rounded"
              style="width: 80px; height: 80px; margin: 0 auto"
            >
              <span class="text-gray-400 text-sm">无图片</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="图片名称" prop="imageName" min-width="200" show-overflow-tooltip />
        <el-table-column label="所属相册" prop="albumName" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag v-if="row.albumName" size="small">{{ row.albumName }}</el-tag>
            <span v-else class="text-gray-400">未分配</span>
          </template>
        </el-table-column>
        <el-table-column label="分类" prop="categoryName" width="120" show-overflow-tooltip />
        <el-table-column label="大小" width="100">
          <template #default="{ row }">
            {{ formatSize(row.ossExt?.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="上传时间" prop="createTime" width="160" />
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        :total="total"
        @pagination="getImageList"
      />
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" :disabled="selectedImages.length === 0" @click="handleSubmit">
        确定添加（{{ selectedImages.length }}）
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import { listImage, batchUpdateAlbum } from '@/api/picturebed/image';

interface Props {
  modelValue: boolean;
  albumId: number | string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [];
}>();

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 状态
const loading = ref(false);
const submitting = ref(false);
const imageList = ref<any[]>([]);
const selectedImages = ref<any[]>([]);
const total = ref(0);

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 20,
  imageName: '',
  categoryId: null as number | null
});

// 监听弹窗打开
watch(visible, (val) => {
  if (val) {
    handleSearch();
  }
});

// 获取图片列表
const getImageList = async () => {
  loading.value = true;
  try {
    const res = await listImage(queryParams.value);
    imageList.value = res.rows || [];
    total.value = res.total || 0;
  } catch (error) {
    ElMessage.error('获取图片列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  queryParams.value.pageNum = 1;
  getImageList();
};

// 重置
const handleReset = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 20,
    imageName: '',
    categoryId: null
  };
  handleSearch();
};

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedImages.value = selection;
};

// 清空选择
const handleClearSelection = () => {
  selectedImages.value = [];
};

// 检查是否可选择（已经在当前相册的图片不可选）
const checkSelectable = (row: any) => {
  return row.albumId !== props.albumId;
};

// 提交
const handleSubmit = async () => {
  if (selectedImages.value.length === 0) {
    ElMessage.warning('请选择要添加的图片');
    return;
  }

  submitting.value = true;
  try {
    // 提取图片ID
    const imageIds = selectedImages.value.map((img) => img.imageId);

    // 调用批量更新接口
    await batchUpdateAlbum({
      imageIds: imageIds.join(','),
      albumId: props.albumId
    });

    ElMessage.success(`成功添加 ${imageIds.length} 张图片到相册`);
    emit('success');
    handleClose();
  } catch (error: any) {
    ElMessage.error(error.msg || '添加失败');
  } finally {
    submitting.value = false;
  }
};

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
  selectedImages.value = [];
  queryParams.value = {
    pageNum: 1,
    pageSize: 20,
    imageName: '',
    categoryId: null
  };
};

// 格式化文件大小
const formatSize = (bytes: number | undefined) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
</script>

<style scoped lang="scss">
.add-image-container {
  .search-form {
    margin-bottom: 16px;
  }
}
</style>

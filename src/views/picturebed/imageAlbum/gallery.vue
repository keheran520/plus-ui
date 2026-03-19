<template>
  <div class="album-gallery-container p-4">
    <!-- 统计卡片 -->
    <div class="stats-section mb-6">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                <el-icon :size="24">
                  <Folder />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ total }}</div>
                <div class="stat-label">总相册数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                <el-icon :size="24">
                  <Picture />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalImages }}</div>
                <div class="stat-label">总图片数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                <el-icon :size="24">
                  <Unlock />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ publicAlbums }}</div>
                <div class="stat-label">公开相册</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
                <el-icon :size="24">
                  <DataAnalysis />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatSize(totalSize) }}</div>
                <div class="stat-label">总存储量</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 顶部工具栏 -->
    <div class="toolbar-section mb-6">
      <el-row :gutter="16" align="middle">
        <el-col :span="12">
          <div class="flex items-center gap-4">
            <h2 class="text-2xl font-bold text-gray-800 m-0">📚 相册列表</h2>
            <el-tag v-if="selectedIds.length > 0" size="large" type="warning"> 已选 {{ selectedIds.length }} 项</el-tag>
          </div>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-space :size="12">
            <el-input
              v-model="searchKeyword"
              clearable
              placeholder="搜索相册名称..."
              style="width: 240px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
            <el-button :icon="Plus" type="primary" @click="handleCreate">创建相册</el-button>
            <el-button v-if="selectedIds.length > 0" :icon="Delete" type="danger" @click="handleBatchDelete">批量删除 </el-button>
            <el-button :icon="Refresh" circle @click="getList" />
            <el-dropdown @command="handleViewChange">
              <el-button :icon="Grid" circle />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :icon="Grid" command="grid">网格视图</el-dropdown-item>
                  <el-dropdown-item :icon="List" command="list">列表视图</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </el-col>
      </el-row>
    </div>
    <!-- 筛选栏 -->
    <div class="filter-section mb-6">
      <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
        <el-card :body-style="{ padding: '16px' }" shadow="never">
          <el-space :size="12" wrap>
            <el-radio-group v-model="filterStatus" @change="handleFilterChange">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="0">正常</el-radio-button>
              <el-radio-button label="1">停用</el-radio-button>
            </el-radio-group>
            <el-divider direction="vertical" />
            <el-radio-group v-model="filterPublic" @change="handleFilterChange">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="Y">公开</el-radio-button>
              <el-radio-button label="N">私密</el-radio-button>
            </el-radio-group>
            <el-divider direction="vertical" />
            <el-select v-model="sortBy" placeholder="排序方式" style="width: 140px" @change="handleSortChange">
              <el-option label="创建时间" value="createTime" />
              <el-option label="更新时间" value="updateTime" />
              <el-option label="图片数量" value="imageCount" />
              <el-option label="相册名称" value="albumName" />
            </el-select>
            <el-select v-model="sortOrder" style="width: 100px" @change="handleSortChange">
              <el-option label="降序" value="desc" />
              <el-option label="升序" value="asc" />
            </el-select>
          </el-space>
        </el-card>
      </transition>
    </div>

    <!-- 相册网格 -->
    <div class="album-grid-container">
      <!-- 骨架屏 -->
      <div v-if="loading && albumList.length === 0" class="album-grid">
        <div v-for="i in 8" :key="`skeleton-${i}`" class="album-card-wrapper">
          <el-card :body-style="{ padding: 0 }" class="album-card" shadow="never">
            <el-skeleton animated>
              <template #template>
                <div class="skeleton-cover">
                  <el-skeleton-item style="width: 100%; height: 200px" variant="image" />
                </div>
                <div class="skeleton-info" style="padding: 16px">
                  <el-skeleton-item style="width: 60%; margin-bottom: 12px" variant="h3" />
                  <el-skeleton-item style="width: 100%; margin-bottom: 8px" variant="text" />
                  <el-skeleton-item style="width: 80%" variant="text" />
                  <div style="display: flex; gap: 16px; margin-top: 12px">
                    <el-skeleton-item style="width: 30%" variant="text" />
                    <el-skeleton-item style="width: 30%" variant="text" />
                    <el-skeleton-item style="width: 30%" variant="text" />
                  </div>
                </div>
              </template>
            </el-skeleton>
          </el-card>
        </div>
      </div>

      <!-- 数据列表 -->
      <transition-group v-else class="album-grid" name="album-list" tag="div">
        <div v-for="album in albumList" :key="album.albumId" class="album-card-wrapper">
          <el-card :body-style="{ padding: 0 }" class="album-card" shadow="never">
            <!-- 选择框 -->
            <div class="album-checkbox">
              <el-checkbox :model-value="selectedIds.includes(album.albumId)" size="large" @change="toggleSelection(album.albumId)" @click.stop />
            </div>
            <!-- 状态标签 -->
            <div class="album-badges">
              <el-tag v-if="album.isPublic === 'Y'" size="small" type="success">
                <el-icon class="mr-1">
                  <Unlock />
                </el-icon>
                公开
              </el-tag>
              <el-tag v-else-if="album.isPublic === 'N'" size="small" type="info">
                <el-icon class="mr-1">
                  <Lock />
                </el-icon>
                私密
              </el-tag>
              <el-tag v-if="album.status === '1'" size="small" type="danger">已停用</el-tag>
            </div>

            <!-- 封面图 -->
            <div class="album-cover" @click="handleViewAlbum(album)">
              <!-- 多图封面网格 -->
              <div v-if="album.coverImages && album.coverImages.length > 1" class="cover-grid">
                <div
                  v-for="(img, idx) in album.coverImages.slice(0, 4)"
                  :key="idx"
                  :style="{ backgroundImage: `url(${img})` }"
                  class="cover-grid-item"
                />
              </div>
              <!-- 单图封面 -->
              <img v-else-if="album.albumCover" :alt="album.albumName" :src="album.albumCover" class="cover-image" />
              <!-- 无封面占位 -->
              <div v-else class="cover-placeholder">
                <el-icon :size="60" color="#d0d0d0">
                  <Picture />
                </el-icon>
                <p class="text-gray-400 mt-2">暂无封面</p>
              </div>
              <!-- 悬浮遮罩 -->
              <div class="cover-overlay">
                <el-button :icon="View" circle size="large" type="primary" @click.stop="handleViewAlbum(album)" />
              </div>
            </div>

            <!-- 相册信息 -->
            <div class="album-info">
              <div class="album-header">
                <h3 :title="album.albumName" class="album-title">{{ album.albumName }}</h3>
                <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, album)">
                  <el-button :icon="MoreFilled" circle size="small" text />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :icon="Edit" command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item :icon="CopyDocument" command="copy">复制</el-dropdown-item>
                      <el-dropdown-item :icon="Delete" command="delete" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <p v-if="album.description" class="album-description">{{ album.description }}</p>
              <p v-else class="album-description text-gray-400">暂无描述</p>

              <!-- 统计信息 -->
              <div class="album-stats">
                <div class="stat-item">
                  <el-icon color="#409eff">
                    <Picture />
                  </el-icon>
                  <span>{{ album.imageCount || 0 }} 张</span>
                </div>
                <div class="stat-item">
                  <el-icon color="#67c23a">
                    <Folder />
                  </el-icon>
                  <span>{{ formatSize(album.totalSize) }}</span>
                </div>
                <div class="stat-item">
                  <el-icon color="#909399">
                    <Clock />
                  </el-icon>
                  <span>{{ formatDate(album.createTime) }}</span>
                </div>
              </div>

              <!--              &lt;!&ndash; 操作按钮 &ndash;&gt;-->
              <!--              <div class="album-actions">-->
              <!--                <el-button :icon="View" link type="primary" @click="handleViewAlbum(album)">查看</el-button>-->
              <!--                <el-button :icon="Edit" link type="success" @click="handleEdit(album)">编辑</el-button>-->
              <!--                <el-button :icon="Delete" link type="danger" @click="handleDelete(album)">删除</el-button>-->
              <!--              </div>-->
            </div>
          </el-card>
        </div>
      </transition-group>

      <!-- 空状态 -->
      <div v-if="!loading && albumList.length === 0" class="empty-state">
        <el-empty :image-size="200" description=" ">
          <template #image>
            <div class="empty-icon">
              <el-icon :size="120" color="#d0d0d0">
                <Folder />
              </el-icon>
            </div>
          </template>
          <template #description>
            <div class="empty-description">
              <h3>还没有相册</h3>
              <p v-if="searchKeyword || filterStatus || filterPublic !== ''">没有找到符合条件的相册，试试调整筛选条件</p>
              <p v-else>创建您的第一个相册，开始整理您的图片吧！</p>
            </div>
          </template>
          <el-space :size="12">
            <el-button v-if="searchKeyword || filterStatus || filterPublic !== ''" @click="resetFilters"> 重置筛选 </el-button>
            <el-button :icon="Plus" type="primary" @click="handleCreate"> 创建相册</el-button>
          </el-space>
        </el-empty>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-container mt-6">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :background="true"
        :page-sizes="[12, 24, 36, 48]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getList"
        @current-change="getList"
      />
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :title="dialogTitle" width="600px" @close="handleDialogClose">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="相册名称" prop="albumName">
          <el-input v-model="form.albumName" maxlength="50" placeholder="请输入相册名称" show-word-limit />
        </el-form-item>

        <el-form-item label="相册编码" prop="albumCode">
          <el-input v-model="form.albumCode" maxlength="50" placeholder="请输入相册编码" />
        </el-form-item>

        <el-form-item label="相册封面" prop="albumCover">
          <image-upload v-model="form.ossId" :limit="1" @upload-success="handleUploadSuccess" />
        </el-form-item>

        <el-form-item label="相册描述" prop="description">
          <el-input v-model="form.description" :rows="3" maxlength="200" placeholder="请输入相册描述" show-word-limit type="textarea" />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="是否公开" prop="isPublic">
              <el-radio-group v-model="form.isPublic">
                <el-radio label="Y">公开</el-radio>
                <el-radio label="N">私密</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="显示顺序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :max="9999" :min="0" controls-position="right" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" :rows="2" placeholder="请输入备注" type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button :loading="submitLoading" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" name="AlbumGallery" setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import {
  Clock,
  CopyDocument,
  DataAnalysis,
  Delete,
  Edit,
  Folder,
  Grid,
  List,
  Lock,
  MoreFilled,
  Picture,
  Plus,
  Refresh,
  Search,
  Unlock,
  View
} from '@element-plus/icons-vue';
import { addImageAlbum, delImageAlbum, getImageAlbum, listImageAlbum, updateImageAlbum } from '@/api/picturebed/imageAlbum';
import type { ImageAlbumForm, ImageAlbumQuery, ImageAlbumVO } from '@/api/picturebed/imageAlbum/types';
import router from '@/router';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 状态
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const searchKeyword = ref('');
const filterStatus = ref('');
const filterPublic = ref('');
const sortBy = ref('createTime');
const sortOrder = ref('desc');
const total = ref(0);

// 统计数据
const totalImages = ref(0);
const publicAlbums = ref(0);
const totalSize = ref(0);

// 批量选择
const selectedIds = ref<Array<string | number>>([]);

// 切换选择状态
const toggleSelection = (albumId: string | number) => {
  const index = selectedIds.value.indexOf(albumId);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(albumId);
  }
};

// 数据
const albumList = ref<ImageAlbumVO[]>([]);
const formRef = ref<FormInstance>();
const form = ref<ImageAlbumForm>({
  albumName: '',
  albumCode: '',
  albumCover: '',
  ossId: '',
  description: '',
  isPublic: 'Y',
  status: '0',
  sortOrder: 0,
  remark: ''
});

// 查询参数
const queryParams = reactive<ImageAlbumQuery>({
  pageNum: 1,
  pageSize: 12,
  albumName: '',
  status: '',
  isPublic: '',
  params: {
    sortBy: 'createTime',
    sortOrder: 'desc'
  }
});

// 表单验证规则
const rules = reactive<FormRules>({
  albumName: [{ required: true, message: '请输入相册名称', trigger: 'blur' }],
  albumCode: [{ required: true, message: '请输入相册编码', trigger: 'blur' }],
  albumCover: [{ required: true, message: '请上传相册封面', trigger: 'change' }],
  isPublic: [{ required: true, message: '请选择是否公开', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  sortOrder: [
    { required: true, message: '请输入显示顺序', trigger: 'blur' },
    { type: 'number', message: '显示顺序必须为数字', trigger: 'blur' }
  ]
});

// 获取列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await listImageAlbum(queryParams);
    albumList.value = res.rows;
    total.value = res.total;

    // 计算统计数据
    calculateStats();
  } catch (error) {
    console.error('获取相册列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 计算统计数据
const calculateStats = () => {
  totalImages.value = albumList.value.reduce((sum, album) => sum + (album.imageCount || 0), 0);
  publicAlbums.value = albumList.value.filter((album) => album.isPublic === 'Y').length;
  totalSize.value = albumList.value.reduce((sum, album) => sum + (album.totalSize || 0), 0);
};

// 搜索
const handleSearch = () => {
  queryParams.albumName = searchKeyword.value;
  queryParams.pageNum = 1;
  getList();
};

// 重置筛选
const resetFilters = () => {
  searchKeyword.value = '';
  filterStatus.value = '';
  filterPublic.value = '';
  sortBy.value = 'createTime';
  sortOrder.value = 'desc';
  queryParams.albumName = '';
  queryParams.status = '';
  queryParams.isPublic = '';
  queryParams.pageNum = 1;
  if (queryParams.params) {
    queryParams.params.sortBy = 'createTime';
    queryParams.params.sortOrder = 'desc';
  }
  getList();
};

// 筛选变化
const handleFilterChange = () => {
  queryParams.status = filterStatus.value;
  queryParams.isPublic = filterPublic.value;
  queryParams.pageNum = 1;
  getList();
};

// 排序变化
const handleSortChange = () => {
  if (!queryParams.params) {
    queryParams.params = {};
  }
  queryParams.params.sortBy = sortBy.value;
  queryParams.params.sortOrder = sortOrder.value;
  queryParams.pageNum = 1;
  getList();
};

// 视图切换
const handleViewChange = (command: string) => {
  ElMessage.info(`切换到${command === 'grid' ? '网格' : '列表'}视图`);
};
/** 图片上传成功回调 */
const handleUploadSuccess = (response: any) => {
  // 假设上传成功后返回的数据结构为 { url: 'xxx', ossId: 'xxx' }
  if (response && response.url) {
    form.value.albumCover = response.url;
  }
};
// 创建相册
const handleCreate = () => {
  dialogTitle.value = '创建相册';
  resetForm();
  dialogVisible.value = true;
};

// 编辑相册
const handleEdit = async (row: ImageAlbumVO) => {
  dialogTitle.value = '编辑相册';
  const res = await getImageAlbum(row.albumId);
  form.value = { ...res.data };
  dialogVisible.value = true;
};

// 查看相册
const handleViewAlbum = (row: ImageAlbumVO) => {
  router.push({
    path: `/picturebed/imageAlbum/detail/${row.albumId}`
  });
};

// 删除相册
const handleDelete = (row: ImageAlbumVO) => {
  ElMessageBox.confirm(`确定要删除相册"${row.albumName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await delImageAlbum(row.albumId);
        ElMessage.success('删除成功');
        getList();
      } catch (error) {
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的相册');
    return;
  }

  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个相册吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await delImageAlbum(selectedIds.value);
        ElMessage.success('批量删除成功');
        selectedIds.value = [];
        getList();
      } catch (error) {
        ElMessage.error('批量删除失败');
      }
    })
    .catch(() => {});
};

// 下拉菜单命令
const handleCommand = (command: string, row: ImageAlbumVO) => {
  switch (command) {
    case 'edit':
      handleEdit(row);
      break;
    case 'copy':
      ElMessage.info('复制功能开发中...');
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (form.value.albumId) {
          await updateImageAlbum(form.value);
          ElMessage.success('修改成功');
        } else {
          await addImageAlbum(form.value);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        getList();
      } catch (error) {
        ElMessage.error('操作失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  form.value = {
    albumName: '',
    albumCode: '',
    albumCover: '',
    ossId: undefined, // 新增
    description: '',
    isPublic: 'Y', // 默认公开
    status: '0', // 默认正常
    sortOrder: 0, // 默认顺序
    remark: ''
  };
  formRef.value?.resetFields();
};

// 对话框关闭
const handleDialogClose = () => {
  resetForm();
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
const formatDate = (date: string | undefined) => {
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
  return `${Math.floor(days / 365)}年前`;
};

// 初始化
onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.album-gallery-container {
  min-height: calc(100vh - 120px);
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
}

// 统计卡片
.stats-section {
  .stat-card {
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px;

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #303133;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: #909399;
          font-weight: 500;
        }
      }
    }
  }
}

.toolbar-section {
  .el-tag {
    font-weight: 500;
  }
}

.filter-section {
  :deep(.el-card__body) {
    display: flex;
    align-items: center;
  }
}

.album-grid-container {
  min-height: 400px;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.album-card-wrapper {
  transition: all 0.3s ease;
}

.album-card {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12) !important;

    .album-checkbox {
      opacity: 1;
    }
  }

  .album-checkbox {
    position: absolute;
    top: 2px;
    left: 8px;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .album-badges {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
    z-index: 1;
  }

  .album-cover {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    cursor: pointer;

    // 多图封面网格
    .cover-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 2px;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);

      .cover-grid-item {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
          z-index: 1;
        }
      }
    }

    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .cover-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      .cover-image {
        transform: scale(1.1);
      }

      .cover-overlay {
        opacity: 1;
      }
    }
  }

  .album-info {
    .album-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
      margin-bottom: 8px;
      padding: 0 10px;

      .album-title {
        flex: 1;
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .album-description {
      padding: 0 10px;
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #606266;
      line-height: 1.5;
      height: 42px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .album-stats {
      display: flex;
      justify-content: space-between;
      padding: 12px 10px;
      border-top: 1px solid #f0f0f0;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #606266;

        .el-icon {
          font-size: 16px;
        }
      }
    }

    .album-actions {
      display: flex;
      justify-content: space-between;
      gap: 8px;

      .el-button {
        flex: 1;
        font-weight: 500;
      }
    }
  }
}

.empty-state {
  padding: 60px 0;

  .empty-icon {
    animation: float 3s ease-in-out infinite;
  }

  .empty-description {
    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 16px 0 8px;
    }

    p {
      font-size: 14px;
      color: #909399;
      margin: 0;
      line-height: 1.6;
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  background: white;
  border-radius: 8px;
}

// 动画
.album-list-enter-active,
.album-list-leave-active {
  transition: all 0.3s ease;
}

.album-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.album-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

// 响应式
@media (max-width: 1200px) {
  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .album-card {
    .album-cover {
      height: 160px;
    }
  }
}

@media (max-width: 576px) {
  .album-grid {
    grid-template-columns: 1fr;
  }
}
</style>

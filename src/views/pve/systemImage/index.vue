<template>
  <div class="system-image-container">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon total"><Files /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalImages }}</span>
          <span class="stat-label">总镜像</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon linux"><Monitor /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.linuxImages }}</span>
          <span class="stat-label">Linux</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon windows"><Monitor /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.windowsImages }}</span>
          <span class="stat-label">Windows</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon iso"><Document /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.isoImages }}</span>
          <span class="stat-label">ISO镜像</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon size"><Odometer /></el-icon>
        <div class="stat-info">
          <span class="stat-value">{{ overview.totalSize }}</span>
          <span class="stat-label">总大小(GB)</span>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar-container">
      <div class="toolbar-main">
        <!-- 左侧：类型筛选 -->
        <div class="toolbar-section">
          <el-radio-group v-model="queryParams.imageType" @change="handleQuery">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="iso">ISO</el-radio-button>
            <el-radio-button label="template">模板</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 中间：操作按钮 -->
        <div class="toolbar-section">
          <el-button v-hasPermi="['pve:systemImage:add']" icon="Plus" type="primary" @click="handleAdd">新增镜像</el-button>
          <el-button v-hasPermi="['pve:systemImage:remove']" icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        </div>

        <!-- 右侧：搜索和刷新 -->
        <div class="toolbar-section toolbar-right">
          <el-select v-model="queryParams.osType" clearable placeholder="操作系统" style="width: 120px" @change="handleQuery">
            <el-option label="Linux" value="Linux" />
            <el-option label="Windows" value="Windows" />
          </el-select>
          <el-select v-model="queryParams.architecture" clearable placeholder="架构" style="width: 120px" @change="handleQuery">
            <el-option label="x86_64" value="x86_64" />
            <el-option label="aarch64" value="aarch64" />
          </el-select>
          <el-input
            v-model="queryParams.imageName"
            class="search-input"
            clearable
            placeholder="搜索镜像名称"
            prefix-icon="Search"
            style="width: 200px"
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          />
          <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 镜像列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="systemImageList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed type="selection" width="40" />

        <!-- 镜像信息 -->
        <el-table-column label="镜像信息" min-width="250">
          <template #default="{ row }">
            <div class="image-info">
              <div class="image-name-row">
                <el-icon class="image-icon"><Files /></el-icon>
                <span class="image-name">{{ row.imageName }}</span>
              </div>
              <div class="image-meta">
                <span class="meta-item">ID: {{ row.imageId }}</span>
                <span v-if="row.osVersion" class="meta-divider">|</span>
                <span v-if="row.osVersion" class="meta-item">{{ row.osVersion }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 镜像类型 -->
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.imageType === 'iso'" type="primary">ISO</el-tag>
            <el-tag v-else-if="row.imageType === 'template'" type="success">模板</el-tag>
            <el-tag v-else type="info">{{ row.imageType }}</el-tag>
          </template>
        </el-table-column>

        <!-- 操作系统 -->
        <el-table-column label="操作系统" width="120" align="center">
          <template #default="{ row }">
            <div class="os-info">
              <el-icon v-if="row.osType === 'Linux'" class="os-icon linux"><Monitor /></el-icon>
              <el-icon v-else-if="row.osType === 'Windows'" class="os-icon windows"><Monitor /></el-icon>
              <span>{{ row.osType || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 架构 -->
        <el-table-column label="架构" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.architecture === 'x86_64'" type="success" size="small">x86_64</el-tag>
            <el-tag v-else-if="row.architecture === 'aarch64'" type="warning" size="small">aarch64</el-tag>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <!-- 镜像大小 -->
        <el-table-column label="大小" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.imageSize" class="size-value">{{ formatSize(row.imageSize) }}</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === '0'" type="success">正常</el-tag>
            <el-tag v-else type="info">停用</el-tag>
          </template>
        </el-table-column>

        <!-- 排序 -->
        <el-table-column label="排序" width="80" align="center">
          <template #default="{ row }">
            <span>{{ row.sort || 0 }}</span>
          </template>
        </el-table-column>

        <!-- 描述 -->
        <el-table-column label="描述" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.description">{{ row.description }}</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
              <el-button link type="primary">
                更多
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-hasPermi="['pve:systemImage:edit']" command="edit">修改</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:systemImage:download']" command="download">下载</el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['pve:systemImage:remove']" command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" append-to-body>
      <el-form ref="systemImageFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="镜像名称" prop="imageName">
          <el-input v-model="form.imageName" placeholder="请输入镜像名称" />
        </el-form-item>
        <el-form-item label="镜像类型" prop="imageType">
          <el-select v-model="form.imageType" placeholder="请选择镜像类型" style="width: 100%">
            <el-option label="ISO" value="iso" />
            <el-option label="模板" value="template" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作系统" prop="osType">
          <el-select v-model="form.osType" placeholder="请选择操作系统类型" style="width: 100%">
            <el-option label="Linux" value="Linux" />
            <el-option label="Windows" value="Windows" />
          </el-select>
        </el-form-item>
        <el-form-item label="系统版本" prop="osVersion">
          <el-input v-model="form.osVersion" placeholder="请输入操作系统版本" />
        </el-form-item>
        <el-form-item label="架构" prop="architecture">
          <el-select v-model="form.architecture" placeholder="请选择架构" style="width: 100%">
            <el-option label="x86_64" value="x86_64" />
            <el-option label="aarch64" value="aarch64" />
          </el-select>
        </el-form-item>
        <el-form-item label="镜像大小" prop="imageSize">
          <el-input-number v-model="form.imageSize" :min="0" placeholder="请输入镜像大小(字节)" style="width: 100%" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" placeholder="请输入排序" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SystemImage" lang="ts">
import { listSystemImage, getSystemImage, delSystemImage, addSystemImage, updateSystemImage } from '@/api/pve/systemImage';
import type { SystemImageVO, SystemImageQuery, SystemImageForm } from '@/api/pve/systemImage/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const systemImageList = ref<SystemImageVO[]>([]);
const open = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

// 统计数据
const overview = ref({
  totalImages: 0,
  linuxImages: 0,
  windowsImages: 0,
  isoImages: 0,
  totalSize: 0
});

const systemImageFormRef = ref<ElFormInstance>();

const queryParams = ref<SystemImageQuery>({
  pageNum: 1,
  pageSize: 10,
  imageName: undefined,
  imageType: '',
  osType: undefined,
  architecture: undefined
});

const form = ref<SystemImageForm>({});

const rules = ref({
  imageName: [{ required: true, message: '镜像名称不能为空', trigger: 'blur' }],
  imageType: [{ required: true, message: '镜像类型不能为空', trigger: 'change' }]
});

/** 格式化文件大小 */
function formatSize(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

/** 计算统计数据 */
function calculateOverview() {
  const total = systemImageList.value.length;
  const linux = systemImageList.value.filter((img) => img.osType === 'Linux').length;
  const windows = systemImageList.value.filter((img) => img.osType === 'Windows').length;
  const iso = systemImageList.value.filter((img) => img.imageType === 'iso').length;
  const totalBytes = systemImageList.value.reduce((sum, img) => sum + (img.imageSize || 0), 0);

  overview.value = {
    totalImages: total,
    linuxImages: linux,
    windowsImages: windows,
    isoImages: iso,
    totalSize: (totalBytes / (1024 * 1024 * 1024)).toFixed(2)
  };
}

/** 查询镜像列表 */
function getList() {
  loading.value = true;
  listSystemImage(queryParams.value).then((response: any) => {
    systemImageList.value = response.rows;
    total.value = response.total;
    calculateOverview();
    loading.value = false;
  });
}

/** 刷新 */
function handleRefresh() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    imageName: undefined,
    imageType: '',
    osType: undefined,
    architecture: undefined
  };
  getList();
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    imageId: undefined,
    imageName: undefined,
    imageType: undefined,
    osType: undefined,
    osVersion: undefined,
    architecture: undefined,
    imageSize: undefined,
    fileId: undefined,
    status: '0',
    description: undefined,
    sort: 0
  };
  systemImageFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: SystemImageVO[]) {
  ids.value = selection.map((item) => item.imageId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加系统镜像';
}

/** 修改按钮操作 */
function handleUpdate(row: SystemImageVO) {
  reset();
  const imageId = row.imageId || ids.value[0];
  getSystemImage(imageId).then((response: any) => {
    form.value = response.data;
    open.value = true;
    title.value = '修改系统镜像';
  });
}

/** 提交按钮 */
function submitForm() {
  systemImageFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (form.value.imageId) {
        updateSystemImage(form.value).then(() => {
          proxy?.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addSystemImage(form.value).then(() => {
          proxy?.$modal.msgSuccess('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row?: SystemImageVO) {
  const imageIds = row?.imageId || ids.value;
  proxy?.$modal
    .confirm('是否确认删除系统镜像编号为"' + imageIds + '"的数据项？')
    .then(() => {
      return delSystemImage(imageIds);
    })
    .then(() => {
      getList();
      proxy?.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 下载镜像 */
function handleDownload(row: SystemImageVO) {
  proxy?.$modal.msgInfo('下载功能开发中...');
}

/** 操作命令处理 */
function handleCommand(command: string, row: SystemImageVO) {
  switch (command) {
    case 'edit':
      handleUpdate(row);
      break;
    case 'download':
      handleDownload(row);
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
}

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.system-image-container {
  padding: 16px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

/* 统计栏样式 */
.stats-bar {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 16px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.stat-icon {
  font-size: 32px;
  &.total {
    color: #409eff;
  }
  &.linux {
    color: #67c23a;
  }
  &.windows {
    color: #409eff;
  }
  &.iso {
    color: #e6a23c;
  }
  &.size {
    color: #f56c6c;
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e4e7ed;
  margin: 0 16px;
}

/* 工具栏样式 */
.toolbar-container {
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toolbar-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  margin-left: auto;
}

/* 表格容器 */
.table-container {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 镜像信息 */
.image-info {
  .image-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .image-icon {
    font-size: 18px;
    color: #409eff;
    margin-right: 8px;
  }

  .image-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .image-meta {
    font-size: 12px;
    color: #909399;
    padding-left: 26px;
  }

  .meta-item {
    margin-right: 4px;
  }

  .meta-divider {
    margin: 0 4px;
  }
}

/* 操作系统信息 */
.os-info {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;

  .os-icon {
    font-size: 16px;
    &.linux {
      color: #67c23a;
    }
    &.windows {
      color: #409eff;
    }
  }
}

/* 大小值 */
.size-value {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}
</style>

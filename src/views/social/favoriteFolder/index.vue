<template>
  <div class="social-manage-page">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="用户ID" prop="userId">
            <el-input v-model="queryParams.userId" class="field-sm" clearable placeholder="请输入用户ID" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="收藏夹名称" prop="folderName">
            <el-input v-model="queryParams.folderName" class="field-md" clearable placeholder="请输入收藏夹名称" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="是否公开" prop="isPublic">
            <el-select v-model="queryParams.isPublic" class="field-sm" clearable placeholder="请选择">
              <el-option label="私密" value="0" />
              <el-option label="公开" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              class="field-date"
              end-placeholder="结束日期"
              range-separator="-"
              start-placeholder="开始日期"
              type="daterange"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item class="filter-actions">
            <el-button icon="Search" type="primary" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </section>
    </transition>

    <section class="list-panel">
      <header class="panel-toolbar">
        <div class="toolbar-title">
          <span class="title-text">收藏夹管理</span>
          <span class="title-meta">{{ total }} 条记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['social:favoriteFolder:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
          <el-button v-hasPermi="['social:favoriteFolder:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
            批量删除
          </el-button>
          <el-button v-hasPermi="['social:favoriteFolder:export']" icon="Download" plain @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <el-table v-loading="loading" :data="folderList" class="social-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="48" />
        <el-table-column align="center" label="收藏夹ID" prop="folderId" width="110" />
        <el-table-column align="center" label="用户ID" width="120">
          <template #default="{ row }">
            <el-link type="primary" @click="openUserDrawer(row.userId)">{{ row.userId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="收藏夹名称" min-width="220" prop="folderName" show-overflow-tooltip />
        <el-table-column label="描述" min-width="220" prop="folderDesc" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.folderDesc || '暂无' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="公开状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isPublic === '1' ? 'success' : 'info'" effect="light" round>{{ row.isPublic === '1' ? '公开' : '私密' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="内容数" prop="itemCount" width="90" />
        <el-table-column align="center" label="排序" prop="sortOrder" width="90" />
        <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
        <el-table-column align="center" fixed="right" label="操作" width="150">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:favoriteFolder:edit']" link type="primary" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['social:favoriteFolder:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" append-to-body width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="收藏夹名称" prop="folderName">
          <el-input v-model="form.folderName" maxlength="100" placeholder="请输入收藏夹名称" />
        </el-form-item>
        <el-form-item label="描述" prop="folderDesc">
          <el-input v-model="form.folderDesc" :rows="3" maxlength="500" placeholder="请输入描述" show-word-limit type="textarea" />
        </el-form-item>
        <el-form-item label="是否公开" prop="isPublic">
          <el-radio-group v-model="form.isPublic">
            <el-radio label="0">私密</el-radio>
            <el-radio label="1">公开</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="封面图" prop="coverUrl">
          <el-input v-model="form.coverUrl" placeholder="请输入封面图 URL" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button :loading="submitLoading" type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <UserStatsDrawer v-model:visible="userDrawerVisible" :user-id="selectedUserId" />
  </div>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus';
import {
  addSocialFavoriteFolder,
  delSocialFavoriteFolder,
  getSocialFavoriteFolder,
  listSocialFavoriteFolder,
  updateSocialFavoriteFolder
} from '@/api/social/favoriteFolder';
import type { SocialFavoriteFolderForm, SocialFavoriteFolderQuery, SocialFavoriteFolderVO } from '@/api/social/favoriteFolder/types';
import UserStatsDrawer from '../components/UserStatsDrawer.vue';

const { proxy } = getCurrentInstance() as any;

const queryRef = ref<FormInstance>();
const formRef = ref<FormInstance>();
const folderList = ref<SocialFavoriteFolderVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[string, string]>();
const dialogVisible = ref(false);
const dialogTitle = ref('');
const submitLoading = ref(false);
const userDrawerVisible = ref(false);
const selectedUserId = ref<string | number>();

const queryParams = ref<SocialFavoriteFolderQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  folderName: undefined,
  isPublic: undefined
});

const form = ref<SocialFavoriteFolderForm>({
  folderId: undefined,
  userId: undefined,
  folderName: '',
  folderDesc: '',
  isPublic: '0',
  coverUrl: '',
  sortOrder: 0
});

const rules = ref({
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  folderName: [{ required: true, message: '收藏夹名称不能为空', trigger: 'blur' }],
  isPublic: [{ required: true, message: '请选择公开状态', trigger: 'change' }]
});

function getList() {
  loading.value = true;
  const params = proxy.addDateRange(queryParams.value, dateRange.value);
  listSocialFavoriteFolder(params)
    .then((response: any) => {
      folderList.value = response.rows;
      total.value = response.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  dateRange.value = undefined;
  queryRef.value?.resetFields();
  handleQuery();
}

function handleSelectionChange(selection: SocialFavoriteFolderVO[]) {
  ids.value = selection.map((item) => item.folderId);
  multiple.value = !selection.length;
}

function openUserDrawer(userId: string | number) {
  selectedUserId.value = userId;
  userDrawerVisible.value = true;
}

function resetForm() {
  form.value = {
    folderId: undefined,
    userId: undefined,
    folderName: '',
    folderDesc: '',
    isPublic: '0',
    coverUrl: '',
    sortOrder: 0
  };
  formRef.value?.resetFields();
}

function handleAdd() {
  resetForm();
  dialogVisible.value = true;
  dialogTitle.value = '新增收藏夹';
}

async function handleUpdate(row: SocialFavoriteFolderVO) {
  resetForm();
  const res = await getSocialFavoriteFolder(row.folderId);
  form.value = res.data;
  dialogVisible.value = true;
  dialogTitle.value = '编辑收藏夹';
}

function submitForm() {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return;
    submitLoading.value = true;
    const request = form.value.folderId ? updateSocialFavoriteFolder(form.value) : addSocialFavoriteFolder(form.value);
    request
      .then(() => {
        proxy.$modal.msgSuccess(form.value.folderId ? '修改成功' : '新增成功');
        dialogVisible.value = false;
        getList();
      })
      .finally(() => {
        submitLoading.value = false;
      });
  });
}

function handleDelete(row?: SocialFavoriteFolderVO) {
  const folderIds = row ? [row.folderId] : ids.value;
  proxy.$modal
    .confirm('确认删除选中的收藏夹吗？')
    .then(() => delSocialFavoriteFolder(folderIds))
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

function handleExport() {
  proxy.download('social/favoriteFolder/export', { ...queryParams.value }, `favoriteFolder_${new Date().getTime()}.xlsx`);
}

getList();
</script>

<style lang="scss" scoped>
.social-manage-page {
  padding: 16px;
  background: #f6f8fb;
  min-height: calc(100vh - 84px);
}

.filter-panel,
.list-panel {
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.filter-panel {
  padding: 16px 18px 2px;
  margin-bottom: 14px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-actions {
  margin-left: auto;
}

.field-sm {
  width: 140px;
}

.field-md {
  width: 200px;
}

.field-date {
  width: 240px;
}

.list-panel {
  padding: 14px 16px 4px;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.toolbar-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #182230;
}

.title-meta {
  font-size: 12px;
  color: #7a8699;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

:deep(.social-table) {
  --el-table-border-color: #edf1f7;
  --el-table-header-bg-color: #f8fafc;
}
</style>

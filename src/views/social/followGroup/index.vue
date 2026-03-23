<template>
  <div class="social-manage-page">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="用户ID" prop="userId">
            <el-input v-model="queryParams.userId" class="field-sm" clearable placeholder="请输入用户ID" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="分组名称" prop="groupName">
            <el-input v-model="queryParams.groupName" class="field-md" clearable placeholder="请输入分组名称" @keyup.enter="handleQuery" />
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
          <span class="title-text">关注分组</span>
          <span class="title-meta">{{ total }} 条记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['social:followGroup:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
          <el-button v-hasPermi="['social:followGroup:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()">
            编辑
          </el-button>
          <el-button v-hasPermi="['social:followGroup:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
            删除
          </el-button>
          <el-button v-hasPermi="['social:followGroup:export']" icon="Download" plain @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <el-table v-loading="loading" :data="groupList" class="social-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="48" />
        <el-table-column align="center" label="分组ID" prop="groupId" width="100" />
        <el-table-column align="center" label="用户ID" width="120">
          <template #default="{ row }">
            <el-link type="primary" @click="openUserDrawer(row.userId)">{{ row.userId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="分组名称" min-width="220" prop="groupName" show-overflow-tooltip />
        <el-table-column label="分组描述" min-width="240" prop="groupDesc" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.groupDesc || '暂无' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="成员数" prop="memberCount" width="90" />
        <el-table-column align="center" label="排序" prop="sortOrder" width="90" />
        <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
        <el-table-column align="center" fixed="right" label="操作" width="150">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:followGroup:edit']" link type="primary" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['social:followGroup:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" append-to-body width="600px" @close="cancel">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="分组名称" prop="groupName">
          <el-input v-model="form.groupName" maxlength="50" placeholder="请输入分组名称" show-word-limit />
        </el-form-item>
        <el-form-item label="分组描述" prop="groupDesc">
          <el-input v-model="form.groupDesc" :rows="3" maxlength="200" placeholder="请输入分组描述" show-word-limit type="textarea" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <UserStatsDrawer v-model:visible="userDrawerVisible" :user-id="selectedUserId" />
  </div>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus';
import {
  addSocialFollowGroup,
  delSocialFollowGroup,
  getSocialFollowGroup,
  listSocialFollowGroup,
  updateSocialFollowGroup
} from '@/api/social/followGroup';
import type { SocialFollowGroupForm, SocialFollowGroupQuery, SocialFollowGroupVO } from '@/api/social/followGroup/types';
import UserStatsDrawer from '../components/UserStatsDrawer.vue';

const { proxy } = getCurrentInstance() as any;

const queryRef = ref<FormInstance>();
const formRef = ref<FormInstance>();
const groupList = ref<SocialFollowGroupVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[string, string]>();
const dialogVisible = ref(false);
const dialogTitle = ref('');
const userDrawerVisible = ref(false);
const selectedUserId = ref<string | number>();

const queryParams = ref<SocialFollowGroupQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  groupName: undefined
});

const form = ref<SocialFollowGroupForm>({});

const rules = ref({
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  groupName: [{ required: true, message: '分组名称不能为空', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
});

function getList() {
  loading.value = true;
  const params = proxy.addDateRange(queryParams.value, dateRange.value);
  listSocialFollowGroup(params)
    .then((response: any) => {
      groupList.value = response.rows;
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

function handleSelectionChange(selection: SocialFollowGroupVO[]) {
  ids.value = selection.map((item) => item.groupId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

function openUserDrawer(userId: string | number) {
  selectedUserId.value = userId;
  userDrawerVisible.value = true;
}

function reset() {
  form.value = {
    groupId: undefined,
    userId: undefined,
    groupName: undefined,
    groupDesc: undefined,
    sortOrder: 0
  };
  formRef.value?.resetFields();
}

function handleAdd() {
  reset();
  dialogVisible.value = true;
  dialogTitle.value = '新增关注分组';
}

function handleUpdate(row?: SocialFollowGroupVO) {
  reset();
  const groupId = row?.groupId || ids.value[0];
  getSocialFollowGroup(groupId).then((response: any) => {
    form.value = response.data;
    dialogVisible.value = true;
    dialogTitle.value = '编辑关注分组';
  });
}

function submitForm() {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return;
    const request = form.value.groupId ? updateSocialFollowGroup(form.value) : addSocialFollowGroup(form.value);
    request.then(() => {
      proxy.$modal.msgSuccess(form.value.groupId ? '修改成功' : '新增成功');
      dialogVisible.value = false;
      getList();
    });
  });
}

function handleDelete(row?: SocialFollowGroupVO) {
  const groupIds = row ? [row.groupId] : ids.value;
  proxy.$modal
    .confirm('确认删除选中的关注分组吗？')
    .then(() => delSocialFollowGroup(groupIds))
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

function handleExport() {
  proxy.download('social/followGroup/export', { ...queryParams.value }, `followGroup_${new Date().getTime()}.xlsx`);
}

function cancel() {
  dialogVisible.value = false;
  reset();
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

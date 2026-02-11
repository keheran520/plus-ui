<template>
  <div class="p-2">
    <!-- 搜索区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="never">
          <el-form ref="queryRef" :inline="true" :model="queryParams">
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="queryParams.userId" clearable placeholder="请输入用户ID" style="width: 150px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="分组名称" prop="groupName">
              <el-input v-model="queryParams.groupName" clearable placeholder="请输入分组名称" style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="dateRange"
                end-placeholder="结束日期"
                range-separator="-"
                start-placeholder="开始日期"
                style="width: 240px"
                type="daterange"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item>
              <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <!-- 操作按钮和表格区域 -->
    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:followGroup:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:followGroup:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:followGroup:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:followGroup:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="groupList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" fixed type="selection" width="50" />
        <el-table-column align="center" label="分组ID" prop="groupId" width="100" />
        <el-table-column align="center" label="用户信息" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <div class="user-id">ID: {{ row.userId }}</div>
              <div class="user-name">{{ row.nickName || row.userName || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="分组名称" prop="groupName" width="200" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="分组描述" min-width="250" prop="groupDesc">
          <template #default="{ row }">
            {{ row.groupDesc || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="成员数量" prop="memberCount" width="100">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.memberCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" prop="sortOrder" width="80" />
        <el-table-column align="center" label="创建时间" prop="createTime" sortable width="180" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="180">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:followGroup:edit']" icon="Edit" link type="primary" @click="handleUpdate(row)">修改</el-button>
            <el-button v-hasPermi="['social:followGroup:remove']" icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 添加或修改对话框 -->
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
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {
  addSocialFollowGroup,
  delSocialFollowGroup,
  getSocialFollowGroup,
  listSocialFollowGroup,
  updateSocialFollowGroup
} from '@/api/social/followGroup';
import type { SocialFollowGroupForm, SocialFollowGroupQuery, SocialFollowGroupVO } from '@/api/social/followGroup/types';

const { proxy } = getCurrentInstance() as any;

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

/** 查询关注分组列表 */
function getList() {
  loading.value = true;
  const params = proxy.addDateRange(queryParams.value, dateRange.value);
  listSocialFollowGroup(params)
    .then((response: any) => {
      groupList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = undefined;
  proxy.resetForm('queryRef');
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: SocialFollowGroupVO[]) {
  ids.value = selection.map((item) => item.groupId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  dialogVisible.value = true;
  dialogTitle.value = '添加关注分组';
}

/** 修改按钮操作 */
function handleUpdate(row?: SocialFollowGroupVO) {
  reset();
  const groupId = row?.groupId || ids.value[0];
  getSocialFollowGroup(groupId).then((response: any) => {
    form.value = response.data;
    dialogVisible.value = true;
    dialogTitle.value = '修改关注分组';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate((valid: boolean) => {
    if (valid) {
      if (form.value.groupId) {
        updateSocialFollowGroup(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功');
          dialogVisible.value = false;
          getList();
        });
      } else {
        addSocialFollowGroup(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功');
          dialogVisible.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row?: SocialFollowGroupVO) {
  const groupIds = row ? [row.groupId] : ids.value;
  proxy.$modal
    .confirm('确认删除选中的关注分组吗？')
    .then(() => {
      return delSocialFollowGroup(groupIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'social/followGroup/export',
    {
      ...queryParams.value
    },
    `followGroup_${new Date().getTime()}.xlsx`
  );
}

/** 表单重置 */
function reset() {
  form.value = {
    groupId: undefined,
    userId: undefined,
    groupName: undefined,
    groupDesc: undefined,
    sortOrder: 0
  };
  proxy.resetForm('formRef');
}

/** 取消按钮 */
function cancel() {
  dialogVisible.value = false;
  reset();
}

getList();
</script>

<style lang="scss" scoped>
.user-info {
  .user-id {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }

  .user-name {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }
}
</style>

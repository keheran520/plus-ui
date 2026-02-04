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
            <el-form-item label="收藏夹名称" prop="folderName">
              <el-input v-model="queryParams.folderName" clearable placeholder="请输入收藏夹名称" style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="是否公开" prop="isPublic">
              <el-select v-model="queryParams.isPublic" clearable placeholder="请选择" style="width: 120px">
                <el-option label="私密" value="0" />
                <el-option label="公开" value="1" />
              </el-select>
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
            <el-button v-hasPermi="['social:favoriteFolder:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:favoriteFolder:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
              批量删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:favoriteFolder:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="folderList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" fixed type="selection" width="50" />
        <el-table-column align="center" label="收藏夹ID" prop="folderId" width="100" />
        <el-table-column align="center" label="用户ID" prop="userId" width="100" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="用户昵称" prop="nickName" width="150">
          <template #default="{ row }">
            {{ row.nickName || row.userName || '-' }}
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="收藏夹名称" min-width="200" prop="folderName" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="描述" prop="folderDesc" width="200">
          <template #default="{ row }">
            {{ row.folderDesc || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="是否公开" prop="isPublic" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isPublic === '1'" type="success">公开</el-tag>
            <el-tag v-else type="info">私密</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="收藏数量" prop="itemCount" sortable width="100" />
        <el-table-column align="center" label="排序" prop="sortOrder" sortable width="80" />
        <el-table-column align="center" label="创建时间" prop="createTime" sortable width="180" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="150">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:favoriteFolder:edit']" icon="Edit" link type="primary" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['social:favoriteFolder:remove']" icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 新增/编辑对话框 -->
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
        <el-form-item label="封面图片" prop="coverUrl">
          <el-input v-model="form.coverUrl" placeholder="请输入封面图片URL" />
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
  </div>
</template>

<script lang="ts" setup>
import { addSocialFavoriteFolder, delSocialFavoriteFolder, getSocialFavoriteFolder, listSocialFavoriteFolder, updateSocialFavoriteFolder } from '@/api/social/favoriteFolder'
import type { SocialFavoriteFolderForm, SocialFavoriteFolderQuery, SocialFavoriteFolderVO } from '@/api/social/favoriteFolder/types'

const { proxy } = getCurrentInstance() as any

const folderList = ref<SocialFavoriteFolderVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<Array<string | number>>([])
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<[string, string]>()
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)

const queryParams = ref<SocialFavoriteFolderQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  folderName: undefined,
  isPublic: undefined
})

const form = ref<SocialFavoriteFolderForm>({
  folderId: undefined,
  userId: undefined,
  folderName: '',
  folderDesc: '',
  isPublic: '0',
  coverUrl: '',
  sortOrder: 0
})

const rules = ref({
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  folderName: [{ required: true, message: '收藏夹名称不能为空', trigger: 'blur' }],
  isPublic: [{ required: true, message: '请选择是否公开', trigger: 'change' }]
})

/** 查询收藏夹列表 */
function getList() {
  loading.value = true
  const params = proxy.addDateRange(queryParams.value, dateRange.value)
  listSocialFavoriteFolder(params)
    .then((response: any) => {
      folderList.value = response.rows
      total.value = response.total
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = undefined
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: SocialFavoriteFolderVO[]) {
  ids.value = selection.map((item) => item.folderId)
  multiple.value = !selection.length
}

/** 重置表单 */
function resetForm() {
  form.value = {
    folderId: undefined,
    userId: undefined,
    folderName: '',
    folderDesc: '',
    isPublic: '0',
    coverUrl: '',
    sortOrder: 0
  }
  proxy.resetForm('formRef')
}

/** 新增按钮操作 */
function handleAdd() {
  resetForm()
  dialogVisible.value = true
  dialogTitle.value = '新增收藏夹'
}

/** 修改按钮操作 */
async function handleUpdate(row: SocialFavoriteFolderVO) {
  resetForm()
  const res = await getSocialFavoriteFolder(row.folderId)
  form.value = res.data
  dialogVisible.value = true
  dialogTitle.value = '编辑收藏夹'
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate((valid: boolean) => {
    if (valid) {
      submitLoading.value = true
      if (form.value.folderId) {
        updateSocialFavoriteFolder(form.value)
          .then(() => {
            proxy.$modal.msgSuccess('修改成功')
            dialogVisible.value = false
            getList()
          })
          .finally(() => {
            submitLoading.value = false
          })
      } else {
        addSocialFavoriteFolder(form.value)
          .then(() => {
            proxy.$modal.msgSuccess('新增成功')
            dialogVisible.value = false
            getList()
          })
          .finally(() => {
            submitLoading.value = false
          })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row?: SocialFavoriteFolderVO) {
  const folderIds = row ? [row.folderId] : ids.value
  proxy.$modal
    .confirm('确认删除选中的收藏夹吗？')
    .then(() => {
      return delSocialFavoriteFolder(folderIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'social/favoriteFolder/export',
    {
      ...queryParams.value
    },
    `favoriteFolder_${new Date().getTime()}.xlsx`
  )
}

getList()
</script>

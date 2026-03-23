<template>
  <div class="member-level-page">
    <section class="filter-panel">
      <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="等级名称">
          <el-input v-model="queryParams.levelName" clearable class="field-sm" placeholder="请输入等级名称" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="等级编码">
          <el-input v-model="queryParams.levelCode" clearable class="field-sm" placeholder="请输入等级编码" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" clearable class="field-sm" placeholder="全部状态">
            <el-option label="启用" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="list-panel">
      <header class="panel-toolbar">
        <div class="toolbar-title">
          <span class="title-text">会员等级</span>
          <span class="title-meta">固定内置 V1-V7，仅支持维护展示信息与成长门槛</span>
        </div>
      </header>

      <el-table v-loading="loading" :data="levelList" class="manage-table">
        <el-table-column label="等级" min-width="220">
          <template #default="{ row }">
            <div class="stack-cell">
              <div class="stack-main">
                <span class="main-line">{{ row.levelName }}</span>
                <el-tag v-if="row.builtIn" size="small" effect="plain" round>内置</el-tag>
              </div>
              <span class="sub-line">{{ row.levelCode }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="等级图片" width="120" align="center">
          <template #default="{ row }">
            <div class="image-box">
              <el-image v-if="row.levelImage" :src="row.levelImage" fit="cover" preview-teleported class="level-image" />
              <div v-else class="image-placeholder">{{ row.levelCode }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="levelSort" width="90" align="center" />
        <el-table-column label="所需成长值" prop="requiredGrowth" width="120" align="center" />
        <el-table-column label="权益说明" prop="benefits" min-width="280" show-overflow-tooltip />
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="0"
              inactive-value="1"
              :disabled="isV1(row)"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="110" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-hasPermi="['member:level:edit']" link type="primary" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="dialog.visible" :title="dialog.title" size="640px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="等级名称" prop="levelName">
            <el-input v-model="form.levelName" maxlength="50" placeholder="请输入等级名称" />
          </el-form-item>
          <el-form-item label="等级编码" prop="levelCode">
            <el-input v-model="form.levelCode" maxlength="50" :disabled="Boolean(form.builtIn)" placeholder="系统内置编码不可修改" />
          </el-form-item>
          <el-form-item label="排序" prop="levelSort">
            <el-input-number v-model="form.levelSort" :min="1" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="所需成长值" prop="requiredGrowth">
            <el-input-number v-model="form.requiredGrowth" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </div>
        <el-form-item label="等级图片" prop="levelImage">
          <image-upload v-model="form.ossId" :limit="1" @upload-success="handleUploadSuccess" />
          <div v-if="form.levelImage" class="image-preview">
            <el-image :src="form.levelImage" fit="cover" preview-teleported class="preview-image" />
          </div>
        </el-form-item>
        <el-form-item label="等级权益" prop="benefits">
          <el-input v-model="form.benefits" type="textarea" :rows="5" maxlength="500" show-word-limit placeholder="请输入等级权益说明" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="补充运营说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="dialog.visible = false">取消</el-button>
          <el-button type="primary" :loading="buttonLoading" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { getLevel, listLevel, updateLevel } from '@/api/member/level'
import ImageUpload from '@/components/ImageUpload/index.vue'

const { proxy } = getCurrentInstance() as any

const queryRef = ref()
const formRef = ref()

const loading = ref(false)
const buttonLoading = ref(false)
const total = ref(0)
const levelList = ref<any[]>([])
const dialog = reactive({ visible: false, title: '' })

const createForm = () => ({
  id: undefined,
  levelName: '',
  levelCode: '',
  levelSort: 1,
  requiredGrowth: 0,
  ossId: undefined,
  levelImage: '',
  benefits: '',
  status: '0',
  remark: '',
  builtIn: false
})

const queryParams = ref<any>({
  pageNum: 1,
  pageSize: 10,
  levelName: undefined,
  levelCode: undefined,
  status: undefined
})

const form = ref<any>(createForm())

const rules = {
  levelName: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  levelCode: [{ required: true, message: '请输入等级编码', trigger: 'blur' }],
  levelSort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
  requiredGrowth: [{ required: true, message: '请输入所需成长值', trigger: 'blur' }]
}

async function getList() {
  loading.value = true
  try {
    const res = await listLevel(queryParams.value)
    levelList.value = (res.rows || []).sort((a: any, b: any) => Number(a.levelSort || 0) - Number(b.levelSort || 0))
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    levelName: undefined,
    levelCode: undefined,
    status: undefined
  }
  queryRef.value?.resetFields?.()
  getList()
}

function isV1(row: any) {
  return String(row?.levelCode || '').toUpperCase() === 'V1'
}

function handleUploadSuccess(response: any) {
  if (!response?.ossId) {
    return
  }
  form.value.ossId = response.ossId
  form.value.levelImage = response.url || ''
}

async function handleEdit(row: any) {
  const res = await getLevel(row.id)
  form.value = { ...createForm(), ...res.data }
  dialog.title = `编辑 ${form.value.levelName}`
  dialog.visible = true
}

function submitForm() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    buttonLoading.value = true
    try {
      await updateLevel({
        id: form.value.id,
        levelName: form.value.levelName,
        levelCode: form.value.levelCode,
        levelSort: form.value.levelSort,
        requiredGrowth: form.value.requiredGrowth,
        ossId: form.value.ossId,
        levelImage: form.value.levelImage,
        benefits: form.value.benefits,
        remark: form.value.remark
      })
      proxy.$modal.msgSuccess('等级信息已更新')
      dialog.visible = false
      await getList()
    } finally {
      buttonLoading.value = false
    }
  })
}

async function handleStatusChange(row: any) {
  const nextStatus = row.status
  const previousStatus = nextStatus === '0' ? '1' : '0'
  if (isV1(row) && nextStatus === '1') {
    row.status = '0'
    proxy.$modal.msgWarning('默认等级 V1 不允许停用')
    return
  }
  try {
    await updateLevel({
      id: row.id,
      levelName: row.levelName,
      levelCode: row.levelCode,
      levelSort: row.levelSort,
      requiredGrowth: row.requiredGrowth,
      ossId: row.ossId,
      levelImage: row.levelImage,
      benefits: row.benefits,
      remark: row.remark,
      status: nextStatus
    })
    proxy.$modal.msgSuccess(nextStatus === '0' ? '已启用' : '已停用')
  } catch (error) {
    row.status = previousStatus
    throw error
  } finally {
    await getList()
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.member-level-page {
  padding: 16px;
  min-height: calc(100vh - 84px);
  background: #f6f8fb;
}

.filter-panel,
.list-panel {
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.filter-panel {
  margin-bottom: 14px;
  padding: 16px 18px 2px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-actions {
  margin-left: auto;
}

.field-sm {
  width: 180px;
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
  align-items: center;
  gap: 12px;
}

.title-text {
  color: #0f172a;
  font-size: 16px;
  font-weight: 600;
}

.title-meta {
  color: #94a3b8;
  font-size: 13px;
}

.stack-cell {
  display: grid;
  gap: 4px;
}

.stack-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.main-line {
  color: #0f172a;
  font-weight: 600;
}

.sub-line {
  color: #94a3b8;
  font-size: 12px;
}

.image-box {
  display: flex;
  justify-content: center;
}

.level-image,
.image-placeholder,
.preview-image {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.image-preview {
  margin-top: 12px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .member-level-page {
    padding: 12px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

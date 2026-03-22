<template>
  <div class="mall-page">
    <el-card class="panel" shadow="never">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>品牌管理</h3>
            <p>品牌层补齐后，商品页就可以按原商城方式挂接品牌信息。</p>
          </div>
        </div>
      </template>

      <el-form ref="queryRef" :inline="true" :model="queryParams">
        <el-form-item label="品牌名称">
          <el-input v-model="queryParams.name" clearable placeholder="请输入品牌名称" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" clearable placeholder="请选择状态" style="width: 160px">
            <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="panel" shadow="never">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>品牌列表</h3>
            <p>品牌图直接复用现有图床上传组件，数据结构也保持通用化。</p>
          </div>
          <div class="toolbar">
            <el-button v-hasPermi="['mall:brand:add']" type="primary" icon="Plus" @click="handleAdd">新增品牌</el-button>
            <el-button v-hasPermi="['mall:brand:remove']" :disabled="multiple" icon="Delete" @click="handleDelete()">批量删除</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="brandList" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column label="品牌名称" prop="name" min-width="160" />
        <el-table-column label="品牌图" width="100">
          <template #default="{ row }">
            <ImagePreview v-if="row.picUrl" :src="row.picUrl" :width="48" :height="48" :preview-src-list="[row.picUrl]" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="品牌简介" prop="description" min-width="220" show-overflow-tooltip />
        <el-table-column label="底价" width="120">
          <template #default="{ row }">￥{{ Number(row.floorPrice || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <dict-tag :options="sys_normal_disable" :value="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sortOrder" width="90" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-hasPermi="['mall:brand:edit']" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button v-hasPermi="['mall:brand:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-drawer v-model="open" :title="title" size="680px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="92px">
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="品牌简介">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="品牌图">
          <image-upload v-model="form.picOssId" :limit="1" @upload-success="handleUploadSuccess" />
        </el-form-item>
        <el-form-item label="底价">
          <el-input-number v-model="form.floorPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="open = false">取消</el-button>
          <el-button type="primary" :loading="buttonLoading" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { addMallBrand, delMallBrand, getMallBrand, listMallBrand, updateMallBrand } from '@/api/mall/brand';
import type { MallBrandForm, MallBrandQuery, MallBrandVO } from '@/api/mall/brand/types';
import { ComponentInternalInstance } from 'vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const queryRef = ref();
const formRef = ref();
const loading = ref(false);
const buttonLoading = ref(false);
const open = ref(false);
const title = ref('');
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const brandList = ref<MallBrandVO[]>([]);

const queryParams = ref<MallBrandQuery>({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  status: undefined
});

const initFormData = (): MallBrandForm => ({
  id: undefined,
  name: '',
  description: '',
  picOssId: undefined,
  picUrl: '',
  sortOrder: 0,
  floorPrice: 0,
  status: '0',
  remark: ''
});

const form = ref<MallBrandForm>(initFormData());
const rules = { name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }] };

function reset() {
  form.value = initFormData();
  formRef.value?.resetFields?.();
}

async function getList() {
  loading.value = true;
  try {
    const res = await listMallBrand(queryParams.value);
    brandList.value = res.rows || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: undefined
  };
  queryRef.value?.resetFields?.();
  getList();
}

function handleSelectionChange(selection: MallBrandVO[]) {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
}

function handleUploadSuccess(response: any) {
  if (!response?.ossId) {
    return;
  }
  form.value.picOssId = response.ossId;
  form.value.picUrl = response.url;
}

function handleAdd() {
  reset();
  title.value = '新增品牌';
  open.value = true;
}

async function handleEdit(row: MallBrandVO) {
  reset();
  const res = await getMallBrand(row.id);
  form.value = { ...initFormData(), ...res.data };
  title.value = '编辑品牌';
  open.value = true;
}

function submitForm() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateMallBrand(form.value);
      } else {
        await addMallBrand(form.value);
      }
      proxy?.$modal.msgSuccess('保存成功');
      open.value = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
}

function handleDelete(row?: MallBrandVO) {
  const targetIds = row?.id || ids.value;
  if (!targetIds || (Array.isArray(targetIds) && targetIds.length === 0)) {
    proxy?.$modal.msgWarning('请先选择要删除的数据');
    return;
  }
  proxy?.$modal.confirm('确认删除选中的品牌吗？').then(() => delMallBrand(targetIds)).then(() => {
    proxy?.$modal.msgSuccess('删除成功');
    getList();
  }).catch(() => undefined);
}

onMounted(() => {
  getList();
});
</script>

<style scoped>
.mall-page { min-height: 100%; padding: 16px; background: #f6f8fc; }
.panel { margin-bottom: 16px; border: none; border-radius: 20px; }
.panel-header { display: flex; justify-content: space-between; gap: 16px; }
.panel-header h3, .panel-header p { margin: 0; }
.panel-header p { margin-top: 6px; color: #7f8da1; }
.toolbar, .drawer-footer { display: flex; gap: 10px; }
.drawer-footer { justify-content: flex-end; }
</style>

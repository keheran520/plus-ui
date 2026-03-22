<template>
  <div class="mall-page">
    <el-card class="panel" shadow="never">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>商品管理</h3>
            <p>图片字段和固定选项都按现有系统方式处理，便于后续继续扩展 SKU 和库存。</p>
          </div>
        </div>
      </template>

      <el-form ref="queryRef" :inline="true" :model="queryParams">
        <el-form-item label="商品编号">
          <el-input v-model="queryParams.goodsSn" clearable placeholder="请输入商品编号" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="queryParams.name" clearable placeholder="请输入商品名称" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="queryParams.categoryId" clearable placeholder="请选择商品分类" style="width: 180px">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="queryParams.brandId" clearable placeholder="请选择品牌" style="width: 180px">
            <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="上架状态">
          <el-select v-model="queryParams.isOnSale" clearable placeholder="请选择上架状态" style="width: 160px">
            <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <h3>商品列表</h3>
            <p>先承接原商城商品主表，后续再补规格、库存和更完整的详情能力。</p>
          </div>
          <div class="toolbar">
            <el-button v-hasPermi="['mall:goods:add']" type="primary" icon="Plus" @click="handleAdd">新增商品</el-button>
            <el-button v-hasPermi="['mall:goods:remove']" :disabled="multiple" icon="Delete" @click="handleDelete()">批量删除</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="goodsList" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column label="商品编号" prop="goodsSn" min-width="150" />
        <el-table-column label="商品名称" prop="name" min-width="180" />
        <el-table-column label="分类" min-width="140">
          <template #default="{ row }">{{ getCategoryName(row.categoryId) }}</template>
        </el-table-column>
        <el-table-column label="品牌" min-width="140">
          <template #default="{ row }">{{ getBrandName(row.brandId) }}</template>
        </el-table-column>
        <el-table-column label="主图" width="90">
          <template #default="{ row }">
            <ImagePreview v-if="row.picUrl" :src="row.picUrl" :width="40" :height="40" :preview-src-list="[row.picUrl]" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="零售价" width="120">
          <template #default="{ row }">￥{{ Number(row.retailPrice || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="上架" width="90">
          <template #default="{ row }">
            <dict-tag :options="sys_yes_no" :value="row.isOnSale" />
          </template>
        </el-table-column>
        <el-table-column label="新品" width="90">
          <template #default="{ row }">
            <dict-tag :options="sys_yes_no" :value="row.isNew" />
          </template>
        </el-table-column>
        <el-table-column label="热卖" width="90">
          <template #default="{ row }">
            <dict-tag :options="sys_yes_no" :value="row.isHot" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <dict-tag :options="sys_normal_disable" :value="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="简介" prop="brief" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-hasPermi="['mall:goods:edit']" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button v-hasPermi="['mall:goods:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-drawer v-model="open" :title="title" size="760px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品编号">
          <el-input v-model="form.goodsSn" placeholder="留空则由后端自动生成" />
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="form.categoryId" clearable placeholder="请选择商品分类" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="form.brandId" clearable placeholder="请选择品牌" style="width: 100%">
            <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="form.keywords" placeholder="多个关键字可用逗号分隔" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.brief" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="主图">
          <image-upload v-model="form.picOssId" :limit="1" @upload-success="(res) => handleUploadSuccess('pic', res)" />
        </el-form-item>
        <el-form-item label="分享图">
          <image-upload v-model="form.shareOssId" :limit="1" @upload-success="(res) => handleUploadSuccess('share', res)" />
        </el-form-item>
        <el-form-item label="画廊">
          <image-upload v-model="form.galleryOssIds" :limit="6" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="form.unit" placeholder="例如：件 / 份 / 套" />
        </el-form-item>
        <el-form-item label="专柜价">
          <el-input-number v-model="form.counterPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="零售价" prop="retailPrice">
          <el-input-number v-model="form.retailPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="是否上架">
          <el-radio-group v-model="form.isOnSale">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否新品">
          <el-radio-group v-model="form.isNew">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否热卖">
          <el-radio-group v-model="form.isHot">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="系统状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="商品详情">
          <el-input v-model="form.detail" type="textarea" :rows="6" />
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
import { listMallBrand } from '@/api/mall/brand';
import type { MallBrandQuery, MallBrandVO } from '@/api/mall/brand/types';
import { listMallCategory } from '@/api/mall/category';
import type { MallCategoryQuery, MallCategoryVO } from '@/api/mall/category/types';
import { addMallGoods, delMallGoods, getMallGoods, listMallGoods, updateMallGoods } from '@/api/mall/goods';
import type { MallGoodsForm, MallGoodsQuery, MallGoodsVO } from '@/api/mall/goods/types';
import { ComponentInternalInstance } from 'vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_yes_no, sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_yes_no', 'sys_normal_disable'));

const queryRef = ref();
const formRef = ref();
const loading = ref(false);
const buttonLoading = ref(false);
const open = ref(false);
const title = ref('');
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const goodsList = ref<MallGoodsVO[]>([]);
const categoryOptions = ref<MallCategoryVO[]>([]);
const brandOptions = ref<MallBrandVO[]>([]);

const queryParams = ref<MallGoodsQuery>({
  pageNum: 1,
  pageSize: 10,
  goodsSn: undefined,
  name: undefined,
  categoryId: undefined,
  brandId: undefined,
  isOnSale: undefined,
  status: undefined
});

const initFormData = (): MallGoodsForm => ({
  id: undefined,
  goodsSn: '',
  name: '',
  categoryId: undefined,
  brandId: undefined,
  galleryOssIds: '',
  galleryUrls: '',
  keywords: '',
  brief: '',
  isOnSale: 'Y',
  sortOrder: 0,
  picOssId: undefined,
  picUrl: '',
  shareOssId: undefined,
  shareUrl: '',
  isNew: 'N',
  isHot: 'N',
  unit: '件',
  counterPrice: 0,
  retailPrice: 0,
  detail: '',
  status: '0',
  remark: ''
});

const form = ref<MallGoodsForm>(initFormData());
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  retailPrice: [{ required: true, message: '请输入零售价格', trigger: 'blur' }]
};

async function loadCategoryOptions() {
  const res = await listMallCategory({ pageNum: 1, pageSize: 999, status: '0' } as MallCategoryQuery);
  categoryOptions.value = res.rows || [];
}

async function loadBrandOptions() {
  const res = await listMallBrand({ pageNum: 1, pageSize: 999, status: '0' } as MallBrandQuery);
  brandOptions.value = res.rows || [];
}

function getCategoryName(categoryId?: string | number) {
  return categoryOptions.value.find((item) => String(item.id) === String(categoryId))?.name || '-';
}

function getBrandName(brandId?: string | number) {
  return brandOptions.value.find((item) => String(item.id) === String(brandId))?.name || '-';
}

function reset() {
  form.value = initFormData();
  formRef.value?.resetFields?.();
}

async function getList() {
  loading.value = true;
  try {
    const res = await listMallGoods(queryParams.value);
    goodsList.value = res.rows || [];
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
    goodsSn: undefined,
    name: undefined,
    categoryId: undefined,
    brandId: undefined,
    isOnSale: undefined,
    status: undefined
  };
  queryRef.value?.resetFields?.();
  getList();
}

function handleSelectionChange(selection: MallGoodsVO[]) {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
}

function handleUploadSuccess(type: 'pic' | 'share', response: any) {
  if (!response?.ossId) {
    return;
  }
  if (type === 'pic') {
    form.value.picOssId = response.ossId;
    form.value.picUrl = response.url;
    return;
  }
  form.value.shareOssId = response.ossId;
  form.value.shareUrl = response.url;
}

async function handleAdd() {
  reset();
  await Promise.all([loadCategoryOptions(), loadBrandOptions()]);
  title.value = '新增商品';
  open.value = true;
}

async function handleEdit(row: MallGoodsVO) {
  reset();
  await Promise.all([loadCategoryOptions(), loadBrandOptions()]);
  const res = await getMallGoods(row.id);
  form.value = { ...initFormData(), ...res.data };
  title.value = '编辑商品';
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
        await updateMallGoods(form.value);
      } else {
        await addMallGoods(form.value);
      }
      proxy?.$modal.msgSuccess('保存成功');
      open.value = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
}

function handleDelete(row?: MallGoodsVO) {
  const targetIds = row?.id || ids.value;
  if (!targetIds || (Array.isArray(targetIds) && targetIds.length === 0)) {
    proxy?.$modal.msgWarning('请先选择要删除的数据');
    return;
  }
  proxy?.$modal.confirm('确认删除选中的商品吗？').then(() => delMallGoods(targetIds)).then(() => {
    proxy?.$modal.msgSuccess('删除成功');
    getList();
  }).catch(() => undefined);
}

onMounted(async () => {
  await Promise.all([loadCategoryOptions(), loadBrandOptions()]);
  await getList();
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

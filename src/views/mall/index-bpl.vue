<template>
  <div class="social-manage-page mall-goods-page">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="商品编号">
            <el-input v-model="queryParams.goodsSn" class="field-md" clearable placeholder="请输入商品编号" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="queryParams.name" class="field-lg" clearable placeholder="请输入商品名称" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="商品分类">
            <el-select v-model="queryParams.categoryId" class="field-md" clearable placeholder="请选择商品分类">
              <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="品牌">
            <el-select v-model="queryParams.brandId" class="field-md" clearable placeholder="请选择品牌">
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="上架状态">
            <el-select v-model="queryParams.isOnSale" class="field-sm" clearable placeholder="请选择上架状态">
              <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="系统状态">
            <el-select v-model="queryParams.status" class="field-sm" clearable placeholder="请选择系统状态">
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="filter-actions">
            <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </section>
    </transition>

    <section class="stats-grid">
      <article class="stats-card accent-blue">
        <span class="stats-label">商品总数</span>
        <strong class="stats-value">{{ goodsList.length }}</strong>
        <span class="stats-note">当前页已加载商品</span>
      </article>
      <article class="stats-card accent-green">
        <span class="stats-label">在售商品</span>
        <strong class="stats-value">{{ onSaleCount }}</strong>
        <span class="stats-note">正在对外售卖的商品</span>
      </article>
      <article class="stats-card accent-orange">
        <span class="stats-label">新品推荐</span>
        <strong class="stats-value">{{ newGoodsCount }}</strong>
        <span class="stats-note">标记为新品的商品</span>
      </article>
      <article class="stats-card accent-rose">
        <span class="stats-label">热卖商品</span>
        <strong class="stats-value">{{ hotGoodsCount }}</strong>
        <span class="stats-note">标记为热卖的商品</span>
      </article>
    </section>

    <section class="list-panel">
      <header class="panel-toolbar">
        <div class="toolbar-title">
          <span class="title-text">商品管理</span>
          <span class="title-meta">承接商城商品主表，保留图片、标签、价格、上下架等核心能力</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['mall:goods:add']" type="primary" icon="Plus" @click="handleAdd">新增商品</el-button>
          <el-button v-hasPermi="['mall:goods:remove']" :disabled="multiple" plain type="danger" icon="Delete" @click="handleDelete()">批量删除</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <el-table v-loading="loading" :data="goodsList" class="social-table mall-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="商品信息" min-width="340">
          <template #default="{ row }">
            <div class="goods-cell">
              <div class="goods-thumb">
                <ImagePreview v-if="row.picUrl" :src="row.picUrl" :width="64" :height="64" :preview-src-list="[row.picUrl]" />
                <div v-else class="thumb-fallback">IMG</div>
              </div>
              <div class="goods-main">
                <div class="goods-title-row">
                  <span class="goods-name">{{ row.name || '未命名商品' }}</span>
                  <span class="goods-sn">{{ row.goodsSn || '自动生成编号' }}</span>
                </div>
                <div class="goods-meta-row">
                  <span>分类：{{ getCategoryName(row.categoryId) }}</span>
                  <span>品牌：{{ getBrandName(row.brandId) }}</span>
                  <span>单位：{{ row.unit || '-' }}</span>
                </div>
                <div class="goods-tags">
                  <el-tag size="small" round :type="row.isOnSale === 'Y' ? 'success' : 'info'">{{ row.isOnSale === 'Y' ? '上架中' : '未上架' }}</el-tag>
                  <el-tag v-if="row.isNew === 'Y'" size="small" round effect="dark" class="tag-new">新品</el-tag>
                  <el-tag v-if="row.isHot === 'Y'" size="small" round effect="dark" class="tag-hot">热卖</el-tag>
                  <el-tag size="small" round>{{ getStatusLabel(sys_normal_disable, row.status) }}</el-tag>
                </div>
                <p class="goods-brief">{{ row.brief || '暂无商品简介，建议补充卖点、用途和服务说明。' }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格策略" width="180">
          <template #default="{ row }">
            <div class="price-cell">
              <div class="price-sale">￥{{ formatMoney(row.retailPrice) }}</div>
              <div class="price-origin">划线价 ￥{{ formatMoney(row.counterPrice) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="关键词" min-width="180" prop="keywords" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.keywords || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="90" align="center" prop="sortOrder" />
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-hasPermi="['mall:goods:edit']" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button v-hasPermi="['mall:goods:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="open" :title="title" size="920px" :close-on-click-modal="false" class="mall-drawer">
      <el-scrollbar>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="104px" class="drawer-form">
          <section class="drawer-section">
            <div class="section-heading">
              <span class="section-title">基础信息</span>
              <span class="section-tip">商品名称、分类、品牌和基础描述</span>
            </div>
            <div class="form-grid two-column">
              <el-form-item label="商品编号">
                <el-input v-model="form.goodsSn" placeholder="留空则由后端自动生成" />
              </el-form-item>
              <el-form-item label="商品名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入商品名称" />
              </el-form-item>
              <el-form-item label="商品分类" prop="categoryId">
                <el-select v-model="form.categoryId" clearable placeholder="请选择商品分类">
                  <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="品牌">
                <el-select v-model="form.brandId" clearable placeholder="请选择品牌">
                  <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="关键词">
                <el-input v-model="form.keywords" placeholder="多个关键词可用逗号分隔" />
              </el-form-item>
              <el-form-item label="计量单位">
                <el-input v-model="form.unit" placeholder="例如：件 / 次 / 套" />
              </el-form-item>
              <el-form-item label="商品简介" class="span-2">
                <el-input v-model="form.brief" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入商品卖点或服务说明" />
              </el-form-item>
            </div>
          </section>

          <section class="drawer-section">
            <div class="section-heading">
              <span class="section-title">图片素材</span>
              <span class="section-tip">沿用系统图床上传能力，支持主图、分享图和轮播图</span>
            </div>
            <div class="form-grid two-column">
              <el-form-item label="商品主图">
                <image-upload v-model="form.picOssId" :limit="1" @upload-success="(res) => handleUploadSuccess('pic', res)" />
              </el-form-item>
              <el-form-item label="分享图">
                <image-upload v-model="form.shareOssId" :limit="1" @upload-success="(res) => handleUploadSuccess('share', res)" />
              </el-form-item>
              <el-form-item label="轮播图" class="span-2">
                <image-upload v-model="form.galleryOssIds" :limit="6" />
              </el-form-item>
            </div>
          </section>

          <section class="drawer-section">
            <div class="section-heading">
              <span class="section-title">销售设置</span>
              <span class="section-tip">价格、展示状态和运营标签统一在这里维护</span>
            </div>
            <div class="form-grid two-column">
              <el-form-item label="专柜价">
                <el-input-number v-model="form.counterPrice" :min="0" :precision="2" controls-position="right" class="full-width" />
              </el-form-item>
              <el-form-item label="零售价" prop="retailPrice">
                <el-input-number v-model="form.retailPrice" :min="0" :precision="2" controls-position="right" class="full-width" />
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
              <el-form-item label="排序值">
                <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" class="full-width" />
              </el-form-item>
            </div>
          </section>

          <section class="drawer-section">
            <div class="section-heading">
              <span class="section-title">展示内容</span>
              <span class="section-tip">后续可继续扩展规格、SKU 和富文本详情</span>
            </div>
            <el-form-item label="商品详情">
              <el-input v-model="form.detail" type="textarea" :rows="8" placeholder="请输入商品详情、服务流程或售后说明" />
            </el-form-item>
          </section>
        </el-form>
      </el-scrollbar>
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
import type { FormInstance } from 'element-plus';
import { listMallBrand } from '@/api/mall/brand';
import type { MallBrandQuery, MallBrandVO } from '@/api/mall/brand/types';
import { listMallCategory } from '@/api/mall/category';
import type { MallCategoryQuery, MallCategoryVO } from '@/api/mall/category/types';
import { addMallGoods, delMallGoods, getMallGoods, listMallGoods, updateMallGoods } from '@/api/mall/goods';
import type { MallGoodsForm, MallGoodsQuery, MallGoodsVO } from '@/api/mall/goods/types';
import { ComponentInternalInstance } from 'vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_yes_no, sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_yes_no', 'sys_normal_disable'));

const queryRef = ref<FormInstance>();
const formRef = ref<FormInstance>();
const loading = ref(false);
const buttonLoading = ref(false);
const open = ref(false);
const showSearch = ref(true);
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

const onSaleCount = computed(() => goodsList.value.filter((item) => item.isOnSale === 'Y').length);
const newGoodsCount = computed(() => goodsList.value.filter((item) => item.isNew === 'Y').length);
const hotGoodsCount = computed(() => goodsList.value.filter((item) => item.isHot === 'Y').length);

async function loadCategoryOptions() {
  const res = await listMallCategory({ pageNum: 1, pageSize: 999, status: '0' } as MallCategoryQuery);
  categoryOptions.value = res.rows || [];
}

async function loadBrandOptions() {
  const res = await listMallBrand({ pageNum: 1, pageSize: 999, status: '0' } as MallBrandQuery);
  brandOptions.value = res.rows || [];
}

function formatMoney(value?: number) {
  return Number(value || 0).toFixed(2);
}

function getStatusLabel(dicts: any[], value?: string) {
  return dicts?.find((item) => item.value === value)?.label || '未知状态';
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

<style lang="scss" scoped>
.social-manage-page {
  min-height: calc(100vh - 84px);
  padding: 16px;
  background:
    radial-gradient(circle at top left, rgba(52, 211, 153, 0.08), transparent 22%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 24%),
    #f6f8fb;
}

.filter-panel,
.list-panel {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid #e8edf5;
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(12px);
}

.filter-panel {
  margin-bottom: 14px;
  padding: 16px 18px 2px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.field-sm {
  width: 150px;
}

.field-md {
  width: 190px;
}

.field-lg {
  width: 240px;
}

.filter-actions {
  margin-left: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.stats-card {
  position: relative;
  overflow: hidden;
  padding: 18px 20px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #e8edf5;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.05);
}

.stats-card::after {
  content: '';
  position: absolute;
  inset: auto -24px -24px auto;
  width: 110px;
  height: 110px;
  border-radius: 999px;
  opacity: 0.14;
}

.accent-blue::after {
  background: #3b82f6;
}

.accent-green::after {
  background: #10b981;
}

.accent-orange::after {
  background: #f59e0b;
}

.accent-rose::after {
  background: #f43f5e;
}

.stats-label {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
  color: #64748b;
}

.stats-value {
  display: block;
  font-size: 30px;
  line-height: 1;
  color: #0f172a;
}

.stats-note {
  display: block;
  margin-top: 10px;
  font-size: 12px;
  color: #94a3b8;
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
  flex-direction: column;
  gap: 4px;
}

.title-text {
  font-size: 18px;
  font-weight: 700;
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

.goods-cell {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.thumb-fallback {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.goods-main {
  min-width: 0;
}

.goods-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.goods-name {
  font-size: 15px;
  font-weight: 700;
  color: #182230;
}

.goods-sn {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
}

.goods-meta-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 12px;
}

.goods-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.tag-new {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
}

.tag-hot {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: none;
}

.goods-brief {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.price-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.price-sale {
  font-size: 22px;
  font-weight: 700;
  color: #e11d48;
}

.price-origin {
  color: #94a3b8;
  text-decoration: line-through;
}

.drawer-form {
  padding: 4px 18px 18px;
}

.drawer-section {
  padding: 18px;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.9), rgba(255, 255, 255, 0.95));
}

.drawer-section + .drawer-section {
  margin-top: 16px;
}

.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #182230;
}

.section-tip {
  font-size: 12px;
  color: #7a8699;
}

.form-grid {
  display: grid;
  gap: 4px 16px;
}

.two-column {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.span-2 {
  grid-column: 1 / -1;
}

.full-width {
  width: 100%;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.social-table) {
  --el-table-border-color: #edf1f7;
  --el-table-header-bg-color: #f8fafc;
}

:deep(.social-table .el-table__row td) {
  padding-top: 16px;
  padding-bottom: 16px;
}

@media (max-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .panel-toolbar,
  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid,
  .two-column {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    margin-left: 0;
  }

  .field-sm,
  .field-md,
  .field-lg {
    width: 100%;
  }
}
</style>

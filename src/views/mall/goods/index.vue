<template>
  <div class="goods-page">
    <section v-loading="summaryLoading" class="summary-grid">
      <article class="summary-card summary-card--blue">
        <span class="summary-card__label">商品总数</span>
        <strong class="summary-card__value">{{ formatCount(summary.total) }}</strong>
        <span class="summary-card__hint">当前列表范围内的商品数量</span>
      </article>
      <article class="summary-card summary-card--green">
        <span class="summary-card__label">上架商品</span>
        <strong class="summary-card__value">{{ formatCount(summary.saleOn) }}</strong>
        <span class="summary-card__hint">正在对外展示的商品</span>
      </article>
      <article class="summary-card summary-card--amber">
        <span class="summary-card__label">推荐商品</span>
        <strong class="summary-card__value">{{ formatCount(summary.recommend) }}</strong>
        <span class="summary-card__hint">已标记为推荐的商品</span>
      </article>
      <article class="summary-card summary-card--violet">
        <span class="summary-card__label">平均售价</span>
        <strong class="summary-card__value">{{ formatCurrency(summary.avgPrice) }}</strong>
        <span class="summary-card__hint">按当前筛选结果计算</span>
      </article>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="panel search-panel">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="search-form">
          <el-form-item label="商品编号" prop="goodsSn">
            <el-input v-model="queryParams.goodsSn" class="field-sm" clearable placeholder="请输入商品编号" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="queryParams.name" class="field-md" clearable placeholder="请输入商品名称" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="分类" prop="categoryId">
            <el-select v-model="queryParams.categoryId" class="field-sm" clearable filterable placeholder="全部分类">
              <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="品牌" prop="brandId">
            <el-select v-model="queryParams.brandId" class="field-sm" clearable filterable placeholder="全部品牌">
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="上架状态" prop="saleStatus">
            <el-select v-model="queryParams.saleStatus" class="field-sm" clearable placeholder="全部状态">
              <el-option v-for="dict in mall_goods_sale_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态" prop="auditStatus">
            <el-select v-model="queryParams.auditStatus" class="field-sm" clearable placeholder="全部审核状态">
              <el-option v-for="dict in mall_goods_audit_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="服务类型" prop="serviceType">
            <el-select v-model="queryParams.serviceType" class="field-sm" clearable placeholder="全部服务类型">
              <el-option v-for="dict in mall_goods_service_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="search-actions">
            <el-button icon="Search" type="primary" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </section>
    </transition>

    <section class="panel list-panel">
      <header class="panel-header">
        <div>
          <div class="panel-title">商品列表</div>
          <div class="panel-subtitle">共 {{ total }} 条记录</div>
        </div>
        <div class="panel-actions">
          <el-button v-hasPermi="['mall:goods:create']" icon="Plus" type="primary" @click="handleAdd">新增商品</el-button>
          <el-button v-hasPermi="['mall:goods:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()"
            >批量删除</el-button
          >
          <el-button v-hasPermi="['mall:goods:export']" icon="Download" plain @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <div class="view-tabs">
        <button
          v-for="item in quickTabs"
          :key="item.value"
          :class="{ 'view-tab--active': activeQuickTab === item.value }"
          class="view-tab"
          type="button"
          @click="handleQuickTabChange(item.value)"
        >
          <span class="view-tab__label">{{ item.label }}</span>
          <span class="view-tab__count">{{ item.count }}</span>
        </button>
      </div>

      <div class="view-tabs view-tabs--secondary">
        <button
          v-for="item in metricTabs"
          :key="item.value"
          :class="{ 'view-tab--active': activeMetricTab === item.value }"
          class="view-tab view-tab--metric"
          type="button"
          @click="handleMetricTabChange(item.value)"
        >
          <span class="view-tab__label">{{ item.label }}</span>
          <span class="view-tab__count">{{ item.count }}</span>
        </button>
      </div>

      <el-table v-loading="loading" :data="displayGoodsList" class="goods-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed="left" type="selection" width="50" />
        <el-table-column fixed="left" label="商品信息" min-width="340">
          <template #default="{ row }">
            <div class="goods-main">
              <el-image :src="getFirstImage(row.galleryUrls)" class="goods-main__cover" fit="cover">
                <template #error>
                  <div class="goods-main__empty">暂无图片</div>
                </template>
              </el-image>
              <div class="goods-main__content">
                <div class="goods-main__title-row">
                  <span class="goods-main__title">{{ row.name || '未命名商品' }}</span>
                  <dict-tag
                    v-if="row.recommendFlag === '1'"
                    :options="mall_goods_recommend_flag"
                    :round="true"
                    :value="row.recommendFlag"
                    theme="light"
                  />
                </div>
                <div class="goods-main__sub">{{ row.subTitle || '未设置副标题' }}</div>
                <div class="goods-main__meta">编号：{{ row.goodsSn || '-' }}</div>
                <div class="goods-main__tags">
                  <el-tag effect="plain" size="small">{{ getCategoryName(row.categoryId) }}</el-tag>
                  <el-tag effect="plain" size="small" type="success">{{ getBrandName(row.brandId) }}</el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="right" label="价格" width="160">
          <template #default="{ row }">
            <div class="price-block">
              <span class="price-block__sale">{{ formatCurrency(row.price) }}</span>
              <span class="price-block__origin">原价 {{ formatCurrency(row.originalPrice) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="单位 / 类型" width="160">
          <template #default="{ row }">
            <div class="stack-text">
              <span>{{ row.unitName || '-' }}</span>
              <dict-tag :options="mall_goods_service_type" :round="true" :value="row.serviceType" theme="plain" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="服务标签" min-width="180">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag v-for="item in splitCommaText(row.serviceTags)" :key="item" effect="plain" size="small">{{ item }}</el-tag>
              <span v-if="!splitCommaText(row.serviceTags).length" class="muted-text">暂无</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="服务区服" min-width="200">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag v-for="item in splitCommaText(row.serviceRegions)" :key="item" effect="plain" size="small" type="warning">{{ item }}</el-tag>
              <span v-if="!splitCommaText(row.serviceRegions).length" class="muted-text">暂无</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" width="170">
          <template #default="{ row }">
            <div class="tag-list">
              <dict-tag :options="mall_goods_sale_status" :round="true" :value="row.saleStatus" theme="light" />
              <dict-tag :options="mall_goods_audit_status" :round="true" :value="row.auditStatus" theme="plain" />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="数据表现" width="200">
          <template #default="{ row }">
            <div class="metric-list">
              <span class="metric-chip">浏览 {{ formatCount(row.viewCount) }}</span>
              <span class="metric-chip">收藏 {{ formatCount(row.favoriteCount) }}</span>
              <span class="metric-chip">订单 {{ formatCount(row.orderCount) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="评分" width="90">
          <template #default="{ row }">
            <span class="metric-chip metric-chip--green">{{ formatScore(row.score) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" prop="sortOrder" width="90" />
        <el-table-column label="商品简介" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.brief || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" min-width="300">
          <template #default="{ row }">
            <div class="action-list">
              <el-button v-hasPermi="['mall:goods:update']" link type="primary" @click="handleUpdate(row)">编辑</el-button>
              <el-button v-hasPermi="['mall:goods:copy']" link type="primary" @click="handleCopy(row)">复制</el-button>
              <el-button v-hasPermi="['mall:order:create']" link type="primary" @click="handlePlaceOrder(row)">下单</el-button>
              <el-button
                v-hasPermi="['mall:goods:sale']"
                :type="row.saleStatus === 'Y' ? 'warning' : 'success'"
                link
                @click="handleToggleSaleStatus(row)"
              >
                {{ row.saleStatus === 'Y' ? '下架' : '上架' }}
              </el-button>
              <el-button v-if="row.auditStatus !== '1'" v-hasPermi="['mall:goods:audit']" link type="success" @click="handleAudit(row, '1')"
                >审核通过</el-button
              >
              <el-button v-if="row.auditStatus !== '2'" v-hasPermi="['mall:goods:audit']" link type="warning" @click="handleAudit(row, '2')"
                >审核驳回</el-button
              >
              <el-button
                v-hasPermi="['mall:goods:recommend']"
                :type="row.recommendFlag === '1' ? 'warning' : 'success'"
                link
                @click="handleToggleRecommend(row)"
              >
                {{ row.recommendFlag === '1' ? '取消推荐' : '推荐' }}
              </el-button>
              <el-button v-hasPermi="['mall:goods:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="drawer.visible" :close-on-click-modal="false" :title="drawer.title" size="920px">
      <el-form ref="goodsFormRef" :model="form" :rules="rules" class="goods-form" label-position="top">
        <div class="form-grid">
          <el-form-item label="商品编号" prop="goodsSn">
            <div class="sn-input">
              <el-input v-model="form.goodsSn" placeholder="新增时自动生成商品编号" readonly />
              <el-button v-if="!form.id" v-hasPermi="['mall:goods:generateSn']" :loading="generating" icon="Refresh" @click="handleGenerateGoodsSn"
                >重新生成</el-button
              >
            </div>
          </el-form-item>
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="form.name" maxlength="100" placeholder="请输入商品名称" />
          </el-form-item>
          <el-form-item label="副标题" prop="subTitle">
            <el-input v-model="form.subTitle" maxlength="120" placeholder="请输入副标题或卖点" />
          </el-form-item>
          <el-form-item label="关键字" prop="keywords">
            <el-input v-model="form.keywords" maxlength="120" placeholder="多个关键字请用英文逗号分隔" />
          </el-form-item>
          <el-form-item label="商品分类" prop="categoryId">
            <el-select v-model="form.categoryId" filterable placeholder="请选择商品分类" style="width: 100%">
              <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="商品品牌" prop="brandId">
            <el-select v-model="form.brandId" clearable filterable placeholder="请选择商品品牌" style="width: 100%">
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="售价" prop="price">
            <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="原价" prop="originalPrice">
            <el-input-number v-model="form.originalPrice" :min="0" :precision="2" :step="1" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="单位" prop="unitName">
            <el-input v-model="form.unitName" maxlength="20" placeholder="例如：次 / 局 / 小时" />
          </el-form-item>
          <el-form-item label="服务类型" prop="serviceType">
            <el-select v-model="form.serviceType" placeholder="请选择服务类型" style="width: 100%">
              <el-option v-for="dict in mall_goods_service_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="0" :precision="0" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="评分" prop="score">
            <el-input-number v-model="form.score" :max="5" :min="0" :precision="1" :step="0.1" controls-position="right" style="width: 100%" />
          </el-form-item>
        </div>
        <el-form-item label="轮播图" prop="galleryOssIds">
          <image-upload v-model="form.galleryOssIds" :limit="6" />
          <div class="field-tip">请上传轮播图，第一张图片将作为主图展示。</div>
        </el-form-item>

        <div class="form-grid">
          <el-form-item label="服务标签" prop="serviceTags">
            <el-select
              v-model="selectedServiceTags"
              collapse-tags
              collapse-tags-tooltip
              filterable
              multiple
              placeholder="请选择服务标签"
              style="width: 100%"
              @change="syncServiceTags"
            >
              <el-option v-for="item in serviceTagOptions" :key="item.id" :label="item.tagName" :value="item.tagName" />
            </el-select>
          </el-form-item>
          <el-form-item label="服务区服" prop="serviceRegions">
            <el-select
              v-model="selectedServiceRegions"
              collapse-tags
              collapse-tags-tooltip
              filterable
              multiple
              placeholder="请选择服务区服"
              style="width: 100%"
              @change="syncServiceRegions"
            >
              <el-option v-for="item in serviceRegionOptions" :key="item.id" :label="item.tagName" :value="item.tagName" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="商品简介" prop="brief">
          <el-input v-model="form.brief" :rows="4" maxlength="300" placeholder="请输入商品简介" show-word-limit type="textarea" />
        </el-form-item>

        <el-form-item label="商品详情" prop="detail">
          <wang-editor v-model="form.messageContent" :height="600" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" :rows="4" maxlength="300" placeholder="请输入维护备注" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">保存商品</el-button>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="orderDialog.visible" append-to-body title="创建订单" width="640px">
      <el-form ref="orderFormRef" :model="orderForm" :rules="orderRules" class="goods-form" label-position="top">
        <div class="form-grid">
          <el-form-item label="商品名称">
            <el-input :model-value="orderForm.goodsName" readonly />
          </el-form-item>
          <el-form-item label="商品编号">
            <el-input :model-value="orderDialog.goodsSn" readonly />
          </el-form-item>
          <el-form-item label="买家ID" prop="buyerUserId">
            <el-input v-model="orderForm.buyerUserId" placeholder="请输入买家ID" />
          </el-form-item>
          <el-form-item label="实付金额" prop="payAmount">
            <el-input-number v-model="orderForm.payAmount" :min="0" :precision="2" :step="1" controls-position="right" style="width: 100%" />
          </el-form-item>
        </div>
        <el-form-item label="服务标签">
          <el-input :model-value="orderForm.serviceTags" :rows="2" readonly type="textarea" />
        </el-form-item>
        <el-form-item label="服务区服">
          <el-input :model-value="orderForm.serviceRegions" :rows="2" readonly type="textarea" />
        </el-form-item>
        <el-form-item label="买家备注" prop="buyerRemark">
          <el-input v-model="orderForm.buyerRemark" :rows="3" maxlength="200" placeholder="请输入买家备注" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="closeOrderDialog">取消</el-button>
          <el-button :loading="orderSubmitting" type="primary" @click="submitOrder">确认下单</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" name="Goods" setup>
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import { listByIds } from '@/api/system/oss';
import {
  addGoods,
  copyGoods,
  delGoods,
  generateGoodsSn,
  getGoods,
  listGoods,
  updateGoods,
  updateGoodsAuditStatus,
  updateGoodsRecommendFlag,
  updateGoodsSaleStatus
} from '@/api/mall/goods';
import { addOrder } from '@/api/mall/order';
import { listCategory } from '@/api/mall/category';
import { listBrand } from '@/api/mall/brand';
import { listTag } from '@/api/mall/tag';
import type { GoodsForm, GoodsQuery, GoodsVO } from '@/api/mall/goods/types';
import type { OrderForm } from '@/api/mall/order/types';
import type { CategoryVO } from '@/api/mall/category/types';
import type { BrandVO } from '@/api/mall/brand/types';
import type { TagVO } from '@/api/mall/tag/types';
import ImageUpload from '@/components/ImageUpload/index.vue';
import { FormRules } from 'element-plus';

interface GoodsEditorForm extends GoodsForm {
  messageContent?: string;
}

interface SummaryState {
  total: number;
  saleOn: number;
  recommend: number;
  avgPrice: number;
  auditPending: number;
  auditRejected: number;
  views: number;
  favorites: number;
  orders: number;
}

type QuickTabValue = 'all' | 'saleOn' | 'pending' | 'recommended';
type MetricTabValue = 'all' | 'pending' | 'rejected' | 'views' | 'favorites' | 'orders';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { mall_goods_sale_status, mall_goods_audit_status, mall_goods_service_type, mall_goods_recommend_flag } = toRefs<any>(
  proxy?.useDict('mall_goods_sale_status', 'mall_goods_audit_status', 'mall_goods_service_type', 'mall_goods_recommend_flag')
);

const goodsList = ref<GoodsVO[]>([]);
const categoryOptions = ref<CategoryVO[]>([]);
const brandOptions = ref<BrandVO[]>([]);
const serviceTagOptions = ref<TagVO[]>([]);
const serviceRegionOptions = ref<TagVO[]>([]);
const loading = ref(false);
const summaryLoading = ref(false);
const buttonLoading = ref(false);
const generating = ref(false);
const showSearch = ref(true);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const selectedServiceTags = ref<string[]>([]);
const selectedServiceRegions = ref<string[]>([]);
const activeQuickTab = ref<QuickTabValue>('all');
const activeMetricTab = ref<MetricTabValue>('all');
const orderSubmitting = ref(false);

const queryFormRef = ref<ElFormInstance>();
const goodsFormRef = ref<ElFormInstance>();
const orderFormRef = ref<ElFormInstance>();

const drawer = reactive({
  visible: false,
  title: ''
});

const orderDialog = reactive({
  visible: false,
  goodsSn: ''
});

const createDefaultOrderForm = (): OrderForm => ({
  id: undefined,
  orderSn: '',
  buyerUserId: undefined,
  goodsId: undefined,
  goodsName: '',
  goodsGalleryUrls: '',
  price: 0,
  payAmount: 0,
  payType: 'balance',
  serviceRegions: '',
  serviceTags: '',
  buyerRemark: '',
  sellerRemark: '',
  adminRemark: '',
  orderStatus: '101',
  refundAmount: 0,
  refundRemark: '',
  payTime: undefined,
  finishTime: undefined,
  cancelTime: undefined,
  refundTime: undefined,
  status: '0',
  remark: '',
  actionPayType: 'balance'
});
const initFormData = (): GoodsEditorForm => ({
  id: undefined,
  goodsSn: undefined,
  name: undefined,
  subTitle: undefined,
  categoryId: undefined,
  brandId: undefined,
  galleryOssIds: undefined,
  galleryUrls: undefined,
  keywords: undefined,
  brief: undefined,
  detail: undefined,
  messageContent: '',
  price: 0,
  originalPrice: 0,
  unitName: '次',
  serviceTags: '',
  serviceRegions: '',
  saleStatus: 'Y',
  auditStatus: '0',
  recommendFlag: '0',
  viewCount: 0,
  favoriteCount: 0,
  orderCount: 0,
  score: 5.0,
  serviceType: 'standard',
  sortOrder: 0,
  status: '0',
  remark: undefined
});

const validateSelectField = (_rule: any, value: string, callback: (error?: Error) => void) => {
  if (!value || !value.trim()) {
    callback(new Error('该项不能为空'));
    return;
  }
  callback();
};

const data = reactive<{
  form: GoodsEditorForm;
  queryParams: GoodsQuery;
  rules: FormRules<GoodsEditorForm>;
  orderForm: OrderForm;
  orderRules: FormRules<OrderForm>;
}>({
  form: initFormData(),
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    goodsSn: undefined,
    name: undefined,
    categoryId: undefined,
    brandId: undefined,
    saleStatus: undefined,
    auditStatus: undefined,
    recommendFlag: undefined,
    serviceType: undefined,
    params: {}
  },
  rules: {
    goodsSn: [{ required: true, message: '请先生成商品编号', trigger: 'blur' }],
    name: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
    categoryId: [{ required: true, message: '商品分类不能为空', trigger: 'change' }],
    price: [{ required: true, message: '售价不能为空', trigger: 'blur' }],
    originalPrice: [{ required: true, message: '原价不能为空', trigger: 'blur' }],
    unitName: [{ required: true, message: '单位不能为空', trigger: 'blur' }],
    serviceType: [{ required: true, message: '服务类型不能为空', trigger: 'change' }],
    sortOrder: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
    score: [{ required: true, message: '评分不能为空', trigger: 'blur' }],
    galleryOssIds: [{ required: true, message: '请上传轮播图', trigger: 'change' }],
    serviceTags: [{ validator: validateSelectField, trigger: 'change' }],
    serviceRegions: [{ validator: validateSelectField, trigger: 'change' }],
    brief: [{ required: true, message: '商品简介不能为空', trigger: 'blur' }]
  },
  orderForm: createDefaultOrderForm(),
  orderRules: {
    buyerUserId: [{ required: true, message: '请输入买家ID', trigger: 'blur' }],
    payAmount: [{ required: true, message: '请输入实付金额', trigger: 'blur' }]
  }
});

const summary = ref<SummaryState>({
  total: 0,
  saleOn: 0,
  recommend: 0,
  avgPrice: 0,
  auditPending: 0,
  auditRejected: 0,
  views: 0,
  favorites: 0,
  orders: 0
});

const { queryParams, form, rules, orderForm, orderRules } = toRefs(data);

const categoryMap = computed(() => new Map(categoryOptions.value.map((item) => [String(item.id), item.name])));
const brandMap = computed(() => new Map(brandOptions.value.map((item) => [String(item.id), item.name])));
const quickTabs = computed(() => [
  { label: '全部商品', value: 'all' as QuickTabValue, count: formatCount(summary.value.total) },
  { label: '上架商品', value: 'saleOn' as QuickTabValue, count: formatCount(summary.value.saleOn) },
  { label: '待审核', value: 'pending' as QuickTabValue, count: formatCount(summary.value.auditPending) },
  { label: '推荐商品', value: 'recommended' as QuickTabValue, count: formatCount(summary.value.recommend) }
]);
const metricTabs = computed(() => [
  { label: '全部数据', value: 'all' as MetricTabValue, count: formatCount(summary.value.total) },
  { label: '待审核', value: 'pending' as MetricTabValue, count: formatCount(summary.value.auditPending) },
  { label: '审核驳回', value: 'rejected' as MetricTabValue, count: formatCount(summary.value.auditRejected) },
  { label: '总浏览', value: 'views' as MetricTabValue, count: formatCount(summary.value.views) },
  { label: '总收藏', value: 'favorites' as MetricTabValue, count: formatCount(summary.value.favorites) },
  { label: '总订单', value: 'orders' as MetricTabValue, count: formatCount(summary.value.orders) }
]);
const displayGoodsList = computed(() => {
  const list = [...goodsList.value];
  if (activeMetricTab.value === 'pending') {
    return list.filter((item) => item.auditStatus === '0');
  }
  if (activeMetricTab.value === 'rejected') {
    return list.filter((item) => item.auditStatus === '2');
  }
  if (activeMetricTab.value === 'views') {
    return list.sort((a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0));
  }
  if (activeMetricTab.value === 'favorites') {
    return list.sort((a, b) => Number(b.favoriteCount || 0) - Number(a.favoriteCount || 0));
  }
  if (activeMetricTab.value === 'orders') {
    return list.sort((a, b) => Number(b.orderCount || 0) - Number(a.orderCount || 0));
  }
  return list;
});

const splitCommaText = (value?: string) => {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const getFirstImage = (value?: string) => splitCommaText(value)[0] || '';
const getCategoryName = (id?: string | number) => categoryMap.value.get(String(id ?? '')) || `分类#${id ?? '-'}`;

const getBrandName = (id?: string | number) => {
  if (id === undefined || id === null || id === '') {
    return '未设置品牌';
  }
  return brandMap.value.get(String(id)) || `品牌#${id}`;
};

const getDictLabel = (options: DictDataOption[], value?: string | number, defaultLabel = '-') => {
  const match = options?.find((item) => String(item.value) === String(value ?? ''));
  return match?.label || defaultLabel;
};

const getSaleStatusLabel = (value?: string) => getDictLabel(mall_goods_sale_status.value || [], value, '未设置');
const getAuditStatusLabel = (value?: string) => getDictLabel(mall_goods_audit_status.value || [], value, '未设置');
const getServiceTypeLabel = (value?: string) => getDictLabel(mall_goods_service_type.value || [], value, '-');
const formatCount = (value?: number | string) => Number(value || 0).toLocaleString('zh-CN');
const formatCurrency = (value?: number | string) => `¥${Number(value || 0).toFixed(2)}`;
const formatScore = (value?: number | string) => Number(value || 0).toFixed(1);

const syncServiceTags = () => {
  form.value.serviceTags = selectedServiceTags.value.join(',');
};

const syncServiceRegions = () => {
  form.value.serviceRegions = selectedServiceRegions.value.join(',');
};

const buildSummary = () => {
  const currentList = goodsList.value;
  const currentCount = currentList.length;
  const priceTotal = currentList.reduce((sum, item) => sum + Number(item.price || 0), 0);
  summary.value = {
    total: total.value,
    saleOn: currentList.filter((item) => item.saleStatus === 'Y').length,
    recommend: currentList.filter((item) => item.recommendFlag === '1').length,
    avgPrice: currentCount ? priceTotal / currentCount : 0,
    auditPending: currentList.filter((item) => item.auditStatus === '0').length,
    auditRejected: currentList.filter((item) => item.auditStatus === '2').length,
    views: currentList.reduce((sum, item) => sum + Number(item.viewCount || 0), 0),
    favorites: currentList.reduce((sum, item) => sum + Number(item.favoriteCount || 0), 0),
    orders: currentList.reduce((sum, item) => sum + Number(item.orderCount || 0), 0)
  };
};

const loadOptions = async () => {
  const [categoryRes, brandRes, serviceTagRes, serviceRegionRes] = await Promise.all([
    listCategory({ status: '0' }),
    listBrand({ pageNum: 1, pageSize: 1000, status: '0' }),
    listTag({ pageNum: 1, pageSize: 1000, tagType: 'service_tag', status: '0' }),
    listTag({ pageNum: 1, pageSize: 1000, tagType: 'service_region', status: '0' })
  ]);
  categoryOptions.value = categoryRes.data || categoryRes.rows || [];
  brandOptions.value = brandRes.rows || brandRes.data || [];
  serviceTagOptions.value = serviceTagRes.rows || serviceTagRes.data || [];
  serviceRegionOptions.value = serviceRegionRes.rows || serviceRegionRes.data || [];
};

const getList = async () => {
  loading.value = true;
  summaryLoading.value = true;
  try {
    const res = await listGoods(queryParams.value);
    goodsList.value = res.rows || [];
    total.value = res.total || 0;
    buildSummary();
  } finally {
    loading.value = false;
    summaryLoading.value = false;
  }
};
const handleGenerateGoodsSn = async () => {
  generating.value = true;
  try {
    const res = await generateGoodsSn();
    form.value.goodsSn = res.data;
  } finally {
    generating.value = false;
  }
};

const reset = () => {
  Object.assign(form.value, initFormData());
  selectedServiceTags.value = [];
  selectedServiceRegions.value = [];
  goodsFormRef.value?.clearValidate();
};

const cancel = () => {
  drawer.visible = false;
  reset();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  activeQuickTab.value = 'all';
  activeMetricTab.value = 'all';
  queryParams.value.recommendFlag = undefined;
  handleQuery();
};

const applyQuickTabQuery = (tab: QuickTabValue) => {
  queryParams.value.saleStatus = undefined;
  queryParams.value.auditStatus = undefined;
  queryParams.value.recommendFlag = undefined;
  if (tab === 'saleOn') {
    queryParams.value.saleStatus = 'Y';
  }
  if (tab === 'pending') {
    queryParams.value.auditStatus = '0';
  }
  if (tab === 'recommended') {
    queryParams.value.recommendFlag = '1';
  }
};

const handleQuickTabChange = (tab: QuickTabValue) => {
  activeQuickTab.value = tab;
  applyQuickTabQuery(tab);
  handleQuery();
};

const handleMetricTabChange = (tab: MetricTabValue) => {
  activeMetricTab.value = tab;
};

const handleSelectionChange = (selection: GoodsVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = selection.length === 0;
};

const handleAdd = async () => {
  reset();
  await handleGenerateGoodsSn();
  drawer.visible = true;
  drawer.title = '新增商品';
};

const handleUpdate = async (row?: GoodsVO) => {
  reset();
  const currentId = row?.id || ids.value[0];
  if (!currentId) {
    return;
  }
  const res = await getGoods(currentId);
  Object.assign(form.value, res.data, {
    messageContent: res.data.detail || ''
  });
  selectedServiceTags.value = splitCommaText(res.data.serviceTags);
  selectedServiceRegions.value = splitCommaText(res.data.serviceRegions);
  syncServiceTags();
  syncServiceRegions();
  drawer.visible = true;
  drawer.title = '编辑商品';
};

const buildGalleryUrls = async () => {
  const ossIds = String(form.value.galleryOssIds || '').trim();
  if (!ossIds) {
    form.value.galleryUrls = '';
    return;
  }
  const res = await listByIds(ossIds);
  const urls = (res.data || []).map((item) => item.url).filter(Boolean);
  form.value.galleryUrls = urls.join(',');
};

const submitForm = () => {
  syncServiceTags();
  syncServiceRegions();
  goodsFormRef.value?.validate(async (valid) => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      await buildGalleryUrls();
      form.value.detail = form.value.messageContent || '';
      if (form.value.id) {
        await updateGoods(form.value);
      } else {
        await addGoods(form.value);
      }
      proxy?.$modal.msgSuccess('保存成功');
      drawer.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const handleDelete = async (row?: GoodsVO) => {
  const currentIds = row?.id || ids.value;
  if (!currentIds || (Array.isArray(currentIds) && !currentIds.length)) {
    return;
  }
  await proxy?.$modal.confirm(`是否确认删除商品数据：${Array.isArray(currentIds) ? currentIds.join(',') : currentIds}？`);
  await delGoods(currentIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

const handleCopy = async (row: GoodsVO) => {
  await proxy?.$modal.confirm(`是否确认复制商品“${row.name}”？`);
  await copyGoods(row.id);
  proxy?.$modal.msgSuccess('复制成功');
  await getList();
};

const buildOrderSn = () => {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `MO${stamp}${random}`;
};

const closeOrderDialog = () => {
  orderDialog.visible = false;
  orderDialog.goodsSn = '';
  Object.assign(orderForm.value, createDefaultOrderForm());
  orderFormRef.value?.clearValidate();
};

const handlePlaceOrder = (row: GoodsVO) => {
  Object.assign(orderForm.value, createDefaultOrderForm(), {
    orderSn: buildOrderSn(),
    goodsId: row.id,
    goodsName: row.name,
    goodsGalleryUrls: row.galleryUrls,
    price: row.price || 0,
    payAmount: row.price || 0,
    serviceRegions: row.serviceRegions || '',
    serviceTags: row.serviceTags || ''
  });
  orderDialog.goodsSn = row.goodsSn || '';
  orderDialog.visible = true;
};

const submitOrder = () => {
  orderFormRef.value?.validate(async (valid) => {
    if (!valid) {
      return;
    }
    orderSubmitting.value = true;
    try {
      await addOrder(orderForm.value);
      proxy?.$modal.msgSuccess('下单成功');
      closeOrderDialog();
      await getList();
    } finally {
      orderSubmitting.value = false;
    }
  });
};

const handleToggleSaleStatus = async (row: GoodsVO) => {
  const nextStatus = row.saleStatus === 'Y' ? 'N' : 'Y';
  const actionText = nextStatus === 'Y' ? '上架' : '下架';
  await proxy?.$modal.confirm(`是否确认${actionText}商品“${row.name}”？`);
  await updateGoodsSaleStatus(row.id, nextStatus);
  proxy?.$modal.msgSuccess(`${actionText}成功`);
  await getList();
};

const handleAudit = async (row: GoodsVO, auditStatus: '1' | '2') => {
  const actionText = auditStatus === '1' ? '审核通过' : '审核驳回';
  await proxy?.$modal.confirm(`是否确认${actionText}商品“${row.name}”？`);
  await updateGoodsAuditStatus(row.id, auditStatus);
  proxy?.$modal.msgSuccess(`${actionText}成功`);
  await getList();
};

const handleToggleRecommend = async (row: GoodsVO) => {
  const nextFlag = row.recommendFlag === '1' ? '0' : '1';
  const actionText = nextFlag === '1' ? '推荐' : '取消推荐';
  await proxy?.$modal.confirm(`是否确认${actionText}商品“${row.name}”？`);
  await updateGoodsRecommendFlag(row.id, nextFlag);
  proxy?.$modal.msgSuccess(`${actionText}成功`);
  await getList();
};

const handleExport = () => {
  proxy?.download(
    'mall/goods/export',
    {
      ...queryParams.value
    },
    `goods_${new Date().getTime()}.xlsx`
  );
};

onMounted(async () => {
  await loadOptions();
  await getList();
});
</script>

<style lang="scss" scoped>
.goods-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  min-height: calc(100vh - 84px);
  background: #f5f7fb;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-card,
.panel {
  background: #fff;
  border: 1px solid #e7ecf3;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.summary-card {
  min-height: 116px;
  padding: 16px 18px;
}

.summary-card--blue {
  background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%);
}

.summary-card--green {
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
}

.summary-card--amber {
  background: linear-gradient(180deg, #ffffff 0%, #fff7ed 100%);
}

.summary-card--violet {
  background: linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%);
}

.summary-card__label {
  color: #64748b;
  font-size: 13px;
}

.summary-card__value {
  display: block;
  margin-top: 10px;
  color: #0f172a;
  font-size: 28px;
  line-height: 1.1;
  font-weight: 700;
}

.summary-card__hint {
  display: block;
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}

.search-panel {
  padding: 16px 18px 2px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.field-sm {
  width: 180px;
}

.field-md {
  width: 220px;
}

.search-actions {
  margin-left: auto;
}

.list-panel {
  padding: 14px 16px 4px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.panel-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.view-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.view-tabs--secondary {
  margin-top: -2px;
}

.view-tab {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.view-tab:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.view-tab--active {
  border-color: #bfdbfe;
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.08);
}

.view-tab--metric.view-tab--active {
  border-color: #c7d2fe;
  background: linear-gradient(180deg, #f8fafc 0%, #e0e7ff 100%);
  color: #4338ca;
}

.view-tab__label {
  font-size: 13px;
  font-weight: 600;
}

.view-tab__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-weight: 600;
}

.goods-table :deep(.el-table__cell) {
  padding: 14px 0;
}

.goods-main {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.goods-main__cover {
  width: 76px;
  height: 76px;
  border-radius: 6px;
  flex-shrink: 0;
  overflow: hidden;
  background: #eef2f7;
}

.goods-main__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #94a3b8;
  font-size: 12px;
}

.goods-main__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.goods-main__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.goods-main__title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.goods-main__sub,
.goods-main__meta,
.muted-text,
.field-tip {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

.goods-main__tags,
.tag-list,
.metric-list,
.action-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.goods-main__tags :deep(.el-tag),
.tag-list :deep(.el-tag) {
  margin: 0;
  border-radius: 999px;
  border-width: 1px;
  font-weight: 500;
}

.goods-main__tags :deep(.el-tag.el-tag--primary.is-plain),
.tag-list :deep(.el-tag.el-tag--primary.is-plain) {
  color: #2563eb;
  border-color: #bfdbfe;
  background: #eff6ff;
}

.goods-main__tags :deep(.el-tag.el-tag--success.is-plain),
.tag-list :deep(.el-tag.el-tag--success.is-plain),
.tag-list :deep(.el-tag.el-tag--success.el-tag--light) {
  color: #15803d;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.tag-list :deep(.el-tag.el-tag--warning.is-plain),
.tag-list :deep(.el-tag.el-tag--warning.el-tag--light) {
  color: #b45309;
  border-color: #fde68a;
  background: #fffbeb;
}

.tag-list :deep(.el-tag.el-tag--danger.el-tag--light) {
  color: #dc2626;
  border-color: #fecaca;
  background: #fef2f2;
}

.price-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.price-block__sale {
  color: #dc2626;
  font-weight: 600;
}

.price-block__origin {
  color: #94a3b8;
  font-size: 12px;
}

.stack-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
}

.metric-chip--green {
  background: #dcfce7;
  color: #15803d;
}

.action-list {
  justify-content: center;
}

.goods-form {
  padding-right: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.sn-input {
  display: flex;
  gap: 12px;
}

.sn-input :deep(.el-input) {
  flex: 1;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .goods-page {
    padding: 12px;
  }

  .summary-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .panel-actions {
    width: 100%;
  }

  .field-sm,
  .field-md {
    width: 100%;
  }

  .sn-input {
    flex-direction: column;
  }
}
</style>

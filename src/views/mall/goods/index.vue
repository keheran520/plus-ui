<template>
  <div class="goods-page">
    <section v-loading="summaryLoading" class="summary-grid">
      <article class="summary-card summary-card--blue">
        <span class="summary-card__label">&#x5546;&#x54C1;&#x603B;&#x6570;</span>
        <strong class="summary-card__value">{{ formatCount(summary.total) }}</strong>
        <span class="summary-card__hint">&#x5F53;&#x524D;&#x5217;&#x8868;&#x8303;&#x56F4;&#x5185;&#x7684;&#x5546;&#x54C1;&#x6570;&#x91CF;</span>
      </article>
      <article class="summary-card summary-card--green">
        <span class="summary-card__label">&#x4E0A;&#x67B6;&#x5546;&#x54C1;</span>
        <strong class="summary-card__value">{{ formatCount(summary.saleOn) }}</strong>
        <span class="summary-card__hint">&#x6B63;&#x5728;&#x5BF9;&#x5916;&#x5C55;&#x793A;&#x7684;&#x5546;&#x54C1;</span>
      </article>
      <article class="summary-card summary-card--amber">
        <span class="summary-card__label">&#x63A8;&#x8350;&#x5546;&#x54C1;</span>
        <strong class="summary-card__value">{{ formatCount(summary.recommend) }}</strong>
        <span class="summary-card__hint">&#x5DF2;&#x6807;&#x8BB0;&#x4E3A;&#x63A8;&#x8350;&#x7684;&#x5546;&#x54C1;</span>
      </article>
      <article class="summary-card summary-card--violet">
        <span class="summary-card__label">&#x5E73;&#x5747;&#x552E;&#x4EF7;</span>
        <strong class="summary-card__value">{{ formatCurrency(summary.avgPrice) }}</strong>
        <span class="summary-card__hint">&#x6309;&#x5F53;&#x524D;&#x7B5B;&#x9009;&#x7ED3;&#x679C;&#x8BA1;&#x7B97;</span>
      </article>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="panel search-panel">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="search-form">
          <el-form-item label="&#x5546;&#x54C1;&#x7F16;&#x53F7;" prop="goodsSn">
            <el-input
              v-model="queryParams.goodsSn"
              class="field-sm"
              clearable
              placeholder="&#x8BF7;&#x8F93;&#x5165;&#x5546;&#x54C1;&#x7F16;&#x53F7;"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="&#x5546;&#x54C1;&#x540D;&#x79F0;" prop="name">
            <el-input
              v-model="queryParams.name"
              class="field-md"
              clearable
              placeholder="&#x8BF7;&#x8F93;&#x5165;&#x5546;&#x54C1;&#x540D;&#x79F0;"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="&#x5206;&#x7C7B;" prop="categoryId">
            <el-select v-model="queryParams.categoryId" class="field-sm" clearable filterable placeholder="&#x5168;&#x90E8;&#x5206;&#x7C7B;">
              <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="&#x54C1;&#x724C;" prop="brandId">
            <el-select v-model="queryParams.brandId" class="field-sm" clearable filterable placeholder="&#x5168;&#x90E8;&#x54C1;&#x724C;">
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="&#x4E0A;&#x67B6;&#x72B6;&#x6001;" prop="saleStatus">
            <el-select v-model="queryParams.saleStatus" class="field-sm" clearable placeholder="&#x5168;&#x90E8;&#x72B6;&#x6001;">
              <el-option v-for="item in saleStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="&#x5BA1;&#x6838;&#x72B6;&#x6001;" prop="auditStatus">
            <el-select v-model="queryParams.auditStatus" class="field-sm" clearable placeholder="&#x5168;&#x90E8;&#x5BA1;&#x6838;&#x72B6;&#x6001;">
              <el-option v-for="item in auditStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="&#x670D;&#x52A1;&#x7C7B;&#x578B;" prop="serviceType">
            <el-select v-model="queryParams.serviceType" class="field-sm" clearable placeholder="&#x5168;&#x90E8;&#x670D;&#x52A1;&#x7C7B;&#x578B;">
              <el-option v-for="item in serviceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="search-actions">
            <el-button icon="Search" type="primary" @click="handleQuery">&#x67E5;&#x8BE2;</el-button>
            <el-button icon="Refresh" @click="resetQuery">&#x91CD;&#x7F6E;</el-button>
          </el-form-item>
        </el-form>
      </section>
    </transition>

    <section class="panel list-panel">
      <header class="panel-header">
        <div>
          <div class="panel-title">&#x5546;&#x54C1;&#x5217;&#x8868;</div>
          <div class="panel-subtitle">&#x5171; {{ total }} &#x6761;&#x8BB0;&#x5F55;</div>
        </div>
        <div class="panel-actions">
          <el-button v-hasPermi="['mall:goods:add']" icon="Plus" type="primary" @click="handleAdd">&#x65B0;&#x589E;&#x5546;&#x54C1;</el-button>
          <el-button v-hasPermi="['mall:goods:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()"
            >&#x6279;&#x91CF;&#x5220;&#x9664;</el-button
          >
          <el-button v-hasPermi="['mall:goods:export']" icon="Download" plain @click="handleExport">&#x5BFC;&#x51FA;</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <div class="view-tabs">
        <button
          v-for="item in quickTabs"
          :key="item.value"
          type="button"
          class="view-tab"
          :class="{ 'view-tab--active': activeQuickTab === item.value }"
          @click="handleQuickTabChange(item.value)"
        >
          <span class="view-tab__label">{{ item.label }}</span>
          <span class="view-tab__count">{{ item.count }}</span>
        </button>
      </div>

      <div class="table-summary">
        <span>&#x5F85;&#x5BA1;&#x6838; {{ formatCount(summary.auditPending) }}</span>
        <span>&#x5BA1;&#x6838;&#x9A73;&#x56DE; {{ formatCount(summary.auditRejected) }}</span>
        <span>&#x603B;&#x6D4F;&#x89C8; {{ formatCount(summary.views) }}</span>
        <span>&#x603B;&#x6536;&#x85CF; {{ formatCount(summary.favorites) }}</span>
        <span>&#x603B;&#x8BA2;&#x5355; {{ formatCount(summary.orders) }}</span>
      </div>

      <el-table v-loading="loading" :data="goodsList" class="goods-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed="left" type="selection" width="50" />
        <el-table-column fixed="left" label="&#x5546;&#x54C1;&#x4FE1;&#x606F;" min-width="340">
          <template #default="{ row }">
            <div class="goods-main">
              <el-image :src="getFirstImage(row.galleryUrls)" class="goods-main__cover" fit="cover">
                <template #error>
                  <div class="goods-main__empty">&#x6682;&#x65E0;&#x56FE;&#x7247;</div>
                </template>
              </el-image>
              <div class="goods-main__content">
                <div class="goods-main__title-row">
                  <span class="goods-main__title">{{ row.name || '\u672A\u547D\u540D\u5546\u54C1' }}</span>
                  <el-tag v-if="row.recommendFlag === '1'" effect="light" type="danger">&#x63A8;&#x8350;</el-tag>
                </div>
                <div class="goods-main__sub">{{ row.subTitle || '\u672A\u8BBE\u7F6E\u526F\u6807\u9898' }}</div>
                <div class="goods-main__meta">&#x7F16;&#x53F7;&#xFF1A;{{ row.goodsSn || '-' }}</div>
                <div class="goods-main__tags">
                  <el-tag effect="plain" size="small">{{ getCategoryName(row.categoryId) }}</el-tag>
                  <el-tag effect="plain" size="small" type="success">{{ getBrandName(row.brandId) }}</el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="right" label="&#x4EF7;&#x683C;" width="160">
          <template #default="{ row }">
            <div class="price-block">
              <span class="price-block__sale">{{ formatCurrency(row.price) }}</span>
              <span class="price-block__origin">&#x539F;&#x4EF7; {{ formatCurrency(row.originalPrice) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="&#x5355;&#x4F4D; / &#x7C7B;&#x578B;" width="160">
          <template #default="{ row }">
            <div class="stack-text">
              <span>{{ row.unitName || '-' }}</span>
              <span class="muted-text">{{ getServiceTypeLabel(row.serviceType) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="&#x670D;&#x52A1;&#x6807;&#x7B7E;" min-width="180">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag v-for="item in splitCommaText(row.serviceTags)" :key="item" effect="plain" size="small">{{ item }}</el-tag>
              <span v-if="!splitCommaText(row.serviceTags).length" class="muted-text">&#x6682;&#x65E0;</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="&#x670D;&#x52A1;&#x533A;&#x670D;" min-width="200">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag v-for="item in splitCommaText(row.serviceRegions)" :key="item" effect="plain" size="small" type="warning">{{ item }}</el-tag>
              <span v-if="!splitCommaText(row.serviceRegions).length" class="muted-text">&#x6682;&#x65E0;</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="&#x72B6;&#x6001;" width="170">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag :type="row.saleStatus === 'Y' ? 'success' : 'info'" effect="light">{{ getSaleStatusLabel(row.saleStatus) }}</el-tag>
              <el-tag :type="getAuditStatusType(row.auditStatus)" effect="plain">{{ getAuditStatusLabel(row.auditStatus) }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="&#x6570;&#x636E;&#x8868;&#x73B0;" width="200">
          <template #default="{ row }">
            <div class="metric-list">
              <span class="metric-chip">&#x6D4F;&#x89C8; {{ formatCount(row.viewCount) }}</span>
              <span class="metric-chip">&#x6536;&#x85CF; {{ formatCount(row.favoriteCount) }}</span>
              <span class="metric-chip">&#x8BA2;&#x5355; {{ formatCount(row.orderCount) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="&#x8BC4;&#x5206;" width="90">
          <template #default="{ row }">
            <span class="metric-chip metric-chip--green">{{ formatScore(row.score) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="&#x6392;&#x5E8F;" prop="sortOrder" width="90" />
        <el-table-column label="&#x5546;&#x54C1;&#x7B80;&#x4ECB;" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.brief || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="&#x64CD;&#x4F5C;" min-width="300">
          <template #default="{ row }">
            <div class="action-list">
              <el-button v-hasPermi="['mall:goods:edit']" link type="primary" @click="handleUpdate(row)">&#x7F16;&#x8F91;</el-button>
              <el-button v-hasPermi="['mall:goods:add']" link type="primary" @click="handleCopy(row)">&#x590D;&#x5236;</el-button>
              <el-button
                v-hasPermi="['mall:goods:edit']"
                :type="row.saleStatus === 'Y' ? 'warning' : 'success'"
                link
                @click="handleToggleSaleStatus(row)"
              >
                {{ row.saleStatus === 'Y' ? '\u4E0B\u67B6' : '\u4E0A\u67B6' }}
              </el-button>
              <el-button v-if="row.auditStatus !== '1'" v-hasPermi="['mall:goods:edit']" link type="success" @click="handleAudit(row, '1')"
                >&#x5BA1;&#x6838;&#x901A;&#x8FC7;</el-button
              >
              <el-button v-if="row.auditStatus !== '2'" v-hasPermi="['mall:goods:edit']" link type="warning" @click="handleAudit(row, '2')"
                >&#x5BA1;&#x6838;&#x9A73;&#x56DE;</el-button
              >
              <el-button
                v-hasPermi="['mall:goods:edit']"
                :type="row.recommendFlag === '1' ? 'warning' : 'success'"
                link
                @click="handleToggleRecommend(row)"
              >
                {{ row.recommendFlag === '1' ? '\u53D6\u6D88\u63A8\u8350' : '\u63A8\u8350' }}
              </el-button>
              <el-button v-hasPermi="['mall:goods:remove']" link type="danger" @click="handleDelete(row)">&#x5220;&#x9664;</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="drawer.visible" :close-on-click-modal="false" :title="drawer.title" size="920px">
      <el-form ref="goodsFormRef" :model="form" :rules="rules" class="goods-form" label-position="top">
        <div class="form-grid">
          <el-form-item label="&#x5546;&#x54C1;&#x7F16;&#x53F7;" prop="goodsSn">
            <div class="sn-input">
              <el-input
                v-model="form.goodsSn"
                placeholder="&#x65B0;&#x589E;&#x65F6;&#x81EA;&#x52A8;&#x751F;&#x6210;&#x5546;&#x54C1;&#x7F16;&#x53F7;"
                readonly
              />
              <el-button v-if="!form.id" :loading="generating" icon="Refresh" @click="handleGenerateGoodsSn"
                >&#x91CD;&#x65B0;&#x751F;&#x6210;</el-button
              >
            </div>
          </el-form-item>
          <el-form-item label="&#x5546;&#x54C1;&#x540D;&#x79F0;" prop="name">
            <el-input v-model="form.name" maxlength="100" placeholder="&#x8BF7;&#x8F93;&#x5165;&#x5546;&#x54C1;&#x540D;&#x79F0;" />
          </el-form-item>
          <el-form-item label="&#x526F;&#x6807;&#x9898;" prop="subTitle">
            <el-input
              v-model="form.subTitle"
              maxlength="120"
              placeholder="&#x8BF7;&#x8F93;&#x5165;&#x526F;&#x6807;&#x9898;&#x6216;&#x5356;&#x70B9;"
            />
          </el-form-item>
          <el-form-item label="&#x5173;&#x952E;&#x5B57;" prop="keywords">
            <el-input
              v-model="form.keywords"
              maxlength="120"
              placeholder="&#x591A;&#x4E2A;&#x5173;&#x952E;&#x5B57;&#x8BF7;&#x7528;&#x82F1;&#x6587;&#x9017;&#x53F7;&#x5206;&#x9694;"
            />
          </el-form-item>
          <el-form-item label="&#x5546;&#x54C1;&#x5206;&#x7C7B;" prop="categoryId">
            <el-select
              v-model="form.categoryId"
              filterable
              placeholder="&#x8BF7;&#x9009;&#x62E9;&#x5546;&#x54C1;&#x5206;&#x7C7B;"
              style="width: 100%"
            >
              <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="&#x5546;&#x54C1;&#x54C1;&#x724C;" prop="brandId">
            <el-select
              v-model="form.brandId"
              clearable
              filterable
              placeholder="&#x8BF7;&#x9009;&#x62E9;&#x5546;&#x54C1;&#x54C1;&#x724C;"
              style="width: 100%"
            >
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="&#x552E;&#x4EF7;" prop="price">
            <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="&#x539F;&#x4EF7;" prop="originalPrice">
            <el-input-number v-model="form.originalPrice" :min="0" :precision="2" :step="1" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="&#x5355;&#x4F4D;" prop="unitName">
            <el-input v-model="form.unitName" maxlength="20" placeholder="&#x4F8B;&#x5982;&#xFF1A;&#x6B21; / &#x5C40; / &#x5C0F;&#x65F6;" />
          </el-form-item>
          <el-form-item label="&#x670D;&#x52A1;&#x7C7B;&#x578B;" prop="serviceType">
            <el-select v-model="form.serviceType" placeholder="&#x8BF7;&#x9009;&#x62E9;&#x670D;&#x52A1;&#x7C7B;&#x578B;" style="width: 100%">
              <el-option v-for="item in serviceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="&#x6392;&#x5E8F;" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="0" :precision="0" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="&#x8BC4;&#x5206;" prop="score">
            <el-input-number v-model="form.score" :max="5" :min="0" :precision="1" :step="0.1" controls-position="right" style="width: 100%" />
          </el-form-item>
        </div>
        <el-form-item label="&#x8F6E;&#x64AD;&#x56FE;" prop="galleryOssIds">
          <image-upload v-model="form.galleryOssIds" :limit="6" />
          <div class="field-tip">
            &#x8BF7;&#x4E0A;&#x4F20;&#x8F6E;&#x64AD;&#x56FE;&#xFF0C;&#x7B2C;&#x4E00;&#x5F20;&#x56FE;&#x7247;&#x5C06;&#x4F5C;&#x4E3A;&#x4E3B;&#x56FE;&#x5C55;&#x793A;&#x3002;
          </div>
        </el-form-item>

        <div class="form-grid">
          <el-form-item label="&#x670D;&#x52A1;&#x6807;&#x7B7E;" prop="serviceTags">
            <el-select
              v-model="selectedServiceTags"
              collapse-tags
              collapse-tags-tooltip
              filterable
              multiple
              placeholder="&#x8BF7;&#x9009;&#x62E9;&#x670D;&#x52A1;&#x6807;&#x7B7E;"
              style="width: 100%"
              @change="syncServiceTags"
            >
              <el-option v-for="item in serviceTagOptions" :key="item.id" :label="item.tagName" :value="item.tagName" />
            </el-select>
          </el-form-item>
          <el-form-item label="&#x670D;&#x52A1;&#x533A;&#x670D;" prop="serviceRegions">
            <el-select
              v-model="selectedServiceRegions"
              collapse-tags
              collapse-tags-tooltip
              filterable
              multiple
              placeholder="&#x8BF7;&#x9009;&#x62E9;&#x670D;&#x52A1;&#x533A;&#x670D;"
              style="width: 100%"
              @change="syncServiceRegions"
            >
              <el-option v-for="item in serviceRegionOptions" :key="item.id" :label="item.tagName" :value="item.tagName" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="&#x5546;&#x54C1;&#x7B80;&#x4ECB;" prop="brief">
          <el-input
            v-model="form.brief"
            :rows="4"
            maxlength="300"
            placeholder="&#x8BF7;&#x8F93;&#x5165;&#x5546;&#x54C1;&#x7B80;&#x4ECB;"
            show-word-limit
            type="textarea"
          />
        </el-form-item>

        <el-form-item label="&#x5546;&#x54C1;&#x8BE6;&#x60C5;" prop="detail">
          <wang-editor v-model="form.messageContent" :height="600" />
        </el-form-item>

        <el-form-item label="&#x5907;&#x6CE8;" prop="remark">
          <el-input
            v-model="form.remark"
            :rows="4"
            maxlength="300"
            placeholder="&#x8BF7;&#x8F93;&#x5165;&#x7EF4;&#x62A4;&#x5907;&#x6CE8;"
            show-word-limit
            type="textarea"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="cancel">&#x53D6;&#x6D88;</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">&#x4FDD;&#x5B58;&#x5546;&#x54C1;</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" name="Goods" setup>
import type { ComponentInternalInstance } from 'vue';
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import type { ElFormInstance, FormRules } from 'element-plus';
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
import { listCategory } from '@/api/mall/category';
import { listBrand } from '@/api/mall/brand';
import { listTag } from '@/api/mall/tag';
import type { GoodsForm, GoodsQuery, GoodsVO } from '@/api/mall/goods/types';
import type { CategoryVO } from '@/api/mall/category/types';
import type { BrandVO } from '@/api/mall/brand/types';
import type { TagVO } from '@/api/mall/tag/types';
import ImageUpload from '@/components/ImageUpload/index.vue';

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

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

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

const queryFormRef = ref<ElFormInstance>();
const goodsFormRef = ref<ElFormInstance>();

const drawer = reactive({
  visible: false,
  title: ''
});

const saleStatusOptions = [
  { label: '\u4E0A\u67B6', value: 'Y' },
  { label: '\u4E0B\u67B6', value: 'N' }
];

const auditStatusOptions = [
  { label: '\u5F85\u5BA1\u6838', value: '0' },
  { label: '\u5BA1\u6838\u901A\u8FC7', value: '1' },
  { label: '\u5BA1\u6838\u9A73\u56DE', value: '2' }
];

const serviceTypeOptions = [
  { label: '\u6807\u51C6\u670D\u52A1', value: 'standard' },
  { label: '\u5957\u9910\u670D\u52A1', value: 'package' },
  { label: '\u5B9A\u5236\u670D\u52A1', value: 'custom' }
];
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
  unitName: '\u6B21',
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
    callback(new Error('\u8BE5\u9879\u4E0D\u80FD\u4E3A\u7A7A'));
    return;
  }
  callback();
};

const data = reactive<{
  form: GoodsEditorForm;
  queryParams: GoodsQuery;
  rules: FormRules<GoodsEditorForm>;
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
    goodsSn: [{ required: true, message: '\u8BF7\u5148\u751F\u6210\u5546\u54C1\u7F16\u53F7', trigger: 'blur' }],
    name: [{ required: true, message: '\u5546\u54C1\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A', trigger: 'blur' }],
    categoryId: [{ required: true, message: '\u5546\u54C1\u5206\u7C7B\u4E0D\u80FD\u4E3A\u7A7A', trigger: 'change' }],
    price: [{ required: true, message: '\u552E\u4EF7\u4E0D\u80FD\u4E3A\u7A7A', trigger: 'blur' }],
    originalPrice: [{ required: true, message: '\u539F\u4EF7\u4E0D\u80FD\u4E3A\u7A7A', trigger: 'blur' }],
    unitName: [{ required: true, message: '\u5355\u4F4D\u4E0D\u80FD\u4E3A\u7A7A', trigger: 'blur' }],
    serviceType: [{ required: true, message: '\u670D\u52A1\u7C7B\u578B\u4E0D\u80FD\u4E3A\u7A7A', trigger: 'change' }],
    sortOrder: [{ required: true, message: '\u6392\u5E8F\u4E0D\u80FD\u4E3A\u7A7A', trigger: 'blur' }],
    score: [{ required: true, message: '\u8BC4\u5206\u4E0D\u80FD\u4E3A\u7A7A', trigger: 'blur' }],
    galleryOssIds: [{ required: true, message: '\u8BF7\u4E0A\u4F20\u8F6E\u64AD\u56FE', trigger: 'change' }],
    serviceTags: [{ validator: validateSelectField, trigger: 'change' }],
    serviceRegions: [{ validator: validateSelectField, trigger: 'change' }],
    brief: [{ required: true, message: '\u5546\u54C1\u7B80\u4ECB\u4E0D\u80FD\u4E3A\u7A7A', trigger: 'blur' }]
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

const { queryParams, form, rules } = toRefs(data);

const categoryMap = computed(() => new Map(categoryOptions.value.map((item) => [String(item.id), item.name])));
const brandMap = computed(() => new Map(brandOptions.value.map((item) => [String(item.id), item.name])));
const quickTabs = computed(() => [
  { label: '全部商品', value: 'all' as QuickTabValue, count: formatCount(summary.value.total) },
  { label: '上架商品', value: 'saleOn' as QuickTabValue, count: formatCount(summary.value.saleOn) },
  { label: '待审核', value: 'pending' as QuickTabValue, count: formatCount(summary.value.auditPending) },
  { label: '推荐商品', value: 'recommended' as QuickTabValue, count: formatCount(summary.value.recommend) }
]);

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
const getCategoryName = (id?: string | number) => categoryMap.value.get(String(id ?? '')) || `\u5206\u7C7B#${id ?? '-'}`;

const getBrandName = (id?: string | number) => {
  if (id === undefined || id === null || id === '') {
    return '\u672A\u8BBE\u7F6E\u54C1\u724C';
  }
  return brandMap.value.get(String(id)) || `\u54C1\u724C#${id}`;
};

const getSaleStatusLabel = (value?: string) => saleStatusOptions.find((item) => item.value === value)?.label || '\u672A\u8BBE\u7F6E';
const getAuditStatusLabel = (value?: string) => auditStatusOptions.find((item) => item.value === value)?.label || '\u672A\u8BBE\u7F6E';
const getAuditStatusType = (value?: string) => (value === '1' ? 'success' : value === '2' ? 'danger' : 'warning');
const getServiceTypeLabel = (value?: string) => serviceTypeOptions.find((item) => item.value === value)?.label || '-';
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

const handleSelectionChange = (selection: GoodsVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = selection.length === 0;
};

const handleAdd = async () => {
  reset();
  await handleGenerateGoodsSn();
  drawer.visible = true;
  drawer.title = '\u65B0\u589E\u5546\u54C1';
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
  drawer.title = '\u7F16\u8F91\u5546\u54C1';
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
      proxy?.$modal.msgSuccess('\u4FDD\u5B58\u6210\u529F');
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
  await proxy?.$modal.confirm(
    `\u662F\u5426\u786E\u8BA4\u5220\u9664\u5546\u54C1\u6570\u636E\uFF1A${Array.isArray(currentIds) ? currentIds.join(',') : currentIds}\uFF1F`
  );
  await delGoods(currentIds);
  proxy?.$modal.msgSuccess('\u5220\u9664\u6210\u529F');
  await getList();
};

const handleCopy = async (row: GoodsVO) => {
  await proxy?.$modal.confirm(`\u662F\u5426\u786E\u8BA4\u590D\u5236\u5546\u54C1\u201C${row.name}\u201D\uFF1F`);
  await copyGoods(row.id);
  proxy?.$modal.msgSuccess('\u590D\u5236\u6210\u529F');
  await getList();
};

const handleToggleSaleStatus = async (row: GoodsVO) => {
  const nextStatus = row.saleStatus === 'Y' ? 'N' : 'Y';
  const actionText = nextStatus === 'Y' ? '\u4E0A\u67B6' : '\u4E0B\u67B6';
  await proxy?.$modal.confirm(`\u662F\u5426\u786E\u8BA4${actionText}\u5546\u54C1\u201C${row.name}\u201D\uFF1F`);
  await updateGoodsSaleStatus(row.id, nextStatus);
  proxy?.$modal.msgSuccess(`${actionText}\u6210\u529F`);
  await getList();
};

const handleAudit = async (row: GoodsVO, auditStatus: '1' | '2') => {
  const actionText = auditStatus === '1' ? '\u5BA1\u6838\u901A\u8FC7' : '\u5BA1\u6838\u9A73\u56DE';
  await proxy?.$modal.confirm(`\u662F\u5426\u786E\u8BA4${actionText}\u5546\u54C1\u201C${row.name}\u201D\uFF1F`);
  await updateGoodsAuditStatus(row.id, auditStatus);
  proxy?.$modal.msgSuccess(`${actionText}\u6210\u529F`);
  await getList();
};

const handleToggleRecommend = async (row: GoodsVO) => {
  const nextFlag = row.recommendFlag === '1' ? '0' : '1';
  const actionText = nextFlag === '1' ? '\u63A8\u8350' : '\u53D6\u6D88\u63A8\u8350';
  await proxy?.$modal.confirm(`\u662F\u5426\u786E\u8BA4${actionText}\u5546\u54C1\u201C${row.name}\u201D\uFF1F`);
  await updateGoodsRecommendFlag(row.id, nextFlag);
  proxy?.$modal.msgSuccess(`${actionText}\u6210\u529F`);
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

.table-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.table-summary span {
  padding: 6px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #64748b;
  font-size: 12px;
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

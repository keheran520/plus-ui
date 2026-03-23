<template>
  <div class="order-page">
    <section v-loading="summaryLoading" class="summary-grid">
      <article class="summary-card summary-card--blue">
        <span class="summary-card__label">&#x8BA2;&#x5355;&#x603B;&#x6570;</span>
        <strong class="summary-card__value">{{ formatCount(summary.total) }}</strong>
        <span class="summary-card__hint">&#x5F53;&#x524D;&#x7B5B;&#x9009;&#x8303;&#x56F4;&#x5185;&#x7684;&#x8BA2;&#x5355;&#x603B;&#x91CF;</span>
      </article>
      <article class="summary-card summary-card--green">
        <span class="summary-card__label">&#x652F;&#x4ED8;&#x91D1;&#x989D;</span>
        <strong class="summary-card__value">{{ formatCurrency(summary.payAmount) }}</strong>
        <span class="summary-card__hint">&#x5DF2;&#x652F;&#x4ED8;&#x8BA2;&#x5355;&#x91D1;&#x989D;&#x5408;&#x8BA1;</span>
      </article>
      <article class="summary-card summary-card--amber">
        <span class="summary-card__label">&#x5F85;&#x5904;&#x7406;&#x8BA2;&#x5355;</span>
        <strong class="summary-card__value">{{ formatCount(summary.pendingHandle) }}</strong>
        <span class="summary-card__hint">&#x5F85;&#x652F;&#x4ED8;&#x3001;&#x5F85;&#x53D1;&#x8D27;&#x3001;&#x5F85;&#x6536;&#x8D27;&#x5408;&#x8BA1;</span>
      </article>
      <article class="summary-card summary-card--violet">
        <span class="summary-card__label">&#x5DF2;&#x5B8C;&#x6210;&#x8BA2;&#x5355;</span>
        <strong class="summary-card__value">{{ formatCount(summary.finished) }}</strong>
        <span class="summary-card__hint">&#x5DF2;&#x7ECF;&#x5B8C;&#x6210;&#x5E76;&#x7ED3;&#x7B97;&#x7684;&#x8BA2;&#x5355;</span>
      </article>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="panel search-panel">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="search-form">
          <el-form-item label="&#x8BA2;&#x5355;&#x53F7;" prop="orderSn">
            <el-input v-model="queryParams.orderSn" class="field-sm" clearable placeholder="&#x8BF7;&#x8F93;&#x5165;&#x8BA2;&#x5355;&#x53F7;" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="&#x5546;&#x54C1;&#x540D;&#x79F0;" prop="goodsName">
            <el-input v-model="queryParams.goodsName" class="field-md" clearable placeholder="&#x8BF7;&#x8F93;&#x5165;&#x5546;&#x54C1;&#x540D;&#x79F0;" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="&#x4E70;&#x5BB6;ID" prop="buyerUserId">
            <el-input v-model="queryParams.buyerUserId" class="field-sm" clearable placeholder="&#x8BF7;&#x8F93;&#x5165;&#x4E70;&#x5BB6;ID" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="&#x5356;&#x5BB6;ID" prop="sellerUserId">
            <el-input v-model="queryParams.sellerUserId" class="field-sm" clearable placeholder="&#x8BF7;&#x8F93;&#x5165;&#x5356;&#x5BB6;ID" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="&#x8BA2;&#x5355;&#x72B6;&#x6001;" prop="orderStatus">
            <el-select v-model="queryParams.orderStatus" class="field-sm" clearable placeholder="&#x5168;&#x90E8;&#x72B6;&#x6001;">
              <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="search-actions">
            <el-button type="primary" icon="Search" @click="handleQuery">&#x67E5;&#x8BE2;</el-button>
            <el-button icon="Refresh" @click="resetQuery">&#x91CD;&#x7F6E;</el-button>
          </el-form-item>
        </el-form>
      </section>
    </transition>

    <section class="panel list-panel">
      <header class="panel-header">
        <div>
          <div class="panel-title">&#x8BA2;&#x5355;&#x5217;&#x8868;</div>
          <div class="panel-subtitle">&#x5171; {{ total }} &#x6761;&#x8BB0;&#x5F55;</div>
        </div>
        <div class="panel-actions">
          <el-button v-hasPermi="['mall:order:edit']" icon="Clock" plain @click="handleRunAutoCancel">&#x8D85;&#x65F6;&#x53D6;&#x6D88;</el-button>
          <el-button v-hasPermi="['mall:order:edit']" icon="Select" plain @click="handleRunAutoReceive">&#x81EA;&#x52A8;&#x6536;&#x8D27;</el-button>
          <el-button v-hasPermi="['mall:order:export']" icon="Download" plain @click="handleExport">&#x5BFC;&#x51FA;</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <div class="view-tabs">
        <button v-for="item in quickTabs" :key="item.value" type="button" class="view-tab" :class="{ 'view-tab--active': activeQuickTab === item.value }" @click="handleQuickTabChange(item.value)">
          <span class="view-tab__label">{{ item.label }}</span>
          <span class="view-tab__count">{{ item.count }}</span>
        </button>
      </div>
      <div class="view-tabs view-tabs--secondary">
        <button v-for="item in metricTabs" :key="item.value" type="button" class="view-tab view-tab--metric" :class="{ 'view-tab--active': activeMetricTab === item.value }" @click="handleMetricTabChange(item.value)">
          <span class="view-tab__label">{{ item.label }}</span>
          <span class="view-tab__count">{{ item.count }}</span>
        </button>
      </div>

      <el-table v-loading="loading" :data="displayOrderList" class="order-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" fixed="left" />
        <el-table-column label="&#x8BA2;&#x5355;&#x4FE1;&#x606F;" min-width="360" fixed="left">
          <template #default="{ row }">
            <div class="order-main">
              <el-image :src="getFirstImage(row.goodsGalleryUrls)" class="order-main__cover" fit="cover">
                <template #error><div class="order-main__empty">&#x6682;&#x65E0;&#x56FE;&#x7247;</div></template>
              </el-image>
              <div class="order-main__content">
                <div class="order-main__title-row">
                  <span class="order-main__title">{{ row.goodsName || emptyOrderName }}</span>
                  <el-tag :type="getOrderStatusType(row.orderStatus)" effect="light">{{ getOrderStatusLabel(row.orderStatus) }}</el-tag>
                  <el-tag v-if="row.refundStatus && row.refundStatus !== '0'" type="warning" effect="light">{{ getRefundStatusLabel(row.refundStatus) }}</el-tag>
                  <el-tag v-if="row.complaintStatus && row.complaintStatus !== '0'" type="danger" effect="light">{{ getComplaintStatusLabel(row.complaintStatus) }}</el-tag>
                </div>
                <div class="order-main__sub">&#x8BA2;&#x5355;&#x53F7;&#xFF1A;{{ row.orderSn || '-' }}</div>
                <div class="order-main__meta">&#x4E70;&#x5BB6; {{ row.buyerUserId || '-' }} / &#x5356;&#x5BB6; {{ row.sellerUserId || row.createBy || '-' }}</div>
                <div class="tag-list">
                  <el-tag v-for="item in splitCommaText(row.serviceTags)" :key="item" effect="plain" size="small">{{ item }}</el-tag>
                  <el-tag v-for="item in splitCommaText(row.serviceRegions)" :key="item" effect="plain" size="small" type="warning">{{ item }}</el-tag>
                  <span v-if="!splitCommaText(row.serviceTags).length && !splitCommaText(row.serviceRegions).length" class="muted-text">&#x6682;&#x65E0;&#x6807;&#x7B7E;</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="&#x91D1;&#x989D;&#x4FE1;&#x606F;" width="180" align="right">
          <template #default="{ row }">
            <div class="stack-text">
              <span class="price-text">{{ formatCurrency(row.payAmount) }}</span>
              <span class="muted-text">&#x5355;&#x4EF7; {{ formatCurrency(row.price) }}</span>
              <span class="muted-text">{{ getPayTypeLabel(row.payType) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="&#x5C65;&#x7EA6;&#x8FDB;&#x5EA6;" min-width="240">
          <template #default="{ row }">
            <div class="stack-text">
              <span>{{ getProgressText(row) }}</span>
              <span class="muted-text">{{ getDeadlineText(row) }}</span>
              <span v-if="row.deliveryVoucherText" class="muted-text">&#x53D1;&#x8D27;&#x51ED;&#x8BC1;&#xFF1A;{{ row.deliveryVoucherText }}</span>
              <span v-if="row.refundStatus && row.refundStatus !== '0'" class="muted-text">&#x9000;&#x6B3E;&#x72B6;&#x6001;&#xFF1A;{{ getRefundStatusLabel(row.refundStatus) }}</span>
              <span v-if="row.complaintStatus && row.complaintStatus !== '0'" class="muted-text">&#x6295;&#x8BC9;&#x72B6;&#x6001;&#xFF1A;{{ getComplaintStatusLabel(row.complaintStatus) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="&#x5907;&#x6CE8;&#x4FE1;&#x606F;" min-width="220">
          <template #default="{ row }">
            <div class="stack-text">
              <span class="muted-text">&#x4E70;&#x5BB6;&#xFF1A;{{ row.buyerRemark || '-' }}</span>
              <span class="muted-text">&#x5356;&#x5BB6;&#xFF1A;{{ row.sellerRemark || '-' }}</span>
              <span class="muted-text">&#x540E;&#x53F0;&#xFF1A;{{ row.adminRemark || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="&#x65F6;&#x95F4;&#x8F74;" min-width="240">
          <template #default="{ row }">
            <div class="stack-text">
              <span class="muted-text">&#x4E0B;&#x5355;&#xFF1A;{{ formatDateTime(row.createTime) }}</span>
              <span class="muted-text">&#x652F;&#x4ED8;&#xFF1A;{{ formatDateTime(row.payTime) }}</span>
              <span class="muted-text">&#x53D1;&#x8D27;&#xFF1A;{{ formatDateTime(row.deliveryTime) }}</span>
              <span class="muted-text">&#x5B8C;&#x6210;&#xFF1A;{{ formatDateTime(row.finishTime) }}</span>
              <span class="muted-text">&#x53D6;&#x6D88;&#xFF1A;{{ formatDateTime(row.cancelTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="&#x64CD;&#x4F5C;" min-width="240" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-list">
              <el-button v-hasPermi="['mall:order:query']" link type="primary" @click="handleDetail(row)">&#x8BE6;&#x60C5;</el-button>
              <el-button v-if="canPay(row)" v-hasPermi="['mall:order:edit']" link type="success" @click="handlePay(row)">&#x652F;&#x4ED8;</el-button>
              <el-button v-if="canDeliver(row)" v-hasPermi="['mall:order:edit']" link type="warning" @click="handleDeliver(row)">&#x53D1;&#x8D27;</el-button>
              <el-button v-if="canReceive(row)" v-hasPermi="['mall:order:edit']" link type="success" @click="handleReceive(row)">&#x786E;&#x8BA4;&#x6536;&#x8D27;</el-button>
              <el-button v-if="canApplyRefund(row)" v-hasPermi="['mall:order:edit']" link type="warning" @click="handleApplyRefund(row)">&#x7533;&#x8BF7;&#x9000;&#x6B3E;</el-button>
              <el-button v-if="canAuditRefund(row)" v-hasPermi="['mall:order:edit']" link type="danger" @click="handleAuditRefund(row)">&#x5BA1;&#x6838;&#x9000;&#x6B3E;</el-button>
              <el-button v-if="canApplyComplaint(row)" v-hasPermi="['mall:order:edit']" link type="danger" @click="handleApplyComplaint(row)">&#x63D0;&#x4EA4;&#x6295;&#x8BC9;</el-button>
              <el-button v-if="canHandleComplaint(row)" v-hasPermi="['mall:order:edit']" link type="danger" @click="handleComplaintProcess(row)">&#x5904;&#x7406;&#x6295;&#x8BC9;</el-button>
              <el-button v-hasPermi="['mall:order:remove']" link type="danger" @click="handleDelete(row)">&#x5220;&#x9664;</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="detailDrawer.visible" title="&#x8BA2;&#x5355;&#x8BE6;&#x60C5;" size="980px" :close-on-click-modal="false">
      <section class="detail-hero">
        <el-image :src="getFirstImage(form.goodsGalleryUrls)" class="detail-hero__cover" fit="cover" :preview-src-list="splitCommaText(form.goodsGalleryUrls)">
          <template #error><div class="order-main__empty">&#x6682;&#x65E0;&#x56FE;&#x7247;</div></template>
        </el-image>
        <div class="detail-hero__content">
          <div class="detail-hero__head">
            <div class="detail-hero__title">{{ form.goodsName || emptyOrderName }}</div>
            <el-tag :type="getOrderStatusType(form.orderStatus)" effect="light">{{ getOrderStatusLabel(form.orderStatus) }}</el-tag>
          </div>
          <div class="detail-hero__meta">&#x8BA2;&#x5355;&#x53F7;&#xFF1A;{{ form.orderSn || '-' }}</div>
          <div class="detail-hero__meta">&#x5546;&#x54C1;ID&#xFF1A;{{ form.goodsId || '-' }} / &#x4E70;&#x5BB6;ID&#xFF1A;{{ form.buyerUserId || '-' }} / &#x5356;&#x5BB6;ID&#xFF1A;{{ form.sellerUserId || form.createBy || '-' }}</div>
          <div class="tag-list">
            <el-tag v-for="item in splitCommaText(form.serviceTags)" :key="`detail-tag-${item}`" effect="plain" size="small">{{ item }}</el-tag>
            <el-tag v-for="item in splitCommaText(form.serviceRegions)" :key="`detail-region-${item}`" effect="plain" size="small" type="warning">{{ item }}</el-tag>
          </div>
          <div class="detail-progress">
            <div class="detail-progress__title">&#x5F53;&#x524D;&#x8FDB;&#x5EA6;</div>
            <div class="detail-progress__text">{{ getProgressText(form as OrderVO) }}</div>
            <div class="detail-progress__hint">{{ getDeadlineText(form as OrderVO) }}</div>
          </div>
        </div>
      </section>
      <div class="detail-grid">
        <section class="detail-card">
          <div class="card-title">&#x57FA;&#x7840;&#x4FE1;&#x606F;</div>
          <div class="detail-items">
            <div class="detail-item"><span class="detail-label">&#x8BA2;&#x5355;&#x53F7;</span><span class="detail-value">{{ form.orderSn || '-' }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x8BA2;&#x5355;&#x72B6;&#x6001;</span><span class="detail-value"><el-tag :type="getOrderStatusType(form.orderStatus)" effect="light">{{ getOrderStatusLabel(form.orderStatus) }}</el-tag></span></div>
            <div class="detail-item"><span class="detail-label">&#x5546;&#x54C1;ID</span><span class="detail-value">{{ form.goodsId || '-' }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x652F;&#x4ED8;&#x65B9;&#x5F0F;</span><span class="detail-value">{{ getPayTypeLabel(form.payType) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x4E70;&#x5BB6;ID</span><span class="detail-value">{{ form.buyerUserId || '-' }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x5356;&#x5BB6;ID</span><span class="detail-value">{{ form.sellerUserId || form.createBy || '-' }}</span></div>
            <div class="detail-item detail-item--full"><span class="detail-label">&#x5546;&#x54C1;&#x540D;&#x79F0;</span><span class="detail-value">{{ form.goodsName || '-' }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x670D;&#x52A1;&#x6807;&#x7B7E;</span><div class="tag-list"><el-tag v-for="item in splitCommaText(form.serviceTags)" :key="item" effect="plain" size="small">{{ item }}</el-tag><span v-if="!splitCommaText(form.serviceTags).length" class="muted-text">&#x6682;&#x65E0;</span></div></div>
            <div class="detail-item"><span class="detail-label">&#x670D;&#x52A1;&#x533A;&#x670D;</span><div class="tag-list"><el-tag v-for="item in splitCommaText(form.serviceRegions)" :key="item" effect="plain" size="small" type="warning">{{ item }}</el-tag><span v-if="!splitCommaText(form.serviceRegions).length" class="muted-text">&#x6682;&#x65E0;</span></div></div>
          </div>
        </section>
        <section class="detail-card">
          <div class="card-title">&#x6D41;&#x7A0B;&#x65F6;&#x95F4;</div>
          <div class="detail-items">
            <div class="detail-item"><span class="detail-label">&#x4E0B;&#x5355;&#x65F6;&#x95F4;</span><span class="detail-value">{{ formatDateTime(form.createTime) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x652F;&#x4ED8;&#x622A;&#x6B62;</span><span class="detail-value">{{ formatDateTime(form.payExpireTime) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x652F;&#x4ED8;&#x65F6;&#x95F4;</span><span class="detail-value">{{ formatDateTime(form.payTime) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x53D1;&#x8D27;&#x65F6;&#x95F4;</span><span class="detail-value">{{ formatDateTime(form.deliveryTime) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x6536;&#x8D27;&#x622A;&#x6B62;</span><span class="detail-value">{{ formatDateTime(form.receiveExpireTime) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x5B8C;&#x6210;&#x65F6;&#x95F4;</span><span class="detail-value">{{ formatDateTime(form.finishTime) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x53D6;&#x6D88;&#x65F6;&#x95F4;</span><span class="detail-value">{{ formatDateTime(form.cancelTime) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x7ED3;&#x7B97;&#x65F6;&#x95F4;</span><span class="detail-value">{{ formatDateTime(form.settleTime) }}</span></div>
          </div>
        </section>
        <section class="detail-card">
          <div class="card-title">&#x91D1;&#x989D;&#x4E0E;&#x7ED3;&#x7B97;</div>
          <div class="detail-items">
            <div class="detail-item"><span class="detail-label">&#x5546;&#x54C1;&#x5355;&#x4EF7;</span><span class="detail-value">{{ formatCurrency(form.price) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x5B9E;&#x4ED8;&#x91D1;&#x989D;</span><span class="detail-value price-text">{{ formatCurrency(form.payAmount) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x7ED3;&#x7B97;&#x72B6;&#x6001;</span><span class="detail-value"><el-tag :type="form.settleStatus === '1' ? 'success' : 'info'" effect="light">{{ getSettleStatusLabel(form.settleStatus) }}</el-tag></span></div>
            <div class="detail-item"><span class="detail-label">&#x7CFB;&#x7EDF;&#x72B6;&#x6001;</span><span class="detail-value">{{ form.status === '0' ? '正常' : '停用' }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x9000;&#x6B3E;&#x91D1;&#x989D;</span><span class="detail-value">{{ formatCurrency(form.refundAmount) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x9000;&#x6B3E;&#x65F6;&#x95F4;</span><span class="detail-value">{{ formatDateTime(form.refundTime) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x9000;&#x6B3E;&#x72B6;&#x6001;</span><span class="detail-value"><el-tag :type="getRefundStatusType(form.refundStatus)" effect="light">{{ getRefundStatusLabel(form.refundStatus) }}</el-tag></span></div>
            <div class="detail-item"><span class="detail-label">&#x9000;&#x6B3E;&#x7533;&#x8BF7;&#x65F6;&#x95F4;</span><span class="detail-value">{{ formatDateTime(form.refundApplyTime) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x9000;&#x6B3E;&#x5BA1;&#x6838;&#x65F6;&#x95F4;</span><span class="detail-value">{{ formatDateTime(form.refundAuditTime) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x9000;&#x6B3E;&#x5BA1;&#x6838;&#x8BF4;&#x660E;</span><span class="detail-value">{{ form.refundAuditRemark || '-' }}</span></div>
            <div class="detail-item detail-item--full"><span class="detail-label">&#x9000;&#x6B3E;&#x8BF4;&#x660E;</span><span class="detail-value">{{ form.refundRemark || '-' }}</span></div>
          </div>
        </section>
        <section class="detail-card">
          <div class="card-title">&#x53D1;&#x8D27;&#x4E0E;&#x51ED;&#x8BC1;</div>
          <div class="detail-items">
            <div class="detail-item"><span class="detail-label">&#x53D1;&#x8D27;&#x65B9;&#x5F0F;</span><span class="detail-value">{{ getDeliveryTypeLabel(form.deliveryType) }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x53D1;&#x8D27;&#x65F6;&#x95F4;</span><span class="detail-value">{{ formatDateTime(form.deliveryTime) }}</span></div>
            <div class="detail-item detail-item--full"><span class="detail-label">&#x51ED;&#x8BC1;&#x8BF4;&#x660E;</span><span class="detail-value">{{ form.deliveryVoucherText || '-' }}</span></div>
            <div class="detail-item detail-item--full">
              <span class="detail-label">&#x51ED;&#x8BC1;&#x56FE;&#x7247;</span>
              <div v-if="splitCommaText(form.deliveryVoucherUrls).length" class="detail-image-list">
                <el-image v-for="item in splitCommaText(form.deliveryVoucherUrls)" :key="item" :src="item" class="detail-image" fit="cover" :preview-src-list="splitCommaText(form.deliveryVoucherUrls)" />
              </div>
              <span v-else class="muted-text">&#x6682;&#x65E0;&#x51ED;&#x8BC1;&#x56FE;&#x7247;</span>
            </div>
          </div>
        </section>
        <section class="detail-card">
          <div class="card-title">&#x6295;&#x8BC9;&#x4E0E;&#x552E;&#x540E;</div>
          <div class="detail-items">
            <div class="detail-item"><span class="detail-label">&#x6295;&#x8BC9;&#x72B6;&#x6001;</span><span class="detail-value"><el-tag :type="getComplaintStatusType(form.complaintStatus)" effect="light">{{ getComplaintStatusLabel(form.complaintStatus) }}</el-tag></span></div>
            <div class="detail-item"><span class="detail-label">&#x6295;&#x8BC9;&#x65F6;&#x95F4;</span><span class="detail-value">{{ formatDateTime(form.complaintTime) }}</span></div>
            <div class="detail-item detail-item--full"><span class="detail-label">&#x6295;&#x8BC9;&#x5185;&#x5BB9;</span><span class="detail-value">{{ form.complaintContent || '-' }}</span></div>
            <div class="detail-item"><span class="detail-label">&#x5904;&#x7406;&#x65F6;&#x95F4;</span><span class="detail-value">{{ formatDateTime(form.complaintHandleTime) }}</span></div>
            <div class="detail-item detail-item--full"><span class="detail-label">&#x5904;&#x7406;&#x8BF4;&#x660E;</span><span class="detail-value">{{ form.complaintHandleRemark || '-' }}</span></div>
          </div>
        </section>
      </div>
      <el-form :model="form" label-position="top" class="drawer-form">
        <div class="form-grid">
          <el-form-item label="&#x5B9E;&#x4ED8;&#x91D1;&#x989D;"><el-input :model-value="formatCurrency(form.payAmount)" readonly /></el-form-item>
          <el-form-item label="&#x652F;&#x4ED8;&#x65B9;&#x5F0F;"><el-input :model-value="getPayTypeLabel(form.payType)" readonly /></el-form-item>
        </div>
        <el-form-item label="&#x8BA2;&#x5355;&#x8DDF;&#x8FDB;&#x63D0;&#x793A;"><el-input :model-value="getDeadlineText(form as OrderVO)" readonly /></el-form-item>
        <el-form-item label="&#x4E70;&#x5BB6;&#x5907;&#x6CE8;"><el-input :model-value="form.buyerRemark || '-'" readonly /></el-form-item>
        <el-form-item label="&#x5356;&#x5BB6;&#x5907;&#x6CE8;"><el-input v-model="form.sellerRemark" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="&#x8BF7;&#x8F93;&#x5165;&#x5356;&#x5BB6;&#x5907;&#x6CE8;" /></el-form-item>
        <el-form-item label="&#x540E;&#x53F0;&#x5907;&#x6CE8;"><el-input v-model="form.adminRemark" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="&#x8BF7;&#x8F93;&#x5165;&#x540E;&#x53F0;&#x5907;&#x6CE8;" /></el-form-item>
        <el-form-item label="&#x901A;&#x7528;&#x5907;&#x6CE8;"><el-input v-model="form.remark" type="textarea" :rows="3" maxlength="300" show-word-limit placeholder="&#x8BF7;&#x8F93;&#x5165;&#x901A;&#x7528;&#x5907;&#x6CE8;" /></el-form-item>
        <div class="drawer-footer"><el-button @click="detailDrawer.visible = false">&#x5173;&#x95ED;</el-button><el-button v-hasPermi="['mall:order:edit']" type="primary" :loading="detailSubmitting" @click="submitDetail">&#x4FDD;&#x5B58;&#x5907;&#x6CE8;</el-button></div>
      </el-form>
    </el-drawer>

    <el-dialog v-model="payDialog.visible" title="&#x8BA2;&#x5355;&#x652F;&#x4ED8;" width="460px" append-to-body>
      <el-form ref="payFormRef" :model="payForm" :rules="payRules" label-position="top">
        <el-form-item label="&#x8BA2;&#x5355;&#x53F7;"><el-input :model-value="payDialog.orderSn" readonly /></el-form-item>
        <el-form-item label="&#x652F;&#x4ED8;&#x91D1;&#x989D;"><el-input :model-value="formatCurrency(payDialog.payAmount)" readonly /></el-form-item>
        <el-form-item label="&#x652F;&#x4ED8;&#x65B9;&#x5F0F;" prop="actionPayType">
          <el-radio-group v-model="payForm.actionPayType"><el-radio-button label="balance">&#x4F59;&#x989D;&#x652F;&#x4ED8;</el-radio-button></el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer><div class="drawer-footer"><el-button @click="closePayDialog">&#x53D6;&#x6D88;</el-button><el-button type="primary" :loading="paySubmitting" @click="submitPay">&#x786E;&#x8BA4;&#x652F;&#x4ED8;</el-button></div></template>
    </el-dialog>

    <el-dialog v-model="deliverDialog.visible" title="&#x8BA2;&#x5355;&#x53D1;&#x8D27;" width="680px" append-to-body>
      <el-form ref="deliverFormRef" :model="deliverForm" :rules="deliverRules" label-position="top" class="drawer-form">
        <el-form-item label="&#x8BA2;&#x5355;&#x53F7;"><el-input :model-value="deliverDialog.orderSn" readonly /></el-form-item>
        <el-form-item label="&#x53D1;&#x8D27;&#x65B9;&#x5F0F;"><el-input model-value="&#x65E0;&#x9700;&#x7269;&#x6D41;&#x53D1;&#x8D27;" readonly /></el-form-item>
        <el-form-item label="&#x53D1;&#x8D27;&#x51ED;&#x8BC1;&#x8BF4;&#x660E;" prop="actionDeliveryVoucherText">
          <el-input v-model="deliverForm.actionDeliveryVoucherText" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="&#x8BF7;&#x8F93;&#x5165;&#x53D1;&#x8D27;&#x51ED;&#x8BC1;&#x8BF4;&#x660E;&#xFF0C;&#x53EF;&#x586B;&#x5199;&#x8D26;&#x53F7;&#x3001;&#x8054;&#x7CFB;&#x4FE1;&#x606F;&#x6216;&#x670D;&#x52A1;&#x5B8C;&#x6210;&#x8BF4;&#x660E;" />
        </el-form-item>
        <el-form-item label="&#x53D1;&#x8D27;&#x51ED;&#x8BC1;&#x56FE;&#x7247;">
          <image-upload v-model="deliverForm.actionDeliveryVoucherOssIds" :limit="3" />
          <div class="field-tip">&#x53EF;&#x4EE5;&#x4E0A;&#x4F20;&#x622A;&#x56FE;&#x4F5C;&#x4E3A;&#x53D1;&#x8D27;&#x51ED;&#x8BC1;&#xFF0C;&#x6587;&#x5B57;&#x8BF4;&#x660E;&#x548C;&#x56FE;&#x7247;&#x4E8C;&#x9009;&#x4E00;&#x5373;&#x53EF;&#xFF0C;&#x4E5F;&#x53EF;&#x4EE5;&#x540C;&#x65F6;&#x586B;&#x5199;&#x3002;</div>
        </el-form-item>
      </el-form>
      <template #footer><div class="drawer-footer"><el-button @click="closeDeliverDialog">&#x53D6;&#x6D88;</el-button><el-button type="primary" :loading="deliverSubmitting" @click="submitDeliver">&#x786E;&#x8BA4;&#x53D1;&#x8D27;</el-button></div></template>
    </el-dialog>

    <el-dialog v-model="refundDialog.visible" title="&#x7533;&#x8BF7;&#x9000;&#x6B3E;" width="520px" append-to-body>
      <el-form ref="refundFormRef" :model="refundForm" :rules="refundRules" label-position="top">
        <el-form-item label="&#x8BA2;&#x5355;&#x53F7;"><el-input :model-value="refundDialog.orderSn" readonly /></el-form-item>
        <el-form-item label="&#x53EF;&#x9000;&#x91D1;&#x989D;"><el-input :model-value="formatCurrency(refundDialog.payAmount)" readonly /></el-form-item>
        <el-form-item label="&#x7533;&#x8BF7;&#x9000;&#x6B3E;&#x91D1;&#x989D;" prop="actionRefundAmount"><el-input-number v-model="refundForm.actionRefundAmount" :min="0" :precision="2" :step="1" controls-position="right" style="width: 100%" /></el-form-item>
        <el-form-item label="&#x9000;&#x6B3E;&#x8BF4;&#x660E;" prop="actionRefundRemark"><el-input v-model="refundForm.actionRefundRemark" type="textarea" :rows="3" maxlength="300" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><div class="drawer-footer"><el-button @click="closeRefundDialog">&#x53D6;&#x6D88;</el-button><el-button type="primary" :loading="refundSubmitting" @click="submitRefund">&#x63D0;&#x4EA4;&#x7533;&#x8BF7;</el-button></div></template>
    </el-dialog>

    <el-dialog v-model="refundAuditDialog.visible" title="&#x5BA1;&#x6838;&#x9000;&#x6B3E;" width="520px" append-to-body>
      <el-form ref="refundAuditFormRef" :model="refundAuditForm" :rules="refundAuditRules" label-position="top">
        <el-form-item label="&#x8BA2;&#x5355;&#x53F7;"><el-input :model-value="refundAuditDialog.orderSn" readonly /></el-form-item>
        <el-form-item label="&#x7533;&#x8BF7;&#x9000;&#x6B3E;&#x91D1;&#x989D;"><el-input :model-value="formatCurrency(refundAuditDialog.refundAmount)" readonly /></el-form-item>
        <el-form-item label="&#x5BA1;&#x6838;&#x7ED3;&#x679C;" prop="actionRefundAuditStatus">
          <el-radio-group v-model="refundAuditForm.actionRefundAuditStatus">
            <el-radio-button label="2">&#x901A;&#x8FC7;</el-radio-button>
            <el-radio-button label="3">&#x9A73;&#x56DE;</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="&#x5BA1;&#x6838;&#x8BF4;&#x660E;" prop="actionRefundAuditRemark"><el-input v-model="refundAuditForm.actionRefundAuditRemark" type="textarea" :rows="3" maxlength="300" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><div class="drawer-footer"><el-button @click="closeRefundAuditDialog">&#x53D6;&#x6D88;</el-button><el-button type="primary" :loading="refundAuditSubmitting" @click="submitRefundAudit">&#x786E;&#x8BA4;&#x5BA1;&#x6838;</el-button></div></template>
    </el-dialog>

    <el-dialog v-model="complaintDialog.visible" title="&#x63D0;&#x4EA4;&#x6295;&#x8BC9;" width="520px" append-to-body>
      <el-form ref="complaintFormRef" :model="complaintForm" :rules="complaintRules" label-position="top">
        <el-form-item label="&#x8BA2;&#x5355;&#x53F7;"><el-input :model-value="complaintDialog.orderSn" readonly /></el-form-item>
        <el-form-item label="&#x6295;&#x8BC9;&#x5185;&#x5BB9;" prop="actionComplaintContent"><el-input v-model="complaintForm.actionComplaintContent" type="textarea" :rows="4" maxlength="500" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><div class="drawer-footer"><el-button @click="closeComplaintDialog">&#x53D6;&#x6D88;</el-button><el-button type="primary" :loading="complaintSubmitting" @click="submitComplaint">&#x63D0;&#x4EA4;&#x6295;&#x8BC9;</el-button></div></template>
    </el-dialog>

    <el-dialog v-model="complaintHandleDialog.visible" title="&#x5904;&#x7406;&#x6295;&#x8BC9;" width="520px" append-to-body>
      <el-form ref="complaintHandleFormRef" :model="complaintHandleForm" :rules="complaintHandleRules" label-position="top">
        <el-form-item label="&#x8BA2;&#x5355;&#x53F7;"><el-input :model-value="complaintHandleDialog.orderSn" readonly /></el-form-item>
        <el-form-item label="&#x6295;&#x8BC9;&#x5185;&#x5BB9;"><el-input :model-value="complaintHandleDialog.content" type="textarea" :rows="3" readonly /></el-form-item>
        <el-form-item label="&#x5904;&#x7406;&#x8BF4;&#x660E;" prop="actionComplaintHandleRemark"><el-input v-model="complaintHandleForm.actionComplaintHandleRemark" type="textarea" :rows="4" maxlength="500" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><div class="drawer-footer"><el-button @click="closeComplaintHandleDialog">&#x53D6;&#x6D88;</el-button><el-button type="primary" :loading="complaintHandleSubmitting" @click="submitComplaintHandle">&#x786E;&#x8BA4;&#x5904;&#x7406;</el-button></div></template>
    </el-dialog>
  </div>
</template>

<script lang="ts" name="Order" setup>
import type { ComponentInternalInstance } from 'vue';
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import type { ElFormInstance, FormRules } from 'element-plus';
import ImageUpload from '@/components/ImageUpload/index.vue';
import { applyComplaint, applyRefund, auditRefund, autoCancelOrder, autoReceiveOrder, confirmReceive, delOrder, deliverOrder, getOrder, handleComplaint, listOrder, payOrder, updateOrder } from '@/api/mall/order';
import type { OrderForm, OrderQuery, OrderVO } from '@/api/mall/order/types';

type QuickTabValue = 'all' | 'pending' | 'processing' | 'finished';
type MetricTabValue = 'all' | '101' | '201' | '301' | '401' | '501' | '102';
interface SummaryState { total: number; payAmount: number; pendingHandle: number; finished: number; pendingPay: number; pendingDelivery: number; pendingReceive: number; cancelled: number; }

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emptyOrderName = '\u672A\u547D\u540D\u8BA2\u5355';
const loading = ref(false);
const summaryLoading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const total = ref(0);
const orderList = ref<OrderVO[]>([]);
const detailSubmitting = ref(false);
const paySubmitting = ref(false);
const deliverSubmitting = ref(false);
const activeQuickTab = ref<QuickTabValue>('all');
const activeMetricTab = ref<MetricTabValue>('all');
const queryFormRef = ref<ElFormInstance>();
const payFormRef = ref<ElFormInstance>();
const deliverFormRef = ref<ElFormInstance>();
const refundFormRef = ref<ElFormInstance>();
const refundAuditFormRef = ref<ElFormInstance>();
const complaintFormRef = ref<ElFormInstance>();
const complaintHandleFormRef = ref<ElFormInstance>();
const detailDrawer = reactive({ visible: false });
const payDialog = reactive({ visible: false, id: '' as string | number, orderSn: '', payAmount: 0 });
const deliverDialog = reactive({ visible: false, id: '' as string | number, orderSn: '' });
const refundDialog = reactive({ visible: false, id: '' as string | number, orderSn: '', payAmount: 0 });
const refundAuditDialog = reactive({ visible: false, id: '' as string | number, orderSn: '', refundAmount: 0 });
const complaintDialog = reactive({ visible: false, id: '' as string | number, orderSn: '' });
const complaintHandleDialog = reactive({ visible: false, id: '' as string | number, orderSn: '', content: '' });
const refundSubmitting = ref(false);
const refundAuditSubmitting = ref(false);
const complaintSubmitting = ref(false);
const complaintHandleSubmitting = ref(false);
const orderStatusOptions = [{ label: '\u5F85\u652F\u4ED8', value: '101' }, { label: '\u5DF2\u53D6\u6D88', value: '102' }, { label: '\u5F85\u53D1\u8D27', value: '201' }, { label: '\u5F85\u6536\u8D27', value: '301' }, { label: '\u5DF2\u5B8C\u6210', value: '401' }, { label: '\u5DF2\u9000\u6B3E', value: '501' }];
const initFormData = (): OrderForm => ({ id: undefined, orderSn: '', buyerUserId: undefined, sellerUserId: undefined, goodsId: undefined, goodsName: '', goodsGalleryUrls: '', price: 0, payAmount: 0, payType: '', serviceRegions: '', serviceTags: '', buyerRemark: '', sellerRemark: '', adminRemark: '', orderStatus: '', payExpireTime: '', deliveryType: '', deliveryVoucherText: '', deliveryVoucherOssIds: [], deliveryVoucherUrls: '', deliveryTime: '', receiveExpireTime: '', settleStatus: '', settleTime: '', refundAmount: 0, refundRemark: '', refundStatus: '0', refundApplyTime: '', refundAuditTime: '', refundAuditRemark: '', payTime: '', finishTime: '', cancelTime: '', refundTime: '', complaintStatus: '0', complaintContent: '', complaintTime: '', complaintHandleRemark: '', complaintHandleTime: '', status: '0', remark: '', actionPayType: 'balance', actionDeliveryVoucherText: '', actionDeliveryVoucherOssIds: [], actionDeliveryVoucherUrls: '', actionRefundAmount: 0, actionRefundRemark: '', actionRefundAuditStatus: '2', actionRefundAuditRemark: '', actionComplaintContent: '', actionComplaintHandleRemark: '' });
const summary = ref<SummaryState>({ total: 0, payAmount: 0, pendingHandle: 0, finished: 0, pendingPay: 0, pendingDelivery: 0, pendingReceive: 0, cancelled: 0 });
const data = reactive<{ form: OrderForm; queryParams: OrderQuery }>({ form: initFormData(), queryParams: { pageNum: 1, pageSize: 10, orderSn: undefined, buyerUserId: undefined, sellerUserId: undefined, goodsName: undefined, orderStatus: undefined } });
const payForm = ref<OrderForm>({ actionPayType: 'balance' });
const deliverForm = ref<OrderForm>({ actionDeliveryVoucherText: '', actionDeliveryVoucherOssIds: [], actionDeliveryVoucherUrls: '' });
const refundForm = ref<OrderForm>({ actionRefundAmount: 0, actionRefundRemark: '' });
const refundAuditForm = ref<OrderForm>({ actionRefundAuditStatus: '2', actionRefundAuditRemark: '' });
const complaintForm = ref<OrderForm>({ actionComplaintContent: '' });
const complaintHandleForm = ref<OrderForm>({ actionComplaintHandleRemark: '' });
const payRules: FormRules = { actionPayType: [{ required: true, message: '\u8BF7\u9009\u62E9\u652F\u4ED8\u65B9\u5F0F', trigger: 'change' }] };
const deliverRules: FormRules = { actionDeliveryVoucherText: [{ validator: (_rule, value, callback) => { const hasText = !!String(value || '').trim(); const hasImages = Array.isArray(deliverForm.value.actionDeliveryVoucherOssIds) ? deliverForm.value.actionDeliveryVoucherOssIds.length > 0 : !!deliverForm.value.actionDeliveryVoucherOssIds; if (!hasText && !hasImages) { callback(new Error('\u8BF7\u586B\u5199\u53D1\u8D27\u51ED\u8BC1\u8BF4\u660E\u6216\u4E0A\u4F20\u53D1\u8D27\u51ED\u8BC1\u56FE\u7247')); return; } callback(); }, trigger: 'blur' }] };
const refundRules: FormRules = { actionRefundAmount: [{ required: true, message: '\u8BF7\u8F93\u5165\u9000\u6B3E\u91D1\u989D', trigger: 'blur' }], actionRefundRemark: [{ required: true, message: '\u8BF7\u8F93\u5165\u9000\u6B3E\u8BF4\u660E', trigger: 'blur' }] };
const refundAuditRules: FormRules = { actionRefundAuditStatus: [{ required: true, message: '\u8BF7\u9009\u62E9\u5BA1\u6838\u7ED3\u679C', trigger: 'change' }], actionRefundAuditRemark: [{ required: true, message: '\u8BF7\u8F93\u5165\u5BA1\u6838\u8BF4\u660E', trigger: 'blur' }] };
const complaintRules: FormRules = { actionComplaintContent: [{ required: true, message: '\u8BF7\u8F93\u5165\u6295\u8BC9\u5185\u5BB9', trigger: 'blur' }] };
const complaintHandleRules: FormRules = { actionComplaintHandleRemark: [{ required: true, message: '\u8BF7\u8F93\u5165\u5904\u7406\u8BF4\u660E', trigger: 'blur' }] };
const { queryParams, form } = toRefs(data);
const quickTabs = computed(() => [{ label: '\u5168\u90E8\u8BA2\u5355', value: 'all' as QuickTabValue, count: formatCount(summary.value.total) }, { label: '\u5F85\u5904\u7406', value: 'pending' as QuickTabValue, count: formatCount(summary.value.pendingHandle) }, { label: '\u5904\u7406\u4E2D', value: 'processing' as QuickTabValue, count: formatCount(summary.value.pendingDelivery + summary.value.pendingReceive) }, { label: '\u5DF2\u5B8C\u6210', value: 'finished' as QuickTabValue, count: formatCount(summary.value.finished) }]);
const metricTabs = computed(() => [{ label: '\u5168\u90E8\u72B6\u6001', value: 'all' as MetricTabValue, count: formatCount(summary.value.total) }, { label: '\u5F85\u652F\u4ED8', value: '101' as MetricTabValue, count: formatCount(summary.value.pendingPay) }, { label: '\u5F85\u53D1\u8D27', value: '201' as MetricTabValue, count: formatCount(summary.value.pendingDelivery) }, { label: '\u5F85\u6536\u8D27', value: '301' as MetricTabValue, count: formatCount(summary.value.pendingReceive) }, { label: '\u5DF2\u5B8C\u6210', value: '401' as MetricTabValue, count: formatCount(summary.value.finished) }, { label: '\u5DF2\u9000\u6B3E', value: '501' as MetricTabValue, count: formatCount(orderList.value.filter((item) => item.orderStatus === '501').length) }, { label: '\u5DF2\u53D6\u6D88', value: '102' as MetricTabValue, count: formatCount(summary.value.cancelled) }]);
const displayOrderList = computed(() => { let list = [...orderList.value]; if (activeMetricTab.value !== 'all') list = list.filter((item) => item.orderStatus === activeMetricTab.value); if (activeQuickTab.value === 'pending') list = list.filter((item) => ['101', '201', '301'].includes(item.orderStatus)); else if (activeQuickTab.value === 'processing') list = list.filter((item) => ['201', '301'].includes(item.orderStatus)); else if (activeQuickTab.value === 'finished') list = list.filter((item) => item.orderStatus === '401'); return list; });
const splitCommaText = (value?: string) => (value ? value.split(',').map((item) => item.trim()).filter(Boolean) : []);
const getFirstImage = (value?: string) => splitCommaText(value)[0] || '';
const getOrderStatusLabel = (status?: string) => ({ '101': '\u5F85\u652F\u4ED8', '102': '\u5DF2\u53D6\u6D88', '201': '\u5F85\u53D1\u8D27', '301': '\u5F85\u6536\u8D27', '401': '\u5DF2\u5B8C\u6210', '501': '\u5DF2\u9000\u6B3E' }[status || ''] || '\u672A\u77E5\u72B6\u6001');
const getOrderStatusType = (status?: string) => ({ '101': 'warning', '102': 'info', '201': 'danger', '301': 'success', '401': 'success', '501': 'info' }[status || ''] || 'info');
const getPayTypeLabel = (payType?: string) => (payType === 'balance' ? '\u4F59\u989D\u652F\u4ED8' : payType || '\u672A\u652F\u4ED8');
const getSettleStatusLabel = (status?: string) => (status === '1' ? '\u5DF2\u7ED3\u7B97' : '\u672A\u7ED3\u7B97');
const getDeliveryTypeLabel = (deliveryType?: string) => (deliveryType === 'no_logistics' ? '\u65E0\u9700\u7269\u6D41\u53D1\u8D27' : deliveryType || '\u672A\u53D1\u8D27');
const getRefundStatusLabel = (status?: string) => ({ '0': '\u672A\u7533\u8BF7', '1': '\u5F85\u5BA1\u6838', '2': '\u5DF2\u901A\u8FC7', '3': '\u5DF2\u9A73\u56DE' }[status || '0'] || '\u672A\u7533\u8BF7');
const getRefundStatusType = (status?: string) => ({ '0': 'info', '1': 'warning', '2': 'success', '3': 'danger' }[status || '0'] || 'info');
const getComplaintStatusLabel = (status?: string) => ({ '0': '\u672A\u6295\u8BC9', '1': '\u5F85\u5904\u7406', '2': '\u5DF2\u5904\u7406' }[status || '0'] || '\u672A\u6295\u8BC9');
const getComplaintStatusType = (status?: string) => ({ '0': 'info', '1': 'danger', '2': 'success' }[status || '0'] || 'info');
const getProgressText = (row: OrderVO) => ({ '101': '\u8BA2\u5355\u5DF2\u521B\u5EFA\uFF0C\u7B49\u5F85\u4E70\u5BB6\u652F\u4ED8', '102': '\u8BA2\u5355\u5DF2\u53D6\u6D88', '201': '\u652F\u4ED8\u5B8C\u6210\uFF0C\u7B49\u5F85\u670D\u52A1\u5546\u53D1\u8D27', '301': '\u5DF2\u53D1\u8D27\uFF0C\u7B49\u5F85\u4E70\u5BB6\u786E\u8BA4\u6536\u8D27', '401': '\u8BA2\u5355\u5DF2\u5B8C\u6210\uFF0C\u91D1\u989D\u5DF2\u7ED3\u7B97\u7ED9\u670D\u52A1\u5546', '501': '\u8BA2\u5355\u5DF2\u9000\u6B3E\uFF0C\u552E\u540E\u5904\u7406\u5DF2\u5B8C\u6210' }[row.orderStatus] || '\u72B6\u6001\u672A\u77E5');
const getDeadlineText = (row: OrderVO) => row.refundStatus === '1' ? '\u8BA2\u5355\u5DF2\u63D0\u4EA4\u9000\u6B3E\u7533\u8BF7\uff0c\u7B49\u5F85\u540E\u53F0\u5BA1\u6838' : row.complaintStatus === '1' ? '\u8BA2\u5355\u5DF2\u63D0\u4EA4\u6295\u8BC9\uff0c\u7B49\u5F85\u5BA2\u670D\u5904\u7406' : row.orderStatus === '101' ? (row.payExpireTime ? `\u8BF7\u5728 ${formatDateTime(row.payExpireTime)} \u524D\u5B8C\u6210\u652F\u4ED8` : '\u5F85\u652F\u4ED8') : row.orderStatus === '301' ? (row.receiveExpireTime ? `\u8BF7\u5728 ${formatDateTime(row.receiveExpireTime)} \u524D\u786E\u8BA4\u6536\u8D27\uFF0C\u8D85\u65F6\u7CFB\u7EDF\u81EA\u52A8\u6536\u8D27` : '\u5F85\u6536\u8D27') : row.orderStatus === '201' ? '\u652F\u4ED8\u6210\u529F\u540E\u7B49\u5F85\u670D\u52A1\u5546\u53D1\u8D27' : '-';
const canPay = (row: OrderVO) => row.orderStatus === '101';
const canDeliver = (row: OrderVO) => row.orderStatus === '201';
const canReceive = (row: OrderVO) => row.orderStatus === '301';
const canApplyRefund = (row: OrderVO) => ['201', '301', '401'].includes(row.orderStatus) && row.refundStatus !== '1' && row.orderStatus !== '501';
const canAuditRefund = (row: OrderVO) => row.refundStatus === '1';
const canApplyComplaint = (row: OrderVO) => ['401', '501'].includes(row.orderStatus) && row.complaintStatus !== '1';
const canHandleComplaint = (row: OrderVO) => row.complaintStatus === '1';
const buildSummary = (list: OrderVO[]) => { const nextSummary: SummaryState = { total: total.value, payAmount: 0, pendingHandle: 0, finished: 0, pendingPay: 0, pendingDelivery: 0, pendingReceive: 0, cancelled: 0 }; list.forEach((item) => { if (['201', '301', '401'].includes(item.orderStatus)) nextSummary.payAmount += Number(item.payAmount || 0); if (item.orderStatus === '101') nextSummary.pendingPay += 1; if (item.orderStatus === '201') nextSummary.pendingDelivery += 1; if (item.orderStatus === '301') nextSummary.pendingReceive += 1; if (item.orderStatus === '401') nextSummary.finished += 1; if (item.orderStatus === '102') nextSummary.cancelled += 1; }); nextSummary.pendingHandle = nextSummary.pendingPay + nextSummary.pendingDelivery + nextSummary.pendingReceive; summary.value = nextSummary; };
const getList = async () => { loading.value = true; summaryLoading.value = true; try { const res = await listOrder(queryParams.value); orderList.value = res.rows || []; total.value = res.total || 0; buildSummary(orderList.value); } finally { loading.value = false; summaryLoading.value = false; } };
const reset = () => { data.form = initFormData(); };
const handleQuery = () => { queryParams.value.pageNum = 1; getList(); };
const resetQuery = () => { queryFormRef.value?.resetFields(); activeQuickTab.value = 'all'; activeMetricTab.value = 'all'; handleQuery(); };
const handleQuickTabChange = (tab: QuickTabValue) => { activeQuickTab.value = tab; activeMetricTab.value = tab === 'finished' ? '401' : tab === 'pending' ? '101' : 'all'; };
const handleMetricTabChange = (tab: MetricTabValue) => { activeMetricTab.value = tab; activeQuickTab.value = tab === '401' ? 'finished' : ['101', '201', '301'].includes(tab) ? (tab === '101' ? 'pending' : 'processing') : 'all'; };
const handleSelectionChange = (selection: OrderVO[]) => { ids.value = selection.map((item) => item.id); };
const handleDetail = async (row: OrderVO) => { reset(); const res = await getOrder(row.id); data.form = { ...initFormData(), ...res.data, deliveryVoucherOssIds: splitCommaText(res.data.deliveryVoucherOssIds) }; detailDrawer.visible = true; };
const submitDetail = async () => { detailSubmitting.value = true; try { await updateOrder({ id: form.value.id, sellerRemark: form.value.sellerRemark, adminRemark: form.value.adminRemark, remark: form.value.remark, refundAmount: form.value.refundAmount, refundRemark: form.value.refundRemark, status: form.value.status }); proxy?.$modal.msgSuccess('\u4FDD\u5B58\u6210\u529F'); detailDrawer.visible = false; await getList(); } finally { detailSubmitting.value = false; } };
const closePayDialog = () => { payDialog.visible = false; payDialog.id = ''; payDialog.orderSn = ''; payDialog.payAmount = 0; payForm.value = { actionPayType: 'balance' }; payFormRef.value?.clearValidate(); };
const handlePay = (row: OrderVO) => { payDialog.id = row.id; payDialog.orderSn = row.orderSn; payDialog.payAmount = Number(row.payAmount || 0); payForm.value = { actionPayType: 'balance' }; payDialog.visible = true; };
const submitPay = () => { payFormRef.value?.validate(async (valid) => { if (!valid) return; paySubmitting.value = true; try { await payOrder(payDialog.id, payForm.value.actionPayType || 'balance'); proxy?.$modal.msgSuccess('\u652F\u4ED8\u6210\u529F'); closePayDialog(); await getList(); } finally { paySubmitting.value = false; } }); };
const closeDeliverDialog = () => { deliverDialog.visible = false; deliverDialog.id = ''; deliverDialog.orderSn = ''; deliverForm.value = { actionDeliveryVoucherText: '', actionDeliveryVoucherOssIds: [], actionDeliveryVoucherUrls: '' }; deliverFormRef.value?.clearValidate(); };
const handleDeliver = (row: OrderVO) => { deliverDialog.id = row.id; deliverDialog.orderSn = row.orderSn; deliverDialog.visible = true; };
const submitDeliver = () => { deliverFormRef.value?.validate(async (valid) => { if (!valid) return; deliverSubmitting.value = true; try { await deliverOrder(deliverDialog.id, { actionDeliveryVoucherText: deliverForm.value.actionDeliveryVoucherText, actionDeliveryVoucherOssIds: Array.isArray(deliverForm.value.actionDeliveryVoucherOssIds) ? deliverForm.value.actionDeliveryVoucherOssIds.join(',') : deliverForm.value.actionDeliveryVoucherOssIds, actionDeliveryVoucherUrls: deliverForm.value.actionDeliveryVoucherUrls }); proxy?.$modal.msgSuccess('\u53D1\u8D27\u6210\u529F'); closeDeliverDialog(); await getList(); } finally { deliverSubmitting.value = false; } }); };
const closeRefundDialog = () => { refundDialog.visible = false; refundDialog.id = ''; refundDialog.orderSn = ''; refundDialog.payAmount = 0; refundForm.value = { actionRefundAmount: 0, actionRefundRemark: '' }; refundFormRef.value?.clearValidate(); };
const handleApplyRefund = (row: OrderVO) => { refundDialog.id = row.id; refundDialog.orderSn = row.orderSn; refundDialog.payAmount = Number(row.payAmount || 0); refundForm.value = { actionRefundAmount: Number(row.payAmount || 0), actionRefundRemark: '' }; refundDialog.visible = true; };
const submitRefund = () => { refundFormRef.value?.validate(async (valid) => { if (!valid) return; refundSubmitting.value = true; try { await applyRefund(refundDialog.id, refundForm.value); proxy?.$modal.msgSuccess('\u9000\u6B3E\u7533\u8BF7\u5DF2\u63D0\u4EA4'); closeRefundDialog(); await getList(); } finally { refundSubmitting.value = false; } }); };
const closeRefundAuditDialog = () => { refundAuditDialog.visible = false; refundAuditDialog.id = ''; refundAuditDialog.orderSn = ''; refundAuditDialog.refundAmount = 0; refundAuditForm.value = { actionRefundAuditStatus: '2', actionRefundAuditRemark: '' }; refundAuditFormRef.value?.clearValidate(); };
const handleAuditRefund = (row: OrderVO) => { refundAuditDialog.id = row.id; refundAuditDialog.orderSn = row.orderSn; refundAuditDialog.refundAmount = Number(row.refundAmount || row.payAmount || 0); refundAuditForm.value = { actionRefundAuditStatus: '2', actionRefundAuditRemark: '' }; refundAuditDialog.visible = true; };
const submitRefundAudit = () => { refundAuditFormRef.value?.validate(async (valid) => { if (!valid) return; refundAuditSubmitting.value = true; try { await auditRefund(refundAuditDialog.id, refundAuditForm.value); proxy?.$modal.msgSuccess('\u9000\u6B3E\u5BA1\u6838\u5B8C\u6210'); closeRefundAuditDialog(); await getList(); } finally { refundAuditSubmitting.value = false; } }); };
const closeComplaintDialog = () => { complaintDialog.visible = false; complaintDialog.id = ''; complaintDialog.orderSn = ''; complaintForm.value = { actionComplaintContent: '' }; complaintFormRef.value?.clearValidate(); };
const handleApplyComplaint = (row: OrderVO) => { complaintDialog.id = row.id; complaintDialog.orderSn = row.orderSn; complaintForm.value = { actionComplaintContent: '' }; complaintDialog.visible = true; };
const submitComplaint = () => { complaintFormRef.value?.validate(async (valid) => { if (!valid) return; complaintSubmitting.value = true; try { await applyComplaint(complaintDialog.id, complaintForm.value); proxy?.$modal.msgSuccess('\u6295\u8BC9\u5DF2\u63D0\u4EA4'); closeComplaintDialog(); await getList(); } finally { complaintSubmitting.value = false; } }); };
const closeComplaintHandleDialog = () => { complaintHandleDialog.visible = false; complaintHandleDialog.id = ''; complaintHandleDialog.orderSn = ''; complaintHandleDialog.content = ''; complaintHandleForm.value = { actionComplaintHandleRemark: '' }; complaintHandleFormRef.value?.clearValidate(); };
const handleComplaintProcess = (row: OrderVO) => { complaintHandleDialog.id = row.id; complaintHandleDialog.orderSn = row.orderSn; complaintHandleDialog.content = row.complaintContent || ''; complaintHandleForm.value = { actionComplaintHandleRemark: '' }; complaintHandleDialog.visible = true; };
const submitComplaintHandle = () => { complaintHandleFormRef.value?.validate(async (valid) => { if (!valid) return; complaintHandleSubmitting.value = true; try { await handleComplaint(complaintHandleDialog.id, complaintHandleForm.value); proxy?.$modal.msgSuccess('\u6295\u8BC9\u5904\u7406\u5B8C\u6210'); closeComplaintHandleDialog(); await getList(); } finally { complaintHandleSubmitting.value = false; } }); };
const handleReceive = async (row: OrderVO) => { await proxy?.$modal.confirm(`\u786E\u8BA4\u8BA2\u5355\u201C${row.orderSn}\u201D\u5DF2\u6536\u8D27\u5E76\u5B8C\u6210\u7ED3\u7B97\u5417\uFF1F`); await confirmReceive(row.id); proxy?.$modal.msgSuccess('\u8BA2\u5355\u5DF2\u5B8C\u6210'); await getList(); };
const handleRunAutoCancel = async () => { await proxy?.$modal.confirm('\u786E\u8BA4\u6267\u884C\u8D85\u65F6\u672A\u652F\u4ED8\u8BA2\u5355\u81EA\u52A8\u53D6\u6D88\u5417\uFF1F'); const res = await autoCancelOrder(); proxy?.$modal.msgSuccess(`\u5904\u7406\u5B8C\u6210\uFF0C\u672C\u6B21\u5171\u53D6\u6D88 ${res.data || 0} \u7B14\u8BA2\u5355`); await getList(); };
const handleRunAutoReceive = async () => { await proxy?.$modal.confirm('\u786E\u8BA4\u6267\u884C\u8D85\u65F6\u672A\u6536\u8D27\u8BA2\u5355\u81EA\u52A8\u6536\u8D27\u5417\uFF1F'); const res = await autoReceiveOrder(); proxy?.$modal.msgSuccess(`\u5904\u7406\u5B8C\u6210\uFF0C\u672C\u6B21\u5171\u81EA\u52A8\u6536\u8D27 ${res.data || 0} \u7B14\u8BA2\u5355`); await getList(); };
const handleDelete = async (row?: OrderVO) => { const deleteIds = row?.id ? [row.id] : ids.value; if (!deleteIds.length) return; await proxy?.$modal.confirm(`\u786E\u8BA4\u5220\u9664\u8BA2\u5355 ${deleteIds.join(', ')} \u5417\uFF1F`); await delOrder(deleteIds); proxy?.$modal.msgSuccess('\u5220\u9664\u6210\u529F'); await getList(); };
const handleExport = () => { proxy?.download('mall/order/export', { ...queryParams.value }, `mall_order_${Date.now()}.xlsx`); };
const formatCount = (value?: number) => Number(value || 0).toLocaleString('zh-CN');
const formatCurrency = (value?: number | string) => `\u00A5${Number(value || 0).toFixed(2)}`;
const formatDateTime = (value?: string) => value || '-';
onMounted(() => { getList(); });
</script>

<style scoped lang="scss">
.order-page { display: flex; flex-direction: column; gap: 16px; padding: 16px; min-height: calc(100vh - 84px); background: #f6f8fb; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.summary-card, .panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04); }
.summary-card { padding: 18px 20px; min-height: 124px; }
.summary-card--blue { background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%); }
.summary-card--green { background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%); }
.summary-card--amber { background: linear-gradient(180deg, #ffffff 0%, #fff7ed 100%); }
.summary-card--violet { background: linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%); }
.summary-card__label { color: #64748b; font-size: 13px; }
.summary-card__value { display: block; margin-top: 10px; color: #0f172a; font-size: 28px; line-height: 1.1; font-weight: 700; }
.summary-card__hint { display: block; margin-top: 8px; color: #94a3b8; font-size: 12px; line-height: 1.5; }
.search-panel { padding: 16px 18px 2px; }
.list-panel { padding: 14px 16px 4px; }
.search-form :deep(.el-form-item) { margin-bottom: 14px; }
.field-sm { width: 180px; }
.field-md { width: 240px; }
.search-actions { margin-left: auto; }
.panel-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.panel-title { font-size: 18px; font-weight: 600; color: #1f2937; }
.panel-subtitle { margin-top: 4px; font-size: 13px; color: #6b7280; }
.panel-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.view-tabs { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.view-tabs--secondary { margin-top: -2px; }
.view-tab { display: inline-flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: 1px solid #e5e7eb; background: #f8fafc; color: #475569; cursor: pointer; transition: all 0.2s ease; }
.view-tab:hover { border-color: #bfdbfe; color: #2563eb; }
.view-tab--active { border-color: #93c5fd; background: linear-gradient(180deg, #ffffff 0%, #dbeafe 100%); color: #1d4ed8; }
.view-tab--metric.view-tab--active { border-color: #c7d2fe; background: linear-gradient(180deg, #f8fafc 0%, #e0e7ff 100%); color: #4338ca; }
.view-tab__label { font-size: 13px; font-weight: 600; }
.view-tab__count { display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 22px; padding: 0 8px; border-radius: 999px; background: rgba(255,255,255,0.8); font-size: 12px; font-weight: 700; }
.order-table :deep(.el-table__cell) { padding: 14px 0; }
.order-main { display: flex; gap: 14px; align-items: flex-start; }
.order-main__cover { width: 72px; height: 72px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #eef2ff; }
.order-main__empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 12px; }
.order-main__content, .stack-text { display: flex; flex-direction: column; gap: 6px; }
.order-main__title-row { display: flex; align-items: center; gap: 8px; }
.order-main__title { font-size: 15px; font-weight: 600; color: #111827; }
.order-main__sub, .order-main__meta, .muted-text { font-size: 13px; color: #6b7280; line-height: 1.5; }
.price-text { color: #dc2626; font-weight: 700; }
.tag-list { display: flex; gap: 8px; flex-wrap: wrap; }
.action-list { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; }
.detail-hero { display: flex; gap: 16px; margin-bottom: 16px; padding: 16px; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e5e7eb; border-radius: 10px; }
.detail-hero__cover { width: 128px; height: 128px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: #eef2ff; }
.detail-hero__content { display: flex; flex: 1; flex-direction: column; gap: 10px; min-width: 0; }
.detail-hero__head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.detail-hero__title { color: #0f172a; font-size: 20px; font-weight: 700; line-height: 1.4; }
.detail-hero__meta { color: #64748b; font-size: 13px; line-height: 1.6; }
.detail-progress { margin-top: auto; padding: 12px 14px; background: #fff; border: 1px dashed #cbd5e1; border-radius: 8px; }
.detail-progress__title { color: #334155; font-size: 12px; font-weight: 600; }
.detail-progress__text { margin-top: 6px; color: #0f172a; font-size: 14px; font-weight: 600; }
.detail-progress__hint { margin-top: 4px; color: #64748b; font-size: 12px; line-height: 1.5; }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
.detail-card { padding: 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; }
.card-title { margin-bottom: 14px; color: #0f172a; font-size: 15px; font-weight: 600; }
.detail-items { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 16px; }
.detail-item { display: flex; flex-direction: column; gap: 6px; }
.detail-item--full { grid-column: 1 / -1; }
.detail-label { color: #94a3b8; font-size: 12px; }
.detail-value { color: #0f172a; font-size: 14px; line-height: 1.6; }
.detail-image-list { display: flex; gap: 10px; flex-wrap: wrap; }
.detail-image { width: 92px; height: 92px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; overflow: hidden; }
.drawer-form { padding-right: 8px; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
.drawer-footer { display: flex; justify-content: flex-end; gap: 12px; }
.field-tip { margin-top: 8px; color: #94a3b8; font-size: 12px; line-height: 1.5; }
@media (max-width: 1200px) { .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 992px) { .detail-hero, .detail-grid, .detail-items, .form-grid { grid-template-columns: 1fr; } .detail-hero { flex-direction: column; } }
@media (max-width: 768px) { .order-page { padding: 12px; } .summary-grid { grid-template-columns: 1fr; } .panel-header { flex-direction: column; align-items: flex-start; } .panel-actions { width: 100%; } .field-sm, .field-md { width: 100%; } }
</style>

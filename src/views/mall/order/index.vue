<template>
  <div class="order-page">
    <section v-loading="summaryLoading" class="summary-grid">
      <article class="summary-card summary-card--blue">
        <span class="summary-card__label">订单总数</span>
        <strong class="summary-card__value">{{ formatCount(summary.total) }}</strong>
        <span class="summary-card__hint">当前筛选范围内的订单总量</span>
      </article>
      <article class="summary-card summary-card--green">
        <span class="summary-card__label">支付金额</span>
        <strong class="summary-card__value">{{ formatCurrency(summary.payAmount) }}</strong>
        <span class="summary-card__hint">已支付订单金额合计</span>
      </article>
      <article class="summary-card summary-card--amber">
        <span class="summary-card__label">待处理订单</span>
        <strong class="summary-card__value">{{ formatCount(summary.pendingHandle) }}</strong>
        <span class="summary-card__hint">待支付、待发货、待收货合计</span>
      </article>
      <article class="summary-card summary-card--violet">
        <span class="summary-card__label">已完成订单</span>
        <strong class="summary-card__value">{{ formatCount(summary.finished) }}</strong>
        <span class="summary-card__hint">已经完成并结算的订单</span>
      </article>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="panel search-panel">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="search-form">
          <el-form-item label="订单号" prop="orderSn">
            <el-input v-model="queryParams.orderSn" class="field-sm" clearable placeholder="请输入订单号" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="商品名称" prop="goodsName">
            <el-input v-model="queryParams.goodsName" class="field-md" clearable placeholder="请输入商品名称" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="买家ID" prop="buyerUserId">
            <el-input v-model="queryParams.buyerUserId" class="field-sm" clearable placeholder="请输入买家ID" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="卖家ID" prop="sellerUserId">
            <el-input v-model="queryParams.sellerUserId" class="field-sm" clearable placeholder="请输入卖家ID" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="订单状态" prop="orderStatus">
            <el-select v-model="queryParams.orderStatus" class="field-sm" clearable placeholder="全部状态">
              <el-option v-for="dict in mall_order_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
          <div class="panel-title">订单列表</div>
          <div class="panel-subtitle">共 {{ total }} 条记录</div>
        </div>
        <div class="panel-actions">
          <el-button v-hasPermi="['mall:order:autoCancel']" icon="Clock" plain @click="handleRunAutoCancel">超时取消</el-button>
          <el-button v-hasPermi="['mall:order:autoReceive']" icon="Select" plain @click="handleRunAutoReceive">自动收货</el-button>
          <el-button v-hasPermi="['mall:order:export']" icon="Download" plain @click="handleExport">导出</el-button>
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

      <el-table v-loading="loading" :data="displayOrderList" class="order-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed="left" type="selection" width="50" />
        <el-table-column fixed="left" label="订单信息" min-width="360">
          <template #default="{ row }">
            <div class="order-main">
              <el-image :src="getFirstImage(row.goodsGalleryUrls)" class="order-main__cover" fit="cover">
                <template #error><div class="order-main__empty">暂无图片</div></template>
              </el-image>
              <div class="order-main__content">
                <div class="order-main__title-row">
                  <span class="order-main__title">{{ row.goodsName || emptyOrderName }}</span>
                  <dict-tag :options="mall_order_status" :round="true" :value="row.orderStatus" theme="light" />
                  <dict-tag
                    v-if="row.refundStatus && row.refundStatus !== '0'"
                    :options="mall_order_refund_status"
                    :round="true"
                    :value="row.refundStatus"
                    theme="plain"
                  />
                  <dict-tag
                    v-if="row.complaintStatus && row.complaintStatus !== '0'"
                    :options="mall_order_complaint_status"
                    :round="true"
                    :value="row.complaintStatus"
                    theme="plain"
                  />
                </div>
                <div class="order-main__sub">订单号：{{ row.orderSn || '-' }}</div>
                <div class="order-main__meta">买家 {{ row.buyerUserId || '-' }} / 卖家 {{ row.sellerUserId || row.createBy || '-' }}</div>
                <div class="tag-list">
                  <el-tag v-for="item in splitCommaText(row.serviceTags)" :key="item" effect="plain" size="small">{{ item }}</el-tag>
                  <el-tag v-for="item in splitCommaText(row.serviceRegions)" :key="item" effect="plain" size="small" type="warning">{{
                    item
                  }}</el-tag>
                  <span v-if="!splitCommaText(row.serviceTags).length && !splitCommaText(row.serviceRegions).length" class="muted-text"
                    >暂无标签</span
                  >
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="right" label="金额信息" width="180">
          <template #default="{ row }">
            <div class="stack-text">
              <span class="price-text">{{ formatCurrency(row.payAmount) }}</span>
              <span class="muted-text">单价 {{ formatCurrency(row.price) }}</span>
              <span class="muted-text">{{ getPayTypeLabel(row.payType) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="履约进度" min-width="240">
          <template #default="{ row }">
            <div class="stack-text">
              <span>{{ getProgressText(row) }}</span>
              <span class="muted-text">{{ getDeadlineText(row) }}</span>
              <span v-if="row.deliveryVoucherText" class="muted-text">发货凭证：{{ row.deliveryVoucherText }}</span>
              <span v-if="row.refundStatus && row.refundStatus !== '0'" class="muted-text"
                >退款状态：{{ getRefundStatusLabel(row.refundStatus) }}</span
              >
              <span v-if="row.complaintStatus && row.complaintStatus !== '0'" class="muted-text"
                >投诉状态：{{ getComplaintStatusLabel(row.complaintStatus) }}</span
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注信息" min-width="220">
          <template #default="{ row }">
            <div class="stack-text">
              <span class="muted-text">买家：{{ row.buyerRemark || '-' }}</span>
              <span class="muted-text">卖家：{{ row.sellerRemark || '-' }}</span>
              <span class="muted-text">后台：{{ row.adminRemark || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="时间轴" min-width="240">
          <template #default="{ row }">
            <div class="stack-text">
              <span class="muted-text">下单：{{ formatDateTime(row.createTime) }}</span>
              <span class="muted-text">支付：{{ formatDateTime(row.payTime) }}</span>
              <span class="muted-text">发货：{{ formatDateTime(row.deliveryTime) }}</span>
              <span class="muted-text">完成：{{ formatDateTime(row.finishTime) }}</span>
              <span class="muted-text">取消：{{ formatDateTime(row.cancelTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" min-width="240">
          <template #default="{ row }">
            <div class="action-list">
              <el-button v-hasPermi="['mall:order:query']" link type="primary" @click="handleDetail(row)">详情</el-button>
              <el-button v-if="canPay(row)" v-hasPermi="['mall:order:pay']" link type="success" @click="handlePay(row)">支付</el-button>
              <el-button v-if="canDeliver(row)" v-hasPermi="['mall:order:deliver']" link type="warning" @click="handleDeliver(row)">发货</el-button>
              <el-button v-if="canReceive(row)" v-hasPermi="['mall:order:receive']" link type="success" @click="handleReceive(row)"
                >确认收货</el-button
              >
              <el-button v-if="canApplyRefund(row)" v-hasPermi="['mall:order:refundApply']" link type="warning" @click="handleApplyRefund(row)"
                >申请退款</el-button
              >
              <el-button v-if="canAuditRefund(row)" v-hasPermi="['mall:order:refundAudit']" link type="danger" @click="handleAuditRefund(row)"
                >审核退款</el-button
              >
              <el-button
                v-if="canApplyComplaint(row)"
                v-hasPermi="['mall:order:complaintApply']"
                link
                type="danger"
                @click="handleApplyComplaint(row)"
                >提交投诉</el-button
              >
              <el-button
                v-if="canHandleComplaint(row)"
                v-hasPermi="['mall:order:complaintHandle']"
                link
                type="danger"
                @click="handleComplaintProcess(row)"
                >处理投诉</el-button
              >
              <el-button v-hasPermi="['mall:order:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="detailDrawer.visible" :close-on-click-modal="false" size="980px" title="订单详情">
      <section class="detail-hero">
        <el-image
          :preview-src-list="splitCommaText(form.goodsGalleryUrls)"
          :src="getFirstImage(form.goodsGalleryUrls)"
          class="detail-hero__cover"
          fit="cover"
        >
          <template #error><div class="order-main__empty">暂无图片</div></template>
        </el-image>
          <div class="detail-hero__content">
            <div class="detail-hero__head">
              <div class="detail-hero__title">{{ form.goodsName || emptyOrderName }}</div>
              <dict-tag :options="mall_order_status" :round="true" :value="form.orderStatus" theme="light" />
            </div>
          <div class="detail-hero__meta">订单号：{{ form.orderSn || '-' }}</div>
          <div class="detail-hero__meta">
            商品ID：{{ form.goodsId || '-' }} / 买家ID：{{ form.buyerUserId || '-' }} / 卖家ID：{{ form.sellerUserId || form.createBy || '-' }}
          </div>
          <div class="tag-list">
            <el-tag v-for="item in splitCommaText(form.serviceTags)" :key="`detail-tag-${item}`" effect="plain" size="small">{{ item }}</el-tag>
            <el-tag v-for="item in splitCommaText(form.serviceRegions)" :key="`detail-region-${item}`" effect="plain" size="small" type="warning">{{
              item
            }}</el-tag>
          </div>
          <div class="detail-progress">
            <div class="detail-progress__title">当前进度</div>
            <div class="detail-progress__text">{{ getProgressText(form as OrderVO) }}</div>
            <div class="detail-progress__hint">{{ getDeadlineText(form as OrderVO) }}</div>
          </div>
        </div>
      </section>
      <div class="detail-grid">
        <section class="detail-card">
          <div class="card-title">基础信息</div>
          <div class="detail-items">
            <div class="detail-item">
              <span class="detail-label">订单号</span><span class="detail-value">{{ form.orderSn || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">订单状态</span
              ><span class="detail-value"><dict-tag :options="mall_order_status" :round="true" :value="form.orderStatus" theme="light" /></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">商品ID</span><span class="detail-value">{{ form.goodsId || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">支付方式</span>
              <span class="detail-value"><dict-tag :options="mall_order_pay_type" :round="true" :value="form.payType" theme="plain" /></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">买家ID</span><span class="detail-value">{{ form.buyerUserId || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">卖家ID</span><span class="detail-value">{{ form.sellerUserId || form.createBy || '-' }}</span>
            </div>
            <div class="detail-item detail-item--full">
              <span class="detail-label">商品名称</span><span class="detail-value">{{ form.goodsName || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">服务标签</span>
              <div class="tag-list">
                <el-tag v-for="item in splitCommaText(form.serviceTags)" :key="item" effect="plain" size="small">{{ item }}</el-tag
                ><span v-if="!splitCommaText(form.serviceTags).length" class="muted-text">暂无</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-label">服务区服</span>
              <div class="tag-list">
                <el-tag v-for="item in splitCommaText(form.serviceRegions)" :key="item" effect="plain" size="small" type="warning">{{ item }}</el-tag
                ><span v-if="!splitCommaText(form.serviceRegions).length" class="muted-text">暂无</span>
              </div>
            </div>
          </div>
        </section>
        <section class="detail-card">
          <div class="card-title">流程时间</div>
          <div class="detail-items">
            <div class="detail-item">
              <span class="detail-label">下单时间</span><span class="detail-value">{{ formatDateTime(form.createTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">支付截止</span><span class="detail-value">{{ formatDateTime(form.payExpireTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">支付时间</span><span class="detail-value">{{ formatDateTime(form.payTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">发货时间</span><span class="detail-value">{{ formatDateTime(form.deliveryTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">收货截止</span><span class="detail-value">{{ formatDateTime(form.receiveExpireTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">完成时间</span><span class="detail-value">{{ formatDateTime(form.finishTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">取消时间</span><span class="detail-value">{{ formatDateTime(form.cancelTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">结算时间</span><span class="detail-value">{{ formatDateTime(form.settleTime) }}</span>
            </div>
          </div>
        </section>
        <section class="detail-card">
          <div class="card-title">金额与结算</div>
          <div class="detail-items">
            <div class="detail-item">
              <span class="detail-label">商品单价</span><span class="detail-value">{{ formatCurrency(form.price) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">实付金额</span><span class="detail-value price-text">{{ formatCurrency(form.payAmount) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">结算状态</span
              ><span class="detail-value"><dict-tag :options="mall_order_settle_status" :round="true" :value="form.settleStatus" theme="light" /></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">系统状态</span><span class="detail-value"><dict-tag :options="sys_normal_disable" :round="true" :value="form.status" theme="plain" /></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">退款金额</span><span class="detail-value">{{ formatCurrency(form.refundAmount) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">退款时间</span><span class="detail-value">{{ formatDateTime(form.refundTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">退款状态</span
              ><span class="detail-value"><dict-tag :options="mall_order_refund_status" :round="true" :value="form.refundStatus" theme="plain" /></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">退款申请时间</span><span class="detail-value">{{ formatDateTime(form.refundApplyTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">退款审核时间</span><span class="detail-value">{{ formatDateTime(form.refundAuditTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">退款审核说明</span><span class="detail-value">{{ form.refundAuditRemark || '-' }}</span>
            </div>
            <div class="detail-item detail-item--full">
              <span class="detail-label">退款说明</span><span class="detail-value">{{ form.refundRemark || '-' }}</span>
            </div>
          </div>
        </section>
        <section class="detail-card">
          <div class="card-title">发货与凭证</div>
          <div class="detail-items">
            <div class="detail-item">
              <span class="detail-label">发货方式</span>
              <span class="detail-value"><dict-tag :options="mall_order_delivery_type" :round="true" :value="form.deliveryType" theme="plain" /></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">发货时间</span><span class="detail-value">{{ formatDateTime(form.deliveryTime) }}</span>
            </div>
            <div class="detail-item detail-item--full">
              <span class="detail-label">凭证说明</span><span class="detail-value">{{ form.deliveryVoucherText || '-' }}</span>
            </div>
            <div class="detail-item detail-item--full">
              <span class="detail-label">凭证图片</span>
              <div v-if="splitCommaText(form.deliveryVoucherUrls).length" class="detail-image-list">
                <el-image
                  v-for="item in splitCommaText(form.deliveryVoucherUrls)"
                  :key="item"
                  :preview-src-list="splitCommaText(form.deliveryVoucherUrls)"
                  :src="item"
                  class="detail-image"
                  fit="cover"
                />
              </div>
              <span v-else class="muted-text">暂无凭证图片</span>
            </div>
          </div>
        </section>
        <section class="detail-card">
          <div class="card-title">投诉与售后</div>
          <div class="detail-items">
            <div class="detail-item">
              <span class="detail-label">投诉状态</span
              ><span class="detail-value"><dict-tag :options="mall_order_complaint_status" :round="true" :value="form.complaintStatus" theme="plain" /></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">投诉时间</span><span class="detail-value">{{ formatDateTime(form.complaintTime) }}</span>
            </div>
            <div class="detail-item detail-item--full">
              <span class="detail-label">投诉内容</span><span class="detail-value">{{ form.complaintContent || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">处理时间</span><span class="detail-value">{{ formatDateTime(form.complaintHandleTime) }}</span>
            </div>
            <div class="detail-item detail-item--full">
              <span class="detail-label">处理说明</span><span class="detail-value">{{ form.complaintHandleRemark || '-' }}</span>
            </div>
          </div>
        </section>
      </div>
      <el-form :model="form" class="drawer-form" label-position="top">
        <div class="form-grid">
          <el-form-item label="实付金额"><el-input :model-value="formatCurrency(form.payAmount)" readonly /></el-form-item>
          <el-form-item label="支付方式"><el-input :model-value="getPayTypeLabel(form.payType)" readonly /></el-form-item>
        </div>
        <el-form-item label="订单跟进提示"><el-input :model-value="getDeadlineText(form as OrderVO)" readonly /></el-form-item>
        <el-form-item label="买家备注"><el-input :model-value="form.buyerRemark || '-'" readonly /></el-form-item>
        <el-form-item label="卖家备注"
          ><el-input v-model="form.sellerRemark" :rows="2" maxlength="200" placeholder="请输入卖家备注" show-word-limit type="textarea"
        /></el-form-item>
        <el-form-item label="后台备注"
          ><el-input v-model="form.adminRemark" :rows="2" maxlength="200" placeholder="请输入后台备注" show-word-limit type="textarea"
        /></el-form-item>
        <el-form-item label="通用备注"
          ><el-input v-model="form.remark" :rows="3" maxlength="300" placeholder="请输入通用备注" show-word-limit type="textarea"
        /></el-form-item>
        <div class="drawer-footer">
          <el-button @click="detailDrawer.visible = false">关闭</el-button
          ><el-button v-hasPermi="['mall:order:update']" :loading="detailSubmitting" type="primary" @click="submitDetail">保存备注</el-button>
        </div>
      </el-form>
    </el-drawer>

    <el-dialog v-model="payDialog.visible" append-to-body title="订单支付" width="460px">
      <el-form ref="payFormRef" :model="payForm" :rules="payRules" label-position="top">
        <el-form-item label="订单号"><el-input :model-value="payDialog.orderSn" readonly /></el-form-item>
        <el-form-item label="支付金额"><el-input :model-value="formatCurrency(payDialog.payAmount)" readonly /></el-form-item>
        <el-form-item label="支付方式" prop="actionPayType">
          <el-radio-group v-model="payForm.actionPayType">
            <el-radio-button v-for="dict in mall_order_pay_type" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer
        ><div class="drawer-footer">
          <el-button @click="closePayDialog">取消</el-button
          ><el-button :loading="paySubmitting" type="primary" @click="submitPay">确认支付</el-button>
        </div></template
      >
    </el-dialog>

    <el-dialog v-model="deliverDialog.visible" append-to-body title="订单发货" width="680px">
      <el-form ref="deliverFormRef" :model="deliverForm" :rules="deliverRules" class="drawer-form" label-position="top">
        <el-form-item label="订单号"><el-input :model-value="deliverDialog.orderSn" readonly /></el-form-item>
        <el-form-item label="发货方式"><el-input :model-value="getDeliveryTypeLabel('no_logistics')" readonly /></el-form-item>
        <el-form-item label="发货凭证说明" prop="actionDeliveryVoucherText">
          <el-input
            v-model="deliverForm.actionDeliveryVoucherText"
            :rows="3"
            maxlength="200"
            placeholder="请输入发货凭证说明，可填写账号、联系信息或服务完成说明"
            show-word-limit
            type="textarea"
          />
        </el-form-item>
        <el-form-item label="发货凭证图片">
          <image-upload v-model="deliverForm.actionDeliveryVoucherOssIds" :limit="3" />
          <div class="field-tip">可以上传截图作为发货凭证，文字说明和图片二选一即可，也可以同时填写。</div>
        </el-form-item>
      </el-form>
      <template #footer
        ><div class="drawer-footer">
          <el-button @click="closeDeliverDialog">取消</el-button
          ><el-button :loading="deliverSubmitting" type="primary" @click="submitDeliver">确认发货</el-button>
        </div></template
      >
    </el-dialog>

    <el-dialog v-model="refundDialog.visible" append-to-body title="申请退款" width="520px">
      <el-form ref="refundFormRef" :model="refundForm" :rules="refundRules" label-position="top">
        <el-form-item label="订单号"><el-input :model-value="refundDialog.orderSn" readonly /></el-form-item>
        <el-form-item label="可退金额"><el-input :model-value="formatCurrency(refundDialog.payAmount)" readonly /></el-form-item>
        <el-form-item label="申请退款金额" prop="actionRefundAmount"
          ><el-input-number v-model="refundForm.actionRefundAmount" :min="0" :precision="2" :step="1" controls-position="right" style="width: 100%"
        /></el-form-item>
        <el-form-item label="退款说明" prop="actionRefundRemark"
          ><el-input v-model="refundForm.actionRefundRemark" :rows="3" maxlength="300" show-word-limit type="textarea"
        /></el-form-item>
      </el-form>
      <template #footer
        ><div class="drawer-footer">
          <el-button @click="closeRefundDialog">取消</el-button
          ><el-button :loading="refundSubmitting" type="primary" @click="submitRefund">提交申请</el-button>
        </div></template
      >
    </el-dialog>

    <el-dialog v-model="refundAuditDialog.visible" append-to-body title="审核退款" width="520px">
      <el-form ref="refundAuditFormRef" :model="refundAuditForm" :rules="refundAuditRules" label-position="top">
        <el-form-item label="订单号"><el-input :model-value="refundAuditDialog.orderSn" readonly /></el-form-item>
        <el-form-item label="申请退款金额"><el-input :model-value="formatCurrency(refundAuditDialog.refundAmount)" readonly /></el-form-item>
        <el-form-item label="审核结果" prop="actionRefundAuditStatus">
          <el-radio-group v-model="refundAuditForm.actionRefundAuditStatus">
            <el-radio-button label="2">通过</el-radio-button>
            <el-radio-button label="3">驳回</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核说明" prop="actionRefundAuditRemark"
          ><el-input v-model="refundAuditForm.actionRefundAuditRemark" :rows="3" maxlength="300" show-word-limit type="textarea"
        /></el-form-item>
      </el-form>
      <template #footer
        ><div class="drawer-footer">
          <el-button @click="closeRefundAuditDialog">取消</el-button
          ><el-button :loading="refundAuditSubmitting" type="primary" @click="submitRefundAudit">确认审核</el-button>
        </div></template
      >
    </el-dialog>

    <el-dialog v-model="complaintDialog.visible" append-to-body title="提交投诉" width="520px">
      <el-form ref="complaintFormRef" :model="complaintForm" :rules="complaintRules" label-position="top">
        <el-form-item label="订单号"><el-input :model-value="complaintDialog.orderSn" readonly /></el-form-item>
        <el-form-item label="投诉内容" prop="actionComplaintContent"
          ><el-input v-model="complaintForm.actionComplaintContent" :rows="4" maxlength="500" show-word-limit type="textarea"
        /></el-form-item>
      </el-form>
      <template #footer
        ><div class="drawer-footer">
          <el-button @click="closeComplaintDialog">取消</el-button
          ><el-button :loading="complaintSubmitting" type="primary" @click="submitComplaint">提交投诉</el-button>
        </div></template
      >
    </el-dialog>

    <el-dialog v-model="complaintHandleDialog.visible" append-to-body title="处理投诉" width="520px">
      <el-form ref="complaintHandleFormRef" :model="complaintHandleForm" :rules="complaintHandleRules" label-position="top">
        <el-form-item label="订单号"><el-input :model-value="complaintHandleDialog.orderSn" readonly /></el-form-item>
        <el-form-item label="投诉内容"><el-input :model-value="complaintHandleDialog.content" :rows="3" readonly type="textarea" /></el-form-item>
        <el-form-item label="处理说明" prop="actionComplaintHandleRemark"
          ><el-input v-model="complaintHandleForm.actionComplaintHandleRemark" :rows="4" maxlength="500" show-word-limit type="textarea"
        /></el-form-item>
      </el-form>
      <template #footer
        ><div class="drawer-footer">
          <el-button @click="closeComplaintHandleDialog">取消</el-button
          ><el-button :loading="complaintHandleSubmitting" type="primary" @click="submitComplaintHandle">确认处理</el-button>
        </div></template
      >
    </el-dialog>
  </div>
</template>

<script lang="ts" name="Order" setup>
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import ImageUpload from '@/components/ImageUpload/index.vue';
import {
  applyComplaint,
  applyRefund,
  auditRefund,
  autoCancelOrder,
  autoReceiveOrder,
  confirmReceive,
  deliverOrder,
  delOrder,
  getOrder,
  handleComplaint,
  listOrder,
  payOrder,
  updateOrder
} from '@/api/mall/order';
import type { OrderForm, OrderQuery, OrderVO } from '@/api/mall/order/types';
import { FormRules } from 'element-plus';

type QuickTabValue = 'all' | 'pending' | 'processing' | 'finished';
type MetricTabValue = 'all' | '101' | '201' | '301' | '401' | '501' | '102';
interface SummaryState {
  total: number;
  payAmount: number;
  pendingHandle: number;
  finished: number;
  pendingPay: number;
  pendingDelivery: number;
  pendingReceive: number;
  cancelled: number;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const {
  sys_normal_disable,
  mall_order_status,
  mall_order_pay_type,
  mall_order_delivery_type,
  mall_order_refund_status,
  mall_order_complaint_status,
  mall_order_settle_status
} = toRefs<any>(
  proxy?.useDict(
    'sys_normal_disable',
    'mall_order_status',
    'mall_order_pay_type',
    'mall_order_delivery_type',
    'mall_order_refund_status',
    'mall_order_complaint_status',
    'mall_order_settle_status'
  )
);
const emptyOrderName = '未命名订单';
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
const initFormData = (): OrderForm => ({
  id: undefined,
  orderSn: '',
  buyerUserId: undefined,
  sellerUserId: undefined,
  goodsId: undefined,
  goodsName: '',
  goodsGalleryUrls: '',
  price: 0,
  payAmount: 0,
  payType: '',
  serviceRegions: '',
  serviceTags: '',
  buyerRemark: '',
  sellerRemark: '',
  adminRemark: '',
  orderStatus: '',
  payExpireTime: '',
  deliveryType: '',
  deliveryVoucherText: '',
  deliveryVoucherOssIds: [],
  deliveryVoucherUrls: '',
  deliveryTime: '',
  receiveExpireTime: '',
  settleStatus: '',
  settleTime: '',
  refundAmount: 0,
  refundRemark: '',
  refundStatus: '0',
  refundApplyTime: '',
  refundAuditTime: '',
  refundAuditRemark: '',
  payTime: '',
  finishTime: '',
  cancelTime: '',
  refundTime: '',
  complaintStatus: '0',
  complaintContent: '',
  complaintTime: '',
  complaintHandleRemark: '',
  complaintHandleTime: '',
  status: '0',
  remark: '',
  actionPayType: 'balance',
  actionDeliveryVoucherText: '',
  actionDeliveryVoucherOssIds: [],
  actionDeliveryVoucherUrls: '',
  actionRefundAmount: 0,
  actionRefundRemark: '',
  actionRefundAuditStatus: '2',
  actionRefundAuditRemark: '',
  actionComplaintContent: '',
  actionComplaintHandleRemark: ''
});
const summary = ref<SummaryState>({
  total: 0,
  payAmount: 0,
  pendingHandle: 0,
  finished: 0,
  pendingPay: 0,
  pendingDelivery: 0,
  pendingReceive: 0,
  cancelled: 0
});
const data = reactive<{ form: OrderForm; queryParams: OrderQuery }>({
  form: initFormData(),
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderSn: undefined,
    buyerUserId: undefined,
    sellerUserId: undefined,
    goodsName: undefined,
    orderStatus: undefined
  }
});
const payForm = ref<OrderForm>({ actionPayType: 'balance' });
const deliverForm = ref<OrderForm>({ actionDeliveryVoucherText: '', actionDeliveryVoucherOssIds: [], actionDeliveryVoucherUrls: '' });
const refundForm = ref<OrderForm>({ actionRefundAmount: 0, actionRefundRemark: '' });
const refundAuditForm = ref<OrderForm>({ actionRefundAuditStatus: '2', actionRefundAuditRemark: '' });
const complaintForm = ref<OrderForm>({ actionComplaintContent: '' });
const complaintHandleForm = ref<OrderForm>({ actionComplaintHandleRemark: '' });
const payRules: FormRules = { actionPayType: [{ required: true, message: '请选择支付方式', trigger: 'change' }] };
const deliverRules: FormRules = {
  actionDeliveryVoucherText: [
    {
      validator: (_rule, value, callback) => {
        const hasText = !!String(value || '').trim();
        const hasImages = Array.isArray(deliverForm.value.actionDeliveryVoucherOssIds)
          ? deliverForm.value.actionDeliveryVoucherOssIds.length > 0
          : !!deliverForm.value.actionDeliveryVoucherOssIds;
        if (!hasText && !hasImages) {
          callback(new Error('请填写发货凭证说明或上传发货凭证图片'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }
  ]
};
const refundRules: FormRules = {
  actionRefundAmount: [{ required: true, message: '请输入退款金额', trigger: 'blur' }],
  actionRefundRemark: [{ required: true, message: '请输入退款说明', trigger: 'blur' }]
};
const refundAuditRules: FormRules = {
  actionRefundAuditStatus: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
  actionRefundAuditRemark: [{ required: true, message: '请输入审核说明', trigger: 'blur' }]
};
const complaintRules: FormRules = {
  actionComplaintContent: [{ required: true, message: '请输入投诉内容', trigger: 'blur' }]
};
const complaintHandleRules: FormRules = {
  actionComplaintHandleRemark: [{ required: true, message: '请输入处理说明', trigger: 'blur' }]
};
const { queryParams, form } = toRefs(data);
const quickTabs = computed(() => [
  { label: '全部订单', value: 'all' as QuickTabValue, count: formatCount(summary.value.total) },
  { label: '待处理', value: 'pending' as QuickTabValue, count: formatCount(summary.value.pendingHandle) },
  {
    label: '处理中',
    value: 'processing' as QuickTabValue,
    count: formatCount(summary.value.pendingDelivery + summary.value.pendingReceive)
  },
  { label: '已完成', value: 'finished' as QuickTabValue, count: formatCount(summary.value.finished) }
]);
const metricTabs = computed(() => [
  { label: '全部状态', value: 'all' as MetricTabValue, count: formatCount(summary.value.total) },
  { label: '待支付', value: '101' as MetricTabValue, count: formatCount(summary.value.pendingPay) },
  { label: '待发货', value: '201' as MetricTabValue, count: formatCount(summary.value.pendingDelivery) },
  { label: '待收货', value: '301' as MetricTabValue, count: formatCount(summary.value.pendingReceive) },
  { label: '已完成', value: '401' as MetricTabValue, count: formatCount(summary.value.finished) },
  {
    label: '已退款',
    value: '501' as MetricTabValue,
    count: formatCount(orderList.value.filter((item) => item.orderStatus === '501').length)
  },
  { label: '已取消', value: '102' as MetricTabValue, count: formatCount(summary.value.cancelled) }
]);
const displayOrderList = computed(() => {
  let list = [...orderList.value];
  if (activeMetricTab.value !== 'all') list = list.filter((item) => item.orderStatus === activeMetricTab.value);
  if (activeQuickTab.value === 'pending') list = list.filter((item) => ['101', '201', '301'].includes(item.orderStatus));
  else if (activeQuickTab.value === 'processing') list = list.filter((item) => ['201', '301'].includes(item.orderStatus));
  else if (activeQuickTab.value === 'finished') list = list.filter((item) => item.orderStatus === '401');
  return list;
});
const splitCommaText = (value?: string) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
const getFirstImage = (value?: string) => splitCommaText(value)[0] || '';
const getDictLabel = (options: DictDataOption[], value?: string | number, defaultLabel = '-') => {
  const match = options?.find((item) => String(item.value) === String(value ?? ''));
  return match?.label || defaultLabel;
};

const getOrderStatusLabel = (status?: string) => getDictLabel(mall_order_status.value || [], status, '未知状态');
const getPayTypeLabel = (payType?: string) => getDictLabel(mall_order_pay_type.value || [], payType, payType || '未支付');
const getSettleStatusLabel = (status?: string) => getDictLabel(mall_order_settle_status.value || [], status, '未结算');
const getDeliveryTypeLabel = (deliveryType?: string) =>
  getDictLabel(mall_order_delivery_type.value || [], deliveryType, deliveryType || '未发货');
const getRefundStatusLabel = (status?: string) => getDictLabel(mall_order_refund_status.value || [], status, '未申请');
const getComplaintStatusLabel = (status?: string) => getDictLabel(mall_order_complaint_status.value || [], status, '未投诉');
const getProgressText = (row: OrderVO) =>
  ({
    '101': '订单已创建，等待买家支付',
    '102': '订单已取消',
    '201': '支付完成，等待服务商发货',
    '301': '已发货，等待买家确认收货',
    '401': '订单已完成，金额已结算给服务商',
    '501': '订单已退款，售后处理已完成'
  })[row.orderStatus] || '状态未知';
const getDeadlineText = (row: OrderVO) =>
  row.refundStatus === '1'
    ? '订单已提交退款申请，等待后台审核'
    : row.complaintStatus === '1'
      ? '订单已提交投诉，等待客服处理'
      : row.orderStatus === '101'
        ? row.payExpireTime
          ? `请在 ${formatDateTime(row.payExpireTime)} 前完成支付`
          : '待支付'
        : row.orderStatus === '301'
          ? row.receiveExpireTime
            ? `请在 ${formatDateTime(row.receiveExpireTime)} 前确认收货，超时系统自动收货`
            : '待收货'
          : row.orderStatus === '201'
            ? '支付成功后等待服务商发货'
            : '-';
const canPay = (row: OrderVO) => row.orderStatus === '101';
const canDeliver = (row: OrderVO) => row.orderStatus === '201';
const canReceive = (row: OrderVO) => row.orderStatus === '301';
const canApplyRefund = (row: OrderVO) => ['201', '301', '401'].includes(row.orderStatus) && row.refundStatus !== '1' && row.orderStatus !== '501';
const canAuditRefund = (row: OrderVO) => row.refundStatus === '1';
const canApplyComplaint = (row: OrderVO) => ['401', '501'].includes(row.orderStatus) && row.complaintStatus !== '1';
const canHandleComplaint = (row: OrderVO) => row.complaintStatus === '1';
const buildSummary = (list: OrderVO[]) => {
  const nextSummary: SummaryState = {
    total: total.value,
    payAmount: 0,
    pendingHandle: 0,
    finished: 0,
    pendingPay: 0,
    pendingDelivery: 0,
    pendingReceive: 0,
    cancelled: 0
  };
  list.forEach((item) => {
    if (['201', '301', '401'].includes(item.orderStatus)) nextSummary.payAmount += Number(item.payAmount || 0);
    if (item.orderStatus === '101') nextSummary.pendingPay += 1;
    if (item.orderStatus === '201') nextSummary.pendingDelivery += 1;
    if (item.orderStatus === '301') nextSummary.pendingReceive += 1;
    if (item.orderStatus === '401') nextSummary.finished += 1;
    if (item.orderStatus === '102') nextSummary.cancelled += 1;
  });
  nextSummary.pendingHandle = nextSummary.pendingPay + nextSummary.pendingDelivery + nextSummary.pendingReceive;
  summary.value = nextSummary;
};
const getList = async () => {
  loading.value = true;
  summaryLoading.value = true;
  try {
    const res = await listOrder(queryParams.value);
    orderList.value = res.rows || [];
    total.value = res.total || 0;
    buildSummary(orderList.value);
  } finally {
    loading.value = false;
    summaryLoading.value = false;
  }
};
const reset = () => {
  data.form = initFormData();
};
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  activeQuickTab.value = 'all';
  activeMetricTab.value = 'all';
  handleQuery();
};
const handleQuickTabChange = (tab: QuickTabValue) => {
  activeQuickTab.value = tab;
  activeMetricTab.value = tab === 'finished' ? '401' : tab === 'pending' ? '101' : 'all';
};
const handleMetricTabChange = (tab: MetricTabValue) => {
  activeMetricTab.value = tab;
  activeQuickTab.value = tab === '401' ? 'finished' : ['101', '201', '301'].includes(tab) ? (tab === '101' ? 'pending' : 'processing') : 'all';
};
const handleSelectionChange = (selection: OrderVO[]) => {
  ids.value = selection.map((item) => item.id);
};
const handleDetail = async (row: OrderVO) => {
  reset();
  const res = await getOrder(row.id);
  data.form = { ...initFormData(), ...res.data, deliveryVoucherOssIds: splitCommaText(res.data.deliveryVoucherOssIds) };
  detailDrawer.visible = true;
};
const submitDetail = async () => {
  detailSubmitting.value = true;
  try {
    await updateOrder({
      id: form.value.id,
      sellerRemark: form.value.sellerRemark,
      adminRemark: form.value.adminRemark,
      remark: form.value.remark,
      refundAmount: form.value.refundAmount,
      refundRemark: form.value.refundRemark,
      status: form.value.status
    });
    proxy?.$modal.msgSuccess('保存成功');
    detailDrawer.visible = false;
    await getList();
  } finally {
    detailSubmitting.value = false;
  }
};
const closePayDialog = () => {
  payDialog.visible = false;
  payDialog.id = '';
  payDialog.orderSn = '';
  payDialog.payAmount = 0;
  payForm.value = { actionPayType: 'balance' };
  payFormRef.value?.clearValidate();
};
const handlePay = (row: OrderVO) => {
  payDialog.id = row.id;
  payDialog.orderSn = row.orderSn;
  payDialog.payAmount = Number(row.payAmount || 0);
  payForm.value = { actionPayType: 'balance' };
  payDialog.visible = true;
};
const submitPay = () => {
  payFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    paySubmitting.value = true;
    try {
      await payOrder(payDialog.id, payForm.value.actionPayType || 'balance');
      proxy?.$modal.msgSuccess('支付成功');
      closePayDialog();
      await getList();
    } finally {
      paySubmitting.value = false;
    }
  });
};
const closeDeliverDialog = () => {
  deliverDialog.visible = false;
  deliverDialog.id = '';
  deliverDialog.orderSn = '';
  deliverForm.value = { actionDeliveryVoucherText: '', actionDeliveryVoucherOssIds: [], actionDeliveryVoucherUrls: '' };
  deliverFormRef.value?.clearValidate();
};
const handleDeliver = (row: OrderVO) => {
  deliverDialog.id = row.id;
  deliverDialog.orderSn = row.orderSn;
  deliverDialog.visible = true;
};
const submitDeliver = () => {
  deliverFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    deliverSubmitting.value = true;
    try {
      await deliverOrder(deliverDialog.id, {
        actionDeliveryVoucherText: deliverForm.value.actionDeliveryVoucherText,
        actionDeliveryVoucherOssIds: Array.isArray(deliverForm.value.actionDeliveryVoucherOssIds)
          ? deliverForm.value.actionDeliveryVoucherOssIds.join(',')
          : deliverForm.value.actionDeliveryVoucherOssIds,
        actionDeliveryVoucherUrls: deliverForm.value.actionDeliveryVoucherUrls
      });
      proxy?.$modal.msgSuccess('发货成功');
      closeDeliverDialog();
      await getList();
    } finally {
      deliverSubmitting.value = false;
    }
  });
};
const closeRefundDialog = () => {
  refundDialog.visible = false;
  refundDialog.id = '';
  refundDialog.orderSn = '';
  refundDialog.payAmount = 0;
  refundForm.value = { actionRefundAmount: 0, actionRefundRemark: '' };
  refundFormRef.value?.clearValidate();
};
const handleApplyRefund = (row: OrderVO) => {
  refundDialog.id = row.id;
  refundDialog.orderSn = row.orderSn;
  refundDialog.payAmount = Number(row.payAmount || 0);
  refundForm.value = { actionRefundAmount: Number(row.payAmount || 0), actionRefundRemark: '' };
  refundDialog.visible = true;
};
const submitRefund = () => {
  refundFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    refundSubmitting.value = true;
    try {
      await applyRefund(refundDialog.id, refundForm.value);
      proxy?.$modal.msgSuccess('退款申请已提交');
      closeRefundDialog();
      await getList();
    } finally {
      refundSubmitting.value = false;
    }
  });
};
const closeRefundAuditDialog = () => {
  refundAuditDialog.visible = false;
  refundAuditDialog.id = '';
  refundAuditDialog.orderSn = '';
  refundAuditDialog.refundAmount = 0;
  refundAuditForm.value = { actionRefundAuditStatus: '2', actionRefundAuditRemark: '' };
  refundAuditFormRef.value?.clearValidate();
};
const handleAuditRefund = (row: OrderVO) => {
  refundAuditDialog.id = row.id;
  refundAuditDialog.orderSn = row.orderSn;
  refundAuditDialog.refundAmount = Number(row.refundAmount || row.payAmount || 0);
  refundAuditForm.value = { actionRefundAuditStatus: '2', actionRefundAuditRemark: '' };
  refundAuditDialog.visible = true;
};
const submitRefundAudit = () => {
  refundAuditFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    refundAuditSubmitting.value = true;
    try {
      await auditRefund(refundAuditDialog.id, refundAuditForm.value);
      proxy?.$modal.msgSuccess('退款审核完成');
      closeRefundAuditDialog();
      await getList();
    } finally {
      refundAuditSubmitting.value = false;
    }
  });
};
const closeComplaintDialog = () => {
  complaintDialog.visible = false;
  complaintDialog.id = '';
  complaintDialog.orderSn = '';
  complaintForm.value = { actionComplaintContent: '' };
  complaintFormRef.value?.clearValidate();
};
const handleApplyComplaint = (row: OrderVO) => {
  complaintDialog.id = row.id;
  complaintDialog.orderSn = row.orderSn;
  complaintForm.value = { actionComplaintContent: '' };
  complaintDialog.visible = true;
};
const submitComplaint = () => {
  complaintFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    complaintSubmitting.value = true;
    try {
      await applyComplaint(complaintDialog.id, complaintForm.value);
      proxy?.$modal.msgSuccess('投诉已提交');
      closeComplaintDialog();
      await getList();
    } finally {
      complaintSubmitting.value = false;
    }
  });
};
const closeComplaintHandleDialog = () => {
  complaintHandleDialog.visible = false;
  complaintHandleDialog.id = '';
  complaintHandleDialog.orderSn = '';
  complaintHandleDialog.content = '';
  complaintHandleForm.value = { actionComplaintHandleRemark: '' };
  complaintHandleFormRef.value?.clearValidate();
};
const handleComplaintProcess = (row: OrderVO) => {
  complaintHandleDialog.id = row.id;
  complaintHandleDialog.orderSn = row.orderSn;
  complaintHandleDialog.content = row.complaintContent || '';
  complaintHandleForm.value = { actionComplaintHandleRemark: '' };
  complaintHandleDialog.visible = true;
};
const submitComplaintHandle = () => {
  complaintHandleFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    complaintHandleSubmitting.value = true;
    try {
      await handleComplaint(complaintHandleDialog.id, complaintHandleForm.value);
      proxy?.$modal.msgSuccess('投诉处理完成');
      closeComplaintHandleDialog();
      await getList();
    } finally {
      complaintHandleSubmitting.value = false;
    }
  });
};
const handleReceive = async (row: OrderVO) => {
  await proxy?.$modal.confirm(`确认订单“${row.orderSn}”已收货并完成结算吗？`);
  await confirmReceive(row.id);
  proxy?.$modal.msgSuccess('订单已完成');
  await getList();
};
const handleRunAutoCancel = async () => {
  await proxy?.$modal.confirm('确认执行超时未支付订单自动取消吗？');
  const res = await autoCancelOrder();
  proxy?.$modal.msgSuccess(`处理完成，本次共取消 ${res.data || 0} 笔订单`);
  await getList();
};
const handleRunAutoReceive = async () => {
  await proxy?.$modal.confirm('确认执行超时未收货订单自动收货吗？');
  const res = await autoReceiveOrder();
  proxy?.$modal.msgSuccess(`处理完成，本次共自动收货 ${res.data || 0} 笔订单`);
  await getList();
};
const handleDelete = async (row?: OrderVO) => {
  const deleteIds = row?.id ? [row.id] : ids.value;
  if (!deleteIds.length) return;
  await proxy?.$modal.confirm(`确认删除订单 ${deleteIds.join(', ')} 吗？`);
  await delOrder(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};
const handleExport = () => {
  proxy?.download('mall/order/export', { ...queryParams.value }, `mall_order_${Date.now()}.xlsx`);
};
const formatCount = (value?: number) => Number(value || 0).toLocaleString('zh-CN');
const formatCurrency = (value?: number | string) => `¥${Number(value || 0).toFixed(2)}`;
const formatDateTime = (value?: string) => value || '-';
onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.order-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  min-height: calc(100vh - 84px);
  background: #f6f8fb;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.summary-card,
.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}
.summary-card {
  padding: 18px 20px;
  min-height: 124px;
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
.list-panel {
  padding: 14px 16px 4px;
}
.search-form :deep(.el-form-item) {
  margin-bottom: 14px;
}
.field-sm {
  width: 180px;
}
.field-md {
  width: 240px;
}
.search-actions {
  margin-left: auto;
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
  gap: 8px;
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
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}
.view-tab:hover {
  border-color: #bfdbfe;
  color: #2563eb;
}
.view-tab--active {
  border-color: #93c5fd;
  background: linear-gradient(180deg, #ffffff 0%, #dbeafe 100%);
  color: #1d4ed8;
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
  min-width: 26px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 700;
}
.order-table :deep(.el-table__cell) {
  padding: 14px 0;
}
.order-main {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.order-main__cover {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #eef2ff;
}
.order-main__empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 12px;
}
.order-main__content,
.stack-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.order-main__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.order-main__title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}
.order-main__sub,
.order-main__meta,
.muted-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}
.price-text {
  color: #dc2626;
  font-weight: 700;
}
.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.action-list {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.detail-hero {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}
.detail-hero__cover {
  width: 128px;
  height: 128px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: #eef2ff;
}
.detail-hero__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.detail-hero__head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.detail-hero__title {
  color: #0f172a;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
}
.detail-hero__meta {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}
.detail-progress {
  margin-top: auto;
  padding: 12px 14px;
  background: #fff;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
}
.detail-progress__title {
  color: #334155;
  font-size: 12px;
  font-weight: 600;
}
.detail-progress__text {
  margin-top: 6px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
}
.detail-progress__hint {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}
.detail-card {
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}
.card-title {
  margin-bottom: 14px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 600;
}
.detail-items {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.detail-item--full {
  grid-column: 1 / -1;
}
.detail-label {
  color: #94a3b8;
  font-size: 12px;
}
.detail-value {
  color: #0f172a;
  font-size: 14px;
  line-height: 1.6;
}
.detail-image-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.detail-image {
  width: 92px;
  height: 92px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  overflow: hidden;
}
.drawer-form {
  padding-right: 8px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.field-tip {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}
@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 992px) {
  .detail-hero,
  .detail-grid,
  .detail-items,
  .form-grid {
    grid-template-columns: 1fr;
  }
  .detail-hero {
    flex-direction: column;
  }
}
@media (max-width: 768px) {
  .order-page {
    padding: 12px;
  }
  .summary-grid {
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
}
</style>

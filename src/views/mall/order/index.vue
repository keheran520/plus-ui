<template>
  <div class="mall-order-page">
    <section class="summary-grid" v-loading="summaryLoading">
      <article class="summary-card summary-card--blue">
        <span class="summary-card__label">订单总量</span>
        <strong class="summary-card__value">{{ formatCount(summary.total) }}</strong>
        <span class="summary-card__hint">当前筛选条件下的订单数量</span>
      </article>
      <article class="summary-card summary-card--green">
        <span class="summary-card__label">实付金额</span>
        <strong class="summary-card__value">{{ formatCurrency(summary.payAmount) }}</strong>
        <span class="summary-card__hint">按当前页列表统计的实付金额</span>
      </article>
      <article class="summary-card summary-card--amber">
        <span class="summary-card__label">已完成</span>
        <strong class="summary-card__value">{{ formatCount(summary.finished) }}</strong>
        <span class="summary-card__hint">当前状态已完成的订单数</span>
      </article>
      <article class="summary-card summary-card--violet">
        <span class="summary-card__label">退款金额</span>
        <strong class="summary-card__value">{{ formatCurrency(summary.refundAmount) }}</strong>
        <span class="summary-card__hint">退款相关订单的金额合计</span>
      </article>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="订单号" prop="orderSn">
            <el-input v-model="queryParams.orderSn" class="field-sm" clearable placeholder="请输入订单号" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="商品名称" prop="goodsName">
            <el-input v-model="queryParams.goodsName" class="field-md" clearable placeholder="请输入商品名称" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="买家ID" prop="buyerUserId">
            <el-input v-model="queryParams.buyerUserId" class="field-sm" clearable placeholder="请输入买家ID" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="订单状态" prop="orderStatus">
            <el-select v-model="queryParams.orderStatus" class="field-sm" clearable placeholder="全部状态">
              <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="filter-actions">
            <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </section>
    </transition>

    <section class="list-panel">
      <header class="panel-toolbar">
        <div class="toolbar-title">
          <span class="title-text">订单列表</span>
          <span class="title-meta">{{ total }} 条记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['mall:order:edit']" plain type="success" icon="Edit" :disabled="single" @click="handleUpdate()">批量处理</el-button>
          <el-button v-hasPermi="['mall:order:remove']" plain type="danger" icon="Delete" :disabled="multiple" @click="handleDelete()">批量删除</el-button>
          <el-button v-hasPermi="['mall:order:export']" plain icon="Download" @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <div class="table-summary">
        <span>待支付 {{ formatCount(summary.pending) }}</span>
        <span>处理中 {{ formatCount(summary.processing) }}</span>
        <span>已取消 {{ formatCount(summary.cancelled) }}</span>
        <span>退款中/已退款 {{ formatCount(summary.refunded) }}</span>
      </div>

      <el-table v-loading="loading" :data="orderList" class="order-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" fixed="left" />
        <el-table-column label="订单信息" min-width="340" fixed="left">
          <template #default="{ row }">
            <div class="order-info-cell">
              <el-image class="goods-cover" :src="getFirstImage(row.goodsGalleryUrls)" fit="cover">
                <template #error>
                  <div class="goods-cover__placeholder">暂无图片</div>
                </template>
              </el-image>
              <div class="order-meta">
                <div class="order-title-row">
                  <span class="order-title">{{ row.goodsName || '未命名商品' }}</span>
                  <el-tag :type="getOrderStatusType(row.orderStatus)" effect="light" round>{{ getOrderStatusLabel(row.orderStatus) }}</el-tag>
                </div>
                <div class="order-sub">订单号 {{ row.orderSn || '-' }}</div>
                <div class="order-sub">商品ID {{ row.goodsId || '-' }} / 买家ID {{ row.buyerUserId || '-' }}</div>
                <div class="tag-group">
                  <el-tag v-for="tag in splitCommaText(row.serviceTags)" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
                  <el-tag v-for="region in splitCommaText(row.serviceRegions)" :key="region" size="small" effect="plain" type="warning">{{ region }}</el-tag>
                  <span v-if="!splitCommaText(row.serviceTags).length && !splitCommaText(row.serviceRegions).length" class="empty-text">暂无标签与区服</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额信息" width="180" align="right">
          <template #default="{ row }">
            <div class="amount-block">
              <span class="amount-text amount-text--danger">实付 {{ formatCurrency(row.payAmount) }}</span>
              <span class="amount-text">单价 {{ formatCurrency(row.price) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注信息" min-width="220">
          <template #default="{ row }">
            <div class="remark-block">
              <span>买家：{{ row.buyerRemark || '-' }}</span>
              <span>卖家：{{ row.sellerRemark || '-' }}</span>
              <span>后台：{{ row.adminRemark || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="退款信息" width="180" align="left">
          <template #default="{ row }">
            <div class="refund-block">
              <span class="amount-text">{{ formatCurrency(row.refundAmount) }}</span>
              <span class="refund-remark">{{ row.refundRemark || '无退款说明' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="时间轴" width="220" align="left">
          <template #default="{ row }">
            <div class="time-block">
              <span>支付：{{ formatDateTime(row.payTime) }}</span>
              <span>完成：{{ formatDateTime(row.finishTime) }}</span>
              <span>取消：{{ formatDateTime(row.cancelTime) }}</span>
              <span>退款：{{ formatDateTime(row.refundTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-hasPermi="['mall:order:query']" link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button v-hasPermi="['mall:order:edit']" link type="primary" @click="handleUpdate(row)">处理</el-button>
            <el-button v-hasPermi="['mall:order:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="drawer.visible" :title="drawer.title" size="880px" :close-on-click-modal="false">
      <div class="detail-grid">
        <section class="detail-card">
          <div class="card-title">基础信息</div>
          <div class="detail-items">
            <div class="detail-item">
              <span class="detail-label">订单号</span>
              <span class="detail-value">{{ form.orderSn || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">订单状态</span>
              <span class="detail-value">
                <el-tag :type="getOrderStatusType(form.orderStatus)" effect="light" round>{{ getOrderStatusLabel(form.orderStatus) }}</el-tag>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">买家ID</span>
              <span class="detail-value">{{ form.buyerUserId || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">商品ID</span>
              <span class="detail-value">{{ form.goodsId || '-' }}</span>
            </div>
            <div class="detail-item detail-item--full">
              <span class="detail-label">商品名称</span>
              <span class="detail-value">{{ form.goodsName || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">服务标签</span>
              <div class="detail-tags">
                <el-tag v-for="tag in splitCommaText(form.serviceTags)" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
                <span v-if="!splitCommaText(form.serviceTags).length" class="empty-text">暂无</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-label">服务区服</span>
              <div class="detail-tags">
                <el-tag v-for="region in splitCommaText(form.serviceRegions)" :key="region" size="small" effect="plain" type="warning">{{ region }}</el-tag>
                <span v-if="!splitCommaText(form.serviceRegions).length" class="empty-text">暂无</span>
              </div>
            </div>
          </div>
        </section>

        <section class="detail-card">
          <div class="card-title">金额与时间</div>
          <div class="detail-items">
            <div class="detail-item">
              <span class="detail-label">单价</span>
              <span class="detail-value">{{ formatCurrency(form.price) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">实付金额</span>
              <span class="detail-value detail-value--danger">{{ formatCurrency(form.payAmount) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">退款金额</span>
              <span class="detail-value">{{ formatCurrency(form.refundAmount) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">系统状态</span>
              <span class="detail-value">{{ form.status === '0' ? '正常' : '停用' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">支付时间</span>
              <span class="detail-value">{{ formatDateTime(form.payTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">完成时间</span>
              <span class="detail-value">{{ formatDateTime(form.finishTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">取消时间</span>
              <span class="detail-value">{{ formatDateTime(form.cancelTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">退款时间</span>
              <span class="detail-value">{{ formatDateTime(form.refundTime) }}</span>
            </div>
          </div>
        </section>
      </div>

      <el-form v-if="drawer.mode === 'edit'" ref="orderFormRef" :model="form" :rules="rules" label-position="top" class="drawer-form">
        <div class="form-grid">
          <el-form-item label="订单状态" prop="orderStatus">
            <el-select v-model="form.orderStatus" placeholder="请选择订单状态" style="width: 100%">
              <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="系统状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio-button label="0">正常</el-radio-button>
              <el-radio-button label="1">停用</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="退款金额" prop="refundAmount">
            <el-input-number v-model="form.refundAmount" :min="0" :precision="2" :step="1" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="退款时间">
            <el-date-picker v-model="form.refundTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择退款时间" style="width: 100%" />
          </el-form-item>
        </div>

        <el-form-item label="卖家备注">
          <el-input v-model="form.sellerRemark" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="请输入卖家备注" />
        </el-form-item>
        <el-form-item label="后台备注">
          <el-input v-model="form.adminRemark" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="请输入后台备注" />
        </el-form-item>
        <el-form-item label="退款说明">
          <el-input v-model="form.refundRemark" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="请输入退款说明" />
        </el-form-item>
        <el-form-item label="通用备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="300" show-word-limit placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="cancel">关闭</el-button>
          <el-button v-if="drawer.mode === 'edit'" type="primary" :loading="buttonLoading" @click="submitForm">保存处理结果</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="Order" lang="ts">
import { getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import type { ElFormInstance } from 'element-plus';
import { delOrder, getOrder, listOrder, updateOrder } from '@/api/mall/order';
import type { OrderForm, OrderQuery, OrderVO } from '@/api/mall/order/types';

interface SummaryState {
  total: number;
  payAmount: number;
  refundAmount: number;
  pending: number;
  processing: number;
  finished: number;
  cancelled: number;
  refunded: number;
}

type DrawerMode = 'detail' | 'edit';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const orderList = ref<OrderVO[]>([]);
const loading = ref(false);
const summaryLoading = ref(false);
const buttonLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);

const queryFormRef = ref<ElFormInstance>();
const orderFormRef = ref<ElFormInstance>();

const drawer = reactive({
  visible: false,
  title: '',
  mode: 'detail' as DrawerMode
});

const orderStatusOptions = [
  { label: '待支付', value: '101' },
  { label: '用户取消', value: '102' },
  { label: '系统取消', value: '103' },
  { label: '已支付拼团中', value: '200' },
  { label: '已支付', value: '201' },
  { label: '申请退款', value: '202' },
  { label: '已退款', value: '203' },
  { label: '拼团超时', value: '204' },
  { label: '已发货', value: '301' },
  { label: '用户收货', value: '401' },
  { label: '系统收货', value: '402' }
];

const initFormData: OrderForm = {
  id: undefined,
  orderSn: undefined,
  buyerUserId: undefined,
  goodsId: undefined,
  goodsName: undefined,
  goodsGalleryUrls: undefined,
  price: undefined,
  payAmount: undefined,
  serviceRegions: undefined,
  serviceTags: undefined,
  buyerRemark: undefined,
  sellerRemark: undefined,
  adminRemark: undefined,
  orderStatus: '101',
  refundAmount: 0,
  refundRemark: undefined,
  payTime: undefined,
  finishTime: undefined,
  cancelTime: undefined,
  refundTime: undefined,
  status: '0',
  remark: undefined
};

const data = reactive<PageData<OrderForm, OrderQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderSn: undefined,
    buyerUserId: undefined,
    goodsName: undefined,
    orderStatus: undefined,
    params: {}
  },
  rules: {
    orderStatus: [{ required: true, message: '请选择订单状态', trigger: 'change' }]
  }
});

const summary = ref<SummaryState>({
  total: 0,
  payAmount: 0,
  refundAmount: 0,
  pending: 0,
  processing: 0,
  finished: 0,
  cancelled: 0,
  refunded: 0
});

const { queryParams, form, rules } = toRefs(data);

const splitCommaText = (value?: string) => {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

const getFirstImage = (value?: string) => splitCommaText(value)[0] || '';

const buildSummary = () => {
  const list = orderList.value;
  summary.value = {
    total: total.value,
    payAmount: list.reduce((sum, item) => sum + Number(item.payAmount || 0), 0),
    refundAmount: list.reduce((sum, item) => sum + Number(item.refundAmount || 0), 0),
    pending: list.filter(item => ['101'].includes(String(item.orderStatus || ''))).length,
    processing: list.filter(item => ['200', '201', '301'].includes(String(item.orderStatus || ''))).length,
    finished: list.filter(item => ['401', '402'].includes(String(item.orderStatus || ''))).length,
    cancelled: list.filter(item => ['102', '103', '204'].includes(String(item.orderStatus || ''))).length,
    refunded: list.filter(item => ['202', '203'].includes(String(item.orderStatus || ''))).length
  };
};

const getList = async () => {
  loading.value = true;
  summaryLoading.value = true;
  try {
    const res = await listOrder(queryParams.value);
    orderList.value = res.rows || [];
    total.value = res.total || 0;
    buildSummary();
  } finally {
    loading.value = false;
    summaryLoading.value = false;
  }
};

const reset = () => {
  Object.assign(form.value, initFormData);
  orderFormRef.value?.clearValidate();
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
  handleQuery();
};

const handleSelectionChange = (selection: OrderVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const openDrawer = async (mode: DrawerMode, row?: OrderVO) => {
  reset();
  const currentId = row?.id || ids.value[0];
  const res = await getOrder(currentId);
  Object.assign(form.value, initFormData, res.data);
  drawer.visible = true;
  drawer.mode = mode;
  drawer.title = mode === 'edit' ? '处理订单' : '订单详情';
};

const handleDetail = async (row: OrderVO) => {
  await openDrawer('detail', row);
};

const handleUpdate = async (row?: OrderVO) => {
  await openDrawer('edit', row);
};

const submitForm = () => {
  orderFormRef.value?.validate(async valid => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      await updateOrder(form.value);
      proxy?.$modal.msgSuccess('保存成功');
      drawer.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const handleDelete = async (row?: OrderVO) => {
  const currentIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除订单 "${row?.orderSn || currentIds}"？`);
  await delOrder(currentIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

const handleExport = () => {
  proxy?.download(
    'mall/order/export',
    {
      ...queryParams.value
    },
    `order_${Date.now()}.xlsx`
  );
};

const getOrderStatusLabel = (value?: string) => orderStatusOptions.find(item => item.value === value)?.label || '未知状态';

const getOrderStatusType = (value?: string) => {
  if (['401', '402'].includes(String(value || ''))) {
    return 'success';
  }
  if (['102', '103', '202', '203', '204'].includes(String(value || ''))) {
    return 'danger';
  }
  if (['200', '201', '301'].includes(String(value || ''))) {
    return 'warning';
  }
  return 'info';
};

const formatCount = (value?: number | string) => Number(value || 0).toLocaleString('zh-CN');
const formatCurrency = (value?: number | string) => `¥${Number(value || 0).toFixed(2)}`;
const formatDateTime = (value?: string) => value || '-';

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.mall-order-page {
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
  gap: 12px;
}

.summary-card {
  padding: 16px;
  min-height: 124px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.summary-card--blue { background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%); }
.summary-card--green { background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%); }
.summary-card--amber { background: linear-gradient(180deg, #ffffff 0%, #fff7ed 100%); }
.summary-card--violet { background: linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%); }

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

.filter-panel,
.list-panel {
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.filter-panel {
  padding: 16px 18px 2px;
}

.list-panel {
  padding: 14px 16px 4px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.field-sm {
  width: 180px;
}

.field-md {
  width: 240px;
}

.filter-actions {
  margin-left: auto;
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
  gap: 10px;
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

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.table-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

.order-table :deep(.el-table__cell) {
  padding: 14px 0;
}

.order-info-cell {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.goods-cover {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  flex-shrink: 0;
  overflow: hidden;
  background: #eef2ff;
}

.goods-cover__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  color: #94a3b8;
}

.order-meta,
.amount-block,
.remark-block,
.refund-block,
.time-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.order-sub,
.remark-block span,
.time-block span,
.refund-remark,
.empty-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.amount-text {
  font-weight: 600;
  color: #111827;
}

.amount-text--danger,
.detail-value--danger {
  color: #dc2626;
}

.tag-group,
.detail-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  border: 1px solid #e2e8f0;
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

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .detail-grid,
  .detail-items,
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .mall-order-page {
    padding: 12px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .panel-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-actions {
    width: 100%;
  }

  .field-sm,
  .field-md {
    width: 100%;
  }
}
</style>

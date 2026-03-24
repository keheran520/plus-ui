<template>
  <div v-loading="pageLoading" class="seller-detail-page">
    <section class="detail-shell">
      <header class="detail-header">
        <div class="header-top">
          <el-button class="back-button" text @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回服务商列表
          </el-button>
        </div>

        <div class="hero-panel">
          <div class="hero-profile">
            <el-avatar :size="68" :src="detail.user?.avatar" class="seller-avatar">
              {{ sellerDisplayName.slice(0, 1) }}
            </el-avatar>
            <div class="hero-body">
              <div class="hero-title">
                <h1>{{ sellerDisplayName }}</h1>
                <el-tag :type="detail.status === '0' ? 'success' : 'danger'" effect="light" round>{{ systemStatusLabel }}</el-tag>
                <el-tag :type="getServiceStatusType(detail.serviceStatus)" effect="light" round>{{ serviceStatusLabel }}</el-tag>
                <el-tag :type="getVerifyStatusType(detail.verifyStatus)" effect="light" round>{{ verifyStatusLabel }}</el-tag>
              </div>
              <div class="hero-meta">
                <span>服务商ID {{ detail.id || '-' }}</span>
                <span>会员ID {{ detail.memberId || '-' }}</span>
                <span>用户ID {{ detail.userId || '-' }}</span>
                <span>创建时间 {{ detail.createTime || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="hero-side">
            <div class="hero-side-card">
              <span>推荐状态</span>
              <strong>{{ detail.featuredFlag === '1' ? '推荐服务商' : '普通服务商' }}</strong>
              <small>排序值 {{ detail.sortOrder ?? 0 }}</small>
            </div>
          </div>
        </div>

        <div class="metric-row">
          <div class="metric-card">
            <span>商品数量</span>
            <strong>{{ formatCount(detail.goodsCount) }}</strong>
          </div>
          <div class="metric-card">
            <span>上架商品</span>
            <strong>{{ formatCount(detail.onSaleGoodsCount) }}</strong>
          </div>
          <div class="metric-card">
            <span>待处理订单</span>
            <strong>{{ formatCount(detail.pendingOrderCount) }}</strong>
          </div>
          <div class="metric-card">
            <span>累计成交</span>
            <strong>{{ formatCurrency(detail.totalSalesAmount) }}</strong>
          </div>
        </div>
      </header>

      <section class="content-grid">
        <article class="panel">
          <header class="panel-header">
            <h3>服务商资料</h3>
          </header>
          <div class="info-grid">
            <div v-for="item in sellerItems" :key="item.label" class="info-item">
              <span class="info-item__label">{{ item.label }}</span>
              <span class="info-item__value">{{ item.value }}</span>
            </div>
          </div>
          <div class="remark-box">
            <span class="info-item__label">服务说明</span>
            <p>{{ detail.serviceNotice || '暂无服务说明' }}</p>
          </div>
          <div class="remark-box">
            <span class="info-item__label">运营备注</span>
            <p>{{ detail.adminRemark || '暂无运营备注' }}</p>
          </div>
          <div class="remark-box">
            <span class="info-item__label">通用备注</span>
            <p>{{ detail.remark || '暂无备注' }}</p>
          </div>
        </article>

        <article class="panel">
          <header class="panel-header">
            <h3>会员资料</h3>
          </header>
          <div class="info-grid">
            <div v-for="item in memberItems" :key="item.label" class="info-item">
              <span class="info-item__label">{{ item.label }}</span>
              <span class="info-item__value">{{ item.value }}</span>
            </div>
          </div>
          <div class="remark-box">
            <span class="info-item__label">会员简介</span>
            <p>{{ detail.member?.signature || '暂无会员简介' }}</p>
          </div>
          <div class="remark-box">
            <span class="info-item__label">会员备注</span>
            <p>{{ detail.member?.remark || '暂无会员备注' }}</p>
          </div>
        </article>
      </section>

      <section class="panel">
        <header class="panel-header">
          <h3>用户资料</h3>
        </header>
        <div class="info-grid">
          <div v-for="item in userItems" :key="item.label" class="info-item">
            <span class="info-item__label">{{ item.label }}</span>
            <span class="info-item__value">{{ item.value }}</span>
          </div>
        </div>
      </section>

      <section class="panel">
        <header class="panel-header">
          <h3>经营概览</h3>
        </header>
        <div class="overview-grid">
          <div class="overview-card">
            <span>待处理订单</span>
            <strong>{{ formatCount(detail.pendingOrderCount) }}</strong>
            <small>待支付、待发货、待收货订单总量</small>
          </div>
          <div class="overview-card">
            <span>已完成订单</span>
            <strong>{{ formatCount(detail.finishOrderCount) }}</strong>
            <small>当前服务商已经完成的订单数量</small>
          </div>
          <div class="overview-card">
            <span>退款订单</span>
            <strong>{{ formatCount(detail.refundOrderCount) }}</strong>
            <small>已申请退款或已退款的订单数量</small>
          </div>
          <div class="overview-card">
            <span>最近订单时间</span>
            <strong>{{ detail.lastOrderTime || '-' }}</strong>
            <small>用于判断档案活跃度和最近经营节奏</small>
          </div>
        </div>
      </section>

      <section class="content-grid">
        <article class="panel">
          <header class="panel-header">
            <h3>订单结构图</h3>
          </header>
          <div ref="orderChartRef" class="chart-box"></div>
        </article>

        <article class="panel">
          <header class="panel-header">
            <h3>资产经营对比</h3>
          </header>
          <div ref="businessChartRef" class="chart-box"></div>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <header class="panel-header">
            <h3>经营明细</h3>
          </header>
          <div class="info-grid">
            <div v-for="item in businessItems" :key="item.label" class="info-item">
              <span class="info-item__label">{{ item.label }}</span>
              <span class="info-item__value">{{ item.value }}</span>
            </div>
          </div>
        </article>

        <article class="panel">
          <header class="panel-header">
            <h3>档案关系</h3>
          </header>
          <div class="info-grid">
            <div v-for="item in relationItems" :key="item.label" class="info-item">
              <span class="info-item__label">{{ item.label }}</span>
              <span class="info-item__value">{{ item.value }}</span>
            </div>
          </div>
        </article>
      </section>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ArrowLeft } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSellerProfile } from '@/api/mall/sellerProfile';
import type { SellerProfileVO } from '@/api/mall/sellerProfile/types';
import { formatContactDisplay } from '@/utils/contact';

const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const orderChartRef = ref<HTMLElement>();
const businessChartRef = ref<HTMLElement>();
const detail = ref<SellerProfileVO>({
  id: '',
  memberId: '',
  userId: ''
});
let orderChart: echarts.ECharts | null = null;
let businessChart: echarts.ECharts | null = null;

const sellerDisplayName = computed(() => {
  return detail.value.member?.realName || detail.value.user?.nickName || detail.value.user?.userName || `服务商 ${detail.value.id || ''}`;
});

const serviceStatusLabel = computed(() => getServiceStatusLabel(detail.value.serviceStatus));
const verifyStatusLabel = computed(() => getVerifyStatusLabel(detail.value.verifyStatus));
const systemStatusLabel = computed(() => (detail.value.status === '1' ? '停用' : '正常'));

const sellerItems = computed(() => [
  { label: '服务商名称', value: sellerDisplayName.value },
  { label: '服务状态', value: serviceStatusLabel.value },
  { label: '审核状态', value: verifyStatusLabel.value },
  { label: '推荐状态', value: detail.value.featuredFlag === '1' ? '推荐' : '普通' },
  { label: '系统状态', value: systemStatusLabel.value },
  { label: '排序值', value: detail.value.sortOrder ?? 0 },
  { label: '累计成交金额', value: formatCurrency(detail.value.totalSalesAmount) },
  { label: '最近订单时间', value: detail.value.lastOrderTime || '-' }
]);

const memberItems = computed(() => [
  { label: '会员ID', value: detail.value.memberId || '-' },
  { label: '会员编号', value: detail.value.member?.memberNo || '-' },
  { label: '会员姓名', value: detail.value.member?.realName || '-' },
  { label: '会员等级', value: detail.value.member?.levelName || '-' },
  { label: '等级编码', value: detail.value.member?.levelCode || '-' },
  { label: '会员来源', value: getMemberSourceLabel(detail.value.member?.source) },
  { label: '会员余额', value: formatCurrency(detail.value.member?.balance) },
  { label: '会员积分', value: formatCount(detail.value.member?.points) },
  { label: '成长值', value: formatCount(detail.value.member?.growthValue) },
  { label: '累计消费', value: formatCurrency(detail.value.member?.totalConsumeAmount) },
  { label: '会员状态', value: detail.value.member?.status === '1' ? '冻结' : '正常' },
  { label: '注册时间', value: detail.value.member?.registerTime || '-' },
  { label: '生日', value: detail.value.member?.birthday || '-' },
  { label: '身份证号', value: detail.value.member?.idCard || '-' },
  { label: '地区', value: detail.value.member?.region || '-' },
  { label: '职业', value: detail.value.member?.occupation || '-' },
  { label: '学校', value: detail.value.member?.school || '-' }
]);

const userItems = computed(() => [
  { label: '用户ID', value: detail.value.userId || '-' },
  { label: '用户账号', value: detail.value.user?.userName || '-' },
  { label: '用户昵称', value: detail.value.user?.nickName || '-' },
  { label: '手机号', value: formatContactDisplay(detail.value.user?.phonenumber) },
  { label: '邮箱', value: formatContactDisplay(detail.value.user?.email) },
  { label: '性别', value: getSexLabel(detail.value.user?.sex) },
  { label: '账号状态', value: detail.value.user?.status === '1' ? '停用' : '正常' },
  { label: '部门', value: detail.value.user?.deptName || '-' }
]);

const businessItems = computed(() => [
  { label: '商品数量', value: formatCount(detail.value.goodsCount) },
  { label: '上架商品', value: formatCount(detail.value.onSaleGoodsCount) },
  { label: '待处理订单', value: formatCount(detail.value.pendingOrderCount) },
  { label: '已完成订单', value: formatCount(detail.value.finishOrderCount) },
  { label: '退款订单', value: formatCount(detail.value.refundOrderCount) },
  { label: '累计成交金额', value: formatCurrency(detail.value.totalSalesAmount) }
]);

const relationItems = computed(() => [
  { label: '服务商ID', value: detail.value.id || '-' },
  { label: '会员ID', value: detail.value.memberId || '-' },
  { label: '用户ID', value: detail.value.userId || '-' },
  { label: '服务商名称', value: sellerDisplayName.value },
  { label: '创建时间', value: detail.value.createTime || '-' },
  { label: '最近订单时间', value: detail.value.lastOrderTime || '-' }
]);

async function loadDetail() {
  pageLoading.value = true;
  try {
    const id = route.params.id as string;
    const res = await getSellerProfile(id);
    detail.value = res.data;
    await nextTick();
    renderCharts();
  } finally {
    pageLoading.value = false;
  }
}

function goBack() {
  router.push('/mall/sellerProfile');
}

function getServiceStatusLabel(value?: string) {
  if (value === '1') return '接单中';
  if (value === '2') return '暂停接单';
  return '休息中';
}

function getVerifyStatusLabel(value?: string) {
  if (value === '1') return '审核通过';
  if (value === '2') return '审核驳回';
  return '待审核';
}

function getServiceStatusType(value?: string) {
  if (value === '1') return 'success';
  if (value === '2') return 'warning';
  return 'info';
}

function getVerifyStatusType(value?: string) {
  if (value === '1') return 'success';
  if (value === '2') return 'danger';
  return 'warning';
}

function formatCount(value?: number | string) {
  return Number(value || 0).toLocaleString('zh-CN');
}

function formatCurrency(value?: number | string) {
  return `¥${Number(value || 0).toFixed(2)}`;
}

function renderCharts() {
  renderOrderChart();
  renderBusinessChart();
}

function renderOrderChart() {
  if (!orderChartRef.value) return;
  orderChart = orderChart ?? echarts.init(orderChartRef.value);
  orderChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: {
        color: '#64748b'
      }
    },
    color: ['#2563eb', '#10b981', '#f59e0b'],
    series: [
      {
        name: '订单结构',
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '45%'],
        label: {
          color: '#334155',
          formatter: '{b}\n{c}'
        },
        labelLine: {
          length: 12,
          length2: 10
        },
        data: [
          { value: Number(detail.value.pendingOrderCount || 0), name: '待处理' },
          { value: Number(detail.value.finishOrderCount || 0), name: '已完成' },
          { value: Number(detail.value.refundOrderCount || 0), name: '退款' }
        ]
      }
    ]
  });
}

function renderBusinessChart() {
  if (!businessChartRef.value) return;
  businessChart = businessChart ?? echarts.init(businessChartRef.value);
  businessChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: 24,
      right: 16,
      top: 24,
      bottom: 24,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      }
    },
    yAxis: {
      type: 'category',
      axisLine: { show: false },
      axisTick: { show: false },
      data: ['累计成交', '会员消费', '会员余额', '商品数量', '上架商品']
    },
    series: [
      {
        type: 'bar',
        barWidth: 16,
        data: [
          Number(detail.value.totalSalesAmount || 0),
          Number(detail.value.member?.totalConsumeAmount || 0),
          Number(detail.value.member?.balance || 0),
          Number(detail.value.goodsCount || 0),
          Number(detail.value.onSaleGoodsCount || 0)
        ],
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#60a5fa' },
            { offset: 1, color: '#2563eb' }
          ])
        }
      }
    ]
  });
}

function resizeCharts() {
  orderChart?.resize();
  businessChart?.resize();
}

function getMemberSourceLabel(source?: string) {
  if (source === 'app') return 'APP';
  if (source === 'h5') return 'H5';
  if (source === 'mini') return '小程序';
  if (source === 'pc') return 'PC';
  if (source === 'admin') return '后台添加';
  return '-';
}

function getSexLabel(sex?: string) {
  if (sex === '0') return '男';
  if (sex === '1') return '女';
  if (sex === '2') return '未知';
  return '-';
}

onMounted(loadDetail);

onMounted(() => {
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  orderChart?.dispose();
  businessChart?.dispose();
  orderChart = null;
  businessChart = null;
});
</script>

<style scoped lang="scss">
.seller-detail-page {
  padding: 16px;
  min-height: calc(100vh - 84px);
  background: #f6f8fb;
}

.detail-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-header,
.panel {
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.detail-header {
  padding: 16px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.back-button {
  padding-left: 0;
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 16px;
  align-items: center;
}

.hero-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.seller-avatar {
  background: linear-gradient(135deg, #0f172a, #334155);
  color: #fff;
  font-weight: 700;
}

.hero-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.hero-title h1 {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #64748b;
  font-size: 13px;
}

.hero-side-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%);
  border: 1px solid #dbeafe;
  border-radius: 10px;
}

.hero-side-card span,
.hero-side-card small {
  color: #64748b;
}

.hero-side-card strong {
  color: #0f172a;
  font-size: 18px;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.metric-card span {
  color: #64748b;
  font-size: 13px;
}

.metric-card strong {
  color: #0f172a;
  font-size: 22px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 14px;
}

.panel {
  padding: 16px;
}

.panel-header {
  margin-bottom: 14px;
}

.panel-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.info-item {
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.info-item__label {
  display: block;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 12px;
}

.info-item__value {
  color: #0f172a;
  font-weight: 600;
  word-break: break-word;
}

.remark-box {
  margin-top: 12px;
  padding: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.remark-box p {
  margin: 8px 0 0;
  color: #334155;
  line-height: 1.7;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.overview-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.overview-card span,
.overview-card small {
  color: #64748b;
}

.overview-card strong {
  color: #0f172a;
  font-size: 20px;
}

.chart-box {
  height: 320px;
}

@media (max-width: 1200px) {
  .hero-panel,
  .content-grid,
  .overview-grid,
  .metric-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .seller-detail-page {
    padding: 12px;
  }

  .hero-panel,
  .content-grid,
  .overview-grid,
  .metric-row,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .hero-profile {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

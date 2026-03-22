<template>
  <div class="log-page">
    <section class="log-hero">
      <div>
        <span class="hero-tag">Balance Ledger</span>
        <h1>余额记录</h1>
        <p>这里重点看会员账户资金流向，页面保留查询和导出，避免把系统流水当手工数据维护。</p>
      </div>
      <div class="hero-metric">
        <span>记录数</span>
        <strong>{{ total }}</strong>
      </div>
    </section>

    <el-card shadow="never" class="panel-card">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>筛选条件</h3>
            <p>按会员、变动类型和业务单号快速筛选。</p>
          </div>
        </div>
      </template>
      <el-form ref="queryRef" :inline="true" :model="queryParams">
        <el-form-item label="会员ID">
          <el-input v-model="queryParams.memberId" clearable placeholder="请输入会员ID" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="变动类型">
          <el-select v-model="queryParams.changeType" clearable placeholder="全部类型" style="width: 160px">
            <el-option label="充值" value="1" />
            <el-option label="消费" value="2" />
            <el-option label="退款" value="3" />
            <el-option label="系统调整" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务单号">
          <el-input v-model="queryParams.businessNo" clearable placeholder="请输入业务单号" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button v-hasPermi="['member:balanceLog:export']" icon="Download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="panel-card">
      <el-table v-loading="loading" :data="balanceLogList" stripe border>
        <el-table-column label="会员ID" prop="memberId" width="100" align="center" />
        <el-table-column label="变动类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.changeType)">{{ typeLabel(row.changeType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="变动金额" width="140" align="right">
          <template #default="{ row }">
            <span :class="['delta-text', row.changeAmount >= 0 ? 'delta-text--plus' : 'delta-text--minus']">
              {{ row.changeAmount >= 0 ? '+' : '' }}{{ formatCurrency(row.changeAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="变动前余额" width="140" align="right">
          <template #default="{ row }">{{ formatCurrency(row.balanceBefore) }}</template>
        </el-table-column>
        <el-table-column label="变动后余额" width="140" align="right">
          <template #default="{ row }">{{ formatCurrency(row.balanceAfter) }}</template>
        </el-table-column>
        <el-table-column label="业务单号" prop="businessNo" min-width="180" show-overflow-tooltip />
        <el-table-column label="创建时间" prop="createTime" width="170" align="center" />
        <el-table-column label="备注" prop="remark" min-width="200" show-overflow-tooltip />
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { listBalanceLog } from '@/api/member/balanceLog';

const { proxy } = getCurrentInstance() as any;
const queryRef = ref();
const loading = ref(false);
const total = ref(0);
const balanceLogList = ref<any[]>([]);
const queryParams = ref<any>({ pageNum: 1, pageSize: 10, memberId: undefined, changeType: undefined, businessNo: undefined });

async function getList() {
  loading.value = true;
  try {
    const res = await listBalanceLog(queryParams.value);
    balanceLogList.value = res.rows || [];
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
  queryParams.value = { pageNum: 1, pageSize: 10, memberId: undefined, changeType: undefined, businessNo: undefined };
  queryRef.value?.resetFields?.();
  getList();
}

function handleExport() {
  proxy.download('member/balanceLog/export', { ...queryParams.value }, `member_balance_log_${Date.now()}.xlsx`);
}

function typeLabel(type: string) {
  return ({ '1': '充值', '2': '消费', '3': '退款', '4': '系统调整' } as Record<string, string>)[type] || '其他';
}

function typeTag(type: string) {
  return ({ '1': 'success', '2': 'danger', '3': 'warning', '4': 'info' } as Record<string, string>)[type] || 'info';
}

function formatCurrency(value?: number) {
  return `¥${((value || 0) / 100).toFixed(2)}`;
}

onMounted(() => {
  getList();
});
</script>

<style scoped>
.log-page { padding: 16px; background: linear-gradient(180deg, #f7f9fc 0%, #eef3f8 100%); min-height: 100%; }
.log-hero { display: flex; justify-content: space-between; gap: 18px; padding: 24px; border-radius: 24px; background: linear-gradient(135deg, #1f3555 0%, #45739b 100%); color: #fff; }
.hero-tag { display: inline-block; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.12); font-size: 12px; }
.log-hero h1 { margin: 12px 0 8px; font-size: 30px; }
.log-hero p { margin: 0; color: rgba(255,255,255,.76); max-width: 640px; }
.hero-metric { min-width: 120px; padding: 16px; border-radius: 18px; background: rgba(255,255,255,.1); }
.hero-metric span, .hero-metric strong { display: block; }
.hero-metric span { font-size: 12px; color: rgba(255,255,255,.72); }
.hero-metric strong { margin-top: 10px; font-size: 28px; }
.panel-card { margin-top: 18px; border: none; border-radius: 22px; box-shadow: 0 12px 34px rgba(27,46,67,.08); }
.panel-header h3 { margin: 0; font-size: 18px; color: #213547; }
.panel-header p { margin: 6px 0 0; color: #7d8ca0; font-size: 13px; }
.delta-text { font-weight: 600; }
.delta-text--plus { color: #1f9d70; }
.delta-text--minus { color: #d3544a; }
@media (max-width: 900px) {
  .log-hero { flex-direction: column; }
}
</style>

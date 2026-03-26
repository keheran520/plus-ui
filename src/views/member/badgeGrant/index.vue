<template>
  <div class="member-log-page">
    <section class="filter-panel">
      <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="会员">
          <el-select v-model="queryParams.memberId" class="field-md" clearable filterable placeholder="请选择会员">
            <el-option v-for="item in memberOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="徽章">
          <el-select v-model="queryParams.badgeId" class="field-md" clearable filterable placeholder="请选择徽章">
            <el-option v-for="item in badgeOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源类型">
          <el-select v-model="queryParams.sourceType" class="field-sm" clearable placeholder="全部来源">
            <el-option label="签到" value="checkin" />
            <el-option label="手动" value="manual" />
            <el-option label="订单" value="order" />
            <el-option label="活动" value="activity" />
            <el-option label="系统" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button icon="Search" type="primary" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="list-panel">
      <header class="panel-toolbar">
        <div class="toolbar-title">
          <span class="title-text">会员徽章发放记录</span>
          <span class="title-meta">{{ total }} 条记录，仅支持查看</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['member:badgeGrant:export']" icon="Download" plain @click="handleExport">导出</el-button>
        </div>
      </header>

      <el-table v-loading="loading" :data="badgeGrantList" class="manage-table">
        <el-table-column label="会员" min-width="220">
          <template #default="{ row }">
            <div class="stack-cell">
              <span class="main-line">{{ getMemberLabel(row.memberId) }}</span>
              <span class="sub-line">会员ID {{ row.memberId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="徽章" min-width="220">
          <template #default="{ row }">
            <div class="stack-cell">
              <span class="main-line">{{ getBadgeLabel(row.badgeId) }}</span>
              <span class="sub-line">徽章ID {{ row.badgeId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="来源" width="130">
          <template #default="{ row }">
            <el-tag effect="light" round>{{ getSourceLabel(row.sourceType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="来源业务ID" prop="sourceId" width="150" />
        <el-table-column align="center" label="发放时间" prop="grantTime" width="180" />
        <el-table-column label="备注" min-width="200" prop="remark" show-overflow-tooltip />
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, ref } from 'vue';
import { listBadgeGrant } from '@/api/member/badgeGrant';
import { listBadge } from '@/api/member/badge';
import { listMember } from '@/api/member/member';

const { proxy } = getCurrentInstance() as any;
const queryRef = ref();
const loading = ref(false);
const total = ref(0);
const badgeGrantList = ref<any[]>([]);
const memberOptions = ref<any[]>([]);
const badgeOptions = ref<any[]>([]);

const queryParams = ref<any>({
  pageNum: 1,
  pageSize: 10,
  memberId: undefined,
  badgeId: undefined,
  sourceType: undefined
});

async function loadOptions() {
  const [memberRes, badgeRes] = await Promise.all([listMember({ pageNum: 1, pageSize: 200 }), listBadge({ pageNum: 1, pageSize: 200 })]);
  memberOptions.value = (memberRes.rows || []).map((item: any) => ({
    id: item.id,
    label: `${item.realName || item.memberNo || '未命名会员'} / ${item.memberNo || item.userId || item.id}`
  }));
  badgeOptions.value = (badgeRes.rows || []).map((item: any) => ({
    id: item.id,
    label: `${item.badgeName || '未命名徽章'} / ${item.badgeCode || item.id}`
  }));
}

async function getList() {
  loading.value = true;
  try {
    const res = await listBadgeGrant(queryParams.value);
    badgeGrantList.value = res.rows || [];
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
  queryParams.value = { pageNum: 1, pageSize: 10, memberId: undefined, badgeId: undefined, sourceType: undefined };
  queryRef.value?.resetFields?.();
  getList();
}

function handleExport() {
  proxy.download('member/badgeGrant/export', { ...queryParams.value }, `member_badge_grant_${Date.now()}.xlsx`);
}

function getMemberLabel(memberId?: string | number) {
  return memberOptions.value.find((item) => String(item.id) === String(memberId))?.label || `会员ID ${memberId || '-'}`;
}

function getBadgeLabel(badgeId?: string | number) {
  return badgeOptions.value.find((item) => String(item.id) === String(badgeId))?.label || `徽章ID ${badgeId || '-'}`;
}

function getSourceLabel(value?: string) {
  return (
    (
      {
        checkin: '签到',
        manual: '手动',
        order: '订单',
        activity: '活动',
        system: '系统'
      } as Record<string, string>
    )[value || ''] ||
    value ||
    '-'
  );
}

onMounted(async () => {
  await loadOptions();
  await getList();
});
</script>

<style lang="scss" scoped>
.member-log-page {
  padding: 16px;
  background: #f6f8fb;
  min-height: calc(100vh - 84px);
}

.filter-panel,
.list-panel {
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.filter-panel {
  padding: 16px 18px 2px;
  margin-bottom: 14px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-actions {
  margin-left: auto;
}

.field-sm {
  width: 160px;
}

.field-md {
  width: 220px;
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

.stack-cell {
  display: grid;
  gap: 4px;
}

.main-line {
  color: #0f172a;
  font-weight: 600;
}

.sub-line {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 768px) {
  .member-log-page {
    padding: 12px;
  }

  .panel-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

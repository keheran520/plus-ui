<template>
  <div class="member-manage-page">
    <section class="filter-panel">
      <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="会员ID">
          <el-input v-model="queryParams.memberId" clearable placeholder="请输入会员ID" class="field-sm" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="变动类型">
          <el-select v-model="queryParams.changeType" clearable placeholder="全部类型" class="field-sm">
            <el-option label="签到" value="1" />
            <el-option label="消费获得" value="2" />
            <el-option label="兑换" value="3" />
            <el-option label="过期" value="4" />
            <el-option label="系统调整" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务单号">
          <el-input v-model="queryParams.businessNo" clearable placeholder="请输入业务单号" class="field-md" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="list-panel">
      <header class="panel-toolbar">
        <div class="toolbar-title">
          <span class="title-text">积分记录</span>
          <span class="title-meta">{{ total }} 条记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['member:pointsLog:export']" icon="Download" plain @click="handleExport">导出</el-button>
        </div>
      </header>

      <el-table v-loading="loading" :data="pointsLogList" class="manage-table">
        <el-table-column label="会员ID" prop="memberId" width="100" align="center" />
        <el-table-column label="变动类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.changeType)" effect="light" round>{{ typeLabel(row.changeType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="变动积分" width="120" align="center">
          <template #default="{ row }">
            <span :class="['delta-text', row.changePoints >= 0 ? 'delta-text--plus' : 'delta-text--minus']">
              {{ row.changePoints >= 0 ? '+' : '' }}{{ row.changePoints || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="变动前积分" prop="pointsBefore" width="120" align="center" />
        <el-table-column label="变动后积分" prop="pointsAfter" width="120" align="center" />
        <el-table-column label="过期时间" prop="expireTime" width="170" align="center" />
        <el-table-column label="业务单号" prop="businessNo" min-width="180" show-overflow-tooltip />
        <el-table-column label="创建时间" prop="createTime" width="170" align="center" />
        <el-table-column label="备注" prop="remark" min-width="200" show-overflow-tooltip />
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from 'vue'
import { listPointsLog } from '@/api/member/pointsLog'

const { proxy } = getCurrentInstance() as any
const queryRef = ref()
const loading = ref(false)
const total = ref(0)
const pointsLogList = ref<any[]>([])
const queryParams = ref<any>({ pageNum: 1, pageSize: 10, memberId: undefined, changeType: undefined, businessNo: undefined })

async function getList() {
  loading.value = true
  try {
    const res = await listPointsLog(queryParams.value)
    pointsLogList.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.value = { pageNum: 1, pageSize: 10, memberId: undefined, changeType: undefined, businessNo: undefined }
  queryRef.value?.resetFields?.()
  getList()
}

function handleExport() {
  proxy.download('member/pointsLog/export', { ...queryParams.value }, `member_points_log_${Date.now()}.xlsx`)
}

function typeLabel(type: string) {
  return ({ '1': '签到', '2': '消费获得', '3': '兑换', '4': '过期', '5': '系统调整' } as Record<string, string>)[type] || '其他'
}

function typeTag(type: string) {
  return ({ '1': 'success', '2': 'primary', '3': 'warning', '4': 'info', '5': 'danger' } as Record<string, string>)[type] || 'info'
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.member-manage-page {
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
  width: 180px;
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

.delta-text {
  font-weight: 600;
}

.delta-text--plus {
  color: #0f8c68;
}

.delta-text--minus {
  color: #dc2626;
}

@media (max-width: 768px) {
  .member-manage-page {
    padding: 12px;
  }

  .panel-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

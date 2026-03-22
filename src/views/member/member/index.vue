<template>
  <div class="member-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <span class="hero-kicker">Member Console</span>
        <h1>会员管理</h1>
        <p>把零散字段整理成可运营、可判断、可快速执行动作的会员工作台。</p>
      </div>
      <div class="hero-metrics">
        <div class="hero-metric">
          <span>会员总数</span>
          <strong>{{ formatCount(overview.totalMembers) }}</strong>
          <small>当前筛选结果</small>
        </div>
        <div class="hero-metric">
          <span>活跃占比</span>
          <strong>{{ activeRate }}</strong>
          <small>正常会员 / 全部会员</small>
        </div>
        <div class="hero-metric">
          <span>累计储值</span>
          <strong>{{ formatCurrency(overview.totalBalance) }}</strong>
          <small>余额总额</small>
        </div>
      </div>
    </section>

    <section class="overview-grid" v-loading="overviewLoading">
      <article v-for="item in overviewCards" :key="item.key" class="stat-card">
        <div class="stat-card__label">{{ item.label }}</div>
        <div class="stat-card__value">{{ item.value }}</div>
        <div class="stat-card__hint">{{ item.hint }}</div>
      </article>
    </section>

    <el-card shadow="never" class="panel-card search-panel">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>筛选条件</h3>
            <p>按编号、姓名、等级、来源和注册时间快速定位目标会员。</p>
          </div>
          <el-button text type="primary" @click="showSearch = !showSearch">
            {{ showSearch ? '收起筛选' : '展开筛选' }}
          </el-button>
        </div>
      </template>

      <el-form v-show="showSearch" ref="queryRef" :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="queryParams.userId" clearable placeholder="按用户ID查询" style="width: 180px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="会员编号" prop="memberNo">
          <el-input v-model="queryParams.memberNo" clearable placeholder="按编号模糊搜索" style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="会员姓名" prop="realName">
          <el-input v-model="queryParams.realName" clearable placeholder="请输入会员姓名" style="width: 180px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="queryParams.idCard" clearable placeholder="支持模糊匹配" style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="会员等级" prop="levelId">
          <el-select v-model="queryParams.levelId" clearable placeholder="全部等级" style="width: 180px">
            <el-option v-for="level in levelList" :key="level.id" :label="level.levelName" :value="level.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员状态" prop="status">
          <el-select v-model="queryParams.status" clearable placeholder="全部状态" style="width: 160px">
            <el-option label="正常" value="0" />
            <el-option label="冻结" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册来源" prop="source">
          <el-select v-model="queryParams.source" clearable placeholder="全部来源" style="width: 160px">
            <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 260px"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="panel-card table-panel">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>会员列表</h3>
            <p>当前共 {{ total }} 位会员，可直接查看详情、编辑资料、冻结或解冻。</p>
          </div>
          <div class="toolbar-actions">
            <el-button v-hasPermi="['member:member:add']" type="primary" icon="Plus" @click="handleAdd">新增会员</el-button>
            <el-button v-hasPermi="['member:member:remove']" :disabled="multiple" icon="Delete" @click="handleDelete()">批量删除</el-button>
            <el-button v-hasPermi="['member:member:freeze']" :disabled="multiple" type="warning" icon="Lock" @click="handleFreeze">批量冻结</el-button>
            <el-button v-hasPermi="['member:member:unfreeze']" :disabled="multiple" type="success" icon="Unlock" @click="handleUnfreeze">批量解冻</el-button>
            <el-button v-hasPermi="['member:member:export']" icon="Download" @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <div class="table-summary">
        <span>筛选后正常会员 {{ formatCount(overview.activeMembers) }} 人</span>
        <span>冻结 {{ formatCount(overview.frozenMembers) }} 人</span>
        <span>今日新增 {{ formatCount(overview.todayNewMembers) }} 人</span>
      </div>

      <el-table
        v-loading="loading"
        :data="memberList"
        stripe
        border
        class="member-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" align="center" fixed="left" />
        <el-table-column label="会员信息" min-width="260" fixed="left">
          <template #default="{ row }">
            <div class="member-cell">
              <el-avatar class="member-avatar">{{ (row.realName || row.memberNo || 'M').slice(0, 1) }}</el-avatar>
              <div class="member-meta">
                <div class="member-name-row">
                  <span class="member-name">{{ row.realName || '未实名会员' }}</span>
                  <el-tag :type="getStatusType(row.status)" effect="light">{{ getStatusLabel(row.status) }}</el-tag>
                </div>
                <div class="member-sub">编号 {{ row.memberNo || '-' }}</div>
                <div class="member-sub">用户ID {{ row.userId || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="会员等级" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.levelId)" effect="dark">{{ getLevelName(row.levelId) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册来源" width="110" align="center">
          <template #default="{ row }">
            <el-tag effect="plain">{{ getSourceLabel(row.source) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="余额" width="130" align="right">
          <template #default="{ row }">
            <span class="amount-text amount-text--success">{{ formatCurrency(row.balance) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="积分" prop="points" width="110" align="center">
          <template #default="{ row }">
            <span class="metric-chip metric-chip--amber">{{ formatCount(row.points) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="成长值" prop="growthValue" width="120" align="center">
          <template #default="{ row }">
            <span class="metric-chip metric-chip--rose">{{ formatCount(row.growthValue) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="累计消费" width="140" align="right">
          <template #default="{ row }">
            <span class="amount-text">{{ formatCurrency(row.totalConsumeAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="身份证号" min-width="170" show-overflow-tooltip>
          <template #default="{ row }">
            {{ desensitizeIdCard(row.idCard) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="资料标签" min-width="180">
          <template #default="{ row }">
            <div class="tag-group">
              <el-tag v-if="row.region" size="small" effect="plain">{{ row.region }}</el-tag>
              <el-tag v-if="row.occupation" size="small" effect="plain" type="success">{{ row.occupation }}</el-tag>
              <el-tag v-if="row.school" size="small" effect="plain" type="warning">{{ row.school }}</el-tag>
              <span v-if="!row.region && !row.occupation && !row.school" class="empty-text">资料待完善</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" prop="registerTime" width="170" align="center" />
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-hasPermi="['member:member:query']" link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button v-hasPermi="['member:member:edit']" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.status === '0'"
              v-hasPermi="['member:member:freeze']"
              link
              type="warning"
              @click="handleFreezeSingle(row)"
            >
              冻结
            </el-button>
            <el-button
              v-else
              v-hasPermi="['member:member:unfreeze']"
              link
              type="success"
              @click="handleUnfreezeSingle(row)"
            >
              解冻
            </el-button>
            <el-button v-hasPermi="['member:member:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="loadPageData" />
    </el-card>

    <el-drawer v-model="memberDrawer" :title="memberTitle" size="720px" :close-on-click-modal="false">
      <div class="drawer-intro">
        <h3>{{ memberTitle }}</h3>
        <p>统一维护会员身份资料、等级与运营备注，避免信息分散在多个地方。</p>
      </div>

      <el-form ref="memberRef" :model="memberForm" :rules="memberRules" label-position="top" class="member-form">
        <div class="form-grid form-grid--link">
          <el-form-item label="关联用户" prop="userId">
            <div class="linked-user-box">
              <el-input v-model="memberForm.userName" readonly placeholder="请选择关联用户" />
              <el-button :disabled="Boolean(memberForm.id)" icon="User" @click="handleSelectUser">选择用户</el-button>
            </div>
          </el-form-item>
          <el-form-item label="会员编号" prop="memberNo">
            <div class="linked-user-box">
              <el-input v-model="memberForm.memberNo" readonly placeholder="点击生成编号" />
              <el-button :loading="generating" icon="Refresh" @click="handleGenerateMemberNo">生成编号</el-button>
            </div>
          </el-form-item>
        </div>

        <div class="form-grid">
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="memberForm.realName" maxlength="50" placeholder="请输入真实姓名" />
          </el-form-item>
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="memberForm.idCard" maxlength="18" placeholder="请输入身份证号" />
          </el-form-item>
          <el-form-item label="生日" prop="birthday">
            <el-date-picker v-model="memberForm.birthday" type="date" value-format="YYYY-MM-DD" placeholder="请选择生日" style="width: 100%" />
          </el-form-item>
          <el-form-item label="会员等级" prop="levelId">
            <el-select v-model="memberForm.levelId" placeholder="请选择会员等级" style="width: 100%">
              <el-option
                v-for="level in levelList"
                :key="level.id"
                :label="`${level.levelName} · ${level.discountRate}%`"
                :value="level.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="注册来源" prop="source">
            <el-select v-model="memberForm.source" placeholder="请选择注册来源" style="width: 100%">
              <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="会员状态" prop="status">
            <el-radio-group v-model="memberForm.status">
              <el-radio label="0">正常</el-radio>
              <el-radio label="1">冻结</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="所在地区" prop="region">
            <el-input v-model="memberForm.region" maxlength="50" placeholder="例如：上海·浦东" />
          </el-form-item>
          <el-form-item label="职业" prop="occupation">
            <el-input v-model="memberForm.occupation" maxlength="50" placeholder="例如：设计师" />
          </el-form-item>
          <el-form-item label="学校" prop="school">
            <el-input v-model="memberForm.school" maxlength="50" placeholder="可选填写学校信息" />
          </el-form-item>
        </div>

        <el-form-item label="个人简介" prop="signature">
          <el-input v-model="memberForm.signature" type="textarea" :rows="3" maxlength="120" show-word-limit placeholder="补充会员画像或偏好信息" />
        </el-form-item>
        <el-form-item label="运营备注" prop="remark">
          <el-input v-model="memberForm.remark" type="textarea" :rows="4" maxlength="200" show-word-limit placeholder="记录重要背景、沟通事项或标签说明" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="cancelMember">取消</el-button>
          <el-button type="primary" :loading="memberLoading" @click="submitMember">保存会员</el-button>
        </div>
      </template>
    </el-drawer>

    <UserSelect ref="userSelectRef" v-model="selectedUsers" :multiple="false" :userIds="linkedUserIds" @confirmCallBack="handleUserSelected" />
  </div>
</template>

<script lang="ts" setup>
import { addMember, delMember, freezeMember, generateMemberNo, getLinkedUserIds, getMember, getMemberOverview, listMember, unfreezeMember, updateMember } from '@/api/member/member';
import { listLevel } from '@/api/member/level';
import UserSelect from '@/components/UserSelect/index.vue';

const { proxy } = getCurrentInstance() as any;

const queryRef = ref();
const memberRef = ref();
const userSelectRef = ref();

const loading = ref(false);
const overviewLoading = ref(false);
const showSearch = ref(true);
const memberDrawer = ref(false);
const memberLoading = ref(false);
const generating = ref(false);
const total = ref(0);
const ids = ref<number[]>([]);
const multiple = ref(true);
const dateRange = ref<string[]>([]);

const memberTitle = ref('新增会员');
const selectedUsers = ref<any[]>([]);
const linkedUserIds = ref<number[]>([]);
const memberList = ref<any[]>([]);
const levelList = ref<any[]>([]);

const sourceOptions = [
  { label: 'APP', value: 'app' },
  { label: 'H5', value: 'h5' },
  { label: '小程序', value: 'mini' },
  { label: 'PC', value: 'pc' },
  { label: '后台添加', value: 'admin' }
];

const createDefaultQuery = () => ({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  memberNo: undefined,
  realName: undefined,
  idCard: undefined,
  levelId: undefined,
  status: undefined,
  source: undefined
});

const createDefaultForm = () => ({
  id: undefined,
  userId: undefined,
  userName: '',
  memberNo: '',
  realName: '',
  idCard: '',
  birthday: '',
  signature: '',
  region: '',
  occupation: '',
  school: '',
  levelId: undefined,
  balance: 0,
  points: 0,
  totalConsumeAmount: 0,
  status: '0',
  source: 'admin',
  registerTime: '',
  remark: ''
});

const queryParams = ref<any>(createDefaultQuery());
const memberForm = ref<any>(createDefaultForm());
const overview = reactive({
  totalMembers: 0,
  activeMembers: 0,
  frozenMembers: 0,
  todayNewMembers: 0,
  totalBalance: 0,
  totalPoints: 0,
  totalGrowthValue: 0,
  totalConsumeAmount: 0
});

const memberRules = {
  userId: [{ required: true, message: '请选择关联用户', trigger: 'change' }],
  memberNo: [{ required: true, message: '请先生成会员编号', trigger: 'blur' }],
  levelId: [{ required: true, message: '请选择会员等级', trigger: 'change' }],
  realName: [{ max: 50, message: '真实姓名不能超过 50 个字符', trigger: 'blur' }],
  idCard: [
    {
      pattern: /(^$)|(^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$)/,
      message: '请输入正确的身份证号',
      trigger: 'blur'
    }
  ]
};

const activeRate = computed(() => {
  if (!overview.totalMembers) {
    return '0%';
  }
  return `${((overview.activeMembers / overview.totalMembers) * 100).toFixed(1)}%`;
});

const overviewCards = computed(() => [
  {
    key: 'activeMembers',
    label: '正常会员',
    value: formatCount(overview.activeMembers),
    hint: '可触达、可继续运营的会员池'
  },
  {
    key: 'frozenMembers',
    label: '冻结会员',
    value: formatCount(overview.frozenMembers),
    hint: '需要重点回查原因和异常行为'
  },
  {
    key: 'todayNewMembers',
    label: '今日新增',
    value: formatCount(overview.todayNewMembers),
    hint: '当天注册进入会员体系的人数'
  },
  {
    key: 'totalPoints',
    label: '总积分',
    value: formatCount(overview.totalPoints),
    hint: '当前筛选范围内的积分存量'
  },
  {
    key: 'totalGrowthValue',
    label: '总成长值',
    value: formatCount(overview.totalGrowthValue),
    hint: '会员升级潜力的整体热度'
  },
  {
    key: 'totalConsumeAmount',
    label: '累计消费',
    value: formatCurrency(overview.totalConsumeAmount),
    hint: '筛选范围内的历史消费累计'
  }
]);

function buildRequestParams() {
  return proxy.addDateRange({ ...queryParams.value }, dateRange.value, 'RegisterTime');
}

async function loadLevelList() {
  const res = await listLevel({ status: '0', pageNum: 1, pageSize: 100 });
  levelList.value = (res.rows || []).sort((a: any, b: any) => Number(a.levelSort || 0) - Number(b.levelSort || 0));
}

async function loadLinkedUserIds() {
  const res = await getLinkedUserIds();
  linkedUserIds.value = res.data || [];
}

async function loadOverview() {
  overviewLoading.value = true;
  try {
    const res = await getMemberOverview(buildRequestParams());
    Object.assign(overview, res.data || {});
  } finally {
    overviewLoading.value = false;
  }
}

async function loadPageData() {
  loading.value = true;
  try {
    const res = await listMember(buildRequestParams());
    memberList.value = res.rows || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
}

async function refreshData() {
  await Promise.all([loadPageData(), loadOverview()]);
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  refreshData();
}

function resetQuery() {
  queryParams.value = createDefaultQuery();
  dateRange.value = [];
  queryRef.value?.resetFields?.();
  refreshData();
}

function handleSelectionChange(selection: any[]) {
  ids.value = selection.map((item) => item.id);
  multiple.value = selection.length === 0;
}

async function handleGenerateMemberNo() {
  generating.value = true;
  try {
    const res = await generateMemberNo();
    memberForm.value.memberNo = res.data;
    proxy.$modal.msgSuccess('会员编号生成成功');
  } finally {
    generating.value = false;
  }
}

async function handleSelectUser() {
  if (memberForm.value.id) {
    proxy.$modal.msgWarning('编辑会员时不允许更换关联用户');
    return;
  }
  await loadLinkedUserIds();
  userSelectRef.value?.open();
}

function handleUserSelected(users: any[]) {
  const user = users?.[0];
  if (!user) {
    return;
  }
  memberForm.value.userId = user.userId;
  memberForm.value.userName = user.nickName || user.userName;
}

function resetMemberForm() {
  memberForm.value = createDefaultForm();
  memberRef.value?.resetFields?.();
}

async function handleAdd() {
  resetMemberForm();
  await loadLevelList();
  memberForm.value.levelId = levelList.value[0]?.id;
  memberDrawer.value = true;
  memberTitle.value = '新增会员';
  await handleGenerateMemberNo();
}

async function handleEdit(row: any) {
  await loadLevelList();
  const res = await getMember(row.id);
  memberForm.value = {
    ...createDefaultForm(),
    ...res.data,
    userName: row.userId ? `用户ID：${row.userId}` : row.memberNo || ''
  };
  memberDrawer.value = true;
  memberTitle.value = '编辑会员';
}

function cancelMember() {
  memberDrawer.value = false;
  resetMemberForm();
}

function submitMember() {
  memberRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    memberLoading.value = true;
    try {
      if (memberForm.value.id) {
        await updateMember(memberForm.value);
        proxy.$modal.msgSuccess('会员信息已更新');
      } else {
        await addMember(memberForm.value);
        proxy.$modal.msgSuccess('会员创建成功');
      }
      memberDrawer.value = false;
      await refreshData();
    } finally {
      memberLoading.value = false;
    }
  });
}

function handleDetail(row: any) {
  proxy.$router.push({ path: '/member/member/detail/' + row.userId });
}

function handleDelete(row?: any) {
  const memberIds = row?.id || ids.value;
  if (!memberIds || (Array.isArray(memberIds) && memberIds.length === 0)) {
    proxy.$modal.msgWarning('请先选择要删除的会员');
    return;
  }
  const label = row?.memberNo || `${ids.value.length} 位会员`;
  proxy.$modal
    .confirm(`确认删除 ${label} 吗？删除后将无法恢复。`)
    .then(() => delMember(memberIds))
    .then(async () => {
      proxy.$modal.msgSuccess('删除成功');
      await refreshData();
    })
    .catch(() => undefined);
}

function handleFreeze() {
  if (!ids.value.length) {
    proxy.$modal.msgWarning('请先选择要冻结的会员');
    return;
  }
  proxy.$modal
    .confirm(`确认冻结已选择的 ${ids.value.length} 位会员吗？`)
    .then(() => freezeMember(ids.value))
    .then(async () => {
      proxy.$modal.msgSuccess('冻结成功');
      await refreshData();
    })
    .catch(() => undefined);
}

function handleUnfreeze() {
  if (!ids.value.length) {
    proxy.$modal.msgWarning('请先选择要解冻的会员');
    return;
  }
  proxy.$modal
    .confirm(`确认解冻已选择的 ${ids.value.length} 位会员吗？`)
    .then(() => unfreezeMember(ids.value))
    .then(async () => {
      proxy.$modal.msgSuccess('解冻成功');
      await refreshData();
    })
    .catch(() => undefined);
}

function handleFreezeSingle(row: any) {
  proxy.$modal
    .confirm(`确认冻结会员 ${row.memberNo} 吗？`)
    .then(() => freezeMember([row.id]))
    .then(async () => {
      proxy.$modal.msgSuccess('冻结成功');
      await refreshData();
    })
    .catch(() => undefined);
}

function handleUnfreezeSingle(row: any) {
  proxy.$modal
    .confirm(`确认解冻会员 ${row.memberNo} 吗？`)
    .then(() => unfreezeMember([row.id]))
    .then(async () => {
      proxy.$modal.msgSuccess('解冻成功');
      await refreshData();
    })
    .catch(() => undefined);
}

function handleExport() {
  proxy.download('member/member/export', buildRequestParams(), `member_${Date.now()}.xlsx`);
}

function getLevelName(levelId?: number | string) {
  const target = levelList.value.find((item) => String(item.id) === String(levelId));
  return target?.levelName || '未分层';
}

function getLevelType(levelId?: number | string) {
  const target = levelList.value.find((item) => String(item.id) === String(levelId));
  const code = String(target?.levelCode || '').toUpperCase();
  if (['V6', 'V7'].includes(code)) return 'danger';
  if (['V4', 'V5'].includes(code)) return 'warning';
  if (['V2', 'V3'].includes(code)) return 'success';
  return 'info';
}

function getStatusLabel(status?: string) {
  return status === '1' ? '冻结' : '正常';
}

function getStatusType(status?: string) {
  return status === '1' ? 'danger' : 'success';
}

function getSourceLabel(source?: string) {
  return sourceOptions.find((item) => item.value === source)?.label || '未知来源';
}

function formatCurrency(value?: number) {
  return `¥${((value || 0) / 100).toFixed(2)}`;
}

function formatCount(value?: number) {
  return `${value || 0}`;
}

function desensitizeIdCard(idCard?: string) {
  if (!idCard) {
    return '';
  }
  if (idCard.length < 8) {
    return idCard;
  }
  return idCard.replace(/^(.{6})(.*)(.{4})$/, '$1********$3');
}

onMounted(async () => {
  await loadLevelList();
  await refreshData();
});
</script>

<style scoped>
.member-page {
  padding: 16px;
  background:
    radial-gradient(circle at top left, rgba(243, 197, 87, 0.18), transparent 32%),
    radial-gradient(circle at top right, rgba(55, 123, 255, 0.12), transparent 28%),
    linear-gradient(180deg, #f6f8fc 0%, #eef3f8 100%);
  min-height: 100%;
}

.hero-panel {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
  padding: 28px;
  border-radius: 24px;
  background: linear-gradient(135deg, #12233d 0%, #1d3a63 58%, #29527c 100%);
  color: #fff;
  box-shadow: 0 22px 55px rgba(18, 35, 61, 0.22);
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 14px 0 10px;
  font-size: 34px;
  line-height: 1.15;
  font-weight: 700;
}

.hero-copy p {
  margin: 0;
  max-width: 540px;
  font-size: 15px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.76);
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.hero-metric {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.hero-metric span,
.hero-metric small {
  display: block;
}

.hero-metric span {
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
}

.hero-metric strong {
  display: block;
  margin: 12px 0 6px;
  font-size: 26px;
}

.hero-metric small {
  color: rgba(255, 255, 255, 0.64);
  font-size: 12px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.stat-card {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 12px 35px rgba(31, 51, 73, 0.08);
}

.stat-card__label {
  color: #6f7f92;
  font-size: 13px;
}

.stat-card__value {
  margin: 10px 0 8px;
  color: #1d2d3d;
  font-size: 28px;
  font-weight: 700;
}

.stat-card__hint {
  color: #8e9aaa;
  font-size: 12px;
  line-height: 1.6;
}

.panel-card {
  margin-top: 18px;
  border: none;
  border-radius: 22px;
  box-shadow: 0 12px 35px rgba(31, 51, 73, 0.08);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.panel-header h3 {
  margin: 0;
  color: #1d2d3d;
  font-size: 18px;
}

.panel-header p {
  margin: 6px 0 0;
  color: #7d8ca0;
  font-size: 13px;
}

.search-form {
  margin-bottom: -10px;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.table-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
  color: #6f7f92;
  font-size: 13px;
}

.table-summary span {
  padding: 8px 12px;
  border-radius: 999px;
  background: #f3f6fa;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #19355a, #406da2);
  color: #fff;
  font-weight: 700;
}

.member-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.member-name {
  color: #1f2f40;
  font-weight: 600;
}

.member-sub {
  color: #8a97a7;
  font-size: 12px;
  line-height: 1.6;
}

.amount-text {
  color: #23384f;
  font-weight: 600;
}

.amount-text--success {
  color: #0f8c68;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 600;
}

.metric-chip--amber {
  background: #fff4d6;
  color: #b47600;
}

.metric-chip--rose {
  background: #ffe1dc;
  color: #c44a36;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.empty-text {
  color: #a1adbb;
  font-size: 12px;
}

.drawer-intro {
  margin-bottom: 18px;
  padding: 18px 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #f8ead6 0%, #fff7ee 100%);
}

.drawer-intro h3 {
  margin: 0 0 8px;
  color: #4e3723;
  font-size: 18px;
}

.drawer-intro p {
  margin: 0;
  color: #7d634d;
  line-height: 1.7;
}

.member-form {
  padding-bottom: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.form-grid--link {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.linked-user-box {
  display: flex;
  gap: 10px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 1360px) {
  .overview-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .hero-panel {
    grid-template-columns: 1fr;
  }

  .hero-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-grid,
  .form-grid--link {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .member-page {
    padding: 12px;
  }

  .hero-panel {
    padding: 22px;
  }

  .hero-copy h1 {
    font-size: 28px;
  }

  .hero-metrics,
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .linked-user-box {
    flex-direction: column;
  }
}
</style>

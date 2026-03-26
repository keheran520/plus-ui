<template>
  <div class="member-manage-page">
    <section v-loading="overviewLoading" class="summary-grid">
      <article class="summary-card summary-card--blue">
        <span class="summary-card__label">会员总数</span>
        <strong class="summary-card__value">{{ formatCount(overview.totalMembers) }}</strong>
        <span class="summary-card__hint">当前筛选范围内的会员规模</span>
      </article>
      <article class="summary-card summary-card--green">
        <span class="summary-card__label">活跃占比</span>
        <strong class="summary-card__value">{{ activeRate }}</strong>
        <span class="summary-card__hint">正常会员 / 全部会员</span>
      </article>
      <article class="summary-card summary-card--amber">
        <span class="summary-card__label">累计余额</span>
        <strong class="summary-card__value">{{ formatCurrency(overview.totalBalance) }}</strong>
        <span class="summary-card__hint">会员账户余额汇总</span>
      </article>
      <article class="summary-card summary-card--violet">
        <span class="summary-card__label">今日新增</span>
        <strong class="summary-card__value">{{ formatCount(overview.todayNewMembers) }}</strong>
        <span class="summary-card__hint">今日进入会员体系的人数</span>
      </article>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="用户ID" prop="userId">
            <el-input v-model="queryParams.userId" class="field-sm" clearable placeholder="请输入用户ID" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="会员编号" prop="memberNo">
            <el-input v-model="queryParams.memberNo" class="field-md" clearable placeholder="请输入会员编号" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="会员姓名" prop="realName">
            <el-input v-model="queryParams.realName" class="field-sm" clearable placeholder="请输入会员姓名" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="queryParams.idCard" class="field-md" clearable placeholder="请输入身份证号" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="会员等级" prop="levelId">
            <el-select v-model="queryParams.levelId" class="field-sm" clearable placeholder="全部等级">
              <el-option v-for="level in levelList" :key="level.id" :label="level.levelName" :value="level.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" class="field-sm" clearable placeholder="全部状态">
              <el-option label="正常" value="0" />
              <el-option label="冻结" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="来源" prop="source">
            <el-select v-model="queryParams.source" class="field-sm" clearable placeholder="全部来源">
              <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="注册时间">
            <el-date-picker
              v-model="dateRange"
              class="field-date"
              end-placeholder="结束日期"
              range-separator="-"
              start-placeholder="开始日期"
              type="daterange"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item class="filter-actions">
            <el-button icon="Search" type="primary" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </section>
    </transition>

    <section class="list-panel">
      <header class="panel-toolbar">
        <div class="toolbar-title">
          <span class="title-text">会员列表</span>
          <span class="title-meta">{{ total }} 条记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['member:member:create']" icon="Plus" type="primary" @click="handleAdd">新增会员</el-button>
          <el-button
            v-hasPermi="['member:member:remove']"
            :disabled="multiple || hasSuperAdminSelected"
            icon="Delete"
            plain
            type="danger"
            @click="handleDelete()"
            >批量删除</el-button
          >
          <el-button
            v-hasPermi="['member:member:freeze']"
            :disabled="multiple || hasSuperAdminSelected"
            icon="Lock"
            plain
            type="warning"
            @click="handleFreeze"
            >批量冻结</el-button
          >
          <el-button v-hasPermi="['member:member:unfreeze']" :disabled="multiple" icon="Unlock" plain type="success" @click="handleUnfreeze"
            >批量解冻</el-button
          >
          <el-button v-hasPermi="['member:member:export']" icon="Download" plain @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="loadPageData" />
        </div>
      </header>

      <div class="table-summary">
        <span>正常 {{ formatCount(overview.activeMembers) }}</span>
        <span>冻结 {{ formatCount(overview.frozenMembers) }}</span>
        <span>总积分 {{ formatCount(overview.totalPoints) }}</span>
        <span>总成长值 {{ formatCount(overview.totalGrowthValue) }}</span>
        <span>累计消费 {{ formatCurrency(overview.totalConsumeAmount) }}</span>
      </div>

      <el-table v-loading="loading" :data="memberList" class="member-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed="left" type="selection" width="48" />
        <el-table-column fixed="left" label="会员信息" min-width="250">
          <template #default="{ row }">
            <div class="member-cell">
              <el-avatar class="member-avatar">{{ (row.realName || row.memberNo || 'M').slice(0, 1) }}</el-avatar>
              <div class="member-meta">
                <div class="member-name-row">
                  <span class="member-name">{{ row.realName || '未实名会员' }}</span>
                  <el-tag :type="getStatusType(row.status)" effect="light" round>{{ getStatusLabel(row.status) }}</el-tag>
                </div>
                <div class="member-sub">编号 {{ row.memberNo || '-' }}</div>
                <div class="member-sub">用户ID {{ row.userId || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="等级" width="180">
          <template #default="{ row }">
            <div class="level-cell">
              <div class="visual-card">
                <img
                  v-if="getLevelImage(row.levelId)"
                  :src="getLevelImage(row.levelId)"
                  alt=""
                  class="visual-card__image visual-card__image--level"
                />
                <div v-else class="visual-card__placeholder">
                  {{ (getLevelName(row.levelId) || row.levelCode || 'LV').slice(0, 4) }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="徽章" min-width="280">
          <template #default="{ row }">
            <div v-if="row.badgeList?.length" class="badge-group">
              <el-tooltip
                v-for="badge in row.badgeList"
                :key="badge.badgeId"
                :content="getBadgeTooltipContent(badge)"
                effect="dark"
                placement="top"
                popper-class="member-badge-tooltip"
              >
                <div class="visual-card--badge">
                  <img v-if="getBadgeImage(badge)" :src="getBadgeImage(badge)" alt="" class="visual-card__image visual-card__image--badge" />
                  <div v-else class="visual-card__placeholder visual-card__placeholder--badge">
                    {{ (badge.badgeName || badge.badgeCode || '徽章').slice(0, 4) }}
                  </div>
                </div>
              </el-tooltip>
            </div>
            <span v-else class="empty-text">暂无徽章</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="来源" width="110">
          <template #default="{ row }">
            <el-tag effect="plain" round>{{ getSourceLabel(row.source) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="right" label="余额" width="130">
          <template #default="{ row }">
            <span class="amount-text amount-text--success">{{ formatCurrency(row.balance) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="积分" width="100">
          <template #default="{ row }">
            <span class="metric-chip metric-chip--amber">{{ formatCount(row.points) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="成长值" width="110">
          <template #default="{ row }">
            <span class="metric-chip metric-chip--violet">{{ formatCount(row.growthValue) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="right" label="累计消费" width="140">
          <template #default="{ row }">
            <span class="amount-text">{{ formatCurrency(row.totalConsumeAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="身份证号" min-width="170" show-overflow-tooltip>
          <template #default="{ row }">
            {{ desensitizeIdCard(row.idCard) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="180">
          <template #default="{ row }">
            <div class="tag-group">
              <el-tag v-if="row.region" effect="plain" size="small">{{ row.region }}</el-tag>
              <el-tag v-if="row.occupation" effect="plain" size="small" type="success">{{ row.occupation }}</el-tag>
              <el-tag v-if="row.school" effect="plain" size="small" type="warning">{{ row.school }}</el-tag>
              <span v-if="!row.region && !row.occupation && !row.school" class="empty-text">暂无</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="注册时间" prop="registerTime" width="170" />
        <el-table-column align="center" fixed="right" label="操作" width="280">
          <template #default="{ row }">
            <el-button v-hasPermi="['member:member:query']" link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button v-hasPermi="['member:member:update']" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.status === '0' && !isSuperAdminMember(row)"
              v-hasPermi="['member:member:freeze']"
              link
              type="warning"
              @click="handleFreezeSingle(row)"
            >
              冻结
            </el-button>
            <el-button v-if="row.status === '1'" v-hasPermi="['member:member:unfreeze']" link type="success" @click="handleUnfreezeSingle(row)">
              解冻
            </el-button>
            <el-button v-if="!isSuperAdminMember(row)" v-hasPermi="['member:member:remove']" link type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        :total="total"
        @pagination="loadPageData"
      />
    </section>

    <el-drawer v-model="memberDrawer" :close-on-click-modal="false" :title="memberTitle" size="720px">
      <el-form ref="memberRef" :model="memberForm" :rules="memberRules" class="member-form" label-position="top">
        <div class="form-grid form-grid--link">
          <el-form-item label="关联用户" prop="userId">
            <div class="linked-user-box">
              <el-input v-model="memberForm.userName" placeholder="请选择关联用户" readonly />
              <el-button :disabled="Boolean(memberForm.id)" icon="User" @click="handleSelectUser">选择用户</el-button>
            </div>
          </el-form-item>
          <el-form-item label="会员编号" prop="memberNo">
            <div class="linked-user-box">
              <el-input v-model="memberForm.memberNo" placeholder="点击生成会员编号" readonly />
              <el-button v-hasPermi="['member:member:generateNo']" :loading="generating" icon="Refresh" @click="handleGenerateMemberNo"
                >生成编号</el-button
              >
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
            <el-date-picker v-model="memberForm.birthday" placeholder="请选择生日" style="width: 100%" type="date" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="注册来源" prop="source">
            <el-select v-model="memberForm.source" placeholder="请选择注册来源" style="width: 100%">
              <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="所在地区" prop="region">
            <el-input v-model="memberForm.region" maxlength="50" placeholder="例如：上海" />
          </el-form-item>
          <el-form-item label="职业" prop="occupation">
            <el-input v-model="memberForm.occupation" maxlength="50" placeholder="例如：设计师" />
          </el-form-item>
          <el-form-item label="学校" prop="school">
            <el-input v-model="memberForm.school" maxlength="50" placeholder="可选填写学校信息" />
          </el-form-item>
        </div>

        <el-form-item label="个人简介" prop="signature">
          <el-input v-model="memberForm.signature" :rows="3" maxlength="120" placeholder="补充会员画像或偏好信息" show-word-limit type="textarea" />
        </el-form-item>
        <el-form-item label="运营备注" prop="remark">
          <el-input
            v-model="memberForm.remark"
            :rows="4"
            maxlength="200"
            placeholder="记录重要背景、沟通事项或标签说明"
            show-word-limit
            type="textarea"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="cancelMember">取消</el-button>
          <el-button :loading="memberLoading" type="primary" @click="submitMember">保存会员</el-button>
        </div>
      </template>
    </el-drawer>

    <UserSelect ref="userSelectRef" v-model="selectedUsers" :multiple="false" :userIds="linkedUserIds" @confirmCallBack="handleUserSelected" />
  </div>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue';
import {
  addMember,
  delMember,
  freezeMember,
  generateMemberNo,
  getLinkedUserIds,
  getMember,
  getMemberOverview,
  listMember,
  unfreezeMember,
  updateMember
} from '@/api/member/member';
import { listLevel } from '@/api/member/level';
import UserSelect from '@/components/UserSelect/index.vue';
import { getMemberBadgeImage, getMemberLevelImage } from '@/utils/memberVisual';

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
  source: 'admin',
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
  if (!overview.totalMembers) return '0%';
  return `${((overview.activeMembers / overview.totalMembers) * 100).toFixed(1)}%`;
});

const hasSuperAdminSelected = computed(() => memberList.value.some((item: any) => ids.value.includes(item.id) && isSuperAdminMember(item)));

function buildRequestParams() {
  return proxy.addDateRange({ ...queryParams.value }, dateRange.value, 'RegisterTime');
}

async function loadLevelList() {
  const res = await listLevel({ pageNum: 1, pageSize: 100 });
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

function isSuperAdminMember(row: any) {
  return Number(row?.userId) === 1;
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
  if (!user) return;
  memberForm.value.userId = user.userId;
  memberForm.value.userName = user.nickName || user.userName || `用户ID ${user.userId}`;
}

function resetMemberForm() {
  memberForm.value = createDefaultForm();
  memberRef.value?.resetFields?.();
}

async function handleAdd() {
  resetMemberForm();
  memberDrawer.value = true;
  memberTitle.value = '新增会员';
  await handleGenerateMemberNo();
}

async function handleEdit(row: any) {
  const res = await getMember(row.id);
  memberForm.value = {
    ...createDefaultForm(),
    ...res.data,
    userName: row.userId ? `用户ID ${row.userId}` : row.memberNo || ''
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
    if (!valid) return;
    memberLoading.value = true;
    try {
      if (memberForm.value.id) {
        await updateMember({
          id: memberForm.value.id,
          userId: memberForm.value.userId,
          memberNo: memberForm.value.memberNo,
          realName: memberForm.value.realName,
          idCard: memberForm.value.idCard,
          birthday: memberForm.value.birthday,
          source: memberForm.value.source,
          signature: memberForm.value.signature,
          region: memberForm.value.region,
          occupation: memberForm.value.occupation,
          school: memberForm.value.school,
          remark: memberForm.value.remark
        });
        proxy.$modal.msgSuccess('会员信息已更新');
      } else {
        await addMember({
          userId: memberForm.value.userId,
          memberNo: memberForm.value.memberNo,
          realName: memberForm.value.realName,
          idCard: memberForm.value.idCard,
          birthday: memberForm.value.birthday,
          source: memberForm.value.source,
          signature: memberForm.value.signature,
          region: memberForm.value.region,
          occupation: memberForm.value.occupation,
          school: memberForm.value.school,
          remark: memberForm.value.remark
        });
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
  if ((row && isSuperAdminMember(row)) || (!row && hasSuperAdminSelected.value)) {
    proxy.$modal.msgWarning('超级管理员关联会员不允许删除');
    return;
  }
  const label = row?.memberNo || `${ids.value.length} 位会员`;
  proxy.$modal
    .confirm(`确认删除 ${label} 吗？删除后会同步清理该会员的余额日志、积分日志、成长日志，但不会删除关联的用户记录。`)
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
  if (hasSuperAdminSelected.value) {
    proxy.$modal.msgWarning('超级管理员关联会员不允许冻结');
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
  if (isSuperAdminMember(row)) {
    proxy.$modal.msgWarning('超级管理员关联会员不允许冻结');
    return;
  }
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
  return target?.levelName || '未分配';
}

function getLevelImage(levelId?: number | string) {
  const target = levelList.value.find((item) => String(item.id) === String(levelId));
  return getMemberLevelImage(target?.levelCode, target?.levelImage);
}

function getLevelType(levelId?: number | string) {
  const target = levelList.value.find((item) => String(item.id) === String(levelId));
  const code = String(target?.levelCode || '').toUpperCase();
  if (['V6', 'V7'].includes(code)) return 'danger';
  if (['V4', 'V5'].includes(code)) return 'warning';
  if (['V2', 'V3'].includes(code)) return 'success';
  return 'info';
}

function getBadgeImage(badge: any) {
  return getMemberBadgeImage(badge);
}

function getBadgeTooltipContent(badge: any) {
  const name = badge?.badgeName || badge?.badgeCode || '会员徽章';
  const desc = badge?.badgeDesc?.trim();
  const conditionText = getBadgeConditionText(badge);
  if (desc && conditionText) {
    return `${name}：${desc}，${conditionText}`;
  }
  if (desc) {
    return `${name}：${desc}`;
  }
  if (conditionText) {
    return `${name}：${conditionText}`;
  }
  return `${name}：会员成就徽章`;
}

function getBadgeConditionText(badge: any) {
  const conditionValue = Number(badge?.conditionValue || 0);
  switch (badge?.conditionType) {
    case 'checkin_streak':
      return conditionValue > 0 ? `连续签到 ${conditionValue} 天可获得` : '连续签到达标后可获得';
    case 'checkin_total':
      return conditionValue > 0 ? `累计签到 ${conditionValue} 次可获得` : '累计签到达标后可获得';
    default:
      return '';
  }
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
  if (!idCard) return '';
  if (idCard.length < 8) return idCard;
  return idCard.replace(/^(.{6})(.*)(.{4})$/, '$1********$3');
}

onMounted(async () => {
  await loadLevelList();
  await refreshData();
});
</script>

<style lang="scss" scoped>
.member-manage-page {
  padding: 16px;
  min-height: calc(100vh - 84px);
  background: #f6f8fb;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.summary-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
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
  font-weight: 700;
}

.summary-card__hint {
  display: block;
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
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
  width: 150px;
}

.field-md {
  width: 190px;
}

.field-date {
  width: 240px;
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

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
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

.member-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #0f172a, #334155);
  color: #fff;
  font-weight: 700;
}

.level-cell {
  display: flex;
  justify-content: center;
}

.member-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.member-name {
  color: #0f172a;
  font-weight: 600;
}

.member-sub {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.amount-text {
  color: #0f172a;
  font-weight: 600;
}

.amount-text--success {
  color: #0f8c68;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 66px;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
}

.metric-chip--amber {
  background: #fff4d6;
  color: #b47600;
}

.metric-chip--violet {
  background: #ede9fe;
  color: #7c3aed;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.visual-card__image {
  display: block;
  max-width: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}

.visual-card__image--level {
  width: 86px;
  height: 46px;
}

.visual-card__image--badge {
  width: 46px;
  height: 46px;
}

.visual-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  padding: 4px;
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
  word-break: break-word;
}

.visual-card__placeholder--badge {
  color: #b45309;
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
}

.visual-card__name {
  max-width: 100%;
  overflow: hidden;
  color: #334155;
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
  word-break: break-word;
}

.empty-text {
  color: #94a3b8;
  font-size: 12px;
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

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .form-grid,
  .form-grid--link {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .member-manage-page {
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
    justify-content: flex-start;
  }

  .linked-user-box {
    flex-direction: column;
  }
}
</style>

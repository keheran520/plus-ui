<template>
  <div v-loading="pageLoading" class="member-detail-page">
    <section class="detail-shell">
      <header class="detail-header">
        <div class="header-top">
          <el-button class="back-button" text @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回会员列表
          </el-button>
          <div class="header-actions">
            <el-button v-hasPermi="['member:member:recharge']" type="primary" @click="openRechargeDialog">充值余额</el-button>
            <el-button v-hasPermi="['member:member:adjustPoints']" type="warning" @click="openPointsDialog">充值积分</el-button>
          </div>
        </div>

        <div class="hero-panel">
          <div class="hero-profile">
            <el-avatar :size="68" :src="memberDetail.user?.avatar" class="member-avatar">
              {{ (memberDisplayName || 'M').slice(0, 1) }}
            </el-avatar>
            <div class="hero-body">
              <div class="hero-title">
                <h1>{{ memberDisplayName }}</h1>
                <el-tag :type="statusTagType" effect="light" round>{{ statusLabel }}</el-tag>
                <el-tag :type="levelTagType" effect="light" round>{{ levelLabel }}</el-tag>
              </div>
              <div class="hero-meta">
                <span>会员ID {{ memberDetail.id || '-' }}</span>
                <span>会员编号 {{ memberDetail.memberNo || '-' }}</span>
                <span>用户ID {{ memberDetail.userId || '-' }}</span>
                <span>注册时间 {{ memberDetail.registerTime || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="hero-level">
            <div class="level-image-card">
              <el-image v-if="memberDetail.levelImage" :src="memberDetail.levelImage" class="level-image" fit="cover" preview-teleported />
              <div v-else class="level-placeholder">{{ memberDetail.levelCode || 'LV' }}</div>
            </div>
            <div class="hero-level-meta">
              <span class="hero-level-label">当前等级</span>
              <strong>{{ levelLabel }}</strong>
              <small>等级编码 {{ memberDetail.levelCode || '-' }}</small>
            </div>
          </div>
        </div>

        <div class="metric-row">
          <div class="metric-card">
            <span>余额</span>
            <strong>{{ formatCurrency(memberDetail.balance) }}</strong>
          </div>
          <div class="metric-card">
            <span>积分</span>
            <strong>{{ formatCount(memberDetail.points) }}</strong>
          </div>
          <div class="metric-card">
            <span>成长值</span>
            <strong>{{ formatCount(memberDetail.growthValue) }}</strong>
          </div>
          <div class="metric-card">
            <span>累计消费</span>
            <strong>{{ formatCurrency(memberDetail.totalConsumeAmount) }}</strong>
          </div>
        </div>
      </header>

      <section class="content-grid">
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
            <span class="info-item__label">个人简介</span>
            <p>{{ memberDetail.signature || '暂无简介' }}</p>
          </div>
          <div class="remark-box">
            <span class="info-item__label">运营备注</span>
            <p>{{ memberDetail.remark || '暂无备注' }}</p>
          </div>
        </article>

        <article class="panel">
          <header class="panel-header">
            <h3>用户资料</h3>
          </header>
          <div class="info-grid">
            <div v-for="item in userItems" :key="item.label" class="info-item">
              <span class="info-item__label">{{ item.label }}</span>
              <span class="info-item__value">{{ item.value }}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="panel">
        <header class="panel-header">
          <h3>等级进度</h3>
        </header>
        <div class="level-box">
          <div class="level-head">
            <div>
              <span class="info-item__label">当前等级</span>
              <strong class="level-title">{{ levelLabel }}</strong>
            </div>
            <div class="level-head-side">
              <span class="info-item__label">达标成长值</span>
              <strong>{{ formatCount(currentLevel?.requiredGrowth) }}</strong>
            </div>
          </div>
          <el-progress :percentage="growthProgress" :stroke-width="10" />
          <p class="level-tip">{{ levelProgressHint }}</p>
          <div class="level-list">
            <div
              v-for="level in orderedLevels"
              :key="level.id"
              :class="['level-item', { 'level-item--active': Number(level.id) === Number(memberDetail.levelId) }]"
            >
              <div class="level-item__head">
                <strong>{{ level.levelName }}</strong>
                <span>{{ level.levelCode }}</span>
              </div>
              <small>成长值 {{ formatCount(level.requiredGrowth) }}</small>
            </div>
          </div>
        </div>
      </section>

      <section class="panel panel--logs">
        <header class="panel-header">
          <h3>会员流水</h3>
        </header>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="余额记录" name="balance">
            <el-table :data="balanceLogs" border stripe>
              <el-table-column align="center" label="变动类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getBalanceTypeTag(row.changeType)" effect="light" round>{{ getBalanceTypeLabel(row.changeType) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column align="right" label="变动金额" width="140">
                <template #default="{ row }">
                  <span :class="['delta-text', row.changeAmount >= 0 ? 'delta-text--plus' : 'delta-text--minus']">
                    {{ row.changeAmount >= 0 ? '+' : '' }}{{ formatCurrency(row.changeAmount) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column align="right" label="变动前" width="130">
                <template #default="{ row }">{{ formatCurrency(row.balanceBefore) }}</template>
              </el-table-column>
              <el-table-column align="right" label="变动后" width="130">
                <template #default="{ row }">{{ formatCurrency(row.balanceAfter) }}</template>
              </el-table-column>
              <el-table-column label="业务单号" min-width="160" prop="businessNo" show-overflow-tooltip />
              <el-table-column align="center" label="时间" prop="createTime" width="170" />
              <el-table-column label="备注" min-width="180" prop="remark" show-overflow-tooltip />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="积分记录" name="points">
            <el-table :data="pointsLogs" border stripe>
              <el-table-column align="center" label="变动类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getPointsTypeTag(row.changeType)" effect="light" round>{{ getPointsTypeLabel(row.changeType) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column align="center" label="变动积分" width="120">
                <template #default="{ row }">
                  <span :class="['delta-text', row.changePoints >= 0 ? 'delta-text--plus' : 'delta-text--minus']">
                    {{ row.changePoints >= 0 ? '+' : '' }}{{ row.changePoints || 0 }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="变动前" prop="pointsBefore" width="120" />
              <el-table-column align="center" label="变动后" prop="pointsAfter" width="120" />
              <el-table-column align="center" label="过期时间" prop="expireTime" width="170" />
              <el-table-column label="业务单号" min-width="160" prop="businessNo" show-overflow-tooltip />
              <el-table-column align="center" label="时间" prop="createTime" width="170" />
              <el-table-column label="备注" min-width="180" prop="remark" show-overflow-tooltip />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="成长值记录" name="growth">
            <el-table :data="growthLogs" border stripe>
              <el-table-column align="center" label="变动类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getGrowthTypeTag(row.changeType)" effect="light" round>{{ getGrowthTypeLabel(row.changeType) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column align="center" label="变动值" width="120">
                <template #default="{ row }">
                  <span :class="['delta-text', row.changeValue >= 0 ? 'delta-text--plus' : 'delta-text--minus']">
                    {{ row.changeValue >= 0 ? '+' : '' }}{{ row.changeValue || 0 }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="变动前" prop="growthBefore" width="120" />
              <el-table-column align="center" label="变动后" prop="growthAfter" width="120" />
              <el-table-column label="业务单号" min-width="160" prop="businessNo" show-overflow-tooltip />
              <el-table-column align="center" label="时间" prop="createTime" width="170" />
              <el-table-column label="备注" min-width="180" prop="remark" show-overflow-tooltip />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </section>
    </section>

    <el-dialog v-model="rechargeDialogVisible" title="充值余额" width="460px">
      <el-form ref="rechargeFormRef" :model="rechargeForm" :rules="rechargeRules" label-position="top">
        <el-form-item label="充值金额" prop="amount">
          <el-input-number v-model="rechargeForm.amount" :min="0.01" :precision="2" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="rechargeForm.remark" :rows="3" maxlength="120" placeholder="请输入备注" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rechargeDialogVisible = false">取消</el-button>
          <el-button :loading="rechargeLoading" type="primary" @click="submitRecharge">确认充值</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="pointsDialogVisible" title="充值积分" width="460px">
      <el-form ref="pointsFormRef" :model="pointsForm" :rules="pointsRules" label-position="top">
        <el-form-item label="充值积分" prop="points">
          <el-input-number v-model="pointsForm.points" :min="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="pointsForm.remark" :rows="3" maxlength="120" placeholder="请输入备注" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="pointsDialogVisible = false">取消</el-button>
          <el-button :loading="pointsLoading" type="primary" @click="submitPoints">确认充值</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ArrowLeft } from '@element-plus/icons-vue';
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { adjustPoints, getMemberDetailByUserId, recharge } from '@/api/member/member';
import { getBalanceLogByMemberId } from '@/api/member/balanceLog';
import { getGrowthLogByMemberId } from '@/api/member/growthLog';
import { listLevel } from '@/api/member/level';
import { getPointsLogByMemberId } from '@/api/member/pointsLog';
import { formatContactDisplay } from '@/utils/contact';

const { proxy } = getCurrentInstance() as any;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const activeTab = ref('balance');
const memberDetail = reactive<any>({});
const balanceLogs = ref<any[]>([]);
const pointsLogs = ref<any[]>([]);
const growthLogs = ref<any[]>([]);
const levels = ref<any[]>([]);

const rechargeDialogVisible = ref(false);
const pointsDialogVisible = ref(false);
const rechargeLoading = ref(false);
const pointsLoading = ref(false);
const rechargeFormRef = ref();
const pointsFormRef = ref();

const rechargeForm = reactive({
  amount: 0.01,
  remark: '系统调整余额'
});

const pointsForm = reactive({
  points: 1,
  remark: '系统调整积分'
});

const rechargeRules = {
  amount: [{ required: true, message: '请输入充值金额', trigger: 'blur' }],
  remark: [{ required: true, message: '请输入备注', trigger: 'blur' }]
};

const pointsRules = {
  points: [{ required: true, message: '请输入充值积分', trigger: 'blur' }],
  remark: [{ required: true, message: '请输入备注', trigger: 'blur' }]
};

const memberDisplayName = computed(() => memberDetail.realName || memberDetail.user?.nickName || memberDetail.user?.userName || '会员详情');

const statusLabel = computed(() => (memberDetail.status === '1' ? '冻结' : '正常'));
const statusTagType = computed(() => (memberDetail.status === '1' ? 'danger' : 'success'));
const orderedLevels = computed(() => [...levels.value].sort((a, b) => Number(a.requiredGrowth || 0) - Number(b.requiredGrowth || 0)));
const currentLevel = computed(() => orderedLevels.value.find((item) => Number(item.id) === Number(memberDetail.levelId)));
const nextLevel = computed(() => orderedLevels.value.find((item) => Number(item.requiredGrowth || 0) > Number(memberDetail.growthValue || 0)));
const levelLabel = computed(() => memberDetail.levelName || currentLevel.value?.levelName || '未分层');
const levelTagType = computed(() => {
  const code = String(memberDetail.levelCode || currentLevel.value?.levelCode || '').toUpperCase();
  if (['V6', 'V7'].includes(code)) return 'danger';
  if (['V4', 'V5'].includes(code)) return 'warning';
  if (['V2', 'V3'].includes(code)) return 'success';
  return 'info';
});

const growthProgress = computed(() => {
  const currentGrowth = Number(memberDetail.growthValue || 0);
  if (!currentLevel.value || !nextLevel.value) return 100;
  const start = Number(currentLevel.value.requiredGrowth || 0);
  const end = Number(nextLevel.value.requiredGrowth || 0);
  if (end <= start) return 100;
  const ratio = ((currentGrowth - start) / (end - start)) * 100;
  return Math.max(0, Math.min(100, Number(ratio.toFixed(1))));
});

const levelProgressHint = computed(() => {
  if (!nextLevel.value) return '已达到当前体系最高等级';
  const gap = Number(nextLevel.value.requiredGrowth || 0) - Number(memberDetail.growthValue || 0);
  return `距离 ${nextLevel.value.levelName} 还差 ${gap} 成长值`;
});

const memberItems = computed(() => [
  { label: '真实姓名', value: memberDetail.realName || '未填写' },
  { label: '身份证号', value: memberDetail.idCard ? desensitizeIdCard(memberDetail.idCard) : '未填写' },
  { label: '生日', value: memberDetail.birthday || '未填写' },
  { label: '来源', value: getSourceLabel(memberDetail.source) },
  { label: '地区', value: memberDetail.region || '未填写' },
  { label: '职业', value: memberDetail.occupation || '未填写' },
  { label: '学校', value: memberDetail.school || '未填写' },
  { label: '会员状态', value: memberDetail.status === '0' ? '正常' : '冻结' }
]);

const userItems = computed(() => [
  { label: '用户名', value: memberDetail.user?.userName || '未填写' },
  { label: '昵称', value: memberDetail.user?.nickName || '未填写' },
  { label: '手机号', value: formatContactDisplay(memberDetail.user?.phonenumber) },
  { label: '邮箱', value: formatContactDisplay(memberDetail.user?.email) },
  { label: '性别', value: getSexLabel(memberDetail.user?.sex) },
  { label: '用户状态', value: memberDetail.user?.status === '0' ? '正常' : memberDetail.user?.status === '1' ? '停用' : '未知' },
  { label: '所属部门', value: memberDetail.user?.deptName || '未分配' },
  { label: '用户ID', value: memberDetail.user?.userId || '-' }
]);

function goBack() {
  router.push('/member/member');
}

function getSourceLabel(source?: string) {
  const sourceMap: Record<string, string> = {
    app: 'APP',
    h5: 'H5',
    mini: '小程序',
    pc: 'PC',
    admin: '后台添加'
  };
  return sourceMap[source || ''] || '未知来源';
}

function getSexLabel(sex?: string) {
  return ({ '0': '男', '1': '女', '2': '未知' } as Record<string, string>)[sex || ''] || '未知';
}

function formatCurrency(value?: number) {
  return `¥${((value || 0) / 100).toFixed(2)}`;
}

function formatCount(value?: number) {
  return `${value || 0}`;
}

function desensitizeIdCard(idCard: string) {
  if (!idCard || idCard.length < 8) return idCard || '';
  return idCard.replace(/^(.{6})(.*)(.{4})$/, '$1********$3');
}

function getBalanceTypeLabel(type: string) {
  return ({ '1': '充值', '2': '消费', '3': '退款', '4': '系统调整' } as Record<string, string>)[type] || '其他';
}

function getBalanceTypeTag(type: string) {
  return ({ '1': 'success', '2': 'danger', '3': 'warning', '4': 'info' } as Record<string, string>)[type] || 'info';
}

function getPointsTypeLabel(type: string) {
  return ({ '1': '签到', '2': '消费获得', '3': '兑换', '4': '过期', '5': '系统调整' } as Record<string, string>)[type] || '其他';
}

function getPointsTypeTag(type: string) {
  return ({ '1': 'success', '2': 'primary', '3': 'warning', '4': 'info', '5': 'danger' } as Record<string, string>)[type] || 'info';
}

function getGrowthTypeLabel(type: string) {
  return ({ '1': '消费获得', '2': '活动获得', '3': '签到获得', '4': '系统调整', '5': '过期扣减' } as Record<string, string>)[type] || '其他';
}

function getGrowthTypeTag(type: string) {
  return ({ '1': 'success', '2': 'primary', '3': 'warning', '4': 'info', '5': 'danger' } as Record<string, string>)[type] || 'info';
}

function resetRechargeForm() {
  rechargeForm.amount = 0.01;
  rechargeForm.remark = '系统调整余额';
  rechargeFormRef.value?.resetFields?.();
}

function resetPointsForm() {
  pointsForm.points = 1;
  pointsForm.remark = '系统调整积分';
  pointsFormRef.value?.resetFields?.();
}

function openRechargeDialog() {
  resetRechargeForm();
  rechargeDialogVisible.value = true;
}

function openPointsDialog() {
  resetPointsForm();
  pointsDialogVisible.value = true;
}

function submitRecharge() {
  rechargeFormRef.value?.validate(async (valid: boolean) => {
    if (!valid || !memberDetail.id) return;
    rechargeLoading.value = true;
    try {
      await recharge({
        id: memberDetail.id,
        amount: Math.round(Number(rechargeForm.amount || 0) * 100),
        remark: rechargeForm.remark
      });
      proxy.$modal.msgSuccess('余额充值成功');
      rechargeDialogVisible.value = false;
      await refreshPage();
    } finally {
      rechargeLoading.value = false;
    }
  });
}

function submitPoints() {
  pointsFormRef.value?.validate(async (valid: boolean) => {
    if (!valid || !memberDetail.id) return;
    pointsLoading.value = true;
    try {
      await adjustPoints({
        id: memberDetail.id,
        points: Number(pointsForm.points || 0),
        remark: pointsForm.remark
      });
      proxy.$modal.msgSuccess('积分充值成功');
      pointsDialogVisible.value = false;
      await refreshPage();
    } finally {
      pointsLoading.value = false;
    }
  });
}

async function refreshPage() {
  pageLoading.value = true;
  try {
    const userId = route.params.id;
    const [levelRes, detailRes] = await Promise.all([listLevel({ pageNum: 1, pageSize: 100 }), getMemberDetailByUserId(userId as string)]);
    levels.value = levelRes.rows || [];
    Object.keys(memberDetail).forEach((key) => delete memberDetail[key]);
    Object.assign(memberDetail, detailRes.data || {});
    if (memberDetail.id) {
      const [balanceRes, pointsRes, growthRes] = await Promise.all([
        getBalanceLogByMemberId(memberDetail.id),
        getPointsLogByMemberId(memberDetail.id),
        getGrowthLogByMemberId(memberDetail.id)
      ]);
      balanceLogs.value = balanceRes.data || [];
      pointsLogs.value = pointsRes.data || [];
      growthLogs.value = growthRes.data || [];
    }
  } finally {
    pageLoading.value = false;
  }
}

onMounted(() => {
  refreshPage();
});
</script>

<style lang="scss" scoped>
.member-detail-page {
  padding: 16px;
  min-height: calc(100vh - 84px);
  background: #f6f8fb;
}

.detail-shell {
  display: grid;
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
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-panel {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.hero-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.member-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #0f172a, #334155);
  color: #fff;
}

.hero-body {
  min-width: 0;
}

.hero-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
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
  margin-top: 10px;
  color: #64748b;
  font-size: 13px;
}

.hero-level {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  min-width: 240px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.level-image,
.level-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.level-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 700;
}

.hero-level-meta {
  display: grid;
  gap: 4px;
}

.hero-level-label {
  color: #94a3b8;
  font-size: 12px;
}

.hero-level-meta strong {
  color: #0f172a;
  font-size: 18px;
}

.hero-level-meta small {
  color: #64748b;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  padding: 14px 16px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.metric-card span {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.metric-card strong {
  display: block;
  margin-top: 8px;
  color: #0f172a;
  font-size: 22px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.panel {
  padding: 16px;
}

.panel--logs {
  padding-bottom: 8px;
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
  margin-top: 14px;
}

.info-item {
  padding: 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.info-item__label {
  display: block;
  color: #94a3b8;
  font-size: 12px;
}

.info-item__value {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 500;
}

.remark-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.remark-box p {
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.7;
}

.level-box {
  margin-top: 10px;
}

.level-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.level-head-side {
  display: grid;
  justify-items: end;
  gap: 2px;
}

.level-title {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 18px;
}

.level-tip {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 12px;
}

.level-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.level-item {
  display: grid;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.level-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.level-item__head strong {
  font-size: 13px;
  font-weight: 600;
}

.level-item__head span,
.level-item small {
  font-size: 12px;
  color: #64748b;
}

.level-item--active {
  border-color: #bfdbfe;
  background: #eff6ff;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 992px) {
  .hero-panel,
  .metric-row,
  .content-grid,
  .info-grid,
  .level-list {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    display: grid;
  }
}

@media (max-width: 768px) {
  .member-detail-page {
    padding: 12px;
  }

  .header-top,
  .hero-profile,
  .hero-level,
  .level-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-level {
    min-width: 0;
  }
}
</style>

<template>
  <div class="member-detail-page" v-loading="pageLoading">
    <section class="detail-hero">
      <el-button text class="back-button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回会员列表
      </el-button>
      <div class="member-profile">
        <el-avatar :size="72" :src="memberDetail.avatar || defaultAvatar" class="member-profile__avatar">
          {{ (memberDisplayName || 'M').slice(0, 1) }}
        </el-avatar>
        <div class="member-profile__body">
          <div class="member-profile__title">
            <h1>{{ memberDisplayName }}</h1>
            <el-tag :type="statusTagType" effect="dark">{{ statusLabel }}</el-tag>
            <el-tag effect="plain">{{ levelLabel }}</el-tag>
          </div>
          <p>{{ detailSubtitle }}</p>
          <div class="member-profile__meta">
            <span>会员编号 {{ memberDetail.memberNo || '-' }}</span>
            <span>用户ID {{ memberDetail.userId || '-' }}</span>
            <span>注册于 {{ memberDetail.registerTime || '-' }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card">
        <span>账户余额</span>
        <strong>{{ formatCurrency(memberDetail.balance) }}</strong>
        <small>当前可用余额</small>
      </article>
      <article class="summary-card">
        <span>会员积分</span>
        <strong>{{ formatCount(memberDetail.points) }}</strong>
        <small>累计积分存量</small>
      </article>
      <article class="summary-card">
        <span>成长值</span>
        <strong>{{ formatCount(memberDetail.growthValue) }}</strong>
        <small>{{ levelProgressHint }}</small>
      </article>
      <article class="summary-card">
        <span>累计消费</span>
        <strong>{{ formatCurrency(memberDetail.totalConsumeAmount) }}</strong>
        <small>历史消费金额</small>
      </article>
    </section>

    <div class="content-grid">
      <el-card shadow="never" class="profile-card">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>会员资料</h3>
              <p>身份信息、来源和画像集中展示，方便运营快速判断。</p>
            </div>
          </div>
        </template>
        <div class="info-grid">
          <div v-for="item in profileItems" :key="item.label" class="info-item">
            <span class="info-item__label">{{ item.label }}</span>
            <strong class="info-item__value">{{ item.value }}</strong>
          </div>
        </div>
        <div class="remark-box">
          <span>运营备注</span>
          <p>{{ memberDetail.remark || '暂无备注，建议补充会员背景、偏好与沟通事项。' }}</p>
        </div>
      </el-card>

      <el-card shadow="never" class="profile-card">
        <template #header>
          <div class="panel-header">
            <div>
              <h3>等级进度</h3>
              <p>当前等级、折扣和距离下一等级的成长空间。</p>
            </div>
          </div>
        </template>
        <div class="level-box">
          <div class="level-box__head">
            <div>
              <span class="info-item__label">当前等级</span>
              <strong class="level-box__title">{{ levelLabel }}</strong>
            </div>
            <el-tag :type="levelTagType" effect="dark">{{ currentLevel?.discountRate || 100 }}%</el-tag>
          </div>
          <el-progress :percentage="growthProgress" :stroke-width="10" />
          <p class="growth-note">{{ levelProgressHint }}</p>
          <div class="timeline-levels">
            <div
              v-for="level in orderedLevels"
              :key="level.id"
              :class="['timeline-level', { 'timeline-level--active': Number(memberDetail.levelId) === Number(level.id) }]"
            >
              <strong>{{ level.levelName }}</strong>
              <span>成长值 {{ formatCount(level.requiredGrowth) }}</span>
              <small>{{ level.discountRate }}% 折扣</small>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-card shadow="never" class="log-card">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>会员流水</h3>
            <p>余额、积分、成长值三类记录统一查看。</p>
          </div>
        </div>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="余额记录" name="balance">
          <el-table :data="balanceLogs" stripe border>
            <el-table-column label="变动类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getBalanceTypeTag(row.changeType)">{{ getBalanceTypeLabel(row.changeType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="变动金额" width="140" align="right">
              <template #default="{ row }">
                <span :class="['delta-text', row.changeAmount >= 0 ? 'delta-text--plus' : 'delta-text--minus']">
                  {{ row.changeAmount >= 0 ? '+' : '' }}{{ formatCurrency(row.changeAmount) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="变动前" width="130" align="right">
              <template #default="{ row }">{{ formatCurrency(row.balanceBefore) }}</template>
            </el-table-column>
            <el-table-column label="变动后" width="130" align="right">
              <template #default="{ row }">{{ formatCurrency(row.balanceAfter) }}</template>
            </el-table-column>
            <el-table-column label="业务单号" prop="businessNo" min-width="160" show-overflow-tooltip />
            <el-table-column label="时间" prop="createTime" width="170" align="center" />
            <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="积分记录" name="points">
          <el-table :data="pointsLogs" stripe border>
            <el-table-column label="变动类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getPointsTypeTag(row.changeType)">{{ getPointsTypeLabel(row.changeType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="变动积分" width="120" align="center">
              <template #default="{ row }">
                <span :class="['delta-text', row.changePoints >= 0 ? 'delta-text--plus' : 'delta-text--minus']">
                  {{ row.changePoints >= 0 ? '+' : '' }}{{ row.changePoints || 0 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="变动前" prop="pointsBefore" width="120" align="center" />
            <el-table-column label="变动后" prop="pointsAfter" width="120" align="center" />
            <el-table-column label="过期时间" prop="expireTime" width="170" align="center" />
            <el-table-column label="业务单号" prop="businessNo" min-width="160" show-overflow-tooltip />
            <el-table-column label="时间" prop="createTime" width="170" align="center" />
            <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="成长值记录" name="growth">
          <el-table :data="growthLogs" stripe border>
            <el-table-column label="变动类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getGrowthTypeTag(row.changeType)">{{ getGrowthTypeLabel(row.changeType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="变动值" width="120" align="center">
              <template #default="{ row }">
                <span :class="['delta-text', row.changeValue >= 0 ? 'delta-text--plus' : 'delta-text--minus']">
                  {{ row.changeValue >= 0 ? '+' : '' }}{{ row.changeValue || 0 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="变动前" prop="growthBefore" width="120" align="center" />
            <el-table-column label="变动后" prop="growthAfter" width="120" align="center" />
            <el-table-column label="业务单号" prop="businessNo" min-width="160" show-overflow-tooltip />
            <el-table-column label="时间" prop="createTime" width="170" align="center" />
            <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ArrowLeft } from '@element-plus/icons-vue';
import { getMemberDetailByUserId } from '@/api/member/member';
import { getBalanceLogByMemberId } from '@/api/member/balanceLog';
import { getGrowthLogByMemberId } from '@/api/member/growthLog';
import { listLevel } from '@/api/member/level';
import { getPointsLogByMemberId } from '@/api/member/pointsLog';

const route = useRoute();
const router = useRouter();

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
const pageLoading = ref(false);
const activeTab = ref('balance');
const memberDetail = reactive<any>({});
const balanceLogs = ref<any[]>([]);
const pointsLogs = ref<any[]>([]);
const growthLogs = ref<any[]>([]);
const levels = ref<any[]>([]);

const memberDisplayName = computed(() => memberDetail.realName || memberDetail.nickName || memberDetail.userName || '会员详情');
const statusLabel = computed(() => (memberDetail.status === '1' ? '冻结' : '正常'));
const statusTagType = computed(() => (memberDetail.status === '1' ? 'danger' : 'success'));
const orderedLevels = computed(() => [...levels.value].sort((a, b) => Number(a.requiredGrowth || 0) - Number(b.requiredGrowth || 0)));
const currentLevel = computed(() => orderedLevels.value.find((item) => Number(item.id) === Number(memberDetail.levelId)));
const nextLevel = computed(() => orderedLevels.value.find((item) => Number(item.requiredGrowth || 0) > Number(memberDetail.growthValue || 0)));
const levelLabel = computed(() => currentLevel.value?.levelName || '未分层');
const levelTagType = computed(() => {
  const code = String(currentLevel.value?.levelCode || '').toUpperCase();
  if (['V6', 'V7'].includes(code)) return 'danger';
  if (['V4', 'V5'].includes(code)) return 'warning';
  if (['V2', 'V3'].includes(code)) return 'success';
  return 'info';
});
const detailSubtitle = computed(() => {
  const sourceMap: Record<string, string> = { app: 'APP', h5: 'H5', mini: '小程序', pc: 'PC', admin: '后台添加' };
  return `${sourceMap[memberDetail.source] || '未知来源'} 注册 · ${memberDetail.phonenumber || '未绑定手机号'}`;
});
const growthProgress = computed(() => {
  if (!currentLevel.value || !nextLevel.value) return 100;
  const current = Number(memberDetail.growthValue || 0);
  const start = Number(currentLevel.value.requiredGrowth || 0);
  const end = Number(nextLevel.value.requiredGrowth || 0);
  if (end <= start) return 100;
  const ratio = ((current - start) / (end - start)) * 100;
  return Math.max(0, Math.min(100, Number(ratio.toFixed(1))));
});
const levelProgressHint = computed(() => {
  if (!nextLevel.value) return '已达到当前体系最高等级';
  const gap = Number(nextLevel.value.requiredGrowth || 0) - Number(memberDetail.growthValue || 0);
  return `距离 ${nextLevel.value.levelName} 还差 ${gap} 成长值`;
});
const profileItems = computed(() => [
  { label: '真实姓名', value: memberDetail.realName || '未填写' },
  { label: '身份证号', value: memberDetail.idCard ? desensitizeIdCard(memberDetail.idCard) : '未填写' },
  { label: '生日', value: memberDetail.birthday || '未填写' },
  { label: '地区', value: memberDetail.region || memberDetail.deptName || '未填写' },
  { label: '职业', value: memberDetail.occupation || '未填写' },
  { label: '学校', value: memberDetail.school || '未填写' },
  { label: '邮箱', value: memberDetail.email || '未填写' },
  { label: '性别', value: memberDetail.sex || '未填写' }
]);

function goBack() {
  router.push('/member/member');
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

async function refreshPage() {
  pageLoading.value = true;
  try {
    const userId = Number(route.params.id);
    const [levelRes, detailRes] = await Promise.all([
      listLevel({ pageNum: 1, pageSize: 100 }),
      getMemberDetailByUserId(userId)
    ]);
    levels.value = levelRes.rows || [];
    Object.assign(memberDetail, detailRes.data || {});
    if (memberDetail.id) {
      const [balanceRes, pointsRes, growthRes] = await Promise.all([
        getBalanceLogByMemberId(Number(memberDetail.id)),
        getPointsLogByMemberId(Number(memberDetail.id)),
        getGrowthLogByMemberId(Number(memberDetail.id))
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

<style scoped>
.member-detail-page {
  padding: 16px;
  background:
    radial-gradient(circle at top left, rgba(243, 197, 87, 0.15), transparent 30%),
    linear-gradient(180deg, #f7f9fc 0%, #edf2f8 100%);
  min-height: 100%;
}

.detail-hero {
  padding: 26px;
  border-radius: 24px;
  background: linear-gradient(135deg, #16283f 0%, #28496d 100%);
  color: #fff;
  box-shadow: 0 18px 48px rgba(22, 40, 63, 0.18);
}

.back-button {
  margin-bottom: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.member-profile {
  display: flex;
  gap: 16px;
}

.member-profile__avatar {
  background: linear-gradient(135deg, #dba74b, #f3d18e);
  color: #3d2b0d;
  font-weight: 700;
}

.member-profile__title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.member-profile__title h1 {
  margin: 0;
  font-size: 30px;
}

.member-profile__body p {
  margin: 10px 0 12px;
  color: rgba(255, 255, 255, 0.76);
}

.member-profile__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.summary-card,
.profile-card,
.log-card {
  border: none;
  border-radius: 22px;
  box-shadow: 0 12px 34px rgba(27, 46, 67, 0.08);
}

.summary-card {
  padding: 18px;
  background: rgba(255, 255, 255, 0.9);
}

.summary-card span,
.summary-card small {
  display: block;
}

.summary-card span {
  color: #708092;
  font-size: 13px;
}

.summary-card strong {
  display: block;
  margin: 12px 0 8px;
  color: #1f2f40;
  font-size: 30px;
}

.summary-card small {
  color: #97a3b2;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 18px;
  margin-top: 18px;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2f40;
}

.panel-header p {
  margin: 6px 0 0;
  color: #7e8da1;
  font-size: 13px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.info-item {
  padding: 16px;
  border-radius: 16px;
  background: #f6f8fb;
}

.info-item__label {
  display: block;
  color: #8594a7;
  font-size: 12px;
}

.info-item__value {
  display: block;
  margin-top: 8px;
  color: #24384d;
  font-size: 15px;
}

.remark-box {
  margin-top: 16px;
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #fff3dd 0%, #fff9f1 100%);
}

.remark-box span {
  display: block;
  color: #8a6630;
  font-size: 13px;
  font-weight: 600;
}

.remark-box p {
  margin: 10px 0 0;
  color: #6a5530;
  line-height: 1.75;
}

.level-box__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.level-box__title {
  display: block;
  margin-top: 8px;
  color: #223549;
  font-size: 24px;
}

.growth-note {
  margin: 12px 0 0;
  color: #7b8d9f;
  line-height: 1.7;
}

.timeline-levels {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.timeline-level {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f6f8fb;
}

.timeline-level strong {
  color: #203244;
}

.timeline-level span,
.timeline-level small {
  color: #8392a5;
}

.timeline-level--active {
  background: linear-gradient(135deg, #1d3a63 0%, #3f6fa3 100%);
}

.timeline-level--active strong,
.timeline-level--active span,
.timeline-level--active small {
  color: #fff;
}

.log-card {
  margin-top: 18px;
}

.delta-text {
  font-weight: 600;
}

.delta-text--plus {
  color: #1f9d70;
}

.delta-text--minus {
  color: #d3544a;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .member-detail-page {
    padding: 12px;
  }

  .member-profile,
  .summary-grid,
  .content-grid,
  .info-grid {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>

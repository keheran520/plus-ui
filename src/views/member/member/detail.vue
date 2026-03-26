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
            <el-button v-hasPermi="['member:member:changeLevel']" @click="openLevelDialog">调整等级</el-button>
            <el-button v-hasPermi="['member:member:update']" @click="openBadgeDialog">发放徽章</el-button>
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
            <div class="detail-level-card">
              <img v-if="resolvedLevelImage" :src="resolvedLevelImage" alt="" class="detail-level-card__preview" />
              <div v-else class="level-placeholder level-placeholder--hero">{{ memberDetail.levelCode || 'LV' }}</div>
              <div class="detail-level-card__body">
                <span class="hero-level-label">当前等级</span>
                <strong>{{ levelLabel }}</strong>
              </div>
              <div class="detail-level-card__extra">
                <span>达标成长值</span>
                <strong>{{ formatCount(currentLevel?.requiredGrowth) }}</strong>
              </div>
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
            <div>
              <h3>会员资料</h3>
            </div>
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
            <div>
              <h3>用户资料</h3>
            </div>
          </header>
          <div class="info-grid">
            <div v-for="item in userItems" :key="item.label" class="info-item">
              <span class="info-item__label">{{ item.label }}</span>
              <span class="info-item__value">{{ item.value }}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="side-grid">
        <article class="panel">
          <header class="panel-header">
            <div>
              <h3>等级进度</h3>
            </div>
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
                <small>达标成长值 {{ formatCount(level.requiredGrowth) }}</small>
              </div>
            </div>
          </div>
        </article>

        <article class="panel">
          <header class="panel-header">
            <div>
              <h3>会员徽章</h3>
            </div>
          </header>
          <div v-if="memberDetail.badgeList?.length" class="badge-wall">
            <div v-for="badge in memberDetail.badgeList" :key="badge.badgeId" class="detail-badge-card">
              <img v-if="getBadgeImage(badge)" :src="getBadgeImage(badge)" alt="" class="detail-badge-card__image" />
              <div v-else class="detail-badge-card__placeholder">
                {{ (badge.badgeName || badge.badgeCode || '徽章').slice(0, 4) }}
              </div>
              <div class="detail-badge-card__body">
                <strong>{{ badge.badgeName || badge.badgeCode || '未命名徽章' }}</strong>
                <span>{{ badge.badgeDesc || '系统授予徽章' }}</span>
              </div>
            </div>
          </div>
          <el-empty v-else :image-size="88" description="该会员暂未获得徽章" />
        </article>
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

    <el-dialog v-model="levelDialogVisible" title="手动调整等级" width="460px">
      <el-form ref="levelFormRef" :model="levelForm" :rules="levelRules" label-position="top">
        <el-form-item label="会员等级" prop="levelId">
          <el-select v-model="levelForm.levelId" placeholder="请选择会员等级" style="width: 100%">
            <el-option v-for="item in orderedLevels" :key="item.id" :label="item.levelName" :value="item.id">
              <div class="dialog-option">
                <el-image :src="getLevelImageByOption(item)" class="dialog-option__image" fit="cover" />
                <span>{{ item.levelName }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="levelDialogVisible = false">取消</el-button>
          <el-button :loading="levelLoading" type="primary" @click="submitLevelChange">确认调整</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="badgeDialogVisible" title="手动发放徽章" width="480px">
      <el-form ref="badgeFormRef" :model="badgeForm" :rules="badgeRules" label-position="top">
        <el-form-item label="选择徽章" prop="badgeId">
          <el-select v-model="badgeForm.badgeId" placeholder="请选择徽章" style="width: 100%">
            <el-option v-for="item in badgeOptions" :key="item.id" :label="item.badgeName" :value="item.id">
              <div class="dialog-option">
                <el-image :src="getBadgeImage(item)" class="dialog-option__image" fit="cover" />
                <span>{{ item.badgeName }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发放备注" prop="remark">
          <el-input v-model="badgeForm.remark" :rows="3" maxlength="120" placeholder="可选填写发放原因" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="badgeDialogVisible = false">取消</el-button>
          <el-button :loading="badgeLoading" type="primary" @click="submitBadgeGrant">确认发放</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ArrowLeft } from '@element-plus/icons-vue';
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { adjustPoints, changeLevel, getMemberDetailByUserId, grantMemberBadge, recharge } from '@/api/member/member';
import { listBadge } from '@/api/member/badge';
import { getBalanceLogByMemberId } from '@/api/member/balanceLog';
import { getGrowthLogByMemberId } from '@/api/member/growthLog';
import { listLevel } from '@/api/member/level';
import { getPointsLogByMemberId } from '@/api/member/pointsLog';
import { formatContactDisplay } from '@/utils/contact';
import { getMemberBadgeImage, getMemberLevelImage } from '@/utils/memberVisual';

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
const levelDialogVisible = ref(false);
const badgeDialogVisible = ref(false);
const rechargeLoading = ref(false);
const pointsLoading = ref(false);
const levelLoading = ref(false);
const badgeLoading = ref(false);
const rechargeFormRef = ref();
const pointsFormRef = ref();
const levelFormRef = ref();
const badgeFormRef = ref();
const badgeOptions = ref<any[]>([]);

const rechargeForm = reactive({
  amount: 0.01,
  remark: '系统调整余额'
});

const pointsForm = reactive({
  points: 1,
  remark: '系统调整积分'
});

const levelForm = reactive({
  levelId: undefined as string | number | undefined
});

const badgeForm = reactive({
  badgeId: undefined as string | number | undefined,
  remark: ''
});

const rechargeRules = {
  amount: [{ required: true, message: '请输入充值金额', trigger: 'blur' }],
  remark: [{ required: true, message: '请输入备注', trigger: 'blur' }]
};

const pointsRules = {
  points: [{ required: true, message: '请输入充值积分', trigger: 'blur' }],
  remark: [{ required: true, message: '请输入备注', trigger: 'blur' }]
};

const levelRules = {
  levelId: [{ required: true, message: '请选择会员等级', trigger: 'change' }]
};

const badgeRules = {
  badgeId: [{ required: true, message: '请选择徽章', trigger: 'change' }]
};

const memberDisplayName = computed(() => memberDetail.realName || memberDetail.user?.nickName || memberDetail.user?.userName || '会员详情');

const statusLabel = computed(() => (memberDetail.status === '1' ? '冻结' : '正常'));
const statusTagType = computed(() => (memberDetail.status === '1' ? 'danger' : 'success'));
const orderedLevels = computed(() => [...levels.value].sort((a, b) => Number(a.requiredGrowth || 0) - Number(b.requiredGrowth || 0)));
const currentLevel = computed(() => orderedLevels.value.find((item) => Number(item.id) === Number(memberDetail.levelId)));
const nextLevel = computed(() => orderedLevels.value.find((item) => Number(item.requiredGrowth || 0) > Number(memberDetail.growthValue || 0)));
const levelLabel = computed(() => memberDetail.levelName || currentLevel.value?.levelName || '未分配');
const resolvedLevelImage = computed(() => getMemberLevelImage(memberDetail.levelCode || currentLevel.value?.levelCode, memberDetail.levelImage));
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

function getLevelImageByOption(level: any) {
  return getMemberLevelImage(level?.levelCode, level?.levelImage);
}

function getBadgeImage(badge: any) {
  return getMemberBadgeImage(badge);
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

function resetLevelForm() {
  levelForm.levelId = memberDetail.levelId;
  levelFormRef.value?.resetFields?.();
}

function resetBadgeForm() {
  badgeForm.badgeId = undefined;
  badgeForm.remark = '';
  badgeFormRef.value?.resetFields?.();
}

function openRechargeDialog() {
  resetRechargeForm();
  rechargeDialogVisible.value = true;
}

function openPointsDialog() {
  resetPointsForm();
  pointsDialogVisible.value = true;
}

function openLevelDialog() {
  resetLevelForm();
  levelDialogVisible.value = true;
}

async function openBadgeDialog() {
  if (!badgeOptions.value.length) {
    const res = await listBadge({ pageNum: 1, pageSize: 100, status: '0' });
    badgeOptions.value = res.rows || [];
  }
  resetBadgeForm();
  badgeDialogVisible.value = true;
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

function submitLevelChange() {
  levelFormRef.value?.validate(async (valid: boolean) => {
    if (!valid || !memberDetail.id) return;
    levelLoading.value = true;
    try {
      await changeLevel({
        id: memberDetail.id,
        levelId: Number(levelForm.levelId)
      });
      proxy.$modal.msgSuccess('会员等级调整成功');
      levelDialogVisible.value = false;
      await refreshPage();
    } finally {
      levelLoading.value = false;
    }
  });
}

function submitBadgeGrant() {
  badgeFormRef.value?.validate(async (valid: boolean) => {
    if (!valid || !memberDetail.id) return;
    badgeLoading.value = true;
    try {
      await grantMemberBadge({
        memberId: memberDetail.id,
        badgeId: badgeForm.badgeId,
        remark: badgeForm.remark
      });
      proxy.$modal.msgSuccess('会员徽章发放成功');
      badgeDialogVisible.value = false;
      await refreshPage();
    } finally {
      badgeLoading.value = false;
    }
  });
}

async function refreshPage() {
  pageLoading.value = true;
  try {
    const userId = route.params.id;
    const [levelRes, detailRes, badgeRes] = await Promise.all([
      listLevel({ pageNum: 1, pageSize: 100 }),
      getMemberDetailByUserId(userId as string),
      listBadge({ pageNum: 1, pageSize: 100, status: '0' })
    ]);
    levels.value = levelRes.rows || [];
    badgeOptions.value = badgeRes.rows || [];
    Object.keys(memberDetail).forEach((key) => delete memberDetail[key]);
    Object.assign(memberDetail, detailRes.data || {});
    levelForm.levelId = memberDetail.levelId;
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
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
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
  grid-column: 1 / -1;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.side-grid {
  display: grid;
  gap: 14px;
  align-content: start;
}

.panel--logs {
  grid-column: 1 / -1;
  padding-bottom: 8px;
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
  min-width: 300px;
}

.detail-level-card {
  display: flex;
  align-items: stretch;
  gap: 14px;
  width: 100%;
  padding: 16px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 38%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.detail-level-card__preview,
.level-placeholder--hero {
  width: 100px;
  object-fit: contain;
}

.level-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  color: #2563eb;
  font-size: 18px;
  font-weight: 700;
}

.detail-level-card__body {
  display: grid;
  align-content: center;
  gap: 6px;
  min-width: 0;
}

.hero-level-label {
  color: #94a3b8;
  font-size: 12px;
}

.detail-level-card__body strong {
  color: #0f172a;
  font-size: 22px;
}

.detail-level-card__body small {
  color: #64748b;
  white-space: nowrap;
}

.detail-level-card__extra {
  display: grid;
  align-content: center;
  justify-items: end;
  gap: 6px;
  min-width: 110px;
  margin-left: auto;
  color: #64748b;
  font-size: 12px;
  padding-left: 16px;
  border-left: 1px solid #dbe7f5;
}

.detail-level-card__extra strong {
  color: #0f172a;
  font-size: 24px;
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

.panel {
  padding: 14px;
}

.panel-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.info-item {
  padding: 10px 12px;
  border-radius: 12px;
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
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.remark-box p {
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.7;
}

.level-box {
  margin-top: 4px;
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

.badge-wall {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.detail-badge-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.detail-badge-card__image,
.detail-badge-card__placeholder {
  display: inline-flex;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #fff;
  object-fit: contain;
}

.detail-badge-card__placeholder {
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
  color: #b45309;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
  word-break: break-word;
}

.detail-badge-card__body {
  display: grid;
  gap: 4px;
}

.detail-badge-card__body strong {
  color: #0f172a;
  font-size: 15px;
}

.detail-badge-card__body span {
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
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

.dialog-option {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.dialog-option__image {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
}

@media (max-width: 992px) {
  .detail-shell,
  .hero-panel,
  .metric-row,
  .info-grid,
  .level-list {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    display: grid;
  }

  .content-grid,
  .side-grid,
  .panel--logs {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .member-detail-page {
    padding: 12px;
  }

  .header-top,
  .hero-profile,
  .hero-level {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

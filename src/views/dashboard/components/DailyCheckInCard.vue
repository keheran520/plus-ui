<template>
  <div v-loading="loading" class="daily-checkin-card">
    <template v-if="memberReady">
      <div class="card-header">
        <div>
          <div class="card-title">{{ text.title }}</div>
          <div class="card-subtitle">{{ memberSubtitle }}</div>
        </div>
        <div :class="{ checked: signedToday }" class="checkin-badge">
          <el-icon><Calendar /></el-icon>
          <span>{{ signedToday ? text.checkedBadge : text.uncheckedBadge }}</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-item primary">
          <div class="stat-label">{{ text.streakLabel }}</div>
          <div class="stat-value">{{ streakDays }}</div>
          <div class="stat-unit">{{ text.dayUnit }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">{{ text.pointsLabel }}</div>
          <div class="stat-value">{{ memberDetail?.points || 0 }}</div>
          <div class="stat-unit">{{ text.pointsUnit }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">{{ text.growthLabel }}</div>
          <div class="stat-value">{{ memberDetail?.growthValue || 0 }}</div>
          <div class="stat-unit">{{ text.growthUnit }}</div>
        </div>
      </div>

      <div class="week-panel">
        <div v-for="day in weekDays" :key="day.date" :class="['week-day', { checked: day.checked, today: day.isToday }]">
          <div class="week-name">{{ day.label }}</div>
          <div class="week-date">{{ day.dayNumber }}</div>
          <div class="week-icon">
            <el-icon v-if="day.checked"><Select /></el-icon>
            <span v-else>{{ day.isToday ? text.todayTag : '' }}</span>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="footer-tip">
          <el-icon class="tip-icon"><TrophyBase /></el-icon>
          <span>{{ signedToday ? checkedTipText : uncheckedTipText }}</span>
        </div>
        <el-button
          :disabled="signedToday || actionLoading"
          :loading="actionLoading"
          :plain="signedToday"
          :type="signedToday ? 'success' : 'primary'"
          @click="handleCheckIn"
        >
          {{ signedToday ? text.checkedButton : text.uncheckedButton }}
        </el-button>
      </div>
    </template>

    <template v-else>
      <div class="empty-state">
        <div class="empty-icon">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="empty-title">{{ text.emptyTitle }}</div>
        <div class="empty-description">{{ emptyDescription }}</div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Calendar, Select, TrophyBase } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/modules/user';
import { getMemberCheckinStatus, getMemberDetailByUserId, memberCheckin } from '@/api/member/member';
import { getPointsLogByMemberId } from '@/api/member/pointsLog';
import type { MemberDetailVO } from '@/api/member/member/types';
import type { PointsLogVO } from '@/api/member/pointsLog/types';

type WeekDayItem = {
  label: string;
  date: string;
  dayNumber: string;
  checked: boolean;
  isToday: boolean;
};

const text = {
  title: '\u6bcf\u65e5\u7b7e\u5230',
  checkedBadge: '\u4eca\u65e5\u5df2\u7b7e',
  uncheckedBadge: '\u4eca\u65e5\u672a\u7b7e',
  streakLabel: '\u8fde\u7eed\u7b7e\u5230',
  pointsLabel: '\u5f53\u524d\u79ef\u5206',
  growthLabel: '\u6210\u957f\u503c',
  dayUnit: '\u5929',
  pointsUnit: 'pts',
  growthUnit: 'gv',
  todayTag: '\u4eca',
  checkedButton: '\u4eca\u65e5\u5df2\u7b7e\u5230',
  uncheckedButton: '\u7acb\u5373\u7b7e\u5230',
  checkedTipPrefix: '\u672c\u5468\u5df2\u7b7e\u5230 ',
  checkedTipSuffix: ' \u5929\uff0c\u7ee7\u7eed\u4fdd\u6301',
  uncheckedTipPrefix: '\u8fd8\u5dee\u4e00\u6b21\u70b9\u51fb\uff0c\u5b8c\u6210\u4eca\u65e5\u7b7e\u5230',
  checkinSuccess: '\u7b7e\u5230\u6210\u529f',
  emptyTitle: '\u6682\u65f6\u65e0\u6cd5\u7b7e\u5230',
  emptyDescription:
    '\u5f53\u524d\u767b\u5f55\u8d26\u53f7\u672a\u5173\u8054\u4f1a\u5458\u4fe1\u606f\uff0c\u6240\u4ee5\u8fd9\u91cc\u4e0d\u80fd\u76f4\u63a5\u7b7e\u5230\u3002',
  memberPrefix: '\u4f1a\u5458\u53f7 ',
  memberDivider: ' · ',
  memberSuffix: '\u4eca\u5929\u4e5f\u522b\u65ad\u7b7e'
};

const WEEK_DAY_LABELS = ['\u5468\u4e00', '\u5468\u4e8c', '\u5468\u4e09', '\u5468\u56db', '\u5468\u4e94', '\u5468\u516d', '\u5468\u65e5'];

const loading = ref(true);
const actionLoading = ref(false);
const memberDetail = ref<MemberDetailVO | null>(null);
const signedToday = ref(false);
const signDates = ref<string[]>([]);
const emptyDescription = ref(text.emptyDescription);
const userStore = useUserStore();

const today = new Date();
const todayKey = formatDate(today);

const memberReady = computed(() => Boolean(memberDetail.value?.id));
const weekDays = computed<WeekDayItem[]>(() => {
  const monday = getStartOfWeek(today);

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = addDays(monday, index);
    const dateKey = formatDate(currentDate);

    return {
      label: WEEK_DAY_LABELS[index],
      date: dateKey,
      dayNumber: pad(currentDate.getDate()),
      checked: signDates.value.includes(dateKey),
      isToday: dateKey === todayKey
    };
  });
});

const checkedThisWeekCount = computed(() => weekDays.value.filter((item) => item.checked).length);
const streakDays = computed(() => computeStreakDays(signDates.value));
const memberSubtitle = computed(() => {
  const memberNo = memberDetail.value?.memberNo || '-';
  return `${text.memberPrefix}${memberNo}${text.memberDivider}${text.memberSuffix}`;
});
const checkedTipText = computed(() => `${text.checkedTipPrefix}${checkedThisWeekCount.value}${text.checkedTipSuffix}`);
const uncheckedTipText = computed(() => text.uncheckedTipPrefix);

async function loadData() {
  loading.value = true;
  try {
    if (!userStore.userId) {
      throw new Error(text.emptyDescription);
    }

    const detailRes = await getMemberDetailByUserId(userStore.userId);
    const detail = detailRes.data || null;

    if (!detail?.id) {
      throw new Error(text.emptyDescription);
    }

    memberDetail.value = detail;

    const [statusRes, logsRes] = await Promise.all([getMemberCheckinStatus(detail.id), getPointsLogByMemberId(Number(detail.id))]);

    signedToday.value = Boolean(statusRes.data);
    signDates.value = extractSignDates(logsRes.data || []);
  } catch (error: any) {
    memberDetail.value = null;
    signedToday.value = false;
    signDates.value = [];
    emptyDescription.value = error?.message || text.emptyDescription;
  } finally {
    loading.value = false;
  }
}

async function handleCheckIn() {
  if (!memberReady.value || signedToday.value) {
    return;
  }

  actionLoading.value = true;
  try {
    await memberCheckin(memberDetail.value.id);
    ElMessage.success(text.checkinSuccess);
    await loadData();
  } finally {
    actionLoading.value = false;
  }
}

function extractSignDates(logs: PointsLogVO[]) {
  const result = logs
    .filter((log) => log.changeType === '1')
    .map((log) => normalizeDateString(log.createTime))
    .filter(Boolean) as string[];

  return Array.from(new Set(result)).sort((left, right) => (left < right ? 1 : -1));
}

function computeStreakDays(dates: string[]) {
  if (!dates.length) {
    return 0;
  }

  const uniqueSorted = Array.from(new Set(dates)).sort((left, right) => (left < right ? 1 : -1));
  let streak = 0;
  let cursor = signedToday.value ? todayKey : formatDate(addDays(today, -1));

  for (const date of uniqueSorted) {
    if (date === cursor) {
      streak += 1;
      cursor = formatDate(addDays(parseDate(date), -1));
      continue;
    }

    if (date < cursor) {
      break;
    }
  }

  return streak;
}

function normalizeDateString(value?: string) {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

function getStartOfWeek(date: Date) {
  const current = new Date(date);
  const day = current.getDay() || 7;
  current.setHours(0, 0, 0, 0);
  current.setDate(current.getDate() - day + 1);
  return current;
}

function addDays(date: Date, days: number) {
  const current = new Date(date);
  current.setDate(current.getDate() + days);
  return current;
}

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.daily-checkin-card {
  margin-top: 16px;
  padding: 24px;
  min-height: 332px;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.card-title {
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.card-subtitle {
  margin-top: 6px;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.checkin-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  white-space: nowrap;
}

.checkin-badge.checked {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.stat-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
}

.stat-item.primary {
  border-color: #bfdbfe;
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
}

.stat-label {
  color: #6b7280;
  font-size: 12px;
}

.stat-value {
  margin-top: 10px;
  color: #111827;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.stat-unit {
  margin-top: 6px;
  color: #9ca3af;
  font-size: 12px;
}

.week-panel {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.week-day {
  padding: 14px 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  text-align: center;
  transition: all 0.2s ease;
}

.week-day.today {
  border-color: #93c5fd;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.08);
}

.week-day.checked {
  border-color: #bbf7d0;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
}

.week-name {
  color: #6b7280;
  font-size: 12px;
}

.week-date {
  margin-top: 8px;
  color: #111827;
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
}

.week-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 20px;
  margin-top: 10px;
  color: #16a34a;
  font-size: 12px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid #eef2f7;
}

.footer-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.6;
}

.tip-icon {
  color: #f59e0b;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 284px;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 24px;
}

.empty-title {
  margin-top: 18px;
  color: #111827;
  font-size: 18px;
  font-weight: 600;
}

.empty-description {
  max-width: 420px;
  margin-top: 10px;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.8;
}

@media (max-width: 992px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .week-panel {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 640px) {
  .daily-checkin-card {
    padding: 18px;
  }

  .card-header {
    flex-direction: column;
  }

  .week-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

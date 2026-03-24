<template>
  <el-drawer :model-value="visible" :title="drawerTitle" class="user-drawer" direction="rtl" size="560px" @close="emit('update:visible', false)">
    <div v-loading="loading" class="drawer-shell">
      <section class="profile-hero">
        <div class="hero-main">
          <el-avatar :size="58" :src="profile.avatar">{{ profileInitial }}</el-avatar>
          <div class="hero-meta">
            <div class="hero-name">{{ profile.nickName || profile.userName || `用户 ${userId ?? '-'}` }}</div>
            <div class="hero-sub">{{ profile.userName || '未获取到用户名' }}</div>
          </div>
        </div>
        <div class="hero-side">
          <div class="hero-id">ID {{ userId ?? '-' }}</div>
          <el-tag :type="profile.status === '0' ? 'success' : 'info'" effect="light" round>
            {{ profile.status === '0' ? '正常' : '未知' }}
          </el-tag>
        </div>
      </section>

      <section class="profile-grid">
        <div class="profile-card">
          <span class="card-label">部门</span>
          <span class="card-value">{{ profile.deptName || '暂无' }}</span>
        </div>
        <div class="profile-card">
          <span class="card-label">手机号</span>
          <span class="card-value">{{ formatContactDisplay(profile.phonenumber, '未绑定手机号') }}</span>
        </div>
        <div class="profile-card">
          <span class="card-label">邮箱</span>
          <span class="card-value">{{ formatContactDisplay(profile.email, '未绑定邮箱') }}</span>
        </div>
        <div class="profile-card">
          <span class="card-label">最近登录</span>
          <span class="card-value">{{ profile.loginDate || '暂无' }}</span>
        </div>
      </section>

      <section class="section-block">
        <div class="section-head">
          <span class="section-title">活跃概况</span>
          <span class="section-note">当前行为统计汇总</span>
        </div>
        <div class="score-panel">
          <div class="score-ring">
            <div class="score-value">{{ stats.activityScore }}</div>
            <div class="score-text">活跃分</div>
          </div>
          <div class="score-metrics">
            <div class="metric-card">
              <span class="metric-label">总行为</span>
              <span class="metric-value">{{ stats.totalActions }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">今日行为</span>
              <span class="metric-value">{{ stats.todayActions }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section-block">
        <div class="section-head">
          <span class="section-title">互动明细</span>
          <span class="section-note">点赞、收藏、评论三类行为</span>
        </div>
        <div class="detail-grid">
          <div class="detail-card like">
            <div class="detail-name">点赞</div>
            <div class="detail-number">{{ stats.likeCount }}</div>
            <div class="detail-sub">取消 {{ stats.unlikeCount }} / 净值 {{ stats.netLikes }}</div>
          </div>
          <div class="detail-card favorite">
            <div class="detail-name">收藏</div>
            <div class="detail-number">{{ stats.favoriteCount }}</div>
            <div class="detail-sub">取消 {{ stats.unfavoriteCount }} / 净值 {{ stats.netFavorites }}</div>
          </div>
          <div class="detail-card comment">
            <div class="detail-name">评论</div>
            <div class="detail-number">{{ stats.commentCount }}</div>
            <div class="detail-sub">删除 {{ stats.deleteCommentCount }} / 净值 {{ stats.netComments }}</div>
          </div>
        </div>
      </section>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { getUserStatistics } from '@/api/social/userAction';
import { getUser } from '@/api/system/user';
import { formatContactDisplay } from '@/utils/contact';

const props = defineProps<{
  visible: boolean;
  userId?: string | number;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const loading = ref(false);
const profile = reactive<any>({
  userId: undefined,
  userName: '',
  nickName: '',
  avatar: '',
  status: '',
  deptName: '',
  phonenumber: '',
  email: '',
  loginDate: ''
});
const stats = reactive({
  totalActions: 0,
  likeCount: 0,
  unlikeCount: 0,
  favoriteCount: 0,
  unfavoriteCount: 0,
  commentCount: 0,
  deleteCommentCount: 0,
  netLikes: 0,
  netFavorites: 0,
  netComments: 0,
  activityScore: 0,
  todayActions: 0
});

const drawerTitle = computed(() => `用户信息与行为统计`);
const profileInitial = computed(() => (profile.nickName || profile.userName || 'U').slice(0, 1).toUpperCase());

function resetProfile() {
  profile.userId = undefined;
  profile.userName = '';
  profile.nickName = '';
  profile.avatar = '';
  profile.status = '';
  profile.deptName = '';
  profile.phonenumber = '';
  profile.email = '';
  profile.loginDate = '';
}

function resetStats() {
  stats.totalActions = 0;
  stats.likeCount = 0;
  stats.unlikeCount = 0;
  stats.favoriteCount = 0;
  stats.unfavoriteCount = 0;
  stats.commentCount = 0;
  stats.deleteCommentCount = 0;
  stats.netLikes = 0;
  stats.netFavorites = 0;
  stats.netComments = 0;
  stats.activityScore = 0;
  stats.todayActions = 0;
}

async function loadUserPanel() {
  if (!props.visible || props.userId === undefined || props.userId === null || props.userId === '') return;
  loading.value = true;
  resetProfile();
  resetStats();
  try {
    const [userRes, statRes] = await Promise.allSettled([getUser(props.userId), getUserStatistics(props.userId)]);
    if (userRes.status === 'fulfilled') {
      Object.assign(profile, userRes.value.data?.user || {});
    }
    if (statRes.status === 'fulfilled') {
      Object.assign(stats, statRes.value.data || {});
    }
  } finally {
    loading.value = false;
  }
}

watch(
  () => [props.visible, props.userId],
  () => {
    if (!props.visible) return;
    loadUserPanel();
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.drawer-shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-right: 4px;
}

.profile-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 42%), linear-gradient(135deg, #f8fbff 0%, #eef4fb 100%);
  border: 1px solid #e1eaf5;
  border-radius: 14px;
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero-name {
  font-size: 18px;
  font-weight: 600;
  color: #182230;
}

.hero-sub,
.hero-id,
.section-note,
.card-label,
.detail-sub {
  font-size: 12px;
  color: #7a8699;
}

.hero-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  background: #fff;
}

.card-value,
.metric-value,
.detail-number {
  color: #182230;
  font-weight: 600;
}

.section-block {
  padding: 16px;
  border: 1px solid #e8edf5;
  border-radius: 14px;
  background: #fff;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #182230;
}

.score-panel {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 14px;
  align-items: center;
}

.score-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 148px;
  height: 148px;
  margin: 0 auto;
  border-radius: 999px;
  background: radial-gradient(circle, #fff 48%, transparent 49%), conic-gradient(from 220deg, #2563eb, #60a5fa, #93c5fd, #2563eb);
  box-shadow: inset 0 0 0 10px rgba(255, 255, 255, 0.92);
}

.score-value {
  font-size: 34px;
  line-height: 1;
  font-weight: 700;
  color: #1d4ed8;
}

.score-text {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.score-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 16px;
  border-radius: 12px;
  background: #f8fafc;
}

.metric-label,
.detail-name {
  font-size: 13px;
  color: #667085;
}

.metric-value {
  font-size: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.detail-card {
  padding: 16px;
  border-radius: 14px;
  color: #182230;

  &.like {
    background: linear-gradient(180deg, #fff2f2 0%, #fff 100%);
    border: 1px solid #ffd9d9;
  }

  &.favorite {
    background: linear-gradient(180deg, #fff8eb 0%, #fff 100%);
    border: 1px solid #ffe3ad;
  }

  &.comment {
    background: linear-gradient(180deg, #eef8ff 0%, #fff 100%);
    border: 1px solid #cfe6ff;
  }
}

.detail-number {
  margin: 10px 0 6px;
  font-size: 28px;
}

@media (max-width: 768px) {
  .profile-hero,
  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-grid,
  .score-panel,
  .score-metrics,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .hero-side {
    align-items: flex-start;
    margin-top: 10px;
  }
}
</style>

<template>
  <div class="home-container">
    <!-- 背景：配置未加载时用默认渐变，加载后懒加载背景图 -->
    <div class="hero-background">
      <transition name="bg-fade">
        <img v-if="bgLoaded && websiteConfig.backgroundImage" :src="websiteConfig.backgroundImage" alt="背景图" class="background-image" />
      </transition>
      <div class="hero-overlay"></div>
    </div>

    <!-- 主内容 -->
    <div class="hero-content">
      <!-- 标题区 -->
      <div class="hero-header">
        <!-- 加载中骨架 -->
        <template v-if="websiteStore.loading">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-subtitle"></div>
        </template>
        <template v-else>
          <h1 class="hero-title animate-in" style="--delay: 0ms">
            {{ websiteConfig.name || '图床云存储' }}
          </h1>
          <p class="hero-subtitle animate-in" style="--delay: 150ms">
            {{ websiteConfig.nameEn || 'Your photo album on the cloud.' }}
          </p>
        </template>

        <div class="hero-stats animate-in" style="--delay: 300ms">
          <span
            >本站已托管 <b class="count-num">{{ displayImages }}</b> 张图片</span
          >
          <span class="divider">|</span>
          <span
            >共占用存储 <b class="count-num">{{ displaySize }}</b></span
          >
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="hero-actions animate-in" style="--delay: 450ms">
        <el-button :icon="Upload" size="large" @click="showUploadDialog = true"> 游客上传 </el-button>
        <el-button :icon="Picture" size="large" @click="goToSquare"> 图片广场 </el-button>
        <el-button :icon="User" size="large" @click="goToLogin"> 登录/注册 </el-button>
      </div>

      <!-- 特性卡片 -->
      <div v-if="false" class="features">
        <div v-for="(feat, i) in features" :key="feat.title" :style="`--delay: ${600 + i * 120}ms`" class="feature-item animate-in">
          <el-icon :size="32"><component :is="feat.icon" /></el-icon>
          <h3>{{ feat.title }}</h3>
          <p>{{ feat.desc }}</p>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="hero-footer animate-in" style="--delay: 1000ms">
      <template v-if="websiteStore.loading">
        <div class="skeleton skeleton-footer"></div>
      </template>
      <template v-else>
        <p v-if="websiteConfig.copyright" class="copyright">{{ websiteConfig.copyright }}</p>
        <p v-if="websiteConfig.icp" class="icp">
          <a href="https://beian.miit.gov.cn/" rel="noopener noreferrer" target="_blank">
            {{ websiteConfig.icp }}
          </a>
        </p>
      </template>
    </div>

    <!-- 批量上传 -->
    <BatchUpload v-model="showUploadDialog" :guest-mode="true" title="游客上传" @success="handleUploadSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Link, Picture, Upload, User } from '@element-plus/icons-vue';
import BatchUpload from '@/components/ImageUpload/BatchUpload.vue';
import { getStatistics } from '@/api/picturebed/open';
import { useWebsiteStore } from '@/store/modules/website';

const websiteStore = useWebsiteStore();
const router = useRouter();

const websiteConfig = computed(() => websiteStore.config);

// 背景图懒加载：watch 加 immediate，处理从其他页面返回时 store 已有值的情况
const bgLoaded = ref(false);
watch(
  () => websiteConfig.value.backgroundImage,
  (url) => {
    if (!url) return;
    if (bgLoaded.value) return; // 已加载过就不重复
    const img = new Image();
    img.onload = () => { bgLoaded.value = true; };
    img.onerror = () => { bgLoaded.value = true; }; // 加载失败也显示（降级到渐变背景）
    img.src = url;
  },
  { immediate: true }
);

// 统计原始数据
const stats = ref({ totalImages: 0, totalSize: 0 });

// 数字滚动动效
const displayImages = ref('0');
const displaySize = ref('0 B');

function animateCount(target: number, setter: (v: string) => void, formatter: (n: number) => string, duration = 1200) {
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    setter(formatter(Math.floor(eased * target)));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

const getStats = async () => {
  try {
    const res = await getStatistics();
    if (res.code === 200) {
      const total = Math.max(0, Number(res.data.totalCount) || 0);
      const size = Math.max(0, Number(res.data.totalSize) || 0);
      stats.value = { totalImages: total, totalSize: size };
      if (total > 0) {
        animateCount(
          total,
          (v) => {
            displayImages.value = v.toLocaleString();
          },
          (n) => n.toLocaleString()
        );
      } else {
        displayImages.value = '0';
      }
      if (size > 0) {
        animateCount(
          size,
          (v) => {
            displaySize.value = v;
          },
          formatSize
        );
      } else {
        displaySize.value = '0 B';
      }
    }
  } catch (_) {}
};

// 特性列表
const features = [
  { icon: Upload, title: '快速上传', desc: '支持批量上传，拖拽即可' },
  { icon: Link, title: '外链分享', desc: '一键复制图片链接' },
  { icon: Picture, title: '图片管理', desc: '相册分类，轻松管理' }
];

const showUploadDialog = ref(false);

const handleUploadSuccess = (data: any) => {
  ElMessage.success(`成功上传 ${data.length} 张图片`);
};

const goToSquare = () => router.push('/picturebed/square');
const goToLogin = () => router.push('/login');

onMounted(() => {
  websiteStore.fetchWebsiteConfig();
  getStats();
});
</script>

<style lang="scss" scoped>
/* ===== 入场动效 ===== */
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  opacity: 0;
  animation: fadeSlideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--delay, 0ms);
}

/* ===== 背景淡入 ===== */
.bg-fade-enter-active {
  transition: opacity 1.2s ease;
}
.bg-fade-enter-from {
  opacity: 0;
}

/* ===== 骨架屏 ===== */
@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

.skeleton {
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08) 25%, rgba(255, 255, 255, 0.18) 50%, rgba(255, 255, 255, 0.08) 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  margin: 0 auto 16px;
}
.skeleton-title {
  width: 320px;
  height: 64px;
}
.skeleton-subtitle {
  width: 260px;
  height: 24px;
}
.skeleton-footer {
  width: 200px;
  height: 16px;
}

/* ===== 布局 ===== */
.home-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0a1628 0%, #0d2b4e 100%);

  .background-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0, 20, 40, 0.82) 0%, rgba(0, 40, 80, 0.72) 100%);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  color: #fff;
}

/* ===== 标题区 ===== */
.hero-header {
  text-align: center;
  margin-bottom: 48px;

  .hero-title {
    margin: 0 0 16px;
    font-size: 64px;
    font-weight: 700;
    letter-spacing: 2px;
    background: linear-gradient(135deg, #fff 0%, #a8d8ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    margin: 0 0 24px;
    font-size: 20px;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 300;
    letter-spacing: 1px;
  }

  .hero-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.65);

    .count-num {
      font-weight: 600;
      color: #7ec8ff;
      font-variant-numeric: tabular-nums;
    }

    .divider {
      color: rgba(255, 255, 255, 0.25);
    }
  }
}

/* ===== 按钮区 ===== */
.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 80px;
}

/* ===== 特性卡片 ===== */
.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  max-width: 860px;

  .feature-item {
    text-align: center;
    padding: 32px 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: default;
    transition:
      background 0.3s ease,
      transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-10px) scale(1.03);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .el-icon {
      margin-bottom: 16px;
      color: #409eff;
      transition:
        transform 0.3s ease,
        color 0.3s ease;
    }

    &:hover .el-icon {
      transform: scale(1.2) rotate(-5deg);
      color: #7ec8ff;
    }

    h3 {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 600;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.65);
    }
  }
}

/* ===== 页脚 ===== */
.hero-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  z-index: 2;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.3) 0%, transparent 100%);

  p {
    margin: 4px 0;
  }

  .copyright {
    font-weight: 500;
  }

  .icp a {
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    transition: color 0.3s;
    &:hover {
      color: #fff;
    }
  }
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .hero-header {
    .hero-title {
      font-size: 40px;
    }
    .hero-subtitle {
      font-size: 16px;
    }
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    .el-button {
      width: 100%;
    }
  }

  .features {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .hero-footer {
    font-size: 12px;
    padding: 16px;
  }

  .skeleton-title {
    width: 200px;
    height: 44px;
  }
}
</style>

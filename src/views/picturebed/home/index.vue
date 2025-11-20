<template>
  <div class="home-container">
    <!-- 背景视频或图片 -->
    <div class="hero-background">
      <div class="hero-overlay"></div>
    </div>

    <!-- 主内容 -->
    <div class="hero-content">
      <!-- Logo 和标题 -->
      <div class="hero-header">
        <h1 class="hero-title">图床云存储</h1>
        <p class="hero-subtitle">Your photo album on the cloud.</p>
        <div class="hero-stats">
          <span>本站已托管 {{ stats.totalImages }} 张图片</span>
          <span class="divider">|</span>
          <span>共占用存储 {{ formatSize(stats.totalSize) }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="hero-actions">
        <el-button :icon="Upload" round size="large" type="primary" @click="showUploadDialog = true"> 游客上传 </el-button>
        <el-button :icon="Picture" round size="large" type="success" @click="goToSquare"> 图片广场</el-button>
        <el-button :icon="User" round size="large" @click="goToLogin"> 登录/注册</el-button>
      </div>

      <!-- 特性介绍 -->
      <div class="features">
        <div class="feature-item">
          <el-icon :size="32">
            <Upload />
          </el-icon>
          <h3>快速上传</h3>
          <p>支持批量上传，拖拽即可</p>
        </div>
        <div class="feature-item">
          <el-icon :size="32">
            <Link />
          </el-icon>
          <h3>外链分享</h3>
          <p>一键复制图片链接</p>
        </div>
        <div class="feature-item">
          <el-icon :size="32">
            <Picture />
          </el-icon>
          <h3>图片管理</h3>
          <p>相册分类，轻松管理</p>
        </div>
      </div>
    </div>

    <!-- 批量上传组件 -->
    <BatchUpload v-model="showUploadDialog" :guest-mode="true" title="游客上传" @success="handleUploadSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Link, Picture, Upload, User } from '@element-plus/icons-vue';
import BatchUpload from '@/components/ImageUpload/BatchUpload.vue';
import { getStatistics } from '@/api/picturebed/open';

const router = useRouter();

// 统计数据
const stats = ref({
  totalImages: 0,
  totalSize: 0
});

// 上传相关
const showUploadDialog = ref(false);

// 获取统计数据
const getStats = async () => {
  try {
    const res = await getStatistics();
    if (res.code === 200) {
      stats.value = {
        totalImages: res.data.totalCount || 0,
        totalSize: res.data.totalSize || 0
      };
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

// 格式化文件大小
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

// 上传成功回调
const handleUploadSuccess = (data: any) => {
  ElMessage.success(`成功上传 ${data.length} 张图片`);
  console.log('上传结果：', data);
};

// 跳转到广场
const goToSquare = () => {
  router.push('/picturebed/square');
};

// 跳转到登录
const goToLogin = () => {
  router.push('/login');
};

onMounted(() => {
  getStats();
});
</script>

<style lang="scss" scoped>
.home-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

// 背景
.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072') center/cover no-repeat;

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0, 20, 40, 0.85) 0%, rgba(0, 40, 80, 0.75) 100%);
  }
}

// 主内容
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

// 头部
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
    color: rgba(255, 255, 255, 0.9);
    font-weight: 300;
  }

  .hero-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);

    .divider {
      color: rgba(255, 255, 255, 0.3);
    }
  }
}

// 操作按钮
.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 80px;
}

// 特性介绍
.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  max-width: 900px;

  .feature-item {
    text-align: center;
    padding: 32px 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
    }

    .el-icon {
      margin-bottom: 16px;
      color: #409eff;
    }

    h3 {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 600;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

// 响应式
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
    gap: 20px;
  }
}
</style>

<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <header :class="{ 'header-scrolled': isScrolled }" class="header">
      <div class="header-container">
        <div class="logo">
          <div class="logo-icon-wrapper">
            <span class="logo-icon">✨</span>
          </div>
          <div class="logo-text-wrapper">
            <span class="logo-text gradient-text">星云</span>
            <span class="logo-subtitle">StarCloud</span>
          </div>
        </div>

        <nav class="nav-menu">
          <a class="nav-item" href="#home">
            <i class="icon">🏠</i>
            <span>首页</span>
          </a>
          <a class="nav-item" href="#products">
            <i class="icon">📦</i>
            <span>产品</span>
          </a>
          <a class="nav-item" href="#features">
            <i class="icon">⭐</i>
            <span>特色</span>
          </a>
          <a class="nav-item" href="#pricing">
            <i class="icon">💰</i>
            <span>价格</span>
          </a>
        </nav>

        <div class="header-actions">
          <el-button class="login-btn" text @click="goToLogin">
            <i class="icon">👤</i>
            登录
          </el-button>
          <el-button class="gradient-btn register-btn" type="primary" @click="goToRegister">
            <i class="icon">🚀</i>
            免费注册
          </el-button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section id="home" class="hero-section">
      <!-- 动态背景 -->
      <div class="hero-background">
        <div class="gradient-bg"></div>
        <div class="particles">
          <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
        </div>
        <div class="floating-shapes">
          <div class="shape shape-1">💫</div>
          <div class="shape shape-2">✨</div>
          <div class="shape shape-3">⭐</div>
          <div class="shape shape-4">🌟</div>
          <div class="shape shape-5">💖</div>
        </div>
      </div>

      <div class="hero-content">
        <!-- 欢迎标签 -->
        <div class="welcome-badge">
          <span class="badge-icon">🎉</span>
          <span class="badge-text">欢迎来到星云云计算平台</span>
        </div>

        <h1 class="hero-title">
          <div class="title-line">
            <span class="title-emoji">☁️</span>
            <span class="gradient-text-animated">星云云计算</span>
          </div>
          <div class="title-subtitle">让每一朵云都闪耀光芒</div>
        </h1>

        <p class="hero-description">
          <span class="desc-item">🚀 极速部署</span>
          <span class="desc-divider">·</span>
          <span class="desc-item">💎 高性价比</span>
          <span class="desc-divider">·</span>
          <span class="desc-item">🛡️ 安全可靠</span>
          <span class="desc-divider">·</span>
          <span class="desc-item">💝 贴心服务</span>
        </p>

        <div class="hero-buttons">
          <el-button class="gradient-btn primary-btn" size="large" type="primary" @click="goToBuy">
            <span class="btn-icon">🎯</span>
            <span>立即开始</span>
            <span class="btn-arrow">→</span>
          </el-button>
          <el-button class="outline-btn" size="large" @click="scrollToProducts">
            <span class="btn-icon">📖</span>
            <span>了解更多</span>
          </el-button>
        </div>

        <!-- 信任标识 -->
        <div class="trust-badges">
          <div class="trust-item">
            <div class="trust-icon">👥</div>
            <div class="trust-info">
              <div class="trust-value">15,000+</div>
              <div class="trust-label">企业用户</div>
            </div>
          </div>
          <div class="trust-divider"></div>
          <div class="trust-item">
            <div class="trust-icon">⚡</div>
            <div class="trust-info">
              <div class="trust-value">99.99%</div>
              <div class="trust-label">服务可用性</div>
            </div>
          </div>
          <div class="trust-divider"></div>
          <div class="trust-item">
            <div class="trust-icon">💬</div>
            <div class="trust-info">
              <div class="trust-value">24/7</div>
              <div class="trust-label">在线支持</div>
            </div>
          </div>
          <div class="trust-divider"></div>
          <div class="trust-item">
            <div class="trust-icon">🏆</div>
            <div class="trust-info">
              <div class="trust-value">5年+</div>
              <div class="trust-label">行业经验</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 滚动提示 -->
      <div class="scroll-indicator">
        <div class="scroll-text">向下滚动探索更多</div>
        <div class="scroll-arrow">↓</div>
      </div>
    </section>

    <!-- 产品套餐 -->
    <section id="products" class="products-section">
      <div class="section-header">
        <div class="section-badge">
          <span class="badge-icon">🎁</span>
          <span>热门产品</span>
        </div>
        <h2 class="section-title">
          <span class="gradient-text-animated">精选云服务器套餐</span>
        </h2>
        <p class="section-subtitle">
          <span class="emoji">💝</span>
          为您精心挑选的高性价比方案
          <span class="emoji">💝</span>
        </p>
      </div>

      <div class="products-grid">
        <div v-for="product in products" :key="product.id" :class="['product-card', { 'is-popular': product.popular }]" @click="buyProduct(product)">
          <!-- 热门标签 -->
          <div v-if="product.popular" class="popular-badge">
            <div class="badge-glow"></div>
            <span class="badge-icon">🔥</span>
            <span class="badge-text">最受欢迎</span>
          </div>

          <!-- 装饰元素 -->
          <div class="card-decoration">
            <div class="deco-circle deco-1"></div>
            <div class="deco-circle deco-2"></div>
          </div>

          <div class="card-header">
            <div class="product-icon">{{ product.emoji }}</div>
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-desc">{{ product.desc }}</div>
          </div>

          <div class="card-price">
            <div class="price-wrapper">
              <span class="price-symbol">¥</span>
              <span class="price-amount">{{ product.price }}</span>
              <span class="price-period">/月</span>
            </div>
            <div class="price-original" v-if="product.originalPrice">
              原价 ¥{{ product.originalPrice }}
            </div>
          </div>

          <div class="card-body">
            <ul class="feature-list">
              <li v-for="(spec, index) in product.specs" :key="index" class="feature-item">
                <span class="feature-icon">✓</span>
                <span class="feature-text">{{ spec }}</span>
              </li>
            </ul>
          </div>

          <div class="card-footer">
            <el-button :class="['btn-buy', { 'gradient-btn': product.popular }]" block>
              <span class="btn-icon">🛒</span>
              <span>{{ product.popular ? '立即抢购' : '立即购买' }}</span>
            </el-button>
          </div>

          <!-- 悬停效果 -->
          <div class="card-hover-effect"></div>
        </div>
      </div>

      <!-- 更多套餐提示 -->
      <div class="more-products">
        <el-button class="more-btn" size="large" @click="viewAllProducts">
          <span>查看全部套餐</span>
          <span class="btn-arrow">→</span>
        </el-button>
      </div>
    </section>

    <!-- 特色功能 -->
    <section id="features" class="features-section">
      <div class="section-header">
        <div class="section-badge">
          <span class="badge-icon">⭐</span>
          <span>核心优势</span>
        </div>
        <h2 class="section-title">
          <span class="gradient-text-animated">为什么选择星云</span>
        </h2>
        <p class="section-subtitle">
          <span class="emoji">🌈</span>
          我们用心打造每一项服务
          <span class="emoji">🌈</span>
        </p>
      </div>

      <div class="features-grid">
        <div v-for="(feature, index) in features" :key="feature.id" :style="{ animationDelay: `${index * 0.1}s` }" class="feature-card">
          <div class="feature-icon-wrapper" :style="{ background: feature.gradient }">
            <div class="icon-glow"></div>
            <div class="feature-icon">{{ feature.icon }}</div>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
          <div class="feature-link">
            <span>了解详情</span>
            <span class="link-arrow">→</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 价格对比 -->
    <section id="pricing" class="pricing-section">
      <div class="section-header">
        <div class="section-badge">
          <span class="badge-icon">💰</span>
          <span>价格透明</span>
        </div>
        <h2 class="section-title">
          <span class="gradient-text-animated">超值性价比</span>
        </h2>
        <p class="section-subtitle">
          <span class="emoji">💎</span>
          同等配置，价格更优
          <span class="emoji">💎</span>
        </p>
      </div>

      <div class="pricing-comparison">
        <div class="comparison-card">
          <div class="comparison-header">
            <h3>其他平台</h3>
            <div class="comparison-icon sad">😔</div>
          </div>
          <div class="comparison-body">
            <div class="comparison-item negative">
              <span class="item-icon">❌</span>
              <span>价格昂贵</span>
            </div>
            <div class="comparison-item negative">
              <span class="item-icon">❌</span>
              <span>配置复杂</span>
            </div>
            <div class="comparison-item negative">
              <span class="item-icon">❌</span>
              <span>响应缓慢</span>
            </div>
          </div>
        </div>

        <div class="vs-divider">
          <div class="vs-text">VS</div>
        </div>

        <div class="comparison-card highlight">
          <div class="comparison-header">
            <h3>星云云计算</h3>
            <div class="comparison-icon happy">🥰</div>
          </div>
          <div class="comparison-body">
            <div class="comparison-item positive">
              <span class="item-icon">✅</span>
              <span>价格实惠</span>
            </div>
            <div class="comparison-item positive">
              <span class="item-icon">✅</span>
              <span>一键部署</span>
            </div>
            <div class="comparison-item positive">
              <span class="item-icon">✅</span>
              <span>极速响应</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-decoration">
        <div class="deco-wave"></div>
      </div>

      <div class="footer-content">
        <div class="footer-main">
          <div class="footer-brand">
            <div class="brand-logo">
              <span class="brand-icon">✨</span>
              <span class="brand-text gradient-text-animated">星云</span>
            </div>
            <p class="brand-slogan">让每一朵云都闪耀光芒 ✨</p>
            <div class="brand-social">
              <a class="social-link" href="#"><span>📧</span></a>
              <a class="social-link" href="#"><span>💬</span></a>
              <a class="social-link" href="#"><span>📱</span></a>
            </div>
          </div>

          <div class="footer-links">
            <div class="footer-section">
              <h4 class="section-title">
                <span class="title-icon">🎯</span>
                产品服务
              </h4>
              <a class="footer-link" href="#">云服务器</a>
              <a class="footer-link" href="#">云硬盘</a>
              <a class="footer-link" href="#">云数据库</a>
              <a class="footer-link" href="#">对象存储</a>
            </div>

            <div class="footer-section">
              <h4 class="section-title">
                <span class="title-icon">📚</span>
                帮助中心
              </h4>
              <a class="footer-link" href="#">使用文档</a>
              <a class="footer-link" href="#">API文档</a>
              <a class="footer-link" href="#">常见问题</a>
              <a class="footer-link" href="#">视频教程</a>
            </div>

            <div class="footer-section">
              <h4 class="section-title">
                <span class="title-icon">💬</span>
                联系我们
              </h4>
              <a class="footer-link" href="#">在线客服</a>
              <a class="footer-link" href="#">工单系统</a>
              <a class="footer-link" href="#">电话支持</a>
              <a class="footer-link" href="#">商务合作</a>
            </div>

            <div class="footer-section">
              <h4 class="section-title">
                <span class="title-icon">ℹ️</span>
                关于我们
              </h4>
              <a class="footer-link" href="#">公司介绍</a>
              <a class="footer-link" href="#">加入我们</a>
              <a class="footer-link" href="#">服务协议</a>
              <a class="footer-link" href="#">隐私政策</a>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p class="copyright">
            <span class="copyright-icon">©</span>
            2024 星云云计算 (StarCloud). All rights reserved.
            <span class="heart-icon">💖</span>
          </p>
          <div class="footer-badges">
            <span class="badge">🔒 安全认证</span>
            <span class="badge">✅ 可信网站</span>
            <span class="badge">🏆 优质服务</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" name="HomePage" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isScrolled = ref(false);

const products = ref([
  {
    id: 1,
    name: '轻量版',
    desc: '个人开发者首选',
    emoji: '🌱',
    price: 19,
    originalPrice: 39,
    popular: false,
    specs: ['1核 CPU', '1GB 内存', '20GB SSD 硬盘', '500GB 月流量', '1Mbps 峰值带宽']
  },
  {
    id: 2,
    name: '标准版',
    desc: '中小企业推荐',
    emoji: '🚀',
    price: 59,
    originalPrice: 99,
    popular: true,
    specs: ['4核 CPU', '4GB 内存', '80GB SSD 硬盘', '2TB 月流量', '5Mbps 峰值带宽', '免费备份']
  },
  {
    id: 3,
    name: '专业版',
    desc: '高性能应用',
    emoji: '⚡',
    price: 129,
    originalPrice: 199,
    popular: false,
    specs: ['8核 CPU', '16GB 内存', '200GB SSD 硬盘', '5TB 月流量', '10Mbps 峰值带宽', '免费备份', '专属客服']
  }
]);

const features = ref([
  {
    id: 1,
    icon: '⚡',
    title: '闪电部署',
    description: '60秒极速开通，一键部署应用，让您的业务快速上线',
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #FFA06B 100%)'
  },
  {
    id: 2,
    icon: '🛡️',
    title: '安全防护',
    description: 'DDoS防护、数据加密、多重备份，全方位保护您的数据安全',
    gradient: 'linear-gradient(135deg, #C471ED 0%, #F64F59 100%)'
  },
  {
    id: 3,
    icon: '🌐',
    title: 'BGP多线',
    description: 'BGP多线接入，智能路由，全国访问延迟低至30ms',
    gradient: 'linear-gradient(135deg, #12D8FA 0%, #A6FFCB 100%)'
  },
  {
    id: 4,
    icon: '💝',
    title: '贴心服务',
    description: '7x24小时在线客服，专业技术团队随时为您解决问题',
    gradient: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)'
  },
  {
    id: 5,
    icon: '💰',
    title: '按需付费',
    description: '灵活计费模式，按小时或包月计费，用多少付多少',
    gradient: 'linear-gradient(135deg, #FFA06B 0%, #FFD06B 100%)'
  },
  {
    id: 6,
    icon: '📊',
    title: '实时监控',
    description: '可视化监控面板，实时掌握服务器运行状态和性能指标',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
]);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

const getParticleStyle = (index: number) => {
  const size = Math.random() * 4 + 2;
  const duration = Math.random() * 10 + 10;
  const delay = Math.random() * 5;
  const left = Math.random() * 100;

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  };
};

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};

const goToBuy = () => {
  router.push('/buy');
};

const scrollToProducts = () => {
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
};

const buyProduct = (product: any) => {
  router.push(`/buy?product=${product.id}`);
};

const viewAllProducts = () => {
  router.push('/products');
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
// 变量定义
$gradient-pink: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
$gradient-purple: linear-gradient(135deg, #c471ed 0%, #f64f59 100%);
$gradient-blue: linear-gradient(135deg, #12d8fa 0%, #a6ffcb 100%);
$gradient-green: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
$gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

.home-page {
  min-height: 100vh;
  background: #f8f9fe;
  overflow-x: hidden;
}

// ========== 顶部导航 ==========
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &.header-scrolled {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);

    .logo-icon-wrapper {
      transform: scale(0.9);
    }
  }

  .header-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 16px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }

    .logo-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: $gradient-pink;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(255, 107, 157, 0.4);
      transition: all 0.3s ease;

      .logo-icon {
        font-size: 28px;
        animation: rotate 10s linear infinite;
      }
    }

    .logo-text-wrapper {
      display: flex;
      flex-direction: column;

      .logo-text {
        font-size: 24px;
        font-weight: 700;
        line-height: 1;
      }

      .logo-subtitle {
        font-size: 11px;
        color: #909399;
        margin-top: 2px;
        letter-spacing: 1px;
      }
    }
  }

  .nav-menu {
    display: flex;
    gap: 8px;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      border-radius: 12px;
      color: #303133;
      text-decoration: none;
      font-weight: 500;
      font-size: 15px;
      transition: all 0.3s ease;
      position: relative;

      .icon {
        font-size: 18px;
        transition: transform 0.3s ease;
      }

      &:hover {
        background: rgba(255, 107, 157, 0.1);
        color: #ff6b9d;
        transform: translateY(-2px);

        .icon {
          transform: scale(1.2);
        }
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%) scaleX(0);
        width: 60%;
        height: 3px;
        background: $gradient-pink;
        border-radius: 2px;
        transition: transform 0.3s ease;
      }

      &:hover::after {
        transform: translateX(-50%) scaleX(1);
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;

    .login-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 24px;
      border-radius: 12px;
      font-weight: 500;
      transition: all 0.3s ease;

      .icon {
        font-size: 16px;
      }

      &:hover {
        background: rgba(255, 107, 157, 0.1);
        color: #ff6b9d;
      }
    }

    .register-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 28px;
      border-radius: 12px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);

      .icon {
        font-size: 16px;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(255, 107, 157, 0.5);
      }
    }
  }
}

// ========== Hero Section ==========
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 100px 20px 80px;

  .hero-background {
    position: absolute;
    inset: 0;
    z-index: 0;

    .gradient-bg {
      position: absolute;
      inset: 0;
      background: $gradient-hero;
      opacity: 0.95;
    }

    .particles {
      position: absolute;
      inset: 0;

      .particle {
        position: absolute;
        background: white;
        border-radius: 50%;
        opacity: 0.6;
        animation: float-up 15s linear infinite;
      }
    }

    .floating-shapes {
      position: absolute;
      inset: 0;

      .shape {
        position: absolute;
        font-size: 40px;
        opacity: 0.3;
        animation: float-around 20s ease-in-out infinite;

        &.shape-1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        &.shape-2 {
          top: 20%;
          right: 15%;
          animation-delay: 2s;
        }

        &.shape-3 {
          bottom: 20%;
          left: 15%;
          animation-delay: 4s;
        }

        &.shape-4 {
          bottom: 30%;
          right: 10%;
          animation-delay: 6s;
        }

        &.shape-5 {
          top: 50%;
          left: 50%;
          animation-delay: 8s;
        }
      }
    }
  }

  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: white;
    max-width: 900px;
    animation: fade-in-up 1s ease-out;

    .welcome-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 30px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      margin-bottom: 32px;
      animation: bounce-in 1s ease-out 0.3s both;

      .badge-icon {
        font-size: 20px;
        animation: rotate 3s linear infinite;
      }

      .badge-text {
        font-size: 14px;
        font-weight: 500;
      }
    }

    .hero-title {
      margin-bottom: 32px;

      .title-line {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-bottom: 16px;

        .title-emoji {
          font-size: 60px;
          animation: bounce 2s ease-in-out infinite;
        }

        .gradient-text-animated {
          font-size: 72px;
          font-weight: 800;
          background: linear-gradient(90deg, #fff 0%, #ffd6e7 50%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-flow 3s linear infinite;
        }
      }

      .title-subtitle {
        font-size: 28px;
        font-weight: 600;
        opacity: 0.95;
        letter-spacing: 2px;
      }
    }

    .hero-description {
      font-size: 18px;
      margin-bottom: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 12px;

      .desc-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        font-weight: 500;
      }

      .desc-divider {
        opacity: 0.5;
      }
    }

    .hero-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-bottom: 60px;
      flex-wrap: wrap;

      .primary-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 40px;
        font-size: 18px;
        font-weight: 600;
        border-radius: 16px;
        box-shadow: 0 8px 30px rgba(255, 107, 157, 0.4);
        animation: pulse-glow 2s ease-in-out infinite;

        .btn-icon {
          font-size: 20px;
        }

        .btn-arrow {
          font-size: 20px;
          transition: transform 0.3s ease;
        }

        &:hover .btn-arrow {
          transform: translateX(5px);
        }
      }

      .outline-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 40px;
        font-size: 18px;
        font-weight: 600;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.5);
        color: white;

        .btn-icon {
          font-size: 20px;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: white;
          transform: translateY(-2px);
        }
      }
    }

    .trust-badges {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      flex-wrap: wrap;
      padding: 32px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.2);

      .trust-item {
        display: flex;
        align-items: center;
        gap: 16px;

        .trust-icon {
          font-size: 48px;
          animation: bounce 2s ease-in-out infinite;
        }

        .trust-info {
          text-align: left;

          .trust-value {
            font-size: 32px;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 6px;
          }

          .trust-label {
            font-size: 14px;
            opacity: 0.9;
          }
        }
      }

      .trust-divider {
        width: 1px;
        height: 50px;
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .scroll-indicator {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    color: white;
    animation: bounce-vertical 2s ease-in-out infinite;

    .scroll-text {
      font-size: 14px;
      margin-bottom: 8px;
      opacity: 0.8;
    }

    .scroll-arrow {
      font-size: 24px;
      animation: bounce-vertical 1s ease-in-out infinite;
    }
  }
}

// 产品套餐
.products-section {
  padding: 100px 20px;
  background: white;

  .section-header {
    text-align: center;
    margin-bottom: 60px;

    .section-title {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .section-subtitle {
      font-size: 18px;
      color: #909399;
    }
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .product-card {
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    &.is-popular {
      border: 2px solid #ff6b9d;

      .card-header {
        background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
        color: white;
        margin: -32px -32px 24px;
        padding: 24px 32px;
        border-radius: 14px 14px 0 0;
      }
    }

    .card-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .card-header {
      margin-bottom: 24px;

      .product-name {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 16px;
      }

      .product-price {
        display: flex;
        align-items: baseline;

        .currency {
          font-size: 20px;
          margin-right: 4px;
        }

        .amount {
          font-size: 48px;
          font-weight: 700;
        }

        .period {
          font-size: 16px;
          color: #909399;
          margin-left: 4px;
        }
      }
    }

    .card-body {
      margin-bottom: 24px;

      .feature-list {
        list-style: none;
        padding: 0;

        li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .check-icon {
            color: #67c23a;
            font-size: 18px;
          }
        }
      }
    }
  }
}

// 特色功能
.features-section {
  padding: 100px 20px;
  background: #f5f7fa;

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    text-align: center;
    padding: 40px 24px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .feature-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }

    .feature-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .feature-description {
      color: #909399;
      line-height: 1.6;
    }
  }
}

// 页脚
.footer {
  background: #1a1a2e;
  color: white;
  padding: 60px 20px 20px;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto 40px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 40px;

    .footer-section {
      h4 {
        margin-bottom: 16px;
        font-size: 18px;
      }

      a {
        display: block;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        margin-bottom: 8px;
        transition: color 0.3s ease;

        &:hover {
          color: white;
        }
      }
    }
  }

  .footer-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
  }
}

// 通用样式
.gradient-text {
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-btn {
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%) !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4) !important;
  transition: all 0.3s ease !important;

  &:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(255, 107, 157, 0.6) !important;
  }
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0);
  }
}

// ========== 产品套餐 ==========
.products-section {
  padding: 120px 20px;
  background: white;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to bottom, #f8f9fe, white);
  }

  .section-header {
    text-align: center;
    margin-bottom: 80px;

    .section-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 20px;
      background: $gradient-pink;
      color: white;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
      box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
      animation: bounce-in 0.6s ease-out;

      .badge-icon {
        font-size: 18px;
      }
    }

    .section-title {
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 16px;
      animation: fade-in-up 0.8s ease-out;
    }

    .section-subtitle {
      font-size: 18px;
      color: #909399;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      animation: fade-in-up 1s ease-out;

      .emoji {
        font-size: 20px;
        animation: pulse 2s ease-in-out infinite;
      }
    }
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 40px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .product-card {
    position: relative;
    background: white;
    border-radius: 24px;
    padding: 40px 32px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    overflow: hidden;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-12px) scale(1.02);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      border-color: rgba(255, 107, 157, 0.3);

      .card-hover-effect {
        opacity: 1;
      }

      .product-icon {
        transform: scale(1.2) rotate(10deg);
      }

      .btn-buy {
        transform: scale(1.05);
      }
    }

    &.is-popular {
      border-color: #ff6b9d;
      box-shadow: 0 12px 50px rgba(255, 107, 157, 0.25);

      .card-header {
        .product-name {
          background: $gradient-pink;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
    }

    .popular-badge {
      position: absolute;
      top: -10px;
      right: 30px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 20px;
      background: $gradient-pink;
      color: white;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(255, 107, 157, 0.4);
      z-index: 2;
      animation: bounce-in 0.6s ease-out 0.3s both;

      .badge-glow {
        position: absolute;
        inset: -4px;
        background: $gradient-pink;
        border-radius: 20px;
        filter: blur(10px);
        opacity: 0.5;
        z-index: -1;
        animation: pulse 2s ease-in-out infinite;
      }

      .badge-icon {
        font-size: 16px;
        animation: bounce 1s ease-in-out infinite;
      }
    }

    .card-decoration {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;

      .deco-circle {
        position: absolute;
        border-radius: 50%;
        background: $gradient-pink;
        opacity: 0.05;

        &.deco-1 {
          width: 150px;
          height: 150px;
          top: -50px;
          right: -50px;
        }

        &.deco-2 {
          width: 100px;
          height: 100px;
          bottom: -30px;
          left: -30px;
        }
      }
    }

    .card-header {
      text-align: center;
      margin-bottom: 24px;

      .product-icon {
        font-size: 64px;
        margin-bottom: 16px;
        display: inline-block;
        transition: all 0.4s ease;
      }

      .product-name {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
        color: #303133;
      }

      .product-desc {
        font-size: 14px;
        color: #909399;
      }
    }

    .card-price {
      text-align: center;
      margin-bottom: 32px;
      padding: 24px 0;
      border-top: 2px dashed #f0f0f0;
      border-bottom: 2px dashed #f0f0f0;

      .price-wrapper {
        display: flex;
        align-items: baseline;
        justify-content: center;
        margin-bottom: 8px;

        .price-symbol {
          font-size: 24px;
          font-weight: 600;
          color: #ff6b9d;
          margin-right: 4px;
        }

        .price-amount {
          font-size: 56px;
          font-weight: 800;
          background: $gradient-pink;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .price-period {
          font-size: 18px;
          color: #909399;
          margin-left: 4px;
        }
      }

      .price-original {
        font-size: 14px;
        color: #c0c4cc;
        text-decoration: line-through;
      }
    }

    .card-body {
      margin-bottom: 32px;

      .feature-list {
        list-style: none;
        padding: 0;

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid #f5f7fa;
          transition: all 0.3s ease;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            padding-left: 8px;
            background: rgba(255, 107, 157, 0.05);
            border-radius: 8px;
          }

          .feature-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: $gradient-green;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            flex-shrink: 0;
          }

          .feature-text {
            font-size: 15px;
            color: #606266;
          }
        }
      }
    }

    .card-footer {
      .btn-buy {
        width: 100%;
        padding: 16px;
        border-radius: 16px;
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s ease;
        border: 2px solid transparent;

        &:not(.gradient-btn) {
          background: white;
          border-color: #ff6b9d;
          color: #ff6b9d;

          &:hover {
            background: $gradient-pink;
            color: white;
            border-color: transparent;
          }
        }

        .btn-icon {
          font-size: 18px;
        }
      }
    }

    .card-hover-effect {
      position: absolute;
      inset: 0;
      background: $gradient-pink;
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
      mix-blend-mode: overlay;
    }
  }

  .more-products {
    text-align: center;
    margin-top: 60px;

    .more-btn {
      padding: 16px 48px;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 600;
      background: white;
      border: 2px solid #ff6b9d;
      color: #ff6b9d;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;

      .btn-arrow {
        font-size: 20px;
        transition: transform 0.3s ease;
      }

      &:hover {
        background: $gradient-pink;
        color: white;
        border-color: transparent;
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(255, 107, 157, 0.4);

        .btn-arrow {
          transform: translateX(5px);
        }
      }
    }
  }
}

// ========== 特色功能 ==========
.features-section {
  padding: 120px 20px;
  background: linear-gradient(180deg, white 0%, #f8f9fe 100%);

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .feature-card {
    text-align: center;
    padding: 48px 32px;
    background: white;
    border-radius: 24px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    animation: fade-in-up 0.6s ease-out both;

    &:hover {
      transform: translateY(-12px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);

      .feature-icon-wrapper {
        transform: scale(1.1) rotate(5deg);

        .icon-glow {
          opacity: 1;
          transform: scale(1.2);
        }
      }

      .feature-link {
        color: #ff6b9d;

        .link-arrow {
          transform: translateX(5px);
        }
      }
    }

    .feature-icon-wrapper {
      width: 100px;
      height: 100px;
      margin: 0 auto 24px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.4s ease;

      .icon-glow {
        position: absolute;
        inset: -8px;
        border-radius: 24px;
        filter: blur(20px);
        opacity: 0;
        transition: all 0.4s ease;
      }

      .feature-icon {
        font-size: 48px;
        position: relative;
        z-index: 1;
      }
    }

    .feature-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #303133;
    }

    .feature-description {
      font-size: 15px;
      color: #606266;
      line-height: 1.8;
      margin-bottom: 20px;
    }

    .feature-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #909399;
      transition: all 0.3s ease;

      .link-arrow {
        font-size: 16px;
        transition: transform 0.3s ease;
      }
    }
  }
}

// ========== 价格对比 ==========
.pricing-section {
  padding: 120px 20px;
  background: white;

  .pricing-comparison {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40px;
    max-width: 1000px;
    margin: 0 auto;
    flex-wrap: wrap;

    .comparison-card {
      flex: 1;
      min-width: 300px;
      padding: 40px 32px;
      background: white;
      border-radius: 24px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
      transition: all 0.4s ease;

      &.highlight {
        background: $gradient-pink;
        color: white;
        transform: scale(1.05);
        box-shadow: 0 20px 60px rgba(255, 107, 157, 0.3);

        .comparison-header h3 {
          color: white;
        }

        .comparison-item {
          color: white;
          border-color: rgba(255, 255, 255, 0.2);
        }
      }

      &:hover {
        transform: translateY(-8px) scale(1.05);
      }

      .comparison-header {
        text-align: center;
        margin-bottom: 32px;

        h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #303133;
        }

        .comparison-icon {
          font-size: 64px;
          margin-bottom: 16px;

          &.sad {
            animation: shake 2s ease-in-out infinite;
          }

          &.happy {
            animation: bounce 2s ease-in-out infinite;
          }
        }
      }

      .comparison-body {
        .comparison-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 16px;

          &:last-child {
            border-bottom: none;
          }

          .item-icon {
            font-size: 20px;
            flex-shrink: 0;
          }

          &.negative {
            color: #909399;
          }

          &.positive {
            font-weight: 600;
          }
        }
      }
    }

    .vs-divider {
      .vs-text {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: $gradient-pink;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 700;
        box-shadow: 0 8px 30px rgba(255, 107, 157, 0.4);
        animation: pulse 2s ease-in-out infinite;
      }
    }
  }
}

// ========== 页脚 ==========
.footer {
  position: relative;
  background: #1a1a2e;
  color: white;
  padding: 80px 20px 20px;
  overflow: hidden;

  .footer-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100px;

    .deco-wave {
      position: absolute;
      top: -50px;
      left: 0;
      right: 0;
      height: 100px;
      background: white;
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    }
  }

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;

    .footer-main {
      display: grid;
      grid-template-columns: 1.5fr 3fr;
      gap: 60px;
      margin-bottom: 60px;

      @media (max-width: 968px) {
        grid-template-columns: 1fr;
        gap: 40px;
      }

      .footer-brand {
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;

          .brand-icon {
            font-size: 40px;
            animation: rotate 10s linear infinite;
          }

          .brand-text {
            font-size: 32px;
            font-weight: 800;
          }
        }

        .brand-slogan {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 24px;
          line-height: 1.6;
        }

        .brand-social {
          display: flex;
          gap: 12px;

          .social-link {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: all 0.3s ease;
            text-decoration: none;

            &:hover {
              background: $gradient-pink;
              transform: translateY(-4px) rotate(5deg);
              box-shadow: 0 8px 20px rgba(255, 107, 157, 0.4);
            }
          }
        }
      }

      .footer-links {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 40px;

        .footer-section {
          .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 20px;
            color: white;

            .title-icon {
              font-size: 20px;
            }
          }

          .footer-link {
            display: block;
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
            margin-bottom: 12px;
            font-size: 14px;
            transition: all 0.3s ease;
            padding-left: 0;

            &:hover {
              color: white;
              padding-left: 8px;
              background: linear-gradient(90deg, rgba(255, 107, 157, 0.2) 0%, transparent 100%);
            }
          }
        }
      }
    }
  }

  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 32px;

    .footer-bottom-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;

      @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
      }

      .copyright {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.5);

        .copyright-icon {
          font-size: 16px;
        }

        .heart-icon {
          font-size: 16px;
          animation: pulse 1.5s ease-in-out infinite;
        }
      }

      .footer-badges {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        .badge {
          padding: 6px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
          }
        }
      }
    }
  }
}

// ========== 通用样式 ==========
.gradient-text {
  background: $gradient-pink;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-animated {
  background: linear-gradient(90deg, #ff6b9d 0%, #ffa06b 50%, #ff6b9d 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-flow 3s linear infinite;
}

.gradient-btn {
  background: $gradient-pink !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4) !important;
  transition: all 0.3s ease !important;

  &:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(255, 107, 157, 0.6) !important;
  }

  &:active {
    transform: translateY(0) !important;
  }
}

// ========== 动画 ==========
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes bounce-vertical {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.95);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 8px 30px rgba(255, 107, 157, 0.4);
  }
  50% {
    box-shadow: 0 8px 40px rgba(255, 107, 157, 0.6);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes gradient-flow {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

@keyframes float-up {
  0% {
    transform: translateY(100vh);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh);
    opacity: 0;
  }
}

@keyframes float-around {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(20px, -20px) rotate(90deg);
  }
  50% {
    transform: translate(0, -40px) rotate(180deg);
  }
  75% {
    transform: translate(-20px, -20px) rotate(270deg);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

// ========== 响应式 ==========
@media (max-width: 768px) {
  .header {
    .nav-menu {
      display: none;
    }
  }

  .hero-section {
    .hero-content {
      .hero-title {
        .title-line {
          flex-direction: column;
          gap: 8px;

          .title-emoji {
            font-size: 48px;
          }

          .gradient-text-animated {
            font-size: 48px;
          }
        }

        .title-subtitle {
          font-size: 20px;
        }
      }

      .hero-description {
        flex-direction: column;
        gap: 8px;

        .desc-divider {
          display: none;
        }
      }

      .trust-badges {
        flex-direction: column;
        gap: 24px;

        .trust-divider {
          display: none;
        }
      }
    }
  }

  .products-section {
    .products-grid {
      grid-template-columns: 1fr;
    }
  }

  .features-section {
    .features-grid {
      grid-template-columns: 1fr;
    }
  }

  .pricing-section {
    .pricing-comparison {
      flex-direction: column;

      .vs-divider {
        transform: rotate(90deg);
      }
    }
  }
}
</style>

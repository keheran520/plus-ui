<template>
  <el-card class="social-card" shadow="never">
    <div class="card-header">
      <span class="card-title">第三方账号</span>
    </div>

    <div class="social-list">
      <div v-for="item in socialList" :key="item.source" class="social-item">
        <div class="item-icon">
          <svg-icon :icon-class="getIconName(item.source)" :size="38" />
        </div>

        <div class="item-info">
          <div class="info-top">
            <span class="info-label">绑定 {{ getSourceName(item.source) }}</span>
            <span class="info-status">
              <el-icon v-if="item.bound" class="status-icon success"><CircleCheck /></el-icon>
              <el-icon v-else class="status-icon warning"><WarningFilled /></el-icon>
              <span :class="item.bound ? 'success' : 'warning'" class="status-text">
                {{ item.bound ? '已绑定' : '未绑定' }}
              </span>
            </span>
          </div>

          <div class="info-desc">
            <span v-if="item.userName" class="desc-value">{{ item.userName }}</span>
            {{ item.bound ? '' : '绑定后，' }}可通过 {{ getSourceName(item.source) }} 进行登录
          </div>
        </div>

        <div class="item-action">
          <el-button :loading="item.loading" :type="item.bound ? 'default' : 'primary'" size="default" @click="handleAction(item)">
            {{ item.bound ? '解绑' : '绑定' }}
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { CircleCheck, WarningFilled } from '@element-plus/icons-vue';
import { authBinding, authUnlock } from '@/api/system/social/auth';

interface Props {
  auths: any[];
}

const props = defineProps<Props>();
const emit = defineEmits(['refresh']);

interface SocialItem {
  source: string;
  bound: boolean;
  userName?: string;
  authId?: string;
  loading: boolean;
}

const socialList = ref<SocialItem[]>([]);

// 初始化社交账号列表
const initSocialList = () => {
  const sources = ['gitee', 'github', 'wechat_open'];
  socialList.value = sources.map((source) => {
    const auth = props.auths.find((a: any) => a.source?.toLowerCase() === source);
    return {
      source,
      bound: !!auth,
      userName: auth?.userName,
      authId: auth?.authId,
      loading: false
    };
  });
};

// 获取图标名称
const getIconName = (source: string): string => {
  const iconMap: Record<string, string> = {
    'gitee': 'gitee',
    'github': 'github',
    'wechat_open': 'wechat'
  };
  return iconMap[source] || 'link';
};

// 获取来源名称
const getSourceName = (source: string): string => {
  const nameMap: Record<string, string> = {
    'gitee': 'Gitee',
    'github': 'GitHub',
    'wechat_open': '微信'
  };
  return nameMap[source] || source;
};

// 获取租户ID（从localStorage或其他地方）
const getTenantId = (): string => {
  // 尝试从多个地方获取租户ID
  const tenantId = localStorage.getItem('tenantId') || sessionStorage.getItem('tenantId') || '000000'; // 默认租户ID
  return tenantId;
};

// 处理绑定/解绑操作
const handleAction = async (item: SocialItem) => {
  if (item.bound) {
    // 解绑
    if (!item.authId) {
      ElMessage.error('无法获取授权ID');
      return;
    }

    try {
      await ElMessageBox.confirm(`确定要解绑 ${getSourceName(item.source)} 账号吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });

      item.loading = true;
      await authUnlock(item.authId);
      ElMessage.success('解绑成功');
      emit('refresh');
    } catch (error) {
      if (error !== 'cancel') {
        console.error('解绑失败：', error);
      }
    } finally {
      item.loading = false;
    }
  } else {
    // 绑定
    item.loading = true;
    try {
      const tenantId = getTenantId();
      const res = await authBinding(item.source, tenantId);
      if (res.data) {
        // 打开授权页面
        window.location.href = res.data;
      }
    } catch (error) {
      console.error('获取授权链接失败：', error);
      ElMessage.error('获取授权链接失败');
      item.loading = false;
    }
  }
};

// 监听 auths 变化
watch(
  () => props.auths,
  () => {
    initSocialList();
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.social-card {
  border: none;
  border-radius: var(--radius-lg);

  :deep(.el-card__body) {
    padding: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(180deg, var(--primary-light-9), #fff0);

  .card-title {
    font-size: 16px;
    color: #303133;
  }
}

.social-list {
  padding: 16px 20px;

  .social-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:first-child {
      padding-top: 0;
    }

    .item-icon {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      border-radius: var(--radius-lg);
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
      background: var(--bg-hover);

      :deep(.svg-icon) {
        font-size: 20px;
      }
    }

    .item-info {
      flex: 1;

      .info-top {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        gap: var(--spacing-sm);

        .info-label {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
        }

        .info-status {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);

          .status-icon {
            font-size: 14px;

            &.success {
              color: var(--success-color);
            }

            &.warning {
              color: var(--warning-color);
            }
          }

          .status-text {
            font-size: 12px;

            &.success {
              color: var(--success-color);
            }

            &.warning {
              color: var(--warning-color);
            }
          }
        }
      }

      .info-desc {
        font-size: 13px;
        color: #909399;
        line-height: 1.6;

        .desc-value {
          color: #606266;
          font-weight: 500;
          margin-right: 4px;
        }
      }
    }

    .item-action {
      margin-left: 16px;
      flex-shrink: 0;
    }
  }
}
</style>

<template>
  <div class="confirm-order-section">
    <!-- 所选配置 -->
    <div class="form-section">
      <SectionTitle>所选配置</SectionTitle>

      <div class="config-summary">
        <!-- 基础配置 -->
        <div class="config-group">
          <div class="config-group-title">基础配置</div>
          <div class="config-items">
            <div class="config-item">
              <span class="config-label">节点</span>
              <span class="config-value">{{ regionLabel }}</span>
            </div>
            <div class="config-item">
              <span class="config-label">规格</span>
              <span class="config-value">{{ specLabel }}</span>
            </div>
            <div class="config-item">
              <span class="config-label">镜像</span>
              <span class="config-value">{{ imageLabel }}</span>
            </div>
            <div class="config-item">
              <span class="config-label">系统盘</span>
              <span class="config-value">{{ systemDiskLabel }}</span>
            </div>
          </div>
        </div>

        <!-- 网络配置 -->
        <div class="config-group">
          <div class="config-group-title">网络配置</div>
          <div class="config-items">
            <div class="config-item">
              <span class="config-label">私网地址池</span>
              <span class="config-value">{{ privateNetworkLabel }}</span>
            </div>
            <div class="config-item">
              <span class="config-label">私网IP</span>
              <span class="config-value">{{ privateIpLabel }}</span>
            </div>
            <div class="config-item">
              <span class="config-label">公网IP</span>
              <span class="config-value">{{ publicIpLabel }}</span>
            </div>
          </div>
        </div>

        <!-- 自定义配置 -->
        <div class="config-group">
          <div class="config-group-title">自定义配置</div>
          <div class="config-items">
            <div class="config-item">
              <span class="config-label">登录凭证</span>
              <span class="config-value">密码</span>
            </div>
            <div class="config-item">
              <span class="config-label">密码</span>
              <div class="config-value password-value">
                <span>{{ passwordDisplay }}</span>
                <el-link @click="togglePasswordVisibility">
                  <el-icon><View v-if="!showPassword" /><Hide v-else /></el-icon>
                </el-link>
              </div>
            </div>
            <div class="config-item">
              <span class="config-label">登录名</span>
              <span class="config-value">{{ loginNameLabel }}</span>
            </div>
            <div class="config-item">
              <span class="config-label">实例名称</span>
              <span class="config-value">{{ instanceNameLabel }}</span>
            </div>
            <div v-if="customConfig.autoStart" class="config-item">
              <span class="config-label">开机自启</span>
              <span class="config-value">启用</span>
            </div>
            <div v-if="customConfig.remark" class="config-item">
              <span class="config-label">备注</span>
              <span class="config-value">{{ customConfig.remark }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Hide, View } from '@element-plus/icons-vue';
import SectionTitle from '@/components/SectionTitle/index.vue';

interface Props {
  // 基础配置
  basicInfo?: any;
  specificationInfo?: any;
  imageInfo?: any;
  storageInfo?: any;

  // 网络配置
  networkInfo?: any;

  // 自定义配置
  customConfig?: any;

  // 数据列表（用于显示名称）
  nodeList?: any[];
  imageList?: any[];
  storagePoolList?: any[];
  privateIpPoolList?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  nodeList: () => [],
  imageList: () => [],
  storagePoolList: () => [],
  privateIpPoolList: () => []
});

// 密码显示状态
const showPassword = ref(false);

// 地域（节点名称）
const regionLabel = computed(() => {
  const nodeId = props.basicInfo?.nodeId;
  if (nodeId && props.nodeList) {
    const node = props.nodeList.find((n: any) => n.nodeId === nodeId);
    return node?.nodeName || nodeId;
  }
  return '-';
});

// 规格标签
const specLabel = computed(() => {
  const cpu = props.specificationInfo?.cpuCores || 2;
  const memory = props.specificationInfo?.memory || 4;
  return `${cpu}核${memory}G`;
});

// 镜像标签
const imageLabel = computed(() => {
  const imageId = props.imageInfo?.imageId;
  if (imageId && props.imageList) {
    const image = props.imageList.find((img: any) => img.imageId === imageId);
    if (image) {
      return `${image.osType || ''} ${image.osVersion || ''}`.trim();
    }
  }
  return '-';
});

// 系统盘标签
const systemDiskLabel = computed(() => {
  const size = props.storageInfo?.systemDiskSize || 40;
  const storage = props.storageInfo?.systemDiskStorage || '';
  return storage ? `${size}GB (${storage})` : `${size}GB`;
});

// 私有网络标签（地址池名称）
const privateNetworkLabel = computed(() => {
  const poolId = props.networkInfo?.privateNetwork;
  if (poolId && props.privateIpPoolList) {
    const pool = props.privateIpPoolList.find((p: any) => p.poolId === poolId);
    return pool?.poolName || poolId;
  }
  return '-';
});

// 私网IP标签
const privateIpLabel = computed(() => {
  const mode = props.networkInfo?.privateIpAllocationMode;
  if (mode === 'manual') {
    return props.networkInfo?.manualPrivateIp || '-';
  }
  return '自动分配';
});

// 公网IP标签
const publicIpLabel = computed(() => {
  if (!props.networkInfo?.enablePublicIp) return '未分配';

  const mode = props.networkInfo?.publicIpAllocationMode;
  if (mode === 'manual') {
    return props.networkInfo?.manualPublicIp || '已分配';
  }
  return '自动分配';
});

// 密码显示
const passwordDisplay = computed(() => {
  if (!showPassword.value) return '******';
  return props.customConfig?.loginPassword || '******';
});

// 登录名标签
const loginNameLabel = computed(() => {
  const osType = props.imageInfo?.osType || 'Linux';
  return osType === 'Windows' ? 'Administrator' : 'root';
});

// 实例名称标签
const instanceNameLabel = computed(() => {
  return props.customConfig?.instanceName || '-';
});

// 切换密码显示/隐藏
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<style lang="scss" scoped>
@import './common.scss';

.confirm-order-section {
  .form-section {
    margin-bottom: 32px;
  }
}

// 配置汇总
.config-summary {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.config-group {
  flex: 1;
  min-width: 300px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  padding: 16px;

  .config-group-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color);
  }

  .config-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .config-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 13px;

    .config-label {
      color: var(--el-text-color-secondary);
      min-width: 80px;
      flex-shrink: 0;
    }

    .config-value {
      color: var(--el-text-color-primary);
      text-align: right;
      word-break: break-word;
    }

    .password-value {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-end;

      .el-link {
        font-size: 16px;
        cursor: pointer;
      }
    }
  }
}
</style>

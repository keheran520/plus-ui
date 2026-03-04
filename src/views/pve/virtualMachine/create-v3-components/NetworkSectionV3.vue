<template>
  <div class="network-config-section">
    <!-- 网络配置 -->
    <div class="form-section">
      <SectionTitle>网络</SectionTitle>

      <el-form-item label="私网地址池" required>
        <el-space>
          <el-select
            v-model="privateNetwork"
            :loading="poolLoading"
            :remote-method="handlePoolSearch"
            filterable
            placeholder="请选择或搜索私网地址池"
            remote
            style="width: 400px"
          >
            <el-option v-for="pool in addressPoolList" :key="pool.value" :label="pool.label" :value="pool.value" />
          </el-select>
          <el-button @click="refreshPools">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-space>
        <template #extra>
          <div style="color: #909399; font-size: 12px; margin-top: 4px">
            列表最多显示100条，如未找到需要的地址池，请使用搜索功能（支持名称模糊搜索）。
            <el-link type="primary" @click="handleCreateAddressPool">创建私网地址池 →</el-link>
          </div>
        </template>
      </el-form-item>

      <!-- 私网IP分配 -->
      <el-form-item label="私网IP" required>
        <el-space :size="12">
          <el-select v-model="privateIpAllocationMode" :disabled="!privateNetwork" placeholder="分配方式" style="width: 150px">
            <el-option label="自动获取IP" value="auto" />
            <el-option label="手动分配" value="manual" />
          </el-select>
          <IpSegmentInput
            v-if="privateIpAllocationMode === 'manual'"
            v-model="manualPrivateIp"
            :prefix="privateIpPrefix"
            :segment-count="privateIpSegmentCount"
          />
        </el-space>
        <template #extra>
          <div style="color: #909399; font-size: 12px; margin-top: 4px">
            {{ privateIpAllocationMode === 'auto' ? '系统将自动从地址池中分配一个可用的IP地址' : '请输入要分配的IP地址' }}
          </div>
        </template>
      </el-form-item>
    </div>

    <!-- 公网IP -->
    <div class="form-section">
      <SectionTitle>公网IP</SectionTitle>

      <!-- 分配弹性公网IP -->
      <el-form-item label="弹性公网IP">
        <el-checkbox v-model="enablePublicIp"> 分配弹性公网IP </el-checkbox>
      </el-form-item>

      <!-- 公网地址池 -->
      <el-form-item v-if="enablePublicIp" label="公网地址池" required>
        <el-space>
          <el-select
            v-model="publicNetwork"
            :loading="publicPoolLoading"
            :remote-method="handlePublicPoolSearch"
            filterable
            placeholder="请选择或搜索公网地址池"
            remote
            style="width: 400px"
          >
            <el-option v-for="pool in publicAddressPoolList" :key="pool.value" :label="pool.label" :value="pool.value" />
          </el-select>
          <el-button @click="refreshPublicPools">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-space>
        <template #extra>
          <div style="color: #909399; font-size: 12px; margin-top: 4px">
            列表最多显示100条，如未找到需要的地址池，请使用搜索功能（支持名称模糊搜索）。
          </div>
        </template>
      </el-form-item>

      <!-- 公网IP分配 -->
      <el-form-item v-if="enablePublicIp" label="公网IP" required>
        <el-space :size="12">
          <el-select v-model="publicIpAllocationMode" :disabled="!publicNetwork" placeholder="分配方式" style="width: 150px">
            <el-option label="自动获取IP" value="auto" />
            <el-option label="手动分配" value="manual" />
          </el-select>
          <IpSegmentInput
            v-if="publicIpAllocationMode === 'manual'"
            v-model="manualPublicIp"
            :prefix="publicIpPrefix"
            :segment-count="publicIpSegmentCount"
          />
        </el-space>
        <template #extra>
          <div style="color: #909399; font-size: 12px; margin-top: 4px">
            {{ publicIpAllocationMode === 'auto' ? '系统将自动从地址池中分配一个可用的IP地址' : '请输入要分配的IP地址' }}
          </div>
        </template>
      </el-form-item>

      <!-- 线路类型 -->
      <el-form-item v-if="enablePublicIp" label="线路类型">
        <el-radio-group v-model="lineType" class="spec-type-radio-group">
          <el-radio v-for="type in lineTypes" :key="type.value" :value="type.value" class="spec-type-radio">
            <template #default>
              <div :class="[{ checked: lineType === type.value }]" class="spec-type- card">
                <div class="spec-type-title">{{ type.label }}</div>
              </div>
            </template>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 计费类型 -->
      <el-form-item v-if="enablePublicIp && enablePublicIpBilling" label="计费类型">
        <el-radio-group v-model="publicIpBillingType" class="spec-type-radio-group" style="margin-bottom: 0">
          <el-radio v-for="type in publicIpBillingTypes" :key="type.value" :label="type.value" class="spec-type-radio">
            <template #default>
              <div :class="[{ checked: publicIpBillingType === type.value }]" class="spec-type-card">
                <div class="spec-type-title">{{ type.label }}</div>
              </div>
            </template>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 计费方式 -->
      <el-form-item v-if="enablePublicIp && enablePublicIpBilling" label="计费方式">
        <el-radio-group v-model="bandwidthBillingMode" class="bandwidth-mode-group">
          <el-radio value="peak">
            <template #default>
              <div :class="[{ checked: bandwidthBillingMode === 'peak' }]" class="bandwidth-card">
                <el-icon style="font-size: 24px; color: #409eff"><Lightning /></el-icon>
                <div class="bandwidth-content">
                  <div class="bandwidth-title">按实际流量计费</div>
                  <div class="bandwidth-desc">流量按实际使用量稳定的场景</div>
                </div>
              </div>
            </template>
          </el-radio>
          <el-radio value="fixed">
            <template #default>
              <div :class="[{ checked: bandwidthBillingMode === 'fixed' }]" class="bandwidth-card">
                <el-icon style="font-size: 24px; color: #409eff"><Odometer /></el-icon>
                <div class="bandwidth-content">
                  <div class="bandwidth-title">按带宽上限计费</div>
                  <div class="bandwidth-desc">流量较大或流量稳定的场景</div>
                </div>
              </div>
            </template>
          </el-radio>
        </el-radio-group>
        <div style="color: #909399; font-size: 12px; margin-top: 8px">
          按实际流量计费：指定带宽上限，将按实际使用的出方向流量计费。适用于业务流量峰值在不同时间段波动较大的场景。
        </div>
      </el-form-item>

      <!-- 带宽上限 -->
      <el-form-item v-if="enablePublicIp && enablePublicIpBilling" label="带宽上限">
        <div class="bandwidth-slider-wrapper">
          <div class="bandwidth-control">
            <div class="slider-container">
              <el-slider
                v-model="bandwidth"
                :marks="{
                  40: '40',
                  80: '80',
                  120: '120',
                  160: '160',
                  200: '200'
                }"
                :max="200"
                :min="1"
                :step="1"
              />
            </div>
            <div class="bandwidth-input-group">
              <el-input-number v-model="bandwidth" :max="200" :min="1" :style="{ width: '120px' }">
                <template #suffix>
                  <span>Mbps</span>
                </template>
              </el-input-number>
            </div>
          </div>
          <div class="bandwidth-tip">带宽范围：1~200 Mbps，支持随时调整带宽上限。</div>
        </div>
      </el-form-item>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Lightning, Odometer, Refresh } from '@element-plus/icons-vue';
import SectionTitle from '@/components/SectionTitle/index.vue';
import IpSegmentInput from '@/components/IpSegmentInput/index.vue';
import { listIpPool } from '@/api/pve/ipPool';
import { listPrivateIp } from '@/api/pve/privateIp';
import { listPublicIp } from '@/api/pve/publicIp';

interface Props {
  modelValue: {
    privateNetwork: string;
    subnet: string;
    privateIpAllocationMode: string;
    manualPrivateIp: string;
    publicNetwork: string;
    publicIp: string;
    publicIpAllocationMode: string;
    manualPublicIp: string;
    enablePublicIp: boolean;
    enablePublicIpBilling: boolean;
    publicIpBillingType: string;
    lineType: string;
    bandwidthBillingMode: string;
    bandwidth: number;
  };
  publicIpList?: any[];
  privateIpPoolList?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  publicIpList: () => [],
  privateIpPoolList: () => []
});
const emit = defineEmits(['update:modelValue', 'update:privateIpList']);

// 加载状态
const poolLoading = ref(false);
const ipLoading = ref(false);
const publicPoolLoading = ref(false);
const publicIpLoading = ref(false);

// 搜索关键词
const poolSearchKeyword = ref('');
const ipSearchKeyword = ref('');
const publicPoolSearchKeyword = ref('');
const publicIpSearchKeyword = ref('');

// 公网IP计费类型
const publicIpBillingTypes = ref([
  { value: 'bandwidth', label: '按带宽计费' },
  { value: 'traffic', label: '按流量计费' }
]);

// 线路类型
const lineTypes = ref([{ value: 'bgp', label: 'BGP (多线)' }]);

// 地址池列表（从props获取或搜索结果）
const addressPoolList = ref<any[]>([]);

// 公网地址池列表
const publicAddressPoolList = ref<any[]>([]);

// 私网IP列表（根据选择的地址池动态加载）
const privateIpList = ref<any[]>([]);

// 公网IP列表
const publicIpList = ref<any[]>([]);

// 当前选择的私网地址池信息
const selectedPrivatePool = ref<any>(null);

// 当前选择的公网地址池信息
const selectedPublicPool = ref<any>(null);

// 智能识别IP段格式
const detectIpFormat = (startIp: string, endIp: string): { prefix: string; placeholder: string } => {
  if (!startIp || !endIp) {
    return { prefix: '', placeholder: 'x.x.x.x' };
  }

  const startParts = startIp.split('.');
  const endParts = endIp.split('.');

  if (startParts.length !== 4 || endParts.length !== 4) {
    return { prefix: '', placeholder: 'x.x.x.x' };
  }

  // 检查前三段是否相同
  if (startParts[0] === endParts[0] && startParts[1] === endParts[1] && startParts[2] === endParts[2]) {
    // 格式: 192.168.1.x
    return {
      prefix: `${startParts[0]}.${startParts[1]}.${startParts[2]}.`,
      placeholder: 'x'
    };
  }

  // 检查前两段是否相同
  if (startParts[0] === endParts[0] && startParts[1] === endParts[1]) {
    // 格式: 192.168.x.x
    return {
      prefix: `${startParts[0]}.${startParts[1]}.`,
      placeholder: 'x.x'
    };
  }

  // 检查第一段是否相同
  if (startParts[0] === endParts[0]) {
    // 格式: 192.x.x.x
    return {
      prefix: `${startParts[0]}.`,
      placeholder: 'x.x.x'
    };
  }

  // 完全不同
  return { prefix: '', placeholder: 'x.x.x.x' };
};

// 私网IP前缀和占位符
const privateIpPrefix = computed(() => {
  if (!selectedPrivatePool.value) return '';
  const format = detectIpFormat(selectedPrivatePool.value.startIp, selectedPrivatePool.value.endIp);
  return format.prefix;
});

const privateIpPlaceholder = computed(() => {
  if (!selectedPrivatePool.value) return 'x.x.x.x';
  const format = detectIpFormat(selectedPrivatePool.value.startIp, selectedPrivatePool.value.endIp);
  return format.placeholder;
});

// 私网IP需要输入的段数
const privateIpSegmentCount = computed(() => {
  if (!selectedPrivatePool.value) return 4;
  const format = detectIpFormat(selectedPrivatePool.value.startIp, selectedPrivatePool.value.endIp);
  // 根据占位符中的x数量确定段数
  return (format.placeholder.match(/x/g) || []).length;
});

// 公网IP前缀和占位符
const publicIpPrefix = computed(() => {
  if (!selectedPublicPool.value) return '';
  const format = detectIpFormat(selectedPublicPool.value.startIp, selectedPublicPool.value.endIp);
  return format.prefix;
});

const publicIpPlaceholder = computed(() => {
  if (!selectedPublicPool.value) return 'x.x.x.x';
  const format = detectIpFormat(selectedPublicPool.value.startIp, selectedPublicPool.value.endIp);
  return format.placeholder;
});

// 公网IP需要输入的段数
const publicIpSegmentCount = computed(() => {
  if (!selectedPublicPool.value) return 4;
  const format = detectIpFormat(selectedPublicPool.value.startIp, selectedPublicPool.value.endIp);
  // 根据占位符中的x数量确定段数
  return (format.placeholder.match(/x/g) || []).length;
});

// 初始化地址池列表
const initAddressPoolList = () => {
  if (props.privateIpPoolList && props.privateIpPoolList.length > 0) {
    addressPoolList.value = props.privateIpPoolList.map((pool: any) => {
      const availableCount = pool.availableIps || (pool.totalIps || 0) - (pool.usedIps || 0);
      return {
        value: pool.poolId || pool.id,
        label: `${pool.poolName || pool.name} (${pool.startIp} - 剩余${availableCount}个)`,
        disabled: availableCount === 0, // 可用IP为0时禁用
        ...pool,
        availableIps: availableCount
      };
    });
  }
};

// 监听 props 变化
watch(
  () => props.privateIpPoolList,
  () => {
    initAddressPoolList();
  },
  { immediate: true }
);

// 当选择地址池时，加载该池的可用IP列表
const loadPrivateIps = async (poolId: string) => {
  try {
    ipLoading.value = true;
    const response = await listPrivateIp({
      pageNum: 1,
      pageSize: 100,
      poolId: Number(poolId),
      status: 'available'
    });

    // 过滤出未绑定虚拟机的IP
    const availableIps = (response.rows || []).filter((ip: any) => !ip.vmId || ip.vmId === 0);

    privateIpList.value = availableIps.map((ip: any) => ({
      value: ip.ipId || ip.id,
      label: ip.ipAddress || ip.ip,
      ...ip
    }));

    // 通知父组件更新私网IP列表
    emit('update:privateIpList', privateIpList.value);
  } catch (error) {
    console.error('加载私网IP列表失败:', error);
    privateIpList.value = [];
    emit('update:privateIpList', []);
  } finally {
    ipLoading.value = false;
  }
};

// 加载公网IP列表
const loadPublicIps = async (poolId: string) => {
  try {
    publicIpLoading.value = true;
    const response = await listPublicIp({
      pageNum: 1,
      pageSize: 100,
      poolId: Number(poolId),
      status: 'available'
    });

    // 过滤出未绑定虚拟机的IP
    const availableIps = (response.rows || []).filter((ip: any) => !ip.vmId || ip.vmId === 0);

    publicIpList.value = availableIps.map((ip: any) => ({
      value: ip.ipId || ip.id,
      label: ip.ipAddress || ip.ip,
      ...ip
    }));
  } catch (error) {
    console.error('加载公网IP列表失败:', error);
    publicIpList.value = [];
  } finally {
    publicIpLoading.value = false;
  }
};

// 搜索地址池
const handlePoolSearch = async (keyword: string) => {
  poolSearchKeyword.value = keyword;
  if (!keyword) {
    initAddressPoolList();
    return;
  }

  try {
    poolLoading.value = true;
    const response = await listIpPool({
      pageNum: 1,
      pageSize: 100,
      ipType: 'private',
      poolName: keyword
    });
    addressPoolList.value = (response.rows || []).map((pool: any) => {
      const availableCount = pool.availableIps || (pool.totalIps || 0) - (pool.usedIps || 0);
      return {
        value: pool.poolId || pool.id,
        label: `${pool.poolName || pool.name} (${pool.startIp} - 剩余${availableCount}个)`,
        disabled: availableCount === 0,
        ...pool,
        availableIps: availableCount
      };
    });
  } catch (error) {
    console.error('搜索地址池失败:', error);
  } finally {
    poolLoading.value = false;
  }
};

// 搜索公网地址池
const handlePublicPoolSearch = async (keyword: string) => {
  publicPoolSearchKeyword.value = keyword;
  if (!keyword) {
    refreshPublicPools();
    return;
  }

  try {
    publicPoolLoading.value = true;
    const response = await listIpPool({
      pageNum: 1,
      pageSize: 100,
      ipType: 'public',
      poolName: keyword
    });
    publicAddressPoolList.value = (response.rows || []).map((pool: any) => {
      const availableCount = pool.availableIps || (pool.totalIps || 0) - (pool.usedIps || 0);
      return {
        value: pool.poolId || pool.id,
        label: `${pool.poolName || pool.name} (${pool.startIp} - 剩余${availableCount}个)`,
        disabled: availableCount === 0,
        ...pool,
        availableIps: availableCount
      };
    });
  } catch (error) {
    console.error('搜索公网地址池失败:', error);
  } finally {
    publicPoolLoading.value = false;
  }
};

// 刷新地址池列表
const refreshPools = async () => {
  poolSearchKeyword.value = '';
  try {
    poolLoading.value = true;
    const response = await listIpPool({
      pageNum: 1,
      pageSize: 100,
      ipType: 'private'
    });
    addressPoolList.value = (response.rows || []).map((pool: any) => {
      const availableCount = pool.availableIps || (pool.totalIps || 0) - (pool.usedIps || 0);
      return {
        value: pool.poolId || pool.id,
        label: `${pool.poolName || pool.name} (${pool.startIp} - 剩余${availableCount}个)`,
        disabled: availableCount === 0,
        ...pool,
        availableIps: availableCount
      };
    });
  } catch (error) {
    console.error('刷新地址池失败:', error);
  } finally {
    poolLoading.value = false;
  }
};

// 刷新公网地址池列表
const refreshPublicPools = async () => {
  publicPoolSearchKeyword.value = '';
  try {
    publicPoolLoading.value = true;
    const response = await listIpPool({
      pageNum: 1,
      pageSize: 100,
      ipType: 'public'
    });
    publicAddressPoolList.value = (response.rows || []).map((pool: any) => {
      const availableCount = pool.availableIps || (pool.totalIps || 0) - (pool.usedIps || 0);
      return {
        value: pool.poolId || pool.id,
        label: `${pool.poolName || pool.name} (${pool.startIp} - 剩余${availableCount}个)`,
        disabled: availableCount === 0,
        ...pool,
        availableIps: availableCount
      };
    });
  } catch (error) {
    console.error('刷新公网地址池失败:', error);
  } finally {
    publicPoolLoading.value = false;
  }
};

// 搜索私网IP
const handleIpSearch = async (keyword: string) => {
  ipSearchKeyword.value = keyword;
  if (!privateNetwork.value) return;

  if (!keyword) {
    loadPrivateIps(privateNetwork.value);
    return;
  }

  try {
    ipLoading.value = true;
    const response = await listPrivateIp({
      pageNum: 1,
      pageSize: 100,
      poolId: Number(privateNetwork.value),
      status: 'available',
      ipAddress: keyword
    });

    const availableIps = (response.rows || []).filter((ip: any) => !ip.vmId || ip.vmId === 0);
    privateIpList.value = availableIps.map((ip: any) => ({
      value: ip.ipId || ip.id,
      label: ip.ipAddress || ip.ip,
      ...ip
    }));

    // 通知父组件更新私网IP列表
    emit('update:privateIpList', privateIpList.value);
  } catch (error) {
    console.error('搜索私网IP失败:', error);
  } finally {
    ipLoading.value = false;
  }
};

// 刷新私网IP列表
const refreshIps = () => {
  ipSearchKeyword.value = '';
  if (privateNetwork.value) {
    loadPrivateIps(privateNetwork.value);
  }
};

// 跳转到IP地址池管理
const handleCreateAddressPool = () => {
  // TODO: 跳转到IP地址池管理页面
  console.log('跳转到IP地址池管理');
};

// 双向绑定
const privateNetwork = computed({
  get: () => props.modelValue.privateNetwork,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, privateNetwork: val, subnet: '' });
    // 选择地址池后，保存地址池信息并加载该池的IP列表
    if (val) {
      const pool = addressPoolList.value.find((p) => p.value === val);
      selectedPrivatePool.value = pool;
      loadPrivateIps(val);
    } else {
      selectedPrivatePool.value = null;
      privateIpList.value = [];
    }
  }
});

const subnet = computed({
  get: () => props.modelValue.subnet,
  set: (val) => emit('update:modelValue', { ...props.modelValue, subnet: val })
});

const privateIpAllocationMode = computed({
  get: () => props.modelValue.privateIpAllocationMode || 'auto',
  set: (val) => emit('update:modelValue', { ...props.modelValue, privateIpAllocationMode: val })
});

const manualPrivateIp = computed({
  get: () => props.modelValue.manualPrivateIp || '',
  set: (val) => emit('update:modelValue', { ...props.modelValue, manualPrivateIp: val })
});

const publicNetwork = computed({
  get: () => props.modelValue.publicNetwork || '',
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, publicNetwork: val, publicIp: '' });
    // 选择地址池后，保存地址池信息并加载该池的IP列表
    if (val) {
      const pool = publicAddressPoolList.value.find((p) => p.value === val);
      selectedPublicPool.value = pool;
      loadPublicIps(val);
    } else {
      selectedPublicPool.value = null;
      publicIpList.value = [];
    }
  }
});

const publicIp = computed({
  get: () => props.modelValue.publicIp || '',
  set: (val) => emit('update:modelValue', { ...props.modelValue, publicIp: val })
});

const publicIpAllocationMode = computed({
  get: () => props.modelValue.publicIpAllocationMode || 'auto',
  set: (val) => emit('update:modelValue', { ...props.modelValue, publicIpAllocationMode: val })
});

const manualPublicIp = computed({
  get: () => props.modelValue.manualPublicIp || '',
  set: (val) => emit('update:modelValue', { ...props.modelValue, manualPublicIp: val })
});

const enablePublicIp = computed({
  get: () => props.modelValue.enablePublicIp,
  set: (val) => emit('update:modelValue', { ...props.modelValue, enablePublicIp: val })
});

const enablePublicIpBilling = computed({
  get: () => props.modelValue.enablePublicIpBilling,
  set: (val) => emit('update:modelValue', { ...props.modelValue, enablePublicIpBilling: val })
});

const publicIpBillingType = computed({
  get: () => props.modelValue.publicIpBillingType,
  set: (val) => emit('update:modelValue', { ...props.modelValue, publicIpBillingType: val })
});

const lineType = computed({
  get: () => props.modelValue.lineType,
  set: (val) => emit('update:modelValue', { ...props.modelValue, lineType: val })
});

const bandwidthBillingMode = computed({
  get: () => props.modelValue.bandwidthBillingMode,
  set: (val) => emit('update:modelValue', { ...props.modelValue, bandwidthBillingMode: val })
});

const bandwidth = computed({
  get: () => props.modelValue.bandwidth,
  set: (val) => emit('update:modelValue', { ...props.modelValue, bandwidth: val })
});
</script>

<style lang="scss" scoped>
@use './common.scss';

.network-config-section {
  .form-section {
    margin-bottom: 32px;
  }
}

// 带宽计费方式组
.bandwidth-mode-group {
  display: flex;
  gap: 16px;

  :deep(.el-radio) {
    margin-right: 0;
    padding-left: 0;
  }

  :deep(.el-radio__label) {
    display: none;
  }

  .bandwidth-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    min-width: 200px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.1);
    }

    &.checked {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.1);

      .bandwidth-title {
        color: #409eff;
      }
    }

    .bandwidth-content {
      flex: 1;
    }

    .bandwidth-title {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 4px;
    }

    .bandwidth-desc {
      font-size: 12px;
      color: #909399;
    }
  }
}

// 带宽滑块包装器
.bandwidth-slider-wrapper {
  width: 100%;

  .bandwidth-control {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .slider-container {
    flex: 1;
    max-width: 500px;
  }

  .bandwidth-input-group {
    flex-shrink: 0;
  }

  .bandwidth-tip {
    margin-top: 12px;
    font-size: 12px;
    color: #909399;
  }
}
</style>

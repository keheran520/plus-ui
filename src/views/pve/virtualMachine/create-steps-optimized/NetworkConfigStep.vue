<template>
  <div class="network-config-step">
    <!-- 网络配置 -->
    <div class="form-section">
      <div class="section-title">网络配置</div>
      
      <el-form-item label="网络桥接" prop="bridge" required>
        <el-select
          v-model="localData.bridge"
          placeholder="请选择网络桥接"
          size="large"
          style="width: 400px"
        >
          <el-option
            v-for="network in networkList"
            :key="network.networkId"
            :label="`${network.iface} (${network.type})`"
            :value="network.iface"
          />
        </el-select>
        <template #extra>
          <div class="form-tip">选择虚拟机连接的网络桥接</div>
        </template>
      </el-form-item>

      <el-form-item label="网络模型" prop="networkModel" required>
        <el-radio-group v-model="localData.networkModel" size="large">
          <el-radio value="virtio">VirtIO (推荐)</el-radio>
          <el-radio value="e1000">E1000</el-radio>
          <el-radio value="rtl8139">RTL8139</el-radio>
        </el-radio-group>
        <template #extra>
          <div class="form-tip">VirtIO 提供最佳性能，适用于大多数现代操作系统</div>
        </template>
      </el-form-item>

      <el-form-item label="MAC地址">
        <el-input
          v-model="localData.macAddress"
          placeholder="留空自动生成"
          size="large"
          style="width: 400px"
          clearable
        />
        <template #extra>
          <div class="form-tip">格式: XX:XX:XX:XX:XX:XX，留空则自动生成</div>
        </template>
      </el-form-item>

      <el-form-item label="VLAN标签">
        <el-input-number
          v-model="localData.vlanTag"
          :min="1"
          :max="4094"
          placeholder="不使用VLAN"
          size="large"
          style="width: 200px"
        />
        <template #extra>
          <div class="form-tip">可选，用于网络隔离</div>
        </template>
      </el-form-item>

      <el-form-item label="防火墙">
        <el-switch
          v-model="localData.firewall"
          active-text="启用"
          inactive-text="禁用"
        />
        <template #extra>
          <div class="form-tip">启用后将应用PVE防火墙规则</div>
        </template>
      </el-form-item>
    </div>

    <!-- 带宽限制 -->
    <div class="form-section">
      <div class="section-title">带宽限制（可选）</div>
      
      <el-form-item label="速率限制">
        <el-input-number
          v-model="localData.rateLimit"
          :min="0"
          :max="10000"
          placeholder="0表示不限制"
          size="large"
          style="width: 200px"
        />
        <span class="unit-text">MB/s</span>
        <template #extra>
          <div class="form-tip">0 表示不限制带宽</div>
        </template>
      </el-form-item>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  modelValue: any;
  networkList: any[];
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const localData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<style lang="scss" scoped>
.network-config-step {
  .form-section {
    margin-bottom: 40px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e4e7ed;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .unit-text {
    margin-left: 8px;
    color: #606266;
  }
}
</style>

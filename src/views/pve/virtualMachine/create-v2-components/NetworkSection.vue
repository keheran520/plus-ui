<template>
  <div class="form-section">
    <div class="section-title">网络配置</div>
    
    <el-form-item label="网络桥接" prop="bridge">
      <el-select
        v-model="networkInfo.bridge"
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
      <div style="margin-top: 8px; font-size: 12px; color: #909399">
        选择虚拟机连接的网络桥接
      </div>
    </el-form-item>

    <el-form-item label="网络模型" prop="networkModel">
      <el-radio-group v-model="networkInfo.networkModel" size="large">
        <el-radio-button value="virtio">VirtIO (推荐)</el-radio-button>
        <el-radio-button value="e1000">E1000</el-radio-button>
        <el-radio-button value="rtl8139">RTL8139</el-radio-button>
      </el-radio-group>
      <div style="margin-top: 8px; font-size: 12px; color: #909399">
        VirtIO 提供最佳性能，适用于大多数现代操作系统
      </div>
    </el-form-item>

    <el-form-item label="MAC地址">
      <el-input
        v-model="networkInfo.macAddress"
        placeholder="留空自动生成"
        size="large"
        style="width: 400px"
        clearable
      />
      <div style="margin-top: 8px; font-size: 12px; color: #909399">
        留空将自动生成MAC地址
      </div>
    </el-form-item>

    <el-form-item label="VLAN标签">
      <el-input-number
        v-model="networkInfo.vlanTag"
        :min="1"
        :max="4094"
        placeholder="可选"
        size="large"
        style="width: 200px"
        clearable
      />
      <div style="margin-top: 8px; font-size: 12px; color: #909399">
        可选，用于VLAN网络隔离
      </div>
    </el-form-item>

    <el-form-item label="防火墙">
      <el-switch
        v-model="networkInfo.firewall"
        active-text="启用"
        inactive-text="禁用"
      />
      <div style="margin-top: 8px; font-size: 12px; color: #909399">
        启用后将应用PVE防火墙规则
      </div>
    </el-form-item>
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

// 双向绑定
const networkInfo = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}
</style>

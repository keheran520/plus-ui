<template>
  <div class="template-step3">
    <div class="step-title">网络配置</div>
    <div class="step-desc">配置虚拟机的网络连接</div>

    <el-form label-width="120px">
      <el-form-item label="网络桥接" required>
        <el-select v-model="localData.bridge" placeholder="请选择网络桥接" style="width: 300px">
          <el-option label="vmbr0 (公网)" value="vmbr0" />
          <el-option label="vmbr1 (私网)" value="vmbr1" />
        </el-select>
        <div class="form-tip">选择虚拟机连接的网络桥接</div>
      </el-form-item>

      <el-form-item label="网卡模型">
        <el-select v-model="localData.networkModel" style="width: 300px">
          <el-option label="VirtIO (推荐)" value="virtio" />
          <el-option label="Intel E1000" value="e1000" />
          <el-option label="Realtek RTL8139" value="rtl8139" />
        </el-select>
        <div class="form-tip">VirtIO提供最佳性能，需要客户机驱动支持</div>
      </el-form-item>

      <el-form-item label="MAC地址">
        <el-input v-model="localData.macAddress" placeholder="留空自动生成" style="width: 300px" />
        <div class="form-tip">留空将自动生成MAC地址</div>
      </el-form-item>

      <el-form-item label="VLAN标签">
        <el-input-number v-model="localData.vlanTag" :max="4094" :min="1" placeholder="可选" style="width: 300px" />
        <div class="form-tip">可选，用于VLAN网络隔离</div>
      </el-form-item>

      <el-form-item label="防火墙">
        <el-switch v-model="localData.firewall" />
        <span style="margin-left: 12px; color: #606266">启用虚拟机防火墙</span>
      </el-form-item>

      <el-form-item label="自动启动">
        <el-switch v-model="autoStartSwitch" @change="handleAutoStartChange" />
        <span style="margin-left: 12px; color: #606266">节点启动时自动启动虚拟机</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);
const localData = ref({ ...props.modelValue });
const autoStartSwitch = ref(false);

onMounted(() => {
  autoStartSwitch.value = localData.value.autoStart === '1';
});

function handleAutoStartChange(val: boolean) {
  localData.value.autoStart = val ? '1' : '0';
}

watch(
  localData,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.template-step3 {
  .step-title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .step-desc {
    color: #909399;
    margin-bottom: 24px;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}
</style>

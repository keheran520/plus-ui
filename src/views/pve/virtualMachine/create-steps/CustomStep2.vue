<template>
  <div class="custom-step2">
    <div class="step-title">硬件配置</div>
    <div class="step-desc">配置虚拟机的CPU、内存和存储</div>
    
    <el-form label-width="140px">
      <!-- CPU配置 -->
      <el-divider content-position="left">处理器</el-divider>
      
      <el-form-item label="CPU核心数" required>
        <el-input-number v-model="localData.cpuCores" :min="1" :max="64" style="width: 200px" />
        <span style="margin-left: 8px; color: #909399;">核</span>
        <div class="form-tip">分配给虚拟机的CPU核心数量</div>
      </el-form-item>
      
      <el-form-item label="CPU类型">
        <el-select v-model="localData.cpuType" style="width: 300px">
          <el-option label="kvm64 (默认)" value="kvm64" />
          <el-option label="host (性能最佳)" value="host" />
          <el-option label="x86-64-v2-AES" value="x86-64-v2-AES" />
          <el-option label="Broadwell" value="Broadwell" />
          <el-option label="Skylake-Client" value="Skylake-Client" />
        </el-select>
        <div class="form-tip">host类型性能最佳，但会限制虚拟机迁移</div>
      </el-form-item>
      
      <el-form-item label="CPU限制">
        <el-input-number v-model="localData.cpuLimit" :min="0" :max="128" :precision="2" style="width: 200px" />
        <span style="margin-left: 8px; color: #909399;">0 = 无限制</span>
        <div class="form-tip">限制CPU使用率，0表示不限制</div>
      </el-form-item>
      
      <el-form-item label="CPU单元">
        <el-input-number v-model="localData.cpuUnits" :min="2" :max="262144" style="width: 200px" />
        <div class="form-tip">CPU调度权重，默认1024</div>
      </el-form-item>
      
      <!-- 内存配置 -->
      <el-divider content-position="left">内存</el-divider>
      
      <el-form-item label="内存大小" required>
        <el-input-number v-model="localData.memorySize" :min="1" :max="512" style="width: 200px" />
        <span style="margin-left: 8px; color: #909399;">GB</span>
        <div class="form-tip">分配给虚拟机的内存大小</div>
      </el-form-item>
      
      <el-form-item label="最小内存">
        <el-input-number v-model="localData.minMemory" :min="1" :max="localData.memorySize" style="width: 200px" />
        <span style="margin-left: 8px; color: #909399;">GB</span>
        <div class="form-tip">启用Ballooning时的最小内存</div>
      </el-form-item>
      
      <el-form-item label="Ballooning设备">
        <el-checkbox v-model="localData.balloon">启用内存气球设备</el-checkbox>
        <div class="form-tip">允许动态调整虚拟机内存</div>
      </el-form-item>
      
      <!-- 存储配置 -->
      <el-divider content-position="left">存储</el-divider>
      
      <el-form-item label="存储池" required>
        <el-select v-model="localData.storage" placeholder="请选择存储池" style="width: 300px">
          <el-option label="local-lvm (LVM精简卷)" value="local-lvm" />
          <el-option label="local (目录)" value="local" />
        </el-select>
        <div class="form-tip">虚拟机磁盘存储的位置</div>
      </el-form-item>
      
      <el-form-item label="磁盘大小" required>
        <el-input-number v-model="localData.systemDiskSize" :min="10" :max="2000" style="width: 200px" />
        <span style="margin-left: 8px; color: #909399;">GB</span>
        <div class="form-tip">系统盘大小，最小10GB</div>
      </el-form-item>
      
      <el-form-item label="总线类型">
        <el-select v-model="localData.diskBus" style="width: 200px">
          <el-option label="SCSI (推荐)" value="scsi" />
          <el-option label="SATA" value="sata" />
          <el-option label="VirtIO Block" value="virtio" />
          <el-option label="IDE" value="ide" />
        </el-select>
        <div class="form-tip">SCSI提供最佳性能和功能</div>
      </el-form-item>
      
      <el-form-item label="缓存模式">
        <el-select v-model="localData.cache" style="width: 200px">
          <el-option label="无缓存 (默认)" value="none" />
          <el-option label="Write through" value="writethrough" />
          <el-option label="Write back" value="writeback" />
        </el-select>
        <div class="form-tip">磁盘缓存策略</div>
      </el-form-item>
      
      <el-form-item label="高级选项">
        <el-checkbox v-model="localData.discard">启用Discard</el-checkbox>
        <el-checkbox v-model="localData.iothread" style="margin-left: 16px;">启用IO Thread</el-checkbox>
        <div class="form-tip">Discard支持TRIM，IO Thread提升性能</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);
const localData = ref({ ...props.modelValue });

onMounted(() => {
  // 设置默认值
  if (!localData.value.cpuType) localData.value.cpuType = 'kvm64';
  if (!localData.value.cpuLimit) localData.value.cpuLimit = 0;
  if (!localData.value.cpuUnits) localData.value.cpuUnits = 1024;
  if (!localData.value.diskBus) localData.value.diskBus = 'scsi';
  if (!localData.value.cache) localData.value.cache = 'none';
});

watch(localData, (newVal) => {
  emit('update:modelValue', newVal);
}, { deep: true });
</script>

<style lang="scss" scoped>
.custom-step2 {
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

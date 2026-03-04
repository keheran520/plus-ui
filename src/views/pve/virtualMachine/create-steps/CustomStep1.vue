<template>
  <div class="custom-step1">
    <div class="step-title">基本配置</div>
    <div class="step-desc">配置虚拟机的基本信息和ISO镜像</div>
    
    <el-form label-width="140px">
      <el-divider content-position="left">基本信息</el-divider>
      
      <el-form-item label="所属节点" required>
        <el-select v-model="localData.nodeId" placeholder="请选择节点" style="width: 300px">
          <el-option v-for="node in nodeList" :key="node.nodeId" :label="node.nodeName" :value="node.nodeId" />
        </el-select>
        <div class="form-tip">虚拟机将运行在此节点上</div>
      </el-form-item>
      
      <el-form-item label="虚拟机名称" required>
        <el-input v-model="localData.vmName" placeholder="请输入虚拟机名称" style="width: 300px" />
        <div class="form-tip">用于标识虚拟机的唯一名称</div>
      </el-form-item>
      
      <el-form-item label="PVE VM ID" required>
        <el-input-number v-model="localData.pveVmId" :min="100" :max="999999" style="width: 300px" />
        <div class="form-tip">PVE中的VMID，必须唯一（100-999999）</div>
      </el-form-item>
      
      <el-divider content-position="left">ISO镜像</el-divider>
      
      <el-form-item label="ISO镜像">
        <el-select v-model="localData.isoImage" placeholder="请选择ISO镜像" style="width: 400px">
          <el-option label="不使用任何介质" value="" />
          <el-option label="CentOS-7-x86_64-Minimal-2009.iso" value="centos7" />
          <el-option label="ubuntu-20.04.6-live-server-amd64.iso" value="ubuntu20" />
          <el-option label="debian-11.7.0-amd64-netinst.iso" value="debian11" />
          <el-option label="Windows_Server_2019_Datacenter.iso" value="windows2019" />
          <el-option label="Windows_Server_2022_Datacenter.iso" value="windows2022" />
        </el-select>
        <div class="form-tip">选择安装操作系统的ISO镜像文件</div>
      </el-form-item>
      
      <el-divider content-position="left">操作系统</el-divider>
      
      <el-form-item label="操作系统类型" required>
        <el-select v-model="localData.osType" style="width: 300px" @change="handleOsTypeChange">
          <el-option label="Linux" value="Linux" />
          <el-option label="Windows" value="Windows" />
          <el-option label="其他" value="other" />
        </el-select>
        <div class="form-tip">选择虚拟机的操作系统类型</div>
      </el-form-item>
      
      <el-form-item label="操作系统版本">
        <el-select v-model="localData.osVersion" style="width: 300px">
          <template v-if="localData.osType === 'Linux'">
            <el-option label="6.x - 2.6 Kernel" value="6.x" />
            <el-option label="5.x - 2.6 Kernel" value="5.x" />
            <el-option label="4.x/3.x/2.6 Kernel" value="4.x" />
            <el-option label="2.6 Kernel" value="2.6" />
            <el-option label="2.4 Kernel" value="2.4" />
          </template>
          <template v-else-if="localData.osType === 'Windows'">
            <el-option label="11/2022" value="11" />
            <el-option label="10/2016/2019" value="10" />
            <el-option label="8.x/2012/2012r2" value="8" />
            <el-option label="7/2008r2" value="7" />
            <el-option label="Vista/2008" value="vista" />
            <el-option label="XP/2003" value="xp" />
          </template>
          <template v-else>
            <el-option label="其他" value="other" />
          </template>
        </el-select>
        <div class="form-tip">选择操作系统的具体版本</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: any;
  nodeList: any[];
}>();

const emit = defineEmits(['update:modelValue']);
const localData = ref({ ...props.modelValue });

function handleOsTypeChange() {
  // 切换操作系统类型时重置版本
  localData.value.osVersion = '';
}

watch(localData, (newVal) => {
  emit('update:modelValue', newVal);
}, { deep: true });
</script>

<style lang="scss" scoped>
.custom-step1 {
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

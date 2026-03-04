<template>
  <div class="custom-step4">
    <div class="step-title">确认配置信息</div>
    <div class="step-desc">请确认以下配置，点击"完成创建"按钮将创建虚拟机</div>
    
    <el-alert type="info" :closable="false" style="margin-bottom: 24px">
      <template #title>
        虚拟机将使用自定义配置创建，请确保所有参数正确
      </template>
    </el-alert>
    
    <el-descriptions :column="2" border size="large">
      <el-descriptions-item label="创建方式">
        <el-tag type="warning">自定义创建</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="虚拟机名称">{{ modelValue.vmName }}</el-descriptions-item>
      <el-descriptions-item label="PVE VM ID">{{ modelValue.pveVmId }}</el-descriptions-item>
      <el-descriptions-item label="所属节点">{{ getNodeName() }}</el-descriptions-item>
      <el-descriptions-item label="ISO镜像">{{ getIsoName() }}</el-descriptions-item>
      <el-descriptions-item label="操作系统">{{ modelValue.osType }} {{ modelValue.osVersion }}</el-descriptions-item>
    </el-descriptions>
    
    <el-divider content-position="left">硬件配置</el-divider>
    
    <el-descriptions :column="2" border size="large">
      <el-descriptions-item label="CPU核心">
        <el-icon><Cpu /></el-icon>
        {{ modelValue.cpuCores }} 核
      </el-descriptions-item>
      <el-descriptions-item label="CPU类型">{{ modelValue.cpuType || 'kvm64' }}</el-descriptions-item>
      <el-descriptions-item label="内存">
        <el-icon><Memo /></el-icon>
        {{ modelValue.memorySize }} GB
      </el-descriptions-item>
      <el-descriptions-item label="Ballooning">
        <el-tag :type="modelValue.balloon ? 'success' : 'info'">
          {{ modelValue.balloon ? '启用' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="存储池">{{ modelValue.storage }}</el-descriptions-item>
      <el-descriptions-item label="系统盘">
        <el-icon><Coin /></el-icon>
        {{ modelValue.systemDiskSize }} GB
      </el-descriptions-item>
      <el-descriptions-item label="总线类型">{{ modelValue.diskBus || 'scsi' }}</el-descriptions-item>
      <el-descriptions-item label="缓存模式">{{ modelValue.cache || 'none' }}</el-descriptions-item>
      <el-descriptions-item label="Discard">
        <el-tag :type="modelValue.discard ? 'success' : 'info'" size="small">
          {{ modelValue.discard ? '启用' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="IO Thread">
        <el-tag :type="modelValue.iothread ? 'success' : 'info'" size="small">
          {{ modelValue.iothread ? '启用' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>
    
    <el-divider content-position="left">网络配置</el-divider>
    
    <el-descriptions :column="2" border size="large">
      <el-descriptions-item label="网络桥接">{{ modelValue.bridge || '-' }}</el-descriptions-item>
      <el-descriptions-item label="网卡模型">{{ modelValue.networkModel || 'virtio' }}</el-descriptions-item>
      <el-descriptions-item label="MAC地址">{{ modelValue.macAddress || '自动生成' }}</el-descriptions-item>
      <el-descriptions-item label="VLAN标签">{{ modelValue.vlanTag || '-' }}</el-descriptions-item>
      <el-descriptions-item label="防火墙">
        <el-tag :type="modelValue.firewall ? 'success' : 'info'">
          {{ modelValue.firewall ? '启用' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="自动启动">
        <el-tag :type="modelValue.autoStart === '1' ? 'success' : 'info'">
          {{ modelValue.autoStart === '1' ? '是' : '否' }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>
    
    <el-divider />
    
    <div class="cost-summary">
      <h3>费用预估</h3>
      <div class="cost-item">
        <span>配置费用：</span>
        <span class="cost-value">¥{{ calculateCost() }}/月</span>
      </div>
      <div class="cost-note">
        * 以上费用仅供参考，实际费用以账单为准
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Cpu, Memo, Coin } from '@element-plus/icons-vue';

const props = defineProps<{
  modelValue: any;
  nodeList: any[];
}>();

function getNodeName() {
  const node = props.nodeList.find(n => n.nodeId === props.modelValue.nodeId);
  return node ? node.nodeName : '-';
}

function getIsoName() {
  const isoMap: any = {
    centos7: 'CentOS-7-x86_64-Minimal-2009.iso',
    ubuntu20: 'ubuntu-20.04.6-live-server-amd64.iso',
    debian11: 'debian-11.7.0-amd64-netinst.iso',
    windows2019: 'Windows_Server_2019_Datacenter.iso',
    windows2022: 'Windows_Server_2022_Datacenter.iso'
  };
  return props.modelValue.isoImage ? isoMap[props.modelValue.isoImage] : '不使用任何介质';
}

function calculateCost() {
  // 简单的费用计算逻辑
  const cpuCost = props.modelValue.cpuCores * 20;
  const memoryCost = props.modelValue.memorySize * 15;
  const diskCost = props.modelValue.systemDiskSize * 0.5;
  return (cpuCost + memoryCost + diskCost).toFixed(2);
}
</script>

<style lang="scss" scoped>
.custom-step4 {
  .step-title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .step-desc {
    color: #909399;
    margin-bottom: 24px;
  }
  
  .cost-summary {
    background: #f5f7fa;
    padding: 20px;
    border-radius: 8px;
    margin-top: 24px;
    
    h3 {
      font-size: 16px;
      margin-bottom: 16px;
      color: #303133;
    }
    
    .cost-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 15px;
      
      .cost-value {
        color: #ff6b00;
        font-size: 24px;
        font-weight: 500;
      }
    }
    
    .cost-note {
      font-size: 12px;
      color: #909399;
      margin-top: 12px;
    }
  }
}
</style>

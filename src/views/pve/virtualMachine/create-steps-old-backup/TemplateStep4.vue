<template>
  <div class="template-step4">
    <div class="step-title">确认配置信息</div>
    <div class="step-desc">请确认以下配置，点击"完成创建"按钮将创建虚拟机</div>

    <el-alert :closable="false" style="margin-bottom: 24px" type="info">
      <template #title> 虚拟机将基于选择的模板进行克隆，并应用您配置的规格参数 </template>
    </el-alert>

    <el-descriptions :column="2" border size="large">
      <el-descriptions-item label="创建方式">
        <el-tag type="success">基于模板创建</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="模板">{{ getTemplateName() }}</el-descriptions-item>
      <el-descriptions-item label="虚拟机名称">{{ modelValue.vmName }}</el-descriptions-item>
      <el-descriptions-item label="PVE VM ID">{{ modelValue.pveVmId }}</el-descriptions-item>
      <el-descriptions-item label="所属节点">{{ getNodeName() }}</el-descriptions-item>
      <el-descriptions-item label="规格套餐">
        <el-tag>{{ getSpecName() }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="CPU核心">
        <el-icon><Cpu /></el-icon>
        {{ modelValue.cpuCores }} 核
      </el-descriptions-item>
      <el-descriptions-item label="内存">
        <el-icon><Memo /></el-icon>
        {{ modelValue.memorySize }} GB
      </el-descriptions-item>
      <el-descriptions-item label="系统盘">
        <el-icon><Coin /></el-icon>
        {{ modelValue.systemDiskSize }} GB
      </el-descriptions-item>
      <el-descriptions-item label="网络桥接">{{ modelValue.bridge || '-' }}</el-descriptions-item>
      <el-descriptions-item label="网卡模型">{{ modelValue.networkModel || 'virtio' }}</el-descriptions-item>
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
      <div class="cost-note">* 以上费用仅供参考，实际费用以账单为准</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Coin, Cpu, Memo } from '@element-plus/icons-vue';

const props = defineProps<{
  modelValue: any;
  nodeList: any[];
  templateList: any[];
}>();

function getTemplateName() {
  const template = props.templateList.find((t) => t.imageId === props.modelValue.templateId);
  return template ? template.imageName : '-';
}

function getNodeName() {
  const node = props.nodeList.find((n) => n.nodeId === props.modelValue.nodeId);
  return node ? node.nodeName : '-';
}

function getSpecName() {
  const specMap: any = {
    1: '入门型',
    2: '标准型',
    3: '进阶型',
    4: '专业型'
  };
  return props.modelValue.specId ? specMap[props.modelValue.specId] : '自定义';
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
.template-step4 {
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

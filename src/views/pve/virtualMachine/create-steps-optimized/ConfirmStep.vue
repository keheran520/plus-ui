<template>
  <div class="confirm-step">
    <el-alert
      title="请确认配置信息"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 24px"
    >
      <p>请仔细核对以下配置信息，确认无误后点击"完成创建"按钮</p>
    </el-alert>

    <!-- 基本配置 -->
    <div class="config-section">
      <div class="section-title">
        <el-icon><Document /></el-icon>
        <span>基本配置</span>
      </div>
      <div class="config-content">
        <div class="config-row">
          <span class="config-label">创建方式:</span>
          <span class="config-value">{{ formData.createMode === 'template' ? '基于模板创建' : '自定义创建' }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">节点:</span>
          <span class="config-value">{{ getNodeName(formData.nodeId) }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">虚拟机名称:</span>
          <span class="config-value">{{ formData.vmName }}</span>
        </div>
        <div v-if="formData.createMode === 'template'" class="config-row">
          <span class="config-label">模板:</span>
          <span class="config-value">{{ getTemplateName(formData.templateId) }}</span>
        </div>
        <div v-else class="config-row">
          <span class="config-label">ISO镜像:</span>
          <span class="config-value">{{ formData.isoImage }}</span>
        </div>
      </div>
    </div>

    <!-- 计算规格 -->
    <div class="config-section">
      <div class="section-title">
        <el-icon><Cpu /></el-icon>
        <span>计算规格</span>
      </div>
      <div class="config-content">
        <div class="config-row">
          <span class="config-label">CPU:</span>
          <span class="config-value">{{ formData.cpuCores }} 核 ({{ formData.cpuType }})</span>
        </div>
        <div class="config-row">
          <span class="config-label">内存:</span>
          <span class="config-value">{{ formData.memorySize }} GB</span>
        </div>
        <div v-if="formData.cpuLimit > 0" class="config-row">
          <span class="config-label">CPU限制:</span>
          <span class="config-value">{{ formData.cpuLimit }} 核</span>
        </div>
        <div v-if="formData.minMemory" class="config-row">
          <span class="config-label">最小内存:</span>
          <span class="config-value">{{ formData.minMemory }} GB</span>
        </div>
      </div>
    </div>

    <!-- 存储配置 -->
    <div class="config-section">
      <div class="section-title">
        <el-icon><Coin /></el-icon>
        <span>存储配置</span>
      </div>
      <div class="config-content">
        <div class="config-row">
          <span class="config-label">系统盘:</span>
          <span class="config-value">{{ formData.systemDiskSize }} GB ({{ formData.systemDiskStorage }})</span>
        </div>
        <div v-if="formData.dataDisks && formData.dataDisks.length > 0">
          <div v-for="(disk, index) in formData.dataDisks" :key="index" class="config-row">
            <span class="config-label">数据盘{{ index + 1 }}:</span>
            <span class="config-value">{{ disk.size }} GB ({{ disk.storage }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 网络配置 -->
    <div class="config-section">
      <div class="section-title">
        <el-icon><Connection /></el-icon>
        <span>网络配置</span>
      </div>
      <div class="config-content">
        <div class="config-row">
          <span class="config-label">网络桥接:</span>
          <span class="config-value">{{ formData.bridge }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">网络模型:</span>
          <span class="config-value">{{ formData.networkModel }}</span>
        </div>
        <div v-if="formData.macAddress" class="config-row">
          <span class="config-label">MAC地址:</span>
          <span class="config-value">{{ formData.macAddress }}</span>
        </div>
        <div v-if="formData.vlanTag" class="config-row">
          <span class="config-label">VLAN标签:</span>
          <span class="config-value">{{ formData.vlanTag }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">防火墙:</span>
          <span class="config-value">{{ formData.firewall ? '启用' : '禁用' }}</span>
        </div>
      </div>
    </div>

    <!-- 高级配置 -->
    <div class="config-section">
      <div class="section-title">
        <el-icon><Setting /></el-icon>
        <span>高级配置</span>
      </div>
      <div class="config-content">
        <div class="config-row">
          <span class="config-label">开机自启:</span>
          <span class="config-value">{{ formData.autoStart ? '启用' : '禁用' }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">内存气球:</span>
          <span class="config-value">{{ formData.balloon ? '启用' : '禁用' }}</span>
        </div>
        <div v-if="formData.remark" class="config-row">
          <span class="config-label">备注:</span>
          <span class="config-value">{{ formData.remark }}</span>
        </div>
      </div>
    </div>

    <!-- 费用预估 -->
    <div class="cost-section">
      <el-alert
        title="费用预估"
        type="warning"
        :closable="false"
        show-icon
      >
        <p>根据您的配置，预估费用如下：</p>
        <div class="cost-detail">
          <div class="cost-item">
            <span>CPU ({{ formData.cpuCores }}核):</span>
            <span class="cost-value">¥{{ (formData.cpuCores * 0.5).toFixed(2) }}/小时</span>
          </div>
          <div class="cost-item">
            <span>内存 ({{ formData.memorySize }}GB):</span>
            <span class="cost-value">¥{{ (formData.memorySize * 0.2).toFixed(2) }}/小时</span>
          </div>
          <div class="cost-item">
            <span>存储 ({{ formData.systemDiskSize }}GB):</span>
            <span class="cost-value">¥{{ (formData.systemDiskSize * 0.01).toFixed(2) }}/小时</span>
          </div>
          <div class="cost-total">
            <span>预估总计:</span>
            <span class="total-value">¥{{ calculateTotalCost() }}/小时</span>
          </div>
        </div>
        <p style="margin-top: 12px; font-size: 12px; color: #909399;">
          * 以上费用仅供参考，实际费用以账单为准
        </p>
      </el-alert>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Coin, Connection, Cpu, Document, Setting } from '@element-plus/icons-vue';

interface Props {
  formData: any;
  nodeList: any[];
  templateList: any[];
  storageList: any[];
  networkList: any[];
}

const props = defineProps<Props>();

function getNodeName(nodeId: number): string {
  const node = props.nodeList.find(n => n.nodeId === nodeId);
  return node ? node.nodeName : '未知节点';
}

function getTemplateName(templateId: number): string {
  const template = props.templateList.find(t => t.imageId === templateId);
  return template ? template.imageName : '未知模板';
}

function calculateTotalCost(): string {
  const cpuCost = props.formData.cpuCores * 0.5;
  const memoryCost = props.formData.memorySize * 0.2;
  const storageCost = props.formData.systemDiskSize * 0.01;
  return (cpuCost + memoryCost + storageCost).toFixed(2);
}
</script>

<style lang="scss" scoped>
.confirm-step {
  .config-section {
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    margin-bottom: 20px;
    overflow: hidden;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 20px;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      font-size: 15px;
      font-weight: 500;
      color: #303133;
    }

    .config-content {
      padding: 20px;

      .config-row {
        display: flex;
        padding: 12px 0;
        border-bottom: 1px dashed #e4e7ed;

        &:last-child {
          border-bottom: none;
        }

        .config-label {
          flex: 0 0 150px;
          color: #606266;
          font-size: 14px;
        }

        .config-value {
          flex: 1;
          color: #303133;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }

  .cost-section {
    margin-top: 24px;

    .cost-detail {
      margin-top: 12px;
      padding: 16px;
      background: #fff;
      border-radius: 4px;

      .cost-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 14px;
        color: #606266;

        .cost-value {
          color: #303133;
          font-weight: 500;
        }
      }

      .cost-total {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        margin-top: 12px;
        border-top: 2px solid #e4e7ed;
        font-size: 16px;
        font-weight: 500;

        .total-value {
          color: var(--el-color-primary);
          font-size: 18px;
        }
      }
    }
  }
}
</style>

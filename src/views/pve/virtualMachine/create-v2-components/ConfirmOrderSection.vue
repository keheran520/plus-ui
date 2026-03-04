<template>
  <div class="confirm-section">
    <div class="section-title">确认配置信息</div>
    
    <el-alert
      title="请仔细核对以下配置信息"
      type="info"
      :closable="false"
      style="margin-bottom: 24px"
    />

    <div class="config-summary">
      <!-- 基本信息 -->
      <div class="config-group">
        <div class="group-title">基本信息</div>
        <div class="config-items">
          <div class="config-item">
            <span class="label">节点:</span>
            <span class="value">{{ getNodeName(basicInfo.nodeId) }}</span>
          </div>
          <div class="config-item">
            <span class="label">实例名称:</span>
            <span class="value">{{ customConfig.instanceName }}</span>
          </div>
        </div>
      </div>

      <!-- 规格配置 -->
      <div class="config-group">
        <div class="group-title">规格配置</div>
        <div class="config-items">
          <div class="config-item">
            <span class="label">CPU:</span>
            <span class="value">{{ specificationInfo.cpuCores }} vCPU</span>
          </div>
          <div class="config-item">
            <span class="label">内存:</span>
            <span class="value">{{ specificationInfo.memory }} GB</span>
          </div>
        </div>
      </div>

      <!-- 镜像信息 -->
      <div class="config-group">
        <div class="group-title">镜像信息</div>
        <div class="config-items">
          <div class="config-item">
            <span class="label">模板:</span>
            <span class="value">{{ getImageName(imageInfo.imageId) }}</span>
          </div>
          <div class="config-item">
            <span class="label">操作系统:</span>
            <span class="value">{{ imageInfo.osType }} {{ imageInfo.osVersion }}</span>
          </div>
        </div>
      </div>

      <!-- 存储配置 -->
      <div class="config-group">
        <div class="group-title">存储配置</div>
        <div class="config-items">
          <div class="config-item">
            <span class="label">系统盘大小:</span>
            <span class="value">{{ storageInfo.systemDiskSize }} GB</span>
          </div>
          <div class="config-item">
            <span class="label">存储池:</span>
            <span class="value">{{ storageInfo.systemDiskStorage }}</span>
          </div>
        </div>
      </div>

      <!-- 网络配置 -->
      <div class="config-group">
        <div class="group-title">网络配置</div>
        <div class="config-items">
          <div class="config-item">
            <span class="label">网络桥接:</span>
            <span class="value">{{ networkInfo.bridge }}</span>
          </div>
          <div class="config-item">
            <span class="label">网络模型:</span>
            <span class="value">{{ networkInfo.networkModel }}</span>
          </div>
          <div v-if="networkInfo.macAddress" class="config-item">
            <span class="label">MAC地址:</span>
            <span class="value">{{ networkInfo.macAddress }}</span>
          </div>
          <div v-if="networkInfo.vlanTag" class="config-item">
            <span class="label">VLAN标签:</span>
            <span class="value">{{ networkInfo.vlanTag }}</span>
          </div>
          <div class="config-item">
            <span class="label">防火墙:</span>
            <span class="value">{{ networkInfo.firewall ? '启用' : '禁用' }}</span>
          </div>
        </div>
      </div>

      <!-- 其他配置 -->
      <div class="config-group">
        <div class="group-title">其他配置</div>
        <div class="config-items">
          <div class="config-item">
            <span class="label">开机自启:</span>
            <span class="value">{{ customConfig.autoStart ? '启用' : '禁用' }}</span>
          </div>
          <div v-if="customConfig.remark" class="config-item">
            <span class="label">备注:</span>
            <span class="value">{{ customConfig.remark }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-alert
      title="提示"
      type="warning"
      :closable="false"
      style="margin-top: 24px"
    >
      <template #default>
        <div>虚拟机创建需要一定时间，请耐心等待。创建完成后可在虚拟机列表中查看。</div>
      </template>
    </el-alert>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  basicInfo: any;
  specificationInfo: any;
  imageInfo: any;
  storageInfo: any;
  networkInfo: any;
  customConfig: any;
  nodeList: any[];
  imageList: any[];
  storagePoolList: any[];
  networkList: any[];
}

const props = defineProps<Props>();

// 获取节点名称
function getNodeName(nodeId: number): string {
  const node = props.nodeList.find(n => n.nodeId === nodeId);
  return node?.nodeName || '未知节点';
}

// 获取镜像名称
function getImageName(imageId: number): string {
  const image = props.imageList.find(img => img.imageId === imageId);
  return image?.imageName || '未知镜像';
}
</script>

<style lang="scss" scoped>
.confirm-section {
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 24px;
}

.config-summary {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 24px;
}

.config-group {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.group-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.config-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.config-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;

  .label {
    font-size: 14px;
    color: #909399;
    min-width: 100px;
  }

  .value {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }
}
</style>

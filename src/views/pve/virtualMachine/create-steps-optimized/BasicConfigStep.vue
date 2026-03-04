<template>
  <div class="basic-config-step">
    <!-- 创建方式选择 -->
    <div class="form-section">
      <div class="section-title">创建方式</div>
      <el-form-item label="选择方式" required>
        <el-radio-group v-model="localData.createMode" class="mode-radio-group">
          <el-radio value="template" class="mode-radio">
            <div class="mode-card">
              <el-icon :size="24"><Document /></el-icon>
              <div class="mode-info">
                <div class="mode-title">基于模板创建</div>
                <div class="mode-desc">从镜像库选择模板，快速创建</div>
              </div>
            </div>
          </el-radio>
          <el-radio value="custom" class="mode-radio">
            <div class="mode-card">
              <el-icon :size="24"><Setting /></el-icon>
              <div class="mode-info">
                <div class="mode-title">自定义创建</div>
                <div class="mode-desc">选择ISO镜像，完全自定义配置</div>
              </div>
            </div>
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </div>

    <!-- 基本信息 -->
    <div class="form-section">
      <div class="section-title">基本信息</div>
      
      <el-form-item label="节点" prop="nodeId" required>
        <el-select
          v-model="localData.nodeId"
          placeholder="请选择节点"
          size="large"
          style="width: 400px"
          @change="handleNodeChange"
        >
          <el-option
            v-for="node in nodeList"
            :key="node.nodeId"
            :label="node.nodeName"
            :value="node.nodeId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="虚拟机名称" prop="vmName" required>
        <el-input
          v-model="localData.vmName"
          placeholder="请输入虚拟机名称"
          size="large"
          style="width: 400px"
          clearable
        />
        <template #extra>
          <div class="form-tip">只能包含字母、数字、下划线和连字符，长度2-50个字符</div>
        </template>
      </el-form-item>
    </div>

    <!-- 模板选择 -->
    <div v-if="localData.createMode === 'template'" class="form-section">
      <div class="section-title">
        选择模板
        <el-button :icon="Refresh" :loading="refreshing" text @click="handleRefresh">
          刷新
        </el-button>
      </div>
      
      <el-form-item label="系统模板" prop="templateId" required>
        <div v-if="templateList && templateList.length > 0" class="template-grid">
          <div
            v-for="template in templateList"
            :key="template.imageId"
            :class="['template-card', { selected: localData.templateId === template.imageId }]"
            @click="selectTemplate(template)"
          >
            <div class="template-icon">
              <el-icon :size="40">
                <Monitor v-if="template.osType === 'Linux'" />
                <Platform v-else />
              </el-icon>
            </div>
            <div class="template-info">
              <h4>{{ template.imageName }}</h4>
              <p class="os-info">{{ template.osType }} {{ template.osVersion }}</p>
              <p class="size-info">{{ formatBytes(template.imageSize) }}</p>
            </div>
            <div v-if="localData.templateId === template.imageId" class="selected-badge">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无可用模板">
          <template #extra>
            <el-alert type="info" :closable="false" show-icon>
              <p>镜像库中暂无模板，请先执行以下操作：</p>
              <ol style="margin: 10px 0; padding-left: 20px; text-align: left;">
                <li>前往【集群管理】页面</li>
                <li>找到对应的节点，点击【同步】按钮</li>
                <li>等待同步完成后，点击上方【刷新】按钮</li>
              </ol>
            </el-alert>
          </template>
        </el-empty>
      </el-form-item>
    </div>

    <!-- ISO镜像选择 -->
    <div v-if="localData.createMode === 'custom'" class="form-section">
      <div class="section-title">ISO镜像</div>
      
      <el-form-item label="操作系统" prop="isoImage" required>
        <el-select
          v-model="localData.isoImage"
          placeholder="请选择ISO镜像"
          size="large"
          style="width: 400px"
        >
          <el-option label="Ubuntu 22.04" value="ubuntu-22.04" />
          <el-option label="Ubuntu 20.04" value="ubuntu-20.04" />
          <el-option label="CentOS 7" value="centos-7" />
          <el-option label="CentOS 8" value="centos-8" />
          <el-option label="Debian 11" value="debian-11" />
          <el-option label="Windows Server 2022" value="windows-2022" />
        </el-select>
      </el-form-item>
    </div>

    <!-- 计算规格 -->
    <div class="form-section">
      <div class="section-title">计算规格</div>
      
      <el-form-item label="CPU核心数" prop="cpuCores" required>
        <el-input-number
          v-model="localData.cpuCores"
          :min="1"
          :max="128"
          size="large"
          style="width: 200px"
        />
        <span class="unit-text">核</span>
      </el-form-item>

      <el-form-item label="内存大小" prop="memorySize" required>
        <el-input-number
          v-model="localData.memorySize"
          :min="1"
          :max="1024"
          size="large"
          style="width: 200px"
        />
        <span class="unit-text">GB</span>
      </el-form-item>
    </div>

    <!-- 存储配置 -->
    <div class="form-section">
      <div class="section-title">存储配置</div>
      
      <el-form-item label="系统盘大小" prop="systemDiskSize" required>
        <el-input-number
          v-model="localData.systemDiskSize"
          :min="10"
          :max="10240"
          size="large"
          style="width: 200px"
        />
        <span class="unit-text">GB</span>
      </el-form-item>

      <el-form-item label="系统盘存储" prop="systemDiskStorage" required>
        <el-select
          v-model="localData.systemDiskStorage"
          placeholder="请选择存储池"
          size="large"
          style="width: 400px"
        >
          <el-option
            v-for="storage in storageList"
            :key="storage.storageId"
            :label="`${storage.storageName} (可用: ${formatBytes(storage.availableSize)})`"
            :value="storage.storageName"
          />
        </el-select>
      </el-form-item>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Check, Document, Monitor, Platform, Refresh, Setting } from '@element-plus/icons-vue';

interface Props {
  modelValue: any;
  nodeList: any[];
  templateList: any[];
  storageList: any[];
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue', 'node-change', 'refresh-templates']);

const refreshing = ref(false);

const localData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

function handleNodeChange(nodeId: number) {
  emit('node-change', nodeId);
}

function selectTemplate(template: any) {
  localData.value.templateId = template.imageId;
  localData.value.osType = template.osType;
  localData.value.osVersion = template.osVersion;
}

async function handleRefresh() {
  refreshing.value = true;
  try {
    emit('refresh-templates');
  } finally {
    setTimeout(() => {
      refreshing.value = false;
    }, 500);
  }
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
</script>

<style lang="scss" scoped>
.basic-config-step {
  .form-section {
    margin-bottom: 40px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e4e7ed;
      display: flex;
      align-items: center;
      justify-content: space-between;
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

  .mode-radio-group {
    display: flex;
    gap: 16px;

    .mode-radio {
      flex: 1;
      margin-right: 0;

      :deep(.el-radio__label) {
        width: 100%;
        padding: 0;
      }

      :deep(.el-radio__input) {
        display: none;
      }
    }

    .mode-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border: 2px solid #e4e7ed;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary);
      }

      .mode-info {
        flex: 1;

        .mode-title {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        .mode-desc {
          font-size: 13px;
          color: #909399;
        }
      }
    }

    :deep(.is-checked) .mode-card {
      border-color: var(--el-color-primary);
      background: #f0f9ff;
    }
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;

    .template-card {
      position: relative;
      background: #fff;
      border: 2px solid #e4e7ed;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &.selected {
        border-color: var(--el-color-primary);
        background: #f0f9ff;
      }

      .template-icon {
        color: var(--el-color-primary);
        margin-bottom: 12px;
      }

      .template-info {
        h4 {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 8px;
        }

        p {
          font-size: 13px;
          color: #606266;
          margin-bottom: 4px;
        }

        .size-info {
          color: #909399;
        }
      }

      .selected-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 24px;
        height: 24px;
        background: var(--el-color-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }
    }
  }
}
</style>

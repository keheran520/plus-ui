<template>
  <div class="template-step1">
    <div class="step-header">
      <div>
        <div class="step-title">选择系统模板</div>
        <div class="step-desc">从镜像库中选择一个模板作为虚拟机的基础系统</div>
      </div>
      <el-button :icon="Refresh" :loading="loading" @click="refreshTemplates">刷新</el-button>
    </div>

    <div v-if="templateList && templateList.length > 0" class="template-grid">
      <div
        v-for="template in templateList"
        :key="template.imageId"
        :class="['template-card', { selected: modelValue.templateId === template.imageId }]"
        @click="selectTemplate(template)"
      >
        <div class="template-icon">
          <el-icon :size="48">
            <Monitor v-if="template.osType === 'Linux'" />
            <Platform v-else />
          </el-icon>
        </div>
        <div class="template-info">
          <h4>{{ template.imageName }}</h4>
          <p class="os-info">{{ template.osType }} {{ template.osVersion }}</p>
          <p class="arch-info">{{ template.architecture }}</p>
          <p class="size-info">大小: {{ formatBytes(template.imageSize) }}</p>
        </div>
        <div v-if="modelValue.templateId === template.imageId" class="selected-badge">
          <el-icon><Check /></el-icon>
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无可用模板">
      <template #extra>
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          <p>镜像库中暂无模板，请先执行以下操作：</p>
          <ol style="margin: 10px 0; padding-left: 20px; text-align: left;">
            <li>前往【集群管理】页面</li>
            <li>找到对应的节点，点击【同步】按钮</li>
            <li>等待同步完成后，模板会自动同步到镜像库</li>
          </ol>
          <p style="color: #909399; font-size: 12px;">注意：PVE中标记为template=1的虚拟机会被同步为模板</p>
        </el-alert>
      </template>
    </el-empty>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Check, Monitor, Platform, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: any;
  templateList: any[];
}>();

const emit = defineEmits(['update:modelValue', 'refresh']);

const loading = ref(false);

function selectTemplate(template: any) {
  emit('update:modelValue', {
    ...props.modelValue,
    templateId: template.imageId,
    osType: template.osType,
    osVersion: template.osVersion
  });
}

async function refreshTemplates() {
  loading.value = true;
  try {
    emit('refresh');
    ElMessage.success('刷新成功');
  } finally {
    setTimeout(() => {
      loading.value = false;
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
.template-step1 {
  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .step-title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .step-desc {
    color: #909399;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;

    .template-card {
      background: #fff;
      border: 2px solid #e4e7ed;
      border-radius: 8px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;

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
        margin-bottom: 16px;
      }

      .template-info {
        h4 {
          font-size: 16px;
          margin-bottom: 8px;
          color: #303133;
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

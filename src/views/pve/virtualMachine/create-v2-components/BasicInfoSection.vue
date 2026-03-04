<template>
  <div class="form-section">
    <div class="section-title">基本信息</div>
    
    <!-- 节点选择 -->
    <el-form-item label="节点" prop="nodeId">
      <el-select
        v-model="basicInfo.nodeId"
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

    <!-- 规格配置 -->
    <div class="section-title" style="margin-top: 32px">规格配置</div>
    
    <el-form-item label="CPU核心数" prop="cpuCores">
      <el-input-number
        v-model="specificationInfo.cpuCores"
        :min="1"
        :max="128"
        size="large"
        style="width: 200px"
      />
      <span style="margin-left: 8px; color: #909399">vCPU</span>
    </el-form-item>

    <el-form-item label="内存大小" prop="memory">
      <el-input-number
        v-model="specificationInfo.memory"
        :min="1"
        :max="1024"
        size="large"
        style="width: 200px"
      />
      <span style="margin-left: 8px; color: #909399">GB</span>
    </el-form-item>

    <!-- 镜像选择 -->
    <div class="section-title" style="margin-top: 32px">镜像选择</div>
    
    <el-form-item label="模板" prop="imageId">
      <div class="image-selection-wrapper">
        <el-select
          v-model="imageInfo.imageId"
          placeholder="请选择模板"
          size="large"
          style="width: 500px"
          filterable
          @change="handleImageChange"
        >
          <el-option
            v-for="image in imageList"
            :key="image.imageId"
            :label="`${image.imageName} (${image.osType} ${image.osVersion || ''})`"
            :value="image.imageId"
          >
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ image.imageName }}</span>
              <el-tag size="small" type="info">{{ image.osType }} {{ image.osVersion }}</el-tag>
            </div>
          </el-option>
        </el-select>
        <el-button
          :icon="Refresh"
          style="margin-left: 8px"
          @click="handleRefreshImages"
        >
          刷新
        </el-button>
      </div>
      <div v-if="!imageList || imageList.length === 0" style="margin-top: 8px">
        <el-alert
          title="暂无可用模板"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            <div>请先在节点上创建模板，或点击刷新按钮重新加载</div>
          </template>
        </el-alert>
      </div>
    </el-form-item>

    <!-- 存储配置 -->
    <div class="section-title" style="margin-top: 32px">存储配置</div>
    
    <el-form-item label="系统盘大小" prop="systemDiskSize">
      <el-input-number
        v-model="storageInfo.systemDiskSize"
        :min="40"
        :max="10240"
        size="large"
        style="width: 200px"
      />
      <span style="margin-left: 8px; color: #909399">GB (最小40GB)</span>
    </el-form-item>

    <el-form-item label="系统盘存储" prop="systemDiskStorage">
      <el-select
        v-model="storageInfo.systemDiskStorage"
        placeholder="请选择存储池"
        size="large"
        style="width: 400px"
      >
        <el-option
          v-for="storage in storagePoolList"
          :key="storage.storageId"
          :label="`${storage.storageName} (可用: ${formatSize(storage.availableSize)})`"
          :value="storage.storageName"
        />
      </el-select>
    </el-form-item>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Refresh } from '@element-plus/icons-vue';

interface Props {
  basicInfo: any;
  specificationInfo: any;
  imageInfo: any;
  storageInfo: any;
  nodeList: any[];
  imageList: any[];
  storagePoolList: any[];
}

const props = defineProps<Props>();
const emit = defineEmits([
  'update:basicInfo',
  'update:specificationInfo',
  'update:imageInfo',
  'update:storageInfo',
  'nodeChange',
  'refreshImages'
]);

// 双向绑定
const basicInfo = computed({
  get: () => props.basicInfo,
  set: (val) => emit('update:basicInfo', val)
});

const specificationInfo = computed({
  get: () => props.specificationInfo,
  set: (val) => emit('update:specificationInfo', val)
});

const imageInfo = computed({
  get: () => props.imageInfo,
  set: (val) => emit('update:imageInfo', val)
});

const storageInfo = computed({
  get: () => props.storageInfo,
  set: (val) => emit('update:storageInfo', val)
});

// 节点变更
function handleNodeChange(nodeId: number) {
  emit('nodeChange', nodeId);
}

// 镜像变更
function handleImageChange(imageId: number) {
  const selectedImage = props.imageList.find(img => img.imageId === imageId);
  if (selectedImage) {
    imageInfo.value = {
      ...imageInfo.value,
      imageId,
      imageName: selectedImage.imageName,
      osType: selectedImage.osType,
      osVersion: selectedImage.osVersion
    };
  }
}

// 刷新镜像列表
function handleRefreshImages() {
  emit('refreshImages');
}

// 格式化大小
function formatSize(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
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

.image-selection-wrapper {
  display: flex;
  align-items: center;
}
</style>

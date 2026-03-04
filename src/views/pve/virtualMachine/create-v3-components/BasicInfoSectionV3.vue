<template>
  <div class="form-section">
    <!-- 基本信息 -->
    <SectionTitle>基本信息</SectionTitle>
    <el-space :size="20" direction="vertical" fill>
      <!-- 节点 -->
      <el-form-item label="节点" required>
        <el-select v-model="localBasicInfo.nodeId" placeholder="请选择节点" style="width: 400px" @change="handleNodeChange">
          <el-option v-for="node in nodeList" :key="node.nodeId" :label="node.nodeName" :value="node.nodeId" />
        </el-select>
      </el-form-item>
    </el-space>

    <!-- 镜像选择 -->
    <SectionTitle style="margin-top: 32px">镜像选择</SectionTitle>
    <el-space :size="20" direction="vertical" fill>
      <el-form-item label="模板" prop="imageId">
        <div class="image-selection-wrapper">
          <el-select v-model="localImageInfo.imageId" filterable placeholder="请选择模板" style="width: 400px" @change="handleImageChange">
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
          <el-button style="margin-left: 8px" @click="handleRefreshImages"> 刷新 </el-button>
        </div>
        <div v-if="!imageList || imageList.length === 0" style="margin-top: 8px">
          <el-alert :closable="false" show-icon title="暂无可用模板" type="warning">
            <template #default>
              <div>请先在节点上创建模板，或点击刷新按钮重新加载</div>
            </template>
          </el-alert>
        </div>
      </el-form-item>
    </el-space>

    <!-- 实例配置 -->
    <SectionTitle style="margin-top: 32px">实例配置</SectionTitle>
    <el-space :size="20" direction="vertical" fill>
      <el-form-item label="CPU核心数" prop="cpuCores">
        <el-input-number v-model="localSpecificationInfo.cpuCores" :max="128" :min="1" style="width: 200px" />
        <span style="margin-left: 8px; color: #909399">vCPU</span>
      </el-form-item>

      <el-form-item label="内存大小" prop="memory">
        <el-input-number v-model="localSpecificationInfo.memory" :max="1024" :min="1" style="width: 200px" />
        <span style="margin-left: 8px; color: #909399">GB</span>
      </el-form-item>
    </el-space>

    <!-- 存储配置 -->
    <SectionTitle style="margin-top: 32px">存储配置</SectionTitle>
    <StorageSectionV3 v-model="localStorageInfo" :storage-pool-list="storagePoolList" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import SectionTitle from '@/components/SectionTitle/index.vue';
import StorageSectionV3 from './StorageSectionV3.vue';

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
const emit = defineEmits(['update:basicInfo', 'update:specificationInfo', 'update:imageInfo', 'update:storageInfo', 'nodeChange', 'refreshImages']);

// 双向绑定
const localBasicInfo = computed({
  get: () => props.basicInfo,
  set: (val) => emit('update:basicInfo', val)
});

const localSpecificationInfo = computed({
  get: () => props.specificationInfo,
  set: (val) => emit('update:specificationInfo', val)
});

const localImageInfo = computed({
  get: () => props.imageInfo,
  set: (val) => emit('update:imageInfo', val)
});

const localStorageInfo = computed({
  get: () => props.storageInfo,
  set: (val) => emit('update:storageInfo', val)
});

// 节点变更
function handleNodeChange(nodeId: number) {
  emit('nodeChange', nodeId);
}

// 镜像变更
function handleImageChange(imageId: number) {
  const selectedImage = props.imageList.find((img) => img.imageId === imageId);
  if (selectedImage) {
    // 更新镜像信息
    localImageInfo.value = {
      ...localImageInfo.value,
      imageId,
      imageName: selectedImage.imageName,
      osType: selectedImage.osType,
      osVersion: selectedImage.osVersion
    };

    // 如果模板有默认的CPU和内存配置，自动填充
    if (selectedImage.cpuCores) {
      localSpecificationInfo.value = {
        ...localSpecificationInfo.value,
        cpuCores: selectedImage.cpuCores
      };
    }
    if (selectedImage.memory) {
      localSpecificationInfo.value = {
        ...localSpecificationInfo.value,
        memory: selectedImage.memory
      };
    }
  }
}

// 刷新镜像列表
function handleRefreshImages() {
  emit('refreshImages');
}
</script>

<style lang="scss" scoped>
@import './common.scss';

.image-selection-wrapper {
  display: flex;
  align-items: center;
}
</style>

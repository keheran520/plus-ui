<template>
  <el-form-item label="镜像" required>
    <div class="image-config-wrapper">
      <!-- 镜像类型选择 -->
      <el-radio-group v-model="imageType" class="spec-type-radio-group">
        <el-radio
          v-for="type in imageTypes"
          :key="type.value"
          :label="type.value"
          class="spec-type-radio"
        >
          <template #default>
            <div :class="[{ checked: imageType === type.value }]" class="spec-type-card">
              <div class="spec-type-title">{{ type.label }}</div>
            </div>
          </template>
        </el-radio>
      </el-radio-group>

      <!-- 公共镜像列表 -->
      <div v-if="imageType === 'public'" class="image-selection">
        <el-radio-group v-model="isoImage" class="spec-type-radio-group">
          <el-radio
            v-for="img in publicImages"
            :key="img.value"
            :label="img.value"
            class="spec-type-radio"
          >
            <template #default>
              <div :class="[{ checked: isoImage === img.value }]" class="spec-type-card">
                <div class="spec-type-title">{{ img.label }}</div>
              </div>
            </template>
          </el-radio>
        </el-radio-group>

        <!-- 镜像版本选择 -->
        <div v-if="isoImage" class="image-version-select">
          <el-select
            v-model="imageVersion"
            placeholder="请选择镜像版本"
            size="large"
            style="width: 300px;"
          >
            <el-option
              v-for="version in getImageVersions(isoImage)"
              :key="version.value"
              :label="version.label"
              :value="version.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 自定义镜像 -->
      <div v-else-if="imageType === 'custom'" class="image-selection">
        <el-empty description="暂无自定义镜像" />
      </div>

      <!-- 共享镜像 -->
      <div v-else-if="imageType === 'shared'" class="image-selection">
        <el-empty description="暂无共享镜像" />
      </div>
    </div>
  </el-form-item>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  modelValue: {
    imageType: string;
    isoImage: string;
    imageVersion: string;
  };
  imageList?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  imageList: () => [],
});
const emit = defineEmits(['update:modelValue']);

// 镜像类型列表
const imageTypes = [
  { value: 'public', label: '公共镜像' },
  { value: 'custom', label: '自定义镜像' },
  { value: 'shared', label: '共享镜像' },
];

// 按操作系统类型分组的镜像列表
const groupedImages = computed(() => {
  if (props.imageList && props.imageList.length > 0) {
    // 按 osType 分组
    const groups: Record<string, any> = {};
    props.imageList.forEach((img: any) => {
      const osType = img.osType || 'other';
      if (!groups[osType]) {
        groups[osType] = {
          value: osType,
          label: getOsTypeLabel(osType),
          images: [],
        };
      }
      groups[osType].images.push(img);
    });
    return Object.values(groups);
  }
  return [];
});

// 公共镜像列表（操作系统类型）
const publicImages = computed(() => {
  if (groupedImages.value.length > 0) {
    return groupedImages.value;
  }
  // 默认镜像列表
  return [
    { value: 'ubuntu', label: 'Ubuntu', images: [] },
    { value: 'centos', label: 'CentOS', images: [] },
    { value: 'debian', label: 'Debian', images: [] },
    { value: 'windows', label: 'Windows', images: [] },
  ];
});

// 获取操作系统类型的显示名称
const getOsTypeLabel = (osType: string) => {
  const labels: Record<string, string> = {
    ubuntu: 'Ubuntu',
    centos: 'CentOS',
    debian: 'Debian',
    rocky: 'Rocky Linux',
    alma: 'AlmaLinux',
    windows: 'Windows',
    linux: 'Linux',
  };
  return labels[osType.toLowerCase()] || osType;
};

// 获取镜像版本列表（根据选择的操作系统类型）
const getImageVersions = (osType: string) => {
  const group = groupedImages.value.find((g: any) => g.value === osType);
  if (group && group.images) {
    return group.images.map((img: any) => ({
      value: img.imageId,
      // 显示格式：osType + osVersion，例如 "Ubuntu 22.04"
      label: `${getOsTypeLabel(img.osType || osType)} ${img.osVersion || img.version || ''}`.trim(),
      ...img,
    }));
  }
  return [];
};

// 双向绑定
const imageType = computed({
  get: () => props.modelValue.imageType,
  set: (val) => emit('update:modelValue', { ...props.modelValue, imageType: val }),
});

const isoImage = computed({
  get: () => props.modelValue.isoImage,
  set: (val) => emit('update:modelValue', { ...props.modelValue, isoImage: val }),
});

const imageVersion = computed({
  get: () => props.modelValue.imageVersion,
  set: (val) => {
    // 同时更新选中的镜像信息
    const selectedImage = props.imageList?.find((img: any) => img.imageId === val);
    emit('update:modelValue', { 
      ...props.modelValue, 
      imageVersion: val,
      selectedImage: selectedImage // 添加选中的镜像完整信息
    });
  },
});
</script>

<style lang="scss" scoped>
@import './common.scss';

.image-config-wrapper {
  width: 100%;
}

// 镜像选择区域
.image-selection {
  margin-top: 16px;
}

// 镜像版本选择
.image-version-select {
  margin-top: 16px;
}
</style>

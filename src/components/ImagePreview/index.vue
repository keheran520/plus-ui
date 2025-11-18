<template>
  <el-image 
    ref="imageRef" 
    :src="`${realSrc}`" 
    fit="cover" 
    :style="`width:${realWidth};height:${realHeight};`" 
    :preview-src-list="realSrcList" 
    :initial-index="computedInitialIndex"
    preview-teleported
  >
    <template #toolbar="{ actions, prev, next, reset, activeIndex, setActiveItem }">
      <el-icon @click="prev">
        <Back />
      </el-icon>
      <el-icon @click="next">
        <Right />
      </el-icon>
      <el-icon @click="setActiveItem(realSrcList.length - 1)">
        <DArrowRight />
      </el-icon>
      <el-icon @click="actions('zoomOut')">
        <ZoomOut />
      </el-icon>
      <el-icon @click="actions('zoomIn', { enableTransition: false, zoomRate: 2 })">
        <ZoomIn />
      </el-icon>
      <el-icon @click="actions('clockwise', { rotateDeg: 180, enableTransition: false })">
        <RefreshRight />
      </el-icon>
      <el-icon @click="actions('anticlockwise')">
        <RefreshLeft />
      </el-icon>
      <el-icon @click="reset">
        <Refresh />
      </el-icon>
      <el-icon @click="download(activeIndex)">
        <Download />
      </el-icon>
    </template>
    <template #error>
      <div class="image-slot">
        <el-icon>
          <picture-filled />
        </el-icon>
      </div>
    </template>
  </el-image>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue';
import { propTypes } from '@/utils/propTypes';
import type { ImageInstance } from 'element-plus';

const props = defineProps({
  src: propTypes.string.def(''),
  width: {
    type: [Number, String],
    default: ''
  },
  height: {
    type: [Number, String],
    default: ''
  },
  // 预览图片列表（优先使用这个）
  previewSrcList: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  // 初始显示的图片索引
  initialIndex: {
    type: Number,
    default: 0
  }
});

// 获取 el-image 的 ref
const imageRef = ref<ImageInstance>();

// 直接暴露 imageRef，父组件可以访问所有 el-image 的方法
defineExpose({
  imageRef
});

const realSrc = computed(() => {
  if (!props.src) {
    return;
  }
  const real_src = props.src.split(',')[0];
  return real_src;
});

// 计算初始索引：如果传入了 previewSrcList，则查找当前 src 在列表中的位置
const computedInitialIndex = computed(() => {
  if (props.previewSrcList && props.previewSrcList.length > 0) {
    const index = props.previewSrcList.findIndex(url => url === realSrc.value);
    return index >= 0 ? index : props.initialIndex;
  }
  return props.initialIndex;
});

const realSrcList = computed(() => {
  // 优先使用传入的 previewSrcList
  if (props.previewSrcList && props.previewSrcList.length > 0) {
    return props.previewSrcList;
  }
  
  // 否则从 src 解析（逗号分隔）
  if (!props.src) {
    return [];
  }
  const real_src_list = props.src.split(',');
  const srcList: string[] = [];
  real_src_list.forEach((item: string) => {
    if (item.trim() === '') {
      return;
    }
    return srcList.push(item);
  });
  return srcList;
});

const realWidth = computed(() => (typeof props.width == 'string' ? props.width : `${props.width}px`));

const realHeight = computed(() => (typeof props.height == 'string' ? props.height : `${props.height}px`));

const download = (index: number) => {
  const url = realSrcList[index];
  const suffix = url.slice(url.lastIndexOf('.'));
  const filename = Date.now() + suffix;

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(blobUrl);
      link.remove();
    });
};
</script>

<style lang="scss" scoped>
.el-image {
  border-radius: 5px;
  background-color: #ebeef5;
  box-shadow: 0 0 5px 1px #ccc;

  :deep(.el-image__inner) {
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
      transform: scale(1.2);
    }
  }

  :deep(.image-slot) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: #909399;
    font-size: 30px;
  }
}
</style>

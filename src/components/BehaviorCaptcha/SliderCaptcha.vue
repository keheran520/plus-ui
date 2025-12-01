<template>
  <div class="slider-captcha">
    <div class="captcha-container">
      <!-- 背景图 -->
      <div class="background-image" :style="{ width: backgroundWidth + 'px', height: backgroundHeight + 'px' }">
        <img :src="backgroundImage" alt="背景图" />
        <!-- 滑块图 -->
        <div
          class="slider-image"
          :style="{
            left: sliderLeft + 'px',
            width: sliderWidth + 'px',
            height: sliderHeight + 'px'
          }"
        >
          <img :src="sliderImage" alt="滑块" />
        </div>
      </div>

      <!-- 滑动条 -->
      <div class="slider-track">
        <div class="slider-bar" :style="{ width: sliderLeft + 'px' }"></div>
        <div
          class="slider-button"
          :style="{ left: sliderLeft + 'px' }"
          @mousedown="handleMouseDown"
          @touchstart="handleTouchStart"
        >
          <el-icon><DArrowRight /></el-icon>
        </div>
        <div class="slider-text">{{ sliderText }}</div>
      </div>

      <!-- 刷新按钮 -->
      <div class="refresh-button" @click="refresh">
        <el-icon><RefreshRight /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { generateSlider, validateCaptcha } from '@/api/behaviorCaptcha';
import { ElMessage } from 'element-plus';
import { DArrowRight, RefreshRight } from '@element-plus/icons-vue';

const emit = defineEmits(['success', 'fail']);

// 验证码数据
const captchaId = ref('');
const backgroundImage = ref('');
const sliderImage = ref('');
const backgroundWidth = ref(350);
const backgroundHeight = ref(200);
const sliderWidth = ref(60);
const sliderHeight = ref(60);

// 滑动相关
const sliderLeft = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startTime = ref(0);
const trackData = ref<any[]>([]);

const sliderText = computed(() => {
  if (sliderLeft.value === 0) {
    return '向右滑动完成验证';
  }
  return '';
});

// 加载验证码
const loadCaptcha = async () => {
  try {
    const res = await generateSlider();
    if (res.code === 200) {
      captchaId.value = res.data.captchaId;
      backgroundImage.value = res.data.backgroundImage;
      sliderImage.value = res.data.sliderImage;
      backgroundWidth.value = res.data.backgroundImageWidth;
      backgroundHeight.value = res.data.backgroundImageHeight;
      sliderWidth.value = res.data.sliderImageWidth;
      sliderHeight.value = res.data.sliderImageHeight;
      sliderLeft.value = 0;
      trackData.value = [];
    }
  } catch (error) {
    ElMessage.error('加载验证码失败');
  }
};

// 鼠标按下
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  startX.value = e.clientX;
  startTime.value = Date.now();
  trackData.value = [];
  trackData.value.push({
    x: 0,
    y: 0,
    t: 0,
    type: 'down'
  });
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

// 触摸开始
const handleTouchStart = (e: TouchEvent) => {
  isDragging.value = true;
  startX.value = e.touches[0].clientX;
  startTime.value = Date.now();
  trackData.value = [];
  trackData.value.push({
    x: 0,
    y: 0,
    t: 0,
    type: 'down'
  });
  document.addEventListener('touchmove', handleTouchMove);
  document.addEventListener('touchend', handleTouchEnd);
};

// 鼠标移动
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  const moveX = e.clientX - startX.value;
  const maxMove = backgroundWidth.value - sliderWidth.value;
  sliderLeft.value = Math.max(0, Math.min(moveX, maxMove));

  trackData.value.push({
    x: sliderLeft.value,
    y: 0,
    t: Date.now() - startTime.value,
    type: 'move'
  });
};

// 触摸移动
const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  const moveX = e.touches[0].clientX - startX.value;
  const maxMove = backgroundWidth.value - sliderWidth.value;
  sliderLeft.value = Math.max(0, Math.min(moveX, maxMove));

  trackData.value.push({
    x: sliderLeft.value,
    y: 0,
    t: Date.now() - startTime.value,
    type: 'move'
  });
};

// 鼠标松开
const handleMouseUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  trackData.value.push({
    x: sliderLeft.value,
    y: 0,
    t: Date.now() - startTime.value,
    type: 'up'
  });
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  validateSlider();
};

// 触摸结束
const handleTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  trackData.value.push({
    x: sliderLeft.value,
    y: 0,
    t: Date.now() - startTime.value,
    type: 'up'
  });
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);
  validateSlider();
};

// 验证滑块
const validateSlider = async () => {
  try {
    const track = {
      backgroundImageWidth: backgroundWidth.value,
      backgroundImageHeight: backgroundHeight.value,
      sliderImageWidth: sliderWidth.value,
      sliderImageHeight: sliderHeight.value,
      startSlidingTime: startTime.value,
      entSlidingTime: Date.now(),
      trackList: trackData.value
    };

    const res = await validateCaptcha(captchaId.value, track);
    if (res.code === 200 && res.data === true) {
      ElMessage.success('验证成功');
      emit('success', captchaId.value);
    } else {
      ElMessage.error('验证失败，请重试');
      emit('fail');
      setTimeout(() => {
        refresh();
      }, 1000);
    }
  } catch (error) {
    ElMessage.error('验证失败');
    emit('fail');
    setTimeout(() => {
      refresh();
    }, 1000);
  }
};

// 刷新验证码
const refresh = () => {
  loadCaptcha();
};

onMounted(() => {
  loadCaptcha();
});
</script>

<style scoped lang="scss">
.slider-captcha {
  width: 100%;
  max-width: 350px;
  margin: 0 auto;

  .captcha-container {
    position: relative;
    user-select: none;

    .background-image {
      position: relative;
      overflow: hidden;
      border-radius: 4px;
      background: #f0f0f0;

      img {
        width: 100%;
        height: 100%;
        display: block;
      }

      .slider-image {
        position: absolute;
        top: 0;
        left: 0;
        transition: left 0.1s;

        img {
          width: 100%;
          height: 100%;
          display: block;
        }
      }
    }

    .slider-track {
      position: relative;
      margin-top: 15px;
      height: 40px;
      line-height: 40px;
      background: #f7f9fa;
      border-radius: 4px;
      text-align: center;
      overflow: hidden;

      .slider-bar {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background: #d1e9ff;
        border-radius: 4px;
        transition: width 0.1s;
      }

      .slider-button {
        position: absolute;
        left: 0;
        top: 0;
        width: 40px;
        height: 40px;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: left 0.1s;
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);

        &:hover {
          background: #1991eb;
          color: #fff;
        }
      }

      .slider-text {
        color: #45494c;
        font-size: 14px;
      }
    }

    .refresh-button {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 30px;
      height: 30px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;

      &:hover {
        background: rgba(0, 0, 0, 0.7);
      }
    }
  }
}
</style>

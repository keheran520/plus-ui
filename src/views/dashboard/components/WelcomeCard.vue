<template>
  <el-card shadow="hover" class="welcome-card mb-4 border-none">
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <el-avatar :size="72" :src="userStore.avatar" class="mr-4" />
        <div>
          <h3 class="text-xl font-bold mb-2 text-gray-800">
            {{ timeFix }}！{{ userStore.nickname || userStore.name }}，祝你开心每一天！
          </h3>
          <p class="text-gray-500 text-sm">
            {{ poetry }}
          </p>
        </div>
      </div>
      <div class="hidden md:flex items-center gap-8 mr-8">
        <div class="flex flex-col items-end">
          <span class="text-gray-500 text-sm mb-1">项目数</span>
          <span class="text-2xl font-bold">16</span>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-gray-500 text-sm mb-1">待办项</span>
          <span class="text-2xl font-bold">3/15</span>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-gray-500 text-sm mb-1">消息</span>
          <span class="text-2xl font-bold">12</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();

const timeFix = computed(() => {
  const time = new Date();
  const hour = time.getHours();
  return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好';
});

const poetry = ref('北海虽赊，扶摇可接；东隅已逝，桑榆非晚。');
</script>

<style scoped>
.welcome-card {
  border: none;
}
</style>

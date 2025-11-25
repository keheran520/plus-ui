<template>
  <el-card :body-style="{ padding: 0 }" class="mb-4 border-none announcement-card" shadow="never">
    <div class="p-4">
      <div class="flex justify-between items-center mb-3">
        <span class="font-bold text-base">帮助文档</span>
        <el-link :underline="false" class="text-xs" type="primary">更多</el-link>
      </div>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-4">
          <a
            v-for="(item, index) in docs"
            :key="index"
            :href="item.url"
            class="flex items-center p-2 rounded hover:bg-gray-50 transition-colors group"
            target="_blank"
          >
            <div
              class="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-3 group-hover:bg-blue-500 group-hover:text-white transition-colors"
            >
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
            </div>
            <span class="text-sm text-gray-600 group-hover:text-gray-900">{{ item.title }}</span>
          </a>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const docs = ref([
  { title: '项目简介', icon: 'Document', url: 'https://plus-doc.dromara.org/' },
  { title: '快速开始', icon: 'VideoPlay', url: 'https://plus-doc.dromara.org/#/ruoyi-vue-plus/quick-start' },
  { title: '常见问题', icon: 'QuestionFilled', url: 'https://plus-doc.dromara.org/#/ruoyi-vue-plus/faq' },
  { title: '更新日志', icon: 'ChatDotRound', url: 'https://plus-doc.dromara.org/#/ruoyi-vue-plus/changlog' }
]);
</script>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.p-2 {
  padding: 0.5rem;
}

.w-8 {
  width: 2rem;
}

.h-8 {
  height: 2rem;
}

.rounded {
  border-radius: 0.25rem;
}

.rounded-full {
  border-radius: 9999px;
}

.mr-3 {
  margin-right: 0.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-gray-600 {
  color: #4b5563;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.text-blue-500 {
  color: #3b82f6;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.group:hover .group-hover\:bg-blue-500 {
  background-color: #3b82f6;
}

.group:hover .group-hover\:text-white {
  color: #fff;
}

.group:hover .group-hover\:text-gray-900 {
  color: #111827;
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.border-none {
  border: none;
}

.font-bold {
  font-weight: 700;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}
</style>

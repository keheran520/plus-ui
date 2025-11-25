<template>
  <el-card shadow="hover" class="mb-4 border-none" body-style="padding: 0;">
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-bold text-base">我的项目</span>
        <el-link type="primary" :underline="false">更多</el-link>
      </div>
    </template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
      <div v-for="(item, index) in projects" :key="index" class="project-card p-4 border-r border-b border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
        <div class="flex items-start mb-3">
          <img :src="item.logo" class="w-8 h-8 mr-3 rounded" />
          <div>
            <h4 class="text-base font-medium mb-1 group-hover:text-blue-500 transition-colors">{{ item.name }}</h4>
            <p class="text-gray-500 text-xs line-clamp-2 h-8">{{ item.desc }}</p>
          </div>
        </div>
        <div class="flex justify-between items-center mt-2">
          <div class="text-xs text-gray-400">{{ item.group }}</div>
          <div class="text-xs text-gray-400">{{ item.time }}</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const projects = ref([
  {
    name: 'RuoYi-Vue-Plus',
    desc: '基于 Spring Boot + MyBatis Plus + Vue & Element 的后台管理系统',
    group: '开源项目',
    time: '4小时前',
    logo: 'https://gitee.com/dromara/RuoYi-Vue-Plus/widgets/widget_1.svg'
  },
  {
    name: 'RuoYi-Cloud-Plus',
    desc: '微服务通用权限管理系统 重写 RuoYi-Cloud 全方位升级',
    group: '开源项目',
    time: '6小时前',
    logo: 'https://gitee.com/dromara/RuoYi-Cloud-Plus/widgets/widget_1.svg'
  },
  {
    name: 'Electron-Egg',
    desc: '一个入门简单、跨平台、企业级桌面软件开发框架',
    group: '开源框架',
    time: '1天前',
    logo: 'https://gitee.com/dromara/electron-egg/widgets/widget_1.svg'
  },
  {
    name: 'Hutool',
    desc: '小而全的Java工具类库，使Java拥有Python的便捷语言特性',
    group: '工具库',
    time: '2天前',
    logo: 'https://gitee.com/dromara/hutool/widgets/widget_1.svg'
  },
  {
    name: 'Sa-Token',
    desc: '一个轻量级 Java 权限认证框架，让鉴权变得简单、优雅！',
    group: '安全框架',
    time: '3天前',
    logo: 'https://gitee.com/dromara/sa-token/widgets/widget_1.svg'
  },
  {
    name: 'Forest',
    desc: '极简的轻量级HTTP客户端框架，让Java发送HTTP/HTTPS请求不再难',
    group: '网络框架',
    time: '5天前',
    logo: 'https://gitee.com/dromara/forest/widgets/widget_1.svg'
  }
]);
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

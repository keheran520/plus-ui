<template>
  <el-card shadow="hover" class="mb-4">
    <template #header>
      <span class="font-bold">项目介绍</span>
    </template>
    <div class="project-intro">
      <el-row :gutter="20">
        <el-col :xs="24" :md="12" class="mb-4">
          <h3 class="text-lg font-bold mb-2" style="color: #409EFF">RuoYi-Vue-Plus</h3>
          <p class="text-gray-500 text-sm mb-4" style="line-height: 1.6; color: #606266;">
            RuoYi-Vue-Plus 是基于 RuoYi-Vue 针对 分布式集群 场景升级(不兼容原框架)。
            <br/>
            当前版本: <el-tag size="small">v5.5.1</el-tag>
            <el-tag type="danger" size="small" class="ml-2">免费开源</el-tag>
          </p>
          <div class="tech-stack text-sm text-gray-600">
            <div class="flex items-center mb-1"><el-icon class="mr-1 text-green-500"><Select /></el-icon> 前端: Vue3 + TS + Element Plus</div>
            <div class="flex items-center mb-1"><el-icon class="mr-1 text-green-500"><Select /></el-icon> 后端: Spring Boot</div>
            <div class="flex items-center mb-1"><el-icon class="mr-1 text-green-500"><Select /></el-icon> 鉴权: Sa-Token 支持多终端认证系统</div>
            <div class="flex items-center mb-1"><el-icon class="mr-1 text-green-500"><Select /></el-icon> 容器: Undertow 基于 Netty 的高性能容器</div>
          </div>
          <div class="mt-4">
             <el-button type="primary" plain icon="Link" @click="goTarget('https://gitee.com/dromara/RuoYi-Vue-Plus')">访问码云</el-button>
             <el-button type="primary" plain icon="Link" @click="goTarget('https://github.com/dromara/RuoYi-Vue-Plus')">访问GitHub</el-button>
             <el-button type="success" plain icon="Document" @click="goTarget('https://plus-doc.dromara.org/#/ruoyi-vue-plus/changlog')">更新日志</el-button>
          </div>
        </el-col>
        
        <el-divider direction="vertical" class="hidden-md-and-down" style="height: auto;" />
        
        <el-col :xs="24" :md="11" class="mb-4">
          <h3 class="text-lg font-bold mb-2" style="color: #67C23A">RuoYi-Cloud-Plus</h3>
          <p class="text-gray-500 text-sm mb-4" style="line-height: 1.6; color: #606266;">
            RuoYi-Cloud-Plus 微服务通用权限管理系统 重写 RuoYi-Cloud 全方位升级(不兼容原框架)。
            <br/>
            当前版本: <el-tag size="small">v2.5.1</el-tag>
            <el-tag type="danger" size="small" class="ml-2">免费开源</el-tag>
          </p>
           <div class="tech-stack text-sm text-gray-600">
            <div class="flex items-center mb-1"><el-icon class="mr-1 text-green-500"><Select /></el-icon> 微服务: Spring Cloud Alibaba</div>
            <div class="flex items-center mb-1"><el-icon class="mr-1 text-green-500"><Select /></el-icon> 注册中心: Alibaba Nacos 2.X</div>
            <div class="flex items-center mb-1"><el-icon class="mr-1 text-green-500"><Select /></el-icon> RPC: Apache Dubbo</div>
            <div class="flex items-center mb-1"><el-icon class="mr-1 text-green-500"><Select /></el-icon> 网关: Spring Cloud Gateway</div>
          </div>
          <div class="mt-4">
             <el-button type="primary" plain icon="Link" @click="goTarget('https://gitee.com/dromara/RuoYi-Cloud-Plus')">访问码云</el-button>
             <el-button type="primary" plain icon="Link" @click="goTarget('https://github.com/dromara/RuoYi-Cloud-Plus')">访问GitHub</el-button>
             <el-button type="success" plain icon="Document" @click="goTarget('https://plus-doc.dromara.org/#/ruoyi-cloud-plus/changlog')">更新日志</el-button>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Select, Link, Document } from '@element-plus/icons-vue';

const goTarget = (url: string) => {
  window.open(url, '_blank');
};
</script>

<style scoped>
.text-green-500 { color: #67C23A; }
.mr-1 { margin-right: 0.25rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.ml-2 { margin-left: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.flex { display: flex; }
.items-center { align-items: center; }
.hidden-md-and-down {
  @media only screen and (max-width: 992px) {
    display: none;
  }
}
</style>

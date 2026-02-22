<template>
  <div class="console-container">
    <el-card shadow="never">
      <template #header>
        <div class="console-header">
          <div class="header-left">
            <el-icon :size="20" class="mr-2"><Monitor /></el-icon>
            <span class="vm-name">{{ vmInfo.vmName }}</span>
            <el-tag :type="statusType" class="ml-2" size="small">{{ statusText }}</el-tag>
          </div>
          <div class="header-right">
            <el-button icon="RefreshRight" size="small" @click="handleRefresh">刷新</el-button>
            <el-button icon="Link" size="small" type="primary" @click="openConsoleWindow">在新窗口打开</el-button>
            <el-button icon="Close" size="small" @click="handleClose">关闭</el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="console-content" element-loading-text="正在连接控制台...">
        <div v-if="!vncUrl && !loading" class="console-empty">
          <el-empty description="无法获取控制台连接信息">
            <el-button type="primary" @click="loadVncInfo">重新连接</el-button>
          </el-empty>
        </div>
        <div v-else-if="vncUrl" class="console-guide">
          <el-result icon="success" title="控制台连接信息已准备就绪">
            <template #sub-title>
              <div class="guide-content">
                <p>由于浏览器安全策略限制，控制台需要在新标签页中打开</p>
                <p class="mt-2">点击下方按钮将在新标签页打开PVE原生控制台</p>
              </div>
            </template>
            <template #extra>
              <el-button type="primary" size="large" @click="openConsoleWindow">
                <el-icon class="mr-1"><Link /></el-icon>
                打开控制台
              </el-button>
            </template>
          </el-result>
          
          <el-divider>连接信息</el-divider>
          
          <el-descriptions :column="2" border class="mt-4">
            <el-descriptions-item label="虚拟机ID">{{ vmInfo.vmId }}</el-descriptions-item>
            <el-descriptions-item label="PVE VM ID">{{ vmInfo.pveVmId }}</el-descriptions-item>
            <el-descriptions-item label="节点名称">{{ vmInfo.nodeName }}</el-descriptions-item>
            <el-descriptions-item label="PVE主机">{{ vncInfo.pveHost }}</el-descriptions-item>
            <el-descriptions-item label="PVE端口">{{ vncInfo.pvePort }}</el-descriptions-item>
            <el-descriptions-item label="VNC端口">{{ vncInfo.vncPort }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>

    <!-- 控制台说明 -->
    <el-card class="mt-4" shadow="never">
      <template #header>
        <span>使用说明</span>
      </template>
      
      <el-alert :closable="false" class="mb-4" title="重要提示" type="warning">
        <p>控制台将在新标签页中打开PVE原生noVNC界面</p>
        <p class="mt-2">如果新标签页被浏览器拦截，请允许弹出窗口或手动点击地址栏的弹窗图标</p>
      </el-alert>

      <el-alert :closable="false" title="使用提示" type="info">
        <ul class="tips-list">
          <li>控制台使用PVE原生noVNC技术，通过浏览器直接访问虚拟机</li>
          <li>支持键盘和鼠标操作，可以像操作本地电脑一样操作虚拟机</li>
          <li>在noVNC界面中可以使用全屏、剪贴板等功能</li>
          <li>如果连接失败，请检查虚拟机是否正在运行</li>
          <li>建议使用Chrome或Firefox浏览器以获得最佳体验</li>
          <li>首次访问需要接受PVE服务器的SSL证书</li>
        </ul>
      </el-alert>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getVncInfo } from '@/api/pve/virtualMachine';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const vmInfo = ref<any>({});
const vncInfo = ref<any>({});
const vncUrl = ref('');

const statusType = computed(() => {
  return vncUrl.value ? 'success' : 'danger';
});

const statusText = computed(() => {
  return vncUrl.value ? '已就绪' : '未连接';
});

/** 加载VNC连接信息 */
function loadVncInfo() {
  const vmId = route.query.vmId as string;
  if (!vmId) {
    proxy.$modal.msgError('虚拟机ID不能为空');
    return;
  }

  loading.value = true;
  getVncInfo(vmId)
    .then((response: any) => {
      if (response.data) {
        vmInfo.value = {
          vmId: response.data.vmId,
          vmName: response.data.vmName,
          nodeName: response.data.nodeName,
          pveVmId: response.data.pveVmId
        };
        vncInfo.value = {
          vncHost: response.data.vncHost,
          vncPort: response.data.vncPort,
          vncTicket: response.data.vncTicket,
          vncUser: response.data.vncUser,
          pveHost: response.data.pveHost,
          pvePort: response.data.pvePort
        };
        vncUrl.value = response.data.vncUrl;
      }
    })
    .catch(() => {
      proxy.$modal.msgError('获取控制台连接信息失败');
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 在新标签页打开控制台 */
function openConsoleWindow() {
  if (!vncUrl.value) {
    proxy.$modal.msgError('控制台连接信息未就绪');
    return;
  }

  // 在新标签页打开PVE控制台
  // 使用 noopener 和 noreferrer 防止安全问题
  const newTab = window.open(vncUrl.value, '_blank', 'noopener,noreferrer');
  
  if (newTab) {
    // 额外保险：断开与新标签页的连接
    newTab.opener = null;
    proxy.$modal.msgSuccess('控制台已在新标签页打开');
  } else {
    proxy.$modal.msgWarning('无法打开控制台，请检查浏览器弹窗设置');
  }
}

/** 刷新控制台 */
function handleRefresh() {
  loadVncInfo();
}

/** 关闭控制台 */
function handleClose() {
  router.back();
}

onMounted(() => {
  loadVncInfo();
});

const { proxy } = getCurrentInstance() as any;
</script>

<style lang="scss" scoped>
.console-container {
  padding: 20px;
  height: calc(100vh - 84px);
  overflow-y: auto;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;

    .vm-name {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }
  }

  .header-right {
    display: flex;
    gap: 8px;
  }
}

.console-content {
  min-height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .console-empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }

  .console-guide {
    width: 100%;
    padding: 40px;
    background: #fff;
    border-radius: 8px;
    
    .guide-content {
      font-size: 14px;
      color: #606266;
      line-height: 1.8;
    }
  }
}

.tips-list {
  margin: 0;
  padding-left: 20px;

  li {
    margin: 8px 0;
    color: #606266;
    line-height: 1.6;
  }
}
</style>

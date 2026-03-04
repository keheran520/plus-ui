<template>
  <div class="vm-create-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-page-header @back="handleBack">
        <template #content>
          <span class="header-title">创建虚拟机</span>
        </template>
        <template #extra>
          <el-button @click="handleBack">取消</el-button>
        </template>
      </el-page-header>
    </div>

    <!-- 创建方式选择 -->
    <div v-if="!createMode" class="create-mode-selection">
      <div class="mode-cards">
        <div class="mode-card" @click="selectMode('template')">
          <div class="mode-icon">
            <el-icon :size="48"><Document /></el-icon>
          </div>
          <h3>基于模板创建</h3>
          <p>从镜像库选择模板，快速创建虚拟机</p>
          <p class="mode-desc">支持选择规格套餐，配置可调整</p>
          <el-button type="primary">选择此方式</el-button>
        </div>

        <div class="mode-card" @click="selectMode('custom')">
          <div class="mode-icon">
            <el-icon :size="48"><Setting /></el-icon>
          </div>
          <h3>自定义创建</h3>
          <p>选择ISO镜像，完全自定义配置</p>
          <p class="mode-desc">适合高级用户，灵活配置所有参数</p>
          <el-button type="primary">选择此方式</el-button>
        </div>
      </div>
    </div>

    <!-- 步骤导航 -->
    <div v-if="createMode" class="steps-wrapper">
      <el-steps :active="currentStep" align-center finish-status="success">
        <el-step v-for="step in steps" :key="step.id" :title="step.title" />
      </el-steps>
    </div>

    <!-- 内容区域 -->
    <div v-if="createMode" class="content-wrapper">
      <!-- 步骤内容 -->
      <component
        :is="currentStepComponent"
        v-model="formData"
        :node-list="nodeList"
        :template-list="templateList"
        @next="handleNext"
        @prev="handlePrev"
        @refresh="loadTemplateList"
      />
    </div>

    <!-- 底部操作栏 -->
    <div v-if="createMode" class="footer-wrapper">
      <el-button v-if="currentStep > 0" size="large" @click="handlePrev">上一步</el-button>
      <el-button v-if="currentStep < steps.length - 1" size="large" type="primary" @click="handleNext">下一步</el-button>
      <el-button v-if="currentStep === steps.length - 1" :loading="submitting" size="large" type="primary" @click="handleSubmit">完成创建</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document, Setting } from '@element-plus/icons-vue';
import { listNode } from '@/api/pve/node';
import { listSystemImage } from '@/api/pve/systemImage';
import { addVirtualMachine } from '@/api/pve/virtualMachine';

// 导入步骤组件
import TemplateStep1 from './create-steps/TemplateStep1.vue';
import TemplateStep2 from './create-steps/TemplateStep2.vue';
import TemplateStep3 from './create-steps/TemplateStep3.vue';
import TemplateStep4 from './create-steps/TemplateStep4.vue';
import CustomStep1 from './create-steps/CustomStep1.vue';
import CustomStep2 from './create-steps/CustomStep2.vue';
import CustomStep3 from './create-steps/CustomStep3.vue';
import CustomStep4 from './create-steps/CustomStep4.vue';

const router = useRouter();
const createMode = ref<'template' | 'custom' | ''>('');
const currentStep = ref(0);
const submitting = ref(false);
const nodeList = ref<any[]>([]);
const templateList = ref<any[]>([]);

// 表单数据
const formData = ref({
  // 基本信息
  nodeId: undefined,
  vmName: '',
  pveVmId: undefined,

  // 模板模式
  templateId: undefined,
  specId: undefined,

  // 自定义模式
  isoImage: '',
  osType: 'Linux',
  osVersion: '',

  // 硬件配置
  cpuCores: 2,
  cpuType: 'kvm64',
  cpuLimit: 0,
  cpuUnits: 1024,
  memorySize: 4,
  minMemory: undefined,
  balloon: false,
  systemDiskSize: 50,

  // 存储配置
  storage: 'local-lvm',
  diskBus: 'scsi',
  cache: 'none',
  discard: false,
  iothread: false,

  // 网络配置
  bridge: 'vmbr0',
  networkModel: 'virtio',
  macAddress: '',
  vlanTag: undefined,
  rateLimit: 0,
  firewall: false,

  // 其他配置
  autoStart: '0',
  remark: ''
});

// 步骤配置
const steps = computed(() => {
  if (createMode.value === 'template') {
    return [
      { id: 1, title: '选择模板' },
      { id: 2, title: '选择规格' },
      { id: 3, title: '网络配置' },
      { id: 4, title: '确认创建' }
    ];
  } else {
    return [
      { id: 1, title: '基本配置' },
      { id: 2, title: '硬件配置' },
      { id: 3, title: '网络配置' },
      { id: 4, title: '确认创建' }
    ];
  }
});

// 当前步骤组件
const currentStepComponent = computed(() => {
  const stepIndex = currentStep.value + 1;
  if (createMode.value === 'template') {
    const components: any = {
      1: TemplateStep1,
      2: TemplateStep2,
      3: TemplateStep3,
      4: TemplateStep4
    };
    return components[stepIndex];
  } else {
    const components: any = {
      1: CustomStep1,
      2: CustomStep2,
      3: CustomStep3,
      4: CustomStep4
    };
    return components[stepIndex];
  }
});

// 选择创建方式
function selectMode(mode: 'template' | 'custom') {
  createMode.value = mode;
  currentStep.value = 0;
}

// 返回
function handleBack() {
  if (currentStep.value > 0) {
    currentStep.value--;
  } else if (createMode.value) {
    createMode.value = '';
  } else {
    router.back();
  }
}

// 下一步
function handleNext() {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++;
  }
}

// 上一步
function handlePrev() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

// 提交创建
async function handleSubmit() {
  submitting.value = true;
  try {
    await addVirtualMachine(formData.value);
    ElMessage.success('虚拟机创建成功');
    router.push('/pve/virtualMachine');
  } catch (error) {
    ElMessage.error('创建失败');
  } finally {
    submitting.value = false;
  }
}

// 加载节点列表
async function loadNodeList() {
  try {
    const response = await listNode({ pageNum: 1, pageSize: 100 });
    nodeList.value = response.rows || [];
  } catch (error) {
    console.error('加载节点列表失败', error);
  }
}

// 加载模板列表
async function loadTemplateList() {
  try {
    console.log('=== 开始加载模板列表 ===');
    console.log('请求参数:', { pageNum: 1, pageSize: 100, imageType: 'template' });
    
    const response = await listSystemImage({ pageNum: 1, pageSize: 100, imageType: 'template' });
    
    console.log('API响应:', response);
    console.log('响应数据类型:', typeof response);
    console.log('响应rows:', response.rows);
    console.log('响应total:', response.total);
    
    templateList.value = response.rows || [];
    console.log('模板列表:', templateList.value);
    console.log('模板数量:', templateList.value.length);
    
    if (templateList.value.length === 0) {
      console.warn('⚠️ 镜像库中暂无模板');
      console.log('提示：请前往【集群管理】页面，点击节点的【同步】按钮来同步模板');
    } else {
      console.log('✓ 成功加载', templateList.value.length, '个模板');
      templateList.value.forEach((template, index) => {
        console.log(`模板${index + 1}:`, {
          id: template.imageId,
          name: template.imageName,
          type: template.imageType,
          os: `${template.osType} ${template.osVersion}`
        });
      });
    }
  } catch (error) {
    console.error('❌ 加载模板列表失败:', error);
    console.error('错误详情:', error.response || error.message);
    ElMessage.error('加载模板列表失败: ' + (error.message || '请检查网络连接'));
  }
}

onMounted(() => {
  loadNodeList();
  loadTemplateList();
});
</script>

<style lang="scss" scoped>
.vm-create-container {
  min-height: calc(100vh - 100px);
  background: #f5f7fa;

  .page-header {
    background: #fff;
    padding: 16px 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .header-title {
      font-size: 18px;
      font-weight: 500;
    }
  }

  .create-mode-selection {
    max-width: 1200px;
    margin: 60px auto;
    padding: 0 24px;

    .mode-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 32px;

      .mode-card {
        background: #fff;
        border-radius: 8px;
        padding: 48px 32px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        border: 2px solid transparent;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }

        .mode-icon {
          color: var(--el-color-primary);
          margin-bottom: 24px;
        }

        h3 {
          font-size: 24px;
          margin-bottom: 12px;
          color: #303133;
        }

        p {
          color: #606266;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .mode-desc {
          color: #909399;
          font-size: 13px;
          margin-bottom: 24px;
        }
      }
    }
  }

  .steps-wrapper {
    background: #fff;
    padding: 32px 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .content-wrapper {
    max-width: 1200px;
    margin: 0 auto 80px;
    padding: 0 24px;
  }

  .footer-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 16px 24px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
    gap: 16px;
    z-index: 100;
  }
}
</style>

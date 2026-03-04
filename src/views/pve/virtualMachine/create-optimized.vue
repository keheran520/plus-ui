<template>
  <div class="vm-create-container">
    <!-- 页面头部 -->
    <el-page-header @back="handleBack">
      <template #content>
        <div class="header-content">
          <span class="header-title">创建虚拟机</span>
          <span class="header-subtitle">配置并创建新的虚拟机实例</span>
        </div>
      </template>
      <template #extra>
        <el-space>
          <el-button v-if="hasRestored" type="warning" plain @click="handleClearDraft">
            清空草稿
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-space>
      </template>
    </el-page-header>

    <!-- 步骤导航 -->
    <div class="steps-wrapper">
      <el-steps :active="currentStep - 1" align-center finish-status="success" class="create-steps">
        <el-step title="基本配置" />
        <el-step title="网络配置" />
        <el-step title="高级配置" />
        <el-step title="确认创建" />
      </el-steps>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <el-scrollbar height="calc(100vh - 280px)">
        <div class="step-content">
          <!-- 步骤1: 基本配置 -->
          <div v-show="currentStep === 1">
            <el-form
              ref="step1FormRef"
              :model="formData"
              :rules="step1Rules"
              label-width="120px"
              label-position="left"
            >
              <BasicConfigStep
                v-model="formData"
                :node-list="nodeList"
                :template-list="templateList"
                :storage-list="storageList"
                @node-change="handleNodeChange"
                @refresh-templates="loadTemplateList"
              />
            </el-form>
          </div>

          <!-- 步骤2: 网络配置 -->
          <div v-show="currentStep === 2">
            <el-form
              ref="step2FormRef"
              :model="formData"
              :rules="step2Rules"
              label-width="120px"
              label-position="left"
            >
              <NetworkConfigStep
                v-model="formData"
                :network-list="networkList"
              />
            </el-form>
          </div>

          <!-- 步骤3: 高级配置 -->
          <div v-show="currentStep === 3">
            <el-form
              ref="step3FormRef"
              :model="formData"
              :rules="step3Rules"
              label-width="120px"
              label-position="left"
            >
              <AdvancedConfigStep v-model="formData" />
            </el-form>
          </div>

          <!-- 步骤4: 确认创建 -->
          <div v-show="currentStep === 4">
            <ConfirmStep
              :form-data="formData"
              :node-list="nodeList"
              :template-list="templateList"
              :storage-list="storageList"
              :network-list="networkList"
            />
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 底部操作栏 -->
    <div class="footer-bar">
      <div class="footer-actions">
        <el-space size="large">
          <el-button @click="handleBack">取消</el-button>
          <el-button v-if="currentStep > 1" @click="handlePrev">上一步</el-button>
          <el-button v-if="currentStep < 4" type="primary" @click="handleNext">
            下一步
          </el-button>
          <el-button
            v-if="currentStep === 4"
            :loading="submitting"
            type="primary"
            @click="handleSubmit"
          >
            完成创建
          </el-button>
        </el-space>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { listNode } from '@/api/pve/node';
import { listSystemImage } from '@/api/pve/systemImage';
import { listStorage } from '@/api/pve/storage';
import { listNetwork } from '@/api/pve/network';
import { addVirtualMachine } from '@/api/pve/virtualMachine';
import BasicConfigStep from './create-steps-optimized/BasicConfigStep.vue';
import NetworkConfigStep from './create-steps-optimized/NetworkConfigStep.vue';
import AdvancedConfigStep from './create-steps-optimized/AdvancedConfigStep.vue';
import ConfirmStep from './create-steps-optimized/ConfirmStep.vue';

const router = useRouter();

// sessionStorage 的 key
const STORAGE_KEY = 'vm_create_form_data';
const STORAGE_STEP_KEY = 'vm_create_current_step';

// 从 sessionStorage 恢复数据
const restoreFromStorage = () => {
  try {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    const savedStep = sessionStorage.getItem(STORAGE_STEP_KEY);

    if (savedData) {
      const data = JSON.parse(savedData);
      return {
        data,
        step: savedStep ? Number.parseInt(savedStep) : 1
      };
    }
  } catch (error) {
    console.error('恢复表单数据失败:', error);
  }
  return null;
};

// 保存数据到 sessionStorage
const saveToStorage = (data: any, step: number) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    sessionStorage.setItem(STORAGE_STEP_KEY, step.toString());
  } catch (error) {
    console.error('保存表单数据失败:', error);
  }
};

// 清除 sessionStorage 中的数据
const clearStorage = () => {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_STEP_KEY);
};

// 尝试恢复之前的数据
const restored = restoreFromStorage();
const hasRestored = ref(!!restored);

// 当前步骤
const currentStep = ref(restored?.step || 1);

// 提交状态
const submitting = ref(false);

// 表单引用
const step1FormRef = ref<FormInstance>();
const step2FormRef = ref<FormInstance>();
const step3FormRef = ref<FormInstance>();

// 节点列表
const nodeList = ref<any[]>([]);
// 模板列表
const templateList = ref<any[]>([]);
// 存储列表
const storageList = ref<any[]>([]);
// 网络列表
const networkList = ref<any[]>([]);

// 表单数据
const formData = ref(restored?.data || {
  // 基本信息
  createMode: 'template', // template | custom
  nodeId: undefined,
  vmName: '',
  
  // 模板模式
  templateId: undefined,
  
  // 自定义模式
  isoImage: '',
  osType: 'Linux',
  osVersion: '',
  
  // 计算规格
  cpuCores: 2,
  cpuType: 'kvm64',
  memorySize: 4,
  
  // 存储配置
  systemDiskSize: 40,
  systemDiskStorage: '',
  dataDisks: [],
  
  // 网络配置
  bridge: 'vmbr0',
  networkModel: 'virtio',
  macAddress: '',
  vlanTag: undefined,
  firewall: false,
  
  // 高级配置
  autoStart: false,
  cpuLimit: 0,
  cpuUnits: 1024,
  minMemory: undefined,
  balloon: false,
  remark: ''
});

// 监听表单数据变化，自动保存到 sessionStorage
watch(
  [formData, currentStep],
  () => {
    saveToStorage(formData.value, currentStep.value);
  },
  { deep: true }
);

// 步骤1验证规则
const step1Rules = computed<FormRules>(() => ({
  nodeId: [
    { required: true, message: '请选择节点', trigger: 'change' }
  ],
  vmName: [
    { required: true, message: '请输入虚拟机名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '只能包含字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  templateId: [
    { 
      required: formData.value.createMode === 'template', 
      message: '请选择模板', 
      trigger: 'change' 
    }
  ],
  isoImage: [
    { 
      required: formData.value.createMode === 'custom', 
      message: '请选择ISO镜像', 
      trigger: 'change' 
    }
  ],
  cpuCores: [
    { required: true, message: '请输入CPU核心数', trigger: 'blur' },
    { type: 'number', min: 1, max: 128, message: 'CPU核心数范围 1-128', trigger: 'blur' }
  ],
  memorySize: [
    { required: true, message: '请输入内存大小', trigger: 'blur' },
    { type: 'number', min: 1, max: 1024, message: '内存大小范围 1-1024 GB', trigger: 'blur' }
  ],
  systemDiskSize: [
    { required: true, message: '请输入系统盘大小', trigger: 'blur' },
    { type: 'number', min: 10, max: 10240, message: '系统盘大小范围 10-10240 GB', trigger: 'blur' }
  ],
  systemDiskStorage: [
    { required: true, message: '请选择系统盘存储', trigger: 'change' }
  ]
}));

// 步骤2验证规则
const step2Rules = computed<FormRules>(() => ({
  bridge: [
    { required: true, message: '请选择网络桥接', trigger: 'change' }
  ],
  networkModel: [
    { required: true, message: '请选择网络模型', trigger: 'change' }
  ]
}));

// 步骤3验证规则
const step3Rules = computed<FormRules>(() => ({}));

// 加载节点列表
async function loadNodeList() {
  try {
    const response = await listNode({ pageNum: 1, pageSize: 100 });
    nodeList.value = response.rows || [];
    if (nodeList.value.length > 0 && !formData.value.nodeId) {
      formData.value.nodeId = nodeList.value[0].nodeId;
      handleNodeChange(nodeList.value[0].nodeId);
    }
  } catch (error) {
    console.error('加载节点列表失败', error);
    ElMessage.error('加载节点列表失败');
  }
}

// 加载模板列表
async function loadTemplateList() {
  try {
    const response = await listSystemImage({ pageNum: 1, pageSize: 100, imageType: 'template' });
    templateList.value = response.rows || [];
  } catch (error) {
    console.error('加载模板列表失败', error);
    ElMessage.error('加载模板列表失败');
  }
}

// 加载存储列表
async function loadStorageList(nodeId: number) {
  try {
    const response = await listStorage({ pageNum: 1, pageSize: 100, nodeId });
    storageList.value = response.rows || [];
  } catch (error) {
    console.error('加载存储列表失败', error);
  }
}

// 加载网络列表
async function loadNetworkList(nodeId: number) {
  try {
    const response = await listNetwork({ pageNum: 1, pageSize: 100, nodeId });
    networkList.value = response.rows || [];
  } catch (error) {
    console.error('加载网络列表失败', error);
  }
}

// 节点变更处理
function handleNodeChange(nodeId: number) {
  console.log('节点变更:', nodeId);
  loadStorageList(nodeId);
  loadNetworkList(nodeId);
}

// 清空草稿
function handleClearDraft() {
  ElMessageBox.confirm('清空后将无法恢复，确定要清空所有已填写的内容吗？', '确认清空草稿？', {
    confirmButtonText: '确认清空',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    clearStorage();
    ElMessage.success('草稿已清空');
    window.location.reload();
  }).catch(() => {
    // 取消操作
  });
}

// 返回
function handleBack() {
  router.back();
}

// 上一步
function handlePrev() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

// 验证当前步骤
async function validateCurrentStep(): Promise<boolean> {
  try {
    if (currentStep.value === 1) {
      await step1FormRef.value?.validate();
    } else if (currentStep.value === 2) {
      await step2FormRef.value?.validate();
    } else if (currentStep.value === 3) {
      await step3FormRef.value?.validate();
    }
    return true;
  } catch (error) {
    console.error('表单验证失败:', error);
    return false;
  }
}

// 下一步
async function handleNext() {
  const valid = await validateCurrentStep();
  if (!valid) {
    return;
  }
  
  if (currentStep.value < 4) {
    currentStep.value++;
  }
}

// 提交
async function handleSubmit() {
  submitting.value = true;
  try {
    await addVirtualMachine(formData.value);
    
    // 提交成功后清除 sessionStorage
    clearStorage();
    
    ElMessage.success('虚拟机创建任务已提交，正在后台创建中...');
    router.push('/pve/virtualMachine');
  } catch (error: any) {
    console.error('创建虚拟机失败:', error);
    ElMessage.error(error.message || '创建虚拟机失败');
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadNodeList();
  loadTemplateList();
});
</script>

<style lang="scss" scoped>
.vm-create-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;

  :deep(.el-page-header) {
    background: #fff;
    padding: 16px 24px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .header-title {
      font-size: 18px;
      font-weight: 500;
      color: #303133;
    }

    .header-subtitle {
      font-size: 13px;
      color: #909399;
    }
  }
}

.steps-wrapper {
  background: #fff;
  padding: 32px 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .create-steps {
    max-width: 800px;
    margin: 0 auto;
  }
}

.content-wrapper {
  flex: 1;
  background: #fff;
  margin-bottom: 80px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .step-content {
    max-width: 1200px;
    min-height: 500px;
    margin: 0 auto;
    padding: 32px 24px;
  }
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 16px 24px;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);

  .footer-actions {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

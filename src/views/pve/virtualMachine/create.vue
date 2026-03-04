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
        <el-step title="确认订单" />
      </el-steps>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
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
            <BasicInfoSection
              v-model:basic-info="basicInfo"
              v-model:specification-info="specificationInfo"
              v-model:image-info="imageInfo"
              v-model:storage-info="storageInfo"
              :node-list="nodeList"
              :image-list="imageList"
              :storage-pool-list="storagePoolList"
              @node-change="handleNodeChange"
              @refresh-images="fetchImages"
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
            <NetworkSection
              v-model="networkInfo"
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
            <CustomConfigSection
              v-model="customConfig"
              :os-type="osType"
            />
          </el-form>
        </div>

        <!-- 步骤4: 确认订单 -->
        <div v-show="currentStep === 4">
          <ConfirmOrderSection
            :basic-info="basicInfo"
            :specification-info="specificationInfo"
            :image-info="imageInfo"
            :storage-info="storageInfo"
            :network-info="networkInfo"
            :custom-config="customConfig"
            :node-list="nodeList"
            :image-list="imageList"
            :storage-pool-list="storagePoolList"
            :network-list="networkList"
          />
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="footer-bar">
      <div class="footer-actions">
        <el-space size="large">
          <el-button @click="handleBack">取消</el-button>
          <el-button v-if="currentStep > 1" @click="handlePrev">上一步</el-button>
          <el-button
            v-if="currentStep < 4"
            type="primary"
            @click="handleNext"
          >
            下一步
          </el-button>
          <el-button
            v-if="currentStep === 4"
            :loading="submitting"
            type="primary"
            @click="handleSubmit"
          >
            完成
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
import BasicInfoSection from './create-v2-components/BasicInfoSection.vue';
import NetworkSection from './create-v2-components/NetworkSection.vue';
import CustomConfigSection from './create-v2-components/CustomConfigSection.vue';
import ConfirmOrderSection from './create-v2-components/ConfirmOrderSection.vue';

const router = useRouter();

// sessionStorage 的 key
const STORAGE_KEY = 'vm_create_form_data_v2';
const STORAGE_STEP_KEY = 'vm_create_current_step_v2';

// 从 sessionStorage 恢复数据
const restoreFromStorage = () => {
  try {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    const savedStep = sessionStorage.getItem(STORAGE_STEP_KEY);
    if (savedData) {
      return {
        data: JSON.parse(savedData),
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

// 清除 sessionStorage
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
// 镜像列表
const imageList = ref<any[]>([]);
// 存储池列表
const storagePoolList = ref<any[]>([]);
// 网络列表
const networkList = ref<any[]>([]);

// 表单数据 - 拆分成不同的部分
const basicInfo = ref(restored?.data?.basicInfo || {
  nodeId: undefined,
});

const specificationInfo = ref(restored?.data?.specificationInfo || {
  cpuCores: 2,
  memory: 4,
});

const imageInfo = ref(restored?.data?.imageInfo || {
  imageId: undefined,
  imageName: '',
  osType: '',
  osVersion: '',
});

const storageInfo = ref(restored?.data?.storageInfo || {
  systemDiskSize: 40,
  systemDiskStorage: '',
});

const networkInfo = ref(restored?.data?.networkInfo || {
  bridge: 'vmbr0',
  networkModel: 'virtio',
  macAddress: '',
  vlanTag: undefined,
  firewall: false,
});

const customConfig = ref(restored?.data?.customConfig || {
  instanceName: '',
  loginPassword: '',
  confirmPassword: '',
  autoStart: false,
  remark: '',
});

// 完整的表单数据（用于验证）
const formData = computed(() => ({
  ...basicInfo.value,
  ...specificationInfo.value,
  ...imageInfo.value,
  ...storageInfo.value,
  ...networkInfo.value,
  ...customConfig.value,
}));

// 操作系统类型
const osType = computed(() => {
  return imageInfo.value.osType || 'Linux';
});

// 监听表单数据变化，自动保存
watch(
  [basicInfo, specificationInfo, imageInfo, storageInfo, networkInfo, customConfig, currentStep],
  () => {
    const data = {
      basicInfo: basicInfo.value,
      specificationInfo: specificationInfo.value,
      imageInfo: imageInfo.value,
      storageInfo: storageInfo.value,
      networkInfo: networkInfo.value,
      customConfig: customConfig.value,
    };
    saveToStorage(data, currentStep.value);
  },
  { deep: true }
);

// 步骤1验证规则
const step1Rules = computed<FormRules>(() => ({
  nodeId: [{ required: true, message: '请选择节点', trigger: 'change' }],
  imageId: [{ required: true, message: '请选择模板', trigger: 'change' }],
  cpuCores: [
    { required: true, message: '请输入CPU核心数', trigger: 'blur' },
    { type: 'number', min: 1, max: 128, message: 'CPU核心数范围 1-128', trigger: 'blur' }
  ],
  memory: [
    { required: true, message: '请输入内存大小', trigger: 'blur' },
    { type: 'number', min: 1, max: 1024, message: '内存大小范围 1-1024 GB', trigger: 'blur' }
  ],
  systemDiskSize: [
    { required: true, message: '请输入系统盘大小', trigger: 'blur' },
    { type: 'number', min: 40, max: 10240, message: '系统盘大小范围 40-10240 GB', trigger: 'blur' }
  ],
  systemDiskStorage: [{ required: true, message: '请选择系统盘存储', trigger: 'change' }]
}));

// 步骤2验证规则
const step2Rules = computed<FormRules>(() => ({
  bridge: [{ required: true, message: '请选择网络桥接', trigger: 'change' }],
  networkModel: [{ required: true, message: '请选择网络模型', trigger: 'change' }]
}));

// 步骤3验证规则
const step3Rules = computed<FormRules>(() => ({
  instanceName: [
    { required: true, message: '请输入实例名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  loginPassword: [
    { required: true, message: '请输入登录密码', trigger: 'blur' },
    { min: 8, max: 30, message: '密码长度 8-30 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== customConfig.value.loginPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
}));

// 加载节点列表
async function fetchNodes() {
  try {
    const response = await listNode({ pageNum: 1, pageSize: 100 });
    nodeList.value = response.rows || [];
    if (nodeList.value.length > 0 && !basicInfo.value.nodeId) {
      basicInfo.value.nodeId = nodeList.value[0].nodeId;
      handleNodeChange(nodeList.value[0].nodeId);
    }
  } catch (error) {
    console.error('加载节点列表失败', error);
    ElMessage.error('加载节点列表失败');
  }
}

// 加载镜像列表
async function fetchImages() {
  try {
    const response = await listSystemImage({ pageNum: 1, pageSize: 100, imageType: 'template' });
    imageList.value = response.rows || [];
  } catch (error) {
    console.error('加载镜像列表失败', error);
    ElMessage.error('加载镜像列表失败');
  }
}

// 加载存储池列表
async function fetchStoragePools(nodeId: number) {
  try {
    const response = await listStorage({ pageNum: 1, pageSize: 100, nodeId });
    storagePoolList.value = response.rows || [];
  } catch (error) {
    console.error('加载存储池列表失败', error);
  }
}

// 加载网络列表
async function fetchNetworks(nodeId: number) {
  try {
    const response = await listNetwork({ pageNum: 1, pageSize: 100, nodeId });
    networkList.value = response.rows || [];
  } catch (error) {
    console.error('加载网络列表失败', error);
  }
}

// 节点变更处理
function handleNodeChange(nodeId: number) {
  fetchStoragePools(nodeId);
  fetchNetworks(nodeId);
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
  }).catch(() => {});
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
    return false;
  }
}

// 下一步
async function handleNext() {
  const valid = await validateCurrentStep();
  if (!valid) return;
  
  if (currentStep.value < 4) {
    currentStep.value++;
  }
}

// 提交
async function handleSubmit() {
  submitting.value = true;
  try {
    const selectedNode = nodeList.value.find(n => n.nodeId === basicInfo.value.nodeId);
    const selectedImage = imageList.value.find(img => img.imageId === imageInfo.value.imageId);
    
    const submitData = {
      name: customConfig.value.instanceName,
      nodeId: basicInfo.value.nodeId,
      nodeName: selectedNode?.nodeName,
      status: 'stopped',
      osType: imageInfo.value.osType,
      imageId: imageInfo.value.imageId,
      imageName: selectedImage?.imageName,
      cpuCores: specificationInfo.value.cpuCores,
      memorySize: specificationInfo.value.memory,
      diskSize: storageInfo.value.systemDiskSize,
      storage: storageInfo.value.systemDiskStorage,
      bridge: networkInfo.value.bridge,
      networkModel: networkInfo.value.networkModel,
      macAddress: networkInfo.value.macAddress,
      vlanTag: networkInfo.value.vlanTag,
      firewall: networkInfo.value.firewall,
      rootPassword: customConfig.value.loginPassword,
      autoStart: customConfig.value.autoStart,
      remark: customConfig.value.remark,
    };

    await addVirtualMachine(submitData);
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
  fetchNodes();
  fetchImages();
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
    position: sticky;
    top: 0;
    z-index: 11;
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
  padding: 24px;
  border-radius: 4px;
  margin-bottom: 16px;

  .create-steps {
    max-width: 800px;
    margin: 0 auto;
  }
}

.content-wrapper {
  flex: 1;
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  margin-bottom: 80px;

  .step-content {
    max-width: 1200px;
    min-height: 600px;
    margin: 0 auto;
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

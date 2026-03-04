<template>
  <div class="template-step2">
    <div class="step-title">选择配置规格</div>
    <div class="step-desc">选择虚拟机的CPU、内存和磁盘配置</div>

    <!-- 节点选择 -->
    <el-form label-width="120px">
      <el-form-item label="所属节点" required>
        <el-select v-model="localData.nodeId" placeholder="请选择节点" style="width: 300px">
          <el-option v-for="node in nodeList" :key="node.nodeId" :label="node.nodeName" :value="node.nodeId" />
        </el-select>
      </el-form-item>

      <el-form-item label="虚拟机名称" required>
        <el-input v-model="localData.vmName" placeholder="请输入虚拟机名称" style="width: 300px" />
      </el-form-item>

      <el-form-item label="PVE VM ID" required>
        <el-input-number v-model="localData.pveVmId" :max="999999" :min="100" placeholder="请输入VM ID" style="width: 300px" />
      </el-form-item>
    </el-form>

    <!-- 规格套餐 -->
    <div class="spec-section">
      <h3>选择规格套餐</h3>
      <div class="spec-grid">
        <div v-for="spec in specList" :key="spec.id" :class="['spec-card', { selected: localData.specId === spec.id }]" @click="selectSpec(spec)">
          <div class="spec-header">
            <h4>{{ spec.name }}</h4>
            <el-tag v-if="spec.recommended" size="small" type="success">推荐</el-tag>
          </div>
          <div class="spec-details">
            <div class="spec-item">
              <el-icon><Cpu /></el-icon>
              <span>{{ spec.cpu }} 核</span>
            </div>
            <div class="spec-item">
              <el-icon><Memo /></el-icon>
              <span>{{ spec.memory }} GB</span>
            </div>
            <div class="spec-item">
              <el-icon><Coin /></el-icon>
              <span>{{ spec.disk }} GB</span>
            </div>
          </div>
          <div class="spec-price">
            <span class="price-label">参考价格:</span>
            <span class="price-value">¥{{ spec.price }}/月</span>
          </div>
          <div v-if="localData.specId === spec.id" class="selected-badge">
            <el-icon><Check /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义配置 -->
    <div class="custom-config">
      <el-divider content-position="left">
        <el-checkbox v-model="customMode">自定义配置</el-checkbox>
      </el-divider>

      <el-form v-if="customMode" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="CPU核心数">
              <el-input-number v-model="localData.cpuCores" :max="64" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="内存(GB)">
              <el-input-number v-model="localData.memorySize" :max="512" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="系统盘(GB)">
              <el-input-number v-model="localData.systemDiskSize" :max="2000" :min="10" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Check, Coin, Cpu, Memo } from '@element-plus/icons-vue';

const props = defineProps<{
  modelValue: any;
  nodeList: any[];
}>();

const emit = defineEmits(['update:modelValue']);

const localData = ref({ ...props.modelValue });
const customMode = ref(false);

// 规格套餐列表
const specList = [
  { id: 1, name: '入门型', cpu: 2, memory: 4, disk: 50, price: 99, recommended: false },
  { id: 2, name: '标准型', cpu: 4, memory: 8, disk: 100, price: 199, recommended: true },
  { id: 3, name: '进阶型', cpu: 8, memory: 16, disk: 200, price: 399, recommended: false },
  { id: 4, name: '专业型', cpu: 16, memory: 32, disk: 500, price: 799, recommended: false }
];

function selectSpec(spec: any) {
  localData.value.specId = spec.id;
  localData.value.cpuCores = spec.cpu;
  localData.value.memorySize = spec.memory;
  localData.value.systemDiskSize = spec.disk;
  customMode.value = false;
}

watch(
  localData,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.template-step2 {
  .step-title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .step-desc {
    color: #909399;
    margin-bottom: 24px;
  }

  .spec-section {
    margin-top: 32px;

    h3 {
      font-size: 16px;
      margin-bottom: 16px;
    }

    .spec-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;

      .spec-card {
        background: #fff;
        border: 2px solid #e4e7ed;
        border-radius: 8px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        &.selected {
          border-color: var(--el-color-primary);
          background: #f0f9ff;
        }

        .spec-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          h4 {
            font-size: 16px;
            color: #303133;
          }
        }

        .spec-details {
          margin-bottom: 16px;

          .spec-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            color: #606266;
            font-size: 14px;
          }
        }

        .spec-price {
          padding-top: 12px;
          border-top: 1px solid #e4e7ed;

          .price-label {
            color: #909399;
            font-size: 13px;
          }

          .price-value {
            color: #ff6b00;
            font-weight: 500;
            margin-left: 8px;
          }
        }

        .selected-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 24px;
          height: 24px;
          background: var(--el-color-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
      }
    }
  }

  .custom-config {
    margin-top: 32px;
  }
}
</style>

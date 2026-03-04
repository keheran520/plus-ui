<template>
  <div class="advanced-config-step">
    <!-- CPU高级配置 -->
    <div class="form-section">
      <div class="section-title">CPU高级配置</div>
      
      <el-form-item label="CPU类型">
        <el-select
          v-model="localData.cpuType"
          size="large"
          style="width: 400px"
        >
          <el-option label="kvm64 (默认)" value="kvm64" />
          <el-option label="host (性能最佳)" value="host" />
          <el-option label="qemu64" value="qemu64" />
          <el-option label="Broadwell" value="Broadwell" />
          <el-option label="Skylake-Client" value="Skylake-Client" />
        </el-select>
        <template #extra>
          <div class="form-tip">host 类型性能最佳，但可能影响虚拟机迁移</div>
        </template>
      </el-form-item>

      <el-form-item label="CPU限制">
        <el-input-number
          v-model="localData.cpuLimit"
          :min="0"
          :max="128"
          size="large"
          style="width: 200px"
        />
        <span class="unit-text">核</span>
        <template #extra>
          <div class="form-tip">0 表示不限制，限制虚拟机可使用的CPU核心数</div>
        </template>
      </el-form-item>

      <el-form-item label="CPU权重">
        <el-input-number
          v-model="localData.cpuUnits"
          :min="2"
          :max="262144"
          :step="256"
          size="large"
          style="width: 200px"
        />
        <template #extra>
          <div class="form-tip">CPU调度权重，默认1024，值越大优先级越高</div>
        </template>
      </el-form-item>
    </div>

    <!-- 内存高级配置 -->
    <div class="form-section">
      <div class="section-title">内存高级配置</div>
      
      <el-form-item label="最小内存">
        <el-input-number
          v-model="localData.minMemory"
          :min="0"
          :max="localData.memorySize"
          size="large"
          style="width: 200px"
        />
        <span class="unit-text">GB</span>
        <template #extra>
          <div class="form-tip">启用内存气球时的最小内存，0表示不设置</div>
        </template>
      </el-form-item>

      <el-form-item label="内存气球">
        <el-switch
          v-model="localData.balloon"
          active-text="启用"
          inactive-text="禁用"
        />
        <template #extra>
          <div class="form-tip">允许动态调整虚拟机内存，需要安装qemu-guest-agent</div>
        </template>
      </el-form-item>
    </div>

    <!-- 启动配置 -->
    <div class="form-section">
      <div class="section-title">启动配置</div>
      
      <el-form-item label="开机自启">
        <el-switch
          v-model="localData.autoStart"
          active-text="启用"
          inactive-text="禁用"
        />
        <template #extra>
          <div class="form-tip">节点启动时自动启动此虚拟机</div>
        </template>
      </el-form-item>
    </div>

    <!-- 其他配置 -->
    <div class="form-section">
      <div class="section-title">其他配置</div>
      
      <el-form-item label="备注">
        <el-input
          v-model="localData.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入备注信息"
          maxlength="500"
          show-word-limit
          style="width: 600px"
        />
      </el-form-item>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  modelValue: any;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const localData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<style lang="scss" scoped>
.advanced-config-step {
  .form-section {
    margin-bottom: 40px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e4e7ed;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .unit-text {
    margin-left: 8px;
    color: #606266;
  }
}
</style>

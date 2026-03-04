<template>
  <div class="form-section">
    <div class="section-title">自定义配置</div>
    
    <el-form-item label="实例名称" prop="instanceName">
      <el-input
        v-model="customConfig.instanceName"
        placeholder="请输入实例名称"
        size="large"
        style="width: 400px"
        maxlength="50"
        show-word-limit
      />
      <div style="margin-top: 8px; font-size: 12px; color: #909399">
        2-50个字符，用于标识虚拟机
      </div>
    </el-form-item>

    <el-form-item label="登录密码" prop="loginPassword">
      <el-input
        v-model="customConfig.loginPassword"
        type="password"
        placeholder="请输入登录密码"
        size="large"
        style="width: 400px"
        show-password
        maxlength="30"
      />
      <div style="margin-top: 8px; font-size: 12px; color: #909399">
        8-30个字符，{{ osType === 'Windows' ? 'Administrator' : 'root' }} 用户的登录密码
      </div>
    </el-form-item>

    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input
        v-model="customConfig.confirmPassword"
        type="password"
        placeholder="请再次输入密码"
        size="large"
        style="width: 400px"
        show-password
        maxlength="30"
      />
    </el-form-item>

    <el-form-item label="开机自启">
      <el-switch
        v-model="customConfig.autoStart"
        active-text="启用"
        inactive-text="禁用"
      />
      <div style="margin-top: 8px; font-size: 12px; color: #909399">
        启用后虚拟机将在宿主机启动时自动启动
      </div>
    </el-form-item>

    <el-form-item label="备注">
      <el-input
        v-model="customConfig.remark"
        type="textarea"
        placeholder="可选，添加备注信息"
        :rows="3"
        maxlength="200"
        show-word-limit
        style="width: 600px"
      />
    </el-form-item>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  modelValue: any;
  osType: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

// 双向绑定
const customConfig = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}
</style>

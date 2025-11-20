<template>
  <div class="setting-form">
    <!-- 表单内容 -->
    <div class="form-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :disabled="!isEditing"
        label-position="top"
        class="config-form"
      >
        <slot :form-data="formData" :is-editing="isEditing"></slot>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <div class="form-footer">
      <!-- 查看模式按钮 -->
      <template v-if="!isEditing">
        <el-button type="primary" @click="handleEdit">
          <el-icon class="mr-1">
            <Edit />
          </el-icon>
          修改
        </el-button>
        <el-button @click="handleResetToDefault">
          <el-icon class="mr-1">
            <RefreshLeft />
          </el-icon>
          还原默认值
        </el-button>
      </template>
      
      <!-- 编辑模式按钮 -->
      <template v-else>
        <el-button type="primary" :loading="loading" @click="handleSave">
          <el-icon class="mr-1">
            <Check />
          </el-icon>
          保存
        </el-button>
        <el-button @click="handleReset">
          <el-icon class="mr-1">
            <RefreshLeft />
          </el-icon>
          重置
        </el-button>
        <el-button @click="handleCancel">
          <el-icon class="mr-1">
            <Close />
          </el-icon>
          取消
        </el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

interface Props {
  title?: string;
  formData: Record<string, any>;
  defaultData?: Record<string, any>;
  rules?: FormRules;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  defaultData: () => ({}),
  rules: () => ({}),
  loading: false
});

const emit = defineEmits(['save', 'reset', 'cancel', 'reset-default']);

const formRef = ref<FormInstance>();
const isEditing = ref(false);
const originalData = ref<Record<string, any>>({});

// 进入编辑模式
const handleEdit = () => {
  // 保存原始数据
  originalData.value = JSON.parse(JSON.stringify(props.formData));
  isEditing.value = true;
};

// 保存
const handleSave = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('save', props.formData);
    }
  });
};

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  emit('reset');
};

// 取消编辑
const handleCancel = () => {
  // 恢复原始数据
  Object.assign(props.formData, originalData.value);
  isEditing.value = false;
  if (formRef.value) {
    formRef.value.clearValidate();
  }
  emit('cancel');
};

// 还原默认值
const handleResetToDefault = () => {
  emit('reset-default');
};

// 保存成功后退出编辑模式
const exitEditMode = () => {
  isEditing.value = false;
};

// 暴露方法给父组件
defineExpose({
  exitEditMode
});
</script>

<style lang="scss" scoped>
.setting-form {
  background: var(--el-bg-color);
}

.form-content {
  .config-form {
    max-width: 800px;

    :deep(.el-form-item) {
      margin-bottom: 24px;

      .el-form-item__label {
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }

      .el-form-item__content {
        .el-input,
        .el-textarea {
          &.is-disabled {
            .el-input__wrapper,
            .el-textarea__inner {
              background-color: var(--el-fill-color-light);
              cursor: not-allowed;
            }
          }
        }
      }
    }

    :deep(.form-item-tip) {
      margin-top: 8px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      line-height: 1.5;
    }
  }
}

.form-footer {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 32px;
}
</style>

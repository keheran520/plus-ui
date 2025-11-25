<template>
  <el-dialog v-model="dialogVisible" :close-on-click-modal="false" title="修改基本信息" width="500px" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="formData.nickName" maxlength="30" placeholder="请输入昵称" />
      </el-form-item>

      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio label="0">男</el-radio>
          <el-radio label="1">女</el-radio>
          <el-radio label="2">未知</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-alert :closable="false" show-icon style="margin-top: 10px" title="提示：手机号和邮箱请在安全设置中进行绑定或解绑" type="info" />
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button :loading="loading" type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { updateUserProfile } from '@/api/system/user';
import { UserVO } from '@/api/system/user/types';

interface Props {
  user: Partial<UserVO>;
}

const props = defineProps<Props>();
const emit = defineEmits(['success']);

const dialogVisible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

const formData = ref({
  nickName: '',
  sex: '0'
});

const rules: FormRules = {
  nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
};

// 打开对话框
const open = (user: Partial<UserVO>) => {
  formData.value = {
    nickName: user.nickName || '',
    sex: user.sex || '0'
  };
  dialogVisible.value = true;
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  formRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await updateUserProfile(formData.value);
        ElMessage.success('修改成功');
        emit('success');
        handleClose();
      } catch (error) {
        console.error('修改失败：', error);
      } finally {
        loading.value = false;
      }
    }
  });
};

defineExpose({
  open
});
</script>

<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 20px;
}
</style>

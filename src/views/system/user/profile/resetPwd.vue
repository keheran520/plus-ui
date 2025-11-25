<template>
  <el-dialog
    v-model="dialogVisible"
    title="修改密码"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="pwdRef" :model="user" :rules="rules" label-width="80px">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="user.confirmPassword" placeholder="请确认新密码" type="password" show-password />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { updateUserPwd } from '@/api/system/user';
import type { ResetPwdForm } from '@/api/system/user/types';

const emit = defineEmits(['success']);

const dialogVisible = ref(false);
const loading = ref(false);
const pwdRef = ref<ElFormInstance>();
const user = ref<ResetPwdForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const equalToPassword = (rule: any, value: string, callback: any) => {
  if (user.value.newPassword !== value) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = ref({
  oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    {
      min: 6,
      max: 20,
      message: '长度在 6 到 20 个字符',
      trigger: 'blur'
    },
    { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符：< > " \' \\ |', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    {
      required: true,
      validator: equalToPassword,
      trigger: 'blur'
    }
  ]
});

// 打开对话框
const open = () => {
  dialogVisible.value = true;
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  pwdRef.value?.resetFields();
  user.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
};

// 提交表单
const submit = () => {
  pwdRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        await updateUserPwd(user.value.oldPassword, user.value.newPassword);
        ElMessage.success('修改成功');
        emit('success');
        handleClose();
      } catch (error) {
        console.error('修改密码失败：', error);
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

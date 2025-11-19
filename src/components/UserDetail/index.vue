<template>
  <el-dialog v-model="visible" title="用户详情" width="600px" @close="handleClose">
    <div v-loading="loading" class="user-detail-container">
      <el-empty v-if="!userData" description="用户不存在" />
      <div v-else class="detail-content">
        <!-- 用户头像 -->
        <div class="user-avatar">
          <el-avatar :size="80" :src="userData.avatar">
            <el-icon :size="40">
              <User />
            </el-icon>
          </el-avatar>
        </div>

        <!-- 用户信息 -->
        <div class="user-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户ID">
              {{ userData.userId }}
            </el-descriptions-item>
            <el-descriptions-item label="用户名">
              {{ userData.userName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="昵称">
              {{ userData.nickName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ userData.email || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ userData.phonenumber || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="性别">
              <el-tag v-if="userData.sex === '0'" size="small" type="info">男</el-tag>
              <el-tag v-else-if="userData.sex === '1'" size="small" type="warning">女</el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="部门">
              {{ userData.dept?.deptName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              <div v-if="userData.roles && userData.roles.length > 0" class="roles-container">
                <el-tag v-for="role in userData.roles" :key="role.roleId" class="mr-1" size="small" type="success">
                  {{ role.roleName }}
                </el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="userData.status === '0' ? 'success' : 'danger'" size="small">
                {{ userData.status === '0' ? '正常' : '停用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ userData.createTime || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="最后登录时间">
              {{ userData.loginDate || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="最后登录IP">
              {{ userData.loginIp || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { User } from '@element-plus/icons-vue';
import { getUser } from '@/api/system/user';

interface Props {
  modelValue: boolean;
  userId?: number | string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const visible = ref(false);
const loading = ref(false);
const userData = ref<any>(null);

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val && props.userId) {
      loadUserDetail();
    }
  }
);

// 监听 visible 变化
watch(visible, (val) => {
  emit('update:modelValue', val);
});

// 加载用户详情
const loadUserDetail = async () => {
  if (!props.userId) return;

  loading.value = true;
  try {
    const res = await getUser(props.userId);
    if (res.code === 200) {
      userData.value = res.data.user;
    }
  } catch (error) {
    console.error('加载用户详情失败:', error);
  } finally {
    loading.value = false;
  }
};

// 关闭对话框
const handleClose = () => {
  userData.value = null;
};
</script>

<style lang="scss" scoped>
.user-detail-container {
  min-height: 200px;

  .detail-content {
    .user-avatar {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 4px;
    }

    .user-info {
      .roles-container {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }
  }
}
</style>

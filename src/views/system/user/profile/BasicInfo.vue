<template>
  <el-card class="basic-info-card" shadow="never">
    <div class="card-header">
      <span class="card-title">基本信息</span>
    </div>
    <div class="card-body">
      <!-- 头像和基本信息 -->
      <section class="user-section">
        <UserAvatar />

        <div class="user-name">
          <span class="name-text">{{ user.nickName || user.userName }}</span>
          <el-icon v-if="user.sex === '0'" class="gender-icon male">
            <Male />
          </el-icon>
          <el-icon v-else-if="user.sex === '1'" class="gender-icon female">
            <Female />
          </el-icon>
          <el-icon class="edit-icon" @click="handleEdit">
            <Edit />
          </el-icon>
        </div>

        <div class="user-id">
          <svg-icon :size="16" icon-class="user" />
          <span>ID: {{ user.userId }}</span>
          <el-icon class="copy-icon" @click="handleCopyUserId">
            <CopyDocument />
          </el-icon>
        </div>
      </section>
      <el-descriptions :column="1">
        <el-descriptions-item class-name="my-content" label-class-name="my-label">
          <template #label>
            <div class="cell-item">
              <el-icon>
                <User />
              </el-icon>
              用户名
            </div>
          </template>

          {{ user.userName }}
        </el-descriptions-item>
        <el-descriptions-item class-name="my-content" label-class-name="my-label">
          <template #label>
            <div class="cell-item">
              <el-icon>
                <Phone />
              </el-icon>
              手机号
            </div>
          </template>
          {{ formatContactDisplay(user.phonenumber, '未绑定手机号') }}
        </el-descriptions-item>
        <el-descriptions-item class-name="my-content" label-class-name="my-label">
          <template #label>
            <div class="cell-item">
              <el-icon>
                <Message />
              </el-icon>
              邮箱
            </div>
          </template>

          {{ formatContactDisplay(user.email, '未绑定邮箱') }}
        </el-descriptions-item>
        <el-descriptions-item class-name="my-content" label-class-name="my-label">
          <template #label>
            <div class="cell-item">
              <el-icon>
                <OfficeBuilding />
              </el-icon>
              部门
            </div>
          </template>
          {{ user.deptName || '暂无' }}
        </el-descriptions-item>
        <el-descriptions-item class-name="my-content" label-class-name="my-label">
          <template #label>
            <div class="cell-item">
              <svg-icon :size="16" icon-class="peoples" />
              角色
            </div>
          </template>
          {{ roleGroup || '暂无' }}
        </el-descriptions-item>
      </el-descriptions>

      <!--       详细信息 -->
      <!--      <footer class="info-footer">-->
      <!--        <div class="info-item">-->
      <!--          <div class="info-label">-->
      <!--            <el-icon>-->
      <!--              <User />-->
      <!--            </el-icon>-->
      <!--            <span>用户名</span>-->
      <!--          </div>-->
      <!--          <div class="info-value">{{ user.userName }}</div>-->
      <!--        </div>-->

      <!--        <div class="info-item">-->
      <!--          <div class="info-label">-->
      <!--            <el-icon>-->
      <!--              <Phone />-->
      <!--            </el-icon>-->
      <!--            <span>手机</span>-->
      <!--          </div>-->
      <!--          <div class="info-value">{{ user.phonenumber || '暂无' }}</div>-->
      <!--        </div>-->

      <!--        <div class="info-item">-->
      <!--          <div class="info-label">-->
      <!--            <el-icon>-->
      <!--              <Message />-->
      <!--            </el-icon>-->
      <!--            <span>邮箱</span>-->
      <!--          </div>-->
      <!--          <div class="info-value">{{ user.email || '暂无' }}</div>-->
      <!--        </div>-->

      <!--        <div class="info-item">-->
      <!--          <div class="info-label">-->
      <!--            <el-icon>-->
      <!--              <OfficeBuilding />-->
      <!--            </el-icon>-->
      <!--            <span>部门</span>-->
      <!--          </div>-->
      <!--          <div class="info-value">{{ user.deptName || '暂无' }}</div>-->
      <!--        </div>-->

      <!--        <div class="info-item">-->
      <!--          <div class="info-label">-->
      <!--            <svg-icon :size="16" icon-class="peoples" />-->
      <!--            <span>角色</span>-->
      <!--          </div>-->
      <!--          <div class="info-value">{{ roleGroup || '暂无' }}</div>-->
      <!--        </div>-->
      <!--      </footer>-->
    </div>
    <!-- 底部注册时间 -->
    <template #footer>
      <div class="card-footer">注册于 {{ user.createTime }}</div>
    </template>
  </el-card>

  <!-- 编辑基本信息对话框 -->
  <BasicInfoEditDialog ref="editDialogRef" :user="user" @success="handleEditSuccess" />
</template>

<script lang="ts" setup>
import { CopyDocument, Edit, Female, Male, Message, OfficeBuilding, Phone, User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useClipboard } from '@vueuse/core';
import BasicInfoEditDialog from './BasicInfoEditDialog.vue';
import UserAvatar from './userAvatar.vue';
import { UserVO } from '@/api/system/user/types';
import { formatContactDisplay } from '@/utils/contact';

interface Props {
  user: Partial<UserVO>;
  roleGroup?: string;
  postGroup?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['refresh']);

const editDialogRef = ref();

// 复制用户ID
const handleCopyUserId = async () => {
  const { copy, isSupported } = useClipboard();

  if (!isSupported) {
    ElMessage.error('当前浏览器不支持复制功能');
    return;
  }

  try {
    await copy(String(props.user.userId));
    ElMessage.success('用户ID已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 编辑基本信息
const handleEdit = () => {
  editDialogRef.value?.open(props.user);
};

// 编辑成功
const handleEditSuccess = () => {
  emit('refresh');
};
</script>

<style lang="scss" scoped>
.basic-info-card {
  border: none;
  border-radius: var(--radius-lg);

  :deep(.el-card__body) {
    padding: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(180deg, var(--primary-light-9), #fff0);

  .card-title {
    font-size: 16px;
    color: #303133;
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  padding: 28px 20px 20px;
}

.user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 40px;

  .user-name {
    display: flex;
    align-items: center;
    margin: 20px 0 10px;
    font-size: 20px;
    font-weight: 500;
    color: #303133;

    .name-text {
      margin-right: 10px;
    }

    .gender-icon {
      font-size: 18px;
      margin-right: 8px;

      &.male {
        color: #409eff;
      }

      &.female {
        color: #f56c6c;
      }
    }

    .edit-icon {
      font-size: 16px;
      color: #909399;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #409eff;
      }
    }
  }

  .user-id {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #909399;
    font-size: 12px;
    position: relative;

    .copy-icon {
      font-size: 14px;
      color: #909399;
      cursor: pointer;
      opacity: 0;
      transition: all 0.3s;
      margin-left: 4px;

      &:hover {
        color: #409eff;
      }
    }

    &:hover .copy-icon {
      opacity: 1;
    }
  }
}

.info-footer {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #606266;
      font-size: 14px;

      .el-icon {
        font-size: 16px;
        color: #909399;
      }
    }

    .info-value {
      color: #303133;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.card-footer {
  margin: 0 -20px;
  font-size: 12px;
  text-align: center;
  color: #909399;
}

.cell-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 80px;
}

:deep(.el-descriptions__cell) {
  display: flex;
}

:deep(.my-label) {
  color: var(--text-secondary);
}

:deep(.my-content) {
  color: var(--text-primary);
}
</style>

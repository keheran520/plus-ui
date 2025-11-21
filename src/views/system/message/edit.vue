<template>
  <div class="message-edit-container">
    <!-- 页面头部 -->
    <el-page-header class="bg-white p-5" @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> {{ pageTitle }} </span>
      </template>
      <template #extra>
        <div class="flex items-center">
          <el-button v-if="canEdit" @click="handleSaveDraft">保存草稿</el-button>
          <el-button v-if="canEdit" @click="handlePublish" type="primary">发布</el-button>
          <el-button v-if="!canEdit" @click="handleBack">返回</el-button>
        </div>
      </template>
    </el-page-header>

    <!-- 表单内容 -->
    <div class="form-wrapper">
      <el-card class="form-card" shadow="never">
        <el-form ref="messageFormRef" :model="form" :rules="rules" label-width="120px">
          <!-- 基本信息 -->
          <div class="form-section">
            <div class="section-title">基本信息</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="消息类型" prop="messageType">
                  <el-select v-model="form.messageType" placeholder="请选择消息类型" style="width: 100%">
                    <el-option v-for="dict in sys_message_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="优先级" prop="priority">
                  <el-select v-model="form.priority" placeholder="请选择优先级" style="width: 100%">
                    <el-option v-for="dict in sys_message_priority" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="消息标题" prop="messageTitle">
                  <el-input v-model="form.messageTitle" maxlength="200" placeholder="请输入消息标题" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <el-divider />

          <!-- 通知设置 -->
          <div class="form-section">
            <div class="section-title">通知设置</div>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="通知范围" prop="messageScope">
                  <el-radio-group v-model="form.messageScope" @change="handleScopeChange">
                    <el-radio v-for="dict in sys_notice_scope" :key="dict.value" :value="dict.value">
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 指定用户选择 -->
            <el-row v-if="form.messageScope === 'specified'" :gutter="20">
              <el-col :span="24">
                <el-form-item label="通知用户" prop="messageUserIds">
                  <el-button icon="User" type="primary" @click="userSelectRef.open()">选择用户</el-button>
                  <span class="ml-2 text-gray-500">已选择 {{ selectedUsers.length }} 人</span>
                  <div v-if="selectedUsers.length > 0" class="selected-users">
                    <el-tag v-for="user in selectedUsers" :key="user.userId" class="user-tag" closable @close="handleRemoveUser(user.userId)">
                      {{ user.nickName }}（{{ user.userName }}）
                    </el-tag>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 发送方式 -->
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="发送方式" prop="sendMethod">
                  <el-checkbox-group v-model="sendMethods">
                    <el-checkbox v-for="dict in sys_send_method" :key="dict.value" :value="dict.value">
                      {{ dict.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <el-divider />

          <!-- 内容编辑 -->
          <div class="form-section">
            <div class="section-title">内容编辑</div>
            <el-row>
              <el-col :span="24">
                <el-form-item label="消息内容" prop="messageContent">
                  <wang-editor v-model="form.messageContent" :height="600" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </el-card>
    </div>

    <!-- 用户选择组件 -->
    <user-select ref="userSelectRef" v-model="selectedUsers" :data="form.messageUserIds" @confirm-call-back="handleUserSelect" />
  </div>
</template>

<script lang="ts" name="MessageEdit" setup>
import { useRoute, useRouter } from 'vue-router';
import { getMessage, saveDraft, publishMessage } from '@/api/system/message';
import { MessageForm } from '@/api/system/message/types';
import UserSelect from '@/components/UserSelect/index.vue';

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { sys_message_type, sys_message_priority, sys_notice_scope, sys_send_method } = toRefs<any>(
  proxy?.useDict('sys_message_type', 'sys_message_priority', 'sys_notice_scope', 'sys_send_method')
);

// 页面参数
const messageId = ref<string | number>('');
const operateType = ref<string>('add'); // add | edit | view
const isEdit = computed(() => operateType.value === 'edit');
const pageTitle = computed(() => {
  if (operateType.value === 'add') return '新建消息';
  if (operateType.value === 'edit') return '编辑消息';
  return '查看消息';
});

// 是否可编辑（只有待发送状态才能编辑）
const canEdit = ref(true);

// 表单引用
const messageFormRef = ref();

// 表单数据
const initFormData: MessageForm = {
  messageId: undefined,
  messageType: '',
  messageTitle: '',
  messageContent: '',
  messageScope: 'all',
  messageUserIds: '',
  sourceId: undefined,
  sourceType: '',
  priority: 'normal',
  readCount: 0
};

const form = ref<MessageForm>({ ...initFormData });

// 发送方式（多选）
const sendMethods = ref<string[]>(['system']);

// 表单验证规则
const rules = {
  messageType: [{ required: true, message: '消息类型不能为空', trigger: 'change' }],
  messageTitle: [{ required: true, message: '消息标题不能为空', trigger: 'blur' }],
  messageScope: [{ required: true, message: '通知范围不能为空', trigger: 'change' }],
  messageContent: [{ required: true, message: '消息内容不能为空', trigger: 'blur' }],
  priority: [{ required: true, message: '优先级不能为空', trigger: 'change' }]
};

// 选中的用户
const selectedUsers = ref<any[]>([]);
const userSelectRef = ref();

// 通知范围变化
const handleScopeChange = (value: string) => {
  if (value === 'all') {
    selectedUsers.value = [];
    form.value.messageUserIds = '';
  }
};

// 用户选择回调
const handleUserSelect = (users: any[]) => {
  selectedUsers.value = users;
  form.value.messageUserIds = users.map((u) => u.userId).join(',');
};

// 移除用户
const handleRemoveUser = (userId: number) => {
  selectedUsers.value = selectedUsers.value.filter((u) => u.userId !== userId);
  form.value.messageUserIds = selectedUsers.value.map((u) => u.userId).join(',');
};

/** 保存草稿 */
const handleSaveDraft = async () => {
  try {
    // 处理发送方式
    form.value.sendMethod = sendMethods.value.join(',');

    // 处理通知用户
    if (form.value.messageScope === 'specified') {
      if (!form.value.messageUserIds) {
        proxy?.$modal.msgWarning('请选择通知用户');
        return;
      }
    } else {
      form.value.messageUserIds = '';
    }

    const { data } = await saveDraft(form.value);
    
    // 如果是新增，保存返回的messageId，避免重复创建
    if (!form.value.messageId && data) {
      form.value.messageId = data.messageId || data;
      messageId.value = form.value.messageId;
    }
    
    proxy?.$modal.msgSuccess('保存草稿成功');
    handleBack();
  } catch (error) {
    console.error('保存草稿失败:', error);
  }
};

/** 发布 */
const handlePublish = () => {
  messageFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      await submitPublish();
    }
  });
};

/** 提交发布 */
const submitPublish = async () => {
  try {
    // 处理发送方式
    form.value.sendMethod = sendMethods.value.join(',');

    // 处理通知用户
    if (form.value.messageScope === 'specified') {
      if (!form.value.messageUserIds) {
        proxy?.$modal.msgWarning('请选择通知用户');
        return;
      }
    } else {
      form.value.messageUserIds = '';
    }

    // 先保存草稿
    await saveDraft(form.value);

    // 再发布
    const messageIdToPublish = form.value.messageId || messageId.value;
    if (messageIdToPublish) {
      await publishMessage(messageIdToPublish);
      proxy?.$modal.msgSuccess('发布成功');
      handleBack();
    }
  } catch (error) {
    console.error('发布失败:', error);
  }
};

/** 初始化页面 */
const init = async () => {
  // 重置表单数据
  form.value = { ...initFormData };
  sendMethods.value = ['system'];
  selectedUsers.value = [];
  canEdit.value = true;

  // 获取URL参数
  messageId.value = (route.query.id as string) || '';
  operateType.value = (route.query.type as string) || 'add';

  // 如果是编辑或查看，加载数据
  if (messageId.value && (operateType.value === 'edit' || operateType.value === 'view')) {
    await loadMessageData();
  }
};

/** 加载消息数据 */
const loadMessageData = async () => {
  try {
    const { data } = await getMessage(messageId.value);
    Object.assign(form.value, data);

    // 检查是否可编辑（只有pending状态才能编辑）
    canEdit.value = data.sendStatus === 'pending' || !data.sendStatus;

    // 处理发送方式
    if (data.sendMethod) {
      sendMethods.value = data.sendMethod.split(',');
    }

    // 处理选中的用户
    if (data.messageUserIds) {
      // TODO: 根据用户IDs加载用户信息
      const userIds = data.messageUserIds.toString().split(',');
      // 这里需要调用接口获取用户详情
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    proxy?.$modal.msgError('加载数据失败');
  }
};

/** 返回 */
const handleBack = () => {
  // 使用replace并传递时间戳，触发列表页面刷新
  router.replace({ 
    path: '/system/message', 
    query: { t: Date.now().toString() } 
  });
};

/** 返回（兼容el-page-header） */
const goBack = () => {
  handleBack();
};

// 监听路由参数变化，当切换不同消息时重新加载数据
watch(
  () => route.query.id,
  (newId, oldId) => {
    // 只有当id真正变化时才重新加载（避免初始化时重复加载）
    if (newId && newId !== oldId) {
      init();
    }
  }
);

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.message-edit-container {
  .form-wrapper {
    padding: var(--spacing-md);

    .form-card {
      :deep(.el-card__body) {
        padding: 24px;
      }
    }

    .form-section {
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 20px;
        padding-left: 12px;
        border-left: 3px solid var(--el-color-primary);
      }
    }
  }

  .selected-users {
    margin-top: 12px;
    padding: 12px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;

    .user-tag {
      margin: 4px 8px 4px 0;
    }
  }
}
</style>

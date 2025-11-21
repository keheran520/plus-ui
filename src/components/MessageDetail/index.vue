<template>
  <el-dialog v-model="visible" title="消息详情" width="700px" @close="handleClose">
    <div v-loading="loading" class="message-detail-container">
      <el-empty v-if="!messageData" description="消息不存在" />
      <div v-else class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="消息ID">
            {{ messageData.messageId }}
          </el-descriptions-item>
          <el-descriptions-item label="消息类型">
            <dict-tag :options="sys_message_type" :value="messageData.messageType" />
          </el-descriptions-item>
          <el-descriptions-item :span="2" label="消息标题">
            {{ messageData.messageTitle || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :span="2" label="消息内容">
            <div class="message-content">{{ messageData.messageContent || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="通知范围">
            <dict-tag :options="sys_notice_scope" :value="messageData.messageScope" />
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <dict-tag :options="sys_message_priority" :value="messageData.priority" />
          </el-descriptions-item>
          <el-descriptions-item label="发送方式">
            <dict-tag :options="sys_send_method" :value="messageData.sendMethod" />
          </el-descriptions-item>
          <el-descriptions-item label="发送状态">
            <dict-tag :options="sys_send_status" :value="messageData.sendStatus" />
          </el-descriptions-item>
          <el-descriptions-item label="发送时间">
            {{ messageData.sendTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="已读人数">
            {{ messageData.readCount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item v-if="messageData.errorMsg" :span="2" label="错误信息">
            <el-alert :closable="false" :title="messageData.errorMsg" type="error" />
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ messageData.createTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ messageData.createBy || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, getCurrentInstance } from 'vue';
import { getMessage } from '@/api/system/message';

interface Props {
  modelValue: boolean;
  messageId?: number | string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_message_type, sys_notice_scope, sys_message_priority, sys_send_method, sys_send_status } = toRefs<any>(
  proxy?.useDict('sys_message_type', 'sys_notice_scope', 'sys_message_priority', 'sys_send_method', 'sys_send_status')
);

const visible = ref(false);
const loading = ref(false);
const messageData = ref<any>(null);

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val && props.messageId) {
      loadMessageDetail();
    }
  }
);

// 监听 visible 变化
watch(visible, (val) => {
  emit('update:modelValue', val);
});

// 加载消息详情
const loadMessageDetail = async () => {
  if (!props.messageId) return;

  loading.value = true;
  try {
    const res = await getMessage(props.messageId);
    if (res.code === 200) {
      messageData.value = res.data;
    }
  } catch (error) {
    console.error('加载消息详情失败:', error);
  } finally {
    loading.value = false;
  }
};

// 关闭对话框
const handleClose = () => {
  messageData.value = null;
};
</script>

<style lang="scss" scoped>
.message-detail-container {
  min-height: 200px;

  .detail-content {
    .message-content {
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.6;
    }
  }
}
</style>

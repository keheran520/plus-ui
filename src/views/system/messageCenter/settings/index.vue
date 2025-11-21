<template>
  <div class="message-settings">
    <el-form ref="settingsFormRef" :model="form" label-width="140px">
      <!-- 通知方式设置 -->
      <div class="setting-section">
        <div class="section-title">
          <el-icon>
            <Bell />
          </el-icon>
          <span>通知方式设置</span>
        </div>
        <el-form-item label="系统消息通知">
          <el-switch v-model="form.systemNotify" />
          <span class="form-tip">在系统内接收消息通知</span>
        </el-form-item>
        <el-form-item label="邮件通知">
          <el-switch v-model="form.emailNotify" />
          <span class="form-tip">通过邮件接收消息通知</span>
        </el-form-item>
        <el-form-item label="短信通知">
          <el-switch v-model="form.smsNotify" />
          <span class="form-tip">通过短信接收重要消息通知</span>
        </el-form-item>
      </div>

      <el-divider />

      <!-- 消息类型订阅 -->
      <div class="setting-section">
        <div class="section-title">
          <el-icon>
            <Message />
          </el-icon>
          <span>消息类型订阅</span>
        </div>
        <el-form-item label="系统通知">
          <el-checkbox-group v-model="form.systemMessageTypes">
            <el-checkbox label="system">系统消息</el-checkbox>
            <el-checkbox label="system">系统通知</el-checkbox>
            <el-checkbox label="maintenance">维护公告</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="业务通知">
          <el-checkbox-group v-model="form.businessMessageTypes">
            <el-checkbox label="order">订单通知</el-checkbox>
            <el-checkbox label="payment">支付通知</el-checkbox>
            <el-checkbox label="refund">退款通知</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="活动通知">
          <el-checkbox-group v-model="form.activityMessageTypes">
            <el-checkbox label="promotion">促销活动</el-checkbox>
            <el-checkbox label="event">活动邀请</el-checkbox>
            <el-checkbox label="news">新闻资讯</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </div>

      <el-divider />

      <!-- 免打扰设置 -->
      <div class="setting-section">
        <div class="section-title">
          <el-icon>
            <MuteNotification />
          </el-icon>
          <span>免打扰设置</span>
        </div>
        <el-form-item label="开启免打扰">
          <el-switch v-model="form.doNotDisturb" />
          <span class="form-tip">开启后在指定时间段内不接收消息通知</span>
        </el-form-item>
        <el-form-item v-if="form.doNotDisturb" label="免打扰时间段">
          <el-time-picker
            v-model="form.doNotDisturbStart"
            :disabled="!form.doNotDisturb"
            format="HH:mm"
            placeholder="开始时间"
            style="width: 150px"
          />
          <span class="mx-2">至</span>
          <el-time-picker
            v-model="form.doNotDisturbEnd"
            :disabled="!form.doNotDisturb"
            format="HH:mm"
            placeholder="结束时间"
            style="width: 150px"
          />
        </el-form-item>
      </div>

      <el-divider />

      <!-- 消息保留设置 -->
      <div class="setting-section">
        <div class="section-title">
          <el-icon>
            <Timer />
          </el-icon>
          <span>消息保留设置</span>
        </div>
        <el-form-item label="自动清理已读消息">
          <el-switch v-model="form.autoCleanRead" />
          <span class="form-tip">自动清理超过指定天数的已读消息</span>
        </el-form-item>
        <el-form-item v-if="form.autoCleanRead" label="保留天数">
          <el-input-number v-model="form.readRetentionDays" :disabled="!form.autoCleanRead" :min="1" :max="365" />
          <span class="form-tip ml-2">天</span>
        </el-form-item>
      </div>

      <el-divider />

      <!-- 保存按钮 -->
      <el-form-item>
        <el-button :loading="submitLoading" type="primary" @click="handleSubmit">
          <el-icon class="mr-1">
            <Check />
          </el-icon>
          保存设置
        </el-button>
        <el-button @click="handleReset">
          <el-icon class="mr-1">
            <Refresh />
          </el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { getMessageSettings, updateMessageSettings } from '@/api/system/messageCenter';
import { Bell, Message, MuteNotification, Timer, Check, Refresh } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const settingsFormRef = ref();
const submitLoading = ref(false);

const form = ref({
  // 通知方式
  systemNotify: true,
  emailNotify: true,
  smsNotify: false,

  // 消息类型订阅
  systemMessageTypes: ['system', 'maintenance'],
  businessMessageTypes: ['order', 'payment', 'refund'],
  activityMessageTypes: ['promotion'],

  // 免打扰设置
  doNotDisturb: false,
  doNotDisturbStart: null,
  doNotDisturbEnd: null,

  // 消息保留设置
  autoCleanRead: false,
  readRetentionDays: 30
});

/** 加载设置 */
const loadSettings = async () => {
  try {
    const { data } = await getMessageSettings();
    if (data) {
      Object.assign(form.value, data);
    }
  } catch (error) {
    console.error('加载设置失败:', error);
  }
};

/** 保存设置 */
const handleSubmit = async () => {
  submitLoading.value = true;
  try {
    await updateMessageSettings(form.value);
    proxy?.$modal.msgSuccess('保存成功');
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    submitLoading.value = false;
  }
};

/** 重置设置 */
const handleReset = () => {
  loadSettings();
};

onMounted(() => {
  loadSettings();
});
</script>

<style lang="scss" scoped>
.message-settings {
  max-width: 800px;

  .setting-section {
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 20px;
      padding-left: 12px;
      border-left: 3px solid var(--el-color-primary);

      .el-icon {
        font-size: 18px;
        color: var(--el-color-primary);
      }
    }
  }

  .form-tip {
    margin-left: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  :deep(.el-checkbox-group) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>

<template>
  <div class="security-config-container">
    <SettingForm
      ref="settingFormRef"
      :default-data="defaultData"
      :form-data="formData"
      :loading="loading"
      :rules="rules"
      title="安全配置"
      @cancel="handleCancel"
      @reset="handleReset"
      @save="handleSave"
      @reset-default="handleResetToDefault"
    >
      <template #default="{ isEditing }">
        <!-- 密码最大错误次数 -->
        <el-form-item label="密码最大错误次数" prop="maxRetryCount" required>
          <el-input-number
            v-model.number="formData.maxRetryCount"
            :disabled="!isEditing"
            :min="1"
            :max="10"
            controls-position="right"
          />
          <el-text v-if="configDescriptions.maxRetryCount" class="w-full" size="small" type="info">
            {{ configDescriptions.maxRetryCount }}
          </el-text>
        </el-form-item>

        <!-- 密码锁定时间 -->
        <el-form-item label="密码锁定时间（分钟）" prop="lockTime" required>
          <el-input-number
            v-model.number="formData.lockTime"
            :disabled="!isEditing"
            :min="1"
            :max="1440"
            controls-position="right"
          />
          <el-text v-if="configDescriptions.lockTime" class="w-full" size="small" type="info">
            {{ configDescriptions.lockTime }}
          </el-text>
        </el-form-item>

        <!-- 配置说明 -->
        <el-divider />
        <el-alert
          title="配置说明"
          type="info"
          :closable="false"
          description="
            • 密码最大错误次数：用户登录时密码输入错误的最大次数，超过此次数将锁定账户
            • 密码锁定时间：账户被锁定后需要等待的时间（单位：分钟），超过此时间后自动解锁
          "
        />
      </template>
    </SettingForm>
  </div>
</template>

<script lang="ts" setup>
import SettingForm from '@/components/SettingForm/index.vue';
import { listConfig, updateConfigByKey } from '@/api/system/config';
import { ConfigQuery } from '@/api/system/config/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const settingFormRef = ref();
const loading = ref(false);

// 表单数据
const formData = reactive({
  maxRetryCount: 5,
  lockTime: 10
});

// 配置描述映射（从后端获取）
const configDescriptions = reactive({
  maxRetryCount: '',
  lockTime: ''
});

// 默认数据（从后端defaultValue字段获取）
const defaultData = reactive({
  maxRetryCount: 5,
  lockTime: 10
});

// 配置ID映射
const configIds: Record<string, number> = {};

// 表单验证规则
const rules = {
  maxRetryCount: [
    { required: true, message: '请输入密码最大错误次数', trigger: 'blur' },
    { type: 'number', min: 1, max: 10, message: '密码最大错误次数应在1-10之间', trigger: 'blur' }
  ],
  lockTime: [
    { required: true, message: '请输入密码锁定时间', trigger: 'blur' },
    { type: 'number', min: 1, max: 1440, message: '密码锁定时间应在1-1440分钟之间', trigger: 'blur' }
  ]
};

// 加载配置
const loadConfig = async () => {
  loading.value = true;
  try {
    const res = await listConfig({
      pageNum: 1,
      pageSize: 100,
      configCategory: 'security'
    } as ConfigQuery);

    const configMap: Record<string, string> = {
      'user.password.maxRetryCount': 'maxRetryCount',
      'user.password.lockTime': 'lockTime'
    };

    res.rows.forEach((item: any) => {
      const key = configMap[item.configKey];
      if (key) {
        formData[key] = Number(item.configValue) || (defaultData[key] as number);
        configIds[key] = item.configId;
        // 保存配置描述
        if (item.configDescription) {
          configDescriptions[key] = item.configDescription;
        }
        // 保存默认值
        if (item.defaultValue) {
          defaultData[key] = Number(item.defaultValue) || (defaultData[key] as number);
        }
      }
    });
  } catch (error) {
    console.error('加载配置失败:', error);
  } finally {
    loading.value = false;
  }
};

// 保存配置
const handleSave = async () => {
  loading.value = true;
  const failedItems: string[] = [];
  const successItems: string[] = [];

  try {
    const configMap: Record<string, { key: string; name: string }> = {
      maxRetryCount: { key: 'user.password.maxRetryCount', name: '密码最大错误次数' },
      lockTime: { key: 'user.password.lockTime', name: '密码锁定时间' }
    };

    // 使用 updateConfigByKey 接口逐个更新，便于追踪错误
    for (const [key, value] of Object.entries(formData)) {
      const config = configMap[key];
      if (!config) continue;

      try {
        await updateConfigByKey(config.key, String(value));
        successItems.push(config.name);
      } catch (error) {
        console.error(`保存 ${config.name} 失败:`, error);
        failedItems.push(config.name);
      }
    }

    // 根据结果显示不同的提示
    if (failedItems.length === 0) {
      proxy?.$modal.msgSuccess('保存成功');
      settingFormRef.value?.exitEditMode();
      await loadConfig();
    } else if (successItems.length === 0) {
      proxy?.$modal.msgError('保存失败，所有配置项都未能更新');
    } else {
      proxy?.$modal.msgWarning(`部分配置保存失败：${failedItems.join('、')}。已成功保存：${successItems.join('、')}`);
      await loadConfig();
    }
  } catch (error) {
    console.error('保存配置时发生错误:', error);
    proxy?.$modal.msgError('保存配置时发生错误');
  } finally {
    loading.value = false;
  }
};

// 重置表单
const handleReset = () => {
  loadConfig();
};

// 取消编辑
const handleCancel = () => {
  // 取消操作已在SettingForm组件中处理
};

// 还原默认值
const handleResetToDefault = () => {
  proxy?.$modal
    .confirm('确定要还原所有配置为默认值吗？')
    .then(() => {
      Object.assign(formData, defaultData);
      proxy?.$modal.msgSuccess('已还原为默认值，请点击保存按钮保存更改');
    })
    .catch(() => {});
};

onMounted(() => {
  loadConfig();
});
</script>

<style lang="scss" scoped>
.security-config-container {
  max-width: 800px;
}
</style>

<template>
  <div class="email-config-container">
    <SettingForm
      ref="settingFormRef"
      :default-data="defaultData"
      :form-data="formData"
      :loading="loading"
      :rules="rules"
      title="邮箱配置"
      @cancel="handleCancel"
      @reset="handleReset"
      @save="handleSave"
      @reset-default="handleResetToDefault"
    >
      <template #default="{ isEditing }">
        <!-- 邮箱功能开关 -->
        <el-form-item label="邮箱功能开关" prop="enabled">
          <el-switch
            v-model="formData.enabled"
            :disabled="!isEditing"
            active-value="true"
            inactive-value="false"
          />
          <el-text v-if="configDescriptions.enabled" class="w-full" size="small" type="info">
            {{ configDescriptions.enabled }}
          </el-text>
        </el-form-item>

        <!-- SMTP服务器域名 -->
        <el-form-item label="SMTP服务器" prop="host" required>
          <el-input v-model="formData.host" :disabled="!isEditing" clearable placeholder="例如：smtp.qq.com" />
          <el-text v-if="configDescriptions.host" class="w-full" size="small" type="info">
            {{ configDescriptions.host }}
          </el-text>
        </el-form-item>

        <!-- SMTP服务端口 -->
        <el-form-item label="SMTP端口" prop="port" required>
          <el-input-number
            v-model.number="formData.port"
            :disabled="!isEditing"
            :min="1"
            :max="65535"
            controls-position="right"
          />
          <el-text v-if="configDescriptions.port" class="w-full" size="small" type="info">
            {{ configDescriptions.port }}
          </el-text>
        </el-form-item>

        <!-- 邮箱用户名 -->
        <el-form-item label="邮箱账号" prop="user" required>
          <el-input v-model="formData.user" :disabled="!isEditing" clearable placeholder="完整的邮箱地址" />
          <el-text v-if="configDescriptions.user" class="w-full" size="small" type="info">
            {{ configDescriptions.user }}
          </el-text>
        </el-form-item>

        <!-- 邮箱密码 -->
        <el-form-item label="邮箱密码" prop="pass" required>
          <el-input
            v-model="formData.pass"
            :disabled="!isEditing"
            clearable
            placeholder="邮箱密码或授权码"
            show-password
            type="password"
          />
          <el-text v-if="configDescriptions.pass" class="w-full" size="small" type="info">
            {{ configDescriptions.pass }}
          </el-text>
        </el-form-item>

        <!-- 发件人地址 -->
        <el-form-item label="发件人地址" prop="from" required>
          <el-input v-model="formData.from" :disabled="!isEditing" clearable placeholder="user@example.com 或 Name <user@example.com>" />
          <el-text v-if="configDescriptions.from" class="w-full" size="small" type="info">
            {{ configDescriptions.from }}
          </el-text>
        </el-form-item>

        <!-- 更多配置折叠面板 -->
        <el-divider content-position="left">
          <el-switch v-model="showMoreConfig" active-text="更多配置" />
        </el-divider>

        <el-collapse-transition>
          <div v-show="showMoreConfig" class="more-config">
            <!-- 是否需要认证 -->
            <el-form-item label="是否需要认证" prop="auth">
              <el-switch
                v-model="formData.auth"
                :disabled="!isEditing"
                active-value="true"
                inactive-value="false"
              />
              <el-text v-if="configDescriptions.auth" class="w-full" size="small" type="info">
                {{ configDescriptions.auth }}
              </el-text>
            </el-form-item>

            <!-- 使用STARTTLS -->
            <el-form-item label="使用STARTTLS" prop="starttlsEnable">
              <el-switch
                v-model="formData.starttlsEnable"
                :disabled="!isEditing"
                active-value="true"
                inactive-value="false"
              />
              <el-text v-if="configDescriptions.starttlsEnable" class="w-full" size="small" type="info">
                {{ configDescriptions.starttlsEnable }}
              </el-text>
            </el-form-item>

            <!-- 使用SSL -->
            <el-form-item label="使用SSL" prop="sslEnable">
              <el-switch
                v-model="formData.sslEnable"
                :disabled="!isEditing"
                active-value="true"
                inactive-value="false"
              />
              <el-text v-if="configDescriptions.sslEnable" class="w-full" size="small" type="info">
                {{ configDescriptions.sslEnable }}
              </el-text>
            </el-form-item>

            <!-- SMTP超时时长 -->
            <el-form-item label="SMTP超时(ms)" prop="timeout">
              <el-input-number
                v-model.number="formData.timeout"
                :disabled="!isEditing"
                :min="0"
                controls-position="right"
              />
              <el-text v-if="configDescriptions.timeout" class="w-full" size="small" type="info">
                {{ configDescriptions.timeout }}
              </el-text>
            </el-form-item>

            <!-- Socket连接超时 -->
            <el-form-item label="连接超时(ms)" prop="connectionTimeout">
              <el-input-number
                v-model.number="formData.connectionTimeout"
                :disabled="!isEditing"
                :min="0"
                controls-position="right"
              />
              <el-text v-if="configDescriptions.connectionTimeout" class="w-full" size="small" type="info">
                {{ configDescriptions.connectionTimeout }}
              </el-text>
            </el-form-item>
          </div>
        </el-collapse-transition>

        <!-- 配置说明 -->
        <el-divider />
        <el-alert
          title="配置说明"
          type="info"
          :closable="false"
          description="
            • 常见SMTP服务器：QQ邮箱(smtp.qq.com:465)、网易邮箱(smtp.163.com:465)、Gmail(smtp.gmail.com:587)
            • 邮箱密码建议使用授权码而不是真实密码
            • SSL通常使用端口465，STARTTLS通常使用端口587
            • 超时时间单位为毫秒，0表示不超时
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
const showMoreConfig = ref(false);

// 表单数据
const formData = reactive({
  enabled: 'true',
  host: '',
  port: 465,
  user: '',
  pass: '',
  from: '',
  auth: 'true',
  starttlsEnable: 'false',
  sslEnable: 'true',
  timeout: 25000,
  connectionTimeout: 25000
});

// 配置描述映射（从后端获取）
const configDescriptions = reactive({
  enabled: '',
  host: '',
  port: '',
  user: '',
  pass: '',
  from: '',
  auth: '',
  starttlsEnable: '',
  sslEnable: '',
  timeout: '',
  connectionTimeout: ''
});

// 默认数据（从后端defaultValue字段获取）
const defaultData = reactive({
  enabled: 'true',
  host: 'smtp.qq.com',
  port: 465,
  user: '',
  pass: '',
  from: '',
  auth: 'true',
  starttlsEnable: 'false',
  sslEnable: 'true',
  timeout: 25000,
  connectionTimeout: 25000
});

// 配置ID映射
const configIds: Record<string, number> = {};

// 原始数据（用于对比是否改变）
const originalData = reactive({
  enabled: 'true',
  host: '',
  port: 465,
  user: '',
  pass: '',
  from: '',
  auth: 'true',
  starttlsEnable: 'false',
  sslEnable: 'true',
  timeout: 25000,
  connectionTimeout: 25000
});

// 表单验证规则
const rules = {
  host: [{ required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }],
  port: [
    { required: true, message: '请输入SMTP端口', trigger: 'blur' },
    { type: 'number', min: 1, max: 65535, message: '端口号应在1-65535之间', trigger: 'blur' }
  ],
  user: [{ required: true, message: '请输入邮箱账号', trigger: 'blur' }],
  pass: [{ required: true, message: '请输入邮箱密码或授权码', trigger: 'blur' }],
  from: [{ required: true, message: '请输入发件人地址', trigger: 'blur' }]
};

// 加载配置
const loadConfig = async () => {
  loading.value = true;
  try {
    const res = await listConfig({
      pageNum: 1,
      pageSize: 100,
      configCategory: 'email'
    } as ConfigQuery);

    const configMap: Record<string, string> = {
      'mail.enabled': 'enabled',
      'mail.host': 'host',
      'mail.port': 'port',
      'mail.user': 'user',
      'mail.pass': 'pass',
      'mail.from': 'from',
      'mail.auth': 'auth',
      'mail.starttlsEnable': 'starttlsEnable',
      'mail.sslEnable': 'sslEnable',
      'mail.timeout': 'timeout',
      'mail.connectionTimeout': 'connectionTimeout'
    };

    res.rows.forEach((item: any) => {
      const key = configMap[item.configKey];
      if (key) {
        // 处理数字类型
        let value: any;
        if (['port', 'timeout', 'connectionTimeout'].includes(key)) {
          value = Number(item.configValue) || (defaultData[key] as number);
        } else {
          value = item.configValue || (defaultData[key] as string);
        }
        formData[key] = value;
        originalData[key] = value; // 保存原始值
        configIds[key] = item.configId;
        // 保存配置描述
        if (item.configDescription) {
          configDescriptions[key] = item.configDescription;
        }
        // 保存默认值
        if (item.defaultValue) {
          if (['port', 'timeout', 'connectionTimeout'].includes(key)) {
            defaultData[key] = Number(item.defaultValue) || (defaultData[key] as number);
          } else {
            defaultData[key] = item.defaultValue || (defaultData[key] as string);
          }
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
  const changedItems: string[] = [];

  try {
    const configMap: Record<string, { key: string; name: string }> = {
      enabled: { key: 'mail.enabled', name: '邮箱功能开关' },
      host: { key: 'mail.host', name: 'SMTP服务器' },
      port: { key: 'mail.port', name: 'SMTP端口' },
      user: { key: 'mail.user', name: '邮箱账号' },
      pass: { key: 'mail.pass', name: '邮箱密码' },
      from: { key: 'mail.from', name: '发件人地址' },
      auth: { key: 'mail.auth', name: '是否需要认证' },
      starttlsEnable: { key: 'mail.starttlsEnable', name: '使用STARTTLS' },
      sslEnable: { key: 'mail.sslEnable', name: '使用SSL' },
      timeout: { key: 'mail.timeout', name: 'SMTP超时' },
      connectionTimeout: { key: 'mail.connectionTimeout', name: '连接超时' }
    };

    // 只更新改变的配置项
    for (const [key, value] of Object.entries(formData)) {
      const config = configMap[key];
      if (!config) continue;

      // 检查值是否改变
      if (value === originalData[key]) {
        continue; // 值未改变，跳过
      }

      changedItems.push(config.name);

      try {
        await updateConfigByKey(config.key, String(value));
        successItems.push(config.name);
        originalData[key] = value; // 更新原始值
      } catch (error) {
        console.error(`保存 ${config.name} 失败:`, error);
        failedItems.push(config.name);
      }
    }

    // 根据结果显示不同的提示
    if (changedItems.length === 0) {
      proxy?.$modal.msgInfo('没有配置项发生变化');
      settingFormRef.value?.exitEditMode();
    } else if (failedItems.length === 0) {
      proxy?.$modal.msgSuccess(`成功保存 ${successItems.length} 项配置`);
      settingFormRef.value?.exitEditMode();
      showMoreConfig.value = false;
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
.email-config-container {
  max-width: 800px;
}

.more-config {
  padding-top: 16px;
}
</style>

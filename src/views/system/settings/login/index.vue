<template>
  <div class="login-config-container">
    <SettingForm
      ref="settingFormRef"
      :default-data="defaultData"
      :form-data="formData"
      :loading="loading"
      :rules="rules"
      title="登录配置"
      @cancel="handleCancel"
      @reset="handleReset"
      @save="handleSave"
      @reset-default="handleResetToDefault"
    >
      <template #default="{ isEditing }">
        <!-- 验证码功能开关 -->
        <el-form-item label="验证码功能" prop="enabled" required>
          <el-switch
            v-model="formData.enabled"
            :disabled="!isEditing"
            active-text="启用"
            inactive-text="禁用"
          />
          <el-text v-if="configDescriptions.enabled" class="w-full" size="small" type="info">
            {{ configDescriptions.enabled }}
          </el-text>
        </el-form-item>

        <!-- 验证码类型 -->
        <el-form-item label="验证码类型" prop="type" required>
          <el-select
            v-model="formData.type"
            :disabled="!isEditing || !formData.enabled"
            placeholder="请选择验证码类型"
            style="width: 100%"
          >
            <el-option label="数学运算" value="MATH" />
            <el-option label="字符验证码" value="CHAR" />
          </el-select>
          <el-text v-if="configDescriptions.type" class="w-full" size="small" type="info">
            {{ configDescriptions.type }}
          </el-text>
        </el-form-item>

        <!-- 验证码类别 -->
        <el-form-item label="验证码类别" prop="category" required>
          <el-select
            v-model="formData.category"
            :disabled="!isEditing || !formData.enabled"
            placeholder="请选择验证码类别"
            style="width: 100%"
          >
            <el-option label="线段干扰" value="LINE" />
            <el-option label="圆圈干扰" value="CIRCLE" />
            <el-option label="扭曲干扰" value="SHEAR" />
          </el-select>
          <el-text v-if="configDescriptions.category" class="w-full" size="small" type="info">
            {{ configDescriptions.category }}
          </el-text>
        </el-form-item>

        <!-- 数字验证码位数 -->
        <el-form-item
          v-if="formData.type === 'MATH'"
          label="数字验证码位数"
          prop="numberLength"
          required
        >
          <el-input-number
            v-model.number="formData.numberLength"
            :disabled="!isEditing || !formData.enabled"
            :min="1"
            :max="2"
            controls-position="right"
          />
          <el-text v-if="configDescriptions.numberLength" class="w-full" size="small" type="info">
            {{ configDescriptions.numberLength }}
          </el-text>
        </el-form-item>

        <!-- 字符验证码长度 -->
        <el-form-item
          v-if="formData.type === 'CHAR'"
          label="字符验证码长度"
          prop="charLength"
          required
        >
          <el-input-number
            v-model.number="formData.charLength"
            :disabled="!isEditing || !formData.enabled"
            :min="4"
            :max="6"
            controls-position="right"
          />
          <el-text v-if="configDescriptions.charLength" class="w-full" size="small" type="info">
            {{ configDescriptions.charLength }}
          </el-text>
        </el-form-item>

        <!-- 字符间距 -->
        <el-form-item label="字符间距" prop="charSpace">
          <el-input-number
            v-model.number="formData.charSpace"
            :disabled="!isEditing || !formData.enabled"
            :min="1"
            :max="10"
            controls-position="right"
          />
          <el-text type="info">字符之间的间距（像素）</el-text>
        </el-form-item>

        <!-- 字体列表 -->
        <el-form-item label="字体列表" prop="fontNames">
          <el-input
            v-model="formData.fontNames"
            :disabled="!isEditing || !formData.enabled"
            placeholder="多个字体用逗号分隔"
          />
          <el-text type="info">例如：Arial,Verdana,Tahoma,Georgia</el-text>
        </el-form-item>

        <!-- 字符集 -->
        <el-form-item label="字符集" prop="charString">
          <el-input
            v-model="formData.charString"
            :disabled="!isEditing || !formData.enabled"
            placeholder="验证码使用的字符"
          />
          <el-text type="info">已去除容易混淆的字符（如0O、1lI等）</el-text>
        </el-form-item>

        <!-- 是否有边框 -->
        <el-form-item label="是否有边框" prop="border">
          <el-switch
            v-model="formData.border"
            :disabled="!isEditing || !formData.enabled"
          />
        </el-form-item>

        <!-- 图片宽度 -->
        <el-form-item label="图片宽度" prop="width">
          <el-input-number
            v-model.number="formData.width"
            :disabled="!isEditing || !formData.enabled"
            :min="100"
            :max="300"
            controls-position="right"
          />
          <el-text type="info">像素</el-text>
        </el-form-item>

        <!-- 图片高度 -->
        <el-form-item label="图片高度" prop="height">
          <el-input-number
            v-model.number="formData.height"
            :disabled="!isEditing || !formData.enabled"
            :min="40"
            :max="100"
            controls-position="right"
          />
          <el-text type="info">像素</el-text>
        </el-form-item>

        <!-- 配置说明 -->
        <el-divider />
        <el-alert
          title="配置说明"
          type="info"
          :closable="false"
          description="
            • 验证码功能：控制登录时是否需要输入验证码
            • 验证码类型：MATH为数学运算验证码，CHAR为字符验证码
            • 验证码类别：LINE为线段干扰，CIRCLE为圆圈干扰，SHEAR为扭曲干扰
            • 数字验证码位数：数学运算中数字的位数（1-2位）
            • 字符验证码长度：字符验证码的字符数量（4-6位）
            • 字符间距：字符之间的间距，影响验证码宽度
            • 字体列表：验证码使用的字体，多个字体随机选择
            • 字符集：验证码可用字符，建议去除易混淆字符
            • 是否有边框：验证码图片是否显示边框
            • 图片尺寸：验证码图片的宽度和高度
          "
        />
      </template>
    </SettingForm>
  </div>
</template>

<script lang="ts" setup name="LoginSettings">
import SettingForm from '@/components/SettingForm/index.vue';
import { listConfig, updateConfigByKey } from '@/api/system/config';
import { ConfigQuery } from '@/api/system/config/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const settingFormRef = ref();
const loading = ref(false);

// 表单数据
const formData = reactive({
  enabled: true,
  type: 'MATH',
  category: 'LINE',
  numberLength: 1,
  charLength: 4,
  charSpace: 5,
  fontNames: 'Arial,Verdana,Tahoma,Georgia',
  charString: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  border: false,
  width: 160,
  height: 60
});

// 配置描述映射（从后端获取）
const configDescriptions = reactive({
  enabled: '',
  type: '',
  category: '',
  numberLength: '',
  charLength: '',
  charSpace: '',
  fontNames: '',
  charString: '',
  border: '',
  width: '',
  height: ''
});

// 默认数据（从后端defaultValue字段获取）
const defaultData = reactive({
  enabled: true,
  type: 'MATH',
  category: 'LINE',
  numberLength: 1,
  charLength: 4,
  charSpace: 5,
  fontNames: 'Arial,Verdana,Tahoma,Georgia',
  charString: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  border: false,
  width: 160,
  height: 60
});

// 配置ID映射
const configIds: Record<string, number> = {};

// 原始数据（用于对比是否改变）
const originalData = reactive({
  enabled: true,
  type: 'MATH',
  category: 'LINE',
  numberLength: 1,
  charLength: 4,
  charSpace: 5,
  fontNames: 'Arial,Verdana,Tahoma,Georgia',
  charString: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  border: false,
  width: 160,
  height: 60
});

// 表单验证规则
const rules = {
  enabled: [{ required: true, message: '请选择是否启用验证码', trigger: 'change' }],
  type: [{ required: true, message: '请选择验证码类型', trigger: 'change' }],
  category: [{ required: true, message: '请选择验证码类别', trigger: 'change' }],
  numberLength: [
    { required: true, message: '请输入数字验证码位数', trigger: 'blur' },
    { type: 'number', min: 1, max: 2, message: '数字验证码位数应在1-2之间', trigger: 'blur' }
  ],
  charLength: [
    { required: true, message: '请输入字符验证码长度', trigger: 'blur' },
    { type: 'number', min: 4, max: 6, message: '字符验证码长度应在4-6之间', trigger: 'blur' }
  ],
  charSpace: [{ required: true, message: '请输入字符间距', trigger: 'blur' }],
  fontNames: [{ required: true, message: '请输入字体列表', trigger: 'blur' }],
  charString: [{ required: true, message: '请输入字符集', trigger: 'blur' }],
  border: [{ required: true, message: '请选择是否有边框', trigger: 'change' }],
  width: [{ required: true, message: '请输入图片宽度', trigger: 'blur' }],
  height: [{ required: true, message: '请输入图片高度', trigger: 'blur' }]
};

// 加载配置
const loadConfig = async () => {
  loading.value = true;
  try {
    const res = await listConfig({
      pageNum: 1,
      pageSize: 100,
      configCategory: 'login'
    } as ConfigQuery);

    if (res.rows && res.rows.length > 0) {
      res.rows.forEach((item: any) => {
        const key = item.configKey.replace('captcha.', '');
        if (key in formData) {
          // 保存配置ID
          configIds[key] = item.configId;

          // 保存配置描述
          configDescriptions[key] = item.configDescription;

          // 保存默认值
          if (item.defaultValue) {
            if (key === 'enabled' || key === 'border') {
              defaultData[key] = item.defaultValue === 'true';
            } else if (['numberLength', 'charLength', 'charSpace', 'width', 'height'].includes(key)) {
              defaultData[key] = Number(item.defaultValue);
            } else {
              defaultData[key] = item.defaultValue;
            }
          }

          // 设置当前值
          let value: any;
          if (key === 'enabled' || key === 'border') {
            value = item.configValue === 'true';
          } else if (['numberLength', 'charLength', 'charSpace', 'width', 'height'].includes(key)) {
            value = Number(item.configValue);
          } else {
            value = item.configValue;
          }
          formData[key] = value;
          originalData[key] = value; // 保存原始值
        }
      });
    }
  } catch (error) {
    console.error('加载配置失败:', error);
    proxy?.$modal.msgError('加载配置失败');
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
      enabled: { key: 'captcha.enabled', name: '验证码功能开关' },
      type: { key: 'captcha.type', name: '验证码类型' },
      category: { key: 'captcha.category', name: '验证码类别' },
      numberLength: { key: 'captcha.numberLength', name: '数字验证码位数' },
      charLength: { key: 'captcha.charLength', name: '字符验证码长度' },
      charSpace: { key: 'captcha.charSpace', name: '验证码字符间距' },
      fontNames: { key: 'captcha.fontNames', name: '验证码字体列表' },
      charString: { key: 'captcha.charString', name: '验证码字符集' },
      border: { key: 'captcha.border', name: '验证码是否有边框' },
      width: { key: 'captcha.width', name: '验证码图片宽度' },
      height: { key: 'captcha.height', name: '验证码图片高度' }
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
      await loadConfig();
    } else if (successItems.length === 0) {
      proxy?.$modal.msgError('保存失败，所有配置项都未能更新');
    } else {
      proxy?.$modal.msgWarning(
        `部分配置保存失败：${failedItems.join('、')}。已成功保存：${successItems.join('、')}`
      );
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
.login-config-container {
  max-width: 800px;
}
</style>

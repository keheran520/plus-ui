<template>
  <div class="website-config-container">
    <!-- 左侧表单区域 -->
    <div class="form-section">
      <SettingForm
        ref="settingFormRef"
        :default-data="defaultData"
        :form-data="formData"
        :loading="loading"
        :rules="rules"
        title="网站配置"
        @cancel="handleCancel"
        @reset="handleReset"
        @save="handleSave"
        @reset-default="handleResetToDefault"
      >
        <template #default="{ isEditing }">
          <!-- 系统LOGO -->
          <el-form-item label="系统LOGO" prop="logo">
            <el-text v-if="configDescriptions.logo" class="w-full" size="small" type="info">{{ configDescriptions.logo }} </el-text>
            <ImageUpload
              v-model="formData.logo"
              :disabled="!isEditing"
              :file-size="2"
              :file-type="['png', 'jpg', 'jpeg', 'svg']"
              :limit="1"
              @upload-success="handleLogoUpload"
            />
          </el-form-item>

          <!-- 系统图标 -->
          <el-form-item label="系统图标" prop="favicon">
            <el-text v-if="configDescriptions.favicon" class="w-full" size="small" type="info">
              {{ configDescriptions.favicon }}
            </el-text>
            <ImageUpload
              v-model="formData.favicon"
              :disabled="!isEditing"
              :file-size="2"
              :file-type="['png', 'jpg', 'jpeg', 'ico']"
              :limit="1"
              @upload-success="handleFaviconUpload"
            />
          </el-form-item>

          <!-- 系统名称 -->
          <el-form-item label="系统名称" prop="name" required>
            <el-input v-model="formData.name" clearable maxlength="50" placeholder="请输入系统名称" show-word-limit />
            <el-text v-if="configDescriptions.name" class="w-full" size="small" type="info">{{ configDescriptions.name }} </el-text>
          </el-form-item>

          <!-- 系统描述 -->
          <el-form-item label="系统描述" prop="description">
            <el-input v-model="formData.description" :rows="3" maxlength="200" placeholder="请输入系统描述" show-word-limit type="textarea" />
            <el-text v-if="configDescriptions.description" class="w-full" size="small" type="info">
              {{ configDescriptions.description }}
            </el-text>
          </el-form-item>

          <!-- 版权声明 -->
          <el-form-item label="版权声明" prop="copyright" required>
            <el-input v-model="formData.copyright" :rows="2" maxlength="200" placeholder="请输入版权声明" show-word-limit type="textarea" />
            <el-text v-if="configDescriptions.copyright" class="w-full" size="small" type="info">
              {{ configDescriptions.copyright }}
            </el-text>
          </el-form-item>

          <!-- 备案号 -->
          <el-form-item label="备案号" prop="icp">
            <el-input v-model="formData.icp" clearable maxlength="50" placeholder="请输入ICP备案号" />
            <el-text v-if="configDescriptions.icp" class="w-full" size="small" type="info">{{ configDescriptions.icp }} </el-text>
          </el-form-item>

          <!-- 更多配置折叠面板 -->
          <el-divider content-position="left">
            <el-switch v-model="showMoreConfig" active-text="更多配置" />
          </el-divider>

          <el-collapse-transition>
            <div v-show="showMoreConfig" class="more-config">
              <!-- 网站关键词 -->
              <el-form-item label="网站关键词" prop="keywords">
                <el-input
                  v-model="formData.keywords"
                  :rows="2"
                  maxlength="200"
                  placeholder="请输入网站关键词，多个关键词用逗号分隔"
                  show-word-limit
                  type="textarea"
                />
                <el-text v-if="configDescriptions.keywords" class="w-full" size="small" type="info">
                  {{ configDescriptions.keywords }}
                </el-text>
              </el-form-item>

              <!-- 网站作者 -->
              <el-form-item label="网站作者" prop="author">
                <el-input v-model="formData.author" clearable maxlength="50" placeholder="请输入网站作者" />
                <el-text v-if="configDescriptions.author" class="w-full" size="small" type="info">
                  {{ configDescriptions.author }}
                </el-text>
              </el-form-item>

              <!-- 联系邮箱 -->
              <el-form-item label="联系邮箱" prop="email">
                <el-input v-model="formData.email" clearable maxlength="100" placeholder="请输入联系邮箱" />
                <el-text v-if="configDescriptions.email" class="w-full" size="small" type="info">
                  {{ configDescriptions.email }}
                </el-text>
              </el-form-item>

              <!-- 联系电话 -->
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="formData.phone" clearable maxlength="20" placeholder="请输入联系电话" />
                <el-text v-if="configDescriptions.phone" class="w-full" size="small" type="info">
                  {{ configDescriptions.phone }}
                </el-text>
              </el-form-item>

              <!-- 公司地址 -->
              <el-form-item label="公司地址" prop="address">
                <el-input v-model="formData.address" clearable maxlength="200" placeholder="请输入公司地址" />
                <el-text v-if="configDescriptions.address" class="w-full" size="small" type="info">
                  {{ configDescriptions.address }}
                </el-text>
              </el-form-item>
            </div>
          </el-collapse-transition>
        </template>
      </SettingForm>
    </div>

    <!-- 右侧预览区域（PC端） -->
    <div class="preview-section desktop-preview">
      <div class="preview-title">配置预览</div>
      <div class="preview-container">
        <div class="preview-header">
          <img v-if="logoUrl" :src="logoUrl" alt="系统LOGO" class="preview-logo" />
          <span v-else class="text-gray-400">暂无LOGO</span>
        </div>
        <div class="preview-content">
          <h2 class="text-2xl font-bold mb-2">{{ formData.name || '系统名称' }}</h2>
          <p class="text-gray-600 mb-4">{{ formData.description || '系统描述' }}</p>
          <div class="preview-info">
            <div v-if="formData.email" class="info-item">
              <el-icon>
                <Message />
              </el-icon>
              <span>{{ formData.email }}</span>
            </div>
            <div v-if="formData.phone" class="info-item">
              <el-icon>
                <Phone />
              </el-icon>
              <span>{{ formData.phone }}</span>
            </div>
            <div v-if="formData.address" class="info-item">
              <el-icon>
                <Location />
              </el-icon>
              <span>{{ formData.address }}</span>
            </div>
          </div>
        </div>
        <div class="preview-footer">
          <p>{{ formData.copyright || '版权声明' }}</p>
          <p v-if="formData.icp">{{ formData.icp }}</p>
        </div>
      </div>
    </div>

    <!-- 底部预览区域（移动端） -->
    <div class="preview-section mobile-preview">
      <el-divider content-position="left">配置预览</el-divider>
      <div class="preview-container">
        <div class="preview-header">
          <img v-if="logoUrl" :src="logoUrl" alt="系统LOGO" class="preview-logo" />
          <span v-else class="text-gray-400">暂无LOGO</span>
        </div>
        <div class="preview-content">
          <h2 class="text-2xl font-bold mb-2">{{ formData.name || '系统名称' }}</h2>
          <p class="text-gray-600 mb-4">{{ formData.description || '系统描述' }}</p>
          <div class="preview-info">
            <div v-if="formData.email" class="info-item">
              <el-icon>
                <Message />
              </el-icon>
              <span>{{ formData.email }}</span>
            </div>
            <div v-if="formData.phone" class="info-item">
              <el-icon>
                <Phone />
              </el-icon>
              <span>{{ formData.phone }}</span>
            </div>
            <div v-if="formData.address" class="info-item">
              <el-icon>
                <Location />
              </el-icon>
              <span>{{ formData.address }}</span>
            </div>
          </div>
        </div>
        <div class="preview-footer">
          <p>{{ formData.copyright || '版权声明' }}</p>
          <p v-if="formData.icp">{{ formData.icp }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SettingForm from '@/components/SettingForm/index.vue';
import ImageUpload from '@/components/ImageUpload/index.vue';
import { listConfig, updateConfig, updateConfigByKey } from '@/api/system/config';
import { ConfigQuery } from '@/api/system/config/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const settingFormRef = ref();
const loading = ref(false);
const showMoreConfig = ref(false);

// 表单数据
const formData = reactive({
  logo: '',
  favicon: '',
  name: '',
  description: '',
  copyright: '',
  icp: '',
  keywords: '',
  author: '',
  email: '',
  phone: '',
  address: ''
});

// 配置描述映射（从后端获取）
const configDescriptions = reactive({
  logo: '',
  favicon: '',
  name: '',
  description: '',
  copyright: '',
  icp: '',
  keywords: '',
  author: '',
  email: '',
  phone: '',
  address: ''
});

// 默认数据（从后端defaultValue字段获取）
const defaultData = reactive({
  logo: '',
  favicon: '',
  name: '',
  description: '',
  copyright: '',
  icp: '',
  keywords: '',
  author: '',
  email: '',
  phone: '',
  address: ''
});

// 配置ID映射
const configIds = reactive({
  logo: null as number | null,
  favicon: null as number | null,
  name: null as number | null,
  description: null as number | null,
  copyright: null as number | null,
  icp: null as number | null,
  keywords: null as number | null,
  author: null as number | null,
  email: null as number | null,
  phone: null as number | null,
  address: null as number | null
});

// LOGO URL（用于预览）
const logoUrl = ref('');
const faviconUrl = ref('');

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
  copyright: [{ required: true, message: '请输入版权声明', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }]
};

// 加载配置数据
const loadConfig = async () => {
  loading.value = true;
  try {
    const res = await listConfig({
      pageNum: 1,
      pageSize: 100,
      configCategory: 'website'
    } as ConfigQuery);

    const configMap: Record<string, string> = {
      'website.logo': 'logo',
      'website.favicon': 'favicon',
      'website.name': 'name',
      'website.description': 'description',
      'website.copyright': 'copyright',
      'website.icp': 'icp',
      'website.keywords': 'keywords',
      'website.author': 'author',
      'website.email': 'email',
      'website.phone': 'phone',
      'website.address': 'address'
    };

    res.rows.forEach((item: any) => {
      const key = configMap[item.configKey];
      if (key) {
        formData[key] = item.configValue || '';
        configIds[key] = item.configId;
        // 保存配置描述
        if (item.configDescription) {
          configDescriptions[key] = item.configDescription;
        }
        // 保存默认值
        if (item.defaultValue) {
          defaultData[key] = item.defaultValue;
        }
      }
    });

    // 如果有logo和favicon的ossId，需要转换为URL用于预览
    if (formData.logo) {
      logoUrl.value = await getImageUrl(formData.logo);
    }
    if (formData.favicon) {
      faviconUrl.value = await getImageUrl(formData.favicon);
    }
  } catch (error) {
    console.error('加载配置失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取图片URL
const getImageUrl = async (ossId: string) => {
  if (ossId.startsWith('http')) {
    return ossId;
  }
  try {
    const { listByIds } = await import('@/api/system/oss');
    const res = await listByIds(ossId);
    return res.data[0]?.url || '';
  } catch {
    return '';
  }
};

// LOGO上传成功
const handleLogoUpload = (data: any) => {
  logoUrl.value = data.url;
  formData.logo = data.ossId;
};

// 图标上传成功
const handleFaviconUpload = (data: any) => {
  faviconUrl.value = data.url;
  formData.favicon = data.ossId;
};

// 保存配置
const handleSave = async () => {
  loading.value = true;
  const failedItems: string[] = [];
  const successItems: string[] = [];

  try {
    const configMap: Record<string, { key: string; name: string }> = {
      logo: { key: 'website.logo', name: '系统LOGO' },
      favicon: { key: 'website.favicon', name: '系统图标' },
      name: { key: 'website.name', name: '系统名称' },
      description: { key: 'website.description', name: '系统描述' },
      copyright: { key: 'website.copyright', name: '版权声明' },
      icp: { key: 'website.icp', name: '备案号' },
      keywords: { key: 'website.keywords', name: '网站关键词' },
      author: { key: 'website.author', name: '网站作者' },
      email: { key: 'website.email', name: '联系邮箱' },
      phone: { key: 'website.phone', name: '联系电话' },
      address: { key: 'website.address', name: '公司地址' }
    };

    // 使用 updateConfigByKey 接口逐个更新，便于追踪错误
    for (const [key, value] of Object.entries(formData)) {
      const config = configMap[key];
      if (!config) continue;

      try {
        await updateConfigByKey(config.key, value);
        successItems.push(config.name);
      } catch (error) {
        console.error(`保存 ${config.name} 失败:`, error);
        failedItems.push(config.name);
      }
    }

    // 根据结果显示不同的提示
    if (failedItems.length === 0) {
      showMoreConfig.value = false;
      proxy?.$modal.msgSuccess('保存成功');
      settingFormRef.value?.exitEditMode();
      await loadConfig();
    } else if (successItems.length === 0) {
      proxy?.$modal.msgError('保存失败，所有配置项都未能更新');
    } else {
      proxy?.$modal.msgWarning(`部分配置保存失败：${failedItems.join('、')}。已成功保存：${successItems.join('、')}`);
      // 即使部分失败，也重新加载配置以显示最新状态
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
.website-config-container {
  display: flex;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 1200px) {
    flex-direction: column;
  }
}

.form-section {
  flex: 1;
  min-width: 0;
}

.more-config {
  padding-top: 16px;
}

.preview-section {
  &.desktop-preview {
    width: 380px;
    flex-shrink: 0;
    position: sticky;
    top: 20px;

    @media (max-width: 1200px) {
      display: none;
    }
  }

  &.mobile-preview {
    display: none;
    width: 100%;

    @media (max-width: 1200px) {
      display: block;
    }
  }
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
}

.preview-container {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 24px;
  background: var(--el-fill-color-blank);
}

.preview-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color);
  margin-bottom: 16px;
}

.preview-logo {
  height: 40px;
  object-fit: contain;
}

.preview-content {
  padding: 16px 0;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);

  .el-icon {
    color: var(--el-color-primary);
  }
}

.preview-footer {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color);
  margin-top: 16px;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;

  p {
    margin: 4px 0;
  }
}
</style>

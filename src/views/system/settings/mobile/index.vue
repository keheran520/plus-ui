<template>
  <div class="mobile-config-container">
    <div class="form-section">
      <SettingForm
        ref="settingFormRef"
        :default-data="defaultData"
        :form-data="formData"
        :loading="loading"
        :rules="rules"
        title="C端配置"
        @cancel="handleCancel"
        @reset="handleReset"
        @save="handleSave"
        @reset-default="handleResetToDefault"
      >
        <template #default="{ isEditing }">
          <el-form-item label="移动端 Logo" prop="logo">
            <ImageUpload
              v-model="formData.logo"
              :disabled="!isEditing"
              :file-size="2"
              :file-type="['png', 'jpg', 'jpeg', 'svg']"
              :limit="1"
              @upload-success="handleLogoUpload"
            />
          </el-form-item>

          <el-form-item label="首页背景图" prop="homeBanner">
            <ImageUpload
              v-model="formData.homeBanner"
              :disabled="!isEditing"
              :file-size="5"
              :file-type="['png', 'jpg', 'jpeg', 'webp']"
              :limit="1"
              @upload-success="handleHomeBannerUpload"
            />
          </el-form-item>

          <el-form-item v-for="field in allFields" :key="field.key" :label="field.label" :prop="field.key">
            <el-input
              v-model="formData[field.key]"
              :type="field.type || 'text'"
              :rows="field.rows"
              :maxlength="field.maxlength"
              :placeholder="field.placeholder"
              :show-word-limit="field.type === 'textarea'"
              clearable
            />
          </el-form-item>
        </template>
      </SettingForm>
    </div>

    <div class="preview-section">
      <div class="preview-title">C端预览</div>
      <div class="preview-phone">
        <img v-if="logoUrl" :src="logoUrl" alt="logo" class="preview-phone__logo" />
        <div class="preview-phone__title">{{ formData.appName || '移动端名称' }}</div>
        <div class="preview-phone__desc">{{ formData.appDesc || '移动端描述' }}</div>
        <div class="preview-phone__notice">{{ formData.noticeText || '这里显示首页公告文案' }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue'
import type { ComponentInternalInstance } from 'vue'
import SettingForm from '@/components/SettingForm/index.vue'
import ImageUpload from '@/components/ImageUpload/index.vue'
import { listConfig, updateConfigByKey } from '@/api/system/config'
import type { ConfigQuery } from '@/api/system/config/types'

type FieldKey =
  | 'logo'
  | 'homeBanner'
  | 'appName'
  | 'appDesc'
  | 'noticeText'
  | 'searchPlaceholder'
  | 'serviceTitle'
  | 'memberTitle'
  | 'memberDesc'
  | 'walletDesc'
  | 'checkinDesc'
  | 'aboutTitle'
  | 'aboutContent'
  | 'helpTitle'
  | 'helpContent'
  | 'userAgreement'
  | 'privacyPolicy'
  | 'notificationGuide'

type FieldItem = {
  key: FieldKey
  label: string
  placeholder: string
  maxlength: number
  type?: 'text' | 'textarea'
  rows?: number
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const settingFormRef = ref()
const loading = ref(false)
const logoUrl = ref('')

const allFields: FieldItem[] = [
  { key: 'appName', label: '应用名称', placeholder: '请输入应用名称', maxlength: 50 },
  { key: 'appDesc', label: '应用描述', placeholder: '请输入应用描述', maxlength: 200, type: 'textarea', rows: 3 },
  { key: 'noticeText', label: '首页公告', placeholder: '请输入首页公告文案', maxlength: 300, type: 'textarea', rows: 3 },
  { key: 'searchPlaceholder', label: '搜索占位文案', placeholder: '请输入搜索框占位文案', maxlength: 80 },
  { key: 'serviceTitle', label: '服务区标题', placeholder: '请输入服务区标题', maxlength: 80 },
  { key: 'memberTitle', label: '会员区标题', placeholder: '请输入会员区标题', maxlength: 80 },
  { key: 'memberDesc', label: '会员区描述', placeholder: '请输入会员区描述', maxlength: 200, type: 'textarea', rows: 3 },
  { key: 'walletDesc', label: '钱包说明', placeholder: '请输入钱包说明', maxlength: 200, type: 'textarea', rows: 3 },
  { key: 'checkinDesc', label: '签到说明', placeholder: '请输入签到说明', maxlength: 200, type: 'textarea', rows: 3 },
  { key: 'aboutTitle', label: '关于我们标题', placeholder: '请输入关于我们标题', maxlength: 100 },
  { key: 'aboutContent', label: '关于我们内容', placeholder: '请输入关于我们内容', maxlength: 1000, type: 'textarea', rows: 4 },
  { key: 'helpTitle', label: '帮助中心标题', placeholder: '请输入帮助中心标题', maxlength: 100 },
  { key: 'helpContent', label: '帮助中心内容', placeholder: '请输入帮助中心内容', maxlength: 1000, type: 'textarea', rows: 4 },
  { key: 'userAgreement', label: '用户协议', placeholder: '请输入用户协议内容', maxlength: 20000, type: 'textarea', rows: 8 },
  { key: 'privacyPolicy', label: '隐私政策', placeholder: '请输入隐私政策内容', maxlength: 20000, type: 'textarea', rows: 8 },
  { key: 'notificationGuide', label: '通知指引', placeholder: '请输入通知指引内容', maxlength: 500, type: 'textarea', rows: 3 }
]

const fieldKeys = allFields.map((item) => item.key).concat(['logo', 'homeBanner'] as FieldKey[])

function createFieldState() {
  return fieldKeys.reduce(
    (result, key) => {
      result[key] = ''
      return result
    },
    {} as Record<FieldKey, string>
  )
}

const formData = reactive(createFieldState())
const originalData = reactive(createFieldState())
const defaultData = reactive(createFieldState())

const rules = {
  appName: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
}

const configKeyMap = computed<Record<FieldKey, string>>(() => ({
  logo: 'mobile.logo',
  homeBanner: 'mobile.homeBanner',
  appName: 'mobile.appName',
  appDesc: 'mobile.appDesc',
  noticeText: 'mobile.noticeText',
  searchPlaceholder: 'mobile.searchPlaceholder',
  serviceTitle: 'mobile.serviceTitle',
  memberTitle: 'mobile.memberTitle',
  memberDesc: 'mobile.memberDesc',
  walletDesc: 'mobile.walletDesc',
  checkinDesc: 'mobile.checkinDesc',
  aboutTitle: 'mobile.aboutTitle',
  aboutContent: 'mobile.aboutContent',
  helpTitle: 'mobile.helpTitle',
  helpContent: 'mobile.helpContent',
  userAgreement: 'mobile.userAgreement',
  privacyPolicy: 'mobile.privacyPolicy',
  notificationGuide: 'mobile.notificationGuide'
}))

const reverseKeyMap = computed(() =>
  Object.entries(configKeyMap.value).reduce(
    (result, [field, key]) => {
      result[key] = field as FieldKey
      return result
    },
    {} as Record<string, FieldKey>
  )
)

async function getImageUrl(value: string) {
  if (!value) return ''
  if (value.startsWith('http')) return value
  try {
    const { listByIds } = await import('@/api/system/oss')
    const res = await listByIds(value)
    return res.data?.[0]?.url || ''
  } catch {
    return ''
  }
}

async function syncPreview() {
  logoUrl.value = await getImageUrl(formData.logo)
}

async function loadConfig() {
  loading.value = true
  try {
    const res = await listConfig({
      pageNum: 1,
      pageSize: 100,
      configCategory: 'mobile'
    } as ConfigQuery)

    fieldKeys.forEach((key) => {
      formData[key] = ''
      originalData[key] = ''
      defaultData[key] = ''
    })

    ;(res.rows || []).forEach((item: any) => {
      const field = reverseKeyMap.value[item.configKey]
      if (!field) return
      formData[field] = item.configValue || ''
      originalData[field] = item.configValue || ''
      defaultData[field] = item.defaultValue || ''
    })

    await syncPreview()
  } finally {
    loading.value = false
  }
}

function handleLogoUpload(data: any) {
  formData.logo = String(data.ossId || '')
  logoUrl.value = data.url || ''
}

function handleHomeBannerUpload(data: any) {
  formData.homeBanner = String(data.ossId || '')
}

async function handleSave() {
  loading.value = true
  try {
    const changedKeys = fieldKeys.filter((key) => formData[key] !== originalData[key])
    if (!changedKeys.length) {
      proxy?.$modal.msgInfo('未检测到变更')
      settingFormRef.value?.exitEditMode?.()
      return
    }

    for (const key of changedKeys) {
      await updateConfigByKey(configKeyMap.value[key], formData[key])
      originalData[key] = formData[key]
    }

    proxy?.$modal.msgSuccess(`已保存 ${changedKeys.length} 项配置`)
    settingFormRef.value?.exitEditMode?.()
    await syncPreview()
  } catch (error) {
    console.error('save mobile config failed', error)
    proxy?.$modal.msgError('保存失败')
  } finally {
    loading.value = false
  }
}

function handleReset() {
  loadConfig()
}

function handleCancel() {}

function handleResetToDefault() {
  proxy?.$modal
    .confirm('确认恢复默认值吗？')
    .then(() => {
      Object.assign(formData, defaultData)
      proxy?.$modal.msgSuccess('已恢复默认值，保存后生效。')
    })
    .catch(() => {})
}

onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
.mobile-config-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 20px;
}

.form-section,
.preview-section {
  min-height: 100%;
}

.preview-section {
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(180deg, #f3f7ff 0%, #ffffff 100%);
  box-shadow: 0 8px 24px rgba(59, 91, 168, 0.08);
}

.preview-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #1f2d3d;
}

.preview-phone {
  padding: 24px 20px;
  border-radius: 28px;
  background: linear-gradient(145deg, #1b2f57 0%, #355ea4 46%, #76aaff 100%);
  color: #fff;
}

.preview-phone__logo {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.14);
}

.preview-phone__title {
  margin-top: 18px;
  font-size: 22px;
  font-weight: 700;
}

.preview-phone__desc {
  margin-top: 10px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.78);
}

.preview-phone__notice {
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  line-height: 1.6;
}
</style>

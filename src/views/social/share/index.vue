<template>
  <div class="p-2">
    <!-- 搜索区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="never">
          <el-form ref="queryRef" :inline="true" :model="queryParams">
            <el-form-item label="内容类型" prop="targetType">
              <el-select v-model="queryParams.targetType" clearable placeholder="请选择内容类型" style="width: 150px">
                <el-option label="图片" value="image" />
                <el-option label="相册" value="album" />
                <el-option label="文章" value="article" />
                <el-option label="视频" value="video" />
              </el-select>
            </el-form-item>
            <el-form-item label="内容ID" prop="targetId">
              <el-input v-model="queryParams.targetId" clearable placeholder="请输入内容ID" style="width: 150px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="queryParams.userId" clearable placeholder="请输入用户ID" style="width: 150px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="转发类型" prop="shareType">
              <el-select v-model="queryParams.shareType" clearable placeholder="请选择转发类型" style="width: 150px">
                <el-option label="站内转发" value="internal" />
                <el-option label="微信" value="wechat" />
                <el-option label="QQ" value="qq" />
                <el-option label="微博" value="weibo" />
                <el-option label="复制链接" value="link" />
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="dateRange"
                end-placeholder="结束日期"
                range-separator="-"
                start-placeholder="开始日期"
                style="width: 240px"
                type="daterange"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item>
              <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <!-- 操作按钮和表格区域 -->
    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:share:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
              批量删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:share:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="shareList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" fixed type="selection" width="50" />
        <el-table-column align="center" label="转发ID" prop="shareId" width="100" />
        <el-table-column align="center" label="内容类型" prop="targetType" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.targetType === 'image'" type="success">图片</el-tag>
            <el-tag v-else-if="row.targetType === 'album'" type="primary">相册</el-tag>
            <el-tag v-else-if="row.targetType === 'article'" type="warning">文章</el-tag>
            <el-tag v-else>{{ row.targetType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="内容ID" prop="targetId" width="120" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="内容标题" min-width="200" prop="targetTitle" />
        <el-table-column align="center" label="用户ID" prop="userId" width="100" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="用户昵称" prop="nickName" width="150">
          <template #default="{ row }">
            {{ row.nickName || row.userName || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="转发类型" prop="shareType" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.shareType === 'internal'" type="primary">站内转发</el-tag>
            <el-tag v-else-if="row.shareType === 'wechat'" type="success">微信</el-tag>
            <el-tag v-else-if="row.shareType === 'qq'" type="info">QQ</el-tag>
            <el-tag v-else-if="row.shareType === 'weibo'" type="danger">微博</el-tag>
            <el-tag v-else-if="row.shareType === 'link'" type="warning">复制链接</el-tag>
            <el-tag v-else>{{ row.shareType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="转发内容" prop="shareContent" width="200">
          <template #default="{ row }">
            {{ row.shareContent || '-' }}
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="转发给" prop="shareToUserName" width="150">
          <template #default="{ row }">
            {{ row.shareToUserName || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" sortable width="180" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="100">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:share:remove']" icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { delSocialShare, listSocialShare } from '@/api/social/share'
import type { SocialShareQuery, SocialShareVO } from '@/api/social/share/types'

const { proxy } = getCurrentInstance() as any

const shareList = ref<SocialShareVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<Array<string | number>>([])
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<[string, string]>()

const queryParams = ref<SocialShareQuery>({
  pageNum: 1,
  pageSize: 10,
  targetType: undefined,
  targetId: undefined,
  userId: undefined,
  shareType: undefined
})

/** 查询转发列表 */
function getList() {
  loading.value = true
  const params = proxy.addDateRange(queryParams.value, dateRange.value)
  listSocialShare(params)
    .then((response: any) => {
      shareList.value = response.rows
      total.value = response.total
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = undefined
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: SocialShareVO[]) {
  ids.value = selection.map((item) => item.shareId)
  multiple.value = !selection.length
}

/** 删除按钮操作 */
function handleDelete(row?: SocialShareVO) {
  const shareIds = row ? [row.shareId] : ids.value
  proxy.$modal
    .confirm('确认删除选中的转发记录吗？')
    .then(() => {
      return delSocialShare(shareIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'social/share/export',
    {
      ...queryParams.value
    },
    `share_${new Date().getTime()}.xlsx`
  )
}

getList()
</script>

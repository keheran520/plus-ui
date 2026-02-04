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
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" clearable placeholder="请选择状态" style="width: 120px">
                <el-option label="正常" value="0" />
                <el-option label="已删除" value="1" />
                <el-option label="已屏蔽" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="评论内容" prop="content">
              <el-input v-model="queryParams.content" clearable placeholder="请输入关键词" style="width: 200px" @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['social:comment:edit']" :disabled="multiple" icon="Check" plain type="success" @click="handleBatchAudit('0')">
              批量通过
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:comment:edit']" :disabled="multiple" icon="Hide" plain type="warning" @click="handleBatchAudit('2')">
              批量屏蔽
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:comment:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()">
              批量删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['social:comment:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="commentList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" fixed type="selection" width="50" />
        <el-table-column align="center" label="评论ID" prop="commentId" width="100" />
        <el-table-column align="center" label="内容类型" prop="targetType" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.targetType === 'image'" type="success">图片</el-tag>
            <el-tag v-else-if="row.targetType === 'album'" type="primary">相册</el-tag>
            <el-tag v-else-if="row.targetType === 'article'" type="warning">文章</el-tag>
            <el-tag v-else>{{ row.targetType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="内容ID" prop="targetId" width="100" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="用户" prop="nickName" width="150">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; justify-content: center">
              <el-avatar :size="24" :src="row.avatar" />
              <span style="margin-left: 8px">{{ row.nickName || row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="评论内容" min-width="300" prop="content">
          <template #default="{ row }">
            <span v-if="row.replyToUserName" style="color: #409eff; margin-right: 4px">回复 @{{ row.replyToUserName }}: </span>
            {{ row.content }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="点赞数" prop="likeCount" sortable width="90" />
        <el-table-column align="center" label="回复数" prop="replyCount" sortable width="90" />
        <el-table-column align="center" label="状态" prop="status" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status === '0'" type="success">正常</el-tag>
            <el-tag v-else-if="row.status === '1'" type="info">已删除</el-tag>
            <el-tag v-else-if="row.status === '2'" type="danger">已屏蔽</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="设备" prop="deviceType" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.deviceType === 'pc'" size="small">PC</el-tag>
            <el-tag v-else-if="row.deviceType === 'app'" size="small" type="success">APP</el-tag>
            <el-tag v-else-if="row.deviceType === 'xcx'" size="small" type="warning">小程序</el-tag>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="IP地址" prop="ipAddress" width="130" />
        <el-table-column align="center" label="创建时间" prop="createTime" sortable width="180" />
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="200">
          <template #default="{ row }">
            <el-button v-hasPermi="['social:comment:query']" icon="View" link type="primary" @click="handleView(row)">详情</el-button>
            <el-button v-if="row.status !== '0'" v-hasPermi="['social:comment:edit']" icon="Check" link type="success" @click="handleAudit(row, '0')">
              通过
            </el-button>
            <el-button v-if="row.status !== '2'" v-hasPermi="['social:comment:edit']" icon="Hide" link type="warning" @click="handleAudit(row, '2')">
              屏蔽
            </el-button>
            <el-button v-hasPermi="['social:comment:remove']" icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 评论详情对话框 -->
    <el-dialog v-model="viewDialogVisible" append-to-body title="评论详情" width="800px">
      <el-descriptions v-if="currentComment" :column="2" border>
        <el-descriptions-item label="评论ID">{{ currentComment.commentId }}</el-descriptions-item>
        <el-descriptions-item label="内容类型">
          <el-tag v-if="currentComment.targetType === 'image'" type="success">图片</el-tag>
          <el-tag v-else-if="currentComment.targetType === 'album'" type="primary">相册</el-tag>
          <el-tag v-else>{{ currentComment.targetType }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="内容ID">{{ currentComment.targetId }}</el-descriptions-item>
        <el-descriptions-item label="内容标题">{{ currentComment.targetTitle || '-' }}</el-descriptions-item>
        <el-descriptions-item label="评论用户">
          <div style="display: flex; align-items: center">
            <el-avatar :size="32" :src="currentComment.avatar" />
            <span style="margin-left: 8px">{{ currentComment.nickName || currentComment.userName }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentComment.userId }}</el-descriptions-item>
        <el-descriptions-item :span="2" label="评论内容">
          <div style="line-height: 1.6; padding: 8px 0">
            <span v-if="currentComment.replyToUserName" style="color: #409eff; font-weight: bold; margin-right: 4px">
              回复 @{{ currentComment.replyToUserName }}:
            </span>
            {{ currentComment.content }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="点赞数">{{ currentComment.likeCount }}</el-descriptions-item>
        <el-descriptions-item label="回复数">{{ currentComment.replyCount }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="currentComment.status === '0'" type="success">正常</el-tag>
          <el-tag v-else-if="currentComment.status === '1'" type="info">已删除</el-tag>
          <el-tag v-else-if="currentComment.status === '2'" type="danger">已屏蔽</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ currentComment.deviceType }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentComment.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentComment.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { delSocialComment, getSocialComment, listSocialComment, auditComment, batchAuditComment } from '@/api/social/comment'
import type { SocialCommentQuery, SocialCommentVO } from '@/api/social/comment/types'

const { proxy } = getCurrentInstance() as any

const commentList = ref<SocialCommentVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<Array<string | number>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<[string, string]>()
const viewDialogVisible = ref(false)
const currentComment = ref<SocialCommentVO>()

const queryParams = ref<SocialCommentQuery>({
  pageNum: 1,
  pageSize: 10,
  targetType: undefined,
  targetId: undefined,
  userId: undefined,
  status: undefined,
  content: undefined
})

/** 查询评论列表 */
function getList() {
  loading.value = true
  const params = proxy.addDateRange(queryParams.value, dateRange.value)
  listSocialComment(params)
    .then((response: any) => {
      commentList.value = response.rows
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
function handleSelectionChange(selection: SocialCommentVO[]) {
  ids.value = selection.map((item) => item.commentId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 查看详情 */
async function handleView(row: SocialCommentVO) {
  try {
    const res = await getSocialComment(row.commentId)
    currentComment.value = res.data
    viewDialogVisible.value = true
  } catch (error) {
    console.error('获取评论详情失败:', error)
  }
}

/** 审核评论 */
function handleAudit(row: SocialCommentVO, status: string) {
  const statusText = status === '0' ? '通过' : '屏蔽'
  proxy.$modal
    .confirm(`确认${statusText}该评论吗？`)
    .then(() => {
      // 调用审核接口
      return auditComment(row.commentId, status)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess(`${statusText}成功`)
    })
    .catch(() => {})
}

/** 批量审核 */
function handleBatchAudit(status: string) {
  const statusText = status === '0' ? '通过' : '屏蔽'
  proxy.$modal
    .confirm(`确认批量${statusText}选中的评论吗？`)
    .then(() => {
      // 调用批量审核接口
      return batchAuditComment(ids.value, status)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess(`批量${statusText}成功`)
    })
    .catch(() => {})
}

/** 删除按钮操作 */
function handleDelete(row?: SocialCommentVO) {
  const commentIds = row ? [row.commentId] : ids.value
  proxy.$modal
    .confirm('确认删除选中的评论吗？')
    .then(() => {
      return delSocialComment(commentIds)
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
    'social/comment/export',
    {
      ...queryParams.value
    },
    `comment_${new Date().getTime()}.xlsx`
  )
}

getList()
</script>

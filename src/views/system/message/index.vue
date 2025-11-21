<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :inline="true" :model="queryParams">
            <el-form-item label="消息类型" prop="messageType">
              <el-select v-model="queryParams.messageType" clearable placeholder="请选择消息类型">
                <el-option v-for="dict in sys_message_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="消息标题" prop="messageTitle">
              <el-input v-model="queryParams.messageTitle" clearable placeholder="请输入消息标题" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="通知范围" prop="messageScope">
              <el-select v-model="queryParams.messageScope" clearable placeholder="请选择通知范围">
                <el-option v-for="dict in sys_notice_scope" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="queryParams.priority" clearable placeholder="请选择优先级">
                <el-option v-for="dict in sys_message_priority" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:message:add']" icon="Plus" plain type="primary" @click="handleAdd">新增 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:message:publish']" :disabled="multiple" icon="Position" plain type="warning" @click="handleBatchPublish()"
              >批量发布
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:message:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()"
              >删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:message:export']" icon="Download" plain type="info" @click="handleExport"> 导出 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="messageList" border @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column v-if="false" align="center" label="消息ID" prop="messageId" />
        <el-table-column align="center" label="消息类型" prop="messageType" width="100">
          <template #default="scope">
            <dict-tag :options="sys_message_type" :value="scope.row.messageType" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="消息标题" min-width="200" prop="messageTitle" show-overflow-tooltip />
        <el-table-column align="center" label="通知范围" prop="messageScope" width="100">
          <template #default="scope">
            <dict-tag :options="sys_notice_scope" :value="scope.row.messageScope" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="优先级" prop="priority" width="100">
          <template #default="scope">
            <dict-tag :options="sys_message_priority" :value="scope.row.priority" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="发送状态" prop="sendStatus" width="100">
          <template #default="scope">
            <dict-tag :options="sys_send_status" :value="scope.row.sendStatus" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="发送时间" prop="sendTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.sendTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="已读人数" prop="readCount" width="100" />
        <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-tooltip v-if="scope.row.sendStatus === 'pending'" content="编辑" placement="top">
              <el-button v-hasPermi="['system:message:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip v-else content="查看" placement="top">
              <el-button icon="View" link type="info" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
            <!-- 只有发送中状态不显示发布按钮 -->
            <el-tooltip v-if="scope.row.sendStatus !== 'sending'" :content="scope.row.sendStatus === 'pending' ? '发布' : '重新发布'" placement="top">
              <el-button v-hasPermi="['system:message:publish']" icon="Position" link type="success" @click="handlePublish(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['system:message:remove']" icon="Delete" link type="danger" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>
  </div>
</template>

<script lang="ts" name="Message" setup>
import { listMessage, getMessage, delMessage, addMessage, updateMessage, publishMessage, batchPublishMessage, saveDraft, getMessageLogCount } from '@/api/system/message';
import { MessageForm, MessageQuery, MessageVO } from '@/api/system/message/types';
import { useRouter, useRoute } from 'vue-router';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const route = useRoute();
const { sys_message_type, sys_message_priority, sys_notice_scope, sys_send_status } = toRefs<any>(
  proxy?.useDict('sys_message_type', 'sys_message_priority', 'sys_notice_scope', 'sys_send_status')
);

const messageList = ref<MessageVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

const data = reactive<PageData<MessageForm, MessageQuery>>({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    messageType: undefined,
    messageTitle: undefined,
    messageContent: undefined,
    messageScope: undefined,
    priority: undefined,
    params: {}
  },
  rules: {}
});

const { queryParams } = toRefs(data);

/** 查询系统消息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listMessage(queryParams.value);
  messageList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: MessageVO[]) => {
  ids.value = selection.map((item) => item.messageId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ path: '/system/message/edit', query: { type: 'add' } });
};

/** 修改按钮操作 */
const handleUpdate = async (row?: MessageVO) => {
  const _messageId = row?.messageId || ids.value[0];
  router.push({ path: '/system/message/edit', query: { id: _messageId, type: 'edit' } });
};

/** 查看按钮操作 */
const handleView = async (row: MessageVO) => {
  router.push({ path: '/system/message/edit', query: { id: row.messageId, type: 'view' } });
};

/** 发布按钮操作 */
const handlePublish = async (row: MessageVO) => {
  // 根据状态显示不同的提示
  const confirmMsg =
    row.sendStatus === 'pending'
      ? '确认发布该消息吗？'
      : row.sendStatus === 'failed'
        ? '该消息之前发送失败，确认重新发布吗？'
        : '确认重新发布该消息吗？';

  await proxy?.$modal.confirm(confirmMsg);
  await publishMessage(row.messageId);
  proxy?.$modal.msgSuccess('发布成功');
  await getList();
};

/** 批量发布按钮操作 */
const handleBatchPublish = async () => {
  const _messageIds = ids.value;
  await proxy?.$modal.confirm('确认批量发布选中的消息吗？发布后将无法修改！');
  await batchPublishMessage(_messageIds);
  proxy?.$modal.msgSuccess('批量发布成功');
  await getList();
};

/** 删除按钮操作 */
const handleDelete = async (row?: MessageVO) => {
  const _messageIds = Array.isArray(row?.messageId) ? row.messageId : row?.messageId ? [row.messageId] : ids.value;
  
  try {
    // 获取消息的日志数量
    const { data: logCount } = await getMessageLogCount(_messageIds);
    
    // 构建确认消息
    let confirmMsg = `是否确认删除选中的 ${_messageIds.length} 条消息？`;
    if (logCount > 0) {
      confirmMsg += `\n\n该消息共有 ${logCount} 条发送日志记录，将一并删除。`;
    }
    
    await proxy?.$modal.confirm(confirmMsg, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    loading.value = true;
    await delMessage(_messageIds);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
  } catch (error) {
    console.error('删除失败:', error);
  } finally {
    loading.value = false;
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'system/message/export',
    {
      ...queryParams.value
    },
    `message_${new Date().getTime()}.xlsx`
  );
};

// 监听路由query变化，当从编辑页面返回时刷新列表
watch(
  () => route.query.t,
  (newVal) => {
    if (newVal) {
      getList();
    }
  }
);

onMounted(() => {
  getList();
});
</script>

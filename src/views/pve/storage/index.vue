<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="所属节点ID" prop="nodeId">
              <el-input v-model="queryParams.nodeId" placeholder="请输入所属节点ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="存储名称" prop="storageName">
              <el-input v-model="queryParams.storageName" placeholder="请输入存储名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="PVE存储标识" prop="pveStorageId">
              <el-input v-model="queryParams.pveStorageId" placeholder="请输入PVE存储标识" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="路径" prop="path">
              <el-input v-model="queryParams.path" placeholder="请输入路径" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="服务器地址" prop="server">
              <el-input v-model="queryParams.server" placeholder="请输入服务器地址" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="导出路径(NFS)" prop="export">
              <el-input v-model="queryParams.export" placeholder="请输入导出路径(NFS)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="共享名(CIFS)" prop="share">
              <el-input v-model="queryParams.share" placeholder="请输入共享名(CIFS)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户名(CIFS/NFS等需要认证的存储)" prop="username">
              <el-input v-model="queryParams.username" placeholder="请输入用户名(CIFS/NFS等需要认证的存储)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="密码(加密)" prop="password">
              <el-input v-model="queryParams.password" placeholder="请输入密码(加密)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="门户地址(iSCSI)" prop="portal">
              <el-input v-model="queryParams.portal" placeholder="请输入门户地址(iSCSI)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="目标名称(iSCSI)" prop="target">
              <el-input v-model="queryParams.target" placeholder="请输入目标名称(iSCSI)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="池名称(Ceph RBD)" prop="pool">
              <el-input v-model="queryParams.pool" placeholder="请输入池名称(Ceph RBD)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="内容类型(逗号分隔: images,iso,backup等)" prop="contentTypes">
              <el-input v-model="queryParams.contentTypes" placeholder="请输入内容类型(逗号分隔: images,iso,backup等)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="是否启用(0:禁用 1:启用)" prop="enabled">
              <el-input v-model="queryParams.enabled" placeholder="请输入是否启用(0:禁用 1:启用)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="总容量(字节)" prop="totalSize">
              <el-input v-model="queryParams.totalSize" placeholder="请输入总容量(字节)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="已使用(字节)" prop="usedSize">
              <el-input v-model="queryParams.usedSize" placeholder="请输入已使用(字节)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="可用容量(字节)" prop="availableSize">
              <el-input v-model="queryParams.availableSize" placeholder="请输入可用容量(字节)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input v-model="queryParams.description" placeholder="请输入描述" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['pve:storage:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['pve:storage:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['pve:storage:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['pve:storage:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="storageList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="存储ID" align="center" prop="storageId" v-if="true" />
        <el-table-column label="所属节点ID" align="center" prop="nodeId" />
        <el-table-column label="存储名称" align="center" prop="storageName" />
        <el-table-column label="PVE存储标识" align="center" prop="pveStorageId" />
        <el-table-column label="存储类型(dir/lvm/lvmthin/zfspool/nfs/cifs/iscsi/rbd/glusterfs)" align="center" prop="storageType" />
        <el-table-column label="路径" align="center" prop="path" />
        <el-table-column label="服务器地址" align="center" prop="server" />
        <el-table-column label="导出路径(NFS)" align="center" prop="export" />
        <el-table-column label="共享名(CIFS)" align="center" prop="share" />
        <el-table-column label="用户名(CIFS/NFS等需要认证的存储)" align="center" prop="username" />
        <el-table-column label="密码(加密)" align="center" prop="password" />
        <el-table-column label="门户地址(iSCSI)" align="center" prop="portal" />
        <el-table-column label="目标名称(iSCSI)" align="center" prop="target" />
        <el-table-column label="池名称(Ceph RBD)" align="center" prop="pool" />
        <el-table-column label="内容类型(逗号分隔: images,iso,backup等)" align="center" prop="contentTypes" />
        <el-table-column label="是否启用(0:禁用 1:启用)" align="center" prop="enabled" />
        <el-table-column label="总容量(字节)" align="center" prop="totalSize" />
        <el-table-column label="已使用(字节)" align="center" prop="usedSize" />
        <el-table-column label="可用容量(字节)" align="center" prop="availableSize" />
        <el-table-column label="描述" align="center" prop="description" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['pve:storage:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['pve:storage:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改PVE存储对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="storageFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属节点ID" prop="nodeId">
          <el-input v-model="form.nodeId" placeholder="请输入所属节点ID" />
        </el-form-item>
        <el-form-item label="存储名称" prop="storageName">
          <el-input v-model="form.storageName" placeholder="请输入存储名称" />
        </el-form-item>
        <el-form-item label="PVE存储标识" prop="pveStorageId">
          <el-input v-model="form.pveStorageId" placeholder="请输入PVE存储标识" />
        </el-form-item>
        <el-form-item label="路径" prop="path">
            <el-input v-model="form.path" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="服务器地址" prop="server">
          <el-input v-model="form.server" placeholder="请输入服务器地址" />
        </el-form-item>
        <el-form-item label="导出路径(NFS)" prop="export">
            <el-input v-model="form.export" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="共享名(CIFS)" prop="share">
          <el-input v-model="form.share" placeholder="请输入共享名(CIFS)" />
        </el-form-item>
        <el-form-item label="用户名(CIFS/NFS等需要认证的存储)" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名(CIFS/NFS等需要认证的存储)" />
        </el-form-item>
        <el-form-item label="密码(加密)" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码(加密)" />
        </el-form-item>
        <el-form-item label="门户地址(iSCSI)" prop="portal">
          <el-input v-model="form.portal" placeholder="请输入门户地址(iSCSI)" />
        </el-form-item>
        <el-form-item label="目标名称(iSCSI)" prop="target">
          <el-input v-model="form.target" placeholder="请输入目标名称(iSCSI)" />
        </el-form-item>
        <el-form-item label="池名称(Ceph RBD)" prop="pool">
          <el-input v-model="form.pool" placeholder="请输入池名称(Ceph RBD)" />
        </el-form-item>
        <el-form-item label="内容类型(逗号分隔: images,iso,backup等)" prop="contentTypes">
          <el-input v-model="form.contentTypes" placeholder="请输入内容类型(逗号分隔: images,iso,backup等)" />
        </el-form-item>
        <el-form-item label="是否启用(0:禁用 1:启用)" prop="enabled">
          <el-input v-model="form.enabled" placeholder="请输入是否启用(0:禁用 1:启用)" />
        </el-form-item>
        <el-form-item label="总容量(字节)" prop="totalSize">
          <el-input v-model="form.totalSize" placeholder="请输入总容量(字节)" />
        </el-form-item>
        <el-form-item label="已使用(字节)" prop="usedSize">
          <el-input v-model="form.usedSize" placeholder="请输入已使用(字节)" />
        </el-form-item>
        <el-form-item label="可用容量(字节)" prop="availableSize">
          <el-input v-model="form.availableSize" placeholder="请输入可用容量(字节)" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Storage" lang="ts">
import { listStorage, getStorage, delStorage, addStorage, updateStorage } from '@/api/pve/storage';
import { StorageVO, StorageQuery, StorageForm } from '@/api/pve/storage/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const storageList = ref<StorageVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const storageFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: StorageForm = {
  storageId: undefined,
  nodeId: undefined,
  storageName: undefined,
  pveStorageId: undefined,
  storageType: undefined,
  path: undefined,
  server: undefined,
  export: undefined,
  share: undefined,
  username: undefined,
  password: undefined,
  portal: undefined,
  target: undefined,
  pool: undefined,
  contentTypes: undefined,
  enabled: undefined,
  totalSize: undefined,
  usedSize: undefined,
  availableSize: undefined,
  description: undefined,
}
const data = reactive<PageData<StorageForm, StorageQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    nodeId: undefined,
    storageName: undefined,
    pveStorageId: undefined,
    storageType: undefined,
    path: undefined,
    server: undefined,
    export: undefined,
    share: undefined,
    username: undefined,
    password: undefined,
    portal: undefined,
    target: undefined,
    pool: undefined,
    contentTypes: undefined,
    enabled: undefined,
    totalSize: undefined,
    usedSize: undefined,
    availableSize: undefined,
    description: undefined,
    params: {
    }
  },
  rules: {
    storageId: [
      { required: true, message: "存储ID不能为空", trigger: "blur" }
    ],
    nodeId: [
      { required: true, message: "所属节点ID不能为空", trigger: "blur" }
    ],
    storageName: [
      { required: true, message: "存储名称不能为空", trigger: "blur" }
    ],
    pveStorageId: [
      { required: true, message: "PVE存储标识不能为空", trigger: "blur" }
    ],
    storageType: [
      { required: true, message: "存储类型(dir/lvm/lvmthin/zfspool/nfs/cifs/iscsi/rbd/glusterfs)不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询PVE存储列表 */
const getList = async () => {
  loading.value = true;
  const res = await listStorage(queryParams.value);
  storageList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  storageFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: StorageVO[]) => {
  ids.value = selection.map(item => item.storageId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加PVE存储";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: StorageVO) => {
  reset();
  const _storageId = row?.storageId || ids.value[0]
  const res = await getStorage(_storageId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改PVE存储";
}

/** 提交按钮 */
const submitForm = () => {
  storageFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.storageId) {
        await updateStorage(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addStorage(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: StorageVO) => {
  const _storageIds = row?.storageId || ids.value;
  await proxy?.$modal.confirm('是否确认删除PVE存储编号为"' + _storageIds + '"的数据项？').finally(() => loading.value = false);
  await delStorage(_storageIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('pve/storage/export', {
    ...queryParams.value
  }, `storage_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>

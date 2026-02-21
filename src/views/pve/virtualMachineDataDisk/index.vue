<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="虚拟机ID" prop="vmId">
              <el-input v-model="queryParams.vmId" placeholder="请输入虚拟机ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="磁盘序号(1-10)" prop="diskIndex">
              <el-input v-model="queryParams.diskIndex" placeholder="请输入磁盘序号(1-10)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="磁盘大小(GB)" prop="diskSize">
              <el-input v-model="queryParams.diskSize" placeholder="请输入磁盘大小(GB)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="存储池名称" prop="storagePool">
              <el-input v-model="queryParams.storagePool" placeholder="请输入存储池名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="PVE磁盘标识符(如: scsi1, virtio1等)" prop="pveIdentifier">
              <el-input v-model="queryParams.pveIdentifier" placeholder="请输入PVE磁盘标识符(如: scsi1, virtio1等)" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['pve:virtualMachineDataDisk:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['pve:virtualMachineDataDisk:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['pve:virtualMachineDataDisk:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['pve:virtualMachineDataDisk:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="virtualMachineDataDiskList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="数据盘ID" align="center" prop="diskId" v-if="true" />
        <el-table-column label="虚拟机ID" align="center" prop="vmId" />
        <el-table-column label="磁盘序号(1-10)" align="center" prop="diskIndex" />
        <el-table-column label="磁盘大小(GB)" align="center" prop="diskSize" />
        <el-table-column label="磁盘类型(ssd/hdd)" align="center" prop="diskType" />
        <el-table-column label="存储池名称" align="center" prop="storagePool" />
        <el-table-column label="PVE磁盘标识符(如: scsi1, virtio1等)" align="center" prop="pveIdentifier" />
        <el-table-column label="磁盘状态(creating/active/deleting/error)" align="center" prop="status" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['pve:virtualMachineDataDisk:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['pve:virtualMachineDataDisk:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改虚拟机数据盘对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="virtualMachineDataDiskFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="虚拟机ID" prop="vmId">
          <el-input v-model="form.vmId" placeholder="请输入虚拟机ID" />
        </el-form-item>
        <el-form-item label="磁盘序号(1-10)" prop="diskIndex">
          <el-input v-model="form.diskIndex" placeholder="请输入磁盘序号(1-10)" />
        </el-form-item>
        <el-form-item label="磁盘大小(GB)" prop="diskSize">
          <el-input v-model="form.diskSize" placeholder="请输入磁盘大小(GB)" />
        </el-form-item>
        <el-form-item label="存储池名称" prop="storagePool">
          <el-input v-model="form.storagePool" placeholder="请输入存储池名称" />
        </el-form-item>
        <el-form-item label="PVE磁盘标识符(如: scsi1, virtio1等)" prop="pveIdentifier">
          <el-input v-model="form.pveIdentifier" placeholder="请输入PVE磁盘标识符(如: scsi1, virtio1等)" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="VirtualMachineDataDisk" lang="ts">
import { listVirtualMachineDataDisk, getVirtualMachineDataDisk, delVirtualMachineDataDisk, addVirtualMachineDataDisk, updateVirtualMachineDataDisk } from '@/api/pve/virtualMachineDataDisk';
import { VirtualMachineDataDiskVO, VirtualMachineDataDiskQuery, VirtualMachineDataDiskForm } from '@/api/pve/virtualMachineDataDisk/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const virtualMachineDataDiskList = ref<VirtualMachineDataDiskVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const virtualMachineDataDiskFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: VirtualMachineDataDiskForm = {
  diskId: undefined,
  vmId: undefined,
  diskIndex: undefined,
  diskSize: undefined,
  diskType: undefined,
  storagePool: undefined,
  pveIdentifier: undefined,
  status: undefined,
  remark: undefined,
}
const data = reactive<PageData<VirtualMachineDataDiskForm, VirtualMachineDataDiskQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    vmId: undefined,
    diskIndex: undefined,
    diskSize: undefined,
    diskType: undefined,
    storagePool: undefined,
    pveIdentifier: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    diskId: [
      { required: true, message: "数据盘ID不能为空", trigger: "blur" }
    ],
    vmId: [
      { required: true, message: "虚拟机ID不能为空", trigger: "blur" }
    ],
    diskIndex: [
      { required: true, message: "磁盘序号(1-10)不能为空", trigger: "blur" }
    ],
    diskSize: [
      { required: true, message: "磁盘大小(GB)不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询虚拟机数据盘列表 */
const getList = async () => {
  loading.value = true;
  const res = await listVirtualMachineDataDisk(queryParams.value);
  virtualMachineDataDiskList.value = res.rows;
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
  virtualMachineDataDiskFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: VirtualMachineDataDiskVO[]) => {
  ids.value = selection.map(item => item.diskId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加虚拟机数据盘";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: VirtualMachineDataDiskVO) => {
  reset();
  const _diskId = row?.diskId || ids.value[0]
  const res = await getVirtualMachineDataDisk(_diskId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改虚拟机数据盘";
}

/** 提交按钮 */
const submitForm = () => {
  virtualMachineDataDiskFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.diskId) {
        await updateVirtualMachineDataDisk(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addVirtualMachineDataDisk(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: VirtualMachineDataDiskVO) => {
  const _diskIds = row?.diskId || ids.value;
  await proxy?.$modal.confirm('是否确认删除虚拟机数据盘编号为"' + _diskIds + '"的数据项？').finally(() => loading.value = false);
  await delVirtualMachineDataDisk(_diskIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('pve/virtualMachineDataDisk/export', {
    ...queryParams.value
  }, `virtualMachineDataDisk_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>

<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="IP地址" prop="ipAddress">
              <el-input v-model="queryParams.ipAddress" placeholder="请输入IP地址" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="所属地址池ID" prop="poolId">
              <el-input v-model="queryParams.poolId" placeholder="请输入所属地址池ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="子网掩码" prop="subnetMask">
              <el-input v-model="queryParams.subnetMask" placeholder="请输入子网掩码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="网关" prop="gateway">
              <el-input v-model="queryParams.gateway" placeholder="请输入网关" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="绑定虚拟机ID" prop="vmId">
              <el-input v-model="queryParams.vmId" placeholder="请输入绑定虚拟机ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="线路ID" prop="lineId">
              <el-input v-model="queryParams.lineId" placeholder="请输入线路ID" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['pve:publicIp:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['pve:publicIp:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['pve:publicIp:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['pve:publicIp:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="publicIpList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="IP ID" align="center" prop="ipId" v-if="true" />
        <el-table-column label="IP地址" align="center" prop="ipAddress" />
        <el-table-column label="所属地址池ID" align="center" prop="poolId" />
        <el-table-column label="子网掩码" align="center" prop="subnetMask" />
        <el-table-column label="网关" align="center" prop="gateway" />
        <el-table-column label="使用状态(available/used/reserved)" align="center" prop="status" />
        <el-table-column label="绑定虚拟机ID" align="center" prop="vmId" />
        <el-table-column label="线路ID" align="center" prop="lineId" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['pve:publicIp:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['pve:publicIp:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改公网IP对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="publicIpFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="form.ipAddress" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="所属地址池ID" prop="poolId">
          <el-input v-model="form.poolId" placeholder="请输入所属地址池ID" />
        </el-form-item>
        <el-form-item label="子网掩码" prop="subnetMask">
          <el-input v-model="form.subnetMask" placeholder="请输入子网掩码" />
        </el-form-item>
        <el-form-item label="网关" prop="gateway">
          <el-input v-model="form.gateway" placeholder="请输入网关" />
        </el-form-item>
        <el-form-item label="绑定虚拟机ID" prop="vmId">
          <el-input v-model="form.vmId" placeholder="请输入绑定虚拟机ID" />
        </el-form-item>
        <el-form-item label="线路ID" prop="lineId">
          <el-input v-model="form.lineId" placeholder="请输入线路ID" />
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

<script setup name="PublicIp" lang="ts">
import { listPublicIp, getPublicIp, delPublicIp, addPublicIp, updatePublicIp } from '@/api/pve/publicIp';
import { PublicIpVO, PublicIpQuery, PublicIpForm } from '@/api/pve/publicIp/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const publicIpList = ref<PublicIpVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const publicIpFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PublicIpForm = {
  ipId: undefined,
  ipAddress: undefined,
  poolId: undefined,
  subnetMask: undefined,
  gateway: undefined,
  status: undefined,
  vmId: undefined,
  lineId: undefined,
  remark: undefined,
}
const data = reactive<PageData<PublicIpForm, PublicIpQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ipAddress: undefined,
    poolId: undefined,
    subnetMask: undefined,
    gateway: undefined,
    status: undefined,
    vmId: undefined,
    lineId: undefined,
    params: {
    }
  },
  rules: {
    ipId: [
      { required: true, message: "IP ID不能为空", trigger: "blur" }
    ],
    ipAddress: [
      { required: true, message: "IP地址不能为空", trigger: "blur" }
    ],
    poolId: [
      { required: true, message: "所属地址池ID不能为空", trigger: "blur" }
    ],
    subnetMask: [
      { required: true, message: "子网掩码不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询公网IP列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPublicIp(queryParams.value);
  publicIpList.value = res.rows;
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
  publicIpFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PublicIpVO[]) => {
  ids.value = selection.map(item => item.ipId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加公网IP";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: PublicIpVO) => {
  reset();
  const _ipId = row?.ipId || ids.value[0]
  const res = await getPublicIp(_ipId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改公网IP";
}

/** 提交按钮 */
const submitForm = () => {
  publicIpFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.ipId) {
        await updatePublicIp(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addPublicIp(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: PublicIpVO) => {
  const _ipIds = row?.ipId || ids.value;
  await proxy?.$modal.confirm('是否确认删除公网IP编号为"' + _ipIds + '"的数据项？').finally(() => loading.value = false);
  await delPublicIp(_ipIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('pve/publicIp/export', {
    ...queryParams.value
  }, `publicIp_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>

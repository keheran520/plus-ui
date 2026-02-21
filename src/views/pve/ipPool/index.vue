<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="所属节点ID" prop="nodeId">
              <el-input v-model="queryParams.nodeId" placeholder="请输入所属节点ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="地址池名称" prop="poolName">
              <el-input v-model="queryParams.poolName" placeholder="请输入地址池名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="是否默认地址池(0:否 1:是)" prop="isDefault">
              <el-input v-model="queryParams.isDefault" placeholder="请输入是否默认地址池(0:否 1:是)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="起始IP" prop="startIp">
              <el-input v-model="queryParams.startIp" placeholder="请输入起始IP" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="结束IP" prop="endIp">
              <el-input v-model="queryParams.endIp" placeholder="请输入结束IP" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="子网掩码" prop="subnetMask">
              <el-input v-model="queryParams.subnetMask" placeholder="请输入子网掩码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="网关" prop="gateway">
              <el-input v-model="queryParams.gateway" placeholder="请输入网关" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="DNS服务器" prop="dnsServer">
              <el-input v-model="queryParams.dnsServer" placeholder="请输入DNS服务器" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="VLAN ID" prop="vlanId">
              <el-input v-model="queryParams.vlanId" placeholder="请输入VLAN ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="总IP数量" prop="totalIps">
              <el-input v-model="queryParams.totalIps" placeholder="请输入总IP数量" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="已用IP数量" prop="usedIps">
              <el-input v-model="queryParams.usedIps" placeholder="请输入已用IP数量" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input v-model="queryParams.description" placeholder="请输入描述" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="排序" prop="sort">
              <el-input v-model="queryParams.sort" placeholder="请输入排序" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['pve:ipPool:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['pve:ipPool:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['pve:ipPool:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['pve:ipPool:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="ipPoolList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="地址池ID" align="center" prop="poolId" v-if="true" />
        <el-table-column label="所属节点ID" align="center" prop="nodeId" />
        <el-table-column label="地址池名称" align="center" prop="poolName" />
        <el-table-column label="IP类型(private/public/nat)" align="center" prop="ipType" />
        <el-table-column label="是否默认地址池(0:否 1:是)" align="center" prop="isDefault" />
        <el-table-column label="起始IP" align="center" prop="startIp" />
        <el-table-column label="结束IP" align="center" prop="endIp" />
        <el-table-column label="子网掩码" align="center" prop="subnetMask" />
        <el-table-column label="网关" align="center" prop="gateway" />
        <el-table-column label="DNS服务器" align="center" prop="dnsServer" />
        <el-table-column label="VLAN ID" align="center" prop="vlanId" />
        <el-table-column label="总IP数量" align="center" prop="totalIps" />
        <el-table-column label="已用IP数量" align="center" prop="usedIps" />
        <el-table-column label="描述" align="center" prop="description" />
        <el-table-column label="排序" align="center" prop="sort" />
        <el-table-column label="状态(0:正常 1:停用)" align="center" prop="status" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['pve:ipPool:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['pve:ipPool:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改IP地址池对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="ipPoolFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属节点ID" prop="nodeId">
          <el-input v-model="form.nodeId" placeholder="请输入所属节点ID" />
        </el-form-item>
        <el-form-item label="地址池名称" prop="poolName">
          <el-input v-model="form.poolName" placeholder="请输入地址池名称" />
        </el-form-item>
        <el-form-item label="是否默认地址池(0:否 1:是)" prop="isDefault">
          <el-input v-model="form.isDefault" placeholder="请输入是否默认地址池(0:否 1:是)" />
        </el-form-item>
        <el-form-item label="起始IP" prop="startIp">
          <el-input v-model="form.startIp" placeholder="请输入起始IP" />
        </el-form-item>
        <el-form-item label="结束IP" prop="endIp">
          <el-input v-model="form.endIp" placeholder="请输入结束IP" />
        </el-form-item>
        <el-form-item label="子网掩码" prop="subnetMask">
          <el-input v-model="form.subnetMask" placeholder="请输入子网掩码" />
        </el-form-item>
        <el-form-item label="网关" prop="gateway">
          <el-input v-model="form.gateway" placeholder="请输入网关" />
        </el-form-item>
        <el-form-item label="DNS服务器" prop="dnsServer">
          <el-input v-model="form.dnsServer" placeholder="请输入DNS服务器" />
        </el-form-item>
        <el-form-item label="VLAN ID" prop="vlanId">
          <el-input v-model="form.vlanId" placeholder="请输入VLAN ID" />
        </el-form-item>
        <el-form-item label="总IP数量" prop="totalIps">
          <el-input v-model="form.totalIps" placeholder="请输入总IP数量" />
        </el-form-item>
        <el-form-item label="已用IP数量" prop="usedIps">
          <el-input v-model="form.usedIps" placeholder="请输入已用IP数量" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" />
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

<script setup name="IpPool" lang="ts">
import { listIpPool, getIpPool, delIpPool, addIpPool, updateIpPool } from '@/api/pve/ipPool';
import { IpPoolVO, IpPoolQuery, IpPoolForm } from '@/api/pve/ipPool/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const ipPoolList = ref<IpPoolVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const ipPoolFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: IpPoolForm = {
  poolId: undefined,
  nodeId: undefined,
  poolName: undefined,
  ipType: undefined,
  isDefault: undefined,
  startIp: undefined,
  endIp: undefined,
  subnetMask: undefined,
  gateway: undefined,
  dnsServer: undefined,
  vlanId: undefined,
  totalIps: undefined,
  usedIps: undefined,
  description: undefined,
  sort: undefined,
  status: undefined,
}
const data = reactive<PageData<IpPoolForm, IpPoolQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    nodeId: undefined,
    poolName: undefined,
    ipType: undefined,
    isDefault: undefined,
    startIp: undefined,
    endIp: undefined,
    subnetMask: undefined,
    gateway: undefined,
    dnsServer: undefined,
    vlanId: undefined,
    totalIps: undefined,
    usedIps: undefined,
    description: undefined,
    sort: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    poolId: [
      { required: true, message: "地址池ID不能为空", trigger: "blur" }
    ],
    nodeId: [
      { required: true, message: "所属节点ID不能为空", trigger: "blur" }
    ],
    poolName: [
      { required: true, message: "地址池名称不能为空", trigger: "blur" }
    ],
    ipType: [
      { required: true, message: "IP类型(private/public/nat)不能为空", trigger: "change" }
    ],
    startIp: [
      { required: true, message: "起始IP不能为空", trigger: "blur" }
    ],
    endIp: [
      { required: true, message: "结束IP不能为空", trigger: "blur" }
    ],
    subnetMask: [
      { required: true, message: "子网掩码不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询IP地址池列表 */
const getList = async () => {
  loading.value = true;
  const res = await listIpPool(queryParams.value);
  ipPoolList.value = res.rows;
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
  ipPoolFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: IpPoolVO[]) => {
  ids.value = selection.map(item => item.poolId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加IP地址池";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: IpPoolVO) => {
  reset();
  const _poolId = row?.poolId || ids.value[0]
  const res = await getIpPool(_poolId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改IP地址池";
}

/** 提交按钮 */
const submitForm = () => {
  ipPoolFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.poolId) {
        await updateIpPool(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addIpPool(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: IpPoolVO) => {
  const _poolIds = row?.poolId || ids.value;
  await proxy?.$modal.confirm('是否确认删除IP地址池编号为"' + _poolIds + '"的数据项？').finally(() => loading.value = false);
  await delIpPool(_poolIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('pve/ipPool/export', {
    ...queryParams.value
  }, `ipPool_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>

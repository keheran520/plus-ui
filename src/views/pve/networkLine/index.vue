<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="线路名称" prop="lineName">
              <el-input v-model="queryParams.lineName" placeholder="请输入线路名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="ISP运营商" prop="isp">
              <el-input v-model="queryParams.isp" placeholder="请输入ISP运营商" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="带宽(Mbps)" prop="bandwidth">
              <el-input v-model="queryParams.bandwidth" placeholder="请输入带宽(Mbps)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="机房位置" prop="location">
              <el-input v-model="queryParams.location" placeholder="请输入机房位置" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="月租费用" prop="monthlyFee">
              <el-input v-model="queryParams.monthlyFee" placeholder="请输入月租费用" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="流量费用(元/GB)" prop="trafficFee">
              <el-input v-model="queryParams.trafficFee" placeholder="请输入流量费用(元/GB)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="IP数量" prop="ipCount">
              <el-input v-model="queryParams.ipCount" placeholder="请输入IP数量" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="已用IP数量" prop="usedIpCount">
              <el-input v-model="queryParams.usedIpCount" placeholder="请输入已用IP数量" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['pve:networkLine:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['pve:networkLine:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['pve:networkLine:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['pve:networkLine:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="networkLineList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="线路ID" align="center" prop="lineId" v-if="true" />
        <el-table-column label="线路名称" align="center" prop="lineName" />
        <el-table-column label="线路类型(BGP/CN2/GIA等)" align="center" prop="lineType" />
        <el-table-column label="ISP运营商" align="center" prop="isp" />
        <el-table-column label="带宽(Mbps)" align="center" prop="bandwidth" />
        <el-table-column label="线路状态(0:正常 1:停用)" align="center" prop="status" />
        <el-table-column label="机房位置" align="center" prop="location" />
        <el-table-column label="月租费用" align="center" prop="monthlyFee" />
        <el-table-column label="流量费用(元/GB)" align="center" prop="trafficFee" />
        <el-table-column label="IP数量" align="center" prop="ipCount" />
        <el-table-column label="已用IP数量" align="center" prop="usedIpCount" />
        <el-table-column label="描述" align="center" prop="description" />
        <el-table-column label="排序" align="center" prop="sort" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['pve:networkLine:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['pve:networkLine:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改线路管理对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="networkLineFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="线路名称" prop="lineName">
          <el-input v-model="form.lineName" placeholder="请输入线路名称" />
        </el-form-item>
        <el-form-item label="ISP运营商" prop="isp">
          <el-input v-model="form.isp" placeholder="请输入ISP运营商" />
        </el-form-item>
        <el-form-item label="带宽(Mbps)" prop="bandwidth">
          <el-input v-model="form.bandwidth" placeholder="请输入带宽(Mbps)" />
        </el-form-item>
        <el-form-item label="机房位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入机房位置" />
        </el-form-item>
        <el-form-item label="月租费用" prop="monthlyFee">
          <el-input v-model="form.monthlyFee" placeholder="请输入月租费用" />
        </el-form-item>
        <el-form-item label="流量费用(元/GB)" prop="trafficFee">
          <el-input v-model="form.trafficFee" placeholder="请输入流量费用(元/GB)" />
        </el-form-item>
        <el-form-item label="IP数量" prop="ipCount">
          <el-input v-model="form.ipCount" placeholder="请输入IP数量" />
        </el-form-item>
        <el-form-item label="已用IP数量" prop="usedIpCount">
          <el-input v-model="form.usedIpCount" placeholder="请输入已用IP数量" />
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

<script setup name="NetworkLine" lang="ts">
import { listNetworkLine, getNetworkLine, delNetworkLine, addNetworkLine, updateNetworkLine } from '@/api/pve/networkLine';
import { NetworkLineVO, NetworkLineQuery, NetworkLineForm } from '@/api/pve/networkLine/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const networkLineList = ref<NetworkLineVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const networkLineFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: NetworkLineForm = {
  lineId: undefined,
  lineName: undefined,
  lineType: undefined,
  isp: undefined,
  bandwidth: undefined,
  status: undefined,
  location: undefined,
  monthlyFee: undefined,
  trafficFee: undefined,
  ipCount: undefined,
  usedIpCount: undefined,
  description: undefined,
  sort: undefined,
}
const data = reactive<PageData<NetworkLineForm, NetworkLineQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    lineName: undefined,
    lineType: undefined,
    isp: undefined,
    bandwidth: undefined,
    status: undefined,
    location: undefined,
    monthlyFee: undefined,
    trafficFee: undefined,
    ipCount: undefined,
    usedIpCount: undefined,
    description: undefined,
    sort: undefined,
    params: {
    }
  },
  rules: {
    lineId: [
      { required: true, message: "线路ID不能为空", trigger: "blur" }
    ],
    lineName: [
      { required: true, message: "线路名称不能为空", trigger: "blur" }
    ],
    lineType: [
      { required: true, message: "线路类型(BGP/CN2/GIA等)不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询线路管理列表 */
const getList = async () => {
  loading.value = true;
  const res = await listNetworkLine(queryParams.value);
  networkLineList.value = res.rows;
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
  networkLineFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: NetworkLineVO[]) => {
  ids.value = selection.map(item => item.lineId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加线路管理";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: NetworkLineVO) => {
  reset();
  const _lineId = row?.lineId || ids.value[0]
  const res = await getNetworkLine(_lineId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改线路管理";
}

/** 提交按钮 */
const submitForm = () => {
  networkLineFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.lineId) {
        await updateNetworkLine(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addNetworkLine(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: NetworkLineVO) => {
  const _lineIds = row?.lineId || ids.value;
  await proxy?.$modal.confirm('是否确认删除线路管理编号为"' + _lineIds + '"的数据项？').finally(() => loading.value = false);
  await delNetworkLine(_lineIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('pve/networkLine/export', {
    ...queryParams.value
  }, `networkLine_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>

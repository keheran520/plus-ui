<template>
  <div class="mall-page">
    <el-card class="panel" shadow="never">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>订单管理</h3>
            <p>保持原商城订单主表语义，状态和退款方式统一走系统字典。</p>
          </div>
        </div>
      </template>

      <el-form ref="queryRef" :inline="true" :model="queryParams">
        <el-form-item label="订单编号">
          <el-input v-model="queryParams.orderSn" clearable placeholder="请输入订单编号" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="queryParams.userId" clearable placeholder="请输入用户ID" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="queryParams.orderStatus" clearable placeholder="请选择订单状态" style="width: 180px">
            <el-option v-for="dict in mall_order_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="收货人">
          <el-input v-model="queryParams.consignee" clearable placeholder="请输入收货人" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="panel" shadow="never">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>订单列表</h3>
            <p>先满足后台订单维护，再逐步接支付、发货和退款流程。</p>
          </div>
          <div class="toolbar">
            <el-button v-hasPermi="['mall:order:add']" type="primary" icon="Plus" @click="handleAdd">新增订单</el-button>
            <el-button v-hasPermi="['mall:order:remove']" :disabled="multiple" icon="Delete" @click="handleDelete()">批量删除</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="orderList" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column label="订单编号" prop="orderSn" min-width="160" />
        <el-table-column label="用户ID" prop="userId" width="100" />
        <el-table-column label="收货人" prop="consignee" width="120" />
        <el-table-column label="手机号" prop="mobile" width="130" />
        <el-table-column label="订单状态" width="110">
          <template #default="{ row }">
            <dict-tag :options="mall_order_status" :value="row.orderStatus" />
          </template>
        </el-table-column>
        <el-table-column label="订单金额" width="120">
          <template #default="{ row }">￥{{ Number(row.orderPrice || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="实付金额" width="120">
          <template #default="{ row }">￥{{ Number(row.actualPrice || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="退款方式" width="110">
          <template #default="{ row }">
            <dict-tag :options="mall_refund_type" :value="row.refundType" />
          </template>
        </el-table-column>
        <el-table-column label="地址" prop="address" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-hasPermi="['mall:order:edit']" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button v-hasPermi="['mall:order:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-drawer v-model="open" :title="title" size="760px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="订单编号">
          <el-input v-model="form.orderSn" placeholder="留空则由后端自动生成" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="订单状态" prop="orderStatus">
          <el-radio-group v-model="form.orderStatus">
            <el-radio v-for="dict in mall_order_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="收货人">
          <el-input v-model="form.consignee" placeholder="请输入收货人" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input v-model="form.address" placeholder="请输入收货地址" />
        </el-form-item>
        <el-form-item label="订单留言">
          <el-input v-model="form.message" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="商品总价">
          <el-input-number v-model="form.goodsPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="运费">
          <el-input-number v-model="form.freightPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="优惠券金额">
          <el-input-number v-model="form.couponPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="积分抵扣">
          <el-input-number v-model="form.integralPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="团购优惠">
          <el-input-number v-model="form.grouponPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input-number v-model="form.orderPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="实付金额" prop="actualPrice">
          <el-input-number v-model="form.actualPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="退款方式">
          <el-select v-model="form.refundType" clearable placeholder="请选择退款方式" style="width: 100%">
            <el-option v-for="dict in mall_refund_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="退款金额">
          <el-input-number v-model="form.refundAmount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="退款备注">
          <el-input v-model="form.refundContent" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="后台备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="open = false">取消</el-button>
          <el-button type="primary" :loading="buttonLoading" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { addMallOrder, delMallOrder, getMallOrder, listMallOrder, updateMallOrder } from '@/api/mall/order';
import type { MallOrderForm, MallOrderQuery, MallOrderVO } from '@/api/mall/order/types';
import { ComponentInternalInstance } from 'vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { mall_order_status, mall_refund_type } = toRefs<any>(proxy?.useDict('mall_order_status', 'mall_refund_type'));

const queryRef = ref();
const formRef = ref();
const loading = ref(false);
const buttonLoading = ref(false);
const open = ref(false);
const title = ref('');
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const orderList = ref<MallOrderVO[]>([]);

const queryParams = ref<MallOrderQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  orderSn: undefined,
  orderStatus: undefined,
  consignee: undefined
});

const initFormData = (): MallOrderForm => ({
  id: undefined,
  userId: undefined,
  orderSn: '',
  orderStatus: '101',
  consignee: '',
  mobile: '',
  address: '',
  message: '',
  goodsPrice: 0,
  freightPrice: 0,
  couponPrice: 0,
  integralPrice: 0,
  grouponPrice: 0,
  orderPrice: 0,
  actualPrice: 0,
  payId: '',
  payTime: '',
  shipSn: '',
  shipChannel: '',
  shipTime: '',
  refundAmount: 0,
  refundType: 'origin',
  refundContent: '',
  refundTime: '',
  confirmTime: '',
  comments: 0,
  endTime: '',
  remark: ''
});

const form = ref<MallOrderForm>(initFormData());
const rules = {
  orderStatus: [{ required: true, message: '请选择订单状态', trigger: 'change' }],
  actualPrice: [{ required: true, message: '请输入实付金额', trigger: 'blur' }]
};

function reset() {
  form.value = initFormData();
  formRef.value?.resetFields?.();
}

async function getList() {
  loading.value = true;
  try {
    const res = await listMallOrder(queryParams.value);
    orderList.value = res.rows || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    userId: undefined,
    orderSn: undefined,
    orderStatus: undefined,
    consignee: undefined
  };
  queryRef.value?.resetFields?.();
  getList();
}

function handleSelectionChange(selection: MallOrderVO[]) {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
}

function handleAdd() {
  reset();
  title.value = '新增订单';
  open.value = true;
}

async function handleEdit(row: MallOrderVO) {
  reset();
  const res = await getMallOrder(row.id);
  form.value = { ...initFormData(), ...res.data };
  title.value = '编辑订单';
  open.value = true;
}

function submitForm() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateMallOrder(form.value);
      } else {
        await addMallOrder(form.value);
      }
      proxy?.$modal.msgSuccess('保存成功');
      open.value = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
}

function handleDelete(row?: MallOrderVO) {
  const targetIds = row?.id || ids.value;
  if (!targetIds || (Array.isArray(targetIds) && targetIds.length === 0)) {
    proxy?.$modal.msgWarning('请先选择要删除的数据');
    return;
  }
  proxy?.$modal.confirm('确认删除选中的订单吗？').then(() => delMallOrder(targetIds)).then(() => {
    proxy?.$modal.msgSuccess('删除成功');
    getList();
  }).catch(() => undefined);
}

onMounted(() => {
  getList();
});
</script>

<style scoped>
.mall-page { min-height: 100%; padding: 16px; background: #f6f8fc; }
.panel { margin-bottom: 16px; border: none; border-radius: 20px; }
.panel-header { display: flex; justify-content: space-between; gap: 16px; }
.panel-header h3, .panel-header p { margin: 0; }
.panel-header p { margin-top: 6px; color: #7f8da1; }
.toolbar, .drawer-footer { display: flex; gap: 10px; }
.drawer-footer { justify-content: flex-end; }
</style>

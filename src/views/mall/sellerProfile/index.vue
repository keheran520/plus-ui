<template>
  <div class="seller-manage-page">
    <section v-loading="loading" class="summary-grid">
      <article class="summary-card summary-card--blue">
        <span class="summary-card__label">服务商总数</span>
        <strong class="summary-card__value">{{ total }}</strong>
        <span class="summary-card__hint">当前筛选条件下的服务商档案数量</span>
      </article>
      <article class="summary-card summary-card--green">
        <span class="summary-card__label">接单中</span>
        <strong class="summary-card__value">{{ summary.activeServiceCount }}</strong>
        <span class="summary-card__hint">当前页面处于接单中的服务商数量</span>
      </article>
      <article class="summary-card summary-card--amber">
        <span class="summary-card__label">待审核</span>
        <strong class="summary-card__value">{{ summary.pendingVerifyCount }}</strong>
        <span class="summary-card__hint">当前页面等待审核的服务商数量</span>
      </article>
      <article class="summary-card summary-card--violet">
        <span class="summary-card__label">累计成交</span>
        <strong class="summary-card__value">{{ formatCurrency(summary.totalSalesAmount) }}</strong>
        <span class="summary-card__hint">当前页面服务商累计成交金额汇总</span>
      </article>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <section v-show="showSearch" class="filter-panel">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="会员ID" prop="memberId">
            <el-input v-model="queryParams.memberId" class="field-sm" clearable placeholder="请输入会员ID" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="会员编号" prop="memberNo">
            <el-input v-model="queryParams.memberNo" class="field-md" clearable placeholder="请输入会员编号" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="会员姓名" prop="realName">
            <el-input v-model="queryParams.realName" class="field-sm" clearable placeholder="请输入会员姓名" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="用户账号" prop="userName">
            <el-input v-model="queryParams.userName" class="field-sm" clearable placeholder="请输入用户账号" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="用户昵称" prop="nickName">
            <el-input v-model="queryParams.nickName" class="field-sm" clearable placeholder="请输入用户昵称" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="手机号" prop="phonenumber">
            <el-input v-model="queryParams.phonenumber" class="field-md" clearable placeholder="请输入手机号" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="服务状态" prop="serviceStatus">
            <el-select v-model="queryParams.serviceStatus" class="field-sm" clearable placeholder="全部">
              <el-option v-for="dict in mall_seller_service_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态" prop="verifyStatus">
            <el-select v-model="queryParams.verifyStatus" class="field-sm" clearable placeholder="全部">
              <el-option v-for="dict in mall_seller_verify_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="推荐状态" prop="featuredFlag">
            <el-select v-model="queryParams.featuredFlag" class="field-sm" clearable placeholder="全部">
              <el-option v-for="dict in mall_seller_featured_flag" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="系统状态" prop="status">
            <el-select v-model="queryParams.status" class="field-sm" clearable placeholder="全部">
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="filter-actions">
            <el-button icon="Search" type="primary" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </section>
    </transition>

    <section class="list-panel">
      <header class="panel-toolbar">
        <div class="toolbar-title">
          <span class="title-text">服务商管理</span>
          <span class="title-meta">{{ total }} 条记录</span>
        </div>
        <div class="toolbar-actions">
          <el-button v-hasPermi="['mall:sellerProfile:create']" icon="Plus" type="primary" @click="handleAdd">新增</el-button>
          <el-button v-hasPermi="['mall:sellerProfile:update']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()"
            >编辑</el-button
          >
          <el-button v-hasPermi="['mall:sellerProfile:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()"
            >删除</el-button
          >
          <el-button v-hasPermi="['mall:sellerProfile:export']" icon="Download" plain @click="handleExport">导出</el-button>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </header>

      <div class="status-tabs">
        <button
          v-for="tab in verifyTabs"
          :key="tab.value"
          :class="{ 'status-tab--active': activeVerifyTab === tab.value }"
          class="status-tab"
          type="button"
          @click="handleVerifyTabChange(tab.value)"
        >
          <span>{{ tab.label }}</span>
          <strong>{{ getVerifyTabCount(tab.value) }}</strong>
        </button>
      </div>

      <div class="table-summary">
        <span>推荐服务商 {{ summary.featuredCount }}</span>
        <span>上架商品 {{ summary.onSaleGoodsCount }}</span>
        <span>待处理订单 {{ summary.pendingOrderCount }}</span>
        <span>已完成订单 {{ summary.finishOrderCount }}</span>
        <span>退款订单 {{ summary.refundOrderCount }}</span>
      </div>

      <el-table v-loading="loading" :data="sellerProfileList" class="seller-table" @selection-change="handleSelectionChange">
        <el-table-column align="center" fixed="left" type="selection" width="48" />
        <el-table-column fixed="left" label="服务商信息" min-width="320">
          <template #default="{ row }">
            <div class="seller-cell">
              <el-avatar :src="row.user?.avatar" class="seller-avatar">
                {{ getSellerTitle(row).slice(0, 1) }}
              </el-avatar>
              <div class="seller-meta">
                <div class="seller-title-row">
                  <span class="seller-title">{{ getSellerTitle(row) }}</span>
                  <dict-tag :options="sys_normal_disable" :round="true" :value="row.status" theme="light" />
                </div>
                <div class="seller-sub">会员ID {{ row.memberId || '-' }} / 会员编号 {{ row.member?.memberNo || '-' }}</div>
                <div class="seller-sub">用户ID {{ row.userId || '-' }} / 用户账号 {{ row.user?.userName || '-' }}</div>
                <div class="seller-sub">用户昵称 {{ row.user?.nickName || '-' }} / 手机号 {{ formatContactDisplay(row.user?.phonenumber) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="运营状态" min-width="260">
          <template #default="{ row }">
            <div class="tag-group">
              <dict-tag
                :options="mall_seller_service_status"
                :round="true"
                :value="row.serviceStatus"
                class="clickable-tag"
                theme="light"
                @click="handleServiceStatusToggle(row)"
              />
              <dict-tag
                :options="mall_seller_verify_status"
                :round="true"
                :value="row.verifyStatus"
                class="clickable-tag"
                theme="plain"
                @click="handleVerifyStatusAction(row)"
              />
              <dict-tag
                :options="mall_seller_featured_flag"
                :round="true"
                :value="row.featuredFlag"
                class="clickable-tag"
                theme="plain"
                @click="handleFeaturedToggle(row)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="商品数据" min-width="180">
          <template #default="{ row }">
            <div class="metric-stack">
              <span>商品 {{ formatCount(row.goodsCount) }}</span>
              <span>上架 {{ formatCount(row.onSaleGoodsCount) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="订单数据" min-width="200">
          <template #default="{ row }">
            <div class="metric-stack">
              <span>待处理 {{ formatCount(row.pendingOrderCount) }}</span>
              <span>完成 {{ formatCount(row.finishOrderCount) }}</span>
              <span>退款 {{ formatCount(row.refundOrderCount) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="right" label="累计成交" width="130">
          <template #default="{ row }">
            <span class="amount-text">{{ formatCurrency(row.totalSalesAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="服务说明" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.serviceNotice || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="运营备注" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.adminRemark || row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="最近订单" prop="lastOrderTime" width="170" />
        <el-table-column align="center" label="创建时间" prop="createTime" width="170" />
        <el-table-column align="center" fixed="right" label="操作" width="280">
          <template #default="{ row }">
            <el-button v-hasPermi="['mall:sellerProfile:query']" link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button v-hasPermi="['mall:sellerProfile:update']" link type="primary" @click="handleUpdate(row)">编辑</el-button>
            <el-button
              v-hasPermi="['mall:sellerProfile:serviceStatus']"
              :type="row.serviceStatus === '1' ? 'warning' : 'success'"
              link
              @click="handleServiceStatusToggle(row)"
            >
              {{ row.serviceStatus === '1' ? '下线' : '上线' }}
            </el-button>
            <el-button
              v-hasPermi="['mall:sellerProfile:featured']"
              :type="row.featuredFlag === '1' ? 'info' : 'warning'"
              link
              @click="handleFeaturedToggle(row)"
            >
              {{ row.featuredFlag === '1' ? '取消推荐' : '推荐' }}
            </el-button>
            <el-dropdown class="more-dropdown" trigger="click">
              <el-button class="more-action-btn" link>
                更多
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- 注意：el-dropdown-item 为延迟渲染节点，不能依赖 v-hasPermi，需改用 v-if + 权限方法判断 -->
                  <el-dropdown-item
                    v-if="row.verifyStatus !== '1' && checkPermi(['mall:sellerProfile:verifyStatus'])"
                    @click="handleVerifyStatus(row, '1')"
                  >
                    审核通过
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.verifyStatus !== '2' && checkPermi(['mall:sellerProfile:verifyStatus'])"
                    @click="handleVerifyStatus(row, '2')"
                  >
                    审核驳回
                  </el-dropdown-item>
                  <el-dropdown-item v-if="checkPermi(['mall:sellerProfile:status'])" @click="handleSystemStatusToggle(row)">
                    {{ getStatusActionLabel(row.status) }}
                  </el-dropdown-item>
                  <el-dropdown-item v-if="checkPermi(['mall:sellerProfile:remove'])" divided @click="handleDelete(row)"> 删除 </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="drawer.visible" :close-on-click-modal="false" :title="drawer.title" size="720px">
      <el-form ref="sellerProfileFormRef" :model="form" :rules="rules" class="seller-form" label-position="top">
        <div class="form-grid form-grid--link">
          <el-form-item label="关联会员" prop="memberId">
            <div class="linked-user-box">
              <el-input v-model="form.memberDisplayName" placeholder="请选择关联会员" readonly />
              <el-button :disabled="Boolean(form.id)" icon="User" @click="handleSelectMember">选择会员</el-button>
            </div>
          </el-form-item>
          <el-form-item label="排序值" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </div>

        <el-form-item label="服务说明" prop="serviceNotice">
          <el-input v-model="form.serviceNotice" :rows="4" maxlength="500" placeholder="请输入服务说明" show-word-limit type="textarea" />
        </el-form-item>
        <el-form-item label="运营备注" prop="adminRemark">
          <el-input v-model="form.adminRemark" :rows="4" maxlength="500" placeholder="请输入运营备注" show-word-limit type="textarea" />
        </el-form-item>
        <el-form-item label="通用备注" prop="remark">
          <el-input v-model="form.remark" :rows="3" maxlength="500" placeholder="请输入补充备注" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-drawer>

    <MemberSelect
      ref="memberSelectRef"
      v-model="selectedMembers"
      :member-ids="linkedMemberIds"
      :multiple="false"
      @confirm-call-back="handleMemberSelected"
    />
  </div>
</template>

<script lang="ts" name="SellerProfile" setup>
import type { ComponentInternalInstance } from 'vue';
import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue';
import MemberSelect from '@/components/MemberSelect/index.vue';
import {
  addSellerProfile,
  delSellerProfile,
  getSellerLinkedMemberIds,
  getSellerProfile,
  listSellerProfile,
  updateSellerFeaturedFlag,
  updateSellerProfile,
  updateSellerServiceStatus,
  updateSellerSystemStatus,
  updateSellerVerifyStatus
} from '@/api/mall/sellerProfile';
import type { SellerProfileForm, SellerProfileQuery, SellerProfileVO } from '@/api/mall/sellerProfile/types';
import { formatContactDisplay } from '@/utils/contact';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable, mall_seller_service_status, mall_seller_verify_status, mall_seller_featured_flag } = toRefs<any>(
  proxy?.useDict('sys_normal_disable', 'mall_seller_service_status', 'mall_seller_verify_status', 'mall_seller_featured_flag')
);

const verifyTabs = [
  { label: '全部', value: '' },
  { label: '待审核', value: '0' },
  { label: '已通过', value: '1' },
  { label: '已驳回', value: '2' }
];

const loading = ref(false);
const buttonLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const activeVerifyTab = ref('');
const sellerProfileList = ref<SellerProfileVO[]>([]);
const linkedMemberIds = ref<number[]>([]);
const selectedMembers = ref<any>();

const queryFormRef = ref<ElFormInstance>();
const sellerProfileFormRef = ref<ElFormInstance>();
const memberSelectRef = ref();

const drawer = reactive({
  visible: false,
  title: ''
});

const createDefaultForm = (): SellerProfileForm => ({
  id: undefined,
  memberId: undefined,
  userId: undefined,
  memberDisplayName: '',
  sortOrder: 0,
  serviceNotice: '',
  adminRemark: '',
  remark: ''
});

const data = reactive<PageData<SellerProfileForm, SellerProfileQuery>>({
  form: createDefaultForm(),
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    memberId: undefined,
    userId: undefined,
    memberNo: undefined,
    realName: undefined,
    userName: undefined,
    nickName: undefined,
    phonenumber: undefined,
    serviceStatus: undefined,
    verifyStatus: undefined,
    featuredFlag: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    memberId: [{ required: true, message: '请选择关联会员', trigger: 'change' }],
    serviceNotice: [{ required: true, message: '请输入服务说明', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const summary = computed(() => {
  const list = sellerProfileList.value;
  return {
    activeServiceCount: list.filter((item) => item.serviceStatus === '1').length,
    pendingVerifyCount: list.filter((item) => item.verifyStatus === '0').length,
    featuredCount: list.filter((item) => item.featuredFlag === '1').length,
    onSaleGoodsCount: list.reduce((sum, item) => sum + Number(item.onSaleGoodsCount || 0), 0),
    pendingOrderCount: list.reduce((sum, item) => sum + Number(item.pendingOrderCount || 0), 0),
    finishOrderCount: list.reduce((sum, item) => sum + Number(item.finishOrderCount || 0), 0),
    refundOrderCount: list.reduce((sum, item) => sum + Number(item.refundOrderCount || 0), 0),
    totalSalesAmount: list.reduce((sum, item) => sum + Number(item.totalSalesAmount || 0), 0)
  };
});

const getList = async () => {
  loading.value = true;
  try {
    const res = await listSellerProfile(queryParams.value);
    sellerProfileList.value = res.rows || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
};

const loadLinkedMemberIds = async () => {
  const res = await getSellerLinkedMemberIds();
  linkedMemberIds.value = res.data || [];
};

const reset = () => {
  Object.assign(form.value, createDefaultForm());
  sellerProfileFormRef.value?.clearValidate();
};

const cancel = () => {
  drawer.visible = false;
  reset();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  activeVerifyTab.value = '';
  queryParams.value.verifyStatus = undefined;
  handleQuery();
};

const handleVerifyTabChange = (value: string) => {
  activeVerifyTab.value = value;
  queryParams.value.verifyStatus = value || undefined;
  handleQuery();
};

const getVerifyTabCount = (value: string) => {
  if (!value) return sellerProfileList.value.length;
  return sellerProfileList.value.filter((item) => item.verifyStatus === value).length;
};

const handleSelectionChange = (selection: SellerProfileVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleSelectMember = async () => {
  if (form.value.id) {
    proxy?.$modal.msgWarning('编辑服务商时不允许更换关联会员');
    return;
  }
  await loadLinkedMemberIds();
  memberSelectRef.value?.open();
};

const handleMemberSelected = (members: any[]) => {
  const member = members?.[0];
  if (!member) return;
  form.value.memberId = member.id;
  form.value.userId = member.userId;
  form.value.memberDisplayName = `${member.realName || member.memberNo || `会员ID ${member.id}`} / ${member.memberNo || '-'}`;
};

const handleAdd = async () => {
  reset();
  await loadLinkedMemberIds();
  drawer.visible = true;
  drawer.title = '新增服务商';
};

const handleUpdate = async (row?: SellerProfileVO) => {
  reset();
  const currentId = row?.id || ids.value[0];
  const res = await getSellerProfile(currentId);
  Object.assign(form.value, createDefaultForm(), res.data || {});
  form.value.memberDisplayName = `${res.data?.member?.realName || res.data?.member?.memberNo || `会员ID ${res.data?.memberId || ''}`} / ${res.data?.member?.memberNo || '-'}`;
  drawer.visible = true;
  drawer.title = '编辑服务商';
};

const submitForm = () => {
  sellerProfileFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateSellerProfile(form.value);
      } else {
        await addSellerProfile(form.value);
      }
      proxy?.$modal.msgSuccess('保存成功');
      drawer.visible = false;
      await Promise.all([getList(), loadLinkedMemberIds()]);
    } finally {
      buttonLoading.value = false;
    }
  });
};

const handleDetail = (row: SellerProfileVO) => {
  proxy?.$router.push({ path: '/mall/sellerProfile/detail/' + row.id });
};

const handleDelete = async (row?: SellerProfileVO) => {
  const currentIds = row?.id || ids.value;
  if (!currentIds || (Array.isArray(currentIds) && currentIds.length === 0)) {
    proxy?.$modal.msgWarning('请先选择要删除的服务商');
    return;
  }
  const label = row ? getSellerTitle(row) : `${ids.value.length} 个服务商`;
  await proxy?.$modal.confirm(`是否确认删除服务商“${label}”？`);
  await delSellerProfile(currentIds);
  proxy?.$modal.msgSuccess('删除成功');
  await Promise.all([getList(), loadLinkedMemberIds()]);
};

const handleServiceStatusToggle = async (row: SellerProfileVO) => {
  const nextStatus = row.serviceStatus === '1' ? '0' : '1';
  await proxy?.$modal.confirm(`确认将服务状态切换为 ${getServiceStatusLabel(nextStatus)}？`);
  await updateSellerServiceStatus(row.id, nextStatus);
  proxy?.$modal.msgSuccess('服务状态已更新');
  await getList();
};

const handleVerifyStatusAction = async (row: SellerProfileVO) => {
  const nextStatus = row.verifyStatus === '1' ? '2' : '1';
  await handleVerifyStatus(row, nextStatus);
};

const handleVerifyStatus = async (row: SellerProfileVO, verifyStatus: string) => {
  await proxy?.$modal.confirm(`确认将审核状态修改为 ${getVerifyStatusLabel(verifyStatus)}？`);
  await updateSellerVerifyStatus(row.id, verifyStatus);
  proxy?.$modal.msgSuccess('审核状态已更新');
  await getList();
};

const handleFeaturedToggle = async (row: SellerProfileVO) => {
  const nextFlag = row.featuredFlag === '1' ? '0' : '1';
  await proxy?.$modal.confirm(nextFlag === '1' ? '确认设为推荐服务商？' : '确认取消推荐服务商？');
  await updateSellerFeaturedFlag(row.id, nextFlag);
  proxy?.$modal.msgSuccess('推荐状态已更新');
  await getList();
};

const handleSystemStatusToggle = async (row: SellerProfileVO) => {
  const nextStatus = row.status === '0' ? '1' : '0';
  await proxy?.$modal.confirm(nextStatus === '0' ? '确认启用该服务商？' : '确认停用该服务商？');
  await updateSellerSystemStatus(row.id, nextStatus);
  proxy?.$modal.msgSuccess('系统状态已更新');
  await getList();
};

const handleExport = () => {
  proxy?.download('mall/sellerProfile/export', { ...queryParams.value }, `seller_profile_${Date.now()}.xlsx`);
};

const getDictLabel = (options: DictDataOption[], value?: string | number, defaultLabel = '未知') => {
  const match = options?.find((item) => String(item.value) === String(value ?? ''));
  return match?.label || defaultLabel;
};

const getServiceStatusLabel = (value?: string) => getDictLabel(mall_seller_service_status.value || [], value);
const getVerifyStatusLabel = (value?: string) => getDictLabel(mall_seller_verify_status.value || [], value);
const getSystemStatusLabel = (value?: string) => getDictLabel(sys_normal_disable.value || [], value);
const getStatusActionLabel = (value?: string) => (value === '0' ? '停用' : '启用');

const getSellerTitle = (row: SellerProfileVO) => {
  return row.member?.realName || row.user?.nickName || row.user?.userName || `服务商 ${row.id}`;
};

const checkPermi = (permissions: string[]) => {
  return permissions.some((permission) => proxy?.$auth?.hasPermi(permission));
};

const formatCount = (value?: number | string) => Number(value || 0).toLocaleString('zh-CN');
const formatCurrency = (value?: number | string) => `¥${Number(value || 0).toFixed(2)}`;

onMounted(async () => {
  await Promise.all([loadLinkedMemberIds(), getList()]);
});
</script>

<style lang="scss" scoped>
.seller-manage-page {
  padding: 16px;
  min-height: calc(100vh - 84px);
  background: #f6f8fb;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.summary-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.summary-card--blue {
  background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%);
}

.summary-card--green {
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
}

.summary-card--amber {
  background: linear-gradient(180deg, #ffffff 0%, #fff7ed 100%);
}

.summary-card--violet {
  background: linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%);
}

.summary-card__label {
  color: #64748b;
  font-size: 13px;
}

.summary-card__value {
  display: block;
  margin-top: 10px;
  color: #0f172a;
  font-size: 28px;
  font-weight: 700;
}

.summary-card__hint {
  display: block;
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
}

.filter-panel,
.list-panel {
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.filter-panel {
  padding: 16px 18px 2px;
  margin-bottom: 14px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-actions {
  margin-left: auto;
}

.field-sm {
  width: 150px;
}

.field-md {
  width: 190px;
}

.list-panel {
  padding: 14px 16px 4px;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.toolbar-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-text {
  color: #0f172a;
  font-size: 16px;
  font-weight: 600;
}

.title-meta {
  color: #94a3b8;
  font-size: 13px;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.status-tab {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 14px;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-tab strong {
  color: #0f172a;
  font-size: 13px;
}

.status-tab--active {
  color: #2563eb;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.table-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.table-summary span {
  padding: 6px 10px;
  color: #64748b;
  font-size: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
}

.seller-table :deep(.el-table__cell) {
  padding: 14px 0;
}

.seller-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seller-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #0f172a, #334155);
  color: #fff;
  font-weight: 700;
}

.seller-meta {
  min-width: 0;
}

.seller-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.seller-title {
  color: #0f172a;
  font-weight: 600;
}

.seller-sub {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.clickable-tag {
  cursor: pointer;
}

.metric-stack {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  color: #475569;
  font-size: 12px;
}

.amount-text {
  color: #0f172a;
  font-weight: 600;
}

.seller-form {
  padding-bottom: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.form-grid--link {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.linked-user-box {
  display: flex;
  gap: 10px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.more-dropdown {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.more-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 8px;
  line-height: 1;
  vertical-align: middle;
}

.more-action-btn :deep(.el-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .form-grid,
  .form-grid--link {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .seller-manage-page {
    padding: 12px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .panel-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .linked-user-box {
    flex-direction: column;
  }
}
</style>

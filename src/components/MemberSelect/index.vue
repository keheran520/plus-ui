<template>
  <div>
    <el-dialog v-model="memberDialog.visible.value" :title="memberDialog.title.value" width="82%" append-to-body>
      <el-row :gutter="20">
        <el-col :lg="6" :xs="24">
          <el-card class="member-side-card" shadow="hover">
            <div class="member-side-card__title">已选会员</div>
            <div class="member-side-card__count">{{ selectedList.length }}</div>
            <div class="member-side-card__hint">单选模式下点击行即可切换，确定后会回填到服务商表单。</div>

            <div class="selected-member-list">
              <template v-if="selectedList.length">
                <button
                  v-for="member in selectedList"
                  :key="member.id"
                  class="selected-member-chip"
                  type="button"
                  @click="handleRemove(member)"
                >
                  <span class="selected-member-chip__name">{{ formatMemberLabel(member) }}</span>
                  <span class="selected-member-chip__meta">{{ member.memberNo || `ID ${member.id}` }}</span>
                </button>
              </template>
              <div v-else class="selected-member-empty">暂无已选会员</div>
            </div>
          </el-card>
        </el-col>

        <el-col :lg="18" :xs="24">
          <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
            <div v-show="showSearch" class="mb-[10px]">
              <el-card shadow="hover">
                <el-form ref="queryFormRef" :model="queryParams" :inline="true">
                  <el-form-item label="会员编号" prop="memberNo">
                    <el-input v-model="queryParams.memberNo" placeholder="请输入会员编号" clearable @keyup.enter="handleQuery" />
                  </el-form-item>
                  <el-form-item label="会员姓名" prop="realName">
                    <el-input v-model="queryParams.realName" placeholder="请输入会员姓名" clearable @keyup.enter="handleQuery" />
                  </el-form-item>
                  <el-form-item label="用户ID" prop="userId">
                    <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable @keyup.enter="handleQuery" />
                  </el-form-item>
                  <el-form-item label="状态" prop="status">
                    <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 140px">
                      <el-option label="正常" value="0" />
                      <el-option label="冻结" value="1" />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                    <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </div>
          </transition>

          <el-card shadow="hover">
            <template #header>
              <div class="member-table-header">
                <span class="member-table-header__title">会员列表</span>
                <span class="member-table-header__meta">共 {{ total }} 条，可直接点击行进行选择</span>
              </div>
            </template>

            <vxe-table
              ref="tableRef"
              height="430px"
              border
              show-overflow
              :data="memberList"
              :loading="loading"
              :row-config="{ keyField: 'id', isHover: true }"
              :checkbox-config="{ reserve: true, trigger: 'row', highlight: true, showHeader: multiple }"
              @checkbox-all="handleCheckboxAll"
              @checkbox-change="handleCheckboxChange"
            >
              <vxe-column type="checkbox" width="54" align="center" />
              <vxe-column title="会员ID" align="center" field="id" width="90" />
              <vxe-column title="会员编号" align="center" field="memberNo" min-width="160" />
              <vxe-column title="会员姓名" align="center" field="realName" min-width="140">
                <template #default="scope">
                  <div class="member-name-cell">
                    <span class="member-name-cell__title">{{ scope.row.realName || '未实名会员' }}</span>
                    <span class="member-name-cell__sub">用户ID {{ scope.row.userId || '-' }}</span>
                  </div>
                </template>
              </vxe-column>
              <vxe-column title="余额" align="right" width="130">
                <template #default="scope">
                  <span class="amount-text">{{ formatCurrency(scope.row.balance) }}</span>
                </template>
              </vxe-column>
              <vxe-column title="积分" align="center" field="points" width="100" />
              <vxe-column title="来源" align="center" field="source" width="100">
                <template #default="scope">
                  <el-tag effect="plain" round size="small">{{ getSourceLabel(scope.row.source) }}</el-tag>
                </template>
              </vxe-column>
              <vxe-column title="状态" align="center" width="100">
                <template #default="scope">
                  <dict-tag :options="memberStatusOptions" :value="scope.row.status" />
                </template>
              </vxe-column>
              <vxe-column title="注册时间" align="center" field="registerTime" width="170" />
            </vxe-table>

            <pagination
              v-show="total > 0"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              :total="total"
              @pagination="pageList"
            />
          </el-card>
        </el-col>
      </el-row>

      <template #footer>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import type { VxeTableInstance } from 'vxe-table';
import { listMember } from '@/api/member/member';
import type { MemberQuery, MemberVO } from '@/api/member/member/types';
import useDialog from '@/hooks/useDialog';

interface PropType {
  modelValue?: MemberVO[] | MemberVO | undefined;
  multiple?: boolean;
  data?: string | number | (string | number)[] | undefined;
  memberIds?: string | number | (string | number)[] | undefined;
}

const props = withDefaults(defineProps<PropType>(), {
  multiple: true,
  modelValue: undefined,
  data: undefined,
  memberIds: undefined
});

const emit = defineEmits(['update:modelValue', 'confirmCallBack']);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const memberStatusOptions = [
  { label: '正常', value: '0' },
  { label: '冻结', value: '1' }
];

const sourceOptions = [
  { label: 'APP', value: 'app' },
  { label: 'H5', value: 'h5' },
  { label: '小程序', value: 'mini' },
  { label: 'PC', value: 'pc' },
  { label: '后台添加', value: 'admin' }
];

const memberDialog = useDialog({
  title: '选择会员'
});

const memberList = ref<MemberVO[]>([]);
const selectedList = ref<MemberVO[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tableRef = ref<VxeTableInstance<MemberVO>>();

const queryParams = ref<MemberQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  memberNo: undefined,
  realName: undefined,
  status: undefined
});

const defaultSelectedIds = computed(() => computedIds(props.data || props.modelValue));
const multiple = computed(() => props.multiple);

function computedIds(data: any): string[] {
  if (data === '' || data === null || data === undefined) {
    return [];
  }
  if (Array.isArray(data)) {
    return data.map((item) => String(item?.id ?? item));
  }
  if (typeof data === 'object') {
    return data?.id ? [String(data.id)] : [];
  }
  if (typeof data === 'string') {
    return data.split(',');
  }
  if (typeof data === 'number') {
    return [String(data)];
  }
  return [];
}

async function getList() {
  loading.value = true;
  try {
    const res = await listMember({ ...queryParams.value });
    const excludeIds = computedIds(props.memberIds);
    const currentIds = selectedList.value.map((item) => String(item.id));
    memberList.value = (res.rows || []).filter((item: MemberVO) => {
      const currentId = String(item.id);
      return !excludeIds.includes(currentId) || currentIds.includes(currentId) || defaultSelectedIds.value.includes(currentId);
    });
    total.value = memberList.value.length;
    await nextTick();
    syncTableSelection();
  } finally {
    loading.value = false;
  }
}

async function pageList() {
  await getList();
}

async function syncTableSelection() {
  const selectedIds = selectedList.value.map((item) => String(item.id));
  tableRef.value?.clearCheckboxReserve();
  tableRef.value?.clearCheckboxRow();
  const rows = memberList.value.filter((item) => selectedIds.includes(String(item.id)));
  if (rows.length) {
    await tableRef.value?.setCheckboxRow(rows, true);
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  handleQuery();
}

function upsertSelectedMember(member: MemberVO) {
  const index = selectedList.value.findIndex((item) => String(item.id) === String(member.id));
  if (index > -1) {
    selectedList.value.splice(index, 1, member);
  } else {
    selectedList.value.push(member);
  }
}

function handleCheckboxChange(params: any) {
  const member = params.row as MemberVO;
  if (!props.multiple && params.checked) {
    selectedList.value = [member];
    tableRef.value?.clearCheckboxReserve();
    tableRef.value?.clearCheckboxRow();
    tableRef.value?.setCheckboxRow(member, true);
    return;
  }
  if (params.checked) {
    upsertSelectedMember(member);
  } else {
    selectedList.value = selectedList.value.filter((item) => String(item.id) !== String(member.id));
  }
}

function handleCheckboxAll(params: any) {
  const rows = memberList.value;
  if (params.checked) {
    rows.forEach((row) => upsertSelectedMember(row));
  } else {
    const rowIds = rows.map((row) => String(row.id));
    selectedList.value = selectedList.value.filter((item) => !rowIds.includes(String(item.id)));
  }
}

function handleRemove(member: MemberVO) {
  selectedList.value = selectedList.value.filter((item) => String(item.id) !== String(member.id));
  const row = memberList.value.find((item) => String(item.id) === String(member.id));
  if (row) {
    tableRef.value?.setCheckboxRow(row, false);
  }
}

function confirm() {
  const result = props.multiple ? selectedList.value : selectedList.value[0];
  emit('update:modelValue', result);
  emit('confirmCallBack', selectedList.value);
  memberDialog.closeDialog();
}

function close() {
  memberDialog.closeDialog();
}

function formatMemberLabel(member: MemberVO) {
  return member.realName || member.memberNo || `会员ID ${member.id}`;
}

function formatCurrency(value?: number | string) {
  return `¥${Number(value || 0).toFixed(2)}`;
}

function getSourceLabel(source?: string) {
  return sourceOptions.find((item) => item.value === source)?.label || '未知来源';
}

watch(
  () => memberDialog.visible.value,
  async (visible) => {
    if (visible) {
      if (Array.isArray(props.modelValue)) {
        selectedList.value = [...props.modelValue];
      } else if (props.modelValue) {
        selectedList.value = [props.modelValue];
      } else {
        selectedList.value = [];
      }
      await getList();
    } else {
      queryFormRef.value?.resetFields();
      queryParams.value.pageNum = 1;
      queryParams.value.memberNo = undefined;
      queryParams.value.realName = undefined;
      queryParams.value.userId = undefined;
      queryParams.value.status = undefined;
      memberList.value = [];
    }
  }
);

defineExpose({
  open: memberDialog.openDialog,
  close: memberDialog.closeDialog
});
</script>

<style scoped lang="scss">
.member-side-card {
  min-height: 540px;
}

.member-side-card__title {
  color: #0f172a;
  font-size: 16px;
  font-weight: 600;
}

.member-side-card__count {
  margin-top: 8px;
  color: #2563eb;
  font-size: 28px;
  font-weight: 700;
}

.member-side-card__hint {
  margin-top: 8px;
  color: #64748b;
  line-height: 1.7;
  font-size: 12px;
}

.selected-member-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.selected-member-chip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  text-align: left;
  background: #f8fafc;
  border: 1px solid #dbe5f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-member-chip:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.selected-member-chip__name {
  color: #0f172a;
  font-weight: 600;
}

.selected-member-chip__meta {
  color: #64748b;
  font-size: 12px;
}

.selected-member-empty {
  padding: 18px 12px;
  color: #94a3b8;
  text-align: center;
  background: #f8fafc;
  border: 1px dashed #dbe5f0;
  border-radius: 8px;
}

.member-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.member-table-header__title {
  color: #0f172a;
  font-weight: 600;
}

.member-table-header__meta {
  color: #94a3b8;
  font-size: 12px;
}

.member-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-name-cell__title {
  color: #0f172a;
  font-weight: 600;
}

.member-name-cell__sub {
  color: #94a3b8;
  font-size: 12px;
}

.amount-text {
  color: #0f172a;
  font-weight: 600;
}
</style>

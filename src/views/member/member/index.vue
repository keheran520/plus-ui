<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card class="search-card" shadow="never">
          <el-form ref="queryRef" :inline="true" :model="queryParams">
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="queryParams.userId" clearable placeholder="请输入用户ID" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="会员编号" prop="memberNo">
              <el-input v-model="queryParams.memberNo" clearable placeholder="请输入会员编号" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="会员姓名" prop="realName">
              <el-input v-model="queryParams.realName" clearable placeholder="请输入会员姓名" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="queryParams.idCard" clearable placeholder="请输入身份证号" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="会员状态" prop="status">
              <el-select v-model="queryParams.status" clearable placeholder="请选择状态">
                <el-option label="正常" value="0" />
                <el-option label="冻结" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="注册来源" prop="source">
              <el-select v-model="queryParams.source" clearable placeholder="请选择来源">
                <el-option label="APP" value="app" />
                <el-option label="H5" value="h5" />
                <el-option label="小程序" value="mini" />
                <el-option label="PC" value="pc" />
              </el-select>
            </el-form-item>
            <el-form-item label="注册时间">
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

    <!-- 操作按钮区 -->
    <el-card shadow="never" style="margin-top: 10px">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['member:member:add']" icon="Plus" plain type="primary" @click="handleAdd">新增 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['member:member:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete"
              >删除
            </el-button>
          </el-col>
          <!--        <el-col :span="1.5">-->
          <!--          <el-button v-hasPermi="['member:member:freeze']" :disabled="multiple" icon="Lock" plain type="warning" @click="handleFreeze"-->
          <!--            >批量冻结-->
          <!--          </el-button>-->
          <!--        </el-col>-->
          <!--        <el-col :span="1.5">-->
          <!--          <el-button v-hasPermi="['member:member:unfreeze']" :disabled="multiple" icon="Unlock" plain type="success" @click="handleUnfreeze"-->
          <!--            >批量解冻-->
          <!--          </el-button>-->
          <!--        </el-col>-->
          <el-col :span="1.5">
            <el-button v-hasPermi="['member:member:export']" icon="Download" plain type="warning" @click="handleExport"> 导出 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="memberList"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        border
        highlight-current-row
        stripe
        style="width: 100%; margin-top: 10px"
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" fixed type="selection" width="50" />
        <el-table-column align="center" label="主键" prop="id" width="80" />
        <el-table-column align="center" label="用户ID" prop="userId" sortable width="90" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="会员编号" prop="memberNo" width="180" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="真实姓名" prop="realName" width="120" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="身份证号" prop="idCard" width="180">
          <template #default="scope">
            <span v-if="scope.row.idCard">{{ desensitizeIdCard(scope.row.idCard) }}</span>
            <span v-else style="color: #ccc">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="生日" prop="birthday" width="120">
          <template #default="scope">
            <span>{{ scope.row.birthday || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="会员等级" prop="levelId" width="110">
          <template #default="scope">
            <span v-if="scope.row.levelId">{{ getLevelName(scope.row.levelId) }}</span>
            <span v-else style="color: #ccc">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="成长值" prop="growthValue" sortable width="110">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center">
              <el-icon color="#F56C6C" style="margin-right: 4px">
                <TrendCharts />
              </el-icon>
              <span style="color: #f56c6c; font-weight: bold; font-size: 14px">
                {{ scope.row.growthValue || 0 }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="余额(元)" prop="balance" sortable width="130">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center">
              <el-icon color="#67C23A" style="margin-right: 4px">
                <Money />
              </el-icon>
              <span style="color: #67c23a; font-weight: bold; font-size: 14px">
                {{ formatAmount(scope.row.balance) }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="积分" prop="points" sortable width="110">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center">
              <el-icon color="#E6A23C" style="margin-right: 4px">
                <TrophyBase />
              </el-icon>
              <span style="color: #e6a23c; font-weight: bold; font-size: 14px">
                {{ scope.row.points || 0 }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="累计消费(元)" prop="totalConsumeAmount" sortable width="150">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center">
              <el-icon color="#409EFF" style="margin-right: 4px">
                <ShoppingCart />
              </el-icon>
              <span style="color: #409eff; font-weight: bold; font-size: 14px">
                {{ formatAmount(scope.row.totalConsumeAmount) }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="会员状态" prop="status" width="110">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '0'" type="success">正常</el-tag>
            <el-tag v-else-if="scope.row.status === '1'" type="danger">冻结</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="注册来源" prop="source" width="110">
          <template #default="scope">
            <el-tag v-if="scope.row.source === 'app'" effect="plain" type="success">APP</el-tag>
            <el-tag v-else-if="scope.row.source === 'h5'" effect="plain" type="primary">H5</el-tag>
            <el-tag v-else-if="scope.row.source === 'mini'" effect="plain" type="warning">小程序</el-tag>
            <el-tag v-else-if="scope.row.source === 'pc'" effect="plain" type="info">PC</el-tag>
            <span v-else style="color: #ccc">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="注册时间" prop="registerTime" sortable width="180">
          <template #default="scope">
            <el-icon style="margin-right: 4px">
              <Clock />
            </el-icon>
            <span>{{ scope.row.registerTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="备注" prop="remark">
          <template #default="scope">
            <span>{{ scope.row.remark || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" class-name="small-padding" fixed="right" label="操作" width="280">
          <template #default="scope">
            <el-button v-hasPermi="['member:member:query']" icon="View" link type="primary" @click="handleDetail(scope.row)">查看详情 </el-button>
            <el-button v-hasPermi="['member:member:remove']" icon="Delete" link type="danger" @click="handleDelete(scope.row)">删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>

    <!-- 新增/编辑会员抽屉 -->
    <el-drawer v-model="memberDrawer" :close-on-click-modal="false" :title="memberTitle" direction="rtl" size="650px">
      <el-form ref="memberRef" :model="memberForm" :rules="memberRules" label-width="110px" label-position="top">
        <!-- 关联用户 -->
        <el-form-item label="关联用户" prop="userId">
          <div style="display: flex; gap: 10px; width: 100%">
            <el-input v-model="memberForm.userName" :disabled="!!memberForm.id" placeholder="请选择关联用户" readonly style="flex: 1">
              <template #suffix>
                <el-icon>
                  <User />
                </el-icon>
              </template>
            </el-input>
            <el-button :disabled="!!memberForm.id" icon="User" @click="handleSelectUser">选择用户</el-button>
          </div>
        </el-form-item>

        <!-- 会员编号 -->
        <el-form-item label="会员编号" prop="memberNo">
          <div style="display: flex; gap: 10px; width: 100%">
            <el-input v-model="memberForm.memberNo" clearable placeholder="会员编号" readonly style="flex: 1" />
            <el-button :loading="generating" icon="Refresh" @click="handleGenerateMemberNo">生成编号</el-button>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="memberForm.realName" clearable placeholder="请输入真实姓名(选填)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="memberForm.idCard" clearable maxlength="18" placeholder="请输入身份证号(选填)" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="memberForm.birthday"
                placeholder="请选择生日(选填)"
                style="width: 100%"
                type="date"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会员等级" prop="levelId">
              <el-select v-model="memberForm.levelId" clearable placeholder="请选择会员等级" style="width: 100%">
                <el-option
                  v-for="level in levelList"
                  :key="level.id"
                  :label="`${level.levelName} (折扣率: ${level.discountRate}%)`"
                  :value="level.id"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center">
                    <span>
                      <el-icon>
                        <Star />
                      </el-icon>
                      {{ level.levelName }}
                    </span>
                    <el-tag size="small" type="warning">折扣: {{ level.discountRate }}%</el-tag>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 简介 -->
        <el-form-item label="简介" prop="signature">
          <el-input v-model="memberForm.signature" :rows="2" maxlength="100" placeholder="请输入简介(选填)" show-word-limit type="textarea" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="地区" prop="region">
              <el-input v-model="memberForm.region" clearable placeholder="请输入地区(选填)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职业" prop="occupation">
              <el-input v-model="memberForm.occupation" clearable placeholder="请输入职业(选填)" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学校" prop="school">
              <el-input v-model="memberForm.school" clearable placeholder="请输入学校(选填)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会员状态" prop="status">
              <el-radio-group v-model="memberForm.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">冻结</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="注册来源" prop="source">
              <el-select v-model="memberForm.source" clearable placeholder="请选择注册来源" style="width: 100%">
                <el-option label="H5" value="h5" />
                <el-option label="小程序" value="mini" />
                <el-option label="PC" value="pc" />
                <el-option label="后台添加" value="admin" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="memberForm.remark" :rows="3" maxlength="200" placeholder="请输入备注" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelMember">取消</el-button>
          <el-button :loading="memberLoading" type="primary" @click="submitMember">确定</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- UserSelect 组件 -->
    <UserSelect ref="userSelectRef" v-model="selectedUsers" :multiple="false" :userIds="linkedUserIds" @confirmCallBack="handleUserSelected" />
  </div>
</template>

<script lang="ts" setup>
import {
  addMember,
  adjustPoints,
  changeLevel,
  delMember,
  freezeMember,
  generateMemberNo,
  getMember,
  getLinkedUserIds,
  listMember,
  recharge,
  unfreezeMember,
  updateMember
} from '@/api/member/member';
import { listLevel } from '@/api/member/level';
import UserSelect from '@/components/UserSelect/index.vue';

const { proxy } = getCurrentInstance() as any;

const memberList = ref<any[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<number[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[string, string]>([]);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  memberNo: undefined,
  realName: undefined,
  idCard: undefined,
  status: undefined,
  source: undefined
});

// 会员表单
const memberDrawer = ref(false);
const memberLoading = ref(false);
const memberTitle = ref('');
const memberForm = ref({
  id: undefined as number | undefined,
  userId: undefined as number | undefined,
  userName: '',
  memberNo: '',
  realName: '',
  idCard: '',
  birthday: '',
  signature: '',
  region: '',
  occupation: '',
  school: '',
  levelId: undefined as number | undefined,
  balance: 0,
  points: 0,
  totalConsumeAmount: 0,
  status: '0',
  source: '',
  registerTime: '',
  remark: ''
});
const memberRules = ref({
  userId: [{ required: true, message: '请选择关联用户', trigger: 'change' }],
  memberNo: [{ required: true, message: '会员编号不能为空', trigger: 'blur' }],
  levelId: [{ required: true, message: '请选择会员等级', trigger: 'change' }],
  realName: [{ max: 50, message: '真实姓名不能超过50个字符', trigger: 'blur' }],
  idCard: [
    {
      pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/,
      message: '请输入正确的身份证号',
      trigger: 'blur'
    }
  ],
  status: [{ required: true, message: '请选择会员状态', trigger: 'change' }]
});

// 新增变量
const generating = ref(false);
const levelList = ref<any[]>([]);
const linkedUserIds = ref<number[]>([]);
const selectedUsers = ref<any[]>([]);
const userSelectRef = ref<any>(null);

// 充值表单
const rechargeDialog = ref(false);
const rechargeLoading = ref(false);
const rechargeForm = ref({
  id: undefined as number | undefined,
  memberNo: '',
  currentBalance: 0,
  amount: undefined as number | undefined,
  remark: ''
});
const rechargeRules = ref({
  amount: [
    { required: true, message: '充值金额不能为空', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '充值金额必须大于0', trigger: 'blur' }
  ]
});

// 积分表单
const pointsDialog = ref(false);
const pointsLoading = ref(false);
const pointsForm = ref({
  id: undefined as number | undefined,
  memberNo: '',
  currentPoints: 0,
  type: 'add',
  amount: undefined as number | undefined,
  remark: ''
});
const pointsRules = ref({
  type: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
  amount: [
    { required: true, message: '调整数量不能为空', trigger: 'blur' },
    { type: 'number', min: 1, message: '调整数量必须大于0', trigger: 'blur' }
  ]
});

// 等级表单
const levelDialog = ref(false);
const levelLoading = ref(false);
const levelForm = ref({
  id: undefined as number | undefined,
  memberNo: '',
  currentLevel: undefined as number | undefined,
  levelId: undefined as number | undefined
});
const levelRules = ref({
  levelId: [{ required: true, message: '请输入新等级', trigger: 'blur' }]
});

/** 加载会员等级列表 */
async function loadLevelList() {
  try {
    const res = await listLevel({ status: '0' });
    levelList.value = res.rows || [];
  } catch (error) {
    console.error('加载会员等级失败:', error);
  }
}

/** 加载已关联用户ID列表 */
async function loadLinkedUserIds() {
  try {
    const res = await getLinkedUserIds();
    linkedUserIds.value = res.data || [];
  } catch (error) {
    console.error('加载已关联用户ID失败:', error);
  }
}

/** 生成会员编号 */
async function handleGenerateMemberNo() {
  generating.value = true;
  try {
    const res = await generateMemberNo();
    memberForm.value.memberNo = res.data;
    proxy.$modal.msgSuccess('会员编号生成成功');
  } catch (error) {
    proxy.$modal.msgError('生成会员编号失败');
  } finally {
    generating.value = false;
  }
}

/** 打开用户选择器 */
async function handleSelectUser() {
  if (memberForm.value.id && memberForm.value.userId) {
    proxy.$modal.msgWarning('编辑时不能更改关联用户');
    return;
  }
  await loadLinkedUserIds();
  userSelectRef.value?.open();
}

/** 用户选择回调 */
function handleUserSelected(users: any[]) {
  if (users && users.length > 0) {
    const user = users[0];
    memberForm.value.userId = user.userId;
    memberForm.value.userName = user.nickName || user.userName;
  }
}

/** 查询会员列表 */
function getList() {
  console.log('[Member List] 开始查询会员列表...');
  loading.value = true;
  const params = proxy.addDateRange(queryParams.value, dateRange.value, 'RegisterTime');
  console.log('[Member List] 请求参数:', params);
  listMember(params)
    .then((response: any) => {
      console.log('[Member List] API返回数据:', response);
      memberList.value = response.rows;
      total.value = response.total;
      loading.value = false;
      console.log('[Member List] 列表数据加载完成, 总数:', total.value);
    })
    .catch((error) => {
      console.error('[Member List] API请求失败:', error);
      loading.value = false;
    });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm('queryRef');
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  resetMemberForm();
  memberDrawer.value = true;
  memberTitle.value = '新增会员';
  memberForm.value.source = 'admin';

  loadLevelList();
  handleGenerateMemberNo();
}

/** 重置会员表单 */
function resetMemberForm() {
  memberForm.value = {
    id: undefined,
    userId: undefined,
    userName: '',
    memberNo: '',
    realName: '',
    idCard: '',
    birthday: '',
    signature: '',
    region: '',
    occupation: '',
    school: '',
    levelId: undefined,
    balance: 0,
    points: 0,
    totalConsumeAmount: 0,
    status: '0',
    source: '',
    registerTime: '',
    remark: ''
  };
  (proxy.$refs['memberRef'] as any)?.resetFields();
}

/** 取消按钮 */
function cancelMember() {
  memberDrawer.value = false;
  resetMemberForm();
}

/** 提交按钮 */
function submitMember() {
  (proxy.$refs['memberRef'] as any).validate((valid: boolean) => {
    if (valid) {
      memberLoading.value = true;
      if (memberForm.value.id) {
        updateMember(memberForm.value)
          .then(() => {
            proxy.$modal.msgSuccess('修改成功');
            memberDrawer.value = false;
            memberLoading.value = false;
            getList();
          })
          .catch(() => {
            memberLoading.value = false;
          });
      } else {
        addMember(memberForm.value)
          .then(() => {
            proxy.$modal.msgSuccess('新增成功');
            memberDrawer.value = false;
            memberLoading.value = false;
            getList();
          })
          .catch(() => {
            memberLoading.value = false;
          });
      }
    }
  });
}

/** 详情按钮操作 */
function handleDetail(row: any) {
  // 跳转到详情页，传入 userId
  proxy.$router.push({ path: '/member/member/detail/' + row.userId });
}

/** 删除按钮操作 */
function handleDelete(row?: any) {
  const memberIds = row?.id || ids.value;
  const memberNos =
    row?.memberNo ||
    memberList.value
      .filter((item) => ids.value.includes(item.id))
      .map((item) => item.memberNo)
      .join(',');
  proxy.$modal
    .confirm('是否确认删除会员编号为"' + memberNos + '"的数据项?')
    .then(function () {
      return delMember(memberIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 冻结按钮操作 */
function handleFreeze() {
  const memberIds = ids.value;
  proxy.$modal
    .confirm('是否确认冻结选中的' + memberIds.length + '个会员?')
    .then(function () {
      return freezeMember(memberIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('冻结成功');
    })
    .catch(() => {});
}

/** 解冻按钮操作 */
function handleUnfreeze() {
  const memberIds = ids.value;
  proxy.$modal
    .confirm('是否确认解冻选中的' + memberIds.length + '个会员?')
    .then(function () {
      return unfreezeMember(memberIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('解冻成功');
    })
    .catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'member/member/export',
    {
      ...queryParams.value
    },
    `member_${new Date().getTime()}.xlsx`
  );
}

/** 单个冻结 */
function handleFreezeSingle(row: any) {
  proxy.$modal
    .confirm('是否确认冻结会员"' + row.memberNo + '"?')
    .then(function () {
      return freezeMember([row.id]);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('冻结成功');
    })
    .catch(() => {});
}

/** 单个解冻 */
function handleUnfreezeSingle(row: any) {
  proxy.$modal
    .confirm('是否确认解冻会员"' + row.memberNo + '"?')
    .then(function () {
      return unfreezeMember([row.id]);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('解冻成功');
    })
    .catch(() => {});
}

/** 格式化金额(分转元) */
function formatAmount(amount: number) {
  if (!amount) return '0.00';
  return (amount / 100).toFixed(2);
}

/** 身份证脱敏 */
function desensitizeIdCard(idCard: string) {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.replace(/^(.{6})(?:\d+)(.{4})$/, '$1********$2');
}

/** 获取等级名称(映射为V1-V7) */
function getLevelName(levelId: number) {
  const level = levelList.value.find((item) => item.id === levelId);
  if (level && level.levelCode) {
    return level.levelCode;
  }
  return 'V' + levelId;
}

/** 获取等级标签类型 */
function getLevelType(levelId: number) {
  const level = levelList.value.find((item) => item.id === levelId);
  if (level && level.levelCode) {
    const code = level.levelCode.toUpperCase();
    if (code === 'V1') return 'info';
    if (code === 'V2') return '';
    if (code === 'V3' || code === 'V4') return 'success';
    if (code === 'V5' || code === 'V6') return 'warning';
    if (code === 'V7') return 'danger';
  }
  return 'info';
}

getList();
loadLevelList();
</script>

<style scoped>
.search-card {
  margin-bottom: 10px;
}

:deep(.el-card__body) {
  padding: 15px;
}

:deep(.el-form--inline .el-form-item) {
  margin-bottom: 10px;
}
</style>

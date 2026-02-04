<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="会员ID" prop="memberId">
              <el-input v-model="queryParams.memberId" placeholder="请输入会员ID" clearable @keyup.enter="handleQuery" style="width: 180px" />
            </el-form-item>
            <el-form-item label="变动类型" prop="changeType">
              <el-select v-model="queryParams.changeType" placeholder="请选择变动类型" clearable style="width: 150px">
                <el-option label="签到" value="1" />
                <el-option label="消费获得" value="2" />
                <el-option label="兑换" value="3" />
                <el-option label="过期" value="4" />
                <el-option label="系统调整" value="5" />
              </el-select>
            </el-form-item>
            <el-form-item label="业务单号" prop="businessNo">
              <el-input v-model="queryParams.businessNo" placeholder="请输入业务单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="过期时间" prop="expireTime">
              <el-date-picker clearable
                v-model="queryParams.expireTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择过期时间"
              />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['member:pointsLog:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['member:pointsLog:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['member:pointsLog:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['member:pointsLog:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border stripe :data="pointsLogList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="会员ID" align="center" prop="memberId" width="100" />
        <el-table-column label="变动类型" align="center" prop="changeType" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.changeType === '1'" type="success">签到</el-tag>
            <el-tag v-else-if="scope.row.changeType === '2'" type="primary">消费获得</el-tag>
            <el-tag v-else-if="scope.row.changeType === '3'" type="warning">兑换</el-tag>
            <el-tag v-else-if="scope.row.changeType === '4'" type="info">过期</el-tag>
            <el-tag v-else type="danger">系统调整</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="变动积分" align="center" prop="changePoints" width="120">
          <template #default="scope">
            <span :style="{ color: scope.row.changePoints >= 0 ? '#67C23A' : '#F56C6C', fontWeight: 'bold' }">
              {{ scope.row.changePoints >= 0 ? '+' : '' }}{{ scope.row.changePoints }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="变动前积分" align="center" prop="pointsBefore" width="120" />
        <el-table-column label="变动后积分" align="center" prop="pointsAfter" width="120" />
        <el-table-column label="业务单号" align="center" prop="businessNo" width="200" show-overflow-tooltip />
        <el-table-column label="过期时间" align="center" prop="expireTime" width="180">
          <template #default="scope">
            <span v-if="scope.row.expireTime" :class="{ 'text-danger': isExpired(scope.row.expireTime) }">
              {{ parseTime(scope.row.expireTime, '{y}-{m}-{d}') }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="变动时间" align="center" prop="createTime" width="180" />
        <el-table-column label="备注" align="center" prop="remark" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="120" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['member:pointsLog:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改会员积分记录对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="pointsLogFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会员ID" prop="memberId">
          <el-input v-model="form.memberId" placeholder="请输入会员ID" />
        </el-form-item>
        <el-form-item label="变动积分" prop="changePoints">
          <el-input v-model="form.changePoints" placeholder="请输入变动积分" />
        </el-form-item>
        <el-form-item label="变动前积分" prop="pointsBefore">
          <el-input v-model="form.pointsBefore" placeholder="请输入变动前积分" />
        </el-form-item>
        <el-form-item label="变动后积分" prop="pointsAfter">
          <el-input v-model="form.pointsAfter" placeholder="请输入变动后积分" />
        </el-form-item>
        <el-form-item label="业务单号" prop="businessNo">
          <el-input v-model="form.businessNo" placeholder="请输入业务单号" />
        </el-form-item>
        <el-form-item label="过期时间" prop="expireTime">
          <el-date-picker clearable
            v-model="form.expireTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择过期时间">
          </el-date-picker>
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

<script setup name="PointsLog" lang="ts">
import { listPointsLog, getPointsLog, delPointsLog, addPointsLog, updatePointsLog } from '@/api/member/pointsLog';
import { PointsLogVO, PointsLogQuery, PointsLogForm } from '@/api/member/pointsLog/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const pointsLogList = ref<PointsLogVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const pointsLogFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PointsLogForm = {
  id: undefined,
  memberId: undefined,
  changeType: undefined,
  changePoints: undefined,
  pointsBefore: undefined,
  pointsAfter: undefined,
  businessNo: undefined,
  expireTime: undefined,
  remark: undefined,
}
const data = reactive<PageData<PointsLogForm, PointsLogQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    memberId: undefined,
    changeType: undefined,
    changePoints: undefined,
    pointsBefore: undefined,
    pointsAfter: undefined,
    businessNo: undefined,
    expireTime: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
    memberId: [
      { required: true, message: "会员ID不能为空", trigger: "blur" }
    ],
    changeType: [
      { required: true, message: "变动类型不能为空", trigger: "change" }
    ],
    changePoints: [
      { required: true, message: "变动积分不能为空", trigger: "blur" }
    ],
    pointsBefore: [
      { required: true, message: "变动前积分不能为空", trigger: "blur" }
    ],
    pointsAfter: [
      { required: true, message: "变动后积分不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询会员积分记录列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPointsLog(queryParams.value);
  pointsLogList.value = res.rows;
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
  pointsLogFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PointsLogVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加会员积分记录";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: PointsLogVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getPointsLog(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改会员积分记录";
}

/** 提交按钮 */
const submitForm = () => {
  pointsLogFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updatePointsLog(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addPointsLog(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: PointsLogVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除会员积分记录编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delPointsLog(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('member/pointsLog/export', {
    ...queryParams.value
  }, `pointsLog_${new Date().getTime()}.xlsx`)
}

/** 判断是否已过期 */
const isExpired = (expireTime: string) => {
  if (!expireTime) return false;
  return new Date(expireTime).getTime() < new Date().getTime();
}

onMounted(() => {
  getList();
});
</script>

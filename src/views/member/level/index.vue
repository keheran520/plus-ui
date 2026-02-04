<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :inline="true" :model="queryParams">
            <el-form-item label="等级名称" prop="levelName">
              <el-input v-model="queryParams.levelName" clearable placeholder="请输入等级名称" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="等级编码" prop="levelCode">
              <el-input v-model="queryParams.levelCode" clearable placeholder="请输入等级编码" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="排序" prop="levelSort">
              <el-input v-model="queryParams.levelSort" clearable placeholder="请输入排序" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="折扣率" prop="discountRate">
              <el-input v-model="queryParams.discountRate" clearable placeholder="请输入折扣率" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="升级所需积分" prop="upgradePoints">
              <el-input v-model="queryParams.upgradePoints" clearable placeholder="请输入升级所需积分" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="升级所需累计消费金额" prop="upgradeAmount">
              <el-input v-model="queryParams.upgradeAmount" clearable placeholder="请输入升级所需累计消费金额" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="等级权益" prop="benefits">
              <el-input v-model="queryParams.benefits" clearable placeholder="请输入等级权益" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" clearable placeholder="请选择状态">
                <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
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
            <el-button v-hasPermi="['member:level:add']" icon="Plus" plain type="primary" @click="handleAdd">新增 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['member:level:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()"
              >修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['member:level:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()"
              >删除
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="levelList" border stripe @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="center" label="等级ID" prop="id" width="80" />
        <el-table-column align="center" label="等级名称" prop="levelName" width="150">
          <template #default="scope">
            {{ scope.row.levelName }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="等级编码" prop="levelCode" width="120">
          <template #default="scope">
            <strong>{{ scope.row.levelCode }}</strong>
          </template>
        </el-table-column>
        <el-table-column align="center" label="等级排序" prop="levelSort" sortable width="100" />
        <el-table-column align="center" label="折扣率" prop="discountRate" width="120">
          <template #default="scope">
            <strong>{{ scope.row.discountRate }}%</strong>
          </template>
        </el-table-column>
        <el-table-column align="center" label="所需成长值" prop="requiredGrowth" sortable width="140">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center">
              <el-icon color="#F56C6C" style="margin-right: 4px">
                <TrendCharts />
              </el-icon>
              <span style="color: #f56c6c; font-weight: bold; font-size: 14px">
                {{ scope.row.requiredGrowth || 0 }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="等级权益" min-width="200" prop="benefits" show-overflow-tooltip />
        <el-table-column align="center" label="状态" prop="status" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              v-hasPermi="['member:level:edit']"
              active-value="0"
              inactive-value="1"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
        <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="180">
          <template #default="scope">
            <el-button v-hasPermi="['member:level:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)"> 编辑 </el-button>
            <el-button v-hasPermi="['member:level:remove']" icon="Delete" link type="danger" @click="handleDelete(scope.row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改会员等级对话框 -->
    <el-drawer v-model="dialog.visible" :close-on-click-modal="false" :title="dialog.title" append-to-body size="700">
      <el-form ref="levelFormRef" :model="form" :rules="rules" label-position="top" label-width="90px">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="等级名称" prop="levelName">
              <el-input v-model="form.levelName" maxlength="50" placeholder="请输入等级名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="等级编码" prop="levelCode">
              <el-input v-model="form.levelCode" maxlength="50" placeholder="请输入等级编码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="等级排序" prop="levelSort">
              <el-input-number v-model="form.levelSort" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="折扣率(%)" prop="discountRate">
              <el-input-number v-model="form.discountRate" :max="100" :min="0" :precision="2" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="所需成长值" prop="requiredGrowth">
              <el-input-number v-model="form.requiredGrowth" :min="0" controls-position="right" placeholder="请输入所需成长值" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="等级权益" prop="benefits">
          <el-input
            v-model="form.benefits"
            :rows="4"
            maxlength="500"
            placeholder="请输入等级权益(JSON格式或描述文本)"
            show-word-limit
            type="textarea"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" :rows="3" maxlength="200" placeholder="请输入备注" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" name="Level" setup>
import { addLevel, delLevel, getLevel, listLevel, updateLevel } from '@/api/member/level/index';
import { LevelForm, LevelQuery, LevelVO } from '@/api/member/level/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const levelList = ref<LevelVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const levelFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: LevelForm = {
  id: undefined,
  levelName: undefined,
  levelCode: undefined,
  levelSort: 0,
  discountRate: 100,
  upgradePoints: 0,
  upgradeAmount: 0,
  upgradeAmountYuan: 0,
  benefits: undefined,
  status: '0',
  remark: undefined
};
const data = reactive<PageData<LevelForm, LevelQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    levelName: undefined,
    levelCode: undefined,
    levelSort: undefined,
    discountRate: undefined,
    upgradePoints: undefined,
    upgradeAmount: undefined,
    benefits: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    levelName: [{ required: true, message: '等级名称不能为空', trigger: 'blur' }],
    levelCode: [{ required: true, message: '等级编码不能为空', trigger: 'blur' }],
    levelSort: [{ required: true, message: '等级排序不能为空', trigger: 'blur' }],
    discountRate: [{ required: true, message: '折扣率不能为空', trigger: 'blur' }],
    requiredGrowth: [{ required: true, message: '所需成长值不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询会员等级列表 */
const getList = async () => {
  loading.value = true;
  const res = await listLevel(queryParams.value);
  levelList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  levelFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: LevelVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加会员等级';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: LevelVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getLevel(_id);
  Object.assign(form.value, res.data);
  // 将分转换为元
  form.value.upgradeAmountYuan = formatAmount(form.value.upgradeAmount);
  dialog.visible = true;
  dialog.title = '修改会员等级';
};

/** 提交按钮 */
const submitForm = () => {
  levelFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      // 将元转换为分
      form.value.upgradeAmount = Math.round((form.value.upgradeAmountYuan || 0) * 100);

      if (form.value.id) {
        await updateLevel(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addLevel(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: LevelVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除会员等级编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delLevel(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 状态修改 */
const handleStatusChange = (row: any) => {
  let text = row.status === '0' ? '启用' : '停用';
  proxy?.$modal
    .confirm('确认要"' + text + '""' + row.levelName + '"等级吗?')
    .then(function () {
      return updateLevel(row);
    })
    .then(() => {
      proxy?.$modal.msgSuccess(text + '成功');
    })
    .catch(function () {
      row.status = row.status === '0' ? '1' : '0';
    });
};

/** 格式化金额(分转元) */
const formatAmount = (amount: number) => {
  if (!amount) return 0;
  return amount / 100;
};

onMounted(() => {
  getList();
});
</script>

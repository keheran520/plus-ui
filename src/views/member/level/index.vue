<template>
  <div class="level-page">
    <section class="level-hero">
      <div>
        <span class="hero-tag">Level Strategy</span>
        <h1>会员等级体系</h1>
        <p>用成长值、折扣和权益把会员分层做清楚，让运营策略更容易落地。</p>
      </div>
      <div class="hero-metrics">
        <div class="metric-box">
          <span>等级数量</span>
          <strong>{{ total }}</strong>
        </div>
        <div class="metric-box">
          <span>启用等级</span>
          <strong>{{ activeCount }}</strong>
        </div>
      </div>
    </section>

    <el-card shadow="never" class="panel-card">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>筛选条件</h3>
            <p>支持按名称、编码和状态快速定位等级配置。</p>
          </div>
        </div>
      </template>
      <el-form ref="queryRef" :inline="true" :model="queryParams">
        <el-form-item label="等级名称">
          <el-input v-model="queryParams.levelName" clearable placeholder="请输入等级名称" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="等级编码">
          <el-input v-model="queryParams.levelCode" clearable placeholder="请输入编码" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" clearable placeholder="全部状态" style="width: 160px">
            <el-option label="启用" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="panel-card">
      <template #header>
        <div class="panel-header">
          <div>
            <h3>等级列表</h3>
            <p>等级由低到高排列，当前以成长值为升级核心。</p>
          </div>
          <div class="actions">
            <el-button v-hasPermi="['member:level:add']" type="primary" icon="Plus" @click="handleAdd">新增等级</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="levelList" stripe border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="等级信息" min-width="240">
          <template #default="{ row }">
            <div class="level-info">
              <strong>{{ row.levelName }}</strong>
              <span>{{ row.levelCode }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="levelSort" width="90" align="center" />
        <el-table-column label="所需成长值" prop="requiredGrowth" width="130" align="center" />
        <el-table-column label="折扣率" width="120" align="center">
          <template #default="{ row }">{{ row.discountRate }}%</template>
        </el-table-column>
        <el-table-column label="权益说明" prop="benefits" min-width="240" show-overflow-tooltip />
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="0" inactive-value="1" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-hasPermi="['member:level:edit']" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button v-hasPermi="['member:level:remove']" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-drawer v-model="dialog.visible" :title="dialog.title" size="680px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="等级名称" prop="levelName">
            <el-input v-model="form.levelName" maxlength="50" />
          </el-form-item>
          <el-form-item label="等级编码" prop="levelCode">
            <el-input v-model="form.levelCode" maxlength="50" />
          </el-form-item>
          <el-form-item label="排序" prop="levelSort">
            <el-input-number v-model="form.levelSort" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="所需成长值" prop="requiredGrowth">
            <el-input-number v-model="form.requiredGrowth" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="折扣率" prop="discountRate">
            <el-input-number v-model="form.discountRate" :min="0" :max="100" :precision="2" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio label="0">启用</el-radio>
              <el-radio label="1">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <el-form-item label="等级权益" prop="benefits">
          <el-input v-model="form.benefits" type="textarea" :rows="5" maxlength="500" show-word-limit placeholder="建议填写清晰可读的权益描述" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="buttonLoading" @click="submitForm">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { addLevel, delLevel, getLevel, listLevel, updateLevel } from '@/api/member/level';

const { proxy } = getCurrentInstance() as any;
const queryRef = ref();
const formRef = ref();

const loading = ref(false);
const buttonLoading = ref(false);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const levelList = ref<any[]>([]);
const dialog = reactive({ visible: false, title: '' });

const createForm = () => ({
  id: undefined,
  levelName: '',
  levelCode: '',
  levelSort: 0,
  discountRate: 100,
  requiredGrowth: 0,
  benefits: '',
  status: '0',
  remark: ''
});

const queryParams = ref<any>({
  pageNum: 1,
  pageSize: 10,
  levelName: undefined,
  levelCode: undefined,
  status: undefined
});

const form = ref<any>(createForm());
const rules = {
  levelName: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  levelCode: [{ required: true, message: '请输入等级编码', trigger: 'blur' }],
  levelSort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  requiredGrowth: [{ required: true, message: '请输入所需成长值', trigger: 'blur' }],
  discountRate: [{ required: true, message: '请输入折扣率', trigger: 'blur' }]
};

const activeCount = computed(() => levelList.value.filter((item) => item.status === '0').length);

async function getList() {
  loading.value = true;
  try {
    const res = await listLevel(queryParams.value);
    levelList.value = (res.rows || []).sort((a: any, b: any) => Number(a.levelSort || 0) - Number(b.levelSort || 0));
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
  queryParams.value = { pageNum: 1, pageSize: 10, levelName: undefined, levelCode: undefined, status: undefined };
  queryRef.value?.resetFields?.();
  getList();
}

function handleSelectionChange(selection: any[]) {
  ids.value = selection.map((item) => item.id);
}

function handleAdd() {
  form.value = createForm();
  dialog.title = '新增等级';
  dialog.visible = true;
}

async function handleEdit(row: any) {
  const res = await getLevel(row.id);
  form.value = { ...createForm(), ...res.data };
  dialog.title = '编辑等级';
  dialog.visible = true;
}

function submitForm() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (form.value.id) {
        await updateLevel(form.value);
      } else {
        await addLevel(form.value);
      }
      proxy.$modal.msgSuccess('保存成功');
      dialog.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
}

async function handleDelete(row: any) {
  const target = row?.id || ids.value;
  await proxy.$modal.confirm('确认删除选中的等级配置吗？');
  await delLevel(target);
  proxy.$modal.msgSuccess('删除成功');
  await getList();
}

async function handleStatusChange(row: any) {
  await updateLevel({ ...row });
  proxy.$modal.msgSuccess('状态已更新');
  await getList();
}

onMounted(() => {
  getList();
});
</script>

<style scoped>
.level-page { padding: 16px; background: linear-gradient(180deg, #f7f9fc 0%, #eef3f8 100%); min-height: 100%; }
.level-hero { display: flex; justify-content: space-between; gap: 18px; padding: 24px; border-radius: 24px; background: linear-gradient(135deg, #213657 0%, #416d94 100%); color: #fff; }
.hero-tag { display: inline-block; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.12); font-size: 12px; }
.level-hero h1 { margin: 12px 0 8px; font-size: 30px; }
.level-hero p { margin: 0; color: rgba(255,255,255,.76); }
.hero-metrics { display: flex; gap: 12px; }
.metric-box { min-width: 120px; padding: 16px; border-radius: 18px; background: rgba(255,255,255,.1); }
.metric-box span, .metric-box strong { display: block; }
.metric-box span { font-size: 12px; color: rgba(255,255,255,.72); }
.metric-box strong { margin-top: 10px; font-size: 26px; }
.panel-card { margin-top: 18px; border: none; border-radius: 22px; box-shadow: 0 12px 34px rgba(27,46,67,.08); }
.panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.panel-header h3 { margin: 0; font-size: 18px; color: #213547; }
.panel-header p { margin: 6px 0 0; color: #7d8ca0; font-size: 13px; }
.actions { display: flex; gap: 10px; }
.level-info { display: flex; flex-direction: column; gap: 4px; }
.level-info strong { color: #203449; }
.level-info span { color: #8392a5; font-size: 12px; }
.form-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 14px; }
@media (max-width: 900px) {
  .level-hero, .panel-header { flex-direction: column; align-items: flex-start; }
  .hero-metrics, .form-grid { width: 100%; grid-template-columns: 1fr; display: grid; }
}
</style>

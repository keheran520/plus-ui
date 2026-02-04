<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="父级" prop="parentId">
              <el-input v-model="queryParams.parentId" placeholder="请输入父级" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="简称" prop="shortName">
              <el-input v-model="queryParams.shortName" placeholder="请输入简称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="经度" prop="longitude">
              <el-input v-model="queryParams.longitude" placeholder="请输入经度" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="纬度" prop="latitude">
              <el-input v-model="queryParams.latitude" placeholder="请输入纬度" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="级别" prop="level">
              <el-input v-model="queryParams.level" placeholder="请输入级别" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="排序" prop="sort">
              <el-input v-model="queryParams.sort" placeholder="请输入排序" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
                <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value"/>
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

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd()" v-hasPermi="['system:area:add']">新增</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>
      <el-table
        ref="areaTableRef"
        v-loading="loading"
        :data="areaList"
        row-key="areaId"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        lazy
        :load="loadChildren"
      >
        <el-table-column label="父级" prop="parentId" />
        <el-table-column label="名称" align="center" prop="name" />
        <el-table-column label="简称" align="center" prop="shortName" />
        <el-table-column label="经度" align="center" prop="longitude" />
        <el-table-column label="纬度" align="center" prop="latitude" />
        <el-table-column label="级别" align="center" prop="level" />
        <el-table-column label="排序" align="center" prop="sort" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:area:edit']" />
            </el-tooltip>
            <el-tooltip content="新增" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:area:add']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:area:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加或修改地址对话框 -->
    <el-drawer :title="dialog.title" v-model="dialog.visible" size="500">
      <el-form ref="areaFormRef" :model="form" :rules="rules" label-width="80px" label-position="top">
        <el-form-item label="父级" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="areaOptions"
            :props="{ value: 'areaId', label: 'name', children: 'children' }"
            value-key="areaId"
            placeholder="请选择父级"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="简称" prop="shortName">
          <el-input v-model="form.shortName" placeholder="请输入简称" />
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input-number v-model="form.longitude" placeholder="请输入经度" style="width: 100%;"/>
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input-number v-model="form.latitude"  placeholder="请输入纬度" style="width: 100%;"/>
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-input-number v-model="form.level" placeholder="请输入级别" style="width: 100%;"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number  v-model="form.sort" placeholder="请输入排序" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
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

<script setup name="Area" lang="ts">
import { listArea, getArea, delArea, addArea, updateArea } from "@/api/system/area";
import { AreaVO, AreaQuery, AreaForm } from '@/api/system/area/types';

type AreaOption = {
  areaId: number;
  name: string;
  children?: AreaOption[];
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;;

const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const areaList = ref<AreaVO[]>([]);
const areaOptions = ref<AreaOption[]>([]);
const buttonLoading = ref(false);
const showSearch = ref(true);
const loading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const areaFormRef = ref<ElFormInstance>();
const areaTableRef = ref<ElTableInstance>()

const dialog = reactive<DialogOption>({
    visible: false,
    title: ''
});


const initFormData: AreaForm = {
    areaId: undefined,
    parentId: undefined,
    name: undefined,
    shortName: undefined,
    longitude: undefined,
    latitude: undefined,
    level: undefined,
    sort: undefined,
    status: undefined,
}

const data = reactive<PageData<AreaForm, AreaQuery>>({
  form: {...initFormData},
  queryParams: {
    parentId: undefined,
    name: undefined,
    shortName: undefined,
    longitude: undefined,
    latitude: undefined,
    level: undefined,
    sort: undefined,
    status: undefined,
  },
  rules: {
    areaId: [
      { required: true, message: "主键不能为空", trigger: "blur" },
    ], parentId: [
      { required: true, message: "父级不能为空", trigger: "blur" },
    ], name: [
      { required: true, message: "名称不能为空", trigger: "blur" },
    ], shortName: [
      { required: true, message: "简称不能为空", trigger: "blur" },
    ], longitude: [
      { required: true, message: "经度不能为空", trigger: "blur" },
    ], latitude: [
      { required: true, message: "维度不能为空", trigger: "blur" },
    ], level: [
      { required: true, message: "级别不能为空", trigger: "blur" },
    ],sort: [
      { required: true, message: "排序不能为空", trigger: "blur" },
    ],status: [
      { required: true, message: "状态不能为空", trigger: "blur" },
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询地址列表 */
const getList = async () => {
  loading.value = true;
  try {
    // 默认查询一级数据（parentId=0）
    const params = { ...queryParams.value };
    if (!params.parentId) {
      params.parentId = 0;
    }
    const res = await listArea(params);
    areaList.value = res.data || [];
  } finally {
    loading.value = false;
  }
}

/** 懒加载子级数据 */
const loadChildren = async (row: AreaVO, treeNode: any, resolve: Function) => {
  try {
    const res = await listArea({ parentId: row.areaId });
    resolve(res.data || []);
  } catch (error) {
    console.error('加载子级数据失败:', error);
    resolve([]);
  }
}

/** 查询地址下拉树结构 */
const getTreeselect = async () => {
  // 使用tree接口获取完整树形结构（用于下拉选择）
  const res = await listArea({ useTree: true });
  areaOptions.value = [];
  const data: AreaOption = { areaId: 0, name: '顶级节点', children: [] };
  data.children = proxy?.handleTree<AreaOption>(res.data, "areaId", "parentId");
  areaOptions.value.push(data);
}

// 取消按钮
const cancel = () => {
  reset();
  dialog.visible = false;
}

// 表单重置
const reset = () => {
  form.value = {...initFormData}
  areaFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 新增按钮操作 */
const handleAdd = (row?: AreaVO) => {
  reset();
  getTreeselect();
  if (row != null && row.areaId) {
    form.value.parentId = row.areaId;
  } else {
    form.value.parentId = 0;
  }
  dialog.visible = true;
  dialog.title = "添加地址";
}

/** 修改按钮操作 */
const handleUpdate = async (row: AreaVO) => {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  const res = await getArea(row.areaId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改地址";
}

/** 提交按钮 */
const submitForm = () => {
  areaFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.areaId) {
        await updateArea(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addArea(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row: AreaVO) => {
  await proxy?.$modal.confirm('是否确认删除地址编号为"' + row.areaId + '"的数据项？');
  loading.value = true;
  await delArea(row.areaId).finally(() => loading.value = false);
  await getList();
  proxy?.$modal.msgSuccess("删除成功");
}

onMounted(() => {
  getList();
});
</script>

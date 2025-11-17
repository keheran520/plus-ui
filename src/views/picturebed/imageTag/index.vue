<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :inline="true" :model="queryParams">
            <el-form-item label="标签名称" prop="tagName">
              <el-input v-model="queryParams.tagName" clearable placeholder="请输入标签名称" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="标签编码" prop="tagCode">
              <el-input v-model="queryParams.tagCode" clearable placeholder="请输入标签编码" @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['picturebed:imageTag:add']" icon="Plus" plain type="primary" @click="handleAdd"> 新增 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['picturebed:imageTag:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate()"
              >修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['picturebed:imageTag:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete()"
              >删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['picturebed:imageTag:export']" icon="Download" plain type="warning" @click="handleExport">导出 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="imageTagList" border @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column v-if="false" align="center" label="标签ID" prop="tagId" />
        <el-table-column align="center" label="标签名称" prop="tagName" />
        <el-table-column align="center" label="标签编码" prop="tagCode" />
        <el-table-column align="center" label="标签颜色" prop="tagColor">
          <template #default="scope">
            <div v-if="scope.row.tagColor" class="flex items-center justify-center gap-2">
              <div
                :style="{ backgroundColor: scope.row.tagColor }"
                class="w-6 h-6 rounded border border-gray-300"
              ></div>
              <span>{{ scope.row.tagColor }}</span>
            </div>
            <span v-else class="text-gray-400">未设置</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="标签图标" prop="tagIcon" />
        <el-table-column align="center" label="使用次数" prop="useCount" />
        <el-table-column align="center" label="显示顺序" prop="sortOrder" />
        <el-table-column align="center" label="状态" prop="status" />
        <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['picturebed:imageTag:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['picturebed:imageTag:remove']" icon="Delete" link type="primary" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改图片标签对话框 -->
    <el-drawer v-model="dialog.visible" :title="dialog.title" append-to-body size="500">
      <el-form ref="imageTagFormRef" :model="form" :rules="rules" label-position="top" label-width="80px">
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="form.tagName" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签编码" prop="tagCode">
          <el-input v-model="form.tagCode" placeholder="请输入标签编码" />
        </el-form-item>
        <el-form-item label="标签图标" prop="tagIcon">
          <el-input v-model="form.tagIcon" placeholder="请输入标签图标" />
        </el-form-item>
        <el-form-item label="标签颜色" prop="tagColor">
          <div class="flex items-center gap-2">
            <el-color-picker v-model="form.tagColor" show-alpha />
            <el-input v-model="form.tagColor" placeholder="请选择或输入颜色值（如：#FF5733）" style="flex: 1" />
          </div>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="使用次数" prop="useCount">
              <el-input-number v-model="form.useCount" controls-position="right" placeholder="请输入使用次数" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" controls-position="right" placeholder="请输入显示顺序" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }} </el-radio>
          </el-radio-group>
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

<script lang="ts" name="ImageTag" setup>
import { addImageTag, delImageTag, getImageTag, listImageTag, updateImageTag } from '@/api/picturebed/imageTag';
import { ImageTagForm, ImageTagQuery, ImageTagVO } from '@/api/picturebed/imageTag/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const imageTagList = ref<ImageTagVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const imageTagFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ImageTagForm = {
  tagId: undefined,
  tagName: undefined,
  tagCode: undefined,
  tagColor: undefined,
  tagIcon: undefined,
  useCount: 0,
  sortOrder: 0,
  status: '0'
};
const data = reactive<PageData<ImageTagForm, ImageTagQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tagName: undefined,
    tagCode: undefined,
    tagColor: undefined,
    tagIcon: undefined,
    useCount: undefined,
    sortOrder: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    tagId: [{ required: true, message: '标签ID不能为空', trigger: 'blur' }],
    tagName: [{ required: true, message: '标签名称不能为空', trigger: 'blur' }],
    tagColor: [
      {
        validator: (rule: any, value: any, callback: any) => {
          if (value && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
            callback(new Error('颜色格式不正确，请使用十六进制颜色值（如：#FF5733）'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ],
    useCount: [{ required: true, message: '使用次数不能为空', trigger: 'blur' }],
    sortOrder: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询图片标签列表 */
const getList = async () => {
  loading.value = true;
  const res = await listImageTag(queryParams.value);
  imageTagList.value = res.rows;
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
  imageTagFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ImageTagVO[]) => {
  ids.value = selection.map((item) => item.tagId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加图片标签';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ImageTagVO) => {
  reset();
  const _tagId = row?.tagId || ids.value[0];
  const res = await getImageTag(_tagId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改图片标签';
};

/** 提交按钮 */
const submitForm = () => {
  imageTagFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.tagId) {
        await updateImageTag(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addImageTag(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ImageTagVO) => {
  const _tagIds = row?.tagId || ids.value;
  await proxy?.$modal.confirm('是否确认删除图片标签编号为"' + _tagIds + '"的数据项？').finally(() => (loading.value = false));
  await delImageTag(_tagIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'picturebed/imageTag/export',
    {
      ...queryParams.value
    },
    `imageTag_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

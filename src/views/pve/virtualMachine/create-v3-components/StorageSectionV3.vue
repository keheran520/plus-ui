<template>
  <el-form-item label="存储" required>
    <div class="storage-config-wrapper">
      <!-- 存储表格 -->
      <el-table :data="storageList" border class="storage-table" row-key="id">
        <el-table-column label="用途" prop="usage" width="100">
          <template #default="{ row }">
            <el-tag :type="row.usage === 'system' ? 'primary' : 'success'">
              {{ row.usage === 'system' ? '系统盘' : '数据盘' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="容量" prop="size">
          <template #default="{ row }">
            <el-input-number
              v-model="row.size"
              :max="2048"
              :min="row.usage === 'system' ? 40 : 10"
              :style="{ width: '150px' }"
              controls-position="right"
              @change="updateParent"
            >
              <template #suffix> GiB </template>
            </el-input-number>
          </template>
        </el-table-column>

        <el-table-column label="IOPS" prop="iops">
          <template #default="{ row }">
            {{ row.iops }}
          </template>
        </el-table-column>

        <el-table-column label="吞吐量" prop="throughput">
          <template #default="{ row }"> {{ row.throughput }}MB/S </template>
        </el-table-column>

        <el-table-column label="费用" prop="price">
          <template #default="{ row }">
            <span style="color: #909399">{{ row.price || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="150">
          <template #default="{ row }">
            <el-button :disabled="row.usage === 'system'" size="small" type="text" @click="removeStorage(row.id)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 表格底部 - 添加数据盘 -->
      <div class="storage-table-footer">
        <el-button bg size="small" text @click="addDataDisk">
          <el-icon><Plus /></el-icon>
          添加数据盘
        </el-button>
        <span class="storage-tip">您可以为实例添加 1 至 15 块数据盘。</span>
      </div>
    </div>
  </el-form-item>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

interface Props {
  modelValue?: {
    systemDisk: any;
    dataDisks: any[];
  };
  storagePoolList?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  storagePoolList: () => []
});

const emit = defineEmits(['update:modelValue']);

// 初始化存储列表
const initStorageList = () => {
  const list = [];

  // 系统盘
  list.push({
    id: 'storage-system',
    usage: 'system',
    type: props.modelValue?.systemDisk?.type || 'ssd',
    perf: 'pl0',
    size: props.modelValue?.systemDisk?.size || 40,
    iops: 2040,
    throughput: 105,
    price: ''
  });

  // 数据盘
  if (props.modelValue?.dataDisks && props.modelValue.dataDisks.length > 0) {
    props.modelValue.dataDisks.forEach((disk: any, index: number) => {
      list.push({
        id: `storage-data-${index}`,
        usage: 'data',
        type: disk.type || 'ssd',
        perf: 'pl0',
        size: disk.size || 20,
        iops: 2040,
        throughput: 105,
        price: ''
      });
    });
  }

  return list;
};

const storageList = ref(initStorageList());

// 添加数据盘
const addDataDisk = () => {
  if (storageList.value.length >= 16) {
    ElMessage.warning('最多只能添加15块数据盘');
    return;
  }
  storageList.value.push({
    id: `storage-data-${Date.now()}`,
    usage: 'data',
    type: 'ssd',
    perf: 'pl0',
    size: 20,
    iops: 2040,
    throughput: 105,
    price: ''
  });
  updateParent();
};

// 删除存储
const removeStorage = (id: string) => {
  const index = storageList.value.findIndex((item) => item.id === id);
  if (index > -1) {
    storageList.value.splice(index, 1);
    updateParent();
  }
};

// 更新父组件数据
const updateParent = () => {
  const systemDisk = storageList.value.find((item) => item.usage === 'system');
  const dataDisks = storageList.value.filter((item) => item.usage === 'data');

  emit('update:modelValue', {
    systemDisk: {
      type: systemDisk?.type || 'ssd',
      size: systemDisk?.size || 40
    },
    dataDisks: dataDisks.map((disk) => ({
      type: disk.type,
      size: disk.size
    }))
  });
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      storageList.value = initStorageList();
    }
  },
  { deep: true }
);

// 暴露给父组件
defineExpose({
  storageList
});
</script>

<style lang="scss" scoped>
.storage-config-wrapper {
  width: 100%;
}

// 存储表格
.storage-table {
  :deep(.el-table__header th) {
    background: #f5f7fa;
    font-weight: 500;
    font-size: 13px;
  }

  :deep(.el-table__body td) {
    font-size: 13px;
  }
}

// 存储表格底部
.storage-table-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
  border: 1px solid #ebeef5;
  border-top: none;
}

.storage-tip {
  font-size: 12px;
  color: #909399;
}
</style>

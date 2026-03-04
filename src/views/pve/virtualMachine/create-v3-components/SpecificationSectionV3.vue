<template>
  <div class="form-section">
    <SectionTitle>实例配置</SectionTitle>
    <el-space direction="vertical" fill :size="20">
      <!-- 计算规格 -->
      <el-form-item label="计算规格" required>
        <div class="spec-config-wrapper">
          <!-- 筛选器 -->
          <div class="spec-filters">
            <el-select v-model="filters.cpu" clearable placeholder="全部vCPU" style="width: 150px;">
              <el-option label="2 vCPU" value="2" />
              <el-option label="4 vCPU" value="4" />
              <el-option label="8 vCPU" value="8" />
              <el-option label="16 vCPU" value="16" />
            </el-select>
            <el-select v-model="filters.memory" clearable placeholder="全部内存" style="width: 150px;">
              <el-option label="8 GiB" value="8" />
              <el-option label="16 GiB" value="16" />
              <el-option label="32 GiB" value="32" />
              <el-option label="64 GiB" value="64" />
            </el-select>
            <el-input
              v-model="filters.search"
              clearable
              placeholder="搜索实例规格"
              style="width: 250px;"
            />
          </div>

          <!-- 规格类型标签 -->
          <el-radio-group v-model="specType" class="spec-type-radio-group">
            <el-radio
              v-for="type in specTypes"
              :key="type.value"
              :label="type.value"
              class="spec-type-radio"
            >
              <template #default>
                <div :class="[{ checked: specType === type.value }]" class="spec-type-card">
                  <div class="spec-type-title">{{ type.label }}</div>
                </div>
              </template>
            </el-radio>
          </el-radio-group>

          <!-- 规格表格 -->
          <el-table
            :data="filteredComputeSpecs"
            :max-height="400"
            border
            class="spec-table"
            row-key="id"
            @row-click="handleSpecSelect"
          >
            <el-table-column width="50" align="center">
              <template #default="{ row }">
                <el-radio
                  :disabled="row.disabled"
                  :model-value="selectedSpecId === row.id"
                  @change="handleSpecSelect(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="规格族" prop="family" width="160">
              <template #default="{ row }">
                {{ row.family }}
                <el-tag v-if="row.disabled" type="danger" size="small" style="margin-left: 8px;">
                  {{ row.soldOutMessage }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="实例规格" prop="name" width="140" />
            <el-table-column label="vCPU" prop="cpu" width="80" align="center">
              <template #default="{ row }">{{ row.cpu }} vCPU</template>
            </el-table-column>
            <el-table-column label="内存" prop="memory" width="80" align="center">
              <template #default="{ row }">{{ row.memory }} GiB</template>
            </el-table-column>
            <el-table-column label="可用区域" prop="zone" width="100" />
            <el-table-column label="主频/睿频" prop="frequency" width="160" />
            <el-table-column label="网络带宽基准/峰值" prop="bandwidth" width="160" />
            <el-table-column label="参考价格" prop="price" width="160" align="right" fixed="right">
              <template #default="{ row }">
                <span style="color: #ff6b00; font-weight: 500;">¥ {{ row.price }}</span> 元/时
              </template>
            </el-table-column>
          </el-table>

          <!-- 选中的规格信息 -->
          <div v-if="selectedSpec" class="selected-spec-info">
            <el-icon style="color: #67c23a; margin-right: 8px;"><CircleCheck /></el-icon>
            <span>当前所选：</span>
            <span class="spec-name">{{ selectedSpec.name }}</span>
            <span class="spec-detail">{{ selectedSpec.cpu }} vCPU {{ selectedSpec.memory }} GiB</span>
            <span class="spec-price">¥ {{ selectedSpec.price }} 元/时</span>
          </div>
        </div>
      </el-form-item>
    </el-space>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { CircleCheck } from '@element-plus/icons-vue';
import SectionTitle from '@/components/SectionTitle/index.vue';

interface Props {
  modelValue: {
    specType: string;
    selectedSpecId: string;
  };
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue', 'spec-selected']);

// 规格筛选器
const filters = reactive({
  cpu: undefined,
  memory: undefined,
  search: '',
});

// 规格类型列表
const specTypes = [
  { value: 'all', label: '全部机型' },
  { value: 'general', label: '通用型' },
  { value: 'compute', label: '计算型' },
  { value: 'memory', label: '内存型' },
];

// 计算规格列表
const computeSpecs = ref([
  {
    id: 'spec1',
    family: '通用型g4i',
    name: 'ecs.g4i.large',
    cpu: 2,
    memory: 2,
    zone: '全可用区',
    frequency: '2.8 GHz / 3.3 GHz',
    bandwidth: '2.5 Gbps / 10 Gbps',
    price: '0.4591',
    disabled: false,
  },
  {
    id: 'spec2',
    family: '通用型g4i',
    name: 'ecs.g4i.xlarge',
    cpu: 2,
    memory: 4,
    zone: '全可用区',
    frequency: '2.8 GHz / 3.3 GHz',
    bandwidth: '4 Gbps / 10 Gbps',
    price: '0.9181',
    disabled: false,
  },
  {
    id: 'spec3',
    family: '通用型g4i',
    name: 'ecs.g4i.2xlarge',
    cpu: 4,
    memory: 8,
    zone: '全可用区',
    frequency: '2.8 GHz / 3.3 GHz',
    bandwidth: '6 Gbps / 10 Gbps',
    price: '1.8361',
    disabled: false,
  },
  {
    id: 'spec5',
    family: '计算型c7',
    name: 'ecs.c7.large',
    cpu: 2,
    memory: 4,
    zone: '全可用区',
    frequency: '3.0 GHz / 3.5 GHz',
    bandwidth: '3 Gbps / 10 Gbps',
    price: '0.5200',
    disabled: false,
  },
  {
    id: 'spec6',
    family: '计算型c7',
    name: 'ecs.c7.xlarge',
    cpu: 4,
    memory: 8,
    zone: '全可用区',
    frequency: '3.0 GHz / 3.5 GHz',
    bandwidth: '5 Gbps / 10 Gbps',
    price: '1.0400',
    disabled: false,
  },
  {
    id: 'spec7',
    family: '内存型r7',
    name: 'ecs.r7.large',
    cpu: 2,
    memory: 16,
    zone: '全可用区',
    frequency: '2.7 GHz / 3.5 GHz',
    bandwidth: '3 Gbps / 10 Gbps',
    price: '0.8800',
    disabled: true,
    soldOutMessage: '该规格族已经售空',
  },
  {
    id: 'spec8',
    family: '内存型r7',
    name: 'ecs.r7.xlarge',
    cpu: 4,
    memory: 32,
    zone: '全可用区',
    frequency: '2.7 GHz / 3.5 GHz',
    bandwidth: '5 Gbps / 10 Gbps',
    price: '1.7600',
    disabled: true,
    soldOutMessage: '该规格族已经售空',
  },
]);

// 双向绑定
const specType = computed({
  get: () => props.modelValue.specType,
  set: (val) => emit('update:modelValue', { ...props.modelValue, specType: val }),
});

const selectedSpecId = computed({
  get: () => props.modelValue.selectedSpecId,
  set: (val) => emit('update:modelValue', { ...props.modelValue, selectedSpecId: val }),
});

// 选中的规格
const selectedSpec = computed(() => {
  if (!selectedSpecId.value) return null;
  return computeSpecs.value.find((spec) => spec.id === selectedSpecId.value);
});

// 过滤后的规格列表
const filteredComputeSpecs = computed(() => {
  let specs = computeSpecs.value;

  // 按规格类型筛选
  if (specType.value && specType.value !== 'all') {
    specs = specs.filter((spec) => spec.family.includes(specType.value === 'general'
      ? '通用型'
      : specType.value === 'compute'
        ? '计算型'
        : specType.value === 'memory'
          ? '内存型'
          : specType.value === 'gpu' ? 'GPU' : ''));
  }

  // 按CPU筛选
  if (filters.cpu) {
    specs = specs.filter((spec) => spec.cpu === Number(filters.cpu));
  }

  // 按内存筛选
  if (filters.memory) {
    specs = specs.filter((spec) => spec.memory === Number(filters.memory));
  }

  // 按搜索关键词筛选
  if (filters.search) {
    const keyword = filters.search.toLowerCase();
    specs = specs.filter((spec) =>
      spec.name.toLowerCase().includes(keyword)
      || spec.family.toLowerCase().includes(keyword),
    );
  }

  return specs;
});

// 选择计算规格
const handleSpecSelect = (record: any) => {
  // 如果规格已禁用，不允许选择
  if (record.disabled) {
    ElMessage.warning(record.soldOutMessage || '该规格不可用');
    return;
  }
  selectedSpecId.value = record.id;
  emit('spec-selected', record);
};
</script>

<style lang="scss" scoped>
@import './common.scss';

.spec-config-wrapper {
  width: 100%;
}

.spec-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.spec-table {
  :deep(.el-table__header th) {
    background: #f5f7fa;
    font-weight: 500;
  }

  :deep(.el-table__row) {
    cursor: pointer;

    &:hover {
      background: #f5f7fa;
    }
  }

  :deep(.el-radio) {
    margin-right: 0;
  }
}

.selected-spec-info {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;

  .spec-name {
    font-weight: 500;
    color: #303133;
  }

  .spec-detail {
    color: #606266;
  }

  .spec-price {
    margin-left: auto;
    color: #ff6b00;
    font-weight: 500;
    font-size: 15px;
  }
}
</style>

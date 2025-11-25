<template>
  <el-card class="device-card" shadow="never">
    <div class="card-header">
      <span class="card-title">在线设备</span>
      <span class="device-count">{{ devices.length }} 台设备在线</span>
    </div>
    <div class="px-6 py-3">
      <el-table v-loading="loading" :data="devices" style="width: 100%">
        <el-table-column :show-overflow-tooltip="true" align="center" label="设备类型" prop="os" width="120">
          <template #default="scope">
            <dict-tag :options="sys_device_type" :value="scope.row.deviceType" />
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" label="主机" prop="ipaddr" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="登录地点" prop="loginLocation" width="150" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="操作系统" prop="os" width="120" />
        <el-table-column :show-overflow-tooltip="true" align="center" label="浏览器" prop="browser" width="120" />
        <el-table-column align="center" label="登录时间" prop="loginTime" width="180">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.loginTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="100">
          <template #default="scope">
            <el-tooltip content="删除" placement="top">
              <el-button icon="Delete" link type="primary" @click="handldDelOnline(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="!loading && devices.length === 0" :image-size="100" description="暂无在线设备" />
    </div>
  </el-card>
</template>

<script lang="ts" name="Online" setup>
import { delOnline } from '@/api/monitor/online';
import { propTypes } from '@/utils/propTypes';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_device_type } = toRefs<any>(proxy?.useDict('sys_device_type'));

const props = defineProps({
  devices: propTypes.any.isRequired
});
const devices = computed(() => props.devices);

const loading = ref(false);

/** 删除按钮操作 */
const handldDelOnline = (row: any) => {
  ElMessageBox.confirm('删除设备后，在该设备登录需要重新进行验证！', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  })
    .then(() => {
      return delOnline(row.tokenId);
    })
    .then((res: any) => {
      if (res.code === 200) {
        proxy?.$modal.msgSuccess('删除成功');
        proxy?.$tab.refreshPage();
      } else {
        proxy?.$modal.msgError(res.msg);
      }
    })
    .catch(() => {});
};
</script>

<style lang="scss" scoped>
.device-card {
  border: none;
  border-radius: var(--radius-lg);

  :deep(.el-card__body) {
    padding: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(180deg, var(--primary-light-9), #fff0);

  .card-title {
    font-size: 16px;
    color: #303133;
  }

  .device-count {
    font-size: 13px;
    color: #909399;
  }
}
</style>

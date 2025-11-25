<template>
  <div class="profile-page">
    <el-row :gutter="16">
      <!-- 左侧：基本信息 -->
      <el-col :lg="7" :md="10" :sm="24" :xl="6" :xs="24">
        <BasicInfo :post-group="state.postGroup" :role-group="state.roleGroup" :user="state.user" @refresh="getUser" />
      </el-col>

      <!-- 右侧：安全设置和第三方账号 -->
      <el-col :lg="17" :md="14" :sm="24" :xl="18" :xs="24">
        <!-- 安全设置 -->
        <Security :user="state.user" @refresh="getUser" />

        <!-- 第三方账号 -->
        <div style="margin-top: 16px">
          <Social :auths="state.auths" @refresh="getAuths" />
        </div>

        <!-- 在线设备 -->
        <div style="margin-top: 16px">
          <OnlineDevice :devices="state.devices" @refresh="getOnlines" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" name="Profile" setup>
import BasicInfo from './BasicInfo.vue';
import Security from './Security.vue';
import Social from './Social.vue';
import OnlineDevice from './onlineDevice.vue';
import { getAuthList } from '@/api/system/social/auth';
import { getUserProfile } from '@/api/system/user';
import { getOnline } from '@/api/monitor/online';
import { UserVO } from '@/api/system/user/types';

interface State {
  user: Partial<UserVO>;
  roleGroup: string;
  postGroup: string;
  auths: any[];
  devices: any[];
}

const state = ref<State>({
  user: {},
  roleGroup: '',
  postGroup: '',
  auths: [],
  devices: []
});

const getUser = async () => {
  const res = await getUserProfile();
  state.value.user = res.data.user;
  state.value.roleGroup = res.data.roleGroup;
  state.value.postGroup = res.data.postGroup;
};

const getAuths = async () => {
  const res = await getAuthList();
  state.value.auths = res.data;
};

const getOnlines = async () => {
  const res = await getOnline();
  state.value.devices = res.rows;
};

onMounted(() => {
  getUser();
  getAuths();
  getOnlines();
});
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 16px;
  background-color: #f5f7f9;
  min-height: calc(100vh - 100px);
}
</style>

<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <el-card shadow="never" class="header-card">
      <el-page-header @back="goBack" :icon="ArrowLeft">
        <template #content>
          <div class="header-content">
            <el-avatar :size="50" :src="memberDetail.avatar || defaultAvatar" style="margin-right: 15px" />
            <div>
              <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px">
                {{ memberDetail.nickName || memberDetail.userName || '会员详情' }}
                <el-tag v-if="memberDetail.status === '0'" type="success" effect="dark" size="small" style="margin-left: 10px">正常</el-tag>
                <el-tag v-else-if="memberDetail.status === '1'" type="danger" effect="dark" size="small" style="margin-left: 10px">冻结</el-tag>
              </div>
              <div style="color: #909399; font-size: 14px">
                会员编号: {{ memberDetail.memberNo || '-' }}
              </div>
            </div>
          </div>
        </template>
        <template #extra>
          <el-button-group>
            <el-button type="primary" icon="CreditCard" @click="handleRecharge" v-hasPermi="['member:member:recharge']">充值</el-button>
            <el-button type="warning" icon="TrophyBase" @click="handlePoints" v-hasPermi="['member:member:adjustPoints']">积分</el-button>
            <el-button v-if="memberDetail.status === '0'" type="danger" icon="Lock" @click="handleFreeze" v-hasPermi="['member:member:freeze']">冻结</el-button>
            <el-button v-else type="success" icon="Unlock" @click="handleUnfreeze" v-hasPermi="['member:member:unfreeze']">解冻</el-button>
          </el-button-group>
        </template>
      </el-page-header>
    </el-card>

    <!-- 标签页内容 -->
    <el-card shadow="never" style="margin-top: 10px">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <div class="detail-container">
            <el-row :gutter="20">
              <!-- 资产卡片 -->
              <el-col :span="6">
                <el-card shadow="hover" class="asset-card balance-card">
                  <template #header>
                    <div class="card-header">
                      <el-icon :size="24" color="#67C23A"><Money /></el-icon>
                      <span>账户余额</span>
                    </div>
                  </template>
                  <div class="asset-value balance-value">
                    <div class="amount">￥ {{ formatAmount(memberDetail.balance) }}</div>
                    <div class="label">当前可用余额</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover" class="asset-card points-card">
                  <template #header>
                    <div class="card-header">
                      <el-icon :size="24" color="#E6A23C"><TrophyBase /></el-icon>
                      <span>会员积分</span>
                    </div>
                  </template>
                  <div class="asset-value points-value">
                    <div class="amount">{{ memberDetail.points || 0 }}</div>
                    <div class="label">累计积分</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover" class="asset-card consume-card">
                  <template #header>
                    <div class="card-header">
                      <el-icon :size="24" color="#409EFF"><ShoppingCart /></el-icon>
                      <span>累计消费</span>
                    </div>
                  </template>
                  <div class="asset-value consume-value">
                    <div class="amount">￥ {{ formatAmount(memberDetail.totalConsumeAmount) }}</div>
                    <div class="label">历史累计消费</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover" class="asset-card growth-card">
                  <template #header>
                    <div class="card-header">
                      <el-icon :size="24" color="#F56C6C"><TrendCharts /></el-icon>
                      <span>成长值</span>
                    </div>
                  </template>
                  <div class="asset-value growth-value">
                    <div class="amount">{{ memberDetail.growthValue || 0 }}</div>
                    <div class="label">
                      {{ getLevelName(memberDetail.levelId) }} 等级
                      <el-button v-hasPermi="['member:member:adjustGrowth']" link type="danger" size="small" @click="handleAdjustGrowth" style="margin-left: 8px">
                        <el-icon><Edit /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <div v-if="nextLevel" class="growth-progress">
                    <el-progress :percentage="growthProgress" :stroke-width="8" :format="() => `${nextLevel.requiredGrowth - (memberDetail.growthValue || 0)}`" />
                    <div style="font-size: 12px; color: #909399; margin-top: 5px; text-align: center">
                      距离 {{ nextLevel.levelName }} 还需 {{ nextLevel.requiredGrowth - (memberDetail.growthValue || 0) }} 成长值
                    </div>
                  </div>
                  <div v-else style="font-size: 12px; color: #67C23A; margin-top: 10px; text-align: center">
                    已达最高等级
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 会员信息 -->
            <el-divider content-position="left">会员信息</el-divider>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="会员ID">{{ memberDetail.id || '-' }}</el-descriptions-item>
              <el-descriptions-item label="会员编号">
                <el-tag type="primary" effect="plain">{{ memberDetail.memberNo || '-' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="会员姓名">
                <span>{{ memberDetail.realName || '-' }}</span>
                <el-button v-hasPermi="['member:member:edit']" link type="primary" size="small" @click="handleEditField('realName')" style="margin-left: 8px">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-descriptions-item>
              <el-descriptions-item label="身份证号">
                <span v-if="memberDetail.idCard">{{ desensitizeIdCard(memberDetail.idCard) }}</span>
                <span v-else>-</span>
                <el-button v-hasPermi="['member:member:edit']" link type="primary" size="small" @click="handleEditField('idCard')" style="margin-left: 8px">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-descriptions-item>
              <el-descriptions-item label="生日">
                <span>{{ memberDetail.birthday || '-' }}</span>
                <el-button v-hasPermi="['member:member:edit']" link type="primary" size="small" @click="handleEditField('birthday')" style="margin-left: 8px">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-descriptions-item>
              <el-descriptions-item label="会员等级">
                <el-tag v-if="memberDetail.levelId" type="warning" effect="dark">
                  <el-icon><Star /></el-icon> 等级{{ memberDetail.levelId }}
                </el-tag>
                <span v-else>-</span>
                <el-button v-hasPermi="['member:member:edit']" link type="primary" size="small" @click="handleEditField('levelId')" style="margin-left: 8px">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-descriptions-item>
              <el-descriptions-item label="注册来源">
                <el-tag v-if="memberDetail.source === 'app'" type="success" effect="plain">APP</el-tag>
                <el-tag v-else-if="memberDetail.source === 'h5'" type="primary" effect="plain">H5</el-tag>
                <el-tag v-else-if="memberDetail.source === 'mini'" type="warning" effect="plain">小程序</el-tag>
                <el-tag v-else-if="memberDetail.source === 'pc'" type="info" effect="plain">PC</el-tag>
                <el-tag v-else-if="memberDetail.source === 'admin'" type="info" effect="plain">后台添加</el-tag>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">
                <el-icon style="margin-right: 4px"><Clock /></el-icon>
                {{ memberDetail.registerTime || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="备注" :span="2">
                <span>{{ memberDetail.remark || '-' }}</span>
                <el-button v-hasPermi="['member:member:edit']" link type="primary" size="small" @click="handleEditField('remark')" style="margin-left: 8px">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>

        <!-- 余额日志 -->
        <el-tab-pane label="余额日志" name="balance">
          <div class="detail-container">
            <el-table :data="balanceLogList" border stripe v-loading="balanceLoading">
              <el-table-column label="序号" type="index" width="60" align="center" />
              <el-table-column label="变动类型" prop="changeType" width="120" align="center">
                <template #default="scope">
                  <el-tag v-if="scope.row.changeType === '1'" type="success">充值</el-tag>
                  <el-tag v-else-if="scope.row.changeType === '2'" type="danger">消费</el-tag>
                  <el-tag v-else-if="scope.row.changeType === '3'" type="warning">退款</el-tag>
                  <el-tag v-else type="info">系统调整</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="变动金额(元)" prop="changeAmount" width="150" align="center">
                <template #default="scope">
                  <span :style="{ color: scope.row.changeAmount >= 0 ? '#67C23A' : '#F56C6C', fontWeight: 'bold' }">
                    {{ scope.row.changeAmount >= 0 ? '+' : '' }}{{ formatAmount(scope.row.changeAmount) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="变动前余额(元)" prop="balanceBefore" width="150" align="center">
                <template #default="scope">
                  {{ formatAmount(scope.row.balanceBefore) }}
                </template>
              </el-table-column>
              <el-table-column label="变动后余额(元)" prop="balanceAfter" width="150" align="center">
                <template #default="scope">
                  {{ formatAmount(scope.row.balanceAfter) }}
                </template>
              </el-table-column>
              <el-table-column label="业务单号" prop="businessNo" width="180" align="center" show-overflow-tooltip>
                <template #default="scope">
                  {{ scope.row.businessNo || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="变动时间" prop="createTime" width="180" align="center" />
              <el-table-column label="备注" prop="remark" min-width="200" show-overflow-tooltip>
                <template #default="scope">
                  {{ scope.row.remark || '-' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 积分日志 -->
        <el-tab-pane label="积分日志" name="points">
          <div class="detail-container">
            <el-table :data="pointsLogList" border stripe v-loading="pointsLoading">
              <el-table-column label="序号" type="index" width="60" align="center" />
              <el-table-column label="变动类型" prop="changeType" width="120" align="center">
                <template #default="scope">
                  <el-tag v-if="scope.row.changeType === '1'" type="success">签到</el-tag>
                  <el-tag v-else-if="scope.row.changeType === '2'" type="primary">消费获得</el-tag>
                  <el-tag v-else-if="scope.row.changeType === '3'" type="warning">兑换</el-tag>
                  <el-tag v-else-if="scope.row.changeType === '4'" type="info">过期</el-tag>
                  <el-tag v-else type="danger">系统调整</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="变动积分" prop="changePoints" width="120" align="center">
                <template #default="scope">
                  <span :style="{ color: scope.row.changePoints >= 0 ? '#67C23A' : '#F56C6C', fontWeight: 'bold' }">
                    {{ scope.row.changePoints >= 0 ? '+' : '' }}{{ scope.row.changePoints }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="变动前积分" prop="pointsBefore" width="120" align="center" />
              <el-table-column label="变动后积分" prop="pointsAfter" width="120" align="center" />
              <el-table-column label="业务单号" prop="businessNo" width="180" align="center" show-overflow-tooltip>
                <template #default="scope">
                  {{ scope.row.businessNo || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="过期时间" prop="expireTime" width="180" align="center">
                <template #default="scope">
                  {{ scope.row.expireTime || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="变动时间" prop="createTime" width="180" align="center" />
              <el-table-column label="备注" prop="remark" min-width="200" show-overflow-tooltip>
                <template #default="scope">
                  {{ scope.row.remark || '-' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 成长值记录 -->
        <el-tab-pane label="成长值记录" name="growth">
          <div class="detail-container">
            <el-table :data="growthLogList" border stripe v-loading="growthLoading">
              <el-table-column label="序号" type="index" width="60" align="center" />
              <el-table-column label="变动类型" prop="changeType" width="120" align="center">
                <template #default="scope">
                  <el-tag v-if="scope.row.changeType === '1'" type="success">消费获得</el-tag>
                  <el-tag v-else-if="scope.row.changeType === '2'" type="primary">活动获得</el-tag>
                  <el-tag v-else-if="scope.row.changeType === '3'" type="warning">签到获得</el-tag>
                  <el-tag v-else-if="scope.row.changeType === '4'" type="info">系统调整</el-tag>
                  <el-tag v-else type="danger">过期扣除</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="变动值" prop="changeValue" width="120" align="center">
                <template #default="scope">
                  <span :style="{ color: scope.row.changeValue >= 0 ? '#67C23A' : '#F56C6C', fontWeight: 'bold' }">
                    {{ scope.row.changeValue >= 0 ? '+' : '' }}{{ scope.row.changeValue }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="变动前成长值" prop="growthBefore" width="140" align="center" />
              <el-table-column label="变动后成长值" prop="growthAfter" width="140" align="center" />
              <el-table-column label="业务单号" prop="businessNo" width="180" align="center" show-overflow-tooltip>
                <template #default="scope">
                  {{ scope.row.businessNo || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="变动时间" prop="createTime" width="180" align="center" />
              <el-table-column label="备注" prop="remark" min-width="200" show-overflow-tooltip>
                <template #default="scope">
                  {{ scope.row.remark || '-' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 充值对话框 -->
    <el-dialog 
      title="会员充值" 
      v-model="rechargeDialog" 
      width="550px" 
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="rechargeRef" :model="rechargeForm" :rules="rechargeRules" label-width="110px">
        <el-form-item label="会员编号">
          <el-input v-model="rechargeForm.memberNo" disabled />
        </el-form-item>
        <el-form-item label="当前余额">
          <el-statistic :value="formatAmount(rechargeForm.currentBalance)" suffix="元">
            <template #prefix>
              <el-icon style="vertical-align: middle; color: #67C23A"><Money /></el-icon>
            </template>
          </el-statistic>
        </el-form-item>
        <el-form-item label="充值金额" prop="amount">
          <el-input-number
            v-model="rechargeForm.amount"
            :min="0.01"
            :step="10"
            :precision="2"
            placeholder="请输入充值金额"
            style="width: 100%;"
            controls-position="right"
          />
          <span style="margin-left: 10px; color: #909399">元</span>
        </el-form-item>
        <el-form-item label="快捷金额">
          <el-button-group>
            <el-button size="small" @click="rechargeForm.amount = 10">10元</el-button>
            <el-button size="small" @click="rechargeForm.amount = 50">50元</el-button>
            <el-button size="small" @click="rechargeForm.amount = 100">100元</el-button>
            <el-button size="small" @click="rechargeForm.amount = 500">500元</el-button>
            <el-button size="small" @click="rechargeForm.amount = 1000">1000元</el-button>
          </el-button-group>
        </el-form-item>
        <el-form-item label="充值说明" prop="remark">
          <el-input
            v-model="rechargeForm.remark"
            type="textarea"
            placeholder="请输入充值说明(选填)"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rechargeDialog = false">取消</el-button>
        <el-button type="primary" @click="submitRecharge" :loading="rechargeLoading">确认充值</el-button>
      </template>
    </el-dialog>

    <!-- 积分调整对话框 -->
    <el-dialog 
      title="积分调整" 
      v-model="pointsDialog" 
      width="550px" 
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="pointsRef" :model="pointsForm" :rules="pointsRules" label-width="110px">
        <el-form-item label="会员编号">
          <el-input v-model="pointsForm.memberNo" disabled />
        </el-form-item>
        <el-form-item label="当前积分">
          <el-statistic :value="pointsForm.currentPoints" suffix="积分">
            <template #prefix>
              <el-icon style="vertical-align: middle; color: #E6A23C"><TrophyBase /></el-icon>
            </template>
          </el-statistic>
        </el-form-item>
        <el-form-item label="调整类型" prop="type">
          <el-radio-group v-model="pointsForm.type" size="large">
            <el-radio label="add" border>增加积分</el-radio>
            <el-radio label="reduce" border>减少积分</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调整数量" prop="amount">
          <el-input-number
            v-model="pointsForm.amount"
            :min="1"
            :step="10"
            placeholder="请输入调整数量"
            style="width: 100%;"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="调整说明" prop="remark">
          <el-input
            v-model="pointsForm.remark"
            type="textarea"
            placeholder="请输入调整说明(选填)"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pointsDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAdjustPoints" :loading="pointsLoading">确认调整</el-button>
      </template>
    </el-dialog>

    <!-- 字段编辑对话框 -->
    <el-dialog 
      :title="editFieldTitle" 
      v-model="editFieldDialog" 
      width="500px" 
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="editFieldRef" :model="editFieldForm" :rules="editFieldRules" label-width="110px">
        <!-- 真实姓名 -->
        <el-form-item v-if="editFieldForm.field === 'realName'" label="真实姓名" prop="value">
          <el-input v-model="editFieldForm.value" clearable placeholder="请输入真实姓名" maxlength="50" />
        </el-form-item>
        
        <!-- 身份证号 -->
        <el-form-item v-if="editFieldForm.field === 'idCard'" label="身份证号" prop="value">
          <el-input v-model="editFieldForm.value" clearable placeholder="请输入身份证号" maxlength="18" />
        </el-form-item>
        
        <!-- 生日 -->
        <el-form-item v-if="editFieldForm.field === 'birthday'" label="生日" prop="value">
          <el-date-picker 
            v-model="editFieldForm.value" 
            placeholder="请选择生日" 
            style="width: 100%" 
            type="date" 
            value-format="YYYY-MM-DD" 
          />
        </el-form-item>
        
        <!-- 会员等级 -->
        <el-form-item v-if="editFieldForm.field === 'levelId'" label="会员等级" prop="value">
          <el-select v-model="editFieldForm.value" clearable placeholder="请选择会员等级" style="width: 100%">
            <el-option v-for="level in levelList" :key="level.id" :label="`${level.levelName} (折扣率: ${level.discountRate}%)`" :value="level.id">
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>
                  <el-icon><Star /></el-icon>
                  {{ level.levelName }}
                </span>
                <el-tag size="small" type="warning">折扣: {{ level.discountRate }}%</el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 备注 -->
        <el-form-item v-if="editFieldForm.field === 'remark'" label="备注" prop="value">
          <el-input 
            v-model="editFieldForm.value" 
            type="textarea" 
            placeholder="请输入备注" 
            :rows="3" 
            maxlength="200" 
            show-word-limit 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editFieldDialog = false">取消</el-button>
        <el-button type="primary" @click="submitEditField" :loading="editFieldLoading">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- 成长值调整对话框 -->
    <el-dialog 
      title="成长值调整" 
      v-model="growthDialog" 
      width="550px" 
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="growthRef" :model="growthForm" :rules="growthRules" label-width="110px">
        <el-form-item label="会员编号">
          <el-input v-model="growthForm.memberNo" disabled />
        </el-form-item>
        <el-form-item label="当前成长值">
          <el-statistic :value="growthForm.currentGrowth" suffix="成长值">
            <template #prefix>
              <el-icon style="vertical-align: middle; color: #F56C6C"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-form-item>
        <el-form-item label="调整类型" prop="type">
          <el-radio-group v-model="growthForm.type" size="large">
            <el-radio border label="add">
              <el-icon><Plus /></el-icon>
              增加
            </el-radio>
            <el-radio border label="minus">
              <el-icon><Minus /></el-icon>
              减少
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调整数量" prop="amount">
          <el-input-number
            v-model="growthForm.amount"
            :min="1"
            :step="10"
            placeholder="请输入调整数量"
            style="width: 100%;"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="快捷设置">
          <el-button-group>
            <el-button size="small" @click="growthForm.amount = 10">10</el-button>
            <el-button size="small" @click="growthForm.amount = 50">50</el-button>
            <el-button size="small" @click="growthForm.amount = 100">100</el-button>
            <el-button size="small" @click="growthForm.amount = 200">200</el-button>
            <el-button size="small" @click="growthForm.amount = 500">500</el-button>
          </el-button-group>
        </el-form-item>
        <el-form-item label="变动类型">
          <el-select v-model="growthForm.changeType" placeholder="请选择变动类型" style="width: 100%">
            <el-option label="消费获得" value="1" />
            <el-option label="活动获得" value="2" />
            <el-option label="签到获得" value="3" />
            <el-option label="系统调整" value="4" />
            <el-option label="过期扣除" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="调整说明" prop="remark">
          <el-input
            v-model="growthForm.remark"
            type="textarea"
            placeholder="请输入调整说明(选填)"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="growthDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAdjustGrowth" :loading="growthLoading">确认调整</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ArrowLeft, Edit, Star, Money, TrophyBase, ShoppingCart, CreditCard, Lock, Unlock, Clock, TrendCharts, Plus, Minus } from '@element-plus/icons-vue';
import { getMemberDetailByUserId, recharge, adjustPoints, freezeMember, unfreezeMember, updateMember } from '@/api/member/member';
import { getBalanceLogByMemberId } from '@/api/member/balanceLog';
import { getPointsLogByMemberId } from '@/api/member/pointsLog';
import { listLevel } from '@/api/member/level';

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as any;

// 从路由获取 userId
const userId = ref<number>(parseInt(route.params.id as string));
const activeTab = ref('basic');
const memberDetail = ref<any>({});
const memberId = ref<number>(); // 会员ID，查询详情后赋值
const defaultAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');

// 余额日志
const balanceLogList = ref<any[]>([]);
const balanceLoading = ref(false);

// 积分日志
const pointsLogList = ref<any[]>([]);
const pointsLoading = ref(false);

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

// 成长值调整表单
const growthDialog = ref(false);
const growthLoading = ref(false);
const growthForm = ref({
  id: undefined as number | undefined,
  memberNo: '',
  currentGrowth: 0,
  type: 'add',
  amount: undefined as number | undefined,
  changeType: '4', // 默认系统调整
  remark: ''
});
const growthRules = ref({
  type: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
  amount: [
    { required: true, message: '调整数量不能为空', trigger: 'blur' },
    { type: 'number', min: 1, message: '调整数量必须大于0', trigger: 'blur' }
  ]
});

// 字段编辑
const editFieldDialog = ref(false);
const editFieldLoading = ref(false);
const editFieldTitle = ref('');
const editFieldForm = ref({
  field: '',
  value: undefined as any
});
const levelList = ref<any[]>([]);

// 字段编辑校验规则
const editFieldRules = ref({
  value: [
    {
      validator: (rule: any, value: any, callback: any) => {
        const field = editFieldForm.value.field;
        if (field === 'idCard' && value) {
          const pattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/;
          if (!pattern.test(value)) {
            callback(new Error('请输入正确的身份证号'));
          } else {
            callback();
          }
        } else if (field === 'realName' && value && value.length > 50) {
          callback(new Error('真实姓名不能超过50个字符'));
        } else if (field === 'levelId' && !value) {
          callback(new Error('请选择会员等级'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});

/** 获取会员详情 */
function getDetail() {
  getMemberDetailByUserId(userId.value).then((response: any) => {
    memberDetail.value = response.data;
    // 赋值会员ID，用于后续操作
    memberId.value = response.data.id;
  });
}

/** 加载余额日志 */
function loadBalanceLog() {
  balanceLoading.value = true;
  getBalanceLogByMemberId(memberId.value).then((response: any) => {
    balanceLogList.value = response.data;
    balanceLoading.value = false;
  }).catch(() => {
    balanceLoading.value = false;
  });
}

/** 加载积分日志 */
function loadPointsLog() {
  pointsLoading.value = true;
  getPointsLogByMemberId(memberId.value).then((response: any) => {
    pointsLogList.value = response.data;
    pointsLoading.value = false;
  }).catch(() => {
    pointsLoading.value = false;
  });
}

/** 加载成长值日志 */
function loadGrowthLog() {
  growthLoading.value = true;
  getGrowthLogByMemberId(memberId.value).then((response: any) => {
    growthLogList.value = response.data;
    growthLoading.value = false;
  }).catch(() => {
    growthLoading.value = false;
  });
}

/** 标签页切换 */
watch(activeTab, (newTab) => {
  if (newTab === 'balance' && balanceLogList.value.length === 0) {
    loadBalanceLog();
  } else if (newTab === 'points' && pointsLogList.value.length === 0) {
    loadPointsLog();
  } else if (newTab === 'growth' && growthLogList.value.length === 0) {
    loadGrowthLog();
  }
});

/** 返回列表 */
function goBack() {
  router.push({ path: '/member/member' });
}

/** 充值操作 */
function handleRecharge() {
  rechargeForm.value = {
    id: memberDetail.value.id,
    memberNo: memberDetail.value.memberNo,
    currentBalance: memberDetail.value.balance || 0,
    amount: undefined,
    remark: ''
  };
  rechargeDialog.value = true;
}

/** 提交充值 */
function submitRecharge() {
  (proxy.$refs['rechargeRef'] as any).validate((valid: boolean) => {
    if (valid) {
      rechargeLoading.value = true;
      const amount = Math.round((rechargeForm.value.amount || 0) * 100); // 转换为分
      recharge({
        id: rechargeForm.value.id!,
        amount: amount,
        remark: rechargeForm.value.remark
      }).then(() => {
        proxy.$modal.msgSuccess('充值成功');
        rechargeDialog.value = false;
        rechargeLoading.value = false;
        getDetail();
        // 刷新余额日志
        if (activeTab.value === 'balance') {
          loadBalanceLog();
        }
      }).catch(() => {
        rechargeLoading.value = false;
      });
    }
  });
}

/** 积分调整操作 */
function handlePoints() {
  pointsForm.value = {
    id: memberDetail.value.id,
    memberNo: memberDetail.value.memberNo,
    currentPoints: memberDetail.value.points || 0,
    type: 'add',
    amount: undefined,
    remark: ''
  };
  pointsDialog.value = true;
}

/** 提交积分调整 */
function submitAdjustPoints() {
  (proxy.$refs['pointsRef'] as any).validate((valid: boolean) => {
    if (valid) {
      pointsLoading.value = true;
      const points = pointsForm.value.type === 'add' ? pointsForm.value.amount! : -pointsForm.value.amount!;
      adjustPoints({
        id: pointsForm.value.id!,
        points: points,
        remark: pointsForm.value.remark
      }).then(() => {
        proxy.$modal.msgSuccess('调整成功');
        pointsDialog.value = false;
        pointsLoading.value = false;
        getDetail();
        // 刷新积分日志
        if (activeTab.value === 'points') {
          loadPointsLog();
        }
      }).catch(() => {
        pointsLoading.value = false;
      });
    }
  });
}

/** 冻结会员 */
function handleFreeze() {
  proxy.$modal.confirm('是否确认冻结该会员?').then(function() {
    return freezeMember([memberDetail.value.id]);
  }).then(() => {
    proxy.$modal.msgSuccess('冻结成功');
    getDetail();
  }).catch(() => {});
}

/** 解冻会员 */
function handleUnfreeze() {
  proxy.$modal.confirm('是否确认解冻该会员?').then(function() {
    return unfreezeMember([memberDetail.value.id]);
  }).then(() => {
    proxy.$modal.msgSuccess('解冻成功');
    getDetail();
  }).catch(() => {});
}

/** 加载会员等级列表 */
async function loadLevelList() {
  try {
    const res = await listLevel({ status: '0' });
    levelList.value = res.rows || [];
  } catch (error) {
    console.error('加载会员等级失败:', error);
  }
}

/** 处理字段编辑 */
function handleEditField(field: string) {
  const fieldTitles: Record<string, string> = {
    realName: '编辑真实姓名',
    idCard: '编辑身份证号',
    birthday: '编辑生日',
    levelId: '编辑会员等级',
    remark: '编辑备注'
  };
  
  editFieldTitle.value = fieldTitles[field] || '编辑字段';
  editFieldForm.value.field = field;
  editFieldForm.value.value = memberDetail.value[field];
  
  // 如果是编辑等级，需要加载等级列表
  if (field === 'levelId') {
    loadLevelList();
  }
  
  editFieldDialog.value = true;
}

/** 提交字段编辑 */
function submitEditField() {
  (proxy.$refs['editFieldRef'] as any).validate((valid: boolean) => {
    if (valid) {
      editFieldLoading.value = true;
      
      // 构建更新数据
      const updateData: any = {
        id: memberDetail.value.id,
        userId: memberDetail.value.userId,
        memberNo: memberDetail.value.memberNo,
        status: memberDetail.value.status
      };
      
      // 设置要更新的字段
      updateData[editFieldForm.value.field] = editFieldForm.value.value;
      
      updateMember(updateData).then(() => {
        proxy.$modal.msgSuccess('修改成功');
        editFieldDialog.value = false;
        editFieldLoading.value = false;
        getDetail();
      }).catch(() => {
        editFieldLoading.value = false;
      });
    }
  });
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

/** 成长值调整操作 */
function handleAdjustGrowth() {
  growthForm.value = {
    id: memberDetail.value.id,
    memberNo: memberDetail.value.memberNo,
    currentGrowth: memberDetail.value.growthValue || 0,
    type: 'add',
    amount: undefined,
    changeType: '4',
    remark: ''
  };
  growthDialog.value = true;
}

/** 提交成长值调整 */
function submitAdjustGrowth() {
  (proxy.$refs['growthRef'] as any).validate((valid: boolean) => {
    if (valid) {
      growthLoading.value = true;
      const growthValue = growthForm.value.type === 'add' ? growthForm.value.amount! : -growthForm.value.amount!;
      adjustMemberGrowth({
        id: growthForm.value.id!,
        growthValue: growthValue,
        changeType: growthForm.value.changeType,
        remark: growthForm.value.remark
      }).then(() => {
        proxy.$modal.msgSuccess('调整成功');
        growthDialog.value = false;
        growthLoading.value = false;
        getDetail();
        // 刷新成长值日志
        if (activeTab.value === 'growth') {
          loadGrowthLog();
        }
      }).catch(() => {
        growthLoading.value = false;
      });
    }
  });
}

/** 获取等级名称 */
function getLevelName(levelId: number) {
  if (!levelId) return 'V1';
  const level = levelList.value.find(item => item.id === levelId);
  return level && level.levelCode ? level.levelCode : 'V' + levelId;
}

/** 计算下一个等级 */
const nextLevel = computed(() => {
  if (!memberDetail.value.levelId || levelList.value.length === 0) return null;
  const currentGrowth = memberDetail.value.growthValue || 0;
  // 找到当前等级索引
  const currentIndex = levelList.value.findIndex(l => l.id === memberDetail.value.levelId);
  if (currentIndex === -1) return null;
  // 找到下一个等级(按requiredGrowth排序后的下一个)
  const sortedLevels = [...levelList.value].sort((a, b) => (a.requiredGrowth || 0) - (b.requiredGrowth || 0));
  const currentSortedIndex = sortedLevels.findIndex(l => l.id === memberDetail.value.levelId);
  if (currentSortedIndex === -1 || currentSortedIndex >= sortedLevels.length - 1) return null;
  return sortedLevels[currentSortedIndex + 1];
});

/** 计算成长值进度 */
const growthProgress = computed(() => {
  if (!nextLevel.value || !memberDetail.value.levelId) return 0;
  const currentGrowth = memberDetail.value.growthValue || 0;
  const currentLevel = levelList.value.find(l => l.id === memberDetail.value.levelId);
  if (!currentLevel) return 0;
  const currentRequired = currentLevel.requiredGrowth || 0;
  const nextRequired = nextLevel.value.requiredGrowth || 0;
  const range = nextRequired - currentRequired;
  if (range === 0) return 100;
  const progress = ((currentGrowth - currentRequired) / range) * 100;
  return Math.min(Math.max(progress, 0), 100);
});

onMounted(() => {
  getDetail();
  loadLevelList();
});
</script>

<style scoped>
.header-card {
  margin-bottom: 10px;
}

.header-content {
  display: flex;
  align-items: center;
}

.detail-container {
  padding: 20px;
}

.asset-card {
  height: 180px;
  transition: all 0.3s;
}

.asset-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: bold;
}

.asset-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.asset-value .amount {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
}

.asset-value .label {
  font-size: 14px;
  color: #909399;
}

.balance-card .amount {
  color: #67C23A;
}

.points-card .amount {
  color: #E6A23C;
}

.consume-card .amount {
  color: #409EFF;
}

.growth-card .amount {
  color: #F56C6C;
}

.growth-progress {
  margin-top: 15px;
  padding: 0 10px;
}

:deep(.el-descriptions__label) {
  width: 120px;
  font-weight: bold;
}

:deep(.el-card__body) {
  padding: 15px;
}
</style>

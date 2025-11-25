<template>
  <div class="bg-white rounded-lg p-7 mb-4 shadow-sm">
    <div class="text-lg font-medium text-gray-900 mb-3">快捷导航</div>
    <!-- 最近访问 -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-3">
        <div class="text-xs text-gray-500">最近访问</div>
        <el-button v-if="recentVisits.length > 0" size="small" text type="danger" @click="handleClearHistory"> 清空记录 </el-button>
      </div>
      <div v-if="recentVisits.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <div
          v-for="(item, index) in recentVisits"
          :key="index"
          class="flex items-center p-3 border border-gray-100 rounded hover:bg-gray-50 hover:border-blue-200 cursor-pointer transition-colors"
          @click="handleNav(item)"
        >
          <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
            <svg-icon :icon-class="item.icon || 'dashboard'" class="text-lg" />
          </div>
          <span class="text-sm text-gray-700 truncate flex-1">{{ item.title }}</span>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-400 text-sm">暂无访问记录</div>
    </div>
    <!-- 自定义快捷入口 -->
    <div>
      <div class="text-xs text-gray-500 mb-3">自定义快捷入口</div>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <div
          v-for="(item, index) in customShortcuts"
          :key="item.id"
          class="relative flex items-center p-3 border border-gray-100 rounded hover:bg-gray-50 hover:border-blue-200 cursor-pointer transition-colors group"
          @click="handleNav(item)"
        >
          <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 mr-3">
            <svg-icon :icon-class="item.icon || 'dashboard'" class="text-lg" />
          </div>
          <span class="text-sm text-gray-700 truncate flex-1">{{ item.title }}</span>
          <el-icon
            class="absolute top-1 right-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop="handleRemoveShortcut(item.id)"
          >
            <Close />
          </el-icon>
        </div>

        <!-- 添加入口按钮 -->
        <div
          class="flex items-center justify-center p-3 border border-dashed border-gray-300 rounded hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors text-gray-500"
          @click="showAddDialog = true"
        >
          <el-icon class="mr-1">
            <Plus />
          </el-icon>
          <span class="text-sm">添加入口</span>
        </div>
      </div>
    </div>

    <!-- 添加快捷方式对话框 -->
    <el-dialog v-model="showAddDialog" title="添加快捷入口" width="600px">
      <el-form :model="shortcutForm" label-width="80px">
        <el-form-item label="选择菜单">
          <el-tree-select
            v-model="shortcutForm.path"
            :data="menuTree"
            :props="{
              label: 'title',
              value: 'path',
              children: 'children',
              disabled: 'disabled'
            }"
            check-strictly
            filterable
            placeholder="请选择具体的菜单页面（不能选择目录）"
            @change="handleMenuChange"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Close, Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { clearVisitHistory, getVisitHistory, type VisitRecord } from '@/utils/visitHistory';
import { addShortcut, getShortcuts, removeShortcut, type Shortcut } from '@/utils/shortcuts';
import { usePermissionStore } from '@/store/modules/permission';
import SvgIcon from '@/components/SvgIcon/index.vue';

const router = useRouter();
const permissionStore = usePermissionStore();

// 最近访问数据
const recentVisits = ref<VisitRecord[]>([]);

// 自定义快捷入口数据
const customShortcuts = ref<Shortcut[]>([]);

// 添加对话框相关
const showAddDialog = ref(false);
const shortcutForm = ref({
  path: '',
  name: '',
  title: '',
  icon: ''
});

// 将路由转换为树形结构菜单
const menuTree = computed(() => {
  const routes = permissionStore.sidebarRouters || [];

  const convertToTree = (routes: any[], parentPath = ''): any[] => {
    return routes
      .filter((route) => {
        // 排除隐藏的路由、无标题的路由和外链
        return !route.hidden && route.meta?.title && !route.path?.startsWith('http');
      })
      .map((route) => {
        // 拼接完整路径
        let fullPath = route.path;
        if (parentPath && !route.path.startsWith('/')) {
          fullPath = `${parentPath}/${route.path}`;
        } else if (!route.path.startsWith('/')) {
          fullPath = `/${route.path}`;
        }

        // 过滤子路由（排除隐藏的和外链）
        const validChildren = route.children?.filter((child: any) => !child.hidden && child.meta?.title && !child.path?.startsWith('http'));
        const hasChildren = validChildren && validChildren.length > 0;

        return {
          path: fullPath,
          title: route.meta?.title || route.name,
          name: route.name,
          icon: route.meta?.icon || 'dashboard',
          disabled: hasChildren, // 有子节点的禁用，只能选择叶子节点
          children: hasChildren ? convertToTree(route.children, fullPath) : undefined
        };
      });
  };

  return convertToTree(routes);
});

// 获取图标名称（提供默认值）
const getIconName = (iconName: string | undefined): string => {
  // 如果没有图标名称，返回默认图标
  return iconName || 'dashboard';
};

// 加载数据
const loadData = () => {
  recentVisits.value = getVisitHistory();
  customShortcuts.value = getShortcuts();
};

// 页面跳转
const handleNav = (item: any) => {
  if (!item.path) {
    ElMessage.warning('路径不存在');
    return;
  }

  console.log('跳转路由：', item.path);

  // 外链处理
  if (item.path.startsWith('http')) {
    window.open(item.path, '_blank');
    return;
  }

  // 路由跳转
  router.push(item.path).catch((err) => {
    console.error('路由跳转失败：', err);
    ElMessage.error('页面跳转失败，请检查路由配置');
  });
};

// 清空访问历史
const handleClearHistory = () => {
  ElMessageBox.confirm('确定要清空最近访问记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      clearVisitHistory();
      loadData();
      ElMessage.success('已清空访问记录');
    })
    .catch(() => {});
};

// 删除快捷方式
const handleRemoveShortcut = (id: string) => {
  removeShortcut(id);
  loadData();
  ElMessage.success('已删除快捷入口');
};

// 菜单选择变化
const handleMenuChange = (path: string) => {
  // 从菜单树中查找选中的菜单信息
  const findMenu = (tree: any[], targetPath: string): any => {
    for (const item of tree) {
      if (item.path === targetPath) {
        return item;
      }
      if (item.children) {
        const found = findMenu(item.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  const menu = findMenu(menuTree.value, path);
  if (menu) {
    shortcutForm.value = {
      path: menu.path,
      name: menu.name || '',
      title: menu.title,
      icon: menu.icon || 'dashboard'
    };
  }
};

// 确认添加
const handleConfirmAdd = () => {
  if (!shortcutForm.value.path) {
    ElMessage.warning('请选择菜单');
    return;
  }

  // 调试输出
  console.log('添加快捷方式：', shortcutForm.value);

  // 检查是否是外链
  if (shortcutForm.value.path.startsWith('http')) {
    ElMessage.warning('暂不支持添加外链');
    return;
  }

  const success = addShortcut({
    path: shortcutForm.value.path,
    name: shortcutForm.value.name,
    title: shortcutForm.value.title,
    icon: shortcutForm.value.icon
  });

  if (success) {
    ElMessage.success('添加成功');
    showAddDialog.value = false;
    loadData();
    // 重置表单
    shortcutForm.value = {
      path: '',
      name: '',
      title: '',
      icon: ''
    };
  } else {
    ElMessage.error('该快捷入口已存在或已达到数量上限');
  }
};

onMounted(() => {
  loadData();
  // 调试：打印菜单树结构
  console.log('菜单树结构：', menuTree.value);
  console.log('侧边栏路由：', permissionStore.sidebarRouters);
});
</script>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1 1 0%;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.top-1 {
  top: 0.25rem;
}

.right-1 {
  right: 0.25rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-6 {
  padding: 1.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-3 {
  margin-right: 0.75rem;
}

.w-8 {
  width: 2rem;
}

.h-8 {
  height: 2rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-center {
  text-align: center;
}

.font-medium {
  font-weight: 500;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-900 {
  color: #111827;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-blue-600 {
  color: #2563eb;
}

.bg-white {
  background-color: #ffffff;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.border {
  border-width: 1px;
}

.border-dashed {
  border-style: dashed;
}

.border-gray-100 {
  border-color: #f3f4f6;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.rounded {
  border-radius: 0.25rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.cursor-pointer {
  cursor: pointer;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.hover\:border-blue-200:hover {
  border-color: #bfdbfe;
}

.hover\:border-blue-400:hover {
  border-color: #60a5fa;
}

.hover\:text-blue-500:hover {
  color: #3b82f6;
}

.hover\:text-red-500:hover {
  color: #ef4444;
}

.opacity-0 {
  opacity: 0;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

@media (min-width: 768px) {
  .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>

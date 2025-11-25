/**
 * 访问历史管理工具
 * 记录用户最近访问的页面，用于快捷导航
 */

const VISIT_HISTORY_KEY = 'visit_history';
const MAX_HISTORY_COUNT = 8; // 最多保存8条记录

export interface VisitRecord {
  path: string;
  name: string;
  title: string;
  icon?: string;
  timestamp: number;
}

/**
 * 获取访问历史
 */
export function getVisitHistory(): VisitRecord[] {
  try {
    const history = localStorage.getItem(VISIT_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.error('Failed to get visit history:', e);
    return [];
  }
}

/**
 * 添加访问记录
 */
export function addVisitRecord(record: Omit<VisitRecord, 'timestamp'>): void {
  try {
    let history = getVisitHistory();
    
    // 移除已存在的相同路径记录
    history = history.filter(item => item.path !== record.path);
    
    // 添加新记录到开头
    history.unshift({
      ...record,
      timestamp: Date.now()
    });
    
    // 保留最近的 N 条记录
    history = history.slice(0, MAX_HISTORY_COUNT);
    
    localStorage.setItem(VISIT_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to add visit record:', e);
  }
}

/**
 * 清空访问历史
 */
export function clearVisitHistory(): void {
  try {
    localStorage.removeItem(VISIT_HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear visit history:', e);
  }
}

/**
 * 从路由 meta 中提取图标
 */
export function getIconFromMeta(meta: any): string {
  // 根据你的项目配置调整
  const icon = meta?.icon;
  
  // 如果没有图标，返回默认值
  if (!icon) {
    return 'dashboard';
  }
  
  // 返回图标名称（svg-icon 组件会自动处理）
  return icon;
}

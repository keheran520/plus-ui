/**
 * 自定义快捷方式管理工具
 * 用户可以添加、删除和管理自定义的快捷入口
 */

const SHORTCUTS_KEY = 'custom_shortcuts';
const MAX_SHORTCUTS_COUNT = 20; // 最多保存20个快捷方式

export interface Shortcut {
  id: string;
  path: string;
  name: string;
  title: string;
  icon?: string;
  sort?: number;
}

/**
 * 获取自定义快捷方式列表
 */
export function getShortcuts(): Shortcut[] {
  try {
    const shortcuts = localStorage.getItem(SHORTCUTS_KEY);
    return shortcuts ? JSON.parse(shortcuts) : [];
  } catch (e) {
    console.error('Failed to get shortcuts:', e);
    return [];
  }
}

/**
 * 添加快捷方式
 */
export function addShortcut(shortcut: Omit<Shortcut, 'id'>): boolean {
  try {
    let shortcuts = getShortcuts();
    
    // 检查是否已存在相同路径
    if (shortcuts.some(item => item.path === shortcut.path)) {
      console.warn('Shortcut already exists:', shortcut.path);
      return false;
    }
    
    // 检查数量限制
    if (shortcuts.length >= MAX_SHORTCUTS_COUNT) {
      console.warn('Shortcuts limit reached:', MAX_SHORTCUTS_COUNT);
      return false;
    }
    
    // 生成唯一ID
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // 添加新快捷方式
    shortcuts.push({
      ...shortcut,
      id,
      sort: shortcuts.length
    });
    
    localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
    return true;
  } catch (e) {
    console.error('Failed to add shortcut:', e);
    return false;
  }
}

/**
 * 删除快捷方式
 */
export function removeShortcut(id: string): boolean {
  try {
    let shortcuts = getShortcuts();
    shortcuts = shortcuts.filter(item => item.id !== id);
    localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
    return true;
  } catch (e) {
    console.error('Failed to remove shortcut:', e);
    return false;
  }
}

/**
 * 更新快捷方式排序
 */
export function updateShortcutsOrder(shortcuts: Shortcut[]): boolean {
  try {
    localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
    return true;
  } catch (e) {
    console.error('Failed to update shortcuts order:', e);
    return false;
  }
}

/**
 * 清空所有快捷方式
 */
export function clearShortcuts(): void {
  try {
    localStorage.removeItem(SHORTCUTS_KEY);
  } catch (e) {
    console.error('Failed to clear shortcuts:', e);
  }
}

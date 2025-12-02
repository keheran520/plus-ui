import { getToken } from '@/utils/auth';
import { ElNotification } from 'element-plus';
import { useNoticeStore } from '@/store/modules/notice';
import { getUnreadCount } from '@/api/system/messageCenter';

// 存储 Navbar 组件实例的引用
let navbarInstance: any = null;

// 设置 Navbar 实例（在 Navbar 组件中调用）
export const setNavbarInstance = (instance: any) => {
  navbarInstance = instance;
};

// 异步刷新未读消息数量（不阻塞主流程）
const refreshUnreadCountAsync = () => {
  // 使用 setTimeout 确保异步执行，不阻塞主流程
  setTimeout(async () => {
    try {
      console.log('[SSE] 异步刷新未读消息数量...');
      
      // 延迟500ms，确保消息已经写入数据库
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 如果有 Navbar 实例，调用刷新方法
      if (navbarInstance && navbarInstance.loadUnreadCount) {
        await navbarInstance.loadUnreadCount();
        console.log('[SSE] 未读消息数量刷新完成');
      }
    } catch (error) {
      console.error('[SSE] 刷新未读消息数量失败:', error);
    }
  }, 0);
};

// 初始化
export const initSSE = (url: any) => {
  if (import.meta.env.VITE_APP_SSE === 'false') {
    return;
  }

  url = url + '?Authorization=Bearer ' + getToken() + '&clientid=' + import.meta.env.VITE_APP_CLIENT_ID;
  const { data, error } = useEventSource(url, [], {
    autoReconnect: {
      retries: 5,
      delay: 5000,
      onFailed() {
        console.log('Failed to connect after 5 retries');
      }
    }
  });

  watch(error, () => {
    console.log('SSE connection error:', error.value);
    error.value = null;
  });

  watch(data, () => {
    if (!data.value) return;
    
    // 使用异步立即执行函数，不阻塞 watch
    (async () => {
      try {
        console.log('[SSE] 收到原始消息:', data.value);
        
        // 解析消息数据
        let messageData: any = {};
        try {
          messageData = JSON.parse(data.value);
          console.log('[SSE] 解析后的消息数据:', messageData);
        } catch {
          // 如果不是 JSON，使用原始字符串
          messageData = { message: data.value };
          console.log('[SSE] 非JSON消息，使用原始字符串');
        }

        // 1. 立即显示桌面通知（不等待任何操作）
        console.log('[SSE] 步骤1: 显示桌面通知');
        ElNotification({
          title: '新消息',
          message: messageData.messageTitle || messageData.message || data.value,
          type: 'info',
          duration: 5000,
          onClick: () => {
            // 点击通知跳转到消息中心
            window.location.hash = '#/system/messageCenter';
          }
        });

        // 2. 如果支持浏览器通知，显示桌面通知（异步）
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('新消息', {
            body: messageData.messageTitle || messageData.message || data.value,
            icon: '/favicon.ico',
            tag: 'message-notification',
            requireInteraction: false
          });
        }

        // 3. 添加到通知存储（异步，不阻塞）
        setTimeout(() => {
          useNoticeStore().addNotice({
            message: messageData.messageTitle || messageData.message || data.value,
            read: false,
            time: new Date().toLocaleString()
          });
        }, 0);

        // 4. 异步更新未读消息数量（不阻塞）
        console.log('[SSE] 步骤2: 异步更新未读消息数量');
        if (messageData.unreadCount !== undefined) {
          // 如果后端返回了未读数量，直接使用（异步更新）
          console.log('[SSE] 后端返回未读数量:', messageData.unreadCount);
          
          setTimeout(() => {
            if (navbarInstance && navbarInstance.updateUnreadCount) {
              navbarInstance.updateUnreadCount(messageData.unreadCount);
              console.log('[SSE] 徽章数字已更新为:', messageData.unreadCount);
            }
          }, 100);
        } else {
          // 如果后端没有返回未读数量，异步查询
          console.log('[SSE] 后端未返回未读数量，异步查询...');
          refreshUnreadCountAsync();
        }
      } catch (error) {
        console.error('[SSE] 处理消息失败:', error);
      }
    })();

    data.value = null;
  });
};

// 请求浏览器通知权限
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      console.log('通知权限:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }
  return Notification.permission === 'granted';
};

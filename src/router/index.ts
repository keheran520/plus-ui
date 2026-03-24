import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
/* Layout */
import Layout from '@/layout/index.vue';

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
 noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
 title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
 icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
 breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
 activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
 }
 */

// 公共路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/social-callback',
    hidden: true,
    component: () => import('@/layout/components/SocialCallback/index.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register.vue'),
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    hidden: true
  },
  {
    path: '/index',
    component: Layout,
    redirect: '/dashboard/workplace',
    hidden: true
  },
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/workplace',
    name: 'Dashboard',
    meta: { title: '仪表盘', icon: 'dashboard', alwaysShow: true },
    children: [
      {
        path: 'workplace',
        component: () => import('@/views/dashboard/workplace/index.vue'),
        name: 'Workplace',
        meta: { title: '工作台', icon: 'monitor', affix: true }
      },
      {
        path: 'analysis',
        component: () => import('@/views/dashboard/analysis/index.vue'),
        name: 'Analysis',
        meta: { title: '分析页', icon: 'chart' }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index.vue'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  {
    path: '/picturebed/home',
    component: () => import('@/views/picturebed/home/index.vue'),
    name: 'PictureBedHome',
    hidden: true,
    meta: { title: '图床首页' }
  },
  {
    path: '/picturebed/square',
    component: () => import('@/views/picturebed/square/index.vue'),
    name: 'PictureBedSquare',
    hidden: true,
    meta: { title: '图片广场' }
  },
  {
    path: '/system/message/edit',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/system/message/edit.vue'),
        name: 'MessageEdit',
        meta: { title: '消息编辑', activeMenu: '/system/message' }
      }
    ]
  },
  {
    path: '/picturebed',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'imageAlbum/gallery',
        component: () => import('@/views/picturebed/imageAlbum/gallery.vue'),
        name: 'AlbumGallery',
        meta: { title: '相册管理', icon: 'picture' }
      },
      {
        path: 'imageAlbum/detail/:id',
        component: () => import('@/views/picturebed/imageAlbum/detail.vue'),
        name: 'AlbumDetail',
        meta: { title: '相册详情', icon: 'picture', activeMenu: '/picturebed/imageAlbum/gallery' }
      }
    ]
  },
  {
    path: '/system/messageCenter',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/system/messageCenter/index.vue'),
        name: 'MessageCenter',
        meta: { title: '消息中心', icon: 'bell' }
      }
    ]
  },
  {
    path: '/member',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'member/detail/:id',
        component: () => import('@/views/member/member/detail.vue'),
        name: 'MemberDetail',
        meta: { title: '会员详情', icon: 'user', activeMenu: '/member/member' }
      }
    ]
  },
  {
    path: '/mall',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'sellerProfile/detail/:id',
        component: () => import('@/views/mall/sellerProfile/detail.vue'),
        name: 'SellerProfileDetail',
        meta: { title: '服务商详情', icon: 'user', activeMenu: '/mall/sellerProfile' }
      }
    ]
  },
  {
    path: '/pve',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'virtualMachine/console',
        component: () => import('@/views/pve/virtualMachine/console.vue'),
        name: 'VirtualMachineConsole',
        meta: { title: '虚拟机控制台', icon: 'monitor', activeMenu: '/pve/virtualMachine' }
      },
      {
        path: 'virtualMachine/detail',
        component: () => import('@/views/pve/virtualMachine/detail.vue'),
        name: 'VirtualMachineDetail',
        meta: { title: '虚拟机详情', icon: 'monitor', activeMenu: '/pve/virtualMachine' }
      },
      {
        path: 'virtualMachine/create',
        component: () => import('@/views/pve/virtualMachine/create-v3.vue'),
        name: 'VirtualMachineCreate',
        meta: { title: '创建虚拟机', icon: 'plus', activeMenu: '/pve/virtualMachine' }
      },
      {
        path: 'ikuaiConnection',
        component: () => import('@/views/pve/ikuaiConnection/index.vue'),
        name: 'IkuaiConnection',
        meta: { title: 'iKuai连接管理', icon: 'link', activeMenu: '/infrastructure/ikuaiConnection' }
      }
    ]
  },
  {
    path: '/pve/home',
    component: () => import('@/views/pve/home/index.vue'),
    name: 'PveHome',
    hidden: true,
    meta: { title: 'PVE首页' }
  }
];

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes: RouteRecordRaw[] = [];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_CONTEXT_PATH),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

export default router;

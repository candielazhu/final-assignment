import { createRouter, createWebHistory } from 'vue-router'

// 获取Cookie的辅助函数
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('./components/index.vue'),
    meta: { requiresAuth: true }, // 需要登录才能访问
    children: [
      {
        path: '', // 默认子路由
        name: 'Main',
        component: () => import('./components/Main.vue')
      },
      {
        path: 'topic/:item/:id',
        name: 'Topic',
        component: () => import('./components/Topic.vue')
      },
      {
        path: 'topic/:item',
        name: 'TopicWithItem',
        component: () => import('./components/Topic.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('./components/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('./components/register.vue')
  },
  // 404页面路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/login' // 未找到页面时重定向到登录页
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫，检查登录状态
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || getCookie('isLoggedIn') === 'true'
    if (isLoggedIn) {
      next() // 已登录，继续访问
    } else {
      next('/login') // 未登录，重定向到登录页面
    }
  } else {
    next() // 不需要认证的路由，直接访问
  }
})

export default router
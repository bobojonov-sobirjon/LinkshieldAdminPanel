import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
      },
      {
        path: 'faq',
        name: 'faq',
        component: () => import('@/views/FaqView.vue'),
      },
      {
        path: 'ads',
        name: 'ads',
        component: () => import('@/views/AdsView.vue'),
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/UsersView.vue'),
      },
      {
        path: 'reviews',
        name: 'reviews',
        component: () => import('@/views/ReviewsView.vue'),
      },
      {
        path: 'billing',
        name: 'billing',
        component: () => import('@/views/BillingView.vue'),
      },
      {
        path: 'links',
        name: 'links',
        component: () => import('@/views/LinksView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.bootstrapped) {
    await auth.bootstrap()
  }
  if (to.meta.public) {
    if (auth.isStaff) return { name: 'dashboard' }
    return true
  }
  if (to.meta.requiresAuth && !auth.isStaff) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router

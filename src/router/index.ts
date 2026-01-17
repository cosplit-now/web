import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: 'Dashboard' }
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('../views/CreateSplitView.vue'),
    meta: { title: 'Create Split' }
  },
  {
    path: '/verify/:id',
    name: 'verify',
    component: () => import('../views/VerifyItemsView.vue'),
    meta: { title: 'Verify Items' }
  },
  {
    path: '/assign/:id',
    name: 'assign',
    component: () => import('../views/AssignItemsView.vue'),
    meta: { title: 'Assign Items' }
  },
  {
    path: '/summary/:id',
    name: 'summary',
    component: () => import('../views/SummaryView.vue'),
    meta: { title: 'Summary' }
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../views/HistoryView.vue'),
    meta: { title: 'History' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: 'Login' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'SplitWise'} | Receipt Splitter`
  next()
})

export default router

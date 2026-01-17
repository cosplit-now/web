import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import CreateSplitView from '../views/CreateSplitView.vue'
import AssignItemsView from '../views/AssignItemsView.vue'
import VerifyItemsView from '../views/VerifyItemsView.vue'
import SummaryView from '../views/SummaryView.vue'
import HistoryView from '../views/HistoryView.vue'
import LoginView from '../views/LoginView.vue'
import ToastTestView from '../views/ToastTestView.vue'
import { authClient } from '@/lib/auth-client'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/create',
      name: 'create',
      component: CreateSplitView,
      meta: { requiresAuth: true },
    },
    {
      path: '/assign/:id',
      name: 'assign',
      component: AssignItemsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/verify/:id',
      name: 'verify',
      component: VerifyItemsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/summary/:id',
      name: 'summary',
      component: SummaryView,
      meta: { requiresAuth: true },
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
      meta: { requiresAuth: true },
    },
    {
      path: '/toast-test',
      name: 'toast-test',
      component: ToastTestView,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  // TODO: Temporarily disable auth check until backend is ready
  // Uncomment the code below when backend authentication is implemented

  /*
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isLoginPage = to.name === 'login'

  let session = null
  try {
    // We always try to get the session to know the user's state.
    const sessionResponse = await authClient.getSession()
    session = sessionResponse?.data
  } catch (error: any) {
    console.warn(`[Auth Guard] Could not reach auth server: ${error.message}`)
  }

  if (requiresAuth && !session) {
    // If a route requires auth and there's no session (or server is down),
    // redirect to the login page.
    next({ name: 'login' })
  } else if (isLoginPage && session) {
    // If the user is on the login page but is already logged in,
    // redirect them to the dashboard.
    next({ name: 'dashboard' })
  } else {
    // In all other cases (e.g., public pages, or authenticated user accessing allowed pages),
    // proceed as requested.
    next()
  }
  */

  // Allow all routes without authentication check (for development)
  next()
})

export default router

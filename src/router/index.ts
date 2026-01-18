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

router.beforeEach(async (to, _from, next) => {
  const isLoginPage = to.name === 'login'

  // Try to get existing session
  let session = null
  try {
    const sessionResponse = await authClient.getSession()
    session = sessionResponse?.data
  } catch (error: any) {
    // getSession failed (404 or CORS), but this is OK - we'll try to create anonymous user
    console.warn(`[Auth Guard] getSession failed: ${error.message}`)
  }

  // If user has no session
  if (!session) {
    if (isLoginPage) {
      // Allow access to login page for users who want to create a real account
      next()
      return
    }

    // For any other route without session, automatically create anonymous user
    console.info('[Auth Guard] No session found, attempting to create anonymous user...')
    try {
      const result = await authClient.signIn.anonymous()
      if (result.error) {
        console.error('[Auth Guard] Failed to create anonymous user:', result.error)
        // If anonymous creation fails, show error and stay on current page
        alert('無法連接到認證服務器，請稍後再試。\n\nCannot connect to authentication server. Please try again later.')
        next(false) // Cancel navigation
      } else {
        console.info('[Auth Guard] Anonymous user created successfully')
        // Anonymous user created successfully, proceed to the requested route
        next()
      }
    } catch (error: any) {
      console.error('[Auth Guard] Failed to create anonymous user:', error)
      // If anonymous creation fails, show error and stay on current page
      alert('無法連接到認證服務器，請稍後再試。\n\nCannot connect to authentication server. Please try again later.')
      next(false) // Cancel navigation
    }
  } else if (isLoginPage && session) {
    // If the user is on the login page but is already logged in (including anonymous),
    // redirect them to the dashboard.
    next({ name: 'dashboard' })
  } else {
    // In all other cases (e.g., public pages, or authenticated user accessing allowed pages),
    // proceed as requested.
    // Note: Anonymous users are treated as authenticated and can access all pages
    next()
  }
})

export default router

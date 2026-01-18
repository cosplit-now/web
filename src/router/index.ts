import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import CreateSplitView from '../views/CreateSplitView.vue'
import AssignItemsView from '../views/AssignItemsView.vue'
import VerifyItemsView from '../views/VerifyItemsView.vue'
import DefineMembersView from '../views/DefineMembersView.vue'
import SummaryView from '../views/SummaryView.vue'
import HistoryView from '../views/HistoryView.vue'
import LoginView from '../views/LoginView.vue'
import ToastTestView from '../views/ToastTestView.vue'
import { getCachedOrFetchSession, createAnonymousUser } from '@/lib/session-manager'

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
      path: '/define-members/:id',
      name: 'define-members',
      component: DefineMembersView,
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

// Debounce flag and session cache
let isCreatingAnonymousUser = false
let lastCheckedSession: any = null
let lastCheckTime = 0
const SESSION_CHECK_INTERVAL = 10000 // Check session every 10 seconds at most

router.beforeEach(async (to, _from, next) => {
  const isLoginPage = to.name === 'login'
  const now = Date.now()

  // If we checked session recently (within 10 seconds), reuse the result
  let session = lastCheckedSession
  if (!session || (now - lastCheckTime) > SESSION_CHECK_INTERVAL) {
    // Try to get existing session (with caching)
    session = await getCachedOrFetchSession()
    lastCheckedSession = session
    lastCheckTime = now
  } else {
    console.log('[Auth Guard] Using recently checked session')
  }

  // If user has no session
  if (!session) {
    if (isLoginPage) {
      // Allow access to login page for users who want to create a real account
      next()
      return
    }

    if (isCreatingAnonymousUser) {
      console.warn('[Auth Guard] Anonymous user creation already in progress. Blocking navigation.')
      return next(false)
    }

    // For any other route without session, automatically create anonymous user
    console.info('[Auth Guard] No session found, attempting to create anonymous user...')
    isCreatingAnonymousUser = true
    const result = await createAnonymousUser()
    isCreatingAnonymousUser = false

    if (!result.success) {
      console.error('[Auth Guard] Failed to create anonymous user:', result.error)
      alert('無法連接到認證服務器，請稍後再試。\n\nCannot connect to authentication server. Please try again later.')
      next(false) // Cancel navigation
    } else {
      console.info('[Auth Guard] Anonymous user created successfully')
      // Update cached session
      lastCheckedSession = result.session
      lastCheckTime = Date.now()
      next()
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

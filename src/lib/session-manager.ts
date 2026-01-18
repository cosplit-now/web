/**
 * Session Manager
 * Manages session caching to reduce unnecessary API calls
 */

import { authClient } from './auth-client'

const SESSION_CACHE_KEY = 'cosplit_session_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

interface SessionCache {
  session: any
  timestamp: number
}

/**
 * Get cached session if still valid
 */
function getCachedSession(): any | null {
  try {
    const cached = sessionStorage.getItem(SESSION_CACHE_KEY)
    if (!cached) return null

    const { session, timestamp }: SessionCache = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid (within 5 minutes)
    if (now - timestamp < CACHE_DURATION) {
      return session
    }

    // Cache expired, remove it
    sessionStorage.removeItem(SESSION_CACHE_KEY)
    return null
  } catch (error) {
    console.warn('[Session Manager] Failed to read cache:', error)
    return null
  }
}

/**
 * Cache session data
 */
function setCachedSession(session: any): void {
  try {
    const cache: SessionCache = {
      session,
      timestamp: Date.now(),
    }
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn('[Session Manager] Failed to cache session:', error)
  }
}

/**
 * Clear cached session
 */
export function clearSessionCache(): void {
  try {
    sessionStorage.removeItem(SESSION_CACHE_KEY)
  } catch (error) {
    console.warn('[Session Manager] Failed to clear cache:', error)
  }
}

/**
 * Get session with caching
 * First checks cache, then falls back to API call
 */
export async function getCachedOrFetchSession(): Promise<any | null> {
  // Try to get from cache first
  const cached = getCachedSession()
  if (cached) {
    console.log('[Session Manager] Using cached session')
    return cached
  }

  // Cache miss or expired, fetch from API
  console.log('[Session Manager] Cache miss, fetching from API')
  try {
    const sessionResponse = await authClient.getSession()
    const session = sessionResponse?.data

    if (session) {
      setCachedSession(session)
    }

    return session
  } catch (error: any) {
    console.warn('[Session Manager] Failed to fetch session:', error.message)
    return null
  }
}

/**
 * Create anonymous user and cache the session
 */
export async function createAnonymousUser(): Promise<{ success: boolean; session?: any; error?: any }> {
  try {
    const result = await authClient.signIn.anonymous()

    if (result.error) {
      return { success: false, error: result.error }
    }

    // Fetch the new session and cache it
    const sessionResponse = await authClient.getSession()
    const session = sessionResponse?.data

    if (session) {
      setCachedSession(session)
    }

    return { success: true, session }
  } catch (error) {
    return { success: false, error }
  }
}

/**
 * Sign out and clear cache
 */
export async function signOutAndClearCache(): Promise<void> {
  clearSessionCache()
  await authClient.signOut()
}

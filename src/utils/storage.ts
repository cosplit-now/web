const STORAGE_KEYS = {
  SPLITS: 'splitwise_splits',
  MEMBERS: 'splitwise_members',
  SETTINGS: 'splitwise_settings'
} as const

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to storage:', error)
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error loading from storage:', error)
    return null
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from storage:', error)
  }
}

export const storageKeys = STORAGE_KEYS

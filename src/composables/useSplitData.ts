import { ref, computed } from 'vue'
import type { Split, Receipt, ReceiptItem } from '@/types/split'
import { saveToStorage, loadFromStorage, storageKeys } from '@/utils/storage'

const currentSplit = ref<Split | null>(null)
const splits = ref<Split[]>([])

export function useSplitData() {
  // Load splits from storage
  const loadSplits = () => {
    const saved = loadFromStorage<Split[]>(storageKeys.SPLITS)
    if (saved) {
      splits.value = saved
    }
  }

  // Save splits to storage
  const saveSplits = () => {
    saveToStorage(storageKeys.SPLITS, splits.value)
  }

  // Create a new split
  const createSplit = (receipt: Receipt, memberIds: string[], payerId: string) => {
    const newSplit: Split = {
      id: crypto.randomUUID(),
      receipt,
      members: memberIds,
      payer: payerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft'
    }

    currentSplit.value = newSplit
    return newSplit
  }

  // Update current split
  const updateSplit = (updates: Partial<Split>) => {
    if (currentSplit.value) {
      currentSplit.value = {
        ...currentSplit.value,
        ...updates,
        updatedAt: new Date()
      }
    }
  }

  // Save split to history
  const saveSplitToHistory = () => {
    if (currentSplit.value) {
      const existingIndex = splits.value.findIndex(s => s.id === currentSplit.value!.id)

      if (existingIndex >= 0) {
        splits.value[existingIndex] = currentSplit.value
      } else {
        splits.value.unshift(currentSplit.value)
      }

      saveSplits()
    }
  }

  // Get split by ID
  const getSplitById = (id: string) => {
    return splits.value.find(s => s.id === id)
  }

  // Delete split
  const deleteSplit = (id: string) => {
    splits.value = splits.value.filter(s => s.id !== id)
    saveSplits()
  }

  // Computed: Recent splits (last 10)
  const recentSplits = computed(() => {
    return splits.value.slice(0, 10)
  })

  // Computed: This month's stats
  const monthlyStats = computed(() => {
    const now = new Date()
    const thisMonth = splits.value.filter(s => {
      const splitDate = new Date(s.createdAt)
      return splitDate.getMonth() === now.getMonth() &&
             splitDate.getFullYear() === now.getFullYear()
    })

    return {
      count: thisMonth.length,
      total: thisMonth.reduce((sum, s) => sum + s.receipt.total, 0),
      items: thisMonth.reduce((sum, s) => sum + s.receipt.items.length, 0)
    }
  })

  // Initialize
  loadSplits()

  return {
    currentSplit,
    splits,
    recentSplits,
    monthlyStats,
    createSplit,
    updateSplit,
    saveSplitToHistory,
    getSplitById,
    deleteSplit,
    loadSplits,
    saveSplits
  }
}

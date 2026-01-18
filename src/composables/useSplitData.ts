import { ref, computed } from 'vue'
import type { Split } from '@/types/split'
import type { Item } from '@/types/item'
import { saveToStorage, loadFromStorage, storageKeys } from '@/utils/storage'

const currentSplit = ref<Split | null>(null)
const splits = ref<Split[]>([])

// Mock OCR data for new splits
const mockItems: Item[] = [
    { id: '1', name: 'Organic Milk (1L)', price: 4.99, quantity: 2, hasTax: true, taxAmount: 0.35, splitMode: 'equal', assignments: [] },
    { id: '2', name: 'Whole Wheat Bread', price: 3.49, quantity: 1, hasTax: false, splitMode: 'equal', assignments: [] },
    { id: '3', name: 'Free Range Eggs', price: 5.99, quantity: 3, hasTax: true, taxAmount: 0.42, splitMode: 'equal', assignments: [] },
    { id: '4', name: 'Cheddar Cheese (200g)', price: 7.99, quantity: 1, hasTax: true, taxAmount: 0.56, splitMode: 'equal', assignments: [] },
]

// Load splits from storage once and migrate old data
const loadSplits = () => {
  const saved = loadFromStorage<any[]>(storageKeys.SPLITS)
  if (saved) {
    // Migrate old data: ensure all items have splitMode and assignments
    splits.value = saved.map(split => ({
      ...split,
      items: split.items.map((item: any) => ({
        ...item,
        splitMode: item.splitMode || 'equal',
        assignments: item.assignments || []
      }))
    })) as Split[]
  }
}
loadSplits()

export function useSplitData() {
  // Save splits to storage
  const saveSplits = () => {
    saveToStorage(storageKeys.SPLITS, splits.value)
  }

  // Create a new split and set it as current
  const createSplit = (options: { imageKey: string }): Split => {
    const newSplit: Split = {
      id: crypto.randomUUID(),
      imageKey: options.imageKey,
      items: mockItems, // Using mock items for now
      members: [],
      payer: '', // Will be set later
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      name: 'Untitled Split',
      totalTaxFromReceipt: 3.18, // Mock value
      subtotal: mockItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
      total: mockItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) + 3.18, // Mock value
    };
    currentSplit.value = newSplit;
    return newSplit;
  };

  // Internal: Create a new split object
  const _createSplit = (): Split => ({
      id: crypto.randomUUID(),
      items: mockItems, // Using mock items for now
      members: [],
      payer: '', // Will be set later
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      name: 'Untitled Split',
      totalTaxFromReceipt: 3.18, // Mock value
      subtotal: mockItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
      total: mockItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) + 3.18, // Mock value
  })


  // Find a split by ID, or create a new one if not found
  const getOrCreateSplit = (id: string | null): Split => {
    if (id) {
      const existing = splits.value.find(s => s.id === id)
      if (existing) {
        currentSplit.value = existing
        return existing
      }
    }
    const newSplit = _createSplit()
    currentSplit.value = newSplit
    return newSplit
  }

  // Find a split by ID and set it as current. Does not create a new one.
  const findSplit = (id: string): Split | null => {
    const existing = splits.value.find(s => s.id === id)
    if (existing) {
      currentSplit.value = existing
      return existing
    }
    currentSplit.value = null
    return null
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

  // Save current split to the main splits array
  const saveCurrentSplit = () => {
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

  // Item-specific helpers
  const addNewItem = () => {
    if (!currentSplit.value) return;
    const newItem: Item = {
      id: crypto.randomUUID(),
      name: '',
      price: 0,
      quantity: 1,
      hasTax: false,
      splitMode: 'equal',
      assignments: []
    }
    currentSplit.value.items.unshift(newItem)
  }

  const deleteItem = (itemId: string) => {
    if (!currentSplit.value) return;
    const index = currentSplit.value.items.findIndex(item => item.id === itemId)
    if (index > -1) {
      currentSplit.value.items.splice(index, 1)
    }
  }

  const updateItem = (updatedItem: Item) => {
    if (!currentSplit.value) return;
    const index = currentSplit.value.items.findIndex(item => item.id === updatedItem.id)
    if (index > -1) {
      currentSplit.value.items[index] = updatedItem
    }
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
      total: thisMonth.reduce((sum, s) => sum + s.total, 0),
      items: thisMonth.reduce((sum, s) => sum + s.items.length, 0)
    }
  })

  return {
    currentSplit,
    splits,
    recentSplits,
    monthlyStats,
    createSplit,
    getOrCreateSplit,
    findSplit,
    updateSplit,
    saveCurrentSplit,
    getSplitById,
    deleteSplit,
    loadSplits,
    saveSplits,
    addNewItem,
    deleteItem,
    updateItem
  }
}
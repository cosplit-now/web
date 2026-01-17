import { ref, computed } from 'vue'
import type { ReceiptItem, MemberTotal } from '@/types/split'
import { calculatePercentage } from '@/utils/currency'

export function useAssignment() {
  const items = ref<ReceiptItem[]>([])
  const memberIds = ref<string[]>([])
  const taxRate = ref(0)

  // Assign item to member(s)
  const assignItem = (itemId: string, memberId: string) => {
    const item = items.value.find(i => i.id === itemId)
    if (item && !item.assignedTo.includes(memberId)) {
      item.assignedTo.push(memberId)
    }
  }

  // Unassign item from member
  const unassignItem = (itemId: string, memberId: string) => {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      item.assignedTo = item.assignedTo.filter(id => id !== memberId)
    }
  }

  // Toggle assignment
  const toggleAssignment = (itemId: string, memberId: string) => {
    const item = items.value.find(i => i.id === itemId)
    if (!item) return

    if (item.assignedTo.includes(memberId)) {
      unassignItem(itemId, memberId)
    } else {
      assignItem(itemId, memberId)
    }
  }

  // Mark item as shared
  const markAsShared = (itemId: string, sharedCount: number) => {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      item.isShared = true
      item.sharedCount = sharedCount
    }
  }

  // Split item evenly among all members
  const splitEvenly = () => {
    items.value.forEach(item => {
      item.assignedTo = [...memberIds.value]
      item.isShared = true
      item.sharedCount = memberIds.value.length
    })
  }

  // Calculate member totals
  const calculateMemberTotals = computed((): MemberTotal[] => {
    return memberIds.value.map(memberId => {
      const memberItems = items.value.filter(item =>
        item.assignedTo.includes(memberId)
      )

      let subtotal = 0
      const assignedItems: ReceiptItem[] = []

      memberItems.forEach(item => {
        const shareCount = item.isShared && item.sharedCount
          ? item.sharedCount
          : item.assignedTo.length

        const itemShare = item.subtotal / shareCount
        subtotal += itemShare

        assignedItems.push({
          ...item,
          subtotal: itemShare
        })
      })

      const tax = calculatePercentage(subtotal, taxRate.value)
      const total = subtotal + tax

      return {
        memberId,
        items: assignedItems,
        subtotal,
        tax,
        total,
        isPaid: false
      }
    })
  })

  // Computed: Assigned items count
  const assignedCount = computed(() => {
    return items.value.filter(item => item.assignedTo.length > 0).length
  })

  // Computed: Unassigned amount
  const unassignedAmount = computed(() => {
    return items.value
      .filter(item => item.assignedTo.length === 0)
      .reduce((sum, item) => sum + item.subtotal, 0)
  })

  // Computed: Progress percentage
  const progressPercentage = computed(() => {
    if (items.value.length === 0) return 0
    return (assignedCount.value / items.value.length) * 100
  })

  return {
    items,
    memberIds,
    taxRate,
    assignItem,
    unassignItem,
    toggleAssignment,
    markAsShared,
    splitEvenly,
    calculateMemberTotals,
    assignedCount,
    unassignedAmount,
    progressPercentage
  }
}

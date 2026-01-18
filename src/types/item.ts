export type SplitMode = 'equal' | 'ratio' | 'quantity'

export interface ItemAssignment {
  memberId: string
  ratio?: number      // For ratio mode (e.g., 0.5 = 50%)
  quantity?: number   // For quantity mode (e.g., 2 items)
}

export interface Item {
  id: string
  name: string
  price: number
  quantity?: number      // Total quantity of the item
  hasTax: boolean       // Whether this item includes tax
  taxAmount?: number    // Tax amount if applicable
  splitMode: SplitMode
  assignments: ItemAssignment[]  // Array of member assignments (empty by default)
}

// Calculate how much each member owes for an item
export function calculateMemberShare(item: Item, memberId: string): number {
  // Safety check: ensure assignments exist
  if (!item.assignments || item.assignments.length === 0) return 0
  
  const assignment = item.assignments.find(a => a.memberId === memberId)
  if (!assignment) return 0

  switch (item.splitMode) {
    case 'equal':
      return item.price / item.assignments.length

    case 'ratio':
      if (!assignment.ratio) return 0
      const totalRatio = item.assignments.reduce((sum, a) => sum + (a.ratio || 0), 0)
      return totalRatio > 0 ? (item.price * assignment.ratio) / totalRatio : 0

    case 'quantity':
      if (!assignment.quantity || !item.quantity) return 0
      const totalQuantity = item.assignments.reduce((sum, a) => sum + (a.quantity || 0), 0)
      return totalQuantity > 0 ? (item.price * assignment.quantity) / totalQuantity : 0

    default:
      return 0
  }
}

// Calculate total tax amount for a member across all items
export function calculateMemberTax(items: Item[], memberId: string): number {
  return items.reduce((total, item) => {
    if (!item.hasTax || !item.taxAmount || !item.assignments) return total

    const assignment = item.assignments.find(a => a.memberId === memberId)
    if (!assignment) return total

    const itemTotal = item.price
    const memberShare = calculateMemberShare(item, memberId)
    if (itemTotal === 0) return total
    const taxShare = (memberShare / itemTotal) * item.taxAmount

    return total + taxShare
  }, 0)
}

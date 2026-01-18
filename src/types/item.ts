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
  assignments: ItemAssignment[]
}

// Calculate how much each member owes for an item
export function calculateMemberShare(item: Item, memberId: string): number {
  const assignment = item.assignments.find(a => a.memberId === memberId)
  if (!assignment) return 0

  switch (item.splitMode) {
    case 'equal':
      return item.price / item.assignments.length

    case 'ratio':
      if (!assignment.ratio) return 0
      const totalRatio = item.assignments.reduce((sum, a) => sum + (a.ratio || 0), 0)
      return (item.price * assignment.ratio) / totalRatio

    case 'quantity':
      if (!assignment.quantity || !item.quantity) return 0
      const totalQuantity = item.assignments.reduce((sum, a) => sum + (a.quantity || 0), 0)
      return (item.price * assignment.quantity) / totalQuantity

    default:
      return 0
  }
}

// Calculate total tax amount for a member across all items
export function calculateMemberTax(items: Item[], memberId: string): number {
  return items.reduce((total, item) => {
    if (!item.hasTax || !item.taxAmount) return total

    const assignment = item.assignments.find(a => a.memberId === memberId)
    if (!assignment) return total

    const itemTotal = item.price
    const memberShare = calculateMemberShare(item, memberId)
    const taxShare = (memberShare / itemTotal) * item.taxAmount

    return total + taxShare
  }, 0)
}

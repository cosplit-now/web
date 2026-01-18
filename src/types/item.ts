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
  discount?: number     // Discount amount to subtract from price
  deposit?: number      // Deposit amount to add to price
  splitMode: SplitMode
  assignments: ItemAssignment[]  // Array of member assignments (empty by default)
  isEditing?: boolean   // UI state: whether item is being edited (optional, for VerifyItemsView)
}

// Calculate the actual price of an item after discount and deposit
export function getItemActualPrice(item: Item): number {
  const basePrice = item.price
  const discount = item.discount || 0
  const deposit = item.deposit || 0
  return basePrice - discount + deposit
}

// Calculate how much each member owes for an item
export function calculateMemberShare(item: Item, memberId: string): number {
  // Safety check: ensure assignments exist
  if (!item.assignments || item.assignments.length === 0) return 0
  
  const assignment = item.assignments.find(a => a.memberId === memberId)
  if (!assignment) return 0

  // Use actual price (price - discount + deposit)
  const actualPrice = getItemActualPrice(item)

  switch (item.splitMode) {
    case 'equal':
      return actualPrice / item.assignments.length

    case 'ratio':
      if (!assignment.ratio) return 0
      const totalRatio = item.assignments.reduce((sum, a) => sum + (a.ratio || 0), 0)
      return totalRatio > 0 ? (actualPrice * assignment.ratio) / totalRatio : 0

    case 'quantity':
      if (!assignment.quantity || !item.quantity) return 0
      const totalQuantity = item.assignments.reduce((sum, a) => sum + (a.quantity || 0), 0)
      return totalQuantity > 0 ? (actualPrice * assignment.quantity) / totalQuantity : 0

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

    const itemTotal = getItemActualPrice(item)
    const memberShare = calculateMemberShare(item, memberId)
    if (itemTotal === 0) return total
    const taxShare = (memberShare / itemTotal) * item.taxAmount

    return total + taxShare
  }, 0)
}

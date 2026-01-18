import type { Item } from './item'

export interface TaxInfo {
  gst?: number
  pst?: number
  hst?: number
  total: number
}

export interface Split {
  id: string
  name: string
  imageKey?: string
  items: Item[]
  subtotal: number
  totalTaxFromReceipt: number,
  total: number
  members: string[] // Member IDs
  payer: string // Member ID
  createdAt: Date
  updatedAt: Date
  status: 'draft' | 'completed' | 'paid'
}

export interface MemberTotal {
  memberId: string
  items: Item[]
  subtotal: number
  tax: number
  total: number
  isPaid: boolean
}

export interface SplitSummary {
  splitId: string
  memberTotals: MemberTotal[]
  totalAmount: number
}


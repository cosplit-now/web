export interface ReceiptItem {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
  assignedTo: string[] // Member IDs
  isShared: boolean
  sharedCount?: number
}

export interface TaxInfo {
  gst?: number
  pst?: number
  hst?: number
  total: number
}

export interface Receipt {
  id: string
  storeName?: string
  date: Date
  region: string
  items: ReceiptItem[]
  subtotal: number
  tax: TaxInfo
  total: number
  imageUrl?: string
  discount?: number
  tip?: number
  extraFees?: number
}

export interface Split {
  id: string
  receipt: Receipt
  members: string[] // Member IDs
  payer: string // Member ID
  createdAt: Date
  updatedAt: Date
  status: 'draft' | 'completed' | 'paid'
}

export interface MemberTotal {
  memberId: string
  items: ReceiptItem[]
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

/**
 * Convert backend receipt items to internal Item format
 */

import type { Item } from '@/types/item'
import type { ReceiptItemResponse } from '@/types/receipt'

/**
 * Convert a receipt item from backend to internal Item format
 */
export function convertReceiptItemToItem(receiptItem: ReceiptItemResponse): Item {
  // Calculate tax amount if item has tax (estimate 13% HST for now)
  // This can be adjusted based on actual tax rate from receipt
  const TAX_RATE = 0.13
  const hasTax = receiptItem.hasTax === true
  
  // Calculate actual price after discount and deposit
  const actualPrice = receiptItem.price - (receiptItem.discount || 0) + (receiptItem.deposit || 0)
  const taxAmount = hasTax ? actualPrice * TAX_RATE : undefined

  return {
    id: crypto.randomUUID(),
    name: receiptItem.name,
    price: receiptItem.price,
    quantity: receiptItem.quantity || 1, // 默認數量為 1
    hasTax: hasTax,
    taxAmount: taxAmount,
    discount: receiptItem.discount,
    deposit: receiptItem.deposit,
    splitMode: 'equal', // Default to equal split
    assignments: [], // No assignments yet
  }
}

/**
 * Convert array of receipt items from backend to internal Item format
 */
export function convertReceiptItems(receiptItems: ReceiptItemResponse[]): Item[] {
  return receiptItems.map(convertReceiptItemToItem)
}

/**
 * Calculate total from receipt items
 */
export function calculateReceiptTotal(items: ReceiptItemResponse[]): {
  subtotal: number
  totalTax: number
  totalDiscount: number
  totalDeposit: number
  grandTotal: number
} {
  let subtotal = 0
  let totalDiscount = 0
  let totalDeposit = 0

  items.forEach(item => {
    const quantity = item.quantity || 1
    subtotal += item.price * quantity
    totalDiscount += (item.discount || 0)
    totalDeposit += (item.deposit || 0)
  })

  // Estimate tax at 13% on taxable items
  const TAX_RATE = 0.13
  const taxableAmount = items
    .filter(item => item.hasTax === true)
    .reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
  
  const totalTax = taxableAmount * TAX_RATE

  const grandTotal = subtotal + totalTax + totalDeposit - totalDiscount

  return {
    subtotal,
    totalTax,
    totalDiscount,
    totalDeposit,
    grandTotal
  }
}

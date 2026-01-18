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
  const taxAmount = receiptItem.hasTax ? receiptItem.price * TAX_RATE : undefined

  return {
    id: crypto.randomUUID(),
    name: receiptItem.name,
    price: receiptItem.price,
    quantity: receiptItem.quantity,
    hasTax: receiptItem.hasTax,
    taxAmount: taxAmount,
    splitMode: 'equal', // Default to equal split
    assignments: [], // No assignments yet
    // Store discount and deposit in a note if needed
    // For now, we'll incorporate discount into the price
    // Note: You might want to add discount/deposit fields to Item type if needed
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
    subtotal += item.price * item.quantity
    totalDiscount += (item.discount || 0)
    totalDeposit += (item.deposit || 0)
  })

  // Estimate tax at 13% on taxable items
  const TAX_RATE = 0.13
  const taxableAmount = items
    .filter(item => item.hasTax)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
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

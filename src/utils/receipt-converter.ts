/**
 * Convert backend receipt items to internal Item format
 */

import type { Item } from '@/types/item'
import type { ReceiptItemResponse } from '@/types/receipt'

/**
 * Convert a receipt item from backend to internal Item format
 * @param receiptItem - Item from OCR result
 * @param taxRate - Actual tax rate calculated from receipt (optional, will estimate if not provided)
 */
export function convertReceiptItemToItem(receiptItem: ReceiptItemResponse, taxRate?: number): Item {
  const hasTax = receiptItem.hasTax === true
  
  // Calculate actual price after discount and deposit
  const actualPrice = receiptItem.price - (receiptItem.discount || 0) + (receiptItem.deposit || 0)
  
  // Use provided tax rate or estimate at 13%
  const effectiveTaxRate = taxRate !== undefined ? taxRate : 0.13
  const taxAmount = hasTax ? actualPrice * effectiveTaxRate : undefined

  return {
    id: crypto.randomUUID(),
    name: receiptItem.name,
    price: receiptItem.price,
    quantity: receiptItem.quantity || 1,
    hasTax: hasTax,
    taxAmount: taxAmount,
    discount: receiptItem.discount,
    deposit: receiptItem.deposit,
    splitMode: 'equal',
    assignments: [],
  }
}

/**
 * Convert array of receipt items from backend to internal Item format
 * @param receiptItems - Items from OCR result
 * @param backendTotal - Total from backend (optional, will calculate tax rate if provided)
 */
export function convertReceiptItems(receiptItems: ReceiptItemResponse[], backendTotal?: number): Item[] {
  let taxRate: number | undefined = undefined
  
  // If backend provides total, calculate actual tax rate
  if (backendTotal !== undefined) {
    // Calculate subtotal (with discounts and deposits)
    const subtotal = receiptItems.reduce((sum, item) => {
      const actualPrice = item.price - (item.discount || 0) + (item.deposit || 0)
      return sum + actualPrice * (item.quantity || 1)
    }, 0)
    
    // Calculate taxable amount (with discounts and deposits)
    const taxableAmount = receiptItems
      .filter(item => item.hasTax === true)
      .reduce((sum, item) => {
        const actualPrice = item.price - (item.discount || 0) + (item.deposit || 0)
        return sum + actualPrice * (item.quantity || 1)
      }, 0)
    
    // Calculate actual tax rate from backend total
    if (taxableAmount > 0) {
      const actualTax = backendTotal - subtotal
      taxRate = actualTax / taxableAmount
      console.log(`[Receipt Converter] Calculated tax rate: ${(taxRate * 100).toFixed(2)}%`)
    }
  }
  
  return receiptItems.map(item => convertReceiptItemToItem(item, taxRate))
}

/**
 * Calculate total from receipt items
 * @param items - Receipt items
 * @param backendTotal - Total from backend (optional, will use this if provided)
 */
export function calculateReceiptTotal(
  items: ReceiptItemResponse[], 
  backendTotal?: number
): {
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

  // Calculate subtotal after discounts and deposits
  const actualSubtotal = subtotal - totalDiscount + totalDeposit

  let totalTax: number
  let grandTotal: number

  // Use backend total if provided
  if (backendTotal !== undefined) {
    grandTotal = backendTotal
    totalTax = backendTotal - actualSubtotal
    console.log(`[Receipt Converter] Using backend total: $${backendTotal.toFixed(2)}, calculated tax: $${totalTax.toFixed(2)}`)
  } else {
    // Estimate tax at 13% on taxable items (fallback)
    const TAX_RATE = 0.13
    const taxableAmount = items
      .filter(item => item.hasTax === true)
      .reduce((sum, item) => {
        const actualPrice = item.price - (item.discount || 0) + (item.deposit || 0)
        return sum + actualPrice * (item.quantity || 1)
      }, 0)
    
    totalTax = taxableAmount * TAX_RATE
    grandTotal = actualSubtotal + totalTax
    console.log(`[Receipt Converter] Estimating tax at 13%: $${totalTax.toFixed(2)}`)
  }

  return {
    subtotal: actualSubtotal,
    totalTax,
    totalDiscount,
    totalDeposit,
    grandTotal
  }
}

/**
 * Receipt OCR API types
 */

// Backend response item from OCR
export interface ReceiptItemResponse {
  name: string
  price: number
  quantity: number
  hasTax: boolean
  discount?: number
  deposit?: number
}

// Request payload for OCR API
export interface AnalyzeReceiptRequest {
  imageUrl: string
}

// Response from OCR API
export interface AnalyzeReceiptResponse {
  items: ReceiptItemResponse[]
}

/**
 * Receipt OCR API types
 */

// Backend response item from OCR
export interface ReceiptItemResponse {
  name: string
  price: number
  quantity?: number
  hasTax?: boolean
  discount?: number
  deposit?: number
}

// Request payload for OCR API
export interface AnalyzeReceiptRequest {
  imageUrl: string
}

// Receipt status enum matching backend
export type ReceiptStatus = 
  | 'uploaded'
  | 'ocr_processing'
  | 'ocr_done'
  | 'ocr_failed'
  | 'confirmed'

// Receipt upload response
export interface UploadReceiptResponse {
  id: string
  status: ReceiptStatus
  imageUrl: string
  ocrResult: any | null
  finalResult: FinalReceiptResult | null
  userId: string
  createdAt: string
  updatedAt: string
}

// Final result structure
export interface FinalReceiptResult {
  total: number
  items: ReceiptItemResponse[]
}

// GET /receipts/:id response
export interface GetReceiptResponse {
  id: string
  imageUrl: string
  status: ReceiptStatus
  userId: string
  finalResult: FinalReceiptResult | null
  createdAt: string
  updatedAt: string
}

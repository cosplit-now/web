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

// OCR Result structure (when ocrResult is a JSON string)
export interface OcrResultData {
  items: ReceiptItemResponse[]
  total: number
}

// Final result structure
export interface FinalReceiptResult {
  total: number
  items: ReceiptItemResponse[]
}

// Receipt upload response
// ocrResult can be a JSON string or parsed object when status is 'ocr_done'
export interface UploadReceiptResponse {
  id: string
  status: ReceiptStatus
  imageUrl: string
  ocrResult: string | OcrResultData | null  // JSON string from backend, or parsed object
  finalResult: FinalReceiptResult | null
  userId: string
  createdAt: string
  updatedAt: string
}

// GET /receipts/:id response
export interface GetReceiptResponse {
  id: string
  imageUrl: string
  status: ReceiptStatus
  ocrResult: string | OcrResultData | null  // JSON string from backend, or parsed object
  finalResult: FinalReceiptResult | null
  userId: string
  createdAt: string
  updatedAt: string
}

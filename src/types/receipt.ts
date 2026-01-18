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

// Receipt upload response
export interface UploadReceiptResponse {
  id: string
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
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
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
  userId: string
  finalResult: FinalReceiptResult | null
  createdAt: string
  updatedAt: string
}

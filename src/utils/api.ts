/**
 * API 工具函數
 * 用於與後端 API 通訊
 */

import type { AnalyzeReceiptRequest, ReceiptItemResponse, OcrResultData } from '@/types/receipt'
import { authClient } from '@/lib/auth-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * 獲取預簽名上傳 URL
 * @param filename 文件名
 * @returns 預簽名 URL 和文件 key
 */
export async function getSignedUploadUrl(filename: string): Promise<{
  url: string
  key: string
}> {
  const response = await fetch(`${API_BASE_URL}/s3/signed-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filename }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get signed URL: ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error('Failed to get signed URL')
  }

  return {
    url: data.url,
    key: data.key,
  }
}

/**
 * 上傳文件到 R2 使用預簽名 URL
 * @param url 預簽名 URL
 * @param file 要上傳的文件
 * @param onProgress 進度回調函數
 */
export async function uploadToR2(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // 監聽上傳進度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          onProgress(progress)
        }
      })
    }

    // 監聽完成
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    // 監聽錯誤
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    // 監聽中止
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'))
    })

    // 發送 PUT 請求
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })
}

/**
 * 獲取公開訪問 URL
 * 根據後端配置構建公開 URL
 */
export function getPublicUrl(key: string): string {
  // R2 公開訪問 URL
  const R2_PUBLIC_BASE_URL = 'https://pub-e6cf3f9edbf4434eaf774e9c2e311141.r2.dev'
  
  // 如果 key 已經是完整 URL，直接返回
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key
  }
  
  // 組合成完整 URL
  return `${R2_PUBLIC_BASE_URL}/${key}`
}

/**
 * Upload receipt image to backend and start OCR processing
 * @param imageKey Image key (without domain)
 * @returns Receipt upload response with receipt ID
 */
export async function uploadReceipt(
  imageKey: string
): Promise<import('@/types/receipt').UploadReceiptResponse> {
  // Construct full image URL
  const fullImageUrl = getPublicUrl(imageKey)

  const payload: AnalyzeReceiptRequest = {
    imageUrl: fullImageUrl
  }

  console.log('[API] Uploading receipt')
  console.log('[API] Image key:', imageKey)
  console.log('[API] Full image URL:', fullImageUrl)
  console.log('[API] API endpoint:', `${API_BASE_URL}/receipts`)

  // Get current session (for debugging)
  const sessionData = await authClient.getSession()
  console.log('[API] Session data:', sessionData)
  console.log('[API] Has session:', !!sessionData?.data)

  // If no session, this is a backend CORS configuration issue
  if (!sessionData?.data) {
    console.error('[API] ⚠️ No session! This is a backend CORS configuration issue')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send cookies
      body: JSON.stringify(payload),
    })

    console.log('[API] Response status:', response.status)

    if (!response.ok) {
      let errorMessage = `Failed to upload receipt: ${response.status}`
      try {
        const errorData = await response.json()
        console.error('[API] Error response:', errorData)
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        const errorText = await response.text()
        console.error('[API] Error text:', errorText)
        if (errorText) {
          errorMessage += ` - ${errorText}`
        }
      }

      // Special handling for 401 errors
      if (response.status === 401) {
        throw new Error('Authentication failed. Please refresh the page and log in again.')
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('[API] Upload success response:', data)

    return data
  } catch (error: any) {
    console.error('[API] Error uploading receipt:', error)
    throw error
  }
}

/**
 * Get receipt processing status and result
 * @param receiptId Receipt ID
 * @returns Receipt details
 */
export async function getReceipt(
  receiptId: string
): Promise<import('@/types/receipt').GetReceiptResponse> {
  console.log('[API] Getting receipt:', receiptId)

  try {
    const response = await fetch(`${API_BASE_URL}/receipts/${receiptId}`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      let errorMessage = `Failed to get receipt: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        const errorText = await response.text()
        if (errorText) {
          errorMessage += ` - ${errorText}`
        }
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('[API] Get receipt response:', data)

    return data
  } catch (error: any) {
    console.error('[API] Error getting receipt:', error)
    throw error
  }
}

/**
 * Get all receipts for the current user
 * @returns Array of receipts
 */
export async function getAllReceipts(): Promise<import('@/types/receipt').GetReceiptResponse[]> {
  console.log('[API] Getting all receipts')

  try {
    const response = await fetch(`${API_BASE_URL}/receipts`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      let errorMessage = `Failed to get receipts: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        const errorText = await response.text()
        if (errorText) {
          errorMessage += ` - ${errorText}`
        }
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('[API] Get all receipts response:', data)

    return data
  } catch (error: any) {
    console.error('[API] Error getting receipts:', error)
    throw error
  }
}

/**
 * Parse ocrResult from JSON string to OcrResultData
 * @param ocrResult JSON string or already parsed object
 * @returns Parsed OcrResultData or null
 */
function parseOcrResult(ocrResult: string | OcrResultData | null): OcrResultData | null {
  if (!ocrResult) return null
  
  // If already parsed object, return as is
  if (typeof ocrResult === 'object' && ocrResult !== null && 'items' in ocrResult) {
    return ocrResult as OcrResultData
  }
  
  // If it's a string, try to parse it
  if (typeof ocrResult === 'string') {
    try {
      return JSON.parse(ocrResult) as OcrResultData
    } catch (error) {
      console.error('[API] Failed to parse ocrResult:', error)
      return null
    }
  }
  
  return null
}

/**
 * Poll and wait for receipt processing to complete
 * @param receiptId Receipt ID
 * @param onProgress Progress callback (status, progress)
 * @param maxAttempts Maximum number of polling attempts
 * @param interval Polling interval (milliseconds)
 * @returns Receipt result with items and total
 */
export async function pollReceiptResult(
  receiptId: string,
  onProgress?: (status: string, progress: number) => void,
  maxAttempts: number = 60,
  interval: number = 2000
): Promise<{ items: ReceiptItemResponse[], total?: number }> {
  console.log('[API] Polling receipt result:', receiptId)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const receipt = await getReceipt(receiptId)

    console.log(`[API] Poll attempt ${attempt + 1}/${maxAttempts}, status: ${receipt.status}`)

    // Update progress
    if (onProgress) {
      const progress = Math.min(95, 40 + (attempt / maxAttempts) * 55)
      onProgress(receipt.status, progress)
    }

    // Success: Check if OCR is done (status === 'ocr_done' or 'confirmed')
    if (receipt.status === 'ocr_done' || receipt.status === 'confirmed') {
      // Priority 1: Use finalResult if available
      if (receipt.finalResult && receipt.finalResult.items) {
        console.log('[API] Receipt processing completed! Using finalResult.')
        return {
          items: receipt.finalResult.items,
          total: receipt.finalResult.total
        }
      }
      
      // Priority 2: Parse ocrResult if available
      const parsedOcrResult = parseOcrResult(receipt.ocrResult)
      if (parsedOcrResult && parsedOcrResult.items && parsedOcrResult.items.length > 0) {
        console.log('[API] Receipt processing completed! Using ocrResult.')
        console.log('[API] Backend total:', parsedOcrResult.total)
        return {
          items: parsedOcrResult.items,
          total: parsedOcrResult.total
        }
      }
      
      // If status is done but no data, log warning but continue polling
      console.warn('[API] Status is ocr_done but no data found, continuing to poll...')
    }

    // Failed: OCR processing failed
    if (receipt.status === 'ocr_failed') {
      throw new Error('Receipt processing failed. Please try again.')
    }

    // Still processing: wait and continue polling
    // This handles 'uploaded', 'ocr_processing', and any other non-terminal statuses
    console.log(`[API] Status is '${receipt.status}', waiting ${interval}ms before next poll...`)
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error('Receipt processing timeout. Please try again later.')
}

/**
 * Complete receipt analysis workflow: upload + polling
 * @param imageKey Image key
 * @param onProgress Progress callback
 * @returns Receipt items list
 */
export async function analyzeReceipt(
  imageKey: string,
  onProgress?: (status: string, progress: number) => void
): Promise<{ items: ReceiptItemResponse[], total?: number }> {
  // Step 1: Upload receipt
  if (onProgress) onProgress('uploading', 20)
  const uploadResponse = await uploadReceipt(imageKey)
  console.log('[API] Receipt uploaded with ID:', uploadResponse.id)

  // Step 2: Poll for OCR results
  console.log('[API] Starting polling for OCR results...')
  const result = await pollReceiptResult(uploadResponse.id, onProgress)
  
  console.log('[API] Receipt analysis completed!')
  console.log('[API] Items count:', result.items.length)
  console.log('[API] Backend total:', result.total)
  return result
}

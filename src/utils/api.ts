/**
 * API 工具函數
 * 用於與後端 API 通訊
 */

import type { AnalyzeReceiptRequest, ReceiptItemResponse } from '@/types/receipt'
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
 * 上传收据图片到后端,开始 OCR 处理
 * @param imageKey 图片 key (不包含域名)
 * @returns 收据上传响应,包含 receipt ID
 */
export async function uploadReceipt(
  imageKey: string
): Promise<import('@/types/receipt').UploadReceiptResponse> {
  // 组合成完整的图片 URL
  const fullImageUrl = getPublicUrl(imageKey)

  const payload: AnalyzeReceiptRequest = {
    imageUrl: fullImageUrl
  }

  console.log('[API] Uploading receipt')
  console.log('[API] Image key:', imageKey)
  console.log('[API] Full image URL:', fullImageUrl)
  console.log('[API] API endpoint:', `${API_BASE_URL}/receipts`)

  // 获取当前 session（用于调试）
  const sessionData = await authClient.getSession()
  console.log('[API] Session data:', sessionData)
  console.log('[API] Has session:', !!sessionData?.data)

  // 如果没有 session，这是后端 CORS 配置问题
  if (!sessionData?.data) {
    console.error('[API] ⚠️ 没有 session！这是后端 CORS 配置问题')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 发送 cookies
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

      // 401 错误特殊处理
      if (response.status === 401) {
        throw new Error('认证失败：请刷新页面重新登入')
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
 * 获取收据处理状态和结果
 * @param receiptId 收据 ID
 * @returns 收据详情
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
 * 轮询等待收据处理完成
 * @param receiptId 收据 ID
 * @param onProgress 进度回调 (status, progress)
 * @param maxAttempts 最大轮询次数
 * @param interval 轮询间隔(毫秒)
 * @returns 收据项目列表
 */
export async function pollReceiptResult(
  receiptId: string,
  onProgress?: (status: string, progress: number) => void,
  maxAttempts: number = 60,
  interval: number = 2000
): Promise<ReceiptItemResponse[]> {
  console.log('[API] Polling receipt result:', receiptId)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const receipt = await getReceipt(receiptId)

    console.log(`[API] Poll attempt ${attempt + 1}/${maxAttempts}, status: ${receipt.status}`)

    // 更新进度
    if (onProgress) {
      const progress = Math.min(95, 40 + (attempt / maxAttempts) * 55)
      onProgress(receipt.status, progress)
    }

    if (receipt.status === 'completed' && receipt.finalResult) {
      console.log('[API] Receipt processing completed!')
      return receipt.finalResult.items
    }

    if (receipt.status === 'failed') {
      throw new Error('收据处理失败，请重试')
    }

    // 如果还在处理中，等待后继续轮询
    if (receipt.status === 'uploaded' || receipt.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, interval))
      continue
    }
  }

  throw new Error('收据处理超时，请稍后重试')
}

/**
 * 完整的收据分析流程：上传 + 轮询
 * @param imageKey 图片 key
 * @param onProgress 进度回调
 * @returns 收据项目列表
 */
export async function analyzeReceipt(
  imageKey: string,
  onProgress?: (status: string, progress: number) => void
): Promise<ReceiptItemResponse[]> {
  // Step 1: 上传收据
  if (onProgress) onProgress('uploading', 20)
  const uploadResponse = await uploadReceipt(imageKey)

  // Step 2: 轮询结果
  if (onProgress) onProgress('processing', 40)
  const items = await pollReceiptResult(uploadResponse.id, onProgress)

  return items
}

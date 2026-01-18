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
 * 分析收據圖片，提取項目信息
 * @param imageKey 圖片 key (不包含域名)
 * @returns 收據項目列表
 */
export async function analyzeReceipt(
  imageKey: string
): Promise<ReceiptItemResponse[]> {
  // 組合成完整的圖片 URL
  const fullImageUrl = getPublicUrl(imageKey)
  
  const payload: AnalyzeReceiptRequest = {
    imageUrl: fullImageUrl
  }

  console.log('[API] Analyzing receipt')
  console.log('[API] Image key:', imageKey)
  console.log('[API] Full image URL:', fullImageUrl)
  console.log('[API] API endpoint:', `${API_BASE_URL}/receipts`)

  // 獲取當前 session（用於調試）
  const sessionData = await authClient.getSession()
  console.log('[API] Session data:', sessionData)
  console.log('[API] Has session:', !!sessionData?.data)
  console.log('[API] All cookies:', document.cookie)

  // 如果沒有 session，這是後端 CORS 配置問題
  if (!sessionData?.data) {
    console.error('[API] ⚠️ 沒有 session！這是後端 CORS 配置問題')
    console.error('[API] 後端需要設置：')
    console.error('[API] 1. Access-Control-Allow-Credentials: true')
    console.error('[API] 2. Access-Control-Allow-Origin: https://localhost:5173 (不能是 *)')
    console.error('[API] 3. Cookie SameSite=None; Secure (跨域需要)')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 發送 cookies
      body: JSON.stringify(payload),
    })

    console.log('[API] Response status:', response.status)
    console.log('[API] Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = `Failed to analyze receipt: ${response.status}`
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
      
      // 401 錯誤特殊處理
      if (response.status === 401) {
        throw new Error('認證失敗：請刷新頁面重新登入')
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('[API] Success response:', data)
    
    // 後端直接返回項目數組
    if (Array.isArray(data)) {
      return data as ReceiptItemResponse[]
    }
    
    // 如果後端返回的是包裝過的響應
    if (data.items && Array.isArray(data.items)) {
      return data.items as ReceiptItemResponse[]
    }

    throw new Error('Invalid response format from server')
  } catch (error: any) {
    console.error('[API] Error analyzing receipt:', error)
    throw error
  }
}

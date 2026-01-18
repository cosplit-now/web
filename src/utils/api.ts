/**
 * API 工具函數
 * 用於與後端 API 通訊
 */

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
  const publicBaseUrl = import.meta.env.VITE_R2_PUBLIC_BASE_URL

  if (publicBaseUrl) {
    return `${publicBaseUrl}/${key}`
  }

  // 如果沒有配置公開 URL，返回 key 本身
  // 實際使用時需要從後端獲取完整 URL
  return key
}

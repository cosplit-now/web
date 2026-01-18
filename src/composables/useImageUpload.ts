import { ref } from 'vue'
import { getSignedUploadUrl, uploadToR2, getPublicUrl } from '@/utils/api'
import { useToast } from './useToast'

export function useImageUpload() {
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref<string | null>(null)
  const imageUrl = ref<string | null>(null)
  const imageKey = ref<string | null>(null)
  const toast = useToast()

  /**
   * Upload image to R2
   * @param file Image file to upload
   * @returns Upload result with URL and key
   */
  async function uploadImage(file: File): Promise<{ url: string; key: string } | null> {
    // Reset state
    isUploading.value = true
    uploadProgress.value = 0
    error.value = null
    imageUrl.value = null
    imageKey.value = null

    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        const errorMsg = 'Only JPG, PNG, and WEBP image formats are supported'
        error.value = errorMsg
        toast.error(errorMsg)
        return null
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        const errorMsg = 'Image size cannot exceed 10MB'
        error.value = errorMsg
        toast.error(errorMsg)
        return null
      }

      // Step 1: Get presigned URL from backend
      const { url: signedUrl, key } = await getSignedUploadUrl(file.name)
      imageKey.value = key

      // Step 2: Upload file directly to R2 using presigned URL
      await uploadToR2(signedUrl, file, (progress) => {
        uploadProgress.value = progress
      })

      // Step 3: Build public access URL for viewing the image
      const publicUrl = getPublicUrl(key)
      imageUrl.value = publicUrl

      toast.success('Receipt uploaded successfully')

      return {
        url: publicUrl,
        key: key,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed, please try again'
      error.value = errorMessage
      console.error('Upload error:', err)
      toast.error('Upload failed', {
        description: errorMessage
      })
      return null
    } finally {
      isUploading.value = false
    }
  }

  /**
   * Reset upload state
   */
  function resetUpload() {
    isUploading.value = false
    uploadProgress.value = 0
    error.value = null
    imageUrl.value = null
    imageKey.value = null
  }

  return {
    isUploading,
    uploadProgress,
    error,
    imageUrl,
    imageKey,
    uploadImage,
    resetUpload,
  }
}

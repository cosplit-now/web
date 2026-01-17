import { toast } from 'vue-sonner'

export interface ToastOptions {
  title?: string
  description?: string
  duration?: number
}

export function useToast() {
  const success = (message: string, options?: ToastOptions) => {
    toast.success(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 4000,
    })
  }

  const error = (message: string, options?: ToastOptions) => {
    toast.error(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 5000,
    })
  }

  const warning = (message: string, options?: ToastOptions) => {
    toast.warning(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 4000,
    })
  }

  const info = (message: string, options?: ToastOptions) => {
    toast.info(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 4000,
    })
  }

  const loading = (message: string) => {
    return toast.loading(message)
  }

  const promise = <T>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return toast.promise(promise, options)
  }

  // Dismiss a specific toast or all toasts
  const dismiss = (id?: string | number) => {
    toast.dismiss(id)
  }

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
  }
}

// Helper function to handle API errors
export function handleApiError(error: any, fallbackMessage = 'An unexpected error occurred') {
  const { error: showError } = useToast()

  let errorMessage = fallbackMessage
  let errorDescription: string | undefined

  // Handle different error formats
  if (error?.response?.data?.message) {
    // Axios-style error
    errorMessage = error.response.data.message
    errorDescription = error.response.data.details
  } else if (error?.message) {
    // Standard Error object
    errorMessage = error.message
  } else if (typeof error === 'string') {
    errorMessage = error
  } else if (error?.error?.message) {
    // Better-auth style error
    errorMessage = error.error.message
  }

  showError(errorMessage, {
    description: errorDescription,
  })

  return errorMessage
}

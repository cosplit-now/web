import { ref, computed } from 'vue'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  custom?: (value: string) => boolean
  message?: string
}

export interface FieldValidation {
  value: string
  rules: ValidationRule[]
  touched: boolean
  error: string
}

export function useFormValidation() {
  const fields = ref<Map<string, FieldValidation>>(new Map())

  // Register form field
  const registerField = (name: string, rules: ValidationRule[] = []) => {
    fields.value.set(name, {
      value: '',
      rules,
      touched: false,
      error: ''
    })
  }

  // Set field value
  const setFieldValue = (name: string, value: string) => {
    const field = fields.value.get(name)
    if (field) {
      field.value = value
      field.touched = true
      validateField(name)
    }
  }

  // Validate single field
  const validateField = (name: string): boolean => {
    const field = fields.value.get(name)
    if (!field) return true

    field.error = ''

    for (const rule of field.rules) {
      // Required validation
      if (rule.required && !field.value.trim()) {
        field.error = rule.message || 'This field is required'
        return false
      }

      // Skip other validations if field is empty and not required
      if (!field.value.trim() && !rule.required) {
        continue
      }

      // Min length validation
      if (rule.minLength && field.value.length < rule.minLength) {
        field.error = rule.message || `Must be at least ${rule.minLength} characters`
        return false
      }

      // Max length validation
      if (rule.maxLength && field.value.length > rule.maxLength) {
        field.error = rule.message || `Cannot exceed ${rule.maxLength} characters`
        return false
      }

      // Email validation
      if (rule.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(field.value)) {
          field.error = rule.message || 'Please enter a valid email address'
          return false
        }
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(field.value)) {
        field.error = rule.message || 'Invalid format'
        return false
      }

      // Custom validation
      if (rule.custom && !rule.custom(field.value)) {
        field.error = rule.message || 'Validation failed'
        return false
      }
    }

    return true
  }

  // Validate all fields
  const validateAll = (): boolean => {
    let isValid = true
    fields.value.forEach((_, name) => {
      const field = fields.value.get(name)
      if (field) {
        field.touched = true
      }
      if (!validateField(name)) {
        isValid = false
      }
    })
    return isValid
  }

  // Get field value
  const getFieldValue = (name: string): string => {
    return fields.value.get(name)?.value || ''
  }

  // Get field error
  const getFieldError = (name: string): string => {
    const field = fields.value.get(name)
    return field?.touched ? field.error : ''
  }

  // Check if field has error
  const hasError = (name: string): boolean => {
    const field = fields.value.get(name)
    return !!(field?.touched && field.error)
  }

  // Reset form
  const reset = () => {
    fields.value.forEach((field) => {
      field.value = ''
      field.touched = false
      field.error = ''
    })
  }

  // Reset single field
  const resetField = (name: string) => {
    const field = fields.value.get(name)
    if (field) {
      field.value = ''
      field.touched = false
      field.error = ''
    }
  }

  // Mark field as touched
  const touchField = (name: string) => {
    const field = fields.value.get(name)
    if (field) {
      field.touched = true
      validateField(name)
    }
  }

  // Computed: Check if entire form is valid
  const isFormValid = computed(() => {
    let allValid = true
    fields.value.forEach((field) => {
      if (field.error) {
        allValid = false
      }
    })
    return allValid
  })

  // Computed: Check if any field has been touched
  const isFormTouched = computed(() => {
    let anyTouched = false
    fields.value.forEach((field) => {
      if (field.touched) {
        anyTouched = true
      }
    })
    return anyTouched
  })

  return {
    registerField,
    setFieldValue,
    getFieldValue,
    getFieldError,
    hasError,
    validateField,
    validateAll,
    touchField,
    reset,
    resetField,
    isFormValid,
    isFormTouched
  }
}

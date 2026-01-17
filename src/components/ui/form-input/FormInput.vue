<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-vue-next'

interface Props {
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false
})

const emits = defineEmits<{
  'update:modelValue': [value: string]
  'blur': []
}>()

const hasError = computed(() => !!props.error)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emits('update:modelValue', target.value)
}

const handleBlur = () => {
  emits('blur')
}
</script>

<template>
  <div class="space-y-2">
    <label
      v-if="label"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      :class="{ 'text-destructive': hasError }"
    >
      {{ label }}
      <span v-if="required" class="text-destructive ml-0.5">*</span>
    </label>

    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="hasError"
      :aria-describedby="hasError ? 'error-message' : undefined"
      :class="cn(
        'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all',
        {
          'border-destructive focus-visible:ring-destructive': hasError,
          'border-input': !hasError
        },
        props.class
      )"
      @input="handleInput"
      @blur="handleBlur"
    />

    <div
      v-if="hasError"
      id="error-message"
      class="flex items-center gap-1.5 text-sm text-destructive animate-in fade-in-50 slide-in-from-top-1"
    >
      <AlertCircle class="h-3.5 w-3.5" />
      <span>{{ error }}</span>
    </div>
  </div>
</template>

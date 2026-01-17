<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const showSuccess = (): void => {
  toast.success('Success! Operation completed')
}

const showError = (): void => {
  toast.error('Error occurred', {
    description: 'This is a detailed error message'
  })
}

const showWarning = (): void => {
  toast.warning('Warning! Please check this')
}

const showInfo = (): void => {
  toast.info('Information message')
}

const showLoading = (): void => {
  const id = toast.loading('Loading...')
  setTimeout(() => {
    toast.dismiss(id)
    toast.success('Loading complete!')
  }, 2000)
}
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="container max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Toast Notification Test</CardTitle>
          <CardDescription>
            Click the buttons below to test different types of toast notifications
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <Button @click="showSuccess" variant="default">
              Show Success
            </Button>

            <Button @click="showError" variant="destructive">
              Show Error
            </Button>

            <Button @click="showWarning" variant="outline">
              Show Warning
            </Button>

            <Button @click="showInfo" variant="secondary">
              Show Info
            </Button>

            <Button @click="showLoading" variant="outline" class="col-span-2">
              Show Loading (2s)
            </Button>
          </div>

          <div class="mt-8 p-4 bg-muted rounded-lg space-y-2">
            <div>
              <h3 class="font-semibold mb-2">Toast Position:</h3>
              <p class="text-sm text-muted-foreground">
                Toasts will appear in the <strong>bottom-right</strong> corner of the screen.
              </p>
            </div>

            <div class="pt-2 border-t">
              <h3 class="font-semibold mb-2">Error Handling Strategy:</h3>
              <ul class="text-sm text-muted-foreground space-y-1">
                <li>✅ <strong>Frontend validation errors</strong> → Show under input fields (red border + error text)</li>
                <li>✅ <strong>Backend API errors</strong> → Show toast notification (this component)</li>
                <li>✅ <strong>Success messages</strong> → Show toast notification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Upload, Image as ImageIcon, X, CheckCircle2 } from 'lucide-vue-next'
import { useImageUpload } from '@/composables/useImageUpload'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const currentStep = ref(1)
const totalSteps = 5
const toast = useToast()

const stepTitles = [
  'Upload Receipt',
  'Select Region',
  'Verify Items',
  'Add Members',
  'Ready to Assign'
]

// Image upload
const { isUploading, uploadProgress, error: uploadError, imageUrl, imageKey, uploadImage, resetUpload } = useImageUpload()
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const isDragging = ref(false)

// Check if can proceed to next step
const canProceedStep1 = computed(() => {
  return imageUrl.value !== null && !isUploading.value
})

const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    router.push('/')
  }
}

const nextStep = () => {
  // Validate step 1
  if (currentStep.value === 1 && !canProceedStep1.value) {
    toast.error('Please upload a receipt image first')
    return
  }

  if (currentStep.value < totalSteps) {
    currentStep.value++
  } else {
    // Navigate to assign page
    router.push('/assign/temp-id')
  }
}

// Handle file selection
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await processFile(file)
  }
}

// Handle drag and drop
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files[0]
  if (file) {
    await processFile(file)
  }
}

// Process and upload file
const processFile = async (file: File) => {
  selectedFile.value = file

  // Create preview URL (for immediate display)
  previewUrl.value = URL.createObjectURL(file)

  // Upload file (toast notifications are handled in useImageUpload)
  await uploadImage(file)
}

// Trigger file input
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// Remove uploaded image
const removeImage = () => {
  selectedFile.value = null
  previewUrl.value = null
  resetUpload()
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b">
      <div class="container mx-auto px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="goBack">
          <ArrowLeft class="w-5 h-5" />
        </Button>
        <h1 class="text-xl font-semibold">Create Split</h1>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Progress -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-muted-foreground">Step {{ currentStep }} of {{ totalSteps }}</span>
          <span class="text-sm font-medium">{{ stepTitles[currentStep - 1] }}</span>
        </div>
        <Progress :model-value="(currentStep / totalSteps) * 100" />
      </div>

      <!-- Step 1: Upload Receipt -->
      <div v-if="currentStep === 1">
        <Card>
          <CardHeader>
            <CardTitle>Upload Receipt</CardTitle>
            <CardDescription>Take a photo or upload an image of your receipt</CardDescription>
          </CardHeader>
          <CardContent>
            <!-- Hidden file input -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              class="hidden"
              @change="handleFileSelect"
            />

            <!-- Upload area - Show when no image uploaded -->
            <div
              v-if="!previewUrl"
              class="border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer"
              :class="isDragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/50'"
              @click="triggerFileInput"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
            >
              <Upload class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p class="text-lg font-medium mb-2">Drag & Drop or Click to Upload</p>
              <p class="text-sm text-muted-foreground mb-4">Supports: JPG, PNG, WEBP (Max 10MB)</p>
              <div class="flex gap-4 justify-center">
                <Button variant="outline" type="button" @click.stop="triggerFileInput">
                  <ImageIcon class="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
              </div>
            </div>

            <!-- Preview area - Show when image is uploaded -->
            <div v-else class="space-y-4">
              <div class="relative rounded-lg overflow-hidden border border-border">
                <img :src="previewUrl" alt="Receipt preview" class="w-full h-auto max-h-96 object-contain" />

                <!-- Remove button -->
                <Button
                  variant="destructive"
                  size="icon"
                  class="absolute top-2 right-2"
                  @click="removeImage"
                  :disabled="isUploading"
                >
                  <X class="w-4 h-4" />
                </Button>

                <!-- Upload overlay -->
                <div
                  v-if="isUploading"
                  class="absolute inset-0 bg-background/80 flex flex-col items-center justify-center"
                >
                  <Upload class="w-8 h-8 mb-2 animate-pulse" />
                  <p class="text-sm font-medium mb-2">Uploading...</p>
                  <Progress :model-value="uploadProgress" class="w-48" />
                  <p class="text-xs text-muted-foreground mt-2">{{ Math.round(uploadProgress) }}%</p>
                </div>

                <!-- Success overlay -->
                <div
                  v-if="imageUrl && !isUploading"
                  class="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                >
                  <CheckCircle2 class="w-4 h-4" />
                  <span>Uploaded</span>
                </div>
              </div>

              <!-- File info -->
              <div class="flex items-center justify-between text-sm text-muted-foreground">
                <span>{{ selectedFile?.name }}</span>
                <span>{{ (selectedFile!.size / 1024 / 1024).toFixed(2) }} MB</span>
              </div>
            </div>

            <!-- Error message -->
            <div v-if="uploadError" class="mt-4 p-3 bg-muted border border-border rounded-lg">
              <p class="text-sm text-foreground">{{ uploadError }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Step 2: Select Region -->
      <div v-if="currentStep === 2">
        <Card>
          <CardHeader>
            <CardTitle>Select Region</CardTitle>
            <CardDescription>Choose your location for accurate tax calculation</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground">Region selector will go here</p>
          </CardContent>
        </Card>
      </div>

      <!-- Step 3: Verify Items -->
      <div v-if="currentStep === 3">
        <Card>
          <CardHeader>
            <CardTitle>Verify Items</CardTitle>
            <CardDescription>Review and edit the detected items</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground">OCR results table will go here</p>
          </CardContent>
        </Card>
      </div>

      <!-- Step 4: Add Members -->
      <div v-if="currentStep === 4">
        <Card>
          <CardHeader>
            <CardTitle>Add Members</CardTitle>
            <CardDescription>Who's splitting this bill?</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground">Member management will go here</p>
          </CardContent>
        </Card>
      </div>

      <!-- Step 5: Ready -->
      <div v-if="currentStep === 5">
        <Card>
          <CardHeader>
            <CardTitle>Ready to Assign</CardTitle>
            <CardDescription>Everything is set up. Let's assign items to members!</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground">Summary will go here</p>
          </CardContent>
        </Card>
      </div>

      <!-- Navigation -->
      <div class="flex justify-between mt-8">
        <Button variant="outline" @click="goBack" :disabled="currentStep === 1">
          Back
        </Button>
        <Button @click="nextStep">
          {{ currentStep === totalSteps ? 'Start Assigning' : 'Continue' }}
        </Button>
      </div>
    </main>
  </div>
</template>

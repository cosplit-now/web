<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Upload, Image as ImageIcon, X, CheckCircle2, Camera, Loader2, ScanLine, FileText } from 'lucide-vue-next'
import { useImageUpload } from '@/composables/useImageUpload'
import { useToast } from '@/composables/useToast'
import { useSplitData } from '@/composables/useSplitData'
import { analyzeReceipt } from '@/utils/api'
import { convertReceiptItems, calculateReceiptTotal } from '@/utils/receipt-converter'

const router = useRouter()
const toast = useToast()
const { createSplit, saveCurrentSplit } = useSplitData()

// Image upload
const { isUploading, uploadProgress, error: uploadError, imageUrl, imageKey, uploadImage, resetUpload } = useImageUpload()
const fileInputRef = ref<HTMLInputElement | null>(null)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const isDragging = ref(false)

// Analysis state
const isAnalyzing = ref(false)
const analysisProgress = ref(0)
const analysisStep = ref('')

// Check if can proceed
const canProceed = computed(() => {
  return imageUrl.value !== null && !isUploading.value && !isAnalyzing.value
})

const goBack = () => {
  router.push('/')
}

const continueToVerify = async () => {
  if (!canProceed.value || !imageKey.value) {
    toast.error('Please upload a receipt image first')
    return
  }

  // Start analysis animation
  isAnalyzing.value = true
  analysisProgress.value = 0

  try {
    // Call the OCR API with progress callback
    const receiptItems = await analyzeReceipt(
      imageKey.value,
      (status: string, progress: number) => {
        // Map API status to user-friendly messages
        switch (status) {
          case 'uploading':
            analysisStep.value = 'Uploading receipt...'
            break
          case 'uploaded':
            analysisStep.value = 'Receipt uploaded, processing...'
            break
          case 'processing':
            analysisStep.value = 'Scanning and extracting items...'
            break
          case 'completed':
            analysisStep.value = 'Processing complete!'
            break
          default:
            analysisStep.value = 'Processing...'
        }
        analysisProgress.value = progress
      }
    )

    // Step 3: Processing results
    analysisStep.value = 'Extracting items...'
    analysisProgress.value = 95
    await new Promise(resolve => setTimeout(resolve, 300))

    // Convert backend items to our Item format
    const items = convertReceiptItems(receiptItems)

    // Calculate totals
    const totals = calculateReceiptTotal(receiptItems)

    // Create split with real OCR data
    const newSplit = createSplit({ imageKey: imageKey.value })

    // Replace mock items with real OCR items
    newSplit.items = items
    newSplit.subtotal = totals.subtotal
    newSplit.totalTaxFromReceipt = totals.totalTax
    newSplit.total = totals.grandTotal

    saveCurrentSplit()

    // Complete
    analysisProgress.value = 100
    analysisStep.value = 'Complete!'

    // Wait a bit to show completion
    await new Promise(resolve => setTimeout(resolve, 500))

    // Navigate to verify page
    router.push({ name: 'verify', params: { id: newSplit.id } })
  } catch (error: any) {
    console.error('Analysis failed:', error)
    toast.error(error.message || 'Failed to analyze receipt')
    isAnalyzing.value = false
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

// Trigger camera input
const triggerCamera = () => {
  cameraInputRef.value?.click()
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
      <Card>
        <CardHeader>
          <CardTitle>Upload Receipt</CardTitle>
          <CardDescription>Take a photo or upload an image of your receipt</CardDescription>
        </CardHeader>
        <CardContent>
          <!-- Hidden file input for gallery -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            class="hidden"
            @change="handleFileSelect"
          />
          
          <!-- Hidden file input for camera -->
          <input
            ref="cameraInputRef"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            capture="environment"
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
            <p class="text-lg font-medium mb-2">Upload Receipt</p>
            <p class="text-sm text-muted-foreground mb-6">Take a photo or choose from gallery</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              <Button 
                variant="default" 
                type="button" 
                @click.stop="triggerCamera"
                class="h-12"
              >
                <Camera class="w-5 h-5 mr-2" />
                Take Photo
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                @click.stop="triggerFileInput"
                class="h-12"
              >
                <ImageIcon class="w-5 h-5 mr-2" />
                Choose Image
              </Button>
            </div>
            <p class="text-xs text-muted-foreground mt-4">Supports: JPG, PNG, WEBP (Max 10MB)</p>
          </div>

          <!-- Preview area - Show when image is uploaded -->
          <div v-else class="space-y-4">
            <div class="relative rounded-lg overflow-hidden border border-border">
              <img :src="previewUrl" alt="Receipt preview" class="w-full h-auto max-h-96 object-contain" />

              <!-- Remove button -->
              <Button
                variant="secondary"
                size="icon"
                class="absolute top-2 right-2 bg-background/80 hover:bg-background border border-border"
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
                class="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center gap-2 text-sm"
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

      <!-- Navigation -->
      <div class="flex justify-end mt-8">
        <Button @click="continueToVerify" :disabled="!canProceed">
          <Loader2 v-if="isAnalyzing" class="w-4 h-4 mr-2 animate-spin" />
          Continue to Verify
        </Button>
      </div>
    </main>

    <!-- Analysis Loading Overlay -->
    <div
      v-if="isAnalyzing"
      class="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <Card class="w-full max-w-md mx-4">
        <CardContent class="p-8">
          <div class="flex flex-col items-center">
            <!-- Animated Icon -->
            <div class="relative mb-6">
              <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <ScanLine class="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div class="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            </div>

            <!-- Title -->
            <h2 class="text-2xl font-bold mb-2 text-center">Analyzing Receipt</h2>
            <p class="text-muted-foreground text-center mb-6">
              Please wait while we process your receipt...
            </p>

            <!-- Progress Bar -->
            <div class="w-full space-y-3">
              <Progress :model-value="analysisProgress" class="h-2" />
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">{{ analysisStep }}</span>
                <span class="font-medium text-primary">{{ Math.round(analysisProgress) }}%</span>
              </div>
            </div>

            <!-- Steps Indicator -->
            <div class="grid grid-cols-3 gap-3 w-full mt-6">
              <div class="flex flex-col items-center gap-2 text-center">
                <div 
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    analysisProgress >= 20 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  ]"
                >
                  <Upload class="w-5 h-5" />
                </div>
                <span class="text-xs text-muted-foreground">Upload</span>
              </div>
              <div class="flex flex-col items-center gap-2 text-center">
                <div 
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    analysisProgress >= 50 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  ]"
                >
                  <ScanLine class="w-5 h-5" />
                </div>
                <span class="text-xs text-muted-foreground">Scan</span>
              </div>
              <div class="flex flex-col items-center gap-2 text-center">
                <div 
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    analysisProgress >= 75 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  ]"
                >
                  <FileText class="w-5 h-5" />
                </div>
                <span class="text-xs text-muted-foreground">Process</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

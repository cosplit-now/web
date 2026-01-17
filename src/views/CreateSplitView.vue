<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Upload, Camera, Image } from 'lucide-vue-next'

const router = useRouter()
const currentStep = ref(1)
const totalSteps = 5

const stepTitles = [
  'Upload Receipt',
  'Select Region',
  'Verify Items',
  'Add Members',
  'Ready to Assign'
]

const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    router.push('/')
  }
}

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  } else {
    // Navigate to assign page
    router.push('/assign/temp-id')
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
            <div
              class="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <Upload class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p class="text-lg font-medium mb-2">Drag & Drop or Click to Upload</p>
              <p class="text-sm text-muted-foreground mb-4">Supports: JPG, PNG, PDF</p>
              <div class="flex gap-4 justify-center">
                <Button variant="outline">
                  <Camera class="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button variant="outline">
                  <Image class="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
              </div>
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

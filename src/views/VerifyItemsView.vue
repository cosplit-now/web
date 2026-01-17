<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Check,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
  ZoomIn,
  ZoomOut,
  DollarSign,
  Hash,
  CheckCircle2
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const router = useRouter()

interface OcrItem {
  id: string
  name: string
  price: number
  quantity: number
  confidence: number // 0-100
  hasTax: boolean
  taxAmount?: number
  isEditing: boolean
}

// Mock OCR data
const items = ref<OcrItem[]>([
  {
    id: '1',
    name: 'Organic Milk (1L)',
    price: 4.99,
    quantity: 1,
    confidence: 95,
    hasTax: true,
    taxAmount: 0.35,
    isEditing: false
  },
  {
    id: '2',
    name: 'Whole Wheat Bread',
    price: 3.49,
    quantity: 1,
    confidence: 88,
    hasTax: false,
    isEditing: false
  },
  {
    id: '3',
    name: 'Free Range Eggs',
    price: 5.99,
    quantity: 12,
    confidence: 65,
    hasTax: true,
    taxAmount: 0.42,
    isEditing: false
  },
  {
    id: '4',
    name: 'Cheddar Cheese (200g)',
    price: 7.99,
    quantity: 1,
    confidence: 92,
    hasTax: true,
    taxAmount: 0.56,
    isEditing: false
  },
])

const receiptImageUrl = ref('/placeholder-receipt.jpg')
const imageZoom = ref(100)
const totalTaxFromReceipt = ref(3.18)

// Computed values
const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
)

const totalTax = computed(() =>
  items.value.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
)

const grandTotal = computed(() => subtotal.value + totalTax.value)

const totalMatch = computed(() =>
  Math.abs(grandTotal.value - (subtotal.value + totalTaxFromReceipt.value)) < 0.01
)


// Actions
const toggleEdit = (item: OcrItem) => {
  item.isEditing = !item.isEditing
}

const saveItem = (item: OcrItem) => {
  item.isEditing = false
}

const deleteItem = (id: string) => {
  const index = items.value.findIndex(item => item.id === id)
  if (index > -1) {
    items.value.splice(index, 1)
  }
}

const addNewItem = () => {
  const newItem: OcrItem = {
    id: Date.now().toString(),
    name: '',
    price: 0,
    quantity: 1,
    confidence: 100,
    hasTax: false,
    isEditing: true
  }
  items.value.push(newItem)
}

const zoomIn = () => {
  imageZoom.value = Math.min(imageZoom.value + 10, 200)
}

const zoomOut = () => {
  imageZoom.value = Math.max(imageZoom.value - 10, 50)
}

const goBack = () => {
  router.push('/create')
}

const continueToAssign = () => {
  if (!totalMatch.value) {
    if (!confirm('Total amount does not match. Are you sure you want to continue?')) {
      return
    }
  }
  router.push('/assign/temp-id')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div class="container mx-auto px-6 py-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Button variant="ghost" size="icon" @click="goBack">
              <ArrowLeft class="w-5 h-5" />
            </Button>
            <div>
              <h1 class="text-2xl font-bold tracking-tight">Verify Receipt Items</h1>
              <p class="text-xs text-muted-foreground">Review and correct OCR results</p>
            </div>
          </div>
          <Button
            size="lg"
            @click="continueToAssign"
          >
            Continue to Assign
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-8 max-w-7xl">
      <!-- Verification Status -->
      <Card class="mb-8" :class="totalMatch ? 'border-l-4 border-l-primary/80' : 'border-l-4 border-l-accent'">
        <CardContent class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-muted-foreground font-medium mb-1">Total Items</p>
              <p class="text-2xl font-bold">{{ items.length }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground font-medium mb-1">Total Match</p>
              <div class="flex items-center gap-2">
                <CheckCircle2 v-if="totalMatch" class="w-6 h-6 text-primary" />
                <AlertTriangle v-else class="w-6 h-6 text-accent-foreground" />
                <p class="text-2xl font-bold" :class="totalMatch ? 'text-primary' : 'text-accent-foreground'">
                  {{ totalMatch ? 'Yes' : 'No' }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Left: Receipt Image (2/5 width) -->
        <div class="lg:col-span-2">
          <Card class="sticky top-24">
            <CardContent class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold">Receipt Image</h2>
                <div class="flex items-center gap-2">
                  <Button variant="outline" size="icon" @click="zoomOut">
                    <ZoomOut class="w-4 h-4" />
                  </Button>
                  <span class="text-sm font-medium">{{ imageZoom }}%</span>
                  <Button variant="outline" size="icon" @click="zoomIn">
                    <ZoomIn class="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div class="border rounded-lg overflow-hidden bg-muted/20">
                <div class="flex items-center justify-center p-8">
                  <div class="text-center text-muted-foreground">
                    <p class="text-sm">Receipt image preview</p>
                    <p class="text-xs mt-2">Zoom: {{ imageZoom }}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Right: Items List (3/5 width) -->
        <div class="lg:col-span-3 space-y-4">
          <!-- Action Bar -->
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold">Recognized Items</h2>
            <Button variant="outline" @click="addNewItem">
              <Plus class="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <!-- Items List -->
          <div class="space-y-3">
            <Card
              v-for="item in items"
              :key="item.id"
              class="transition-all duration-200"
            >
              <CardContent class="p-5">
                <div class="space-y-3">
                  <!-- Item Header -->
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div v-if="!item.isEditing" class="space-y-2">
                        <div class="flex items-center gap-2">
                          <h3 class="font-bold text-lg">{{ item.name }}</h3>
                        </div>
                        <div class="flex items-center gap-3 flex-wrap">
                          <div class="flex items-center gap-1">
                            <DollarSign class="w-4 h-4 text-muted-foreground" />
                            <span class="text-xl font-bold text-primary">${{ item.price.toFixed(2) }}</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <Hash class="w-4 h-4 text-muted-foreground" />
                            <span class="text-sm">Qty: {{ item.quantity }}</span>
                          </div>
                          <Badge
                            v-if="item.hasTax"
                            variant="secondary"
                            class="text-xs"
                          >
                            Tax: ${{ item.taxAmount?.toFixed(2) }}
                          </Badge>
                        </div>
                      </div>

                      <!-- Edit Mode -->
                      <div v-else class="space-y-3">
                        <div>
                          <label class="text-xs text-muted-foreground">Item Name</label>
                          <Input v-model="item.name" class="mt-1" />
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="text-xs text-muted-foreground">Price</label>
                            <Input v-model.number="item.price" type="number" step="0.01" class="mt-1" />
                          </div>
                          <div>
                            <label class="text-xs text-muted-foreground">Quantity</label>
                            <Input v-model.number="item.quantity" type="number" min="1" class="mt-1" />
                          </div>
                        </div>
                        <div class="flex items-center gap-3">
                          <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" v-model="item.hasTax" class="rounded" />
                            Has Tax
                          </label>
                          <Input
                            v-if="item.hasTax"
                            v-model.number="item.taxAmount"
                            type="number"
                            step="0.01"
                            placeholder="Tax amount"
                            class="w-32"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center gap-2 ml-4">
                      <Button
                        v-if="!item.isEditing"
                        variant="ghost"
                        size="icon"
                        @click="toggleEdit(item)"
                      >
                        <Edit class="w-4 h-4" />
                      </Button>
                      <Button
                        v-if="item.isEditing"
                        variant="default"
                        size="sm"
                        @click="saveItem(item)"
                      >
                        <Check class="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        @click="deleteItem(item.id)"
                      >
                        <Trash2 class="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Summary Card -->
          <Card class="border-l-4 border-l-primary/40 mt-6">
            <CardContent class="p-6">
              <h3 class="font-bold text-lg mb-4">Receipt Summary</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-muted-foreground">Subtotal</span>
                  <span class="text-xl font-bold">${{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <span class="text-muted-foreground">Tax</span>
                    <Badge variant="outline" class="text-xs">From receipt: ${{ totalTaxFromReceipt.toFixed(2) }}</Badge>
                  </div>
                  <span class="text-xl font-bold">${{ totalTax.toFixed(2) }}</span>
                </div>
                <div class="h-px bg-border my-2"></div>
                <div class="flex justify-between items-center">
                  <span class="font-bold">Total</span>
                  <div class="flex items-center gap-2">
                    <span class="text-2xl font-bold text-primary">${{ grandTotal.toFixed(2) }}</span>
                    <CheckCircle2 v-if="totalMatch" class="w-5 h-5 text-primary" />
                    <AlertTriangle v-else class="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>
                <div v-if="!totalMatch" class="p-3 rounded-lg bg-accent/20 border border-accent/40">
                  <p class="text-sm text-accent-foreground">
                    ⚠️ Total doesn't match. Difference: ${{ Math.abs(grandTotal - (subtotal + totalTaxFromReceipt)).toFixed(2) }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  </div>
</template>

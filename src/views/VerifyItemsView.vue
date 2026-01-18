<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSplitData } from '@/composables/useSplitData'
import type { Item } from '@/types/item'

import {
  ArrowLeft,
  Check,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
  DollarSign,
  Hash,
  CheckCircle2
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const {
  currentSplit,
  getOrCreateSplit,
  saveCurrentSplit,
  addNewItem,
  deleteItem,
  updateItem,
} = useSplitData()

onMounted(() => {
  const splitId = route.params.id as string
  getOrCreateSplit(splitId)
})

// Computed values
const items = computed(() => currentSplit.value?.items || [])
const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
)
const totalTax = computed(() =>
  items.value.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
)
const grandTotal = computed(() => subtotal.value + totalTax.value)

const totalMatch = computed(() => {
  if (!currentSplit.value) return false
  const receiptTotal = subtotal.value + (currentSplit.value.totalTaxFromReceipt || 0)
  return Math.abs(grandTotal.value - receiptTotal) < 0.01
})


// Actions
const toggleEdit = (item: Item) => {
  item.isEditing = !item.isEditing
}

const saveItem = (item: Item) => {
  // Validate item before saving
  if (!item.name.trim()) {
    alert('Item name is required')
    return
  }
  if (item.price === null || item.price <= 0) {
    alert('Price must be greater than 0')
    return
  }
  if (item.quantity === null || item.quantity <= 0) {
    alert('Quantity must be at least 1')
    return
  }
  if (item.hasTax && (item.taxAmount === null || item.taxAmount < 0)) {
    alert('Tax amount must be 0 or greater')
    return
  }

  item.isEditing = false
  updateItem(item)
}

const handleDeleteItem = (id: string) => {
  deleteItem(id)
}

const handleAddNewItem = () => {
  addNewItem()
}

const goBack = () => {
  router.push('/create')
}

const continueToDefineMembers = () => {
  if (!currentSplit.value) return
  // Check if there are any items
  if (items.value.length === 0) {
    alert('Please add at least one item before continuing')
    return
  }

  // Check if any items are still being edited
  const hasEditingItems = items.value.some(item => item.isEditing)
  if (hasEditingItems) {
    alert('Please save all items before continuing')
    return
  }

  // Check if any items have invalid data
  const hasInvalidItems = items.value.some(item =>
    !item.name.trim() || item.price === null || item.price <= 0 || item.quantity === null || item.quantity <= 0
  )
  if (hasInvalidItems) {
    alert('Please ensure all items have valid name, price, and quantity')
    return
  }

  // Warn if total doesn't match
  if (!totalMatch.value) {
    if (!confirm('Total amount does not match. Are you sure you want to continue?')) {
      return
    }
  }

  saveCurrentSplit()
  router.push({ name: 'define-members', params: { id: currentSplit.value.id } })
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
        <h1 class="text-xl font-semibold">Verify Receipt Items</h1>
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

      <!-- Items List -->
      <div class="space-y-4">
          <!-- Action Bar -->
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold">Recognized Items</h2>
            <Button variant="outline" @click="handleAddNewItem">
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
                          <label class="text-xs text-muted-foreground">
                            Item Name <span class="text-destructive">*</span>
                          </label>
                          <Input
                            v-model="item.name"
                            class="mt-1"
                            :class="{ 'border-destructive': !item.name.trim() }"
                            placeholder="Enter item name"
                          />
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="text-xs text-muted-foreground">
                              Price <span class="text-destructive">*</span>
                            </label>
                            <Input
                              v-model.number="item.price"
                              type="number"
                              step="0.01"
                              min="0"
                              class="mt-1"
                              :class="{ 'border-destructive': !item.price || item.price <= 0 }"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label class="text-xs text-muted-foreground">
                              Quantity <span class="text-destructive">*</span>
                            </label>
                            <Input
                              v-model.number="item.quantity"
                              type="number"
                              min="1"
                              class="mt-1"
                              :class="{ 'border-destructive': !item.quantity || item.quantity <= 0 }"
                              placeholder="1"
                            />
                          </div>
                        </div>
                        <div class="flex items-center gap-3">
                          <label class="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" v-model="item.hasTax" class="rounded cursor-pointer" />
                            Has Tax
                          </label>
                          <Input
                            v-if="item.hasTax"
                            v-model.number="item.taxAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Tax amount"
                            class="w-32"
                            :class="{ 'border-destructive': item.hasTax && (!item.taxAmount || item.taxAmount < 0) }"
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
                        @click="handleDeleteItem(item.id)"
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
                    <Badge v-if="currentSplit" variant="outline" class="text-xs">From receipt: ${{ currentSplit.totalTaxFromReceipt.toFixed(2) }}</Badge>
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
                <div v-if="!totalMatch && currentSplit" class="p-3 rounded-lg bg-accent/20 border border-accent/40">
                  <p class="text-sm text-accent-foreground">
                    ⚠️ Total doesn't match. Difference: ${{ Math.abs(grandTotal - (subtotal + currentSplit.totalTaxFromReceipt)).toFixed(2) }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

      <!-- Navigation -->
      <div class="flex justify-end mt-8">
        <Button @click="continueToDefineMembers">
          Continue to Define Members
        </Button>
      </div>
    </main>
  </div>
</template>

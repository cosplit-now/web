<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, History, Receipt, Users, DollarSign, Image as ImageIcon, Loader2 } from 'lucide-vue-next'
import { useSession } from '@/lib/auth-client'
import { useSplitData } from '@/composables/useSplitData'
import { useMembers } from '@/composables/useMembers'
import { generateSplitName } from '@/utils/split-name'
import { getAllReceipts, getPublicUrl } from '@/utils/api'
import type { Split } from '@/types/split'
import type { GetReceiptResponse } from '@/types/receipt'

const router = useRouter()
const session = useSession()
const { monthlyStats, recentSplits } = useSplitData()
const { getMemberById } = useMembers()

// Receipts state
const receipts = ref<GetReceiptResponse[]>([])
const isLoadingReceipts = ref(false)

const userName = computed(() => {
  return session.value.data?.user?.name || 'there'
})

const formatRelativeDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

// Generate split name based on members
const getSplitName = (split: Split): string => {
  return generateSplitName(split, getMemberById)
}

const goToCreate = () => {
  router.push('/create')
}

const goToHistory = () => {
  router.push('/history')
}

// Load receipts
const loadReceipts = async () => {
  isLoadingReceipts.value = true
  try {
    receipts.value = await getAllReceipts()
    console.log('[Dashboard] Loaded receipts:', receipts.value)
  } catch (error: any) {
    console.error('[Dashboard] Error loading receipts:', error)
  } finally {
    isLoadingReceipts.value = false
  }
}

// Get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'ocr_done':
    case 'confirmed':
      return 'default'
    case 'ocr_processing':
    case 'uploaded':
      return 'secondary'
    case 'ocr_failed':
      return 'destructive'
    default:
      return 'outline'
  }
}

// Get status display text
const getStatusText = (status: string) => {
  switch (status) {
    case 'uploaded':
      return 'Uploaded'
    case 'ocr_processing':
      return 'Processing'
    case 'ocr_done':
      return 'Ready'
    case 'ocr_failed':
      return 'Failed'
    case 'confirmed':
      return 'Confirmed'
    default:
      return status
  }
}

onMounted(() => {
  loadReceipts()
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div class="container mx-auto px-6 py-5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Receipt class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight">CoSplit</h1>
            <p class="text-xs text-muted-foreground">Smart Receipt Splitter</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-8 max-w-6xl">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold mb-2">Welcome back, {{ userName }}!</h2>
        <p class="text-muted-foreground">Let's split some bills together</p>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <Card
          class="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-primary/20"
          @click="goToCreate"
        >
          <CardContent class="p-8 flex items-center gap-5">
            <div class="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md">
              <Plus class="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h3 class="font-bold text-xl mb-1">New Split</h3>
              <p class="text-sm text-muted-foreground">Upload and divide a receipt</p>
            </div>
          </CardContent>
        </Card>

        <Card
          class="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-accent/30"
          @click="goToHistory"
        >
          <CardContent class="p-8 flex items-center gap-5">
            <div class="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-md">
              <History class="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h3 class="font-bold text-xl mb-1">History</h3>
              <p class="text-sm text-muted-foreground">Review past transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Stats -->
      <div class="mb-10">
        <h2 class="text-2xl font-bold mb-5">This Month</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card class="border-l-4 border-l-primary/40">
            <CardContent class="p-6">
              <div class="flex items-center justify-between mb-3">
                <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Receipt class="w-6 h-6 text-primary" />
                </div>
              </div>
              <p class="text-3xl font-bold mb-1">{{ monthlyStats.count }}</p>
              <p class="text-sm text-muted-foreground font-medium">Total Splits</p>
            </CardContent>
          </Card>

          <Card class="border-l-4 border-l-accent/40">
            <CardContent class="p-6">
              <div class="flex items-center justify-between mb-3">
                <div class="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <DollarSign class="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
              <p class="text-3xl font-bold mb-1">${{ monthlyStats.total.toFixed(2) }}</p>
              <p class="text-sm text-muted-foreground font-medium">Total Amount</p>
            </CardContent>
          </Card>

          <Card class="border-l-4 border-l-secondary/60">
            <CardContent class="p-6">
              <div class="flex items-center justify-between mb-3">
                <div class="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Users class="w-6 h-6 text-secondary-foreground" />
                </div>
              </div>
              <p class="text-3xl font-bold mb-1">{{ monthlyStats.items }}</p>
              <p class="text-sm text-muted-foreground font-medium">Items Split</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Recent Receipts -->
      <div class="mb-10">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-2xl font-bold">Recent Receipts</h2>
          <Button v-if="receipts.length > 0" variant="ghost" size="sm" @click="goToCreate">
            Upload New
          </Button>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoadingReceipts" class="flex items-center justify-center py-12">
          <Loader2 class="w-8 h-8 animate-spin text-muted-foreground" />
        </div>

        <!-- Empty State -->
        <Card v-else-if="receipts.length === 0" class="border-dashed">
          <CardContent class="p-12 text-center">
            <div class="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <ImageIcon class="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 class="font-semibold text-lg mb-2">No receipts yet</h3>
            <p class="text-muted-foreground mb-6">Upload your first receipt to get started</p>
            <Button @click="goToCreate">
              <Plus class="w-4 h-4 mr-2" />
              Upload Receipt
            </Button>
          </CardContent>
        </Card>

        <!-- Receipts List -->
        <div v-else class="space-y-3">
          <Card
            v-for="receipt in receipts.slice(0, 5)"
            :key="receipt.id"
            class="cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-200"
          >
            <CardContent class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <!-- Receipt Image Thumbnail -->
                  <div class="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    <img
                      :src="getPublicUrl(receipt.imageUrl)"
                      :alt="'Receipt ' + receipt.id"
                      class="w-full h-full object-cover"
                      @error="(e: any) => e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23f0f0f0%22/%3E%3C/svg%3E'"
                    />
                  </div>
                  <div>
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="font-bold text-lg">Receipt</h3>
                      <Badge :variant="getStatusVariant(receipt.status)">
                        {{ getStatusText(receipt.status) }}
                      </Badge>
                    </div>
                    <p class="text-sm text-muted-foreground">
                      {{ new Date(receipt.createdAt).toLocaleString() }}
                    </p>
                  </div>
                </div>
                <div v-if="receipt.finalResult" class="text-right">
                  <p class="text-2xl font-bold">${{ receipt.finalResult.total.toFixed(2) }}</p>
                  <p class="text-xs text-muted-foreground">{{ receipt.finalResult.items.length }} items</p>
                </div>
                <div v-else class="text-right">
                  <p class="text-sm text-muted-foreground">
                    {{ receipt.status === 'ocr_processing' ? 'Processing...' : 'Pending' }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Recent Splits -->
      <div>
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-2xl font-bold">Recent Activity</h2>
          <Button variant="ghost" size="sm" @click="goToHistory">
            View All
          </Button>
        </div>
        <div class="space-y-3">
          <Card
            v-for="split in recentSplits"
            :key="split.id"
            class="cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-200"
            @click="() => {}"
          >
            <CardContent class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Receipt class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 class="font-bold text-lg mb-1">{{ getSplitName(split) }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ split.members.length }} {{ split.members.length === 1 ? 'person' : 'people' }} • {{ formatRelativeDate(split.createdAt) }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold">${{ split.total.toFixed(2) }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, Calendar, DollarSign, Users } from 'lucide-vue-next'
import { useSplitData } from '@/composables/useSplitData'
import { useMembers } from '@/composables/useMembers'
import { generateSplitName } from '@/utils/split-name'
import type { Split } from '@/types/split'

const router = useRouter()
const searchQuery = ref('')
const { splits } = useSplitData()
const { getMemberById } = useMembers()

// Generate split name based on members
const getSplitName = (split: Split): string => {
  return generateSplitName(split, getMemberById)
}

// Format date
const formatDate = (date: Date): string => {
  const now = new Date()
  const splitDate = new Date(date)
  const diffMs = now.getTime() - splitDate.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) {
    return 'Just now'
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return splitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

// Filter splits based on search
const filteredSplits = computed(() => {
  if (!searchQuery.value) return splits.value

  const query = searchQuery.value.toLowerCase()
  return splits.value.filter(split => {
    const name = getSplitName(split).toLowerCase()
    return name.includes(query)
  })
})

// Group splits by time
const todaySplits = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  return filteredSplits.value.filter(split => {
    const splitDate = new Date(split.createdAt)
    return splitDate >= today
  })
})

const thisWeekSplits = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  return filteredSplits.value.filter(split => {
    const splitDate = new Date(split.createdAt)
    return splitDate < today && splitDate >= weekAgo
  })
})

const olderSplits = computed(() => {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  return filteredSplits.value.filter(split => {
    const splitDate = new Date(split.createdAt)
    return splitDate < weekAgo
  })
})

const goBack = () => {
  router.push('/')
}

const viewDetail = (id: string) => {
  router.push(`/summary/${id}`)
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
        <h1 class="text-xl font-semibold">History</h1>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6 max-w-2xl">
      <!-- Search -->
      <div class="relative mb-6">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search by name or store..."
          class="pl-10"
        />
      </div>

      <!-- Filters -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button variant="outline" size="sm">
          <Calendar class="w-4 h-4 mr-2" />
          Date
        </Button>
        <Button variant="outline" size="sm">
          <DollarSign class="w-4 h-4 mr-2" />
          Amount
        </Button>
        <Button variant="outline" size="sm">
          <Users class="w-4 h-4 mr-2" />
          Members
        </Button>
      </div>

      <!-- History List -->
      <div v-if="filteredSplits.length === 0" class="text-center py-12">
        <p class="text-muted-foreground">No splits found</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Today Section -->
        <div v-if="todaySplits.length > 0">
          <h2 class="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Today</h2>
          <div class="space-y-3">
            <Card
              v-for="split in todaySplits"
              :key="split.id"
              class="cursor-pointer hover:shadow-md transition-shadow"
              @click="viewDetail(split.id)"
            >
              <CardHeader>
                <CardTitle>{{ getSplitName(split) }}</CardTitle>
                <CardDescription>
                  ${{ split.total.toFixed(2) }} • {{ split.members.length }} {{ split.members.length === 1 ? 'person' : 'people' }} • {{ formatDate(split.createdAt) }}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        <!-- This Week Section -->
        <div v-if="thisWeekSplits.length > 0">
          <h2 class="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">This Week</h2>
          <div class="space-y-3">
            <Card
              v-for="split in thisWeekSplits"
              :key="split.id"
              class="cursor-pointer hover:shadow-md transition-shadow"
              @click="viewDetail(split.id)"
            >
              <CardHeader>
                <CardTitle>{{ getSplitName(split) }}</CardTitle>
                <CardDescription>
                  ${{ split.total.toFixed(2) }} • {{ split.members.length }} {{ split.members.length === 1 ? 'person' : 'people' }} • {{ formatDate(split.createdAt) }}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        <!-- Older Section -->
        <div v-if="olderSplits.length > 0">
          <h2 class="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Older</h2>
          <div class="space-y-3">
            <Card
              v-for="split in olderSplits"
              :key="split.id"
              class="cursor-pointer hover:shadow-md transition-shadow"
              @click="viewDetail(split.id)"
            >
              <CardHeader>
                <CardTitle>{{ getSplitName(split) }}</CardTitle>
                <CardDescription>
                  ${{ split.total.toFixed(2) }} • {{ split.members.length }} {{ split.members.length === 1 ? 'person' : 'people' }} • {{ formatDate(split.createdAt) }}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Share2, FileText, Save, Check, X } from 'lucide-vue-next'

const router = useRouter()

const totalAmount = ref(74.95)
const memberSummaries = ref([
  {
    id: '1',
    name: 'Alex',
    amount: 24.50,
    isPaid: true,
    items: ['Milk', 'Bread', 'Eggs']
  },
  {
    id: '2',
    name: 'Sarah',
    amount: 18.75,
    isPaid: false,
    items: ['Cheese', 'Butter']
  },
  {
    id: '3',
    name: 'Mike',
    amount: 31.70,
    isPaid: false,
    items: ['Chicken', 'Rice', 'Vegetables']
  }
])

const expandedMember = ref<string | null>(null)

const toggleExpand = (memberId: string) => {
  expandedMember.value = expandedMember.value === memberId ? null : memberId
}

const goBack = () => {
  router.push('/assign/temp-id')
}

const saveAndFinish = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="icon" @click="goBack">
            <ArrowLeft class="w-5 h-5" />
          </Button>
          <h1 class="text-xl font-semibold">Split Summary</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Total Card -->
      <Card class="mb-6">
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground mb-2">Total Amount</p>
          <p class="text-4xl font-bold">${{ totalAmount.toFixed(2) }}</p>
        </CardContent>
      </Card>

      <!-- Member Summaries -->
      <div class="space-y-4 mb-6">
        <Card
          v-for="member in memberSummaries"
          :key="member.id"
        >
          <CardHeader>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{{ member.name.charAt(0) }}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{{ member.name }}</CardTitle>
                  <CardDescription class="text-lg font-semibold">
                    ${{ member.amount.toFixed(2) }}
                  </CardDescription>
                </div>
              </div>
              <Badge :variant="member.isPaid ? 'default' : 'secondary'">
                <Check v-if="member.isPaid" class="w-3 h-3 mr-1" />
                <X v-else class="w-3 h-3 mr-1" />
                {{ member.isPaid ? 'Paid' : 'Unpaid' }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="ghost"
              size="sm"
              class="w-full justify-between mb-2"
              @click="toggleExpand(member.id)"
            >
              <span>View Items</span>
              <span>{{ expandedMember === member.id ? '▲' : '▼' }}</span>
            </Button>

            <div v-if="expandedMember === member.id" class="mt-3 space-y-2">
              <div
                v-for="(item, index) in member.items"
                :key="index"
                class="text-sm text-muted-foreground pl-4"
              >
                • {{ item }}
              </div>
            </div>

            <Separator v-if="!member.isPaid" class="my-3" />

            <div v-if="!member.isPaid" class="flex gap-2">
              <Button variant="outline" size="sm" class="flex-1">
                Remind
              </Button>
              <Button variant="outline" size="sm" class="flex-1">
                Mark as Paid
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <Button variant="outline" class="flex flex-col items-center gap-2 h-auto py-4">
          <Share2 class="w-5 h-5" />
          <span class="text-xs">Share</span>
        </Button>
        <Button variant="outline" class="flex flex-col items-center gap-2 h-auto py-4">
          <FileText class="w-5 h-5" />
          <span class="text-xs">PDF</span>
        </Button>
        <Button variant="outline" class="flex flex-col items-center gap-2 h-auto py-4">
          <Save class="w-5 h-5" />
          <span class="text-xs">Save</span>
        </Button>
      </div>

      <!-- Save and Finish -->
      <Button class="w-full" size="lg" @click="saveAndFinish">
        Save to History
      </Button>
    </main>
  </div>
</template>

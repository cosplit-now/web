<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, Calendar, DollarSign, Users } from 'lucide-vue-next'

const router = useRouter()
const searchQuery = ref('')

const historyItems = ref([
  {
    id: '1',
    name: 'Lunch @ Cafe',
    amount: 45.00,
    members: 2,
    date: '2 hours ago',
    status: 'completed'
  },
  {
    id: '2',
    name: 'Grocery Shopping',
    amount: 87.50,
    members: 3,
    date: 'Jan 15',
    status: 'completed'
  },
  {
    id: '3',
    name: 'Restaurant Dinner',
    amount: 152.00,
    members: 4,
    date: 'Jan 12',
    status: 'completed'
  },
  {
    id: '4',
    name: 'Coffee Shop',
    amount: 18.75,
    members: 2,
    date: 'Jan 10',
    status: 'completed'
  }
])

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
      <div class="space-y-6">
        <!-- Today Section -->
        <div>
          <h2 class="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Today</h2>
          <div class="space-y-3">
            <Card
              class="cursor-pointer hover:shadow-md transition-shadow"
              @click="viewDetail(historyItems[0].id)"
            >
              <CardHeader>
                <CardTitle>{{ historyItems[0].name }}</CardTitle>
                <CardDescription>
                  ${{ historyItems[0].amount.toFixed(2) }} • {{ historyItems[0].members }} people • {{ historyItems[0].date }}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        <!-- This Week Section -->
        <div>
          <h2 class="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">This Week</h2>
          <div class="space-y-3">
            <Card
              v-for="item in historyItems.slice(1)"
              :key="item.id"
              class="cursor-pointer hover:shadow-md transition-shadow"
              @click="viewDetail(item.id)"
            >
              <CardHeader>
                <CardTitle>{{ item.name }}</CardTitle>
                <CardDescription>
                  ${{ item.amount.toFixed(2) }} • {{ item.members }} people • {{ item.date }}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

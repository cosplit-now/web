<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, History, Receipt, Users, DollarSign, CheckCircle, UserPlus } from 'lucide-vue-next'
import { useSession } from '@/lib/auth-client'

const router = useRouter()
const session = useSession()

const userName = computed(() => {
  return session.value.data?.user?.name || 'there'
})

// Mock data for demonstration
const stats = ref({
  totalSplits: 12,
  totalAmount: 456.78,
  totalItems: 45
})

const recentSplits = ref([
  {
    id: '1',
    name: 'Grocery Store',
    amount: 87.50,
    members: 3,
    date: '2 days ago'
  },
  {
    id: '2',
    name: 'Restaurant Dinner',
    amount: 152.00,
    members: 4,
    date: '5 days ago'
  }
])

const goToCreate = () => {
  router.push('/create')
}

const goToHistory = () => {
  router.push('/history')
}

const goToVerify = () => {
  router.push('/verify/demo-id')
}

const goToAssign = () => {
  router.push('/assign/demo-id')
}
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

      <!-- Demo Pages (Development Only) -->
      <div class="mb-10 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h3 class="font-bold text-sm text-yellow-800 mb-3">🚧 Demo Pages (Development)</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" @click="goToVerify" class="justify-start">
            <CheckCircle class="w-4 h-4 mr-2" />
            Verify Items Demo
          </Button>
          <Button variant="outline" @click="goToAssign" class="justify-start">
            <UserPlus class="w-4 h-4 mr-2" />
            Assign Items Demo
          </Button>
        </div>
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
              <p class="text-3xl font-bold mb-1">{{ stats.totalSplits }}</p>
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
              <p class="text-3xl font-bold mb-1">${{ stats.totalAmount.toFixed(2) }}</p>
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
              <p class="text-3xl font-bold mb-1">{{ stats.totalItems }}</p>
              <p class="text-sm text-muted-foreground font-medium">Items Split</p>
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
                    <h3 class="font-bold text-lg mb-1">{{ split.name }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ split.members }} people • {{ split.date }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold">${{ split.amount.toFixed(2) }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Users, CheckCircle2, Percent, Hash, DollarSign, RotateCcw } from 'lucide-vue-next'
import { type Item, type SplitMode, type ItemAssignment, calculateMemberShare } from '@/types/item'
import { useSplitData } from '@/composables/useSplitData'
import { useMembers } from '@/composables/useMembers'

const route = useRoute()
const router = useRouter()
const { currentSplit, findSplit, saveCurrentSplit, updateItem } = useSplitData()
const { getMemberById } = useMembers()

const selectedItemId = ref<string | null>(null)

onMounted(() => {
  const splitId = route.params.id as string
  findSplit(splitId)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// Computed values
const items = computed(() => currentSplit.value?.items || [])
const members = computed(() => {
  if (!currentSplit.value) return []
  return currentSplit.value.members
    .map(id => getMemberById(id))
    .filter((member) => member !== null && member !== undefined)
})

const selectedItem = computed(() =>
  items.value.find(item => item.id === selectedItemId.value)
)

const assignedItemsCount = computed(() =>
  items.value.filter(item => item.assignments && item.assignments.length > 0).length
)

const totalAmount = computed(() =>
  items.value.reduce((sum, item) => sum + item.price, 0)
)

const unassignedAmount = computed(() => {
  const assigned = items.value
    .filter(item => item.assignments && item.assignments.length > 0)
    .reduce((sum, item) => sum + item.price, 0)
  return totalAmount.value - assigned
})

const progressPercentage = computed(() =>
  items.value.length > 0 ? (assignedItemsCount.value / items.value.length) * 100 : 0
)

// Member totals
const getMemberTotal = (memberId: string) => {
  return items.value.reduce((sum, item) => {
    return sum + calculateMemberShare(item, memberId)
  }, 0)
}

// Item states
const getItemState = (item: Item) => {
  if (item.id === selectedItemId.value) return 'selected'
  if (item.assignments && item.assignments.length > 0) return 'assigned'
  return 'unassigned'
}

// Get split mode icon
const getSplitModeIcon = (mode?: SplitMode) => {
  switch (mode) {
    case 'equal': return Users
    case 'ratio': return Percent
    case 'quantity': return Hash
    default: return Users // Default to equal split icon
  }
}

// Get split mode label
const getSplitModeLabel = (mode?: SplitMode) => {
  switch (mode) {
    case 'equal': return 'Equal Split'
    case 'ratio': return 'By Ratio'
    case 'quantity': return 'By Quantity'
    default: return 'Equal Split' // Default label
  }
}

// Actions
const selectItem = (itemId: string) => {
  selectedItemId.value = selectedItemId.value === itemId ? null : itemId
}

const changeSplitMode = (mode: SplitMode) => {
  if (!selectedItem.value) return
  const updatedItem = { ...selectedItem.value, splitMode: mode }

  // Reset assignments when changing mode
  if (!updatedItem.assignments) updatedItem.assignments = []
  if (mode === 'equal') {
    updatedItem.assignments = updatedItem.assignments.map(a => ({
      memberId: a.memberId
    }))
  } else if (mode === 'ratio') {
    updatedItem.assignments = updatedItem.assignments.map(a => ({
      memberId: a.memberId,
      ratio: a.ratio || 1
    }))
  } else if (mode === 'quantity') {
    updatedItem.assignments = updatedItem.assignments.map(a => ({
      memberId: a.memberId,
      quantity: a.quantity || 1
    }))
  }
  updateItem(updatedItem)
}

const toggleMemberForItem = (memberId: string) => {
  if (!selectedItem.value) return
  const item = { ...selectedItem.value }
  if (!item.assignments) item.assignments = []

  const index = item.assignments.findIndex(a => a.memberId === memberId)

  if (index > -1) {
    item.assignments.splice(index, 1)
  } else {
    const newAssignment: ItemAssignment = { memberId }

    if (item.splitMode === 'ratio') newAssignment.ratio = 1
    else if (item.splitMode === 'quantity') newAssignment.quantity = 1

    item.assignments.push(newAssignment)
  }
  updateItem(item)
}

const updateAssignmentValue = (memberId: string, value: number) => {
  if (!selectedItem.value || !selectedItem.value.assignments) return

  const item = { ...selectedItem.value }
  const assignment = item.assignments.find(a => a.memberId === memberId)
  if (!assignment) return

  if (item.splitMode === 'ratio') {
    assignment.ratio = Math.max(0, Math.min(100, value))
  } else if (item.splitMode === 'quantity') {
    const maxQty = item.quantity || 1
    assignment.quantity = Math.max(1, Math.min(maxQty, Math.floor(value)))
  }
  updateItem(item)
}

const isMemberAssignedToItem = (itemId: string, memberId: string) => {
  const item = items.value.find(i => i.id === itemId)
  return item?.assignments?.some(a => a.memberId === memberId) || false
}

const getMemberAssignmentValue = (memberId: string): number => {
  if (!selectedItem.value || !selectedItem.value.assignments) return 0

  const assignment = selectedItem.value.assignments.find(a => a.memberId === memberId)
  if (!assignment) return 0

  if (selectedItem.value.splitMode === 'ratio') return assignment.ratio || 0
  if (selectedItem.value.splitMode === 'quantity') return assignment.quantity || 0

  return 0
}

const splitAllEvenly = () => {
  items.value.forEach(item => {
    const updatedItem = { ...item }
    updatedItem.splitMode = 'equal'
    updatedItem.assignments = members.value.map(m => ({ memberId: m.id }))
    updateItem(updatedItem)
  })
  selectedItemId.value = null
}

const resetAllAssignments = () => {
  items.value.forEach(item => {
    const updatedItem = { ...item }
    updatedItem.assignments = []
    updateItem(updatedItem)
  })
  selectedItemId.value = null
}

const toggleTax = () => {
  if (!selectedItem.value) return
  const updatedItem = { ...selectedItem.value }
  updatedItem.hasTax = !updatedItem.hasTax
  if (!updatedItem.hasTax) {
    updatedItem.taxAmount = undefined
  } else {
    updatedItem.taxAmount = updatedItem.price * 0.07 // Auto-calculate 7% tax
  }
  updateItem(updatedItem)
}

const goBack = () => {
  if (currentSplit.value) {
    router.push({ name: 'define-members', params: { id: currentSplit.value.id } })
  } else {
    router.push('/create')
  }
}

const goToSummary = () => {
  saveCurrentSplit()
  if (currentSplit.value) {
    router.push({ name: 'summary', params: { id: currentSplit.value.id } })
  }
}

// Keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (!selectedItemId.value) {
    if (event.key === 'ArrowDown' && items.value.length > 0) {
      event.preventDefault()
      selectItem(items.value[0].id)
    }
    return
  }

  const currentIndex = items.value.findIndex(item => item.id === selectedItemId.value)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (currentIndex < items.value.length - 1) selectItem(items.value[currentIndex + 1].id)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (currentIndex > 0) selectItem(items.value[currentIndex - 1].id)
      break
    case 'Enter':
      event.preventDefault()
      if (members.value.length > 0) toggleMemberForItem(members.value[0].id)
      break
    case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8':
      event.preventDefault()
      const memberIndex = parseInt(event.key) - 1
      if (memberIndex < members.value.length) toggleMemberForItem(members.value[memberIndex].id)
      break
    case 'Escape':
      event.preventDefault()
      selectedItemId.value = null
      break
    case 'a':
      if ((event.ctrlKey || event.metaKey) && selectedItem.value) {
        event.preventDefault()
        const updatedItem = { ...selectedItem.value }
        updatedItem.assignments = members.value.map(member => {
            const newAssignment: ItemAssignment = { memberId: member.id }
            if (updatedItem.splitMode === 'ratio') newAssignment.ratio = 1
            else if (updatedItem.splitMode === 'quantity') newAssignment.quantity = 1
            return newAssignment
        })
        updateItem(updatedItem)
      }
      break
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div class="container mx-auto px-6 py-5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Button variant="ghost" size="icon" @click="goBack">
            <ArrowLeft class="w-5 h-5" />
          </Button>
          <div>
            <h1 class="text-2xl font-bold tracking-tight">Assign Items</h1>
            <p class="text-xs text-muted-foreground">Select items and assign to members</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-8 max-w-7xl pb-32">
      <!-- Progress Overview -->
      <Card class="mb-8 border-l-4 border-l-primary/40">
        <CardContent class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p class="text-sm text-muted-foreground font-medium mb-1">Total Items</p>
              <p class="text-2xl font-bold">{{ items.length }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground font-medium mb-1">Assigned</p>
              <p class="text-2xl font-bold text-primary">{{ assignedItemsCount }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground font-medium mb-1">Total Amount</p>
              <p class="text-2xl font-bold">${{ totalAmount.toFixed(2) }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground font-medium mb-1">Unassigned</p>
              <p class="text-2xl font-bold text-accent-foreground">${{ unassignedAmount.toFixed(2) }}</p>
            </div>
          </div>
          <div class="mt-4">
            <Progress :model-value="progressPercentage" class="h-2" />
          </div>
        </CardContent>
      </Card>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Left: Items List (3/5 width) -->
        <div class="lg:col-span-3">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-bold">Receipt Items</h2>
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="resetAllAssignments"
                class="text-muted-foreground hover:text-destructive hover:border-destructive"
              >
                <RotateCcw class="w-4 h-4 mr-2" />
                Reset All
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="splitAllEvenly"
              >
                <Users class="w-4 h-4 mr-2" />
                Split All Evenly
              </Button>
            </div>
          </div>

          <div class="space-y-2">
            <Card
              v-for="item in items"
              :key="item.id"
              @click="selectItem(item.id)"
              :class="[
                'cursor-pointer transition-all duration-200',
                getItemState(item) === 'selected' && 'ring-2 ring-primary shadow-lg scale-[1.01]',
                getItemState(item) === 'assigned' && 'border-primary/30',
                getItemState(item) === 'unassigned' && 'hover:border-primary/20 hover:shadow-md'
              ]"
            >
              <CardContent class="p-5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4 flex-1">
                    <div
                      :class="[
                        'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                        getItemState(item) === 'selected' ? 'bg-primary' : 'bg-primary/10'
                      ]"
                    >
                      <component
                        :is="getSplitModeIcon(item.splitMode)"
                        :class="[
                          'w-6 h-6 transition-colors',
                          getItemState(item) === 'selected' ? 'text-primary-foreground' : 'text-primary'
                        ]"
                      />
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <h3 class="font-bold text-lg">{{ item.name }}</h3>
                      </div>
                      <div class="flex items-center gap-2 flex-wrap">
                        <p class="text-xl font-bold text-primary">${{ item.price.toFixed(2) }}</p>
                        <Badge
                          v-if="item.hasTax && item.taxAmount"
                          variant="secondary"
                          class="text-xs"
                        >
                          <DollarSign class="w-3 h-3 mr-1" />
                          Tax +${{ item.taxAmount.toFixed(2) }}
                        </Badge>
                        <Badge
                          v-if="item.quantity && item.quantity > 1"
                          variant="outline"
                          class="text-xs border-primary/40"
                        >
                          <Hash class="w-3 h-3 mr-1" />
                          {{ item.quantity }} {{ item.quantity === 1 ? 'item' : 'items' }}
                        </Badge>
                        <Badge variant="secondary" class="text-xs">
                          <component :is="getSplitModeIcon(item.splitMode)" class="w-3 h-3 mr-1" />
                          {{ getSplitModeLabel(item.splitMode) }}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <!-- Member Badges -->
                  <div class="flex items-center gap-2">
                    <div v-if="!item.assignments || item.assignments.length === 0" class="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Click to assign</span>
                    </div>
                    <div v-else class="flex gap-1 flex-wrap justify-end max-w-xs">
                      <Badge
                        v-for="assignment in item.assignments"
                        :key="assignment.memberId"
                        :style="{
                          backgroundColor: members.find(m => m.id === assignment.memberId)?.color,
                          color: 'white'
                        }"
                        class="font-medium"
                      >
                        {{ members.find(m => m.id === assignment.memberId)?.name }}
                        <span v-if="item.splitMode === 'ratio' && assignment.ratio">
                          ({{ assignment.ratio }}%)
                        </span>
                        <span v-if="item.splitMode === 'quantity' && assignment.quantity">
                          ({{ assignment.quantity }}x)
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Right: Member Selection (2/5 width) -->
        <div class="lg:col-span-2">
          <div class="lg:sticky lg:top-24 space-y-6">
            <!-- Selection Panel -->
            <Card
              :class="[
                'transition-all duration-200',
                selectedItemId ? 'border-primary/40 shadow-lg' : 'border-border/40'
              ]"
            >
              <CardContent class="p-6">
                <h2 class="text-xl font-bold mb-2">Assign To Members</h2>
                <p class="text-sm text-muted-foreground mb-5">
                  {{ selectedItemId
                    ? `Select members for "${selectedItem?.name}"`
                    : 'Click an item to start assigning'
                  }}
                </p>

                <div v-if="!selectedItemId" class="text-center py-12">
                  <div class="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Users class="w-8 h-8 text-accent-foreground" />
                  </div>
                  <p class="text-muted-foreground">No item selected</p>
                </div>

                <div v-else class="space-y-4">
                  <!-- Split Mode Selector -->
                  <div class="space-y-2">
                    <label class="text-sm font-medium">Split Mode</label>
                    <div class="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        @click.stop="changeSplitMode('equal')"
                        :class="selectedItem?.splitMode === 'equal' && 'bg-primary text-primary-foreground'"
                      >
                        <Users class="w-4 h-4 mr-1" />
                        Equal
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        @click.stop="changeSplitMode('ratio')"
                        :class="selectedItem?.splitMode === 'ratio' && 'bg-primary text-primary-foreground'"
                      >
                        <Percent class="w-4 h-4 mr-1" />
                        Ratio
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        @click.stop="changeSplitMode('quantity')"
                        :class="selectedItem?.splitMode === 'quantity' && 'bg-primary text-primary-foreground'"
                        :disabled="!selectedItem?.quantity"
                      >
                        <Hash class="w-4 h-4 mr-1" />
                        Qty
                      </Button>
                    </div>
                  </div>

                  <!-- Tax Toggle -->
                  <div class="flex items-center justify-between p-3 rounded-lg bg-accent/10">
                    <div class="flex items-center gap-2">
                      <DollarSign class="w-4 h-4 text-destructive" />
                      <span class="text-sm font-medium">Includes Tax</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      @click.stop="toggleTax"
                      :class="selectedItem?.hasTax && 'bg-destructive/10 border-destructive/50'"
                    >
                      {{ selectedItem?.hasTax ? 'Yes' : 'No' }}
                    </Button>
                  </div>

                  <!-- Member List -->
                  <div class="space-y-2">
                    <Card
                      v-for="member in members"
                      :key="member.id"
                      :class="[
                        'cursor-pointer transition-all duration-200',
                        isMemberAssignedToItem(selectedItemId, member.id)
                          ? 'ring-2 shadow-md'
                          : 'hover:border-primary/30 hover:shadow-sm'
                      ]"
                      :style="isMemberAssignedToItem(selectedItemId, member.id) ? {
                        '--tw-ring-color': member.color
                      } : {}"
                    >
                      <CardContent class="p-4">
                        <div class="space-y-2">
                          <div class="flex items-center gap-3" @click="toggleMemberForItem(member.id)">
                            <div
                              class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                              :style="{ backgroundColor: member.color }"
                            >
                              {{ member.name.charAt(0) }}
                            </div>
                            <div class="flex-1">
                              <p class="font-bold text-lg">{{ member.name }}</p>
                              <p class="text-sm text-muted-foreground">
                                This item: ${{ selectedItem ? calculateMemberShare(selectedItem, member.id).toFixed(2) : '0.00' }}
                              </p>
                            </div>
                            <div
                              :class="[
                                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                                isMemberAssignedToItem(selectedItemId, member.id)
                                  ? 'bg-primary'
                                  : 'bg-border'
                              ]"
                            >
                              <CheckCircle2
                                :class="[
                                  'w-5 h-5 transition-colors',
                                  isMemberAssignedToItem(selectedItemId, member.id)
                                    ? 'text-primary-foreground'
                                    : 'text-transparent'
                                ]"
                              />
                            </div>
                          </div>

                          <!-- Ratio/Quantity Input -->
                          <div
                            v-if="isMemberAssignedToItem(selectedItemId, member.id) && selectedItem?.splitMode !== 'equal'"
                            @click.stop
                            class="pl-13"
                          >
                            <div class="flex items-center gap-2">
                              <Input
                                type="number"
                                :min="selectedItem?.splitMode === 'quantity' ? 1 : 0"
                                :max="selectedItem?.splitMode === 'quantity' ? selectedItem?.quantity : undefined"
                                :model-value="getMemberAssignmentValue(member.id)"
                                @update:model-value="(v) => updateAssignmentValue(member.id, Number(v))"
                                class="w-20 h-8 text-sm"
                              />
                              <span class="text-xs text-muted-foreground">
                                {{ selectedItem?.splitMode === 'ratio' ? '%' : 'items' }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Member Summary -->
            <Card class="border-l-4 border-l-accent/40">
              <CardContent class="p-6">
                <h3 class="font-bold text-lg mb-4">Member Totals</h3>
                <div class="space-y-3">
                  <div
                    v-for="(member, index) in members"
                    :key="member.id"
                    class="flex items-center justify-between p-3 rounded-lg bg-accent/10"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                        :style="{ backgroundColor: member.color }"
                      >
                        {{ member.name.charAt(0) }}
                      </div>
                      <span class="font-medium">{{ member.name }}</span>
                      <Badge variant="outline" class="text-xs">{{ index + 1 }}</Badge>
                    </div>
                    <span class="text-xl font-bold">${{ getMemberTotal(member.id).toFixed(2) }}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Keyboard Shortcuts -->
            <Card class="bg-primary/5 border-primary/20">
              <CardContent class="p-5">
                <h3 class="font-bold text-sm mb-3 flex items-center gap-2">
                  <span>⌨️</span>
                  Keyboard Shortcuts
                </h3>
                <div class="space-y-2 text-xs text-muted-foreground">
                  <div class="flex justify-between items-center">
                    <span>Navigate items</span>
                    <div class="flex gap-1">
                      <kbd class="px-2 py-1 bg-background rounded border text-xs">↑</kbd>
                      <kbd class="px-2 py-1 bg-background rounded border text-xs">↓</kbd>
                    </div>
                  </div>
                  <div class="flex justify-between items-center">
                    <span>Toggle member</span>
                    <kbd class="px-2 py-1 bg-background rounded border text-xs">1-8</kbd>
                  </div>
                  <div class="flex justify-between items-center">
                    <span>Select all members</span>
                    <kbd class="px-2 py-1 bg-background rounded border text-xs">Ctrl+A</kbd>
                  </div>
                  <div class="flex justify-between items-center">
                    <span>Deselect item</span>
                    <kbd class="px-2 py-1 bg-background rounded border text-xs">Esc</kbd>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
    <!-- Footer -->
    <footer class="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/40 z-10">
      <div class="container mx-auto px-6 py-4 flex justify-end">
        <Button
          size="lg"
          @click="goToSummary"
          :disabled="assignedItemsCount === 0"
        >
          Continue to Summary
        </Button>
      </div>
    </footer>
  </div>
</template>


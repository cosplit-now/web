<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, UserPlus, Users, X } from 'lucide-vue-next';
import { useMembers } from '@/composables/useMembers';
import { useSplitData } from '@/composables/useSplitData';
import type { Member } from '@/types/member';
import { useSession } from '@/lib/auth-client';

const route = useRoute();
const router = useRouter();
const session = useSession();

const { addMember, getMemberById } = useMembers();
const { currentSplit, getOrCreateSplit, updateSplit, saveCurrentSplit } = useSplitData();

const newMemberName = ref('');

onMounted(() => {
  const splitId = route.params.id as string;
  getOrCreateSplit(splitId);

  // Auto-add the current user if not already present
  if (currentSplit.value && session.value.data?.user) {
    const user = session.value.data.user;
    const isUserAlreadyInSplit = currentSplit.value.members.includes(user.id);

    if (!isUserAlreadyInSplit) {
      // Check if user exists in the global members list
      let userAsMember = getMemberById(user.id);
      if (!userAsMember) {
        // If not, create them with friendly name
        const displayName = 'You'
        userAsMember = addMember(displayName, false, user.id);
      }
      // 使用 updateSplit 來確保響應式更新
      updateSplit({
        members: [userAsMember.id, ...currentSplit.value.members]
      });
      saveCurrentSplit();
    }
  }
});

const me = computed(() => {
    if (!session.value.data?.user || !currentSplit.value) return null;
    const member = getMemberById(session.value.data.user.id);
    return member ? { ...member, isMe: true } : null;
});

const otherMembers = computed(() => {
  if (!currentSplit.value) return [];
  
  const userId = session.value.data?.user?.id;
  const memberIds = userId 
    ? currentSplit.value.members.filter(id => id !== userId)
    : currentSplit.value.members;
  
  return memberIds
    .map(id => getMemberById(id))
    .filter(Boolean) as Member[];
});

const handleAddMember = () => {
  if (newMemberName.value.trim() === '') return;

  const newMember = addMember(newMemberName.value.trim());
  newMemberName.value = '';

  if (currentSplit.value) {
    updateSplit({
      members: [...currentSplit.value.members, newMember.id]
    });
    saveCurrentSplit();
  }
};

const handleRemoveMember = (memberId: string) => {
  if (currentSplit.value) {
    updateSplit({
      members: currentSplit.value.members.filter(id => id !== memberId)
    });
    saveCurrentSplit();
  }
};

const goBack = () => {
  if (currentSplit.value) {
    router.push({ name: 'verify', params: { id: currentSplit.value.id } });
  } else {
    router.push('/create');
  }
};

const continueToAssign = () => {
  if (currentSplit.value) {
    saveCurrentSplit()
    router.push({ name: 'assign', params: { id: currentSplit.value.id } });
  }
};
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
            <h1 class="text-2xl font-bold tracking-tight">Define Members</h1>
            <p class="text-xs text-muted-foreground">Add people to split this receipt with</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-8 max-w-3xl pb-32">
      <!-- Me Card -->
      <Card v-if="me" class="mb-6 border-l-4 border-l-primary/40">
        <CardContent class="p-5">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md"
              :style="{ backgroundColor: me.color }"
            >
              {{ me.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1">
              <p class="text-xl font-bold">You</p>
              <p class="text-sm text-muted-foreground">(Current User)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Add Member Section -->
      <Card class="mb-6">
        <CardContent class="p-5">
          <div class="flex items-center gap-2 mb-3">
            <UserPlus class="w-5 h-5 text-primary" />
            <h2 class="text-lg font-bold">Add Other Members</h2>
          </div>
          <p class="text-sm text-muted-foreground mb-4">
            Enter the names or nicknames of people you're splitting this receipt with
          </p>
          <div class="flex gap-2">
            <Input 
              v-model="newMemberName" 
              placeholder="Enter member's name or nickname" 
              @keyup.enter="handleAddMember"
              class="flex-1"
            />
            <Button @click="handleAddMember" class="gap-2">
              <UserPlus class="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Members List -->
      <div v-if="otherMembers.length > 0">
        <div class="flex items-center gap-2 mb-4">
          <Users class="w-5 h-5 text-primary" />
          <h2 class="text-lg font-bold">Other Members</h2>
          <span class="text-sm text-muted-foreground">({{ otherMembers.length }})</span>
        </div>
        
        <div class="space-y-3">
          <Card
            v-for="member in otherMembers"
            :key="member.id"
            class="transition-all duration-200 hover:shadow-md"
          >
            <CardContent class="p-4">
              <div class="flex items-center gap-4">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  :style="{ backgroundColor: member.color }"
                >
                  {{ member.name.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1">
                  <p class="text-lg font-bold">{{ member.name }}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  @click="handleRemoveMember(member.id)"
                  class="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <X class="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Empty State -->
      <Card v-else class="border-dashed">
        <CardContent class="p-12 text-center">
          <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users class="w-8 h-8 text-primary" />
          </div>
          <p class="text-lg font-medium text-muted-foreground mb-2">No other members yet</p>
          <p class="text-sm text-muted-foreground">
            Add people above to split this receipt with them
          </p>
        </CardContent>
      </Card>
    </main>

    <!-- Footer -->
    <footer class="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/40 z-10">
      <div class="container mx-auto px-6 py-4 max-w-3xl">
        <Button 
          @click="continueToAssign" 
          class="w-full" 
          size="lg"
          :disabled="!currentSplit || currentSplit.members.length === 0"
        >
          Continue to Assign Items
        </Button>
      </div>
    </footer>
  </div>
</template>

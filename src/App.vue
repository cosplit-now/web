<script setup lang="ts">
import 'vue-sonner/style.css'
import { RouterView, useRouter } from 'vue-router'
import { useSession, signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

const session = useSession()
const router = useRouter()

const handleSignOut = async () => {
  await signOut()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header v-if="session.data" class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center">
        <div class="mr-4 hidden md:flex">
          <a class="mr-6 flex items-center space-x-2" href="/dashboard">
            <span class="hidden font-bold sm:inline-block">CoSplit</span>
          </a>
        </div>
        <div class="flex flex-1 items-center justify-end space-x-4">
          <div v-if="session.data" class="flex items-center space-x-4">
            <span class="text-sm text-muted-foreground">
              Welcome, {{ session.data.user.name }}
              <span v-if="session.data.user.isAnonymous" class="text-xs opacity-70">(Guest)</span>
            </span>
            <Button variant="ghost" size="sm" @click="handleSignOut">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>

    <main>
      <RouterView />
    </main>

    <!-- Global Toast Notifications -->
    <Toaster position="bottom-right" richColors />
  </div>
</template>

<script setup lang="ts">
import 'vue-sonner/style.css'
import { RouterView } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <main>
      <RouterView />
    </main>

    <!-- Global Toast Notifications -->
    <Toaster position="bottom-right" richColors />
  </div>
</template>

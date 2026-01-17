<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MEMBER_COLORS } from '@/types/member'
import { LogIn } from 'lucide-vue-next'

const router = useRouter()
const isLogin = ref(true)

const name = ref('')
const email = ref('')
const password = ref('')

// 定義色系變數以供 Template 使用
const colors = {
  primary: MEMBER_COLORS[0], // #A0826D 奶茶棕 (按鈕、焦點)
  secondary: MEMBER_COLORS[1], // #C9A88A 焦糖奶茶 (裝飾)
  text: MEMBER_COLORS[6], // #7A5C42 黑糖奶茶 (標題文字)
  bgAccent: MEMBER_COLORS[7], // #CDB8A3 香vanilla奶茶 (圖示背景)
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
}

const handleSubmit = () => {
  // 這裡可以加入實際的登入/註冊邏輯
  console.log('Submit:', isLogin.value ? 'Login' : 'Register', { email: email.value })
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
    <!-- 背景裝飾光暈 -->
    <div 
      class="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full opacity-10 blur-3xl"
      :style="{ backgroundColor: colors.secondary }"
    />
    <div 
      class="absolute bottom-[-10%] left-[-5%] w-96 h-96 rounded-full opacity-10 blur-3xl"
      :style="{ backgroundColor: colors.primary }"
    />

    <Card class="w-full max-w-md shadow-xl z-10 border-opacity-50">
      <CardHeader class="space-y-1 text-center">
        <div class="flex justify-center mb-4">
          <div class="p-3 rounded-full bg-opacity-20" :style="{ backgroundColor: colors.bgAccent }">
            <LogIn class="w-8 h-8" :style="{ color: colors.primary }" />
          </div>
        </div>
        <CardTitle class="text-2xl font-bold tracking-tight" :style="{ color: colors.text }">
          {{ isLogin ? 'Welcome Back' : 'Create an Account' }}
        </CardTitle>
        <CardDescription>
          {{ isLogin ? 'Enter your email below to login to your account' : 'Enter your details below to create your account' }}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 註冊時顯示姓名欄位 -->
        <div v-if="!isLogin" class="space-y-2">
          <label class="text-sm font-medium leading-none" for="name">Full Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            :style="{ '--tw-ring-color': colors.primary }"
            placeholder="John Doe"
          />
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            :style="{ '--tw-ring-color': colors.primary }"
            placeholder="m@example.com"
          />
        </div>
        
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium leading-none" for="password">Password</label>
            <a 
              v-if="isLogin" 
              href="#" 
              class="text-sm font-medium hover:underline"
              :style="{ color: colors.primary }"
            >
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            v-model="password"
            type="password"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            :style="{ '--tw-ring-color': colors.primary }"
          />
        </div>

        <Button 
          class="w-full text-white hover:opacity-90 transition-opacity font-semibold"
          :style="{ backgroundColor: colors.primary }"
          @click="handleSubmit"
        >
          {{ isLogin ? 'Sign In' : 'Sign Up' }}
        </Button>
      </CardContent>
      <CardFooter>
        <div class="text-sm text-center w-full text-muted-foreground">
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <button class="underline underline-offset-4 hover:opacity-80 font-medium ml-1" :style="{ color: colors.text }" @click="toggleMode">
            {{ isLogin ? 'Sign up' : 'Sign in' }}
          </button>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>
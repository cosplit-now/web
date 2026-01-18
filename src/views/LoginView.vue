<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-input'
import { MEMBER_COLORS } from '@/types/member'
import { LogIn } from 'lucide-vue-next'
import { signIn, signUp } from '@/lib/auth-client'
import { useFormValidation } from '@/composables/useFormValidation'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const isLogin = ref(true)
const isLoading = ref(false)

// Form validation
const validation = useFormValidation()
const toast = useToast()

// 定義色系變數以供 Template 使用
const colors = {
  primary: MEMBER_COLORS[0], // #A0826D 奶茶棕 (按鈕、焦點)
  secondary: MEMBER_COLORS[1], // #C9A88A 焦糖奶茶 (裝飾)
  text: MEMBER_COLORS[6], // #7A5C42 黑糖奶茶 (標題文字)
  bgAccent: MEMBER_COLORS[7], // #CDB8A3 香vanilla奶茶 (圖示背景)
}

// Register form fields
onMounted(() => {
  validation.registerField('name', [
    { required: true, message: 'Full name is required' },
    { minLength: 2, message: 'Name must be at least 2 characters' }
  ])

  validation.registerField('email', [
    { required: true, message: 'Email is required' },
    { email: true, message: 'Please enter a valid email address' }
  ])

  validation.registerField('password', [
    { required: true, message: 'Password is required' },
    { minLength: 6, message: 'Password must be at least 6 characters' }
  ])
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  validation.reset()
}

// Watch mode changes to reset validation
watch(isLogin, () => {
  validation.reset()
})

const handleSubmit = async () => {
  // Validate only the fields needed for current mode
  let isValid = true

  // Always validate email and password
  isValid = validation.validateField('email') && isValid
  isValid = validation.validateField('password') && isValid

  // Only validate name in sign-up mode
  if (!isLogin.value) {
    isValid = validation.validateField('name') && isValid
  }

  // Mark fields as touched to show errors
  validation.touchField('email')
  validation.touchField('password')
  if (!isLogin.value) {
    validation.touchField('name')
  }

  // If validation fails, errors are already shown under each field
  // No need to show a toast for frontend validation errors
  if (!isValid) {
    return
  }

  isLoading.value = true

  try {
    let result;
    if (isLogin.value) {
      result = await signIn.email({
        email: validation.getFieldValue('email'),
        password: validation.getFieldValue('password'),
      });
    } else {
      result = await signUp.email({
        email: validation.getFieldValue('email'),
        password: validation.getFieldValue('password'),
        name: validation.getFieldValue('name'),
      });
    }

    if (result.error) {
      toast.error(result.error.message || 'Authentication failed', {
        description: 'Please check your credentials and try again'
      })
    } else {
      // Get user name from result
      const userName = result.data?.user?.name || validation.getFieldValue('name') || validation.getFieldValue('email').split('@')[0]

      if (isLogin.value) {
        toast.success(`Welcome back, ${userName}!`)
      } else {
        toast.success('Account created successfully', {
          description: `Welcome to CoSplit, ${userName}!`
        })
      }

      router.push('/dashboard')
    }
  } catch (e: any) {
    toast.error('An unexpected error occurred', {
      description: e.message || 'Please try again later'
    })
  } finally {
    isLoading.value = false
  }
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
        <!-- Name field (only for sign up) -->
        <FormInput
          v-if="!isLogin"
          :model-value="validation.getFieldValue('name')"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          :error="validation.getFieldError('name')"
          :required="true"
          :disabled="isLoading"
          @update:model-value="validation.setFieldValue('name', $event)"
          @blur="validation.touchField('name')"
        />

        <!-- Email field -->
        <FormInput
          :model-value="validation.getFieldValue('email')"
          label="Email"
          type="email"
          placeholder="m@example.com"
          :error="validation.getFieldError('email')"
          :required="true"
          :disabled="isLoading"
          @update:model-value="validation.setFieldValue('email', $event)"
          @blur="validation.touchField('email')"
        />

        <!-- Password field -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium leading-none">
              Password
              <span class="text-destructive ml-0.5">*</span>
            </label>
            <a
              v-if="isLogin"
              href="#"
              class="text-sm font-medium hover:underline"
              :style="{ color: colors.primary }"
            >
              Forgot password?
            </a>
          </div>
          <FormInput
            :model-value="validation.getFieldValue('password')"
            type="password"
            placeholder="Enter your password"
            :error="validation.getFieldError('password')"
            :required="true"
            :disabled="isLoading"
            @update:model-value="validation.setFieldValue('password', $event)"
            @blur="validation.touchField('password')"
          />
        </div>

        <Button
          class="w-full text-white hover:opacity-90 transition-opacity font-semibold"
          :style="{ backgroundColor: colors.primary }"
          :disabled="isLoading"
          @click="handleSubmit"
        >
          {{ isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up') }}
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
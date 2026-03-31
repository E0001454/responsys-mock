<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { oktaAuth } from '@/lib/okta'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    if (typeof oktaAuth.handleRedirectPromise === 'function') {
      await oktaAuth.handleRedirectPromise()
    } else if (typeof oktaAuth.handleLoginRedirect === 'function') {
      await oktaAuth.handleLoginRedirect()
    }
  } catch (e) {
    console.error('Error handling Okta redirect:', e)
  }

  authStore.isLoggingIn.value = false
  authStore.showSuccessOverlay.value = true

  setTimeout(() => {
    authStore.showSuccessOverlay.value = false
    router.replace('/mapeo')
  }, 600)
})
</script>

<template>
  <div />
</template>

<style scoped></style>

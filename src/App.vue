<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import Sidebar from './components/Sidebar.vue'
import { RouterView } from 'vue-router'
import Toasts from './components/Toasts.vue'
import AuthOverlay from './components/auth/AuthOverlay.vue'
import { Menu, X } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { oktaAuth } from './lib/okta'
import { useAuthStore } from './stores/authStore'

const route = useRoute()
const authStore = useAuthStore()
const isAuthRoute = computed(() => route.path === '/login' || route.path === '/login/callback')
const isSidebarOpenMobile = ref(false)
const isMobileViewport = ref(false)
const hasOpenModal = ref(false)
let modalObserver = null

const overlayState = computed(() => {
  if (authStore.isLoggingOut.value) return 'logging-out'
  if (authStore.showSuccessOverlay.value) return 'success'
  return null
})

async function loadUserInfo() {
  if (!authStore.user.value) {
    try {
      const info = await oktaAuth.getUser()
      if (info?.email) {
        authStore.setUser(info)
      }
    } catch {
    }
  }
}

function updateHasOpenModal() {
  if (typeof document === 'undefined') {
    hasOpenModal.value = false
    return
  }
  hasOpenModal.value = Boolean(document.querySelector('[data-app-modal="true"]'))
}

function handleResize() {
  isMobileViewport.value = window.innerWidth < 1024
  if (!isMobileViewport.value) {
    isSidebarOpenMobile.value = false
  }
}

function closeMobileSidebar() {
  isSidebarOpenMobile.value = false
}

function toggleMobileSidebar() {
  if (hasOpenModal.value) return
  isSidebarOpenMobile.value = !isSidebarOpenMobile.value
}

onMounted(async () => {
  handleResize()
  updateHasOpenModal()
  window.addEventListener('resize', handleResize)

  if (typeof MutationObserver !== 'undefined') {
    modalObserver = new MutationObserver(() => {
      updateHasOpenModal()
    })
    modalObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  if (!isAuthRoute.value) {
    await loadUserInfo()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  modalObserver?.disconnect()
  modalObserver = null
})

watch(hasOpenModal, (open) => {
  if (open) {
    isSidebarOpenMobile.value = false
  }
})

watch(
  () => route.fullPath,
  () => {
    isSidebarOpenMobile.value = false
  }
)

watch(isAuthRoute, async (isAuthNow, wasAuth) => {
  if (wasAuth && !isAuthNow) {
    await loadUserInfo()
    // If not already shown, briefly show success overlay (shorter)
    if (!authStore.showSuccessOverlay.value) {
      authStore.showSuccessOverlay.value = true
      setTimeout(() => {
        authStore.showSuccessOverlay.value = false
      }, 700)
    }
  }
})
</script>

<template>
  <AuthOverlay :state="overlayState" />

  <RouterView v-if="isAuthRoute" />

  <div v-else class="flex h-screen bg-slate-50 overflow-hidden font-sans">
    <button
      v-if="isMobileViewport"
      @click="toggleMobileSidebar"
      class="lg:hidden fixed top-3 left-3 z-[58] inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#00357F] text-white shadow-md hover:bg-[#002a66] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      :aria-label="isSidebarOpenMobile ? 'Cerrar menú' : 'Abrir menú'"
      :title="isSidebarOpenMobile ? 'Cerrar menú' : 'Abrir menú'"
      :disabled="hasOpenModal"
    >
      <X v-if="isSidebarOpenMobile" class="w-5 h-5" />
      <Menu v-else class="w-5 h-5" />
    </button>

    <button
      v-if="isMobileViewport && isSidebarOpenMobile"
      type="button"
      class="lg:hidden fixed inset-0 z-[45] bg-black/50"
      aria-label="Cerrar menu lateral"
      @click="closeMobileSidebar"
    ></button>
    
    <Sidebar
      :is-open-mobile="isSidebarOpenMobile"
      @close-mobile="closeMobileSidebar"
    />

    <main class="flex-1 flex flex-col min-w-0 overflow-hidden lg:pt-0 pt-1">

      <section class="flex-1 overflow-y-auto relative custom-scrollbar">
        <div class="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-slate-50 to-transparent z-0"></div>
        
        <div class="relative overflow-hidden">
          <RouterView v-slot="{ Component, route }">
            <Transition name="page-fade" mode="out-in" appear>
              <component :is="Component" :key="route.fullPath" />
            </Transition>
          </RouterView>
        </div>
      </section>

    </main>
    <Toasts />
  </div>
</template>

<style scoped>

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #00357F; 
}

:deep(.page-fade-enter-active),
:deep(.page-fade-leave-active) {
  transition: opacity 180ms ease;
}

:deep(.page-fade-enter-from),
:deep(.page-fade-leave-to) {
  opacity: 0;
}

:deep(.page-fade-enter-to),
:deep(.page-fade-leave-from) {
  opacity: 1;
}

:deep(.tab-fade-enter-active),
:deep(.tab-fade-leave-active) {
  transition: opacity 170ms ease;
}

:deep(.tab-fade-enter-from),
:deep(.tab-fade-leave-to) {
  opacity: 0;
}

:deep(.tab-fade-enter-to),
:deep(.tab-fade-leave-from) {
  opacity: 1;
}
</style>